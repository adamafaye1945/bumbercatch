import { query } from "../db";
import { insertNotificationIfAbsent } from "../services/notifications.service";
import type { NewEmail } from "../icloud/sync";

// How far below the trailing average body battery must fall before we alert.
const BODY_BATTERY_DROP_THRESHOLD = 15;

async function notifyNewEmails(newEmails: NewEmail[]): Promise<void> {
  for (const email of newEmails) {
    await insertNotificationIfAbsent({
      id: `email-${email.id}`,
      source: "Email",
      message: `New email from ${email.sender}: ${email.subject}`,
    });
  }
}

async function notifyBodyBatteryDrop(): Promise<void> {
  const rows = await query<{ today: number; avg: string | null }>(
    `SELECT gs.body_battery_value AS today,
            (SELECT AVG(value) FROM garmin_weekly_stats WHERE metric = 'bodyBattery' AND date < CURRENT_DATE) AS avg
     FROM garmin_stats gs WHERE gs.id = 1`
  );
  const row = rows[0];
  if (!row || row.avg === null) return;

  const average = Number(row.avg);
  if (row.today <= average - BODY_BATTERY_DROP_THRESHOLD) {
    await insertNotificationIfAbsent({
      id: `garmin-bodyBattery-drop-${new Date().toISOString().slice(0, 10)}`,
      source: "Garmin",
      message: `Body battery is ${row.today}, well below your recent average of ${Math.round(average)}`,
    });
  }
}

async function notifyMissedReminders(): Promise<void> {
  const rows = await query<{ id: string; label: string; due_at: string }>(
    `SELECT id, label, due_at FROM reminders WHERE dismissed_at IS NULL AND due_at < now()`
  );
  for (const reminder of rows) {
    const dueEpoch = Math.floor(new Date(reminder.due_at).getTime() / 1000);
    await insertNotificationIfAbsent({
      id: `reminder-missed-${reminder.id}-${dueEpoch}`,
      source: "Reminder",
      message: `Missed: ${reminder.label}`,
    });
  }
}

export async function runNotificationRules(newEmails: NewEmail[]): Promise<void> {
  await notifyNewEmails(newEmails);
  await notifyBodyBatteryDrop();
  await notifyMissedReminders();
}
