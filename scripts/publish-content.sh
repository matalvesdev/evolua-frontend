#!/usr/bin/env bash
# ============================================================
# Evolua — Content Publishing Workflow
# ============================================================
# Use este script para gerenciar o pipeline de conteúdo:
#   1. Gerar novo conteúdo
#   2. Revisar rascunhos
#   3. Publicar no blog/Instagram/LinkedIn
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MEMORY_FILE="$PROJECT_ROOT/.agents/marketing/gerador/memory.json"
CALENDARIO="$PROJECT_ROOT/.agents/marketing/calendario-editorial-2026.md"

echo "=== Evolua Content Pipeline ==="
echo "1. Verificar próximos posts no calendário"
echo "2. Gerar novo conteúdo (via gerador)"
echo "3. Listar rascunhos pendentes"
echo "4. Status atual"

read -rp "Escolha uma opção (1-4): " option

case $option in
  1)
    echo ""
    echo "=== Próximos posts no calendário ==="
    echo "Consulte: .agents/marketing/calendario-editorial-2026.md"
    echo ""
    echo "Semana atual:"
    python3 -c "
from datetime import datetime, timedelta
today = datetime.now()
print(f'  {today.strftime(\"%A, %d %B %Y\")}')
print(f'  Segunda: Pilar 1 — Dor Resolvida (Carrossel 7 slides)')
print(f'  Terça:   Pilar 2 — Educação Clínica (Carrossel 5 slides)')
print(f'  Quarta:  Pilar 4 — Produto em Ação (Reels/Carrossel)')
print(f'  Quinta:  Pilar 3 — Prova Social (Carrossel 5 slides)')
print(f'  Sexta:   Pilar 1/2 — Conteúdo Viral (Carrossel 7 slides)')
"
    ;;
  2)
    echo ""
    echo "=== Gerando novo conteúdo ==="
    cd "$PROJECT_ROOT/.agents/marketing/gerador"
    npm run generate
    ;;
  3)
    echo ""
    echo "=== Rascunhos pendentes ==="
    echo "Posts gerados no memory.json:"
    python3 -c "
import json
with open('$MEMORY_FILE') as f:
    data = json.load(f)
for p in data.get('publicados', []):
    semana = p.get('semana', '?')
    tema = p.get('tema', '?')
    formato = p.get('formato', '?')
    slug = p.get('slug', '?')
    print(f'  [{semana}] {tema} ({formato})')
    print(f'    → slug: {slug}')
    print()
"
    ;;
  4)
    echo ""
    echo "=== Status do Pipeline ==="
    total=$(python3 -c "import json; print(len(json.load(open('$MEMORY_FILE')).get('publicados', [])))")
    echo "  Posts gerados: $total"
    echo "  Posts publicados (Instagram): 0"
    echo "  Posts publicados (Blog): 5"
    echo "  Newsletter: Não lançada"
    echo "  Meta Ads: Não configurado"
    echo "  Google Ads: Não configurado"
    echo ""
    echo "============================================"
    echo "PRÓXIMAS AÇÕES:"
    echo "1. Publicar posts no Instagram (@useevoluaapp)"
    echo "2. Atualizar bio do Instagram"
    echo "3. Publicar post no LinkedIn"
    echo "4. Lançar newsletter 'Fono em Foco'"
    echo "5. Configurar Meta Ads + Google Ads"
    echo "============================================"
    ;;
  *)
    echo "Opção inválida"
    exit 1
    ;;
esac
