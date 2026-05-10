import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'

export const Route = createFileRoute('/privacidade')({
  component: PrivacidadePage,
})

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

const secoes = [
  {
    titulo: '1. Quem Somos',
    conteudo: 'O Evolua é uma plataforma de gestão clínica para fonoaudiólogas. Atuamos como operador de dados conforme a LGPD (Lei 13.709/2018), processando dados pessoais de pacientes em nome das fonoaudiólogas (controladoras), e como controlador dos dados das próprias usuárias da plataforma.',
  },
  {
    titulo: '2. Dados que Coletamos',
    conteudo: 'Coletamos dados de cadastro das profissionais (nome, CPF/CNPJ, e-mail, telefone), dados clínicos inseridos pelas fonoaudiólogas (informações de pacientes, prontuários, evoluções), dados de uso da plataforma (logs de acesso, funcionalidades utilizadas) e dados de pagamento (processados via gateway certificado PCI-DSS — não armazenamos dados de cartão).',
  },
  {
    titulo: '3. Como Usamos seus Dados',
    conteudo: 'Utilizamos seus dados para: prestar o serviço contratado, enviar comunicações sobre o produto e suporte, melhorar a plataforma com base em métricas de uso (anonimizadas), cumprir obrigações legais e regulatórias, e enviar conteúdo educativo se você optar pela newsletter.',
  },
  {
    titulo: '4. Compartilhamento de Dados',
    conteudo: 'Não vendemos seus dados. Compartilhamos apenas com subprocessadores necessários para a prestação do serviço: infraestrutura de nuvem (servidores no Brasil), gateway de pagamento, serviço de e-mail transacional e WhatsApp Business API. Todos os subprocessadores passam por avaliação de conformidade LGPD.',
  },
  {
    titulo: '5. Segurança dos Dados',
    conteudo: 'Aplicamos criptografia em trânsito (TLS 1.3) e em repouso (AES-256). Mantemos log de auditoria de todos os acessos a dados clínicos. Realizamos backups automáticos com retenção de 90 dias. Nossa equipe de segurança monitora a plataforma 24/7.',
  },
  {
    titulo: '6. Seus Direitos como Titular',
    conteudo: 'Conforme a LGPD, você tem direito a: confirmação de tratamento, acesso aos dados, correção de dados incompletos ou desatualizados, anonimização ou eliminação de dados desnecessários, portabilidade dos dados, revogação do consentimento e oposição ao tratamento. Para exercer seus direitos, entre em contato com nossa DPO pelo e-mail privacidade@evolua.com.br.',
  },
  {
    titulo: '7. Retenção e Eliminação',
    conteudo: 'Dados clínicos são mantidos pelo prazo exigido pelo CFoF (mínimo 5 anos após o encerramento do tratamento). Dados de conta são eliminados em até 30 dias após o cancelamento, salvo obrigações legais. Você pode solicitar a exportação dos seus dados antes do cancelamento.',
  },
  {
    titulo: '8. Cookies',
    conteudo: 'Utilizamos cookies essenciais para o funcionamento da plataforma e cookies analíticos (anonimizados) para entender como o sistema é usado. Você pode gerenciar as preferências de cookies no banner exibido no primeiro acesso.',
  },
  {
    titulo: '9. Contato com o DPO',
    conteudo: 'Nossa Encarregada de Proteção de Dados (DPO) está disponível para responder dúvidas e solicitações relacionadas a dados pessoais. Contato: privacidade@evolua.com.br. Respondemos em até 15 dias úteis.',
  },
]

function PrivacidadePage() {
  return (
    <>
      <section className="px-5 md:px-12 pt-16 md:pt-24 pb-16 md:pb-24 bg-canvas">
        <div className="max-w-7xl mx-auto">
          <motion.span
            variants={fadeUp} initial="hidden" animate="visible"
            className="font-label text-[10px] font-bold tracking-[0.4em] uppercase text-primary mb-6 md:mb-10 block"
          >
            Legal
          </motion.span>
          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible"
            transition={{ delay: 0.08 }}
            className="font-headline font-black text-[clamp(2rem,5vw,3.5rem)] leading-[0.9] tracking-tighter uppercase mb-6 max-w-3xl text-ink"
          >
            Política de Privacidade<span className="text-primary">.</span>
          </motion.h1>
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible"
            transition={{ delay: 0.16 }}
            className="text-sm text-muted"
          >
            Última atualização: maio de 2025 · Conforme LGPD (Lei 13.709/2018)
          </motion.p>
        </div>
      </section>

      <section className="px-5 md:px-12 pb-20 md:pb-32 bg-canvas">
        <div className="max-w-3xl mx-auto space-y-12">
          {secoes.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }}
            >
              <h2 className="font-headline font-bold text-lg md:text-xl uppercase tracking-tight text-ink mb-4 pb-4 border-b border-outline-variant">
                {s.titulo}
              </h2>
              <p className="text-ink-soft/80 text-sm md:text-base leading-relaxed">{s.conteudo}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  )
}
