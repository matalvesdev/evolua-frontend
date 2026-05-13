import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'

export const Route = createFileRoute('/seguranca')({
  component: SegurancaPage,
})

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

const praticas = [
  {
    icone: 'lock',
    titulo: 'Criptografia ponta a ponta',
    descricao: 'Dados em trânsito protegidos por TLS 1.3 e em repouso por AES-256. Suas anotações clínicas nunca trafegam ou ficam armazenadas em texto plano.',
  },
  {
    icone: 'shield_person',
    titulo: 'Controle de acesso granular',
    descricao: 'Cada profissional da equipe tem permissões definidas por papel (admin, terapeuta, recepção). Log de auditoria registra quem acessou o quê e quando.',
  },
  {
    icone: 'cloud_done',
    titulo: 'Infraestrutura no Brasil',
    descricao: 'Servidores hospedados em data centers brasileiros, com replicação geográfica e backup automático com retenção de 90 dias.',
  },
  {
    icone: 'fact_check',
    titulo: 'Conformidade LGPD por design',
    descricao: 'Termo de consentimento eletrônico para pacientes, exercício de direitos do titular (acesso, portabilidade, eliminação) em até 15 dias úteis e DPO designada.',
  },
  {
    icone: 'health_and_safety',
    titulo: 'Resoluções do CFFa',
    descricao: 'Conformidade com as Resoluções CFoF 491/2017 (prontuário) e 592/2022 (teleconsulta). Retenção mínima de 5 anos pós-encerramento.',
  },
  {
    icone: 'visibility_off',
    titulo: 'IA com isolamento de dados',
    descricao: 'Modelos de IA processam apenas dados da sua clínica em ambiente isolado. Acordo contratual com provedores proíbe uso para treinamento de modelo público.',
  },
  {
    icone: 'monitoring',
    titulo: 'Monitoramento 24/7',
    descricao: 'Equipe de segurança monitora a plataforma continuamente. Tentativas anômalas de acesso geram alerta imediato e bloqueio preventivo.',
  },
  {
    icone: 'download',
    titulo: 'Portabilidade total',
    descricao: 'Você pode exportar 100% dos seus dados em PDF e CSV a qualquer momento, sem custo. Nada de aprisionamento.',
  },
]

const certificacoes = [
  { sigla: 'LGPD', desc: 'Lei Geral de Proteção de Dados' },
  { sigla: 'TLS 1.3', desc: 'Criptografia em trânsito' },
  { sigla: 'AES-256', desc: 'Criptografia em repouso' },
  { sigla: 'PCI-DSS', desc: 'Pagamentos via gateway certificado' },
]

function SegurancaPage() {
  return (
    <>
      {/* Hero */}
      <section className="px-5 md:px-12 pt-16 md:pt-24 pb-16 md:pb-24 bg-canvas">
        <div className="max-w-7xl mx-auto">
          <motion.span
            variants={fadeUp} initial="hidden" animate="visible"
            className="font-label text-[10px] font-bold tracking-[0.4em] uppercase text-primary mb-6 md:mb-10 block"
          >
            Segurança & LGPD
          </motion.span>
          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible"
            transition={{ delay: 0.08 }}
            className="font-headline font-black text-[clamp(2rem,5vw,4rem)] leading-[0.9] tracking-tighter uppercase mb-6 md:mb-10 max-w-3xl text-ink"
          >
            Dados clínicos pedem cuidado clínico<span className="text-primary">.</span>
          </motion.h1>
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible"
            transition={{ delay: 0.16 }}
            className="text-sm md:text-base text-ink-soft/80 max-w-2xl leading-relaxed"
          >
            O Evolua nasceu lidando com dado sensível. Esta página resume o que a gente faz pra proteger seu trabalho — e o de quem confia em você.
          </motion.p>
        </div>
      </section>

      {/* Práticas */}
      <section className="px-5 md:px-12 pb-16 md:pb-24 bg-canvas">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-outline-variant">
            {praticas.map((p, i) => (
              <motion.div
                key={p.titulo}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: Math.min(i * 0.04, 0.2), ease: [0.22, 1, 0.36, 1] as const }}
                className="bg-canvas p-8 md:p-10"
              >
                <span className="material-symbols-outlined text-3xl text-primary mb-5 block">
                  {p.icone}
                </span>
                <h3 className="font-headline font-bold text-lg md:text-xl uppercase tracking-tight text-ink mb-3">
                  {p.titulo}
                </h3>
                <p className="text-ink-soft/80 text-sm md:text-base leading-relaxed">{p.descricao}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certificações */}
      <section className="py-20 md:py-28 px-5 md:px-12 bg-surface-low">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }}
            className="font-headline font-black text-2xl md:text-3xl uppercase tracking-tighter text-ink mb-12 md:mb-16"
          >
            Padrões que a gente segue<span className="text-primary">.</span>
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-outline-variant">
            {certificacoes.map((c) => (
              <div key={c.sigla} className="bg-surface-low p-8 md:p-10 text-center">
                <div className="font-headline font-black text-2xl md:text-3xl tracking-tighter text-primary mb-2">
                  {c.sigla}
                </div>
                <div className="font-label text-[10px] font-bold tracking-[0.25em] uppercase text-muted">
                  {c.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Direitos do titular */}
      <section className="py-20 md:py-32 px-5 md:px-12 bg-canvas">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.55 }}
            className="font-headline font-black text-2xl md:text-3xl uppercase tracking-tighter text-ink mb-8"
          >
            Seus direitos como titular de dados<span className="text-primary">.</span>
          </motion.h2>
          <ul className="space-y-4 text-ink-soft/80 text-sm md:text-base leading-relaxed">
            {[
              'Confirmar a existência e finalidade do tratamento dos seus dados',
              'Acessar seus dados a qualquer momento',
              'Corrigir dados incompletos, desatualizados ou imprecisos',
              'Solicitar anonimização, bloqueio ou eliminação de dados desnecessários',
              'Pedir a portabilidade dos dados para outro fornecedor',
              'Revogar o consentimento previamente dado',
              'Opor-se ao tratamento quando este não cumprir a LGPD',
            ].map((d) => (
              <li key={d} className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-base mt-0.5 shrink-0">
                  check_circle
                </span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Contato DPO */}
      <section className="py-20 md:py-28 px-5 md:px-12 bg-deep text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-headline font-black text-3xl md:text-4xl uppercase tracking-tighter leading-[0.9] mb-6">
            Contato com a DPO<span className="text-neon">.</span>
          </h2>
          <p className="text-lavender-mid text-sm md:text-base leading-relaxed mb-8 max-w-xl mx-auto">
            Para exercer qualquer dos direitos acima, reportar incidente ou tirar dúvida sobre nossas práticas de segurança, fale direto com nossa Encarregada de Proteção de Dados.
          </p>
          <a
            href="mailto:privacidade@evolua.com.br"
            className="inline-block bg-neon text-ink px-10 py-5 btn-text text-sm hover:scale-95 transition-all duration-200"
          >
            privacidade@evolua.com.br
          </a>
          <p className="text-lavender-mid/70 text-[10px] font-bold tracking-[0.2em] uppercase mt-6">
            Resposta em até 15 dias úteis · veja também a{' '}
            <Link to="/privacidade" className="text-neon hover:underline">Política de Privacidade</Link>
          </p>
        </div>
      </section>
    </>
  )
}
