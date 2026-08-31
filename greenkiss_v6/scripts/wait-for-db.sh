#!/usr/bin/env bash
set -e

HOST="${DB_HOST:-localhost}"
PORT="${DB_PORT:-5432}"

echo "[wait-for-db] Ожидание PostgreSQL на ${HOST}:${PORT}..."

for i in {1..30}; do
  if nc -z "$HOST" "$PORT" >/dev/null 2>&1; then
    echo "[wait-for-db] PostgreSQL доступен."
    exit 0
  fi
  echo "[wait-for-db] ещё не доступен, попытка $i..."
  sleep 1
done

echo "[wait-for-db] PostgreSQL так и не стал доступен :("
exit 1
