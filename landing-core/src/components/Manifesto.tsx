/**
 * Manifesto — "Por que o Evolua existe"
 * Frases-chave destacadas com Highlighter ao fazer scroll.
 */
import { motion } from 'motion/react'
import { Highlighter } from './magicui/highlighter'

export function Manifesto() {
  return (
    <section className="py-20 md:py-28 px-5 md:px-12 bg-canvas">
      <div className="max-w-4xl mx-auto">
        <motion.span
          className="font-label text-[10px] font-bold tracking-[0.4em] uppercase text-primary mb-6 md:mb-8 block"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          Por que o Evolua existe
        </motion.span>

        <motion.p
          className="font-headline font-black text-xl md:text-2xl lg:text-3xl leading-[1.3] tracking-tighter text-ink"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Fonoaudiólogas passam{' '}
          <Highlighter color="#EAE8FF" delay={0.4}>
            metade do dia preenchendo sistemas
          </Highlighter>{' '}
          que nunca foram feitos para elas.{' '}
          <br className="hidden md:block" />
          O Evolua existe para{' '}
          <Highlighter color="#EAE8FF" delay={0.6}>
            devolver esse tempo.
          </Highlighter>
          <br className="hidden md:block" />
          Para que você possa ser{' '}
          <Highlighter color="#6C63FF" delay={0.8}>
            <span className="text-white">clínica</span>
          </Highlighter>
          , não assistente administrativa.{' '}
          <br className="hidden md:block" />
          Para que cada sessão seja sobre o{' '}
          <Highlighter color="#6C63FF" delay={1.0}>
            <span className="text-white">paciente</span>
          </Highlighter>{' '}
          — não sobre o sistema.
        </motion.p>
      </div>
    </section>
  )
}
