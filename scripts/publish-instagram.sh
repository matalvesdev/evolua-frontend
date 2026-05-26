#!/usr/bin/env bash
# ============================================================
# Evolua — Instagram Publishing Helper
# ============================================================
# Este script gera os textos e metadados para postar no
# Instagram Manualmente (via app ou Meta Business Suite).
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MEMORY_FILE="$PROJECT_ROOT/.agents/marketing/gerador/memory.json"

echo "=== Instagram Content Publisher ==="
echo ""

# Lista últimos posts disponíveis no memory.json
echo "Posts disponíveis para publicação:"
python3 -c "
import json
with open('$MEMORY_FILE') as f:
    data = json.load(f)
for i, p in enumerate(data.get('publicados', []), 1):
    semana = p.get('semana', '?')
    tema = p.get('tema', '?')
    formato = p.get('formato', '?')
    gancho = p.get('ganchoAmplo', '?')[:60]
    print(f'  [{i}] {tema}')
    print(f'      Semana: {semana} | Formato: {formato}')
    print(f'      Gancho: {gancho}...')
    print()
"

read -rp "Escolha o número do post para publicar (ou 0 para sair): " choice

if [ "$choice" = "0" ]; then exit 0; fi

echo ""
echo "=== Informações para publicação ==="
echo ""
echo "LEGENDA SUGERIDA:"
python3 -c "
import json
with open('$MEMORY_FILE') as f:
    data = json.load(f)
posts = data.get('publicados', [])
idx = int($choice) - 1
if 0 <= idx < len(posts):
    p = posts[idx]
    print()
    print(f'{p[\"insight\"]}')
    print()
    print('Compartilha com quem precisa saber 💜')
    print()
    print('#fonoaudiologia #gestaoClinica #evolua')
    print()
else:
    print('Post não encontrado')
"

echo "---"
echo "IMAGENS: Gerar carrossel/reels no Canva ou Meta Business Suite"
echo "Template visual: fundo #120D1E, título #F5F0FF, destaque #C4F135"
echo ""
echo "Após publicar, atualize o memory.json marcando como publicado."
