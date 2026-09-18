"""
Run this manually, once (or again whenever cached tokens expire — roughly
yearly). It logs into Garmin Connect interactively and caches OAuth tokens
to .garmin_tokens/ so garmin_sync.py never needs to prompt for anything.

Usage:
    venv/bin/python login.py
"""

import os
from getpass import getpass

from dotenv import load_dotenv
from garminconnect import Garmin

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TOKEN_DIR = os.path.join(SCRIPT_DIR, ".garmin_tokens")

load_dotenv(os.path.join(SCRIPT_DIR, ".env"))
load_dotenv(os.path.join(SCRIPT_DIR, "..", ".env"))  # GARMIN_EMAIL may live here instead


def main() -> None:
    email = os.environ.get("GARMIN_EMAIL")
    if not email:
        raise SystemExit(
            "GARMIN_EMAIL is not set. Copy .env.example to .env and fill it in first."
        )

    client = Garmin(email, getpass("Garmin password: "))
    # Passing TOKEN_DIR here does both jobs: it tries loading cached tokens
    # from that path first, and falls back to a fresh interactive login
    # (prompting for an MFA code if needed) using the credentials above --
    # either way, it dumps the resulting tokens back to TOKEN_DIR itself.
    client.login(TOKEN_DIR)
    print(f"Login OK — tokens cached in {TOKEN_DIR}")


if __name__ == "__main__":
    main()
