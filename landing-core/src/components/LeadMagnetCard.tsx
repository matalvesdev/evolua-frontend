import { useState } from 'react'
import { motion } from 'motion/react'
import { supabase } from '../lib/supabase'

interface LeadMagnet {
  id: string
  title: string
  description: string
  icon: string
  tipo: 'ebook' | 'infografico'
  cor: 'text-primary' | 'text-lavender-deep'
  corBg: 'bg-primary/10' | 'bg-lavender'
}

const LEAD_MAGNETS: LeadMagnet[] = [
  {
    id: 'ebook-tendencias',
    title: 'E-book: Tendências em Fonoaudiologia 2026',
    description: 'Guia completo com as principais tendências, tecnologias e oportunidades da área.',
    icon: 'menu_book',
    tipo: 'ebook',
    cor: 'text-primary',
    corBg: 'bg-primary/10',
  },
  {
    id: 'ebook-protocolos',
    title: 'E-book: Guia de Protocolos Clínicos',
    description: 'MBGR, DOSS, GRBAS e FOIS — guia prático para estruturar sua documentação clínica com protocolos validados.',
    icon: 'menu_book',
    tipo: 'ebook',
    cor: 'text-lavender-deep',
    corBg: 'bg-lavender',
  },
  {
    id: 'ebook-mkt-digital-fono',
    title: 'E-book: Marketing Digital para Fonoaudiólogas',
    description: 'Estratégias de marketing digital para atrair, converter e reter pacientes orgânica e digitalmente.',
    icon: 'campaign',
    tipo: 'ebook',
    cor: 'text-primary',
    corBg: 'bg-primary/10',
  },
  {
    id: 'infografico-marcos-fala',
    title: 'Infográfico: Marcos do Desenvolvimento da Fala',
    description: 'Guia visual com os marcos do desenvolvimento da fala e linguagem dos 0 aos 6 anos, por faixa etária.',
    icon: 'info',
    tipo: 'infografico',
    cor: 'text-lavender-deep',
    corBg: 'bg-lavender',
  },
  {
    id: 'infografico-montar-clinica',
    title: 'Infográfico: Como Montar sua Clínica de Fonoaudiologia',
    description: 'Passo a passo visual para estruturar sua clínica: documentação, espaço, equipamentos, fluxo de pacientes e muito mais.',
    icon: 'home_health',
    tipo: 'infografico',
    cor: 'text-primary',
    corBg: 'bg-primary/10',
  },
  {
    id: 'ebook-whatsapp',
    title: 'E-book: WhatsApp Profissional para Fonoaudiólogas',
    description: 'Guia completo de configuração, LGPD, cobrança e integração com CRM para turbinar sua clínica.',
    icon: 'chat',
    tipo: 'ebook',
    cor: 'text-lavender-deep',
    corBg: 'bg-lavender',
  },
  {
    id: 'infografico-precos',
    title: 'Infográfico: Estratégia de Preços para Fonoaudiólogas',
    description: 'Guia visual para definir o valor da sua sessão, fórmula de precificação e quando reajustar.',
    icon: 'attach_money',
    tipo: 'infografico',
    cor: 'text-primary',
    corBg: 'bg-primary/10',
  },
  {
    id: 'infografico-humanizado',
    title: 'Infográfico: Atendimento Humanizado na Fonoaudiologia',
    description: 'Pilares do atendimento humanizado, checklist para primeira consulta e tecnologia a favor do cuidado.',
    icon: 'favorite',
    tipo: 'infografico',
    cor: 'text-lavender-deep',
    corBg: 'bg-lavender',
  },
]

const TIPO_LABEL: Record<string, string> = {
  ebook: 'E-book',
  infografico: 'Infográfico',
}

export function LeadMagnetCard({ magnet, index = 0 }: { magnet: LeadMagnet; index?: number }) {
  const [capturing, setCapturing] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const apiUrl = import.meta.env.VITE_API_URL ?? ''

  function handleDownload(e: React.MouseEvent) {
    e.preventDefault()
    setCapturing(true)
    setErrorMsg('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setErrorMsg('')

    try {
      const res = await fetch(`${apiUrl}/api/email/lead-magnet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, magnetId: magnet.id }),
      })
      if (!res.ok) throw new Error('Erro ao registrar download')

      if (supabase) {
        await supabase
          .from('newsletter_subscribers')
          .upsert({ email, source: 'lead_magnet' }, { onConflict: 'email', ignoreDuplicates: true })
      }

      setSent(true)
      setCapturing(false)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao enviar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 50, damping: 18 }}
        className="border border-outline-variant bg-surface p-6 flex flex-col items-center gap-3 text-center"
      >
        <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
        <p className="text-sm font-bold text-ink">Material enviado!</p>
        <p className="text-xs text-ink-soft">Verifique seu email para fazer o download.</p>
      </motion.div>
    )
  }

  if (capturing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 50, damping: 18 }}
        className="border border-outline-variant bg-surface p-6"
      >
        <p className="text-xs font-bold text-ink mb-3">Digite seu email para baixar:</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Seu melhor email"
            required
            disabled={loading}
            className="w-full border border-outline-variant px-3 py-2 text-sm text-ink bg-canvas focus:outline-none focus:border-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-deep text-neon py-2 text-sm font-bold hover:bg-ink transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-neon border-t-transparent rounded-full animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar material'
            )}
          </button>
        </form>
        {errorMsg && (
          <p className="text-xs text-red-500 mt-2">{errorMsg}</p>
        )}
        <button onClick={() => { if (!loading) setCapturing(false); setErrorMsg(''); }} className="text-xs text-muted mt-2 hover:text-ink transition-colors disabled:opacity-50" disabled={loading}>
          Voltar
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 50, damping: 18, delay: index * 0.08 }}
      className="border border-outline-variant bg-surface p-6 hover:border-primary/30 transition-all group"
    >
      <div className={`w-10 h-10 ${magnet.corBg} flex items-center justify-center mb-4`}>
        <span className={`material-symbols-outlined ${magnet.cor} text-xl`} style={{ fontVariationSettings: '"FILL" 1' }}>{magnet.icon}</span>
      </div>
      <div className="mb-1">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${magnet.cor}`}>{TIPO_LABEL[magnet.tipo]}</span>
      </div>
      <h3 className="font-headline font-bold text-sm text-ink mb-2">{magnet.title}</h3>
      <p className="text-xs text-ink-soft mb-4 leading-relaxed">{magnet.description}</p>
      <button
        onClick={handleDownload}
        className="text-xs font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
      >
        Baixar grátis
        <span className="material-symbols-outlined text-sm">download</span>
      </button>
    </motion.div>
  )
}

export function LeadMagnetsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {LEAD_MAGNETS.map((m, i) => (
        <LeadMagnetCard key={m.id} magnet={m} index={i} />
      ))}
    </div>
  )
}
