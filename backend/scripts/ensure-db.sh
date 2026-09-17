#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

CONTAINER_NAME="bumbercatch-postgres"

echo "[ensure-db] Ensuring Postgres container is up..."
docker compose up -d

echo "[ensure-db] Waiting for Postgres to accept connections..."
ATTEMPTS=30
until docker exec "$CONTAINER_NAME" pg_isready -U "${POSTGRES_USER:-bumbercatch}" -d "${POSTGRES_DB:-bumbercatch}" >/dev/null 2>&1; do
  ATTEMPTS=$((ATTEMPTS - 1))
  if [ "$ATTEMPTS" -le 0 ]; then
    echo "[ensure-db] ERROR: Postgres did not become ready in time." >&2
    exit 1
  fi
  sleep 1
done

echo "[ensure-db] Postgres is ready on port ${POSTGRES_PORT:-5433}."
