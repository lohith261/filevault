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

if [ -n "$DIRECT_URL" ]; then
  echo "[deploy] DIRECT_URL set — prisma.config.ts will use it for migrations ✓"
else
  echo "[deploy] WARNING: DIRECT_URL not set — migrations will use DATABASE_URL (may fail with pgbouncer)"
fi

# Run Prisma migrations
# prisma.config.ts already prefers DIRECT_URL over DATABASE_URL for the datasource URL
echo "[deploy] Running Prisma migrations..."
if node node_modules/.bin/prisma migrate deploy; then
  echo "[deploy] Migrations completed ✓"
else
  echo "[deploy] ERROR: Migration failed!"
  exit 1
fi

# Start Next.js standalone server — smaller memory footprint than full next start
# Cap V8 heap to 300MB, leaving headroom for OS + native overhead in Railway's 512MB container
echo "[deploy] Starting Next.js on port ${PORT:-3000}..."
exec node --max-old-space-size=300 .next/standalone/server.js
