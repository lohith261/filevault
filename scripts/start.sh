#!/bin/bash
set -e

echo "[deploy] Starting FileVault deploy..."
echo "[deploy] PORT=$PORT"
echo "[deploy] NODE_ENV=$NODE_ENV"

# Validate DATABASE_URL is set and is PostgreSQL
if [ -z "$DATABASE_URL" ]; then
  echo "[deploy] ERROR: DATABASE_URL is not set!"
  exit 1
fi

if [[ "$DATABASE_URL" != postgresql://* && "$DATABASE_URL" != postgres://* ]]; then
  echo "[deploy] ERROR: DATABASE_URL must be a PostgreSQL connection string (got: ${DATABASE_URL:0:50}...)"
  exit 1
fi

echo "[deploy] DATABASE_URL is PostgreSQL ✓"

# For migrations, Prisma uses DIRECT_URL if available (direct Supabase connection)
# otherwise falls back to DATABASE_URL
MIGRATION_URL="${DIRECT_URL:-$DATABASE_URL}"
if [ -n "$DIRECT_URL" ]; then
  echo "[deploy] Using DIRECT_URL for migrations (direct connection) ✓"
else
  echo "[deploy] WARNING: DIRECT_URL not set — using DATABASE_URL for migrations"
  echo "[deploy]          If using Supabase, set DIRECT_URL to the direct port 5432 connection"
fi

# Run Prisma migrations (no timeout — migrations need time)
echo "[deploy] Running Prisma migrations..."
if npx prisma migrate deploy --skip-generate; then
  echo "[deploy] Migrations completed ✓"
else
  echo "[deploy] ERROR: Migration failed!"
  exit 1
fi

# Start Next.js
echo "[deploy] Starting Next.js on port ${PORT:-3000}..."
exec npx next start -p "${PORT:-3000}"
