#!/usr/bin/env bash
# ============================================================
# Evolua — Configura secrets do GitHub Actions
# ============================================================
# Lê de .env.github (NUNCA hardcode secrets em scripts!)
# ============================================================
set -euo pipefail

REPO="${1:-matalvesdev/evolua-frontend}"
ENV_FILE=".env.github"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Arquivo $ENV_FILE não encontrado."
  echo ""
  echo "Crie o arquivo .env.github com o seguinte formato:"
  echo "------------------------"
  echo "SUPABASE_URL=https://diiaoaboykraaiavgdqs.supabase.co"
  echo "SUPABASE_SERVICE_ROLE_KEY=eyJ... (service_role key do Supabase)"
  echo "SUPABASE_ANON_KEY=eyJ... (anon key do Supabase)"
  echo "NOTIFICA_API_KEY=c6a5daf7-... (sua chave Notifica)"
  echo "VITE_API_URL=https://api.useevolua.com.br"
  echo "------------------------"
  echo ""
  echo "Depois execute: bash scripts/set-github-secrets.sh"
  exit 1
fi

# shellcheck source=/dev/null
source "$ENV_FILE"

echo "🔐 Configurando secrets do GitHub Actions em $REPO ..."
echo ""

set -a
# Validar que as vars obrigatórias existem
: "${SUPABASE_URL:?}"
: "${SUPABASE_SERVICE_ROLE_KEY:?}"
: "${SUPABASE_ANON_KEY:?}"
: "${NOTIFICA_API_KEY:?}"
: "${VITE_API_URL:?}"

gh secret set SUPABASE_URL --repo "$REPO" --body "$SUPABASE_URL"
gh secret set SUPABASE_SERVICE_ROLE_KEY --repo "$REPO" --body "$SUPABASE_SERVICE_ROLE_KEY"
gh secret set SUPABASE_ANON_KEY --repo "$REPO" --body "$SUPABASE_ANON_KEY"
gh secret set NOTIFICA_API_KEY --repo "$REPO" --body "$NOTIFICA_API_KEY"
gh secret set NOTIFICA_FROM_EMAIL --repo "$REPO" --body "contatouseevolua@gmail.com.br"
gh secret set VITE_SUPABASE_URL --repo "$REPO" --body "$SUPABASE_URL"
gh secret set VITE_SUPABASE_ANON_KEY --repo "$REPO" --body "$SUPABASE_ANON_KEY"
gh secret set VITE_API_URL --repo "$REPO" --body "$VITE_API_URL"

# Configurar SUPABASE_DB_URL para backup
if [ -n "${SUPABASE_DB_URL:-}" ]; then
  gh secret set SUPABASE_DB_URL --repo "$REPO" --body "$SUPABASE_DB_URL"
fi

echo ""
echo "✅ Secrets configurados em: https://github.com/$REPO/settings/secrets/actions"
