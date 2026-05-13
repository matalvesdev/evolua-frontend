#!/usr/bin/env bash
# ============================================================================
# rotate-local-secrets.sh — Gera segredos hex de 256 bits para dev local
# ============================================================================
# Uso:
#   ./scripts/rotate-local-secrets.sh                  # imprime no stdout
#   ./scripts/rotate-local-secrets.sh --write          # acrescenta ao .env
#   ./scripts/rotate-local-secrets.sh --write --force  # sobrescreve valores
#
# IMPORTANTE:
#   - Use APENAS para dev local. Para produção, gere no secret manager
#     do provider (Vercel/Fly/App Runner/AWS SM).
#   - Cobre apenas segredos gerados localmente (não Supabase, AbacatePay etc).
# ============================================================================

set -euo pipefail

ENV_FILE="${ENV_FILE:-.env}"
WRITE=0
FORCE=0

for arg in "$@"; do
  case "$arg" in
    --write) WRITE=1 ;;
    --force) FORCE=1 ;;
    -h|--help)
      sed -n '2,15p' "$0"
      exit 0
      ;;
    *)
      echo "arg desconhecido: $arg" >&2
      exit 1
      ;;
  esac
done

if ! command -v openssl >/dev/null 2>&1; then
  echo "openssl não encontrado no PATH" >&2
  exit 1
fi

# Segredos a rotacionar (nome → valor)
declare -A SECRETS=(
  [INTERNAL_API_TOKEN]="$(openssl rand -hex 32)"
  [JWT_SECRET]="$(openssl rand -hex 32)"
  [EVOLUTION_WEBHOOK_SECRET]="$(openssl rand -hex 32)"
  [ABACATEPAY_WEBHOOK_SECRET]="$(openssl rand -hex 32)"
)

if [[ "$WRITE" -eq 0 ]]; then
  echo "# Segredos gerados em $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  for key in "${!SECRETS[@]}"; do
    printf '%s=%s\n' "$key" "${SECRETS[$key]}"
  done
  echo
  echo "Para escrever no $ENV_FILE: ./scripts/rotate-local-secrets.sh --write"
  exit 0
fi

# --write mode
if [[ ! -f "$ENV_FILE" ]]; then
  echo "criando $ENV_FILE"
  touch "$ENV_FILE"
fi

# Backup
BACKUP="${ENV_FILE}.bak.$(date +%Y%m%d%H%M%S)"
cp "$ENV_FILE" "$BACKUP"
echo "backup: $BACKUP"

for key in "${!SECRETS[@]}"; do
  value="${SECRETS[$key]}"
  if grep -qE "^${key}=" "$ENV_FILE"; then
    if [[ "$FORCE" -eq 0 ]]; then
      echo "  skip  $key (já existe; use --force para sobrescrever)"
      continue
    fi
    # Sobrescrever (portátil bash/sed sem -i in-place do GNU)
    tmp=$(mktemp)
    awk -v k="$key" -v v="$value" '
      BEGIN { OFS="=" }
      $0 ~ "^" k "=" { print k "=" v; next }
      { print }
    ' "$ENV_FILE" > "$tmp"
    mv "$tmp" "$ENV_FILE"
    echo "  set   $key (sobrescrito)"
  else
    printf '%s=%s\n' "$key" "$value" >> "$ENV_FILE"
    echo "  add   $key"
  fi
done

echo "ok. revise '$ENV_FILE' e remova o backup '$BACKUP' depois de confirmar."
