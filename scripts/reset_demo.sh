#!/usr/bin/env bash
set -euo pipefail

# Paths
PROJECT_ROOT="$(cd "$(dirname "$0")"/.. && pwd)"
SCHEMA_FILE="$PROJECT_ROOT/supabase_schema_fixed.sql"
SEED_FILE="$PROJECT_ROOT/supabase/seed.sql"

# Containers
PG_CONTAINER="currijobs_postgres"
PGRST_CONTAINER="currijobs_postgrest"

# DB
DB_NAME="currijobs"
DB_USER="devuser"

# API base (local PostgREST on LAN or localhost)
POSTGREST_URL="${EXPO_PUBLIC_POSTGREST_URL:-http://localhost:3000}"

echo "[reset] Using PostgREST: $POSTGREST_URL"

echo "[reset] Checking Docker daemon..."
if ! docker info >/dev/null 2>&1; then
  echo "[reset][Error] Docker Desktop is not running." >&2
  exit 1
fi

cd "$PROJECT_ROOT"

echo "[reset] Removing old containers if they exist..."
docker rm -f "$PGRST_CONTAINER" >/dev/null 2>&1 || true
docker rm -f "$PG_CONTAINER" >/dev/null 2>&1 || true

echo "[reset] Starting fresh stack (postgres + postgrest)..."
(docker compose up -d || docker-compose up -d)

echo -n "[reset] Waiting for Postgres to be ready"
for i in {1..90}; do
  if docker exec "$PG_CONTAINER" pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
    echo " - ready"
    break
  fi
  echo -n "."
  sleep 1
  if [ "$i" -eq 90 ]; then
    echo "\n[reset][Error] Postgres did not become ready in time" >&2
    exit 1
  fi
done

if [ -f "$SCHEMA_FILE" ]; then
  echo "[reset] Applying schema: $SCHEMA_FILE"
  cat "$SCHEMA_FILE" | docker exec -i "$PG_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" >/dev/null
fi

if [ -f "$SEED_FILE" ]; then
  echo "[reset] Applying base seed: $SEED_FILE"
  cat "$SEED_FILE" | docker exec -i "$PG_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" >/dev/null
fi

echo "[reset] Cleaning previous tasks (keeping minimal historic ones)..."
EXPO_PUBLIC_POSTGREST_URL="$POSTGREST_URL" node "$PROJECT_ROOT/scripts/cleanup-tasks.js"

echo "[reset] Seeding 4 tasks per demo user near test zone..."
EXPO_PUBLIC_POSTGREST_URL="$POSTGREST_URL" node "$PROJECT_ROOT/scripts/seed-demo-tasks.js"

echo "[verify] Sample counts:"
docker exec "$PG_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT user_id, COUNT(*) FROM tasks GROUP BY user_id ORDER BY user_id;" | sed 's/^/  /'

echo "[reset] Done. Press Refresh in the app map to reload tasks."


