import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'

export const Route = createFileRoute('/changelog')({
  component: ChangelogPage,
})

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
}

const entries = [
  {
    versao: 'v2.4',
    data: 'Maio 2025',
    tipo: 'Feature',
    tipoColor: 'bg-primary text-white',
    titulo: 'IA de Sessão — geração de rascunho de evolução',
    descricao: 'A IA agora gera automaticamente um rascunho do relatório de evolução clínica com base na transcrição da sessão. Disponível no plano Galera e Gigante.',
    itens: [
      'Transcrição em tempo real durante gravação',
      'Rascunho estruturado no padrão SOAP adaptado para fono',
      'Suporte a áreas: voz, disfagia, linguagem e motricidade orofacial',
      'Revisão e assinatura digital em um clique',
    ],
  },
  {
    versao: 'v2.3',
    data: 'Abril 2025',
    tipo: 'Melhoria',
    tipoColor: 'bg-lavender text-primary',
    titulo: 'App do paciente — exercícios domiciliares',
    descricao: 'Reformulamos completamente o app do paciente com nova interface e sistema de notificações push.',
    itens: [
      'Novos vídeos demonstrativos por área clínica',
      'Lembretes diários configuráveis por paciente',
      'Painel de aderência no prontuário da terapeuta',
      'Suporte a exercícios de CAA (Comunicação Aumentativa)',
    ],
  },
  {
    versao: 'v2.2',
    data: 'Março 2025',
    tipo: 'Feature',
    tipoColor: 'bg-primary text-white',
    titulo: 'Teleconsulta integrada',
    descricao: 'Atendimento remoto regulamentado pelo CFoF, sem precisar de ferramentas externas.',
    itens: [
      'Link de videochamada gerado automaticamente com o agendamento',
      'Sem Zoom, sem Meet, sem instalação de app pelo paciente',
      'Prontuário acessível durante a consulta remota',
      'Conformidade com Resolução CFoF 592/2022',
    ],
  },
  {
    versao: 'v2.1',
    data: 'Fevereiro 2025',
    tipo: 'Melhoria',
    tipoColor: 'bg-lavender text-primary',
    titulo: 'WhatsApp CRM — histórico completo por paciente',
    descricao: 'Todo o histórico de conversas do WhatsApp agora aparece vinculado ao paciente no prontuário.',
    itens: [
      'Histórico de mensagens visível no perfil do paciente',
      'Confirmações e lembretes linkados à sessão correspondente',
      'Filtro por tipo de mensagem (confirmação, exercício, remarcação)',
    ],
  },
  {
    versao: 'v2.0',
    data: 'Janeiro 2025',
    tipo: 'Major Release',
    tipoColor: 'bg-neon text-ink',
    titulo: 'Evolua 2.0 — redesign completo',
    descricao: 'Lançamento da versão 2.0 com nova identidade visual, novo motor de prontuário e arquitetura redesenhada do zero.',
    itens: [
      'Interface completamente redesenhada — mais rápida e mais limpa',
      'Novo motor de prontuário com suporte a todos os protocolos clínicos de fono',
      'Dashboard inteligente com KPIs da clínica',
      'Sincronização bidirecional com Google Calendar',
      'LGPD: log de auditoria e consentimentos em todos os planos',
    ],
  },
]

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
          <div className="space-y-0 divide-y divide-outline-variant">
            {entries.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] as const }}
                className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12"
              >
                <div className="md:col-span-3">
                  <div className="font-headline font-black text-2xl md:text-3xl tracking-tighter text-ink mb-1">{entry.versao}</div>
                  <div className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-muted mb-3">{entry.data}</div>
                  <span className={`inline-block font-label text-[9px] font-bold tracking-[0.25em] uppercase px-3 py-1.5 ${entry.tipoColor}`}>
                    {entry.tipo}
                  </span>
                </div>
                <div className="md:col-span-9">
                  <h2 className="font-headline font-bold text-xl md:text-2xl uppercase tracking-tight text-ink mb-3 leading-tight">
                    {entry.titulo}
                  </h2>
                  <p className="text-ink-soft/80 text-sm md:text-base leading-relaxed mb-6">{entry.descricao}</p>
                  <ul className="space-y-2">
                    {entry.itens.map((item, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary text-sm mt-0.5 shrink-0">check_circle</span>
                        <span className="text-ink-soft/80 text-sm leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
