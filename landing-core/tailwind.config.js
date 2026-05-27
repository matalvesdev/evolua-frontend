import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // ── Paleta Evolua v5.0 — Serena & Clínica ───────────────────
        //
        // Filosofia: violeta suave como cor-guia, lavanda como "ar",
        // fundo off-white com toque azulado para bem-estar visual,
        // dark section em roxo profundo (não preto absoluto).

        // Superfícies
        'canvas':         '#F8F8FF',   // fundo base da página
        'surface':        '#FFFFFF',   // cards, navbar, modais
        'surface-low':    '#F0EFF9',   // seções alternadas (lavanda levíssima)

        // Primário — Violeta
        'primary':        '#6C63FF',   // CTA principal, links ativos
        'primary-dark':   '#5650D4',   // hover de botões
        'primary-light':  '#8B85FF',   // estados desabilitados, ícones secundários

        // Lavanda — "ar" da marca
        'lavender':       '#EAE8FF',   // bg de seções, badges, chips
        'lavender-mid':   '#C5C1FF',   // bordas ativas, divisores highlight
        'lavender-deep':  '#9D97F5',   // ícones médios, sub-accents

        // Ink — tipografia
        'ink':            '#1A1A2E',   // headlines, corpo de texto (quase-preto violáceo)
        'ink-soft':       '#4A4A6A',   // subtítulos, texto auxiliar
        'muted':          '#8888AA',   // labels, placeholders, texto terciário

        // Deep — seção escura (não preto absoluto, mantém o tom lavanda)
        'deep':           '#2D2B55',   // fundo de seções de contraste
        'deep-mid':       '#3D3A6B',   // cards sobre fundo deep, hover
        'deep-light':     '#514E85',   // bordas sobre deep

        // Utilidades
        'neon':           '#C4F135',   // CTA sobre fundo escuro (contraste 12:1)
        'rose':           '#FB7185',   // urgência, erros, alertas

        // ── Aliases semânticos (compatibilidade com JSX existente) ───
        'primary-container':    '#EAE8FF',
        'on-primary':           '#FFFFFF',
        'on-primary-container': '#4A4A6A',
        'on-primary-fixed':     '#1A1A2E',
        'on-surface':           '#1A1A2E',
        'on-surface-variant':   '#4A4A6A',
        'outline-variant':      '#E0DFEF',
        'outline':              '#C5C1FF',
        'surface-container':         '#F0EFF9',
        'surface-container-low':     '#F8F8FF',
        'surface-container-high':    '#EAE8FF',
        'surface-container-lowest':  '#FFFFFF',
        'surface-container-highest': '#D9D7F5',
        'inverse-surface':      '#1A1A2E',
        'inverse-on-surface':   '#F8F8FF',

        // Semântico
        error:                  '#BA1A1A',
        'error-container':      '#FFDAD6',
        'on-error-container':   '#93000A',
      },
      borderRadius: {
        DEFAULT: '0.25rem',   // 4px — levemente mais suave que v4
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      fontFamily: {
        headline: ['"Space Grotesk"', 'sans-serif'],
        body:     ['"DM Sans"', 'sans-serif'],
        label:    ['"DM Sans"', 'sans-serif'],
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
      },
      typography: ({ theme }) => ({
        evolua: {
          css: {
            '--tw-prose-body': theme('colors.ink-soft'),
            '--tw-prose-headings': theme('colors.ink'),
            '--tw-prose-lead': theme('colors.ink-soft'),
            '--tw-prose-links': theme('colors.primary'),
            '--tw-prose-bold': theme('colors.ink'),
            '--tw-prose-counters': theme('colors.muted'),
            '--tw-prose-bullets': theme('colors.lavender-deep'),
            '--tw-prose-hr': theme('colors.outline-variant'),
            '--tw-prose-quotes': theme('colors.ink'),
            '--tw-prose-quote-borders': theme('colors.primary'),
            '--tw-prose-captions': theme('colors.muted'),
            '--tw-prose-code': theme('colors.primary-dark'),
            '--tw-prose-pre-code': theme('colors.canvas'),
            '--tw-prose-pre-bg': theme('colors.deep'),
            '--tw-prose-th-borders': theme('colors.outline-variant'),
            '--tw-prose-td-borders': theme('colors.outline-variant'),
            fontFamily: theme('fontFamily.body').join(', '),
            h1: { fontFamily: theme('fontFamily.headline').join(', '), fontWeight: '700', letterSpacing: '-0.02em' },
            h2: { fontFamily: theme('fontFamily.headline').join(', '), fontWeight: '700', letterSpacing: '-0.015em', marginTop: '2.5em', marginBottom: '0.75em' },
            h3: { fontFamily: theme('fontFamily.headline').join(', '), fontWeight: '600', letterSpacing: '-0.01em', marginTop: '2em', marginBottom: '0.5em' },
            h4: { fontFamily: theme('fontFamily.headline').join(', '), fontWeight: '600' },
            p: { lineHeight: '1.75' },
            a: { fontWeight: '500', textDecoration: 'underline', textDecorationThickness: '1px', textUnderlineOffset: '3px', '&:hover': { color: theme('colors.primary-dark') } },
            'blockquote p:first-of-type::before': { content: 'none' },
            'blockquote p:last-of-type::after': { content: 'none' },
            blockquote: { fontStyle: 'normal', borderLeftWidth: '3px', paddingLeft: '1.25rem', fontWeight: '500' },
            code: { fontWeight: '500', backgroundColor: theme('colors.lavender'), padding: '0.15em 0.4em', borderRadius: '0.25rem', '&::before': { content: 'none' }, '&::after': { content: 'none' } },
            'pre code': { backgroundColor: 'transparent', padding: '0' },
            img: { borderRadius: '0.5rem' },
            hr: { marginTop: '3em', marginBottom: '3em' },
          },
        },
      }),
    },
  },
  plugins: [typography],
}
