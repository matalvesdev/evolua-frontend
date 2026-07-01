#!/usr/bin/env bash
# scripts/backup-postgres.sh
# PostgreSQL backup script for Evolua
# Usage: SUPABASE_DB_URL=postgresql://... bash scripts/backup-postgres.sh

set -euo pipefail

BACKUP_DIR="backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/evolua_${TIMESTAMP}.sql.gz"

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "Error: SUPABASE_DB_URL is required"
  exit 1
fi

mkdir -p "$BACKUP_DIR"

echo "Starting backup to ${BACKUP_FILE}..."
pg_dump "$SUPABASE_DB_URL" | gzip > "$BACKUP_FILE"

if [ -f "$BACKUP_FILE" ]; then
  echo "Backup completed: $(ls -lh "$BACKUP_FILE" | awk '{print $5}')"
else
  echo "Error: Backup file not created"
  exit 1
fi
