import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'

export const Route = createFileRoute('/nosso-jeito')({
  component: NossoJeitoPage,
})

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const slideLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
}

const valores = [
  {
    numero: '01',
    titulo: 'Gente primeiro',
    descricao:
      'Cada funcionalidade que construímos começa com uma pergunta: isso vai tornar a vida da fonoaudióloga mais leve? Se a resposta for não, a gente não faz.',
    icon: 'favorite',
  },
  {
    numero: '02',
    titulo: 'Tecnologia que abraça',
    descricao:
      'Nada de interface fria e complicada. A gente acredita que tecnologia boa é aquela que some — você nem percebe que está lá, só sente os resultados.',
    icon: 'psychology',
  },
  {
    numero: '03',
    titulo: 'Crescimento de verdade',
    descricao:
      'Não queremos só que você use o sistema. Queremos que daqui a um ano você olhe para trás e pense: "nossa, como eu cresci".',
    icon: 'trending_up',
  },
  {
    numero: '04',
    titulo: 'Transparência sempre',
    descricao:
      'Sem letras miúdas, sem surpresas no boleto. A gente fala a verdade, mesmo quando não é o que você quer ouvir — porque respeito é a base de tudo.',
    icon: 'visibility',
  },
]

const diferenciais = [
  {
    titulo: 'Criado por quem entende de fono',
    descricao:
      'O Evolua nasceu depois de centenas de conversas com fonoaudiólogas reais. Cada protocolo, cada tela, cada automação foi desenhada para o fluxo clínico de fono — não adaptada de software médico genérico.',
  },
  {
    titulo: 'Suporte que parece amizade',
    descricao:
      'Sabe aquela sensação de ligar pra um call center e ficar 40 minutos esperando? Aqui é o oposto. A gente responde de verdade, rápido, sem script.',
  },
  {
    titulo: 'Evolui junto com você',
    descricao:
      'O produto muda todo mês. Não porque precisamos lançar feature — mas porque ouvimos você e melhoramos o que dói. Você cresce, a gente cresce junto.',
  },
]

function NossoJeitoPage() {
  return (
    <>
      {/* Hero */}
      <section className="px-5 md:px-12 pt-16 md:pt-24 pb-20 md:pb-32 bg-canvas">
        <div className="max-w-7xl mx-auto">
          <motion.span
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-label text-[10px] font-bold tracking-[0.4em] uppercase text-primary mb-6 md:mb-10 block"
          >
            Quem somos nós
          </motion.span>
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.08 }}
            className="font-headline font-black text-[clamp(2rem,5vw,4rem)] leading-[0.9] tracking-tighter uppercase mb-8 md:mb-12 max-w-4xl text-ink"
          >
            A gente acredita que cuidar de pessoas é a profissão mais bonita do mundo<span className="text-primary">.</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.18 }}
            className="text-base md:text-lg text-ink-soft/80 max-w-2xl leading-relaxed"
          >
            E quem cuida de pessoas merece ser cuidado também. O Evolua nasceu disso — da vontade de deixar a vida das fonoaudiólogas mais leve, mais próspera e mais com propósito.
          </motion.p>
        </div>
      </section>

      {/* Marquee decorativo */}
      <section className="bg-primary overflow-hidden py-8 md:py-12">
        <div className="flex">
          {[0, 1].map((t) => (
            <div key={t} className="flex animate-marquee shrink-0 items-center" aria-hidden={t === 1}>
              {['NOSSO JEITO', 'COM CARINHO', 'TECNOLOGIA QUE ABRAÇA', 'GENTE DE VERDADE', 'FEITO PRA VOCÊ'].map((item, i) => (
                <span key={i} className="text-white font-headline font-black text-xl md:text-2xl px-8 md:px-12 tracking-tight whitespace-nowrap">
                  {item} •
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Manifesto */}
      <section className="py-20 md:py-32 px-5 md:px-12 bg-surface-low">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20 items-start">
            <motion.div
              variants={slideLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="md:col-span-5"
            >
              <h2 className="font-headline font-black text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter leading-[0.9] mb-8 md:mb-0 text-ink">
                Por que o Evolua existe<span className="text-primary">.</span>
              </h2>
            </motion.div>
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="md:col-span-7 space-y-6 md:space-y-8"
            >
              {[
                { weight: 'font-medium', text: 'Era uma vez uma fonoaudióloga incrível — talentosa, dedicada, apaixonada pelo que fazia. Mas no fim do dia, ela chegava em casa exausta. Não pelo atendimento. Pelo resto.' },
                { weight: '', text: 'Pelo paciente que sumiu sem avisar. Pela agenda buraco que faz o mês não fechar. Pela pilha de prontuários genéricos que foram feitos para médico — e que nunca encaixam nos protocolos clínicos de fono. Pela sessão inteira que ela precisou anotar à mão e depois transformar em relatório às 23h.' },
                { weight: '', text: 'A gente criou o Evolua porque essa história se repetia demais. E porque acreditamos que a profissional que escolheu cuidar da fala, da voz e da comunicação das pessoas merece usar sua energia onde realmente importa — no atendimento.' },
                { weight: '', text: 'Por isso construímos o único software com prontuário nativo para fono, protocolos clínicos validados (MBGR, DOSS, FOIS, GRBAS e mais), IA que grava a sessão e gera o rascunho do relatório automaticamente, e app do paciente com exercícios domiciliares. Tudo em um lugar só. Sem adaptação. Sem gambiarra.' },
              ].map((p, i) => (
                <motion.p key={i} variants={fadeUp} className={`text-base md:text-lg ${p.weight ? `text-ink ${p.weight}` : 'text-ink-soft/80'} leading-relaxed`}>
                  {p.text}
                </motion.p>
              ))}
              <motion.div variants={fadeUp} className="pt-4">
                <p className="font-headline font-black text-xl md:text-2xl tracking-tight text-ink">
                  "Menos papelada. Mais pacientes. Mais você."
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-20 md:py-32 px-5 md:px-12 bg-canvas">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="font-headline font-black text-3xl md:text-4xl lg:text-5xl uppercase tracking-tighter mb-16 md:mb-24 leading-[0.9] text-ink"
          >
            O que nos move<span className="text-primary">.</span>
          </motion.h2>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-outline-variant"
          >
            {valores.map((v) => (
              <motion.div
                key={v.numero}
                variants={fadeUp}
                className="bg-canvas p-8 md:p-12 lg:p-16 group hover:bg-surface-low transition-colors duration-300"
              >
                <div className="flex items-start gap-5 md:gap-8 mb-6 md:mb-8">
                  <span className="font-headline font-black text-3xl md:text-4xl text-outline-variant leading-none">{v.numero}</span>
                  <span className="material-symbols-outlined text-primary text-2xl md:text-3xl mt-1 group-hover:scale-110 transition-transform">{v.icon}</span>
                </div>
                <h3 className="font-headline font-bold text-lg md:text-xl uppercase tracking-tight mb-4 text-ink">{v.titulo}</h3>
                <p className="text-ink-soft/80 text-sm md:text-base leading-relaxed">{v.descricao}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-20 md:py-32 px-5 md:px-12 bg-deep text-white">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="font-headline font-black text-3xl md:text-4xl lg:text-5xl uppercase tracking-tighter mb-16 md:mb-24 leading-[0.9]"
          >
            O que faz a gente diferente<span className="text-neon">.</span>
          </motion.h2>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-px bg-deep-light/30"
          >
            {diferenciais.map((d, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="p-8 md:p-12 lg:p-16 bg-deep hover:bg-deep-mid transition-colors group"
              >
                <div className="text-4xl md:text-5xl font-headline font-black text-white/5 leading-none mb-6">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="font-headline font-bold text-base md:text-lg uppercase tracking-tight mb-4 text-white">{d.titulo}</h3>
                <p className="text-lavender-mid text-sm md:text-base leading-relaxed">{d.descricao}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 px-5 md:px-12 bg-lavender text-center">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="font-headline font-black text-3xl md:text-4xl lg:text-5xl uppercase tracking-tighter mb-8 md:mb-12 leading-[0.9] text-ink"
        >
          Faz parte do nosso jeito<br />te ver crescer<span className="text-primary">.</span>
        </motion.h2>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          transition={{ delay: 0.1 }}
          className="text-sm md:text-base text-ink-soft/80 mb-10 md:mb-14 max-w-xl mx-auto leading-relaxed"
        >
          Vem testar por 14 dias, de graça, e sentir na pele o que é ter tecnologia do seu lado.
        </motion.p>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.03 }}
        >
          <Link
            to="/cadastro"
            className="inline-block bg-primary text-white px-8 md:px-14 py-5 md:py-7 btn-text text-base md:text-lg hover:bg-primary-dark transition-all duration-300 w-full sm:w-auto"
          >
            Quero começar agora
          </Link>
        </motion.div>
      </section>
    </>
  )
}
