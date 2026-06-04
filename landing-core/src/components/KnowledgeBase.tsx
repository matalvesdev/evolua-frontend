import { useState } from 'react'

interface Article {
  id: string
  title: string
  category: string
  excerpt: string
  icon: string
}

const ARTICLES: Article[] = [
  { id: 'primeiros-passos', title: 'Primeiros passos no Evolua', category: 'Começando', excerpt: 'Como criar sua conta, configurar sua clínica e adicionar seus primeiros pacientes.', icon: 'rocket_launch' },
  { id: 'agenda-online', title: 'Configurar agenda online', category: 'Agenda', excerpt: 'Ative o link de agendamento público e configure horários de atendimento.', icon: 'calendar_month' },
  { id: 'whatsapp-integracao', title: 'Conectar WhatsApp', category: 'WhatsApp', excerpt: 'Escaneie o QR code e comece a enviar lembretes automáticos.', icon: 'chat' },
  { id: 'prontuario-evolucao', title: 'Preencher evolução clínica', category: 'Prontuário', excerpt: 'Use o sistema SOAP com IA para registrar suas sessões.', icon: 'description' },
  { id: 'billing-planos', title: 'Planos e faturamento', category: 'Financeiro', excerpt: 'Entenda os planos, formas de pagamento e como emitir notas fiscais.', icon: 'payments' },
  { id: 'relatorios', title: 'Gerar relatórios e laudos', category: 'Prontuário', excerpt: 'Modelos de relatório no padrão CFoF com assinatura digital.', icon: 'fact_check' },
  { id: 'teleconsulta', title: 'Realizar teleconsulta', category: 'Atendimento', excerpt: 'Configure e realize consultas online diretamente pelo Evolua.', icon: 'videocam' },
  { id: 'importar-pacientes', title: 'Importar pacientes', category: 'Começando', excerpt: 'Importe sua lista de pacientes via CSV ou manualmente.', icon: 'file_upload' },
  { id: 'lgpd', title: 'LGPD e segurança', category: 'Legal', excerpt: 'Como o Evolua protege seus dados e de seus pacientes.', icon: 'security' },
  { id: 'exercicios', title: 'Enviar exercícios para pacientes', category: 'Atendimento', excerpt: 'Prescreva exercícios e acompanhe a aderência pelo app do paciente.', icon: 'fitness_center' },
]

const CATEGORIAS = Array.from(new Set(ARTICLES.map(a => a.category)))

export function KnowledgeBase() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todas')

  const filtered = ARTICLES.filter(a => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'Todas' || a.category === category
    return matchSearch && matchCategory
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-sm">search</span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar na base de conhecimento..."
          className="w-full border border-outline-variant pl-10 pr-4 py-3 text-sm bg-surface text-ink placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        {['Todas', ...CATEGORIAS].map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              category === cat ? 'bg-primary text-white' : 'bg-surface border border-outline-variant text-on-surface-variant hover:border-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(article => (
          <div
            key={article.id}
            className="flex items-start gap-4 p-4 border border-outline-variant hover:border-primary/50 transition-all group bg-surface"
          >
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: '"FILL" 1' }}>{article.icon}</span>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{article.category}</span>
              <h3 className="font-headline font-bold text-sm text-ink mt-0.5 group-hover:text-primary transition-colors">{article.title}</h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{article.excerpt}</p>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-3xl text-outline-variant mb-2 block">search_off</span>
          <p className="text-sm text-on-surface-variant">Nenhum artigo encontrado para "{search}"</p>
        </div>
      )}
    </div>
  )
}

export function InAppSupport() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setSent(true)
    setMessage('')
  }

  return (
    <>
      {/* FAB button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-dark transition-colors z-50"
        aria-label="Suporte"
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>support_agent</span>
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 bg-surface border border-outline-variant shadow-xl z-50 flex flex-col">
          {/* Header */}
          <div className="bg-deep text-neon px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>support_agent</span>
              <span className="text-xs font-bold uppercase tracking-wide">Suporte Evolua</span>
            </div>
            <button onClick={() => { setOpen(false); setSent(false) }} className="text-neon/60 hover:text-neon">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="p-4 min-h-[200px] flex flex-col justify-end">
            {sent ? (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                <p className="text-sm text-ink mt-2 font-bold">Mensagem enviada!</p>
                <p className="text-xs text-on-surface-variant mt-1">Responderemos em até 2 horas em horário comercial.</p>
                <button onClick={() => setSent(false)} className="text-xs text-primary mt-3 hover:underline">
                  Enviar outra
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <p className="text-xs text-on-surface-variant">Olá! Como podemos ajudar?</p>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Descreva sua dúvida..."
                  rows={3}
                  className="w-full border border-outline-variant px-3 py-2 text-sm bg-surface text-ink placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary resize-none"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="w-full bg-deep text-neon py-2 text-sm font-bold hover:bg-ink transition-colors disabled:opacity-40"
                >
                  Enviar
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
