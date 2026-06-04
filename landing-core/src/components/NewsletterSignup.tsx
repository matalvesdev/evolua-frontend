import { useState } from 'react'
import { supabase } from '../lib/supabase'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function NewsletterSignup({ variant = 'default' }: { variant?: 'default' | 'inline' | 'footer' }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Email inválido')
      setStatus('error')
      return
    }
    setStatus('loading')
    try {
      const { error } = await supabase!.from('newsletter_subscribers').insert({
        email,
        source: window.location.pathname,
      })
      if (error) throw error
      setStatus('success')
      setEmail('')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao cadastrar')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-primary">
        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
        <span className="text-xs font-medium">Cadastrado! Você receberá nossa newsletter semanal.</span>
      </div>
    )
  }

  const isFooter = variant === 'footer'

  const inputClass = isFooter
    ? 'w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 px-3 py-2 text-xs focus:outline-none focus:border-primary transition-colors'
    : 'min-w-0 flex-1 bg-white border border-outline-variant px-4 py-3 text-sm text-ink placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors'

  const btnClass = isFooter
    ? 'bg-neon text-ink font-bold px-4 py-2 text-xs hover:bg-neon/90 transition-colors'
    : 'bg-deep text-neon font-bold px-6 py-3 text-sm hover:bg-ink transition-colors whitespace-nowrap'

  return (
    <form onSubmit={handleSubmit} className={isFooter ? 'flex gap-2' : 'flex flex-col gap-3'}>
      {!isFooter && (
        <p className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-primary">Fono em Foco</p>
      )}
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="seu@email.com.br"
          required
          className={inputClass}
          aria-label="Email para newsletter"
        />
        <button type="submit" disabled={status === 'loading'} className={btnClass}>
          {status === 'loading' ? '…' : 'Assinar'}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-rose text-xs">{errorMsg}</p>
      )}
      {variant === 'default' && (
        <p className="text-[10px] text-muted">Sem spam. Uma edição por semana. Cancela quando quiser.</p>
      )}
    </form>
  )
}
