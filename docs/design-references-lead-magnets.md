# Referências Visuais — Lead Magnets Evolua

> Pesquisa em Dribbble, Behance e plataformas de design (Jun/2026).

## Referências Dribbble (ebooks)

1. **Ebook design — layout vertical 640×2104**
   `cdn.dribbble.com/userupload/5494073/file/original-8e2f7998538c99203bc8af168201fcd8.jpg`
   Layout full-page vertical com grid tipográfico hierarquizado, ideal para capa + páginas internas.

2. **Ebook mockup — desktop/mobile side‑by‑side — 1504×1003**
   `cdn.dribbble.com/userupload/43451771/file/45d5c5832133d2ca8149ff3bde369769.png`
   Mockup de apresentação com visão dupla (desktop + mobile) para preview do material.

3. **Multi‑page ebook kit — 9 shots quadradas (1024×1024 a 1600×1600)**
   Prefixo: `cdn.dribbble.com/userupload/47634479/file/` … `/47634487/file/`
   - Capa com título central, badge de destaque, fundo com gradiente sutil
   - Páginas internas com grid modular, callout boxes, ícones alinhados
   - Section dividers com elementos gráficos decorativos
   - Estilo: moderno, minimalista, tipografia bold + corpo leve
   - Paleta: fundo claro com acentos em violeta e toques de cor vibrante

   9 páginas individuais demonstrando layout completo de ebook: capa, sumário, seções de conteúdo, destaques e CTA final.

## Diretrizes de Estilo

### Paleta (do Brand Kit)
| Token | HEX | Uso |
|-------|-----|-----|
| Primary (Violet 500) | `#8B5CF6` | Títulos, destaques, ícones |
| Neon Green | `#C4F135` | CTAs, badges, acentos |
| Deep | `#0A0A14` | Background de contraste |
| Canvas | `#F5F3FF` | Fundo geral |
| Ink | `#120D1E` | Corpo de texto |

### Tipografia para materiais
- **Headlines**: Inter Black / Bold, tracking-tighter
- **Corpo**: Inter Regular, 11–13pt (em PDF)
- **Labels**: Inter Bold, 8–9pt, uppercase, tracking-[0.3em]
- **Dados/números**: Inter Bold ou JetBrains Mono

### Estilo visual (válido para ebook + infográfico)
- Fundo limpo (canvas ou white) com elementos decorativos em violeta claro
- Ícones em Material Symbols (filled) ou ilustrações vetoriais lineares
- Badges / destaques em neon green (`#C4F135`)
- Boxes de destaque com borda esquerda violeta (`border-l-4 border-primary`)
- Números grandes e ousados (data viz)
- Sem fotografias — usar ilustrações abstratas ou ícones
- Cantos retos (sem border-radius) para coerência com a marca
- Grid modular, respirável, sem clutter

---

## Ebooks

### Referências de layout
1. **Recipe eBook Design | Kilos & Inches** (Behance)
   - Capa limpa com título grande + subtítulo + badge de desconto
   - Interiores com grid de 2 colunas, ícones alinhados à esquerda
   - Cores: fundo claro, headings em cor de destaque
   - URL: behance.net/gallery/250136345

2. **Medical Pitch Deck Presentation Slides Design** (Behance — Rostu Agency)
   - Slides com números grandes, ícones, data points
   - Paleta clean com acentos em uma cor só
   - Excelente para adaptar como páginas de ebook
   - URL: behance.net/gallery/200090899

3. **Healthy Living Website Redesign** (Behance — Iryna Suprun)
   - Cards com ícone + headline + descrição curta
   - Uso de badges coloridos para categorização
   - Paleta suave com toques pastel
   - URL: behance.net/gallery/224249001

### Estrutura recomendada (por ebook)
```
Página 1 — Capa: Título grande + subtítulo + badge "Grátis"
Página 2 — Índice / O que você vai aprender
Página 3–7 — Conteúdo (2 colunas, ícone + texto, destaques)
Página 8 — Resumo + CTA (link para cadastro)
```

### Elementos visuais obrigatórios
- Logo Evolua no header/footer
- URL `useevolua.com.br` no rodapé
- Badge neon "Grátis" no canto superior direito da capa
- Paleta: canvas `#F5F3FF` como fundo, headings em `#120D1E`, acentos em `#8B5CF6`

---

## Infográficos

### Referências de layout
1. **Medical Infographic Series for Wellness Clinics** (Behance — Saba Nagori)
   - Fluxo vertical com blocos numerados
   - Ícones grandes + bullet points concisos
   - Paleta clean com acento em uma cor
   - URL: behance.net/gallery/238798543

2. **Medical Infographics** (Behance — Ronald García)
   - Data visualization com gráfico de barras simples
   - Tipografia hierarquizada (número → título → descrição)
   - URL: behance.net/gallery/205568533

3. **Health Care Infographic** (Behance — search results)
   - Seções com fundos alternados (white / light lavender)
   - Timeline vertical com conectores
   - Ícones Material Symbols consistentes

### Estrutura recomendada (por infográfico)
```
Topo: Título + ícone grande + subtítulo
Bloco 1 — Dado/curiosidade (número grande + breve descrição)
Bloco 2 — Processo (3–4 passos numerados com ícones)
Bloco 3 — Comparação (antes/depois ou com/sem)
Bloco 4 — Resumo + CTA
Rodapé: Logo + url
```

### Regras de data visualization
- Máximo 3 cores no gráfico (primary, neon, ink)
- Preferir ícones a labels textuais
- Números em fonte mono (JetBrains Mono) quando forem dados estatísticos
- Barras horizontais em vez de tortas (mais legíveis em PDF)

---

## Elementos Comuns (ebook + infográfico)

### Badges e selos
- "Grátis" → neon green `#C4F135` sobre fundo escuro
- "Novo" → primary `#8B5CF6` sobre fundo white
- "Trend" → primary-light com texto ink

### Box de CTA
- Fundo deep (`#0A0A14`) com texto white + botão neon
- Texto: "Quer saber mais? Teste o Evolua grátis por 14 dias"
- URL: `useevolua.com.br/cadastro`

### Ícones (Material Symbols — filled)
- Preferir: `description`, `psychology`, `verified_user`, `trending_up`, `calendar_month`, `monitoring`, `exercise`, `voice_selection`, `hearing`, `elderly`
- Todos com `fontVariationSettings: '"FILL" 1'`
- Tamanho: 24–32px no PDF

### Divisores
- Linha fina 1px em `#8B5CF6` a 20% de opacidade
- Ou divider com ícone decorativo centralizado

---

## Próximos passos
1. Aplicar referências ao redesign dos 3 ebooks + 2 infográficos atuais
2. Gerar assets com `scripts/generate-lead-magnets.mjs` usando pdf-lib
3. Validar contraste (WCAG AA) entre texto e fundo
4. Publicar na tabela `lead_magnets` via service_role
