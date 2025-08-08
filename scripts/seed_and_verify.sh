#!/usr/bin/env bash
set -euo pipefail

# Config
PROJECT_ROOT="$(cd "$(dirname "$0")"/.. && pwd)"
SCHEMA_FILE="$PROJECT_ROOT/supabase_schema_fixed.sql"
SEED_FILE="$PROJECT_ROOT/supabase/seed.sql"
PG_CONTAINER="currijobs_postgres"
DB_NAME="currijobs"
DB_USER="devuser"
POSTGREST_URL="${EXPO_PUBLIC_POSTGREST_URL:-http://localhost:3000}"

echo "[Seed] Checking Docker daemon..."
if ! docker info >/dev/null 2>&1; then
  echo "[Seed][Error] Docker daemon is not running. Please start Docker Desktop and retry." >&2
  exit 1
fi

cd "$PROJECT_ROOT"

echo "[Seed] Starting containers (postgres + postgrest)..."
(docker compose up -d || docker-compose up -d)

# Wait for Postgres readiness
echo -n "[Seed] Waiting for Postgres to be ready"
for i in {1..60}; do
  if docker exec "$PG_CONTAINER" pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
    echo " - ready"
    break
  fi
  echo -n "."
  sleep 1
  if [ "$i" -eq 60 ]; then
    echo "\n[Seed][Error] Postgres did not become ready in time" >&2
    exit 1
  fi
done

# Apply schema
if [ -f "$SCHEMA_FILE" ]; then
  echo "[Seed] Applying schema: $SCHEMA_FILE"
  cat "$SCHEMA_FILE" | docker exec -i "$PG_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" >/dev/null
else
  echo "[Seed][Warn] Schema file not found: $SCHEMA_FILE (skipping)"
fi

# Apply seed
if [ -f "$SEED_FILE" ]; then
  echo "[Seed] Applying seed: $SEED_FILE"
  cat "$SEED_FILE" | docker exec -i "$PG_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" >/dev/null
else
  echo "[Seed][Warn] Seed file not found: $SEED_FILE (skipping)"
fi

# Verification queries
echo "[Verify] Counts per category:"
docker exec "$PG_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT category, COUNT(*) FROM tasks GROUP BY category ORDER BY category;" | sed 's/^/  /'

echo "[Verify] Payments count:"
docker exec "$PG_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM payments;" | sed 's/^/  /'

echo "[Verify] Sample payments with task & payer:"
docker exec "$PG_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT p.id, t.title, p.amount, p.payment_method, pr.full_name AS payer, p.completed_at FROM payments p JOIN tasks t ON t.id=p.task_id JOIN profiles pr ON pr.id=p.payer_id ORDER BY p.created_at DESC LIMIT 5;" | sed 's/^/  /'

# PostgREST checks
echo "[Verify] PostgREST sample (tasks):"
curl -sS "$POSTGREST_URL/tasks?select=id,title,category,location&limit=5" || true

echo "\n[Seed] Done."


