import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { LeadMagnetsGrid } from '../components/LeadMagnetCard'

export const Route = createFileRoute('/materiais')({
  component: MateriaisPage,
})

function MateriaisPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <section className="flex-1 px-5 md:px-12 py-20 md:py-32 bg-canvas">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mb-12"
          >
            <span className="font-label text-[10px] font-bold tracking-[0.4em] uppercase text-primary mb-4 block">
              Materiais Gratuitos
            </span>
            <h1 className="font-headline font-black text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter leading-[0.9] text-ink mb-6">
              Ferramentas para crescer<span className="text-primary">.</span>
            </h1>
            <p className="text-base md:text-lg text-ink-soft/80 max-w-2xl leading-relaxed">
              Checklists, planilhas e guias prontos para usar no seu consultório. Baixe grátis.
            </p>
          </motion.div>

          <LeadMagnetsGrid />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 p-8 bg-surface border border-outline-variant text-center"
          >
            <h2 className="font-headline font-bold text-2xl uppercase tracking-tight text-ink mb-4">
              Quer mais?
            </h2>
            <p className="text-ink-soft/80 mb-6 max-w-md mx-auto">
              Teste o Evolua grátis por 14 dias e tenha acesso a prontuário, IA, WhatsApp automático e muito mais.
            </p>
            <a
              href="/cadastro"
              className="inline-block bg-deep text-neon px-8 py-4 text-sm font-bold hover:bg-ink transition-colors"
            >
              Começar teste grátis
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
