import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Suspense } from 'react'
import { motion } from 'motion/react'
import { changelogQueryOptions } from '../queries/changelog'
import { CHANGELOG_TIPO_COLOR, type ChangelogEntry } from '../lib/changelog'

export const Route = createFileRoute('/changelog')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(changelogQueryOptions()),
  component: ChangelogPage,
})

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
}

function formatDataPt(data: string) {
  // data vem como YYYY-MM-DD
  const [y, m] = data.split('-')
  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  return `${meses[Number(m) - 1] ?? ''} de ${y}`
}

function EntriesList() {
  const { data: entries } = useSuspenseQuery(changelogQueryOptions())

  if (entries.length === 0) {
    return (
      <div className="text-center py-20">
        <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 block">
          rocket_launch
        </span>
        <p className="font-headline font-bold text-xl uppercase tracking-tight text-ink-soft/80">
          Em breve — primeira entrada chegando.
        </p>
        <p className="text-ink-soft/70 text-sm mt-3">
          Estamos terminando os primeiros lançamentos. Volte daqui a pouco.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-0 divide-y divide-outline-variant">
      {entries.map((entry: ChangelogEntry, i: number) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: Math.min(i * 0.04, 0.2), ease: [0.22, 1, 0.36, 1] as const }}
          className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12"
        >
          <div className="md:col-span-3">
            <div className="font-headline font-black text-2xl md:text-3xl tracking-tighter text-ink mb-1">
              {entry.versao}
            </div>
            <div className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-muted mb-3">
              {formatDataPt(entry.data)}
            </div>
            <span
              className={`inline-block font-label text-[9px] font-bold tracking-[0.25em] uppercase px-3 py-1.5 ${
                CHANGELOG_TIPO_COLOR[entry.tipo] ?? 'bg-surface text-ink'
              }`}
            >
              {entry.tipo}
            </span>
          </div>
          <div className="md:col-span-9">
            <h2 className="font-headline font-bold text-xl md:text-2xl uppercase tracking-tight text-ink mb-3 leading-tight">
              {entry.titulo}
            </h2>
            {entry.descricao && (
              <p className="text-ink-soft/80 text-sm md:text-base leading-relaxed mb-6">
                {entry.descricao}
              </p>
            )}
            {entry.itens.length > 0 && (
              <ul className="space-y-2">
                {entry.itens.map((item, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-sm mt-0.5 shrink-0">
                      check_circle
                    </span>
                    <span className="text-ink-soft/80 text-sm leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function EntriesSkeleton() {
  return (
    <div className="space-y-0 divide-y divide-outline-variant">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 animate-pulse">
          <div className="md:col-span-3 space-y-3">
            <div className="h-8 w-24 bg-outline-variant" />
            <div className="h-3 w-32 bg-outline-variant" />
            <div className="h-6 w-20 bg-outline-variant" />
          </div>
          <div className="md:col-span-9 space-y-3">
            <div className="h-6 w-3/4 bg-outline-variant" />
            <div className="h-4 w-full bg-outline-variant" />
            <div className="h-4 w-5/6 bg-outline-variant" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ChangelogPage() {
  return (
    <>
      {/* Hero */}
      <section className="px-5 md:px-12 pt-16 md:pt-24 pb-16 md:pb-24 bg-canvas">
        <div className="max-w-7xl mx-auto">
          <motion.span
            variants={fadeUp} initial="hidden" animate="visible"
            className="font-label text-[10px] font-bold tracking-[0.4em] uppercase text-primary mb-6 md:mb-10 block"
          >
            Novidades
          </motion.span>
          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible"
            transition={{ delay: 0.08 }}
            className="font-headline font-black text-[clamp(2rem,5vw,4rem)] leading-[0.9] tracking-tighter uppercase mb-6 md:mb-10 max-w-3xl text-ink"
          >
            O que tem de novo no Evolua<span className="text-primary">.</span>
          </motion.h1>
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible"
            transition={{ delay: 0.16 }}
            className="text-sm md:text-base text-ink-soft/80 max-w-xl leading-relaxed"
          >
            A gente lança melhorias toda semana. Aqui fica o registro do que mudou, por que mudou e o que vem por aí.
          </motion.p>
        </div>
      </section>

      {/* Entries */}
      <section className="px-5 md:px-12 pb-20 md:pb-32 bg-canvas">
        <div className="max-w-4xl mx-auto">
          <Suspense fallback={<EntriesSkeleton />}>
            <EntriesList />
          </Suspense>
        </div>
      </section>
    </>
  )
}
