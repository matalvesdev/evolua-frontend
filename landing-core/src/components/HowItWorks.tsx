import { motion } from 'motion/react'

const steps = [
  {
    number: '01',
    title: 'Configure em 20 minutos',
    description:
      'Importe sua agenda atual, cadastre os pacientes e personalize os templates de prontuário para a sua área. Nosso time te acompanha no onboarding ao vivo.',
    highlight: false,
    detail: 'Sem planilha, sem papel, sem dor de cabeça.',
  },
  {
    number: '02',
    title: 'Atenda com o sistema do seu lado',
    description:
      'No tablet, grave a sessão. A IA transcreve e gera o rascunho do relatório enquanto você ainda está com o paciente. Aplique protocolos MBGR, DOSS ou GRBAS direto na ficha.',
    highlight: true,
    detail: 'Modo sessão: gravação + IA + protocolo clínico.',
  },
  {
    number: '03',
    title: 'O sistema trabalha quando você não está',
    description:
      'WhatsApp automático confirma a próxima consulta. O app do paciente envia os exercícios prescritos com lembrete. O financeiro fecha o mês sozinho.',
    highlight: false,
    detail: 'Você atende. A gente cuida do resto.',
  },
]

const stepVariants = {
  hidden: { opacity: 0, y: 36 },
  show:   { opacity: 1, y: 0 },
}

const stepsContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.18, delayChildren: 0.1 },
  },
}

export function HowItWorks() {
  return (
    <section className="py-20 md:py-32 px-5 md:px-12 bg-canvas">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-6"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ type: 'spring', stiffness: 50, damping: 18 }}
        >
          <h2 className="font-headline font-black text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter leading-[0.9] text-ink">
            Como funciona<span className="text-primary">.</span>
          </h2>
          <p className="max-w-md text-ink-soft/80 text-sm md:text-base leading-relaxed">
            Do primeiro acesso até a sessão gravada e relatório assinado — em menos de um dia de uso.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-px md:bg-outline-variant"
          variants={stepsContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={stepVariants}
              transition={{
                type: 'spring',
                stiffness: step.highlight ? 45 : 55,
                damping: 18,
              }}
              className={`p-8 md:p-10 lg:p-12 flex flex-col gap-6 ${step.highlight ? 'bg-primary' : 'bg-surface-low'}`}
            >
              <div
                className={`text-[2.5rem] md:text-[3rem] font-headline font-black leading-none ${
                  step.highlight ? 'text-white/30' : 'text-outline-variant'
                }`}
              >
                {step.number}
              </div>
              <div className="flex flex-col gap-4 flex-1">
                <h4
                  className={`font-headline font-bold text-base md:text-lg lg:text-xl uppercase tracking-tight leading-tight ${
                    step.highlight ? 'text-white' : 'text-ink'
                  }`}
                >
                  {step.title}
                </h4>
                <p
                  className={`text-sm md:text-base leading-relaxed flex-1 ${
                    step.highlight ? 'text-lavender' : 'text-ink-soft/80'
                  }`}
                >
                  {step.description}
                </p>
              </div>
              <div
                className={`font-label text-[10px] font-bold tracking-[0.25em] uppercase border-t pt-5 ${
                  step.highlight ? 'border-white/20 text-white' : 'border-outline-variant text-primary'
                }`}
              >
                {step.detail}
              </div>
            </motion.div>
          ))}
        </motion.div>


      </div>
    </section>
  )
}
