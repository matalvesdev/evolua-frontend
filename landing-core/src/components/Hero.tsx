import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, useScroll, useTransform } from 'motion/react'
import { RainbowButton } from './magicui/rainbow-button'
import { AuroraText } from './magicui/aurora-text'

/* ─────────────────────────────────────────────
   TYPEWRITER — implementado do zero com a mesma
   lógica do componente Motion+ Typewriter:
   - cicla palavras com digitação natural
   - variância de velocidade por caractere
   - cursor piscante com blink CSS
   - acessível via aria-label no wrapper
───────────────────────────────────────────── */
const SPECIALTIES = [
  'voz',
  'disfagia',
  'linguagem',
  'motricidade orofacial',
  'audiologia',
  'fala',
]

function useTypewriter(words: string[], { typingMs = 90, deletingMs = 55, pauseMs = 1800 } = {}) {
  const [displayed, setDisplayed] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [phase, setPhase] = useState<'typing' | 'pausing' | 'deleting'>('typing')

  useEffect(() => {
    const target = words[wordIndex]

    if (phase === 'typing') {
      if (displayed.length < target.length) {
        const char = target[displayed.length]
        const isRare = ' ,.!?'.includes(char)
        const variance = isRare ? typingMs * 0.6 : typingMs * (0.7 + Math.random() * 0.6)
        const t = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), variance)
        return () => clearTimeout(t)
      } else {
        const t = setTimeout(() => setPhase('pausing'), pauseMs)
        return () => clearTimeout(t)
      }
    }

    if (phase === 'pausing') {
      const t = setTimeout(() => setPhase('deleting'), 200)
      return () => clearTimeout(t)
    }

    if (phase === 'deleting') {
      if (displayed.length > 0) {
        const t = setTimeout(
          () => setDisplayed((d) => d.slice(0, -1)),
          deletingMs * (0.8 + Math.random() * 0.4),
        )
        return () => clearTimeout(t)
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- avança palavra ao terminar deletion (animação typewriter)
        setWordIndex((i) => (i + 1) % words.length)
        setPhase('typing')
      }
    }
  }, [displayed, phase, wordIndex, words, typingMs, deletingMs, pauseMs])

  return displayed
}

/* ─────────────────────────────────────────────
   STAGGER VARIANTS
───────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0 },
}

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.13, delayChildren: 0.15 },
  },
}

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const glowScale   = useTransform(scrollYProgress, [0, 1], [1, 1.35])
  const glowOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const contentY      = useTransform(scrollYProgress, [0, 1], [0, -72])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])

  const specialtyText = useTypewriter(SPECIALTIES, { typingMs: 85, deletingMs: 50, pauseMs: 2000 })

  return (
    <section
      ref={sectionRef}
      className="relative px-5 md:px-12 pt-16 md:pt-24 pb-20 md:pb-32 bg-canvas overflow-hidden"
    >
      {/* ── Glows ── */}
      <motion.div
        className="pointer-events-none absolute -top-40 -left-20 w-[520px] h-[520px] rounded-full bg-lavender/60 blur-[140px]"
        style={{ scale: glowScale, opacity: glowOpacity }}
      />
      <motion.div
        className="pointer-events-none absolute -top-20 right-0 w-[340px] h-[340px] rounded-full bg-primary/10 blur-[120px]"
        style={{ scale: glowScale, opacity: glowOpacity }}
      />

      {/* ── Conteúdo ── */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative"
      >
        <motion.div
          className="max-w-7xl mx-auto text-center flex flex-col items-center"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.span
            variants={fadeUp}
            transition={{ type: 'spring', stiffness: 60, damping: 18 }}
            className="font-label text-[10px] font-bold tracking-[0.4em] uppercase text-primary mb-6 md:mb-10 block"
          >
            O primeiro software feito por fono, pra fono.
          </motion.span>

          {/* Headline com Typewriter inline */}
          <motion.h1
            variants={fadeUp}
            transition={{ type: 'spring', stiffness: 55, damping: 18 }}
            className="font-headline font-black text-[clamp(2.25rem,6.5vw,5.5rem)] leading-[0.88] tracking-tighter uppercase mb-8 md:mb-12 max-w-5xl text-ink"
          >
            Prontuário de{' '}
            <span
              className="inline-block text-primary min-w-[4ch] text-left"
              aria-label={`área: ${SPECIALTIES[0]}`}
              aria-live="polite"
            >
              {specialtyText}
              <motion.span
                aria-hidden
                className="inline-block w-[3px] h-[0.85em] bg-primary ml-[2px] align-middle relative top-[-0.06em]"
                animate={{ opacity: [1, 1, 0, 0] }}
                transition={{ duration: 1, repeat: Infinity, times: [0, 0.45, 0.5, 0.95] }}
              />
            </span>
            {'. '}
            <br className="hidden sm:block" />
            Agenda,{' '}
            {/* AuroraText na palavra que carrega inovação */}
            <AuroraText className="font-black text-[clamp(2.25rem,6.5vw,5.5rem)] leading-[0.88] tracking-tighter uppercase">
              IA
            </AuroraText>
            {' '}e financeiro num lugar só
            <span className="text-primary">.</span>
          </motion.h1>

          <motion.h3
            variants={fadeUp}
            transition={{ type: 'spring', stiffness: 55, damping: 18 }}
            className="font-body font-medium leading-relaxed mb-10 md:mb-14 w-full text-center text-sm md:text-base max-w-lg text-ink-soft px-2"
          >
            Enquanto você atende, o Evolua confirma consultas, escreve relatórios com IA e organiza o financeiro —{' '}
            <span className="text-ink font-bold">com protocolos nativos de fonoaudiologia.</span>
          </motion.h3>

          <motion.div
            variants={fadeUp}
            transition={{ type: 'spring', stiffness: 55, damping: 18 }}
            className="flex flex-col sm:flex-row gap-3 items-center justify-center w-full max-w-lg px-0"
          >
            {/* RainbowButton para o CTA principal */}
            <Link to="/cadastro" className="w-full sm:flex-1">
              <RainbowButton className="w-full text-sm py-4 md:py-5 px-8 shadow-lg shadow-primary/20">
                Testar grátis por 14 dias
              </RainbowButton>
            </Link>
            <Link
              to="/planos"
              className="border-2 border-lavender-mid text-ink-soft px-8 py-4 md:py-5 btn-text hover:border-primary hover:text-primary transition-all duration-300 text-sm w-full sm:w-auto sm:whitespace-nowrap text-center"
            >
              Ver planos e preços
            </Link>
          </motion.div>

          <motion.p
            variants={fadeUp}
            transition={{ type: 'spring', stiffness: 55, damping: 18 }}
            className="mt-5 text-[10px] font-bold tracking-[0.2em] uppercase text-muted"
          >
            Sem cartão de crédito · Sem fidelidade · Cancela quando quiser
          </motion.p>
        </motion.div>
      </motion.div>
    </section>
  )
}
