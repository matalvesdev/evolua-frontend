# Brand Kit — Evolua

> Documento vivo. Última atualização: 2026-05-22.

## Identidade Visual

### Logotipo
- **Primary**: Logotipo completo com símbolo + "evolua" em lowercase
- **Symbol**: Marca isolada (favicon) — coração com onda sonora
- **Variantes**: Dark mode (neon green on dark) / Light mode (dark on white) / Monocromática

**Localização dos assets:**
- `/frontend-core/public/favicon.svg` — favicon atual (symbol)
- `/frontend-core/src/components/Logo.tsx` — componente React do logo
- Para obter os PNGs originais: verificar no Supabase Storage bucket `brand-kit` ou Figma

### Paleta de Cores
| Token | CSS Variable | HEX | Uso |
|-------|-------------|-----|-----|
| Deep | `--deep` / `#0A0A14` | `#0A0A14` | Backgrounds escuros |
| Ink | `--ink` / `#120D1E` | `#120D1E` | Texto escuro, surface dark |
| Violet 500 | `--primary` / `#8B5CF6` | `#8B5CF6` | Ações primárias, destaques |
| Neon Green | `--neon` / `#C4F135` | `#C4F135` | CTAs, urgência, ícones |
| Surface | `--surface` | `#FFFFFF` (light) / `#1A1628` (dark) | Cards, containers |
| Canvas | `--canvas` | `#F5F3FF` (light) / `#0A0A14` (dark) | Fundo de páginas |

### Tipografia
- **Headlines (títulos)**: Inter Bold / Black, letter-spacing tracking-tighter
- **Body**: Inter Regular, 14-16px
- **Labels**: Inter Bold, 9-10px, uppercase, tracking-[0.3em]
- **Mono**: JetBrains Mono (código, valores)

### Ícones
- **Material Symbols** (Google Fonts) — filled variation
- Usar `fontVariationSettings: '"FILL" 1'` para ícones preenchidos
- Tamanhos: `text-sm` (16px), `text-base` (20px), `text-lg` (24px)

### Tom de Voz
- Especialista que fala COM a fonoaudióloga, não PARA ela
- Frases curtas, verbos no presente, linguagem falada
- Máximo 3 emojis por legenda, zero no blog
- Primeira linha DEVE parar o scroll
- **Nunca usar**: "solução", "inovar", "ecossistema", "maximizar", "potencializar"

## Componentes UI (frontend-core)

### Botões
- `.btn-primary` — bg-deep + text-neon (CTAs principais)
- `.btn-outline` — border + bg-transparent (ações secundárias)
- `.btn-text` — sem borda (ações terciárias)

### Cards
- `.card` — bg-surface + border + padding
- Padrão: 16-20px padding, 12px border-radius

### Formulários
- Inputs: border-2, 12px padding, bg-surface
- Labels: font-bold, text-xs, uppercase, tracking-wide

## Assets faltando
- [ ] PNGs do logotipo (cores + monocromático)
- [ ] Ícones para App Store / Google Play
- [ ] OG Image template para blog posts
- [ ] Banners para Meta Ads (300x250, 728x90, 300x600)
- [ ] Apresentação corporativa (PDF/PPT)

## Onde encontrar
- **Figma**: @evolua/design-system (solicitar acesso ao PO)
- **Supabase Storage**: bucket `brand-kit`
- **Repositório**: `/frontend-core/public/` (favicon, logo)
