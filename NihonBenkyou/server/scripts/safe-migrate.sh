#!/bin/bash
# Safe migration script: only run migrations if DATABASE_URL is set
# This prevents the container from crashing if the database is not configured

if [ -z "$DATABASE_URL" ]; then
  echo "[migration] DATABASE_URL not set; skipping migrations"
  exit 0
fi

echo "[migration] Running Prisma migrations..."
npx prisma migrate deploy
exit_code=$?

if [ $exit_code -ne 0 ]; then
  echo "[migration] Warning: Prisma migration failed with code $exit_code"
  echo "[migration] Server will start without migrations applied"
  exit 0  # Don't block server startup
fi

echo "[migration] Migrations completed successfully"
exit 0
