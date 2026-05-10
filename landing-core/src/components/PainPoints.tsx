import { motion } from 'motion/react'
import { Highlighter } from './magicui/highlighter'

const pains = [
  {
    icon: 'edit_note',
    title: 'Prontuário que não entende você',
    description:
      'iClinic, Ninsaude, todos os outros são feitos pra médico. Você recria MBGR, DOSS e GRBAS do zero em campo de texto livre. Toda semana.',
  },
  {
    icon: 'event_busy',
    title: 'Faltas que sangram o caixa',
    description:
      'Sem confirmação automática, você liga uma por uma. O paciente some, a sessão vai pro lixo — e você ainda paga pelo horário.',
  },
  {
    icon: 'description',
    title: 'Relatório leva mais tempo que a sessão',
    description:
      'Laudo pro convênio, relatório de evolução pra escola, parecer pro médico. Cada um num modelo diferente, copiado de documento em documento.',
  },
  {
    icon: 'account_balance_wallet',
    title: 'Financeiro numa planilha de 2015',
    description:
      'Pix, convênio, particular — tudo misturado. No fim do mês você não sabe quanto realmente entrou, nem quanto o plano de saúde deve.',
  },
]

const springBase = { type: 'spring', stiffness: 50, damping: 18 } as const
const springFast = { type: 'spring', stiffness: 60, damping: 20 } as const

const slideLeft = {
  hidden: { opacity: 0, x: -40 },
  show:   { opacity: 1, x: 0,  transition: springBase },
}

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0,  transition: springBase },
}

const painItem = {
  hidden: { opacity: 0, x: -20 },
  show:   { opacity: 1, x: 0,  transition: springFast },
}

const painContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.2 } },
}

export function PainPoints() {
  return (
    <section className="py-20 md:py-32 px-5 md:px-12 bg-surface-low">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 lg:gap-16">

          {/* Card esquerdo */}
          <motion.div
            className="md:col-span-7 bg-surface border border-outline-variant p-6 md:p-10 lg:p-14 flex flex-col justify-between gap-10 md:gap-0"
            variants={slideLeft}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div>
              {/* Highlighter destaca a frase-chave da dor */}
              <h2 className="font-headline font-bold tracking-tighter uppercase leading-[0.95] mb-6 text-3xl md:text-4xl lg:text-5xl text-ink">
                Software genérico não foi feito{' '}
                <Highlighter color="#EAE8FF" delay={0.5}>
                  pra fonoaudiologia
                </Highlighter>
                <span className="text-primary">.</span>
              </h2>
              <p className="text-ink-soft/80 text-sm md:text-base leading-relaxed mb-8 md:mb-16 max-w-lg">
                Você é fono — não médica, não fisio. Mas o mercado continua te vendendo a mesma ferramenta de sempre.
              </p>
            </div>

            {/* Pains em stagger */}
            <motion.div
              className="space-y-8 md:space-y-12"
              variants={painContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
            >
              {pains.map((pain) => (
                <motion.div key={pain.title} className="flex items-start gap-5 md:gap-8" variants={painItem}>
                  <span className="material-symbols-outlined text-rose text-2xl md:text-3xl mt-0.5 shrink-0">
                    {pain.icon}
                  </span>
                  <div>
                    <h4 className="font-headline font-bold uppercase tracking-tight mb-1 md:mb-2 text-sm md:text-base text-ink">
                      {pain.title}
                    </h4>
                    <p className="text-ink-soft/80 leading-relaxed text-sm md:text-base">
                      {pain.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Cards direita */}
          <div className="md:col-span-5 flex flex-col gap-6 md:gap-12">
            <motion.div
              className="bg-primary text-white p-8 md:p-10 flex flex-col justify-between gap-6 min-h-[200px] md:min-h-[240px]"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
            >
              <div className="text-3xl md:text-4xl font-headline font-black tracking-tighter leading-none">
                ~75 MIL
                <br />
                FONOS
              </div>
              <p className="font-label uppercase tracking-[0.2em] text-[10px] font-bold text-lavender-mid">
                registradas no Brasil. Nenhum software especializado consolidado para elas. Até agora.
              </p>
            </motion.div>

            <motion.div
              className="bg-lavender border border-outline-variant p-8 md:p-10 flex flex-col justify-between gap-6 min-h-[200px] md:min-h-[240px]"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.15 }}
            >
              <div className="text-3xl md:text-4xl font-headline font-black tracking-tighter text-ink leading-none">
                FEITO
                <br />
                PRA VOCÊ
              </div>
              <p className="font-label uppercase tracking-[0.2em] text-[10px] font-bold text-ink-soft/60">
                O Evolua não foi adaptado de outro sistema. Foi construído do zero para fonoaudiólogas — com protocolos, escalas e fluxos que você já conhece.
              </p>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
