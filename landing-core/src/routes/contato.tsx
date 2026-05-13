import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { motion } from 'motion/react'
import { ASSUNTOS, contactSchema, submitContactMessage, type ContactInput } from '../lib/contact'

export const Route = createFileRoute('/contato')({
  component: ContatoPage,
})

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

type Status = 'idle' | 'loading' | 'success' | 'error'

const INITIAL: ContactInput = {
  nome: '',
  email: '',
  whatsapp: '',
  assunto: 'Geral',
  mensagem: '',
}

function ContatoPage() {
  const [values, setValues] = useState<ContactInput>(INITIAL)
  const [errors, setErrors] = useState<Partial<Record<keyof ContactInput, string>>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  function update<K extends keyof ContactInput>(key: K, value: ContactInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})
    setErrorMessage('')

    const result = contactSchema.safeParse(values)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactInput, string>> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ContactInput | undefined
        if (field && !fieldErrors[field]) fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setStatus('loading')
    try {
      await submitContactMessage(result.data)
      setStatus('success')
      setValues(INITIAL)
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Algo deu errado. Tente novamente.')
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="px-5 md:px-12 pt-16 md:pt-24 pb-12 md:pb-20 bg-canvas">
        <div className="max-w-7xl mx-auto">
          <motion.span
            variants={fadeUp} initial="hidden" animate="visible"
            className="font-label text-[10px] font-bold tracking-[0.4em] uppercase text-primary mb-6 md:mb-10 block"
          >
            Fale com a gente
          </motion.span>
          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible"
            transition={{ delay: 0.08 }}
            className="font-headline font-black text-[clamp(2rem,5vw,4rem)] leading-[0.9] tracking-tighter uppercase mb-6 md:mb-10 max-w-3xl text-ink"
          >
            A gente lê tudo<span className="text-primary">.</span>
          </motion.h1>
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible"
            transition={{ delay: 0.16 }}
            className="text-sm md:text-base text-ink-soft/80 max-w-xl leading-relaxed"
          >
            Dúvida, sugestão, parceria, imprensa, suporte — qualquer coisa. Resposta em até 1 dia útil.
          </motion.p>
        </div>
      </section>

      {/* Form + canais */}
      <section className="px-5 md:px-12 pb-20 md:pb-32 bg-canvas">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Form */}
          <div className="lg:col-span-7">
            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="bg-surface border border-outline-variant p-10 md:p-14 text-center"
              >
                <span className="material-symbols-outlined text-5xl text-primary mb-4 block">
                  mark_email_read
                </span>
                <h2 className="font-headline font-black text-2xl md:text-3xl uppercase tracking-tighter text-ink mb-3">
                  Recebido!
                </h2>
                <p className="text-ink-soft/80 text-sm md:text-base max-w-md mx-auto leading-relaxed">
                  Sua mensagem chegou aqui. A gente responde no e-mail que você deixou em até 1 dia útil.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-8 btn-text text-xs px-6 py-3 bg-primary text-white hover:scale-95 transition-transform"
                >
                  Enviar outra mensagem
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field
                    label="Seu nome"
                    name="nome"
                    value={values.nome}
                    onChange={(v) => update('nome', v)}
                    error={errors.nome}
                    autoComplete="name"
                    required
                  />
                  <Field
                    label="E-mail"
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={(v) => update('email', v)}
                    error={errors.email}
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field
                    label="WhatsApp (opcional)"
                    name="whatsapp"
                    value={values.whatsapp ?? ''}
                    onChange={(v) => update('whatsapp', v)}
                    error={errors.whatsapp}
                    autoComplete="tel"
                    placeholder="(11) 99999-9999"
                  />
                  <div>
                    <label htmlFor="assunto" className="block font-label text-[10px] font-bold tracking-[0.3em] uppercase text-muted mb-3">
                      Assunto
                    </label>
                    <select
                      id="assunto"
                      name="assunto"
                      value={values.assunto}
                      onChange={(e) => update('assunto', e.target.value as ContactInput['assunto'])}
                      className="w-full px-4 py-3.5 bg-surface text-ink font-body text-base border border-outline-variant focus:outline-none focus:border-primary transition-colors"
                    >
                      {ASSUNTOS.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="mensagem" className="block font-label text-[10px] font-bold tracking-[0.3em] uppercase text-muted mb-3">
                    Mensagem <span className="text-primary">*</span>
                  </label>
                  <textarea
                    id="mensagem"
                    name="mensagem"
                    rows={6}
                    value={values.mensagem}
                    onChange={(e) => update('mensagem', e.target.value)}
                    required
                    aria-invalid={!!errors.mensagem}
                    aria-describedby={errors.mensagem ? 'mensagem-error' : undefined}
                    placeholder="Conta pra gente o que você precisa..."
                    className="w-full px-4 py-3.5 bg-surface text-ink font-body text-base border border-outline-variant focus:outline-none focus:border-primary transition-colors resize-y"
                  />
                  {errors.mensagem && (
                    <p id="mensagem-error" role="alert" className="text-rose text-xs mt-2">
                      {errors.mensagem}
                    </p>
                  )}
                </div>
                {status === 'error' && (
                  <p role="alert" className="text-rose text-sm">
                    {errorMessage || 'Algo deu errado. Tente novamente.'}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-primary text-white px-10 py-5 btn-text text-sm hover:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? 'Enviando...' : 'Enviar mensagem'}
                </button>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted">
                  Seus dados são tratados conforme nossa{' '}
                  <a href="/privacidade" className="text-primary hover:underline">Política de Privacidade</a>.
                </p>
              </form>
            )}
          </div>

          {/* Canais alternativos */}
          <aside className="lg:col-span-5 space-y-8">
            <div className="bg-surface border border-outline-variant p-8">
              <h3 className="font-headline font-bold text-base uppercase tracking-tight text-ink mb-4">
                Suporte ao usuário
              </h3>
              <p className="text-ink-soft/80 text-sm leading-relaxed mb-4">
                Já é cliente? Entra direto pelo chat dentro do app — é mais rápido.
              </p>
              <a
                href="mailto:suporte@evolua.com.br"
                className="text-primary font-bold text-sm hover:underline break-all"
              >
                suporte@evolua.com.br
              </a>
            </div>
            <div className="bg-surface border border-outline-variant p-8">
              <h3 className="font-headline font-bold text-base uppercase tracking-tight text-ink mb-4">
                Privacidade & LGPD
              </h3>
              <p className="text-ink-soft/80 text-sm leading-relaxed mb-4">
                Dúvidas sobre dados, direitos do titular ou contato com a DPO:
              </p>
              <a
                href="mailto:privacidade@evolua.com.br"
                className="text-primary font-bold text-sm hover:underline break-all"
              >
                privacidade@evolua.com.br
              </a>
            </div>
            <div className="bg-surface border border-outline-variant p-8">
              <h3 className="font-headline font-bold text-base uppercase tracking-tight text-ink mb-4">
                Comercial & parcerias
              </h3>
              <p className="text-ink-soft/80 text-sm leading-relaxed mb-4">
                Quer falar de planos, integrações ou parcerias?
              </p>
              <a
                href="mailto:contato@evolua.com.br"
                className="text-primary font-bold text-sm hover:underline break-all"
              >
                contato@evolua.com.br
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}

// ── Field helper ─────────────────────────────────────────────────────────────
interface FieldProps {
  label: string
  name: string
  value: string
  onChange: (v: string) => void
  error?: string
  type?: string
  required?: boolean
  autoComplete?: string
  placeholder?: string
}

function Field({ label, name, value, onChange, error, type = 'text', required, autoComplete, placeholder }: FieldProps) {
  const errorId = error ? `${name}-error` : undefined
  return (
    <div>
      <label htmlFor={name} className="block font-label text-[10px] font-bold tracking-[0.3em] uppercase text-muted mb-3">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={errorId}
        className="w-full px-4 py-3.5 bg-surface text-ink font-body text-base border border-outline-variant focus:outline-none focus:border-primary transition-colors"
      />
      {error && (
        <p id={errorId} role="alert" className="text-rose text-xs mt-2">
          {error}
        </p>
      )}
    </div>
  )
}
