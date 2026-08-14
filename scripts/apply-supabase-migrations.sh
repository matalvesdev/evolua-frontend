#!/usr/bin/env bash
# =============================================================================
# apply-supabase-migrations.sh
# Aplica os arquivos SQL em supabase/migrations/ no banco apontado por
# SUPABASE_DB_URL, de forma incremental e segura.
#
# Como evita re-aplicar migrations já rodadas (várias NÃO são idempotentes,
# ex.: 010_reseed.sql):
#   - Mantém um ledger: public._supabase_sql_migrations (filename PK).
#   - 1ª execução (ledger inexistente): falha de forma segura. A adoção do
#     estado atual só ocorre com ADOPT_EXISTING_BASELINE=true.
#   - Execuções seguintes: aplica apenas os arquivos ainda não registrados,
#     cada um dentro de uma única transação (file + insert no ledger atômicos).
#
# Uso:
#   SUPABASE_DB_URL=postgres://... bash scripts/apply-supabase-migrations.sh
# =============================================================================
set -euo pipefail

: "${SUPABASE_DB_URL:?SUPABASE_DB_URL is required}"

MIG_DIR="supabase/migrations"
LEDGER="public._supabase_sql_migrations"

if ! command -v psql >/dev/null 2>&1; then
  echo "::error::psql não encontrado. Instale postgresql-client." >&2
  exit 1
fi

psql_q() { psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -tAc "$1"; }

# Existe o ledger ANTES de criarmos?
ledger_existed=$(psql_q "select to_regclass('${LEDGER}') is not null;")

# Garante o ledger.
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -c \
  "create table if not exists ${LEDGER} (
     filename text primary key,
     applied_at timestamptz not null default now()
   );"

shopt -s nullglob
files=("$MIG_DIR"/*.sql)
shopt -u nullglob
IFS=$'\n' files=($(printf '%s\n' "${files[@]}" | sort)); unset IFS

if [ "${#files[@]}" -eq 0 ]; then
  echo "Nenhuma migration encontrada em ${MIG_DIR}."
  exit 0
fi

if [ "$ledger_existed" != "t" ]; then
  if [ "${ADOPT_EXISTING_BASELINE:-false}" != "true" ]; then
    echo "::error::Ledger inexistente. Bootstrap ou adoção explícita são obrigatórios." >&2
    echo "Use ADOPT_EXISTING_BASELINE=true apenas quando o schema já estiver aplicado." >&2
    exit 1
  fi
  echo "Ledger inexistente — adotando ${#files[@]} migration(s) atuais como BASELINE (sem executar)."
  for f in "${files[@]}"; do
    name=$(basename "$f")
    psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -c \
      "insert into ${LEDGER}(filename) values ('${name}') on conflict (filename) do nothing;"
    echo "  baseline: ${name}"
  done
  echo "Baseline registrado. Nada a executar nesta primeira rodada."
  exit 0
fi

applied=0
for f in "${files[@]}"; do
  name=$(basename "$f")
  already=$(psql_q "select 1 from ${LEDGER} where filename = '${name}';")
  if [ "$already" = "1" ]; then
    echo "skip (já aplicada): ${name}"
    continue
  fi
  echo "aplicando: ${name}"
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 --single-transaction \
    -f "$f" \
    -c "insert into ${LEDGER}(filename) values ('${name}');"
  applied=$((applied + 1))
done

echo "Concluído. ${applied} nova(s) migration(s) aplicada(s)."
