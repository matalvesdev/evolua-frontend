import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'

export const Route = createFileRoute('/sobre')({
  component: SobrePage,
})

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
}

const equipe = [
  {
    nome: 'Mateus Bassane',
    papel: 'CEO & Co-fundador',
    bio: 'Engenheiro de software apaixonado por healthtech. Passou anos vendo fonoaudiólogas sofrerem com sistemas que não foram feitos para elas — e decidiu mudar isso.',
  },
  {
    nome: 'Time de Produto',
    papel: 'Produto & Design',
    bio: 'UX researchers que vivem nas clínicas. Cada tela foi testada com fonoaudiólogas reais antes de ir ao ar.',
  },
  {
    nome: 'Suporte Humano',
    papel: 'Customer Experience',
    bio: 'Pessoas reais que respondem de verdade. Sem script, sem bot, sem ligação de 40 minutos em espera.',
  },
]

function SobrePage() {
  return (
    <>
      {/* Hero */}
      <section className="px-5 md:px-12 pt-16 md:pt-24 pb-20 md:pb-32 bg-canvas">
        <div className="max-w-7xl mx-auto">
          <motion.span
            variants={fadeUp} initial="hidden" animate="visible"
            className="font-label text-[10px] font-bold tracking-[0.4em] uppercase text-primary mb-6 md:mb-10 block"
          >
            Sobre o Evolua
          </motion.span>
          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible"
            transition={{ delay: 0.08 }}
            className="font-headline font-black text-[clamp(2rem,5vw,4rem)] leading-[0.9] tracking-tighter uppercase mb-8 md:mb-12 max-w-4xl text-ink"
          >
            Construído por quem ama o que fonoaudiólogas fazem<span className="text-primary">.</span>
          </motion.h1>
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible"
            transition={{ delay: 0.18 }}
            className="text-base md:text-lg text-ink-soft/80 max-w-2xl leading-relaxed"
          >
            O Evolua nasceu de uma pergunta simples: por que um sistema para uma das profissões mais humanas do mundo é tão frio, tão complicado e tão pouco útil?
          </motion.p>
        </div>
      </section>

      {/* História */}
      <section className="py-20 md:py-32 px-5 md:px-12 bg-surface-low">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20 items-start">
          <motion.div
            initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
            className="md:col-span-5"
          >
            <h2 className="font-headline font-black text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter leading-[0.9] text-ink">
              A história<span className="text-primary">.</span>
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] as const }}
            className="md:col-span-7 space-y-6 text-ink-soft/80 text-base md:text-lg leading-relaxed"
          >
            <p>
              Em 2023, depois de centenas de conversas com fonoaudiólogas em todo o Brasil, ficou claro que o problema não era a profissional — era o sistema. Prontuários copiados do médico. Agendas que não entendem de remarcação. Relatórios escritos à mão às 23h.
            </p>
            <p>
              A gente decidiu recomeçar do zero. Do zero mesmo — nenhum software adaptado, nenhuma gambiarra. O Evolua foi construído especificamente para fonoaudióloga, com protocolos clínicos validados, IA que entende sessão de fono, e automações que realmente fazem sentido no dia a dia clínico.
            </p>
            <p className="font-headline font-black text-xl text-ink tracking-tight">
              "Menos papelada. Mais pacientes. Mais você."
            </p>
          </motion.div>
        </div>
      </section>

      {/* Equipe */}
      <section className="py-20 md:py-32 px-5 md:px-12 bg-canvas">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }}
            className="font-headline font-black text-3xl md:text-4xl lg:text-5xl uppercase tracking-tighter mb-16 md:mb-24 leading-[0.9] text-ink"
          >
            As pessoas por trás<span className="text-primary">.</span>
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-outline-variant">
            {equipe.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const }}
                className="bg-canvas p-8 md:p-12 lg:p-16"
              >
                <div className="w-12 h-12 bg-lavender flex items-center justify-center mb-6">
                  <span className="font-headline font-black text-primary text-lg">
                    {p.nome.charAt(0)}
                  </span>
                </div>
                <h3 className="font-headline font-bold text-lg md:text-xl uppercase tracking-tight text-ink mb-1">{p.nome}</h3>
                <p className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-primary mb-4">{p.papel}</p>
                <p className="text-ink-soft/80 text-sm md:text-base leading-relaxed">{p.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Números */}
      <section className="py-20 md:py-32 px-5 md:px-12 bg-deep text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-deep-light/30">
          {[
            { numero: '2023', label: 'Fundado' },
            { numero: '14', label: 'Dias de trial grátis' },
            { numero: '100%', label: 'Foco em fono' },
            { numero: '∞', label: 'Suporte sem script' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-deep p-8 md:p-12 lg:p-16 text-center"
            >
              <div className="font-headline font-black text-4xl md:text-5xl lg:text-6xl tracking-tighter text-white mb-2">
                {item.numero}
              </div>
              <div className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-lavender-mid">
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  )
}
