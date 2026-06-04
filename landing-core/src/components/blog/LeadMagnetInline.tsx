import { useState } from 'react'
import { supabase } from '../../lib/supabase'

interface LeadMagnet {
  id: string
  title: string
  description: string
  icon: string
  tipo: string
}

const ALL_MAGNETS: Record<string, LeadMagnet> = {
  'ebook-tendencias': {
    id: 'ebook-tendencias',
    title: 'E-book: Tendências em Fonoaudiologia 2026',
    description: 'Guia com as principais tendências e oportunidades da área.',
    icon: 'menu_book',
    tipo: 'ebook',
  },
  'ebook-protocolos': {
    id: 'ebook-protocolos',
    title: 'E-book: Guia de Protocolos Clínicos',
    description: 'MBGR, DOSS, GRBAS e FOIS — guia prático para sua documentação clínica.',
    icon: 'menu_book',
    tipo: 'ebook',
  },
  'ebook-mkt-digital-fono': {
    id: 'ebook-mkt-digital-fono',
    title: 'E-book: Marketing Digital para Fonoaudiólogas',
    description: 'Estratégias para atrair, converter e reter pacientes organicamente.',
    icon: 'campaign',
    tipo: 'ebook',
  },
  'infografico-marcos-fala': {
    id: 'infografico-marcos-fala',
    title: 'Infográfico: Marcos do Desenvolvimento da Fala',
    description: 'Marcos da fala e linguagem dos 0 aos 6 anos, por faixa etária.',
    icon: 'info',
    tipo: 'infografico',
  },
  'infografico-montar-clinica': {
    id: 'infografico-montar-clinica',
    title: 'Infográfico: Como Montar sua Clínica de Fonoaudiologia',
    description: 'Passo a passo visual para estruturar sua clínica do zero.',
    icon: 'home_health',
    tipo: 'infografico',
  },
}

const TIPO_LABEL: Record<string, string> = {
  ebook: 'E-book',
  infografico: 'Infográfico',
}

interface LeadMagnetInlineProps {
  magnetId: string
}

export function LeadMagnetInline({ magnetId }: LeadMagnetInlineProps) {
  const magnet = ALL_MAGNETS[magnetId]
  const [capturing, setCapturing] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!magnet) return null

  const apiUrl = import.meta.env.VITE_API_URL ?? ''

  if (sent) {
    return (
      <div className="border-l-2 border-primary bg-primary-container/30 p-5 md:p-6 my-10 md:my-12">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
          <p className="text-sm font-bold">Material enviado!</p>
        </div>
        <p className="text-xs text-on-surface-variant">Verifique seu email para fazer o download.</p>
      </div>
    )
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
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao enviar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-outline-variant bg-surface p-5 md:p-6 my-10 md:my-12" data-placement="lead-magnet">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: '"FILL" 1' }}>{magnet.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{TIPO_LABEL[magnet.tipo]} gratuito</span>
          <h3 className="font-headline font-bold text-base text-ink mt-1 mb-1">{magnet.title}</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed mb-4">{magnet.description}</p>

          {!capturing ? (
            <button
              onClick={() => setCapturing(true)}
              className="text-xs font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
            >
              Baixar grátis
              <span className="material-symbols-outlined text-sm">download</span>
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com.br"
                required
                disabled={loading}
                className="flex-1 border border-outline-variant px-3 py-2 text-sm text-ink bg-canvas focus:outline-none focus:border-primary disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-black text-white px-4 py-2 text-xs font-bold hover:bg-primary transition-colors disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Enviar material'
                )}
              </button>
            </form>
          )}
          {errorMsg && <p className="text-xs text-red-500 mt-2">{errorMsg}</p>}
        </div>
      </div>
    </div>
  )
}
