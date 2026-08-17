import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { SeoHead } from '../../components/seo/SeoHead'

export const Route = createFileRoute('/newsletter/cancelar')({
  component: CancelarInscricao,
})

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

type Status = 'loading' | 'success' | 'error'

function CancelarInscricao() {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')
  const [status, setStatus] = useState<Status>(() => (token ? 'loading' : 'error'))

  useEffect(() => {
    if (!token) return
    let cancelled = false

    const run = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL ?? ''
        if (!apiUrl) throw new Error('API indisponível')
        const response = await fetch(`${apiUrl}/api/newsletter/unsubscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        if (!cancelled) setStatus(response.ok ? 'success' : 'error')
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [token])

  const estados = {
    loading: { icon: 'progress_activity', text: 'Cancelando sua inscrição…' },
    success: { icon: 'check_circle', text: 'Inscrição cancelada com sucesso!' },
    error: { icon: 'error', text: 'Link inválido ou já expirou. Tente novamente ou entre em contato.' },
  }

  const e = estados[status]

  return (
    <>
      <SeoHead
        title="Cancelar Inscrição"
        description="Cancele sua inscrição na newsletter do Evolua."
        path="/newsletter/cancelar"
      />
    <section className="px-5 md:px-12 py-24 md:py-32 bg-canvas min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-8">
          <span className="material-symbols-outlined text-6xl text-primary block">
            {e.icon}
          </span>
          <h1 className="font-headline font-black text-3xl md:text-4xl uppercase tracking-tighter leading-[0.95] text-ink">
            {e.text}
          </h1>
          {status === 'success' && (
            <p className="text-ink-soft/80 text-sm md:text-base leading-relaxed">
              Você não receberá mais nossos emails. Se mudar de ideia, é só se inscrever novamente no blog.
            </p>
          )}
          <Link
            to="/"
            className="inline-block bg-primary text-white font-label text-xs font-bold tracking-[0.3em] uppercase px-8 py-4 hover:bg-primary-hover transition-colors"
          >
            Voltar para o início
          </Link>
        </motion.div>
      </div>
    </section>
    </>
  )
}
