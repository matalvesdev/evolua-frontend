#!/usr/bin/env bash
# Backup da base PostgreSQL do Evolua (Supabase)
#
# Uso:  env SUPABASE_DB_URL="postgresql://..." ./scripts/backup-postgres.sh
#       ou criar .env com SUPABASE_DB_URL
#
# Recomendado rodar via cron semanal:
#   0 3 * * 0 cd /path/to/project && ./scripts/backup-postgres.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKUP_DIR="${SCRIPT_DIR}/../backups/postgres"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
DB_URL="${SUPABASE_DB_URL:-}"

# ── cores ──────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; NC='\033[0m'

# ── validações ─────────────────────────────────────────
if [[ -z "$DB_URL" ]]; then
  echo -e "${RED}ERRO: SUPABASE_DB_URL não definida.${NC}"
  echo "  export SUPABASE_DB_URL='postgresql://...'"
  exit 1
fi

if ! command -v pg_dump &>/dev/null; then
  echo -e "${RED}ERRO: pg_dump não encontrado. Instale PostgreSQL client tools.${NC}"
  exit 1
fi

mkdir -p "$BACKUP_DIR"

# ── backup ─────────────────────────────────────────────
echo -e "${GREEN}→ Iniciando backup...${NC}"
pg_dump "$DB_URL" \
  --no-owner \
  --no-acl \
  --format=custom \
  --file="${BACKUP_DIR}/evolua_${TIMESTAMP}.dump"

echo -e "${GREEN}→ Backup concluído:${NC} ${BACKUP_DIR}/evolua_${TIMESTAMP}.dump"

# ── limpeza: manter apenas últimos 30 dias ─────────────
find "$BACKUP_DIR" -name 'evolua_*.dump' -mtime +30 -delete
echo -e "${GREEN}→ Backups antigos (>30d) removidos.${NC}"

# ── tamanho ────────────────────────────────────────────
ls -lh "${BACKUP_DIR}/evolua_${TIMESTAMP}.dump"
