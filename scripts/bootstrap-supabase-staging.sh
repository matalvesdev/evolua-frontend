#!/usr/bin/env bash
# Clona somente o schema public da produção para um projeto Supabase staging vazio.
# Nenhum dado clínico é copiado. Somente ledgers de migrations acompanham o schema.
set -euo pipefail

: "${SOURCE_DB_URL:?SOURCE_DB_URL is required}"
: "${TARGET_DB_URL:?TARGET_DB_URL is required}"
: "${CONFIRM_STAGING_BOOTSTRAP:?Set CONFIRM_STAGING_BOOTSTRAP=BOOTSTRAP_STAGING}"

if [ "$CONFIRM_STAGING_BOOTSTRAP" != "BOOTSTRAP_STAGING" ]; then
  echo "::error::Confirmação inválida." >&2
  exit 1
fi

for command_name in pg_dump psql; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "::error::$command_name não encontrado." >&2
    exit 1
  fi
done

target_table_count=$(psql "$TARGET_DB_URL" -v ON_ERROR_STOP=1 -tAc \
  "select count(*) from pg_tables where schemaname = 'public';")

if [ "$target_table_count" != "0" ]; then
  echo "::error::O schema public de staging não está vazio (${target_table_count} tabelas)." >&2
  exit 1
fi

dump_file=$(mktemp)
ledger_dump_file=$(mktemp)
trap 'rm -f "$dump_file" "$ledger_dump_file"' EXIT

pg_dump "$SOURCE_DB_URL" --schema-only --schema=public --no-owner --file="$dump_file"

# Projetos Supabase novos já contêm o schema public vazio. Após validar que
# não há tabelas, recriamos o schema e as extensões exigidas pelo dump.
# O CREATE SCHEMA do dump é removido porque o pgvector precisa existir antes
# das tabelas que usam public.vector.
sed -i '/^CREATE SCHEMA public;$/d' "$dump_file"
# O papel postgres gerenciado pelo Supabase não pode alterar default privileges
# no projeto de destino. Grants atuais são restaurados; defaults novos ficam a
# cargo das migrations explícitas e do RLS automático do projeto.
sed -i '/^ALTER DEFAULT PRIVILEGES /d' "$dump_file"
psql "$TARGET_DB_URL" -v ON_ERROR_STOP=1 --single-transaction -c \
  "drop schema if exists public cascade;
   create schema public;
   create extension if not exists vector with schema public;"
psql "$TARGET_DB_URL" -v ON_ERROR_STOP=1 --single-transaction -f "$dump_file"

supabase_ledger_exists=$(psql "$SOURCE_DB_URL" -v ON_ERROR_STOP=1 -tAc \
  "select to_regclass('public._supabase_sql_migrations') is not null;")
if [ "$supabase_ledger_exists" != "t" ]; then
  echo "::error::Produção não possui public._supabase_sql_migrations; baseline não pode ser inferido com segurança." >&2
  exit 1
fi

ledger_tables=(public._supabase_sql_migrations)
prisma_ledger_exists=$(psql "$SOURCE_DB_URL" -v ON_ERROR_STOP=1 -tAc \
  "select to_regclass('public._prisma_migrations') is not null;")
if [ "$prisma_ledger_exists" = "t" ]; then
  ledger_tables+=(public._prisma_migrations)
fi

ledger_args=()
for ledger_table in "${ledger_tables[@]}"; do
  ledger_args+=(--table="$ledger_table")
done

pg_dump "$SOURCE_DB_URL" --data-only --inserts --no-owner --no-privileges \
  "${ledger_args[@]}" --file="$ledger_dump_file"
psql "$TARGET_DB_URL" -v ON_ERROR_STOP=1 --single-transaction -f "$ledger_dump_file"

echo "Schema public clonado sem dados. Aplicando migrations pendentes..."
SUPABASE_DB_URL="$TARGET_DB_URL" bash scripts/apply-supabase-migrations.sh
