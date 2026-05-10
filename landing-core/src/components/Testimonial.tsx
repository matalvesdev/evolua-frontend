import { motion } from 'motion/react'
import { ShineBorder } from './magicui/shine-border'

const depoimentos = [
  {
    quote:
      'Gente, o EVOLUA me devolveu o brilho nos olhos pela fonoaudiologia! Hoje eu atendo super bem e ainda consigo ter vida no final de semana. É aquele alívio que a gente tanto procurava, sabe?',
    nome: 'ELENA VAZ',
    cargo: 'Fonoaudióloga que agora tem tempo livre',
    destaque: 'Agenda e prontuário',
    avatar: null, // usando iniciais EV
  },
  {
    quote:
      'A IA transcreve minha sessão em tempo real e já rascunha a evolução clínica. O que levava 40 minutos de escrita agora leva menos de 5. Parece mágica, mas é tecnologia feita pra fono de verdade.',
    nome: 'CAMILA TORRES',
    cargo: 'Fono especialista em voz — Rio de Janeiro',
    destaque: 'IA de sessão',
    avatar: null,
  },
  {
    quote:
      'Em 3 semanas já tinha recuperado o investimento. Os lembretes automáticos pelo WhatsApp zeraram as faltas. Antes eu perdia em média 6 sessões por mês. Hoje perco uma, quando muito.',
    nome: 'ANA PAULA',
    cargo: 'Fonoaudióloga em Belo Horizonte',
    destaque: 'WhatsApp automático',
    avatar: null,
  },
  {
    quote:
      'Os protocolos MBGR e DOSS já estão lá, prontos, dentro do prontuário. Nunca mais precisei criar uma planilha do zero ou adaptar formulário de médico pra fono. Finalmente um sistema que sabe o que a gente faz.',
    nome: 'RAFAELA MENEZES',
    cargo: 'Fonoaudióloga disfagia — São Paulo',
    destaque: 'Protocolos clínicos',
    avatar: null,
  },
  {
    quote:
      'O app do paciente foi um divisor de águas. Prescrevo os exercícios domiciliares com vídeo e consigo ver em tempo real quem está fazendo e quem não está. A aderência da minha clientela dobrou.',
    nome: 'JULIANA COSTA',
    cargo: 'Fono infantil — Curitiba',
    destaque: 'App do paciente',
    avatar: null,
  },
  {
    quote:
      'Tenho 3 profissionais na clínica e o financeiro consolidado por profissional me deu uma clareza que eu nunca tive. O faturamento TISS simplificado então... salvou minha vida com convênio.',
    nome: 'PATRICIA LEMOS',
    cargo: 'Proprietária de clínica — Fortaleza',
    destaque: 'Gestão de clínica',
    avatar: null,
  },
  {
    quote:
      'A teleconsulta integrada me permitiu atender pacientes do interior sem perder qualidade. Tudo dentro do mesmo prontuário, com gravação e relatório automáticos. Triplicou minha capacidade de atendimento.',
    nome: 'MARIANA SILVA',
    cargo: 'Fono em motricidade orofacial — Salvador',
    destaque: 'Teleconsulta',
    avatar: null,
  },
]

function Avatar({ nome }: { nome: string }) {
  const initials = nome
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
  return (
    <div className="w-11 h-11 rounded-full bg-lavender border border-lavender-mid flex items-center justify-center shrink-0">
      <span className="font-headline font-black text-primary text-sm">{initials}</span>
    </div>
  )
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0 },
}

const cardsContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

export function Testimonial() {
  const principal = depoimentos[0]
  const secundarios = depoimentos.slice(1)

  return (
    <section className="bg-canvas py-20 md:py-32 px-5 md:px-12">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-6"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ type: 'spring', stiffness: 55, damping: 18 }}
        >
          <div>
            <span className="font-label text-[10px] font-bold tracking-[0.4em] uppercase text-primary mb-6 block">
              Quem usa, fala
            </span>
            <h2 className="font-headline font-black text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter leading-[0.9] text-ink">
              Elas já mudaram<span className="text-primary">.</span>
            </h2>
          </div>
          <p className="max-w-md text-ink-soft/80 text-sm md:text-base leading-relaxed">
            Mais de 800 fonoaudiólogas em todo o Brasil usam o Evolua no dia a dia clínico.
          </p>
        </motion.div>

        {/* ── Depoimento principal ── */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ type: 'spring', stiffness: 45, damping: 18, delay: 0.08 }}
        >
          <ShineBorder
            className="bg-surface p-8 md:p-12 lg:p-16 w-full"
            color={['#6C63FF', '#EAE8FF', '#a78bfa']}
            duration={10}
            borderWidth={2}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center">
              {/* Quote */}
              <div className="md:col-span-7">
                <span className="material-symbols-outlined text-primary/30 text-4xl md:text-5xl mb-6 block">
                  format_quote
                </span>
                <blockquote className="font-headline font-bold text-xl md:text-2xl lg:text-[1.75rem] leading-[1.2] tracking-tighter text-ink">
                  "{principal.quote}"
                </blockquote>
              </div>
              {/* Author */}
              <div className="md:col-span-5 flex flex-col items-start md:items-center gap-4">
                <Avatar nome={principal.nome} />
                <div className="md:text-center">
                  <p className="font-headline font-black uppercase text-base tracking-tight text-ink">
                    {principal.nome}
                  </p>
                  <p className="font-label text-[10px] font-bold uppercase tracking-[0.25em] text-muted mt-1">
                    {principal.cargo}
                  </p>
                  <div className="mt-3 inline-block bg-lavender border border-outline-variant px-3 py-1.5">
                    <span className="font-label text-[9px] font-black tracking-[0.25em] uppercase text-primary">
                      {principal.destaque}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ShineBorder>
        </motion.div>

        {/* ── Grid secundários: 2 colunas no md, 3 no lg ── */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-outline-variant"
          variants={cardsContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {secundarios.map((d) => (
            <motion.div
              key={d.nome}
              variants={cardVariants}
              transition={{ type: 'spring', stiffness: 55, damping: 20 }}
              className="bg-canvas hover:bg-surface-low transition-colors duration-200 p-8 md:p-10 flex flex-col gap-5 min-h-[380px] md:min-h-[420px]"
            >
              {/* Badge */}
              <div className="inline-block bg-lavender border border-outline-variant px-3 py-1.5 self-start">
                <span className="font-label text-[9px] font-black tracking-[0.3em] uppercase text-primary">
                  {d.destaque}
                </span>
              </div>

              {/* Quote */}
              <p className="font-body text-sm md:text-base text-ink-soft/80 leading-relaxed flex-1">
                "{d.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-outline-variant">
                <Avatar nome={d.nome} />
                <div>
                  <p className="font-headline font-black uppercase text-sm tracking-tight text-ink leading-tight">
                    {d.nome}
                  </p>
                  <p className="font-label text-[9px] font-bold uppercase tracking-[0.2em] text-muted mt-0.5">
                    {d.cargo}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
