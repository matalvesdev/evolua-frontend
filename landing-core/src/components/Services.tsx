import { motion } from 'motion/react'
import { BentoGrid, BentoCard } from './magicui/bento-grid'

function WhatsAppSvg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label="WhatsApp"
      className="text-white/80 group-hover:scale-110 transition-transform w-8 h-8 md:w-10 md:h-10"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.528 5.845L0 24l6.335-1.658A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 0 1-5.003-1.371l-.359-.213-3.76.986 1.003-3.656-.234-.374A9.772 9.772 0 0 1 2.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818zm5.365-7.312c-.295-.147-1.744-.86-2.014-.958-.27-.098-.467-.147-.664.148-.196.295-.762.958-.934 1.155-.172.197-.344.222-.639.074-.295-.148-1.245-.459-2.372-1.463-.876-.78-1.468-1.744-1.64-2.039-.172-.295-.018-.455.129-.602.132-.132.295-.344.443-.516.148-.172.197-.295.295-.492.099-.197.05-.37-.025-.517-.074-.148-.663-1.6-.909-2.19-.24-.575-.483-.497-.664-.506l-.566-.01c-.197 0-.517.074-.787.37-.27.295-1.033 1.009-1.033 2.46 0 1.452 1.058 2.855 1.206 3.052.148.197 2.082 3.179 5.045 4.458.706.304 1.255.486 1.684.622.708.224 1.352.192 1.861.116.568-.084 1.744-.713 1.99-1.402.246-.688.246-1.278.172-1.402-.074-.123-.27-.197-.565-.344z" />
    </svg>
  )
}

/* ─ Features organizadas por importância para o BentoGrid ─ */
const featuredService = {
  icon: 'clinical_notes',
  badge: 'Exclusivo',
  title: 'Prontuário nativo para fono',
  description:
    'Templates prontos por área: voz, disfagia, linguagem, motricidade orofacial. Escalas MBGR, DOSS, FOIS, GRBAS e VHI-10 integradas — preenchimento estruturado, não texto livre.',
  wide: true,
}

const services = [
  {
    icon: 'record_voice_over',
    badge: 'IA inclusa',
    title: 'Sessão no automático',
    description:
      'Grave a sessão em tablet ou celular. A IA transcreve, organiza na ficha e gera o rascunho do relatório de evolução. Você revisa e assina digitalmente em segundos.',
    wide: false,
  },
  {
    icon: 'whatsapp',
    badge: 'Único no mercado',
    title: 'Exercícios via WhatsApp',
    description:
      'Prescreva exercícios de voz, fala e deglutição com vídeos demonstrativos. O paciente recebe tudo no WhatsApp, com lembretes automáticos e sem precisar baixar nenhum app.',
    wide: false,
  },
  {
    icon: 'notifications_active',
    badge: 'Incluso em todos os planos',
    title: 'WhatsApp automático',
    description:
      'Confirmação de consulta, lembrete 24h antes, link de remarcação. Incluso em todos os planos — sem cobrar à parte como os concorrentes.',
    wide: false,
  },
  {
    icon: 'account_balance_wallet',
    badge: 'Completo',
    title: 'Financeiro integrado',
    description:
      'Pix, boleto, controle de convênios, TISS simplificado e emissão de NF — tudo em um painel só.',
    wide: false,
  },
  {
    icon: 'description',
    badge: 'CFoF compliance',
    title: 'Laudos e relatórios',
    description:
      'Templates de laudo seguindo a Resolução CFoF nº 427/2013. Relatório de alta, evolução e parecer. Exporta em PDF com assinatura digital.',
    wide: false,
  },
  {
    icon: 'bar_chart',
    badge: 'Dashboard inteligente',
    title: 'Indicadores clínicos',
    description:
      'Média de sessões por diagnóstico, taxa de adesão por faixa etária, pacientes sem retorno há mais de 30 dias.',
    wide: false,
  },
  {
    icon: 'video_call',
    badge: 'Inclusa',
    title: 'Teleconsulta integrada',
    description:
      'Atendimento remoto regulamentado pelo CFoF, sem precisar de Zoom ou Meet externo. Link gerado automaticamente.',
    wide: false,
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0 },
}

const gridContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
}

function ServiceCard({
  service,
  wide = false,
  variants,
}: {
  service: typeof featuredService
  wide?: boolean
  variants?: typeof cardVariants
}) {
  return (
    <motion.div
      variants={variants}
      transition={{ type: 'spring', stiffness: 55, damping: 20 }}
      whileHover={{ backgroundColor: '#3D3A6B' }}
      className={`bg-deep p-7 md:p-9 lg:p-10 group flex flex-col gap-5 h-full ${wide ? 'lg:col-span-2' : ''}`}
    >
      <div className="flex items-start justify-between">
        {service.icon === 'whatsapp' ? (
          <WhatsAppSvg />
        ) : (
          <span className="material-symbols-outlined text-white/80 text-3xl md:text-4xl group-hover:scale-110 transition-transform">
            {service.icon}
          </span>
        )}
        <span className="font-label text-[9px] font-bold tracking-[0.25em] uppercase text-white/60 text-right leading-tight max-w-[120px]">
          {service.badge}
        </span>
      </div>
      <h3 className="font-headline font-bold text-lg md:text-xl uppercase tracking-tight leading-tight text-white">
        {service.title}
      </h3>
      <p className="text-white/75 text-sm md:text-base leading-relaxed flex-1">{service.description}</p>
    </motion.div>
  )
}

export function Services() {
  return (
    <section className="bg-deep text-white py-20 md:py-32 px-5 md:px-12">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-6 md:gap-12"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 50, damping: 18 }}
        >
          <h2 className="font-headline font-black text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter leading-[0.9] text-white">
            TUDO QUE
            <br />
            <span className="text-lavender">VOCÊ PRECISA</span><span className="text-neon">.</span>
          </h2>
          <p className="max-w-md font-body text-white/80 text-sm md:text-base leading-relaxed">
            Construído do zero pra fonoaudiologia. Cada feature pensada pro seu dia a dia — não adaptada de outro sistema.
          </p>
        </motion.div>

        {/* BentoGrid de features */}
        <motion.div
          variants={gridContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          <BentoGrid className="lg:grid-cols-3 gap-px bg-deep-light/30 auto-rows-[minmax(260px,auto)]">
            {/* Card destaque — ocupa 2 colunas no desktop */}
            <BentoCard colSpan="lg:col-span-2">
              <ServiceCard service={featuredService} variants={cardVariants} />
            </BentoCard>

            {/* Card IA — destaque visual com cor neon */}
            <BentoCard>
              <motion.div
                variants={cardVariants}
                transition={{ type: 'spring', stiffness: 55, damping: 20 }}
                whileHover={{ backgroundColor: '#3D3A6B' }}
                className="bg-deep p-7 md:p-9 lg:p-10 group flex flex-col gap-5 h-full relative overflow-hidden"
              >
                {/* Glow neon no canto */}
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-neon/10 blur-2xl pointer-events-none" />
                <div className="flex items-start justify-between">
                  <span className="material-symbols-outlined text-neon text-3xl md:text-4xl group-hover:scale-110 transition-transform">
                    record_voice_over
                  </span>
                  <span className="font-label text-[9px] font-bold tracking-[0.25em] uppercase text-neon/70 text-right leading-tight max-w-[120px]">
                    IA inclusa
                  </span>
                </div>
                <h3 className="font-headline font-bold text-lg md:text-xl uppercase tracking-tight leading-tight text-white">
                  Sessão no automático
                </h3>
                <p className="text-white/75 text-sm md:text-base leading-relaxed flex-1">
                  Grave a sessão. A IA transcreve, organiza na ficha e gera o rascunho do relatório de evolução. Você revisa e assina em segundos.
                </p>
              </motion.div>
            </BentoCard>

            {/* Demais cards — 1 coluna cada */}
            {services.slice(1).map((service) => (
              <BentoCard key={service.title}>
                <ServiceCard service={service} variants={cardVariants} />
              </BentoCard>
            ))}
          </BentoGrid>
        </motion.div>

      </div>
    </section>
  )
}
