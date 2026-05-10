import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { RainbowButton } from './magicui/rainbow-button'

export function BottomCTA() {
  return (
    <section className="py-20 md:py-28 px-5 md:px-12 bg-primary text-white text-center relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[300px] rounded-full bg-primary-dark/40 blur-[120px]" />
      </div>

      <div className="relative">
        <motion.h2
          className="font-headline font-black text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter mb-10 md:mb-16 leading-[0.9]"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ type: 'spring', stiffness: 50, damping: 18 }}
        >
          CUIDE DE VOCÊ
          <br />
          TAMBÉM<span className="text-neon">.</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ type: 'spring', stiffness: 50, damping: 18, delay: 0.18 }}
          className="inline-block w-full sm:w-auto"
        >
          {/* Sobre fundo primary, botão branco com shimmer lavanda */}
          <Link to="/cadastro" className="inline-block w-full sm:w-auto">
            <RainbowButton
              className="w-full sm:w-auto sm:min-w-[340px] text-sm md:text-base rainbow-button-on-dark !text-ink"
            >
              Começar grátis por 14 dias
            </RainbowButton>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
