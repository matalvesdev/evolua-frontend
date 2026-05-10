import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'

export const Route = createFileRoute('/termos')({
  component: TermosPage,
})

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

const secoes = [
  {
    titulo: '1. Aceitação dos Termos',
    conteudo: 'Ao criar uma conta ou utilizar o Evolua, você concorda com estes Termos de Uso. Se você não concordar com qualquer parte dos termos, não utilize o serviço. Estes termos se aplicam a todos os usuários da plataforma, incluindo fonoaudiólogas, clínicas e seus pacientes quando aplicável.',
  },
  {
    titulo: '2. Descrição do Serviço',
    conteudo: 'O Evolua é uma plataforma de gestão clínica desenvolvida especificamente para fonoaudiólogas. O serviço inclui prontuário eletrônico, agendamento online, módulo financeiro, comunicação automatizada via WhatsApp, teleconsulta e funcionalidades de inteligência artificial para suporte à documentação clínica.',
  },
  {
    titulo: '3. Conta e Responsabilidades',
    conteudo: 'Você é responsável por manter a confidencialidade de suas credenciais de acesso. Notifique imediatamente o Evolua sobre qualquer uso não autorizado da sua conta. O Evolua não será responsável por perdas causadas por acesso não autorizado resultante da sua negligência na proteção das credenciais.',
  },
  {
    titulo: '4. Dados Clínicos e LGPD',
    conteudo: 'Os dados dos pacientes inseridos na plataforma são de titularidade do paciente e de responsabilidade legal da profissional (controladora de dados). O Evolua atua como operador de dados conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018). Todos os dados são armazenados com criptografia em servidores no Brasil.',
  },
  {
    titulo: '5. Propriedade Intelectual',
    conteudo: 'Todo o conteúdo da plataforma Evolua — incluindo software, design, textos, templates clínicos e funcionalidades de IA — é de propriedade do Evolua e protegido por lei. É proibida a reprodução, cópia ou engenharia reversa sem autorização expressa por escrito.',
  },
  {
    titulo: '6. Pagamento e Cancelamento',
    conteudo: 'Os planos são cobrados mensalmente ou anualmente, conforme escolha na contratação. O cancelamento pode ser feito a qualquer momento pelo próprio painel, sem multa. Em caso de cancelamento, o acesso permanece ativo até o fim do período pago. O período de trial de 14 dias é gratuito, sem necessidade de cartão de crédito.',
  },
  {
    titulo: '7. Limitação de Responsabilidade',
    conteudo: 'O Evolua é uma ferramenta de suporte à gestão clínica e não substitui o julgamento clínico da fonoaudióloga. Relatórios e rascunhos gerados por IA devem ser revisados e são de responsabilidade da profissional antes da assinatura. O Evolua não se responsabiliza por decisões clínicas tomadas com base no uso da plataforma.',
  },
  {
    titulo: '8. Modificações e Atualizações',
    conteudo: 'O Evolua pode modificar estes Termos a qualquer momento, com aviso prévio de 30 dias por e-mail para alterações materiais. O uso contínuo após as modificações constitui aceitação dos novos termos.',
  },
  {
    titulo: '9. Lei Aplicável',
    conteudo: 'Estes Termos são regidos pelas leis da República Federativa do Brasil. Para dirimir quaisquer controvérsias, fica eleito o foro da Comarca de Curitiba/PR, com renúncia a qualquer outro, por mais privilegiado que seja.',
  },
]

function TermosPage() {
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
            Termos de Uso<span className="text-primary">.</span>
          </motion.h1>
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible"
            transition={{ delay: 0.16 }}
            className="text-sm text-muted"
          >
            Última atualização: maio de 2025
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
