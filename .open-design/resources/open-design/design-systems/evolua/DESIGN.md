# Design System — Evolua v5.0

> Category: Healthcare & SaaS
> CRM for speech therapists (fonoaudiólogas). Violet-neon, serena & clínica, Brazil-first.

## 1. Visual Theme & Atmosphere

Evolua is a light-first, high-contrast brand built for clarity and clinical trust. The aesthetic pairs an off-white violet-tinted canvas (`#F8F8FF`) with soft violet primary (`#6C63FF`) and neon green (`#C4F135`) accents for CTAs on dark sections. Deep sections use a purple-toned near-black (`#2D2B55`) instead of pure black.

**Key Characteristics:**
- Light-mode-native: `#F8F8FF` canvas, `#FFFFFF` surface
- High contrast: violet primary on light backgrounds or white text on deep
- Neon green (`#C4F135`) as exclusive CTA accent on dark backgrounds
- Editorial uppercase headlines with negative tracking (Space Grotesk, 700)
- Body text in DM Sans for readability
- Border-based separation — `2px` radius, sharp corners
- Portuguese-first: all UI in pt-BR

## 2. Color Palette & Roles

### Background Surfaces
- **Canvas** (`#F8F8FF`): Page-level backgrounds. Off-white with subtle violet tint.
- **Surface** (`#FFFFFF`): Cards, modals, elevated elements.
- **Surface Low** (`#F0EFF9`): Alternating sections, subtle hover states.

### Brand Accents
- **Primary** (`#6C63FF`): Primary actions, links, category badges, interactive states.
- **Primary Dark** (`#5650D4`): Hover states for primary elements.
- **Primary Light** (`#8B85FF`): Disabled states, secondary icons.

### Lavender — "Air" of the Brand
- **Lavender** (`#EAE8FF`): Background of sections, badges, chips.
- **Lavender Mid** (`#C5C1FF`): Active borders, prominent dividers.
- **Lavender Deep** (`#9D97F5`): Medium icons, sub-accents, text on dark.

### Ink — Typography
- **Ink** (`#1A1A2E`): Headlines, body text (near-black with violet undertone).
- **Ink Soft** (`#4A4A6A`): Subtitles, secondary text, descriptions.
- **Muted** (`#8888AA`): Labels, placeholders, tertiary text.

### Deep — Dark Sections
- **Deep** (`#2D2B55`): Dark section backgrounds, logo symbol background.
- **Deep Mid** (`#3D3A6B`): Cards on dark backgrounds, dark section hover.
- **Deep Light** (`#514E85`): Borders on deep/ink backgrounds.

### Accents
- **Neon** (`#C4F135`): Exclusive CTA accent on dark backgrounds — contrast 9.4:1.
- **Rose** (`#FB7185`): Urgency, errors, critical data, alerts (large text only).

### Borders
- **Outline Variant** (`#E0DFEF`): Neutral borders, dividers, table borders.
- **Outline** (`#C5C1FF`): Highlighted borders, focus ring.

## 3. Typography

### Family Stack
- **Headlines**: `Space Grotesk`, `system-ui`, sans-serif (font-weight: 700-600, negative tracking)
- **Body**: `DM Sans`, `system-ui`, sans-serif (font-weight: 400-600)
- **Labels**: `DM Sans`, `system-ui`, sans-serif (font-weight: 700, 10px, uppercase, 0.3em tracking)
- **Mono**: `JetBrains Mono`, `Fira Code`, monospace (code, values)

### Scale
- **Display**: `72px / -3px` — Hero titles, landing page (Space Grotesk 700)
- **H1**: `48px / -2px` — Page titles, blog post titles (Space Grotesk 700)
- **H2**: `36px / -1px` — Section headings (Space Grotesk 600)
- **H3**: `24px / -0.5px` — Subsection headings (Space Grotesk 600)
- **Body L**: `16px / 0` — Paragraphs (DM Sans 400)
- **Body M**: `14px / 0` — Secondary text (DM Sans 400)
- **Caption**: `11px / +2px` — Labels, metadata (DM Sans 500)

### Letter Spacing
- **Headlines**: `tracking-tighter` (-0.05em to -0.02em) for uppercase
- **Labels**: `tracking-[0.2em]` to `tracking-[0.3em]` — uppercase labels
- **Body**: `tracking-normal`

## 4. Spacing & Layout

### Grid
- **Page width**: `max-w-7xl` (1280px) for most content
- **Blog content**: `max-w-3xl` for article body, `max-w-5xl` for hero images
- **Padding**: `px-5 md:px-12` for page-level horizontal padding
- **Section spacing**: `py-16 md:py-24` for major sections

### Card Pattern
- Cards use `bg-white border border-[#E0DFEF]` with `p-6 md:p-8`
- Image containers: `aspect-[16/9]` with `object-cover`
- Border radius: `2px` (sharp corners)
- No border-left accent on cards

### Border Radius
- Everywhere: `2px`
- Badges: `2px`
- Buttons: `2px`
- Cards: `2px`
- No rounded pills, no 100px radius

## 5. Imagery & Media

- Cover images use Pexels (preferred, whitelisted in CSP) 
- Image transitions: `transition-all duration-500`
- All images: `object-cover` with `aspect-[16/9]`
- Fallback: inline SVG placeholder on error
- Source: Pexels (preferred) — never Unsplash

## 6. Component Patterns

### Buttons
```html
.btn-primary { background: #6C63FF; color: #FFFFFF; border: none; border-radius: 2px; }
.btn-neon { background: #C4F135; color: #1A1A2E; border: none; border-radius: 2px; }
.btn-outline { background: transparent; color: #6C63FF; border: 1.5px solid #6C63FF; border-radius: 2px; }
```

### Badges / Labels
- Font: DM Sans 700, 10px, uppercase, 0.3em tracking
- Background: `#EAE8FF`, color: `#5650D4`

### Cards
- Background: `#FFFFFF`, border: `1px solid #E0DFEF`
- No shadow or very subtle (`box-shadow: 0 1px 3px rgba(26,26,46,0.04)`)
- No border-left accent

### Tables
- Header: `background: #2D2B55`, text: `#C4F135`, labels 10px uppercase
- Body rows: `border-bottom: 1px solid #E0DFEF`
- Secondary text: `#8888AA`

## 7. Voice & Tone

- "Especialista que fala COM a fonoaudióloga, não PARA ela"
- Short sentences, present tense, spoken language
- Max 3 emojis per caption
- First line MUST stop the scroll
- NEVER use: "solução", "inovar", "ecossistema", "maximizar", "potencializar"

## 8. Anti-Patterns
- ❌ No `#0A0A14`, `#8B5CF6`, `#120D1E`, `#F5F3FF` — those are OLD palette v4
- ❌ No Inter font — use Space Grotesk (headlines) + DM Sans (body)
- ❌ No 100px/16px/12px border-radius — always `2px`
- ❌ No emojis as icons (Material Symbols Outlined instead)
- ❌ No rounded pills — sharp corners only
- ❌ No border-left accent on cards
- ❌ No multiple accent colors on cards — use primary `#6C63FF` only
- ❌ No CSS gradients as decoration (only for deep section backgrounds)
