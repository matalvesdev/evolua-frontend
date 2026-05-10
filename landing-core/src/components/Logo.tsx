/**
 * Evolua — Logo SVG
 * Símbolo: 5 barras tipo equalizer (graphic_eq) + wordmark "EVOLUA"
 * Brand Kit v5.0 — Serena & Clínica
 *
 * Variante padrão: 'primary' (mono primary roxo, sem quad)
 * Ver docs/brand-kit.html · seção 09 Downloads
 */

interface LogoProps {
  /** Renderiza apenas o símbolo (sem wordmark) */
  symbolOnly?: boolean
  /** Largura em px. Para wordmark default = 160; para symbolOnly default = 40 */
  width?: number
  /**
   * Variante de cor do logo:
   * - 'primary'    → glyph + word em roxo, sem quad (PADRÃO — uso em fundo claro)
   * - 'light'      → alias de 'primary' (compatibilidade)
   * - 'dark'       → glyph neon + word branco (sobre fundo escuro)
   * - 'mono-white' → tudo branco (sobre fundos coloridos / fotos)
   * - 'mono-ink'   → tudo ink (impressão p/b)
   * - 'quad-deep'  → quad deep + glyph neon (app icon style)
   */
  variant?: 'primary' | 'light' | 'dark' | 'mono-white' | 'mono-ink' | 'quad-deep'
  className?: string
}

/* ─── Paleta v5.0 ─── */
const COLORS = {
  primary: '#6C63FF',
  ink:     '#1A1A2E',
  deep:    '#2D2B55',
  neon:    '#C4F135',
  white:   '#FFFFFF',
}

interface VariantSpec {
  quad: string | null
  glyph: string
  word: string
}

const VARIANTS: Record<NonNullable<LogoProps['variant']>, VariantSpec> = {
  primary:      { quad: null,          glyph: COLORS.primary, word: COLORS.primary },
  light:        { quad: null,          glyph: COLORS.primary, word: COLORS.primary },
  dark:         { quad: null,          glyph: COLORS.neon,    word: COLORS.white   },
  'mono-white': { quad: null,          glyph: COLORS.white,   word: COLORS.white   },
  'mono-ink':   { quad: null,          glyph: COLORS.ink,     word: COLORS.ink     },
  'quad-deep':  { quad: COLORS.deep,   glyph: COLORS.neon,    word: COLORS.ink     },
}

/* ─── Glyph: 5 barras (Material graphic_eq) viewBox 24×24 ─── */
function GlyphBars({ fill }: { fill: string }) {
  return (
    <g fill={fill}>
      <rect x="3"  y="10" width="2" height="4"  rx="1" />
      <rect x="7"  y="5"  width="2" height="14" rx="1" />
      <rect x="11" y="2"  width="2" height="20" rx="1" />
      <rect x="15" y="5"  width="2" height="14" rx="1" />
      <rect x="19" y="10" width="2" height="4"  rx="1" />
    </g>
  )
}

export function Logo({ symbolOnly = false, width, variant = 'primary', className }: LogoProps) {
  const v = VARIANTS[variant]

  /* ── Símbolo isolado ── */
  if (symbolOnly) {
    const size = width ?? 40

    /* Sem quad: glyph ocupa todo o canvas (24×24 viewBox) */
    if (!v.quad) {
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-label="Evolua"
        >
          <GlyphBars fill={v.glyph} />
        </svg>
      )
    }

    /* Com quad: glyph centralizado a ~62% do quad */
    const quadSize = 64
    const glyphPct = 0.62
    const glyphSize = quadSize * glyphPct
    const offset = (quadSize - glyphSize) / 2
    const scale = glyphSize / 24

    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${quadSize} ${quadSize}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Evolua"
      >
        <rect width={quadSize} height={quadSize} fill={v.quad} />
        <g transform={`translate(${offset} ${offset}) scale(${scale})`}>
          <GlyphBars fill={v.glyph} />
        </g>
      </svg>
    )
  }

  /* ── Lockup horizontal (símbolo + EVOLUA) ── */
  // ViewBox 280×56. Símbolo glyph centralizado em x=4..52 (48px), wordmark começa em x=68
  const totalWidth = width ?? 160
  const totalHeight = Math.round(totalWidth * 56 / 280)

  // Glyph: 48px scaled de 24 → scale 2; centralizado verticalmente (y=4..52)
  const glyphScale = 48 / 24

  return (
    <svg
      width={totalWidth}
      height={totalHeight}
      viewBox="0 0 280 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Evolua"
    >
      {v.quad && <rect x="0" y="4" width="48" height="48" fill={v.quad} />}
      <g transform={`translate(${v.quad ? 12 : 4} ${v.quad ? 16 : 4}) scale(${v.quad ? 1 : glyphScale})`}>
        <GlyphBars fill={v.glyph} />
      </g>
      <text
        x="68"
        y="36"
        fontFamily="'Space Grotesk', sans-serif"
        fontSize="34"
        fontWeight="700"
        fill={v.word}
        letterSpacing="4.08"
        dominantBaseline="central"
      >
        EVOLUA
      </text>
    </svg>
  )
}
