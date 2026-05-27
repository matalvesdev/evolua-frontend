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
  'checklist-gestao': {
    id: 'checklist-gestao',
    title: 'Checklist de Gestão Clínica',
    description: '20 itens essenciais para organizar seu consultório de fonoaudiologia.',
    icon: 'checklist',
    tipo: 'checklist',
  },
  'planilha-financeiro': {
    id: 'planilha-financeiro',
    title: 'Planilha de Controle Financeiro',
    description: 'Controle mensal de receitas, despesas e fluxo de caixa.',
    icon: 'table_chart',
    tipo: 'planilha',
  },
  'ebook-tendencias': {
    id: 'ebook-tendencias',
    title: 'E-book: Tendências em Fonoaudiologia 2026',
    description: 'Guia com as principais tendências e oportunidades da área.',
    icon: 'menu_book',
    tipo: 'ebook',
  },
  'template-relatorio': {
    id: 'template-relatorio',
    title: 'Template de Relatório Clínico',
    description: 'Modelo pronto no padrão CFoF — é só preencher.',
    icon: 'description',
    tipo: 'template',
  },
}

const TIPO_LABEL: Record<string, string> = {
  checklist: 'Checklist',
  planilha: 'Planilha',
  ebook: 'E-book',
  template: 'Template',
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
