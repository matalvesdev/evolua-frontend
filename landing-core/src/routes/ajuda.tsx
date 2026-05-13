import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Suspense, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import DOMPurify from 'dompurify'
import { faqQueryOptions } from '../queries/faq'
import { groupByCategoria, type FaqCategoria } from '../lib/faq'

export const Route = createFileRoute('/ajuda')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(faqQueryOptions()),
  component: AjudaPage,
})

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

const CATEGORIAS_TODAS: ('Todas' | FaqCategoria)[] = [
  'Todas', 'Conta', 'Planos', 'Pagamento', 'Clínica', 'Pacientes', 'Segurança', 'IA', 'Integrações', 'Outros',
]

function FaqList({ categoria, busca }: { categoria: 'Todas' | FaqCategoria; busca: string }) {
  const { data: items } = useSuspenseQuery(faqQueryOptions())

  const filtered = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return items.filter((item) => {
      if (categoria !== 'Todas' && item.categoria !== categoria) return false
      if (!q) return true
      return (
        item.pergunta.toLowerCase().includes(q) ||
        item.resposta.toLowerCase().includes(q)
      )
    })
  }, [items, categoria, busca])

  const grouped = groupByCategoria(filtered)

  if (filtered.length === 0) {
    return (
      <div className="text-center py-20">
        <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 block">
          search_off
        </span>
        <p className="font-headline font-bold text-xl uppercase tracking-tight text-ink-soft/80">
          Nada encontrado.
        </p>
        <p className="text-ink-soft/70 text-sm mt-3">
          Não achou o que procurava?{' '}
          <Link to="/contato" className="text-primary font-bold hover:underline">
            Fala com a gente
          </Link>.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-16">
      {grouped.map(({ categoria: cat, itens }) => (
        <div key={cat}>
          <h2 className="font-headline font-black text-xl md:text-2xl uppercase tracking-tighter text-ink mb-6 pb-3 border-b border-outline-variant">
            {cat}
          </h2>
          <div className="divide-y divide-outline-variant">
            {itens.map((item) => (
              <FaqAccordion key={item.id} pergunta={item.pergunta} resposta={item.resposta} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function FaqAccordion({ pergunta, resposta }: { pergunta: string; resposta: string }) {
  const [open, setOpen] = useState(false)
  const respostaSafe = useMemo(() => DOMPurify.sanitize(resposta), [resposta])

  return (
    <div className="py-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-6 text-left group"
      >
        <span className="font-headline font-bold text-base md:text-lg text-ink group-hover:text-primary transition-colors">
          {pergunta}
        </span>
        <span
          className={`material-symbols-outlined text-2xl text-muted shrink-0 transition-transform duration-300 ${
            open ? 'rotate-45' : ''
          }`}
        >
          add
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
            className="overflow-hidden"
          >
            <div
              className="pt-4 pr-10 text-ink-soft/80 text-sm md:text-base leading-relaxed [&_a]:text-primary [&_a]:underline [&_strong]:text-ink [&_p]:mb-3 last:[&_p]:mb-0"
              dangerouslySetInnerHTML={{ __html: respostaSafe }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FaqSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="py-5 border-b border-outline-variant animate-pulse">
          <div className="h-5 w-3/4 bg-outline-variant" />
        </div>
      ))}
    </div>
  )
}

function AjudaPage() {
  const [categoria, setCategoria] = useState<'Todas' | FaqCategoria>('Todas')
  const [busca, setBusca] = useState('')

  return (
    <>
      {/* Hero */}
      <section className="px-5 md:px-12 pt-16 md:pt-24 pb-10 md:pb-16 bg-canvas">
        <div className="max-w-7xl mx-auto">
          <motion.span
            variants={fadeUp} initial="hidden" animate="visible"
            className="font-label text-[10px] font-bold tracking-[0.4em] uppercase text-primary mb-6 md:mb-10 block"
          >
            Central de ajuda
          </motion.span>
          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible"
            transition={{ delay: 0.08 }}
            className="font-headline font-black text-[clamp(2rem,5vw,4rem)] leading-[0.9] tracking-tighter uppercase mb-6 md:mb-10 max-w-3xl text-ink"
          >
            Tudo o que você precisa saber<span className="text-primary">.</span>
          </motion.h1>
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible"
            transition={{ delay: 0.16 }}
            className="relative max-w-2xl"
          >
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
              search
            </span>
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar dúvida..."
              aria-label="Pesquisar na central de ajuda"
              className="w-full pl-12 pr-4 py-4 bg-surface text-ink font-body text-base border border-outline-variant focus:outline-none focus:border-primary transition-colors"
            />
          </motion.div>
        </div>
      </section>

      {/* Filtros */}
      <section className="px-5 md:px-12 pb-10 md:pb-16 bg-canvas/90 backdrop-blur-xl sticky top-20 md:top-24 z-30 border-b border-outline-variant">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIAS_TODAS.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoria(cat)}
                className={`shrink-0 px-4 md:px-6 py-2 md:py-2.5 btn-text text-[10px] md:text-xs transition-all duration-200 ${
                  categoria === cat
                    ? 'bg-primary text-white'
                    : 'bg-surface border border-outline-variant text-muted hover:border-primary hover:text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* List */}
      <section className="px-5 md:px-12 py-10 md:py-16 bg-canvas">
        <div className="max-w-4xl mx-auto">
          <Suspense fallback={<FaqSkeleton />}>
            <FaqList categoria={categoria} busca={busca} />
          </Suspense>
        </div>
      </section>

      {/* CTA Contato */}
      <section className="py-20 md:py-32 px-5 md:px-12 bg-deep text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-headline font-black text-3xl md:text-4xl lg:text-5xl uppercase tracking-tighter leading-[0.9] mb-6">
            Não achou o que procurava<span className="text-neon">?</span>
          </h2>
          <p className="text-lavender-mid text-sm md:text-base leading-relaxed mb-10">
            Pessoa de verdade respondendo em até 1 dia útil. Sem bot, sem fila, sem script.
          </p>
          <Link
            to="/contato"
            className="inline-block bg-neon text-ink px-10 py-5 btn-text text-sm hover:scale-95 transition-all duration-200"
          >
            Falar com a gente
          </Link>
        </div>
      </section>
    </>
  )
}
