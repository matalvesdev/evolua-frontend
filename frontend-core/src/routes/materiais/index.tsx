import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Logo } from '@/components/Logo'

const API_URL = import.meta.env.VITE_API_URL

export const Route = createFileRoute('/materiais/')({
  component: LeadMagnetPage,
})

function LeadMagnetPage() {
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [cidade, setCidade] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [erro, setErro] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome || !email || !whatsapp) {
      setErro('Preencha nome, email e WhatsApp.')
      setStatus('error')
      return
    }
    setStatus('loading')
    setErro('')

    try {
      const res = await fetch(`${API_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          email,
          whatsapp,
          cidade: cidade || null,
          comoConheceu: 'lead-magnet:ebook-whatsapp-profissional',
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Erro ao cadastrar. Tente novamente.')
      }

      setStatus('success')
      navigate({ to: '/materiais/obrigado' })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao cadastrar.')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="px-5 md:px-12 py-5 flex items-center justify-between border-b border-border-soft">
        <Link to="/" className="hover:opacity-70 transition-opacity">
          <Logo variant="quad" size="sm" />
        </Link>
        <Link
          to="/"
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-text-tertiary hover:text-text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Voltar ao site
        </Link>
      </header>

      <main className="flex flex-col">
        {/* Hero Section */}
        <section className="bg-dark text-white py-16 md:py-24 px-5 md:px-12 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-neon/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-2xl" />
          </div>

          <div className="max-w-6xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left: Copy */}
            <div className="flex-1 text-center lg:text-left">
              <span className="font-label text-[9px] font-bold tracking-[0.4em] uppercase text-neon/60 block mb-6">
                Material Gratuito
              </span>
              <h1 className="font-headline font-black text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter leading-[0.88] mb-6">
                WhatsApp<br />
                <span className="text-neon">Profissional</span><br />
                para Fonoaudiólogas
              </h1>
              <p className="text-white/70 text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8">
                Automatize agendamentos, cobranças e laudos em 7 dias — mesmo que você nunca tenha usado automação.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <span className="material-symbols-outlined text-neon text-base">description</span>
                  E-book completo
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <span className="material-symbols-outlined text-neon text-base">checklist</span>
                  Templates prontos
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <span className="material-symbols-outlined text-neon text-base">calendar_month</span>
                  Plano de 30 dias
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="w-full max-w-md bg-surface rounded-2xl p-8 border border-border-soft">
              <h2 className="font-headline font-black text-xl uppercase tracking-tighter mb-2">
                Baixe Grátis
              </h2>
              <p className="text-sm text-on-surface-variant mb-6">
                Preencha abaixo e receba o e-book completo no seu email.
              </p>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                  <label htmlFor="nome" className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-on-surface-variant block mb-2">
                    Nome completo
                  </label>
                  <input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full px-4 py-3.5 border-2 border-border bg-surface-low font-body text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-on-surface-variant block mb-2">
                    Email profissional
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com.br"
                    className="w-full px-4 py-3.5 border-2 border-border bg-surface-low font-body text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="whatsapp" className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-on-surface-variant block mb-2">
                    WhatsApp
                  </label>
                  <input
                    id="whatsapp"
                    type="tel"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    placeholder="(11) 99999-8888"
                    className="w-full px-4 py-3.5 border-2 border-border bg-surface-low font-body text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="cidade" className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-on-surface-variant block mb-2">
                    Cidade <span className="text-on-surface-variant/50">(opcional)</span>
                  </label>
                  <input
                    id="cidade"
                    type="text"
                    value={cidade}
                    onChange={e => setCidade(e.target.value)}
                    placeholder="São Paulo, SP"
                    className="w-full px-4 py-3.5 border-2 border-border bg-surface-low font-body text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                {status === 'error' && erro && (
                  <div role="alert" className="flex items-center gap-2 p-3 bg-error-container border border-error/20 text-on-error-container text-xs font-medium">
                    <span className="material-symbols-outlined text-base text-error shrink-0">error</span>
                    {erro}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-dark text-neon py-4 btn-text text-sm hover:bg-ink transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {status === 'loading' ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-neon/30 border-t-neon rounded-full animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    'QUERO RECEBER O E-BOOK'
                  )}
                </button>

                <p className="text-[10px] text-on-surface-variant text-center leading-relaxed">
                  Dados protegidos. Não enviamos spam. Ao baixar, você concorda com nossa{' '}
                  <Link to="/privacidade" className="underline hover:text-primary">Política de Privacidade</Link>.
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* Pillars Section */}
        <section className="py-16 md:py-20 px-5 md:px-12 max-w-6xl mx-auto w-full">
          <div className="text-center mb-12">
            <span className="font-label text-[9px] font-bold tracking-[0.4em] uppercase text-primary block mb-4">
              O que você vai aprender
            </span>
            <h2 className="font-headline font-black text-3xl md:text-4xl uppercase tracking-tighter leading-[0.9]">
              3 pilares para transformar<br />
              <span className="text-primary">o caos em sistema</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-surface border border-border-soft rounded-2xl p-8 text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-5">
                <span className="material-symbols-outlined text-2xl text-primary">calendar_month</span>
              </div>
              <h3 className="font-headline font-bold text-lg uppercase tracking-tight mb-3">Agenda Inteligente</h3>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li>Link de agendamento online</li>
                <li>Confirmação automática</li>
                <li>Lembrete 24h antes</li>
                <li className="text-primary font-bold">Redução de 70% das faltas</li>
              </ul>
            </div>

            <div className="bg-surface border border-border-soft rounded-2xl p-8 text-center">
              <div className="w-14 h-14 bg-neon/10 rounded-xl flex items-center justify-center mx-auto mb-5">
                <span className="material-symbols-outlined text-2xl text-neon">payments</span>
              </div>
              <h3 className="font-headline font-bold text-lg uppercase tracking-tight mb-3">Cobrança Automatizada</h3>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li>Lembrete de vencimento</li>
                <li>Link PIX/cartão</li>
                <li>Comprovante automático</li>
                <li className="text-primary font-bold">-50% inadimplência</li>
              </ul>
            </div>

            <div className="bg-surface border border-border-soft rounded-2xl p-8 text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-5">
                <span className="material-symbols-outlined text-2xl text-primary">description</span>
              </div>
              <h3 className="font-headline font-bold text-lg uppercase tracking-tight mb-3">Laudos Digitais</h3>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li>Geração automática</li>
                <li>Link seguro no WhatsApp</li>
                <li>Confirmação de recebimento</li>
                <li className="text-primary font-bold">Conformidade LGPD</li>
              </ul>
            </div>
          </div>
        </section>

        {/* What's inside */}
        <section className="bg-dark text-white py-16 md:py-20 px-5 md:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="font-label text-[9px] font-bold tracking-[0.4em] uppercase text-neon/60 block mb-4">
                O e-book inclui
              </span>
              <h2 className="font-headline font-black text-3xl md:text-4xl uppercase tracking-tighter leading-[0.9]">
                Tudo que você precisa<br />
                <span className="text-neon">para organizar</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {[
                ['check_circle', 'Diagnóstico completo do seu WhatsApp'],
                ['check_circle', 'Framework WAP passo a passo'],
                ['check_circle', 'Roteiro de implementação de 7 dias'],
                ['check_circle', 'Templates de mensagens prontos'],
                ['check_circle', 'Planilha de horários + checklist'],
                ['check_circle', 'Plano de 30 dias para resultados'],
              ].map(([icon, text]) => (
                <div key={text} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-neon text-lg">{icon}</span>
                  <span className="text-white/80 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-16 px-5 md:px-12 max-w-4xl mx-auto w-full text-center">
          <div className="border-l-2 border-neon pl-6 md:pl-10 text-left max-w-xl mx-auto">
            <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed italic mb-5">
              "Organizar o WhatsApp foi o primeiro passo pra organizar a clínica inteira. Em 30 dias a receita subiu 22%."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 flex items-center justify-center">
                <span className="font-headline font-black text-sm text-primary">DC</span>
              </div>
              <div>
                <p className="font-bold text-sm uppercase tracking-wide">Dra. Carla</p>
                <p className="text-xs text-on-surface-variant">Fonoaudióloga · Belo Horizonte</p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="pb-16 px-5 md:px-12 text-center">
          <a
            href="#form-top"
            onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="inline-flex items-center gap-2 bg-dark text-neon px-8 py-4 btn-text text-sm hover:bg-ink transition-all duration-300"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            QUERO BAIXAR O E-BOOK GRÁTIS
          </a>
          <p className="text-[10px] text-on-surface-variant mt-4">14 dias grátis. Sem cartão de crédito.</p>
        </section>

        {/* Footer */}
        <footer className="border-t border-border-soft py-8 px-5 md:px-12 text-center">
          <p className="text-[10px] text-on-surface-variant">
            Evolua CRM — Feito para fonoaudiólogas, por quem entende de fonoaudiologia.
          </p>
        </footer>
      </main>
    </div>
  )
}
