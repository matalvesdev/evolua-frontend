#!/usr/bin/env bash
# ============================================================
# Evolua — Credential Rotation Automation
# ============================================================
# Executa a rotação de credenciais conforme docs/CREDENTIAL-ROTATION.md
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=== Evolua Credential Rotation ==="
echo ""
echo "ATENÇÃO: Este script gera NOVAS chaves. As chaves antigas"
echo "serão revogadas e precisam ser atualizadas nos provedores."
echo ""
read -rp "Tem certeza? (digite 'RODAR' para continuar): " confirm
if [ "$confirm" != "RODAR" ]; then
  echo "Cancelado."
  exit 1
fi

echo ""
echo "1/4 — Gerando INTERNAL_API_TOKEN..."
INTERNAL_API_TOKEN=$(openssl rand -hex 32)
echo "  INTERNAL_API_TOKEN=$INTERNAL_API_TOKEN"

echo ""
echo "2/4 — Gerando WHATSAPP_WEBHOOK_HMAC_SECRET..."
WHATSAPP_WEBHOOK_HMAC_SECRET=$(openssl rand -hex 32)
echo "  WHATSAPP_WEBHOOK_HMAC_SECRET=$WHATSAPP_WEBHOOK_HMAC_SECRET"

echo ""
echo "3/4 — Gerando JWT_SECRET..."
JWT_SECRET=$(openssl rand -hex 32)
echo "  JWT_SECRET=$JWT_SECRET"

echo ""
echo "4/4 — Gerando EVOLUTION_API_KEY..."
EVOLUTION_API_KEY=$(openssl rand -hex 32)
echo "  EVOLUTION_API_KEY=$EVOLUTION_API_KEY"

echo ""
echo "=== RESUMO ==="
echo "Copie os valores abaixo para os secret managers:"
echo ""
echo "--- backend-core/.env / Render ---"
echo "INTERNAL_API_TOKEN=$INTERNAL_API_TOKEN"
echo "JWT_SECRET=$JWT_SECRET"
echo "EVOLUTION_API_KEY=$EVOLUTION_API_KEY"
echo "WHATSAPP_WEBHOOK_HMAC_SECRET=$WHATSAPP_WEBHOOK_HMAC_SECRET"
echo ""
echo "--- apps/services/whatsapp/.env ---"
echo "INTERNAL_API_TOKEN=$INTERNAL_API_TOKEN"
echo "WHATSAPP_WEBHOOK_HMAC_SECRET=$WHATSAPP_WEBHOOK_HMAC_SECRET"
echo "EVOLUTION_API_KEY=$EVOLUTION_API_KEY"
echo ""
echo "--- apps/ai/.env ---"
echo "INTERNAL_API_TOKEN=$INTERNAL_API_TOKEN"
echo ""

# Salva backup criptografado (apenas timestamp + hash)
echo "$(date -Iseconds) | ROTATION_EXECUTED" >> "$PROJECT_ROOT/.credential-rotation.log"
echo "Log salvo em .credential-rotation.log"

echo ""
echo "IMPORTANTE: Revogue as chaves antigas nos provedores!"
echo "1. Supabase: Reset service_role key no dashboard"
echo "2. HuggingFace: Revogar token antigo em huggingface.co/settings/tokens"
echo "3. Evolution API: Atualizar GLOBAL_API_KEY no docker-compose"
echo "4. Vercel/Render: Atualizar variáveis de ambiente nos dashboards"
echo ""
echo "Após atualizar tudo, faça deploy para aplicar as novas credenciais."
