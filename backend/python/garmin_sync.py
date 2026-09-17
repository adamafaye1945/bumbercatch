"""
Pulls today's (and the last 7 days') Garmin health data and writes it into
the same Postgres database the Node backend uses. Meant to run automatically
at every backend startup (see backend/package.json's "db:sync" script) —
must never hang waiting for interactive input, since it runs as a spawned
child process with no attached terminal.

Run login.py first to cache OAuth tokens; this script only ever loads them.

NOTE ON FIELD NAMES: python-garminconnect is an unofficial, community-
maintained wrapper around Garmin's internal endpoints, and the exact keys
in get_stats()/get_sleep_data()'s response dicts aren't formally documented.
The keys below are the commonly-reported shape, but if a run logs
"[garmin-sync] warning: missing key ..." the fix is to inspect the printed
raw dict for that call and correct the key name here.

Usage:
    venv/bin/python garmin_sync.py
"""

import os
import sys
from datetime import date, timedelta
from typing import Optional

import psycopg2
from dotenv import load_dotenv
from garminconnect import Garmin

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TOKEN_DIR = os.path.join(SCRIPT_DIR, ".garmin_tokens")
HISTORY_DAYS = 7

load_dotenv(os.path.join(SCRIPT_DIR, ".env"))
load_dotenv(os.path.join(SCRIPT_DIR, "..", ".env"))  # DATABASE_URL lives here


def get(d: dict, key: str, context: str):
    if key not in d or d[key] is None:
        print(f"[garmin-sync] warning: missing key '{key}' in {context}", file=sys.stderr)
        return None
    return d[key]


def classify_resting_hr(bpm) -> str:
    if bpm is None:
        return "Unknown"
    return "Normal range" if 40 <= bpm <= 100 else "Outside normal range"


def classify_stress(value) -> str:
    """Garmin's own stress bands, used as a fallback when stressQualifier text isn't populated."""
    if value is None:
        return "Unknown"
    if value <= 25:
        return "Low"
    if value <= 50:
        return "Medium"
    if value <= 75:
        return "High"
    return "Very high"


def fetch_day_metrics(client: Garmin, day: date) -> dict:
    """Returns {"bodyBattery": v, "steps": v, "restingHr": v, "sleep": v (hours), "stress": v} for one day."""
    iso = day.isoformat()
    metrics: dict = {}

    try:
        stats = client.get_stats(iso)
        metrics["bodyBattery"] = get(stats, "bodyBatteryMostRecentValue", f"get_stats({iso})")
        metrics["steps"] = get(stats, "totalSteps", f"get_stats({iso})")
        metrics["restingHr"] = get(stats, "restingHeartRate", f"get_stats({iso})")
        metrics["stress"] = get(stats, "averageStressLevel", f"get_stats({iso})")
        metrics["_stepsGoal"] = stats.get("dailyStepGoal")
        metrics["_stressQualifier"] = stats.get("stressQualifier")
    except Exception as exc:
        print(f"[garmin-sync] warning: get_stats({iso}) failed: {exc}", file=sys.stderr)

    try:
        sleep_data = client.get_sleep_data(iso)
        daily_sleep = sleep_data.get("dailySleepDTO") or {}
        sleep_seconds = get(daily_sleep, "sleepTimeSeconds", f"get_sleep_data({iso}).dailySleepDTO")
        deep_seconds = get(daily_sleep, "deepSleepSeconds", f"get_sleep_data({iso}).dailySleepDTO")
        metrics["sleep"] = round(sleep_seconds / 3600, 2) if sleep_seconds else None
        metrics["_deepSleepSeconds"] = deep_seconds
    except Exception as exc:
        print(f"[garmin-sync] warning: get_sleep_data({iso}) failed: {exc}", file=sys.stderr)

    return metrics


def humanize_qualifier(value) -> Optional[str]:
    # Garmin's own "not enough data yet" sentinel is the literal string
    # "UNKNOWN" -- treat that the same as a genuinely missing value so
    # callers fall back to a numeric-based classification instead.
    if not value or value.upper() == "UNKNOWN":
        return None
    return value.replace("_", " ").capitalize()


def format_sleep_total(hours) -> str:
    if hours is None:
        return "Unknown"
    h = int(hours)
    m = round((hours % 1) * 60)
    return f"{h}h {m}m"


def format_deep_caption(seconds) -> str:
    if not seconds:
        return "Deep: unknown"
    h = int(seconds // 3600)
    m = round((seconds % 3600) / 60)
    return f"Deep: {h}h {m}m" if h else f"Deep: {m}m"


def main() -> None:
    if not os.path.isdir(TOKEN_DIR):
        print("[garmin-sync] No cached tokens found — run login.py first.", file=sys.stderr)
        sys.exit(1)

    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        print("[garmin-sync] DATABASE_URL is not set (expected in backend/.env).", file=sys.stderr)
        sys.exit(1)

    client = Garmin()
    client.login(TOKEN_DIR)

    today = date.today()
    days = [today - timedelta(days=offset) for offset in range(HISTORY_DAYS - 1, -1, -1)]

    per_day = {day: fetch_day_metrics(client, day) for day in days}
    today_metrics = per_day[today]

    conn = psycopg2.connect(database_url)
    cur = conn.cursor()

    # Only set columns we actually have fresh data for today -- a metric
    # Garmin hasn't finalized yet (common for "today" mid-day) should leave
    # the previous value in place rather than overwriting it with a
    # generic "Unknown"/"Unavailable" placeholder.
    updates: dict = {}

    body_battery_value = today_metrics.get("bodyBattery")
    if body_battery_value is not None:
        updates["body_battery_value"] = body_battery_value
        yesterday_bb = per_day.get(today - timedelta(days=1), {}).get("bodyBattery")
        updates["body_battery_caption"] = (
            f"Down from {yesterday_bb} yesterday"
            if yesterday_bb is not None and yesterday_bb > body_battery_value
            else "Steady since yesterday"
        )

    steps_value = today_metrics.get("steps")
    if steps_value is not None:
        updates["steps_value"] = steps_value
    steps_goal = today_metrics.get("_stepsGoal")
    if steps_goal is not None:
        updates["steps_goal"] = steps_goal

    resting_hr_value = today_metrics.get("restingHr")
    if resting_hr_value is not None:
        updates["resting_hr_value"] = resting_hr_value
        updates["resting_hr_caption"] = classify_resting_hr(resting_hr_value)

    sleep_hours = today_metrics.get("sleep")
    if sleep_hours is not None:
        updates["sleep_total"] = format_sleep_total(sleep_hours)
        updates["sleep_deep_caption"] = format_deep_caption(today_metrics.get("_deepSleepSeconds"))

    stress_value = today_metrics.get("stress")
    if stress_value is not None:
        updates["stress_level"] = humanize_qualifier(today_metrics.get("_stressQualifier")) or classify_stress(
            stress_value
        )
        updates["stress_caption"] = f"Avg today: {stress_value}"

    if updates:
        set_clause = ", ".join(f"{column} = %s" for column in updates)
        cur.execute(f"UPDATE garmin_stats SET {set_clause} WHERE id = 1", list(updates.values()))
    else:
        print("[garmin-sync] warning: no fresh garmin_stats fields available today", file=sys.stderr)

    upserted = 0
    for day, metrics in per_day.items():
        for metric in ("bodyBattery", "steps", "restingHr", "sleep", "stress"):
            value = metrics.get(metric)
            if value is None:
                continue
            cur.execute(
                """INSERT INTO garmin_weekly_stats (metric, date, value)
                   VALUES (%s, %s, %s)
                   ON CONFLICT (metric, date) DO UPDATE SET value = EXCLUDED.value""",
                (metric, day, value),
            )
            upserted += 1

    conn.commit()
    cur.close()
    conn.close()

    print(f"[garmin-sync] Synced successfully ({upserted} weekly data points written).")


if __name__ == "__main__":
    main()
