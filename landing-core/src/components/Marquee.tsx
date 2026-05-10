import { ScrollBasedVelocity } from './magicui/scroll-based-velocity'

const rows = [
  'AGENDA SEM FUROS • PACIENTES NOVOS • SUA AJUDANTE INTELIGENTE • CRESCIMENTO PROFISSIONAL',
  'MARKETING QUE FUNCIONA • GENTE COMO A GENTE • IA DE SESSÃO • FINANCEIRO INTEGRADO',
]

export function Marquee() {
  return (
    <ScrollBasedVelocity
      texts={rows}
      velocity={1.5}
      className="bg-primary py-6 md:py-10"
      textClassName="text-white font-headline font-black text-xl md:text-3xl tracking-tight"
      separator="•"
    />
  )
}
