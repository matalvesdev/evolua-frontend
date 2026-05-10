import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { motion } from 'motion/react'

export const Route = createFileRoute('/planos')({
  component: PlanosPage,
})

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const planos = [
  {
    id: 'solo',
    numero: '01',
    nome: 'Só Você',
    tagline: 'Pra quem voa carreira solo',
    precoMensal: 'R$ 97',
    precoAnual: 'R$ 78',
    periodo: '/mês',
    destaque: false,
    badge: null,
    descricao: 'Tudo que uma fonoaudióloga autônoma precisa para organizar a clínica, encher a agenda e atender com total tranquilidade — sem planilha, sem papel, sem gambiarra.',
    recursos: [
      'Prontuário nativo para fono (não adaptado de médico)',
      'Protocolos clínicos validados: MBGR, DOSS, FOIS, GRBAS, VHI-10 e mais',
      'Agenda online com link de agendamento público',
      'Lembretes automáticos por WhatsApp incluso (sem custo extra)',
      'Confirmação, lembrete 24h/1h e link de reagendamento automáticos',
      'Assinatura digital com validade jurídica inclusa',
      'Teleconsulta integrada — sem Zoom, sem Meet externo',
      'Controle financeiro: Pix, boleto, recibos e emissão de NF',
      'Relatórios e laudos no padrão CFoF (Resolução 427/2013)',
      'Planos de tratamento com metas e progresso por sessão',
      'Histórico de evolução clínica por paciente',
      'Sincronização bidirecional com Google Calendar',
      'Conformidade LGPD: log de auditoria e consentimentos',
      'Dashboard com KPIs da clínica',
      'Suporte por chat em horário comercial',
    ],
    cta: 'Testar 14 dias grátis',
    ctaStyle: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  },
  {
    id: 'galera',
    numero: '02',
    nome: 'Galera',
    tagline: 'Pra quem atende junto',
    precoMensal: 'R$ 197',
    precoAnual: 'R$ 158',
    periodo: '/mês',
    destaque: true,
    badge: 'Mais popular',
    descricao: 'Para clínicas com mais de uma profissional. Cada uma com seu acesso, tudo centralizado — financeiro consolidado, agenda por sala e inteligência artificial trabalhando pra você.',
    recursos: [
      'Tudo do plano Só Você',
      'Até 5 profissionais (preço por clínica, não por profissional)',
      'Agenda compartilhada por sala e por profissional',
      'IA de sessão: grava, transcreve em tempo real e rascunha a evolução',
      'App do paciente: exercícios domiciliares com vídeo + push diário',
      'Aderência dos pacientes em tempo real no painel da terapeuta',
      'WhatsApp CRM: histórico completo de conversas por paciente',
      'Financeiro consolidado por profissional e por clínica',
      'Faturamento TISS simplificado para convênios',
      'Relatórios avançados: diagnósticos, aderência por faixa etária, risco de abandono',
      'CAA (Comunicação Aumentativa e Alternativa): pranchas e materiais',
      'Biblioteca de materiais terapêuticos',
      'Gestão de tarefas vinculadas a pacientes e agendamentos',
      'Suporte prioritário com resposta em até 2h',
    ],
    cta: 'Testar 14 dias grátis',
    ctaStyle: 'bg-surface text-ink hover:bg-neon hover:text-ink',
  },
  {
    id: 'gigante',
    numero: '03',
    nome: 'Gigante',
    tagline: 'Pra clínicas grandonas',
    precoMensal: 'Sob consulta',
    precoAnual: 'Sob consulta',
    periodo: '',
    destaque: false,
    badge: null,
    descricao: 'Solução personalizada para clínicas com múltiplas unidades, grandes equipes e necessidades específicas de integração e compliance.',
    recursos: [
      'Tudo do plano Galera',
      'Profissionais ilimitadas',
      'Múltiplas unidades no mesmo painel',
      'Onboarding dedicado com setup guiado',
      'Treinamento presencial ou remoto da equipe',
      'Integrações customizadas via API',
      'SLA garantido em contrato',
      'Gerente de conta exclusivo',
      'Relatórios personalizados por unidade',
      'Configuração de permissões por perfil de acesso',
    ],
    cta: 'Falar com especialista',
    ctaStyle: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  },
]

const comparativo = [
  { recurso: 'Prontuário nativo para fono', solo: true, galera: true, gigante: true },
  { recurso: 'Protocolos clínicos validados (MBGR, DOSS, FOIS, GRBAS…)', solo: true, galera: true, gigante: true },
  { recurso: 'Lembretes automáticos por WhatsApp', solo: true, galera: true, gigante: true },
  { recurso: 'Assinatura digital com validade jurídica', solo: true, galera: true, gigante: true },
  { recurso: 'Teleconsulta integrada', solo: true, galera: true, gigante: true },
  { recurso: 'Financeiro (Pix, boleto, NF)', solo: true, galera: true, gigante: true },
  { recurso: 'Google Calendar sync', solo: true, galera: true, gigante: true },
  { recurso: 'Planos de tratamento e metas', solo: true, galera: true, gigante: true },
  { recurso: 'LGPD (log de auditoria + consentimentos)', solo: true, galera: true, gigante: true },
  { recurso: 'Até 5 profissionais por clínica', solo: false, galera: true, gigante: true },
  { recurso: 'IA de sessão (transcrição + rascunho)', solo: false, galera: true, gigante: true },
  { recurso: 'App do paciente + exercícios domiciliares', solo: false, galera: true, gigante: true },
  { recurso: 'WhatsApp CRM (histórico por paciente)', solo: false, galera: true, gigante: true },
  { recurso: 'Faturamento TISS (convênios)', solo: false, galera: true, gigante: true },
  { recurso: 'Relatórios avançados e KPIs de abandono', solo: false, galera: true, gigante: true },
  { recurso: 'CAA e biblioteca de materiais', solo: false, galera: true, gigante: true },
  { recurso: 'Múltiplas unidades', solo: false, galera: false, gigante: true },
  { recurso: 'Integrações customizadas + SLA em contrato', solo: false, galera: false, gigante: true },
]

const faqs = [
  {
    pergunta: 'Preciso de cartão de crédito para testar?',
    resposta: 'Não! Os 14 dias são completamente gratuitos, sem precisar cadastrar cartão. Você só informa o pagamento se decidir continuar.',
  },
  {
    pergunta: 'O que está desbloqueado no período de teste?',
    resposta: 'Tudo. Prontuário, protocolos clínicos, IA de sessão, app do paciente, WhatsApp automático, financeiro, teleconsulta — sem restrição. Queremos que você teste o sistema real, não uma versão limitada.',
  },
  {
    pergunta: 'Posso cancelar quando quiser?',
    resposta: 'Sim, sem multa e sem burocracia. Você cancela pelo próprio painel com dois cliques. Sem ligação, sem processo complicado.',
  },
  {
    pergunta: 'Meus dados ficam seguros?',
    resposta: 'Totalmente. Usamos criptografia de ponta a ponta, servidores no Brasil, conformidade total com a LGPD — log de auditoria e registro de consentimentos inclusos em todos os planos.',
  },
  {
    pergunta: 'E se eu precisar de ajuda para configurar?',
    resposta: 'A gente acompanha você nos primeiros passos. Onboarding guiado em ~20 minutos, vídeos, tutoriais e nossa equipe disponível no chat. No plano Galera, suporte prioritário com resposta em até 2h.',
  },
  {
    pergunta: 'Posso mudar de plano depois?',
    resposta: 'Claro! Você faz upgrade ou downgrade a qualquer momento. O valor é ajustado proporcionalmente ao período restante.',
  },
  {
    pergunta: 'O sistema funciona para qualquer área da fonoaudiologia?',
    resposta: 'Sim. Temos prontuários e protocolos específicos para voz (GRBAS, VHI-10), disfagia (MBGR, DOSS, FOIS), linguagem infantil e adulta, motricidade orofacial e fluência. Feito do zero pra fono, não adaptado de outro sistema.',
  },
]

function Check({ ok, destaque }: { ok: boolean; destaque: boolean }) {
  if (ok) {
    return (
      <span className={`material-symbols-outlined text-base ${destaque ? 'text-neon' : 'text-primary'}`}>
        check_circle
      </span>
    )
  }
  return <span className="material-symbols-outlined text-base text-outline-variant">remove</span>
}

function PlanosPage() {
  const [anual, setAnual] = useState(false)
  const [comparativoAberto, setComparativoAberto] = useState(false)

  return (
    <>
      {/* Hero */}
      <section className="px-5 md:px-12 pt-16 md:pt-24 pb-16 md:pb-28 bg-canvas text-center">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <motion.span
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-label text-[10px] font-bold tracking-[0.4em] uppercase text-primary mb-6 md:mb-10 block"
          >
            Investimento
          </motion.span>
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.08 }}
            className="font-headline font-black text-[clamp(2rem,5vw,4rem)] leading-[0.9] tracking-tighter uppercase mb-6 md:mb-10 max-w-3xl text-ink"
          >
            Simples, justo e sem pegadinha<span className="text-primary">.</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.16 }}
            className="text-sm md:text-base text-ink-soft/80 max-w-xl leading-relaxed mb-10 md:mb-16"
          >
            14 dias grátis em qualquer plano. Sistema inteiro desbloqueado. Sem cartão de crédito. A gente só cobra quando você já sabe que vale.
          </motion.p>
          {/* Toggle anual/mensal */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.24 }}
            className="inline-flex items-center gap-0 border-2 border-ink"
          >
            <button
              onClick={() => setAnual(false)}
              className={`px-6 py-3 btn-text text-xs transition-colors ${!anual ? 'bg-ink text-white' : 'bg-canvas text-muted hover:text-ink'}`}
            >
              Mensal
            </button>
            <button
              onClick={() => setAnual(true)}
              className={`px-6 py-3 btn-text text-xs transition-colors ${anual ? 'bg-ink text-white' : 'bg-canvas text-muted hover:text-ink'}`}
            >
              Anual <span className="text-primary font-bold">–20%</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Cards de planos */}
      <section className="px-5 md:px-12 pb-12 md:pb-20 bg-canvas">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-px bg-outline-variant"
          >
            {planos.map((plano) => (
              <motion.div
                key={plano.id}
                variants={fadeUp}
                className={`flex flex-col p-8 md:p-10 lg:p-14 relative ${
                  plano.destaque ? 'bg-primary text-white' : 'bg-surface-low text-ink'
                }`}
              >
                {plano.badge && (
                  <div className="absolute -top-4 left-8 bg-neon px-5 py-2 btn-text text-[10px] text-ink">
                    {plano.badge}
                  </div>
                )}

                <div className="mb-8 md:mb-10">
                  <span className={`font-headline font-black text-4xl md:text-5xl leading-none ${plano.destaque ? 'text-white/10' : 'text-ink/10'}`}>
                    {plano.numero}
                  </span>
                  <h2 className="font-headline font-black text-2xl md:text-3xl uppercase tracking-tighter mt-2">
                    {plano.nome}
                  </h2>
                  <p className={`font-label text-[10px] font-bold tracking-[0.3em] uppercase mt-2 ${plano.destaque ? 'text-neon' : 'text-primary'}`}>
                    {plano.tagline}
                  </p>
                </div>

                <div className="mb-8 md:mb-10">
                  <div className="flex items-end gap-1">
                    <span className="font-headline font-black text-3xl md:text-4xl tracking-tighter">
                      {anual ? plano.precoAnual : plano.precoMensal}
                    </span>
                    {plano.periodo && (
                      <span className={`text-base mb-1 ${plano.destaque ? 'text-white/50' : 'text-muted'}`}>{plano.periodo}</span>
                    )}
                  </div>
                  {anual && plano.precoAnual !== 'Sob consulta' && (
                    <p className={`text-xs mt-1 font-bold ${plano.destaque ? 'text-neon' : 'text-primary'}`}>
                      Cobrado anualmente · economize 20%
                    </p>
                  )}
                  <p className={`text-sm mt-3 leading-relaxed ${plano.destaque ? 'text-lavender' : 'text-ink-soft/80'}`}>
                    {plano.descricao}
                  </p>
                </div>

                <ul className="flex-1 space-y-3 md:space-y-4 mb-10 md:mb-12">
                  {plano.recursos.map((r) => (
                    <li key={r} className="flex items-start gap-3">
                      <span className={`material-symbols-outlined text-base mt-0.5 shrink-0 ${plano.destaque ? 'text-neon' : 'text-primary'}`}>
                        check_circle
                      </span>
                      <span className={`text-sm md:text-base leading-snug ${plano.destaque ? 'text-lavender' : 'text-ink-soft/80'}`}>
                        {r}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/cadastro"
                  className={`block w-full text-center py-4 md:py-5 btn-text text-sm transition-all duration-200 ${plano.ctaStyle}`}
                >
                  {plano.cta}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Comparativo expandível */}
      <section className="px-5 md:px-12 pb-20 md:pb-32 bg-canvas">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => setComparativoAberto(!comparativoAberto)}
            className="w-full flex items-center justify-between py-6 border-t-2 border-outline-variant group"
          >
            <span className="font-headline font-bold text-lg md:text-xl uppercase tracking-tight text-ink">
              Ver comparativo completo de recursos
            </span>
            <span className={`material-symbols-outlined text-primary transition-transform duration-300 ${comparativoAberto ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>
          {comparativoAberto && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
              className="overflow-x-auto mt-4"
            >
              <table className="w-full border-collapse text-sm md:text-base">
                <thead>
                  <tr className="border-b-2 border-ink">
                    <th className="text-left py-4 pr-8 font-headline font-bold uppercase tracking-tight text-sm text-ink">Recurso</th>
                    <th className="text-center py-4 px-4 font-headline font-bold uppercase tracking-tight text-sm w-24 text-ink">Só Você</th>
                    <th className="text-center py-4 px-4 font-headline font-bold uppercase tracking-tight text-sm w-24 text-primary">Galera</th>
                    <th className="text-center py-4 px-4 font-headline font-bold uppercase tracking-tight text-sm w-24 text-ink">Gigante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {comparativo.map((linha) => (
                    <tr key={linha.recurso} className="hover:bg-surface-low transition-colors">
                      <td className="py-3 pr-8 text-ink-soft/80">{linha.recurso}</td>
                      <td className="py-3 px-4 text-center"><Check ok={linha.solo} destaque={false} /></td>
                      <td className="py-3 px-4 text-center"><Check ok={linha.galera} destaque={true} /></td>
                      <td className="py-3 px-4 text-center"><Check ok={linha.gigante} destaque={false} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </div>
      </section>

      {/* Garantia */}
      <section className="py-16 md:py-24 px-5 md:px-12 bg-lavender">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16"
        >
          <motion.span variants={fadeUp} className="material-symbols-outlined text-primary text-5xl md:text-6xl shrink-0">verified_user</motion.span>
          <motion.div variants={fadeUp}>
            <h2 className="font-headline font-black text-2xl md:text-4xl uppercase tracking-tighter mb-4 leading-[0.9] text-ink">
              Garantia de 14 dias<span className="text-primary">.</span>
            </h2>
            <p className="text-sm md:text-base text-ink-soft/80 leading-relaxed max-w-2xl">
              Se em 14 dias você não amar o Evolua, a gente devolve tudo sem perguntas. Sem burocracia, sem ligação de retenção. Acreditamos tanto no produto que colocamos o dinheiro onde está a boca.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-32 px-5 md:px-12 bg-surface-low">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="md:col-span-4"
            >
              <h2 className="font-headline font-black text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter leading-[0.9] sticky top-28 text-ink">
                Ficou alguma dúvida<span className="text-primary">?</span>
              </h2>
            </motion.div>
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="md:col-span-8 divide-y divide-outline-variant"
            >
              {faqs.map((faq, i) => (
                <motion.details key={i} variants={fadeUp} className="group py-6 md:py-8">
                  <summary className="flex items-center justify-between cursor-pointer list-none gap-4">
                    <span className="font-headline font-bold text-base md:text-lg uppercase tracking-tight text-ink">{faq.pergunta}</span>
                    <span className="material-symbols-outlined text-primary shrink-0 group-open:rotate-180 transition-transform duration-300">
                      expand_more
                    </span>
                  </summary>
                  <p className="mt-4 text-ink-soft/80 leading-relaxed text-sm md:text-base">{faq.resposta}</p>
                </motion.details>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 md:py-32 px-5 md:px-12 bg-primary text-white text-center">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="font-headline font-black text-3xl md:text-5xl lg:text-6xl uppercase tracking-tighter mb-8 md:mb-12 leading-[0.9]"
        >
          Pronta pra começar<span className="text-neon">?</span>
        </motion.h2>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          transition={{ delay: 0.1 }}
          className="text-sm md:text-base text-lavender mb-10 md:mb-14 max-w-lg mx-auto leading-relaxed"
        >
          Escolhe o plano, testa 14 dias de graça com o sistema inteiro desbloqueado e sente na pele o que é ter a agenda cheia sem esforço.
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
            className="inline-block bg-neon text-ink px-10 md:px-16 py-5 md:py-6 btn-text text-sm md:text-base transition-all duration-300 w-full sm:w-auto"
          >
            Começar agora, de graça
          </Link>
        </motion.div>
      </section>
    </>
  )
}
