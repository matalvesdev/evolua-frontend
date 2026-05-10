import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'

export const Route = createFileRoute('/status')({
  component: StatusPage,
})

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

type ServiceStatus = 'operational' | 'degraded' | 'outage'

const services: { nome: string; status: ServiceStatus; uptime: string }[] = [
  { nome: 'Plataforma Web', status: 'operational', uptime: '99.98%' },
  { nome: 'API Principal', status: 'operational', uptime: '99.97%' },
  { nome: 'IA de Sessão (Transcrição)', status: 'operational', uptime: '99.91%' },
  { nome: 'WhatsApp Automático', status: 'operational', uptime: '99.95%' },
  { nome: 'App do Paciente', status: 'operational', uptime: '99.99%' },
  { nome: 'Teleconsulta', status: 'operational', uptime: '99.89%' },
  { nome: 'Pagamentos (Gateway)', status: 'operational', uptime: '100%' },
  { nome: 'E-mail Transacional', status: 'operational', uptime: '99.96%' },
]

const statusConfig: Record<ServiceStatus, { label: string; dot: string; text: string }> = {
  operational: { label: 'Operacional', dot: 'bg-[#22c55e]', text: 'text-[#16a34a]' },
  degraded:    { label: 'Degradado',   dot: 'bg-[#f59e0b]', text: 'text-[#b45309]' },
  outage:      { label: 'Fora do ar',  dot: 'bg-rose',       text: 'text-rose' },
}

const allOperational = services.every((s) => s.status === 'operational')

function StatusPage() {
  return (
    <>
      <section className="px-5 md:px-12 pt-16 md:pt-24 pb-16 md:pb-24 bg-canvas">
        <div className="max-w-7xl mx-auto">
          <motion.span
            variants={fadeUp} initial="hidden" animate="visible"
            className="font-label text-[10px] font-bold tracking-[0.4em] uppercase text-primary mb-6 md:mb-10 block"
          >
            Status do Sistema
          </motion.span>
          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible"
            transition={{ delay: 0.08 }}
            className="font-headline font-black text-[clamp(2rem,5vw,3.5rem)] leading-[0.9] tracking-tighter uppercase mb-6 max-w-3xl text-ink"
          >
            Status em tempo real<span className="text-primary">.</span>
          </motion.h1>

          {/* Overall status banner */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible"
            transition={{ delay: 0.2 }}
            className={`inline-flex items-center gap-3 px-6 py-4 mt-4 ${allOperational ? 'bg-[#f0fdf4] border border-[#bbf7d0]' : 'bg-[#fff7ed] border border-[#fed7aa]'}`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${allOperational ? 'bg-[#22c55e]' : 'bg-[#f59e0b]'} animate-pulse`} />
            <span className={`font-headline font-bold text-sm uppercase tracking-tight ${allOperational ? 'text-[#16a34a]' : 'text-[#b45309]'}`}>
              {allOperational ? 'Todos os sistemas operando normalmente' : 'Alguns sistemas com instabilidade'}
            </span>
          </motion.div>
        </div>
      </section>

      {/* Services list */}
      <section className="px-5 md:px-12 pb-20 md:pb-32 bg-canvas">
        <div className="max-w-3xl mx-auto">
          <div className="divide-y divide-outline-variant">
            {services.map((service, i) => {
              const cfg = statusConfig[service.status]
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ duration: 0.4, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] as const }}
                  className="flex items-center justify-between py-5"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${cfg.dot} shrink-0`} />
                    <span className="font-body text-sm md:text-base text-ink">{service.nome}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-label text-[10px] font-bold tracking-[0.2em] uppercase text-muted hidden sm:block">
                      {service.uptime} uptime (90d)
                    </span>
                    <span className={`font-label text-[10px] font-bold tracking-[0.2em] uppercase ${cfg.text}`}>
                      {cfg.label}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Uptime note */}
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 text-[11px] text-muted font-label uppercase tracking-widest text-center"
          >
            Uptime medido nos últimos 90 dias · Atualizado em tempo real
          </motion.p>
        </div>
      </section>
    </>
  )
}
