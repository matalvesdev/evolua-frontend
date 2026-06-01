import { useState } from 'react'

const COOKIE_CONSENT_KEY = 'evolua-cookie-consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false
    return !localStorage.getItem(COOKIE_CONSENT_KEY)
  })

  function accept() {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    setVisible(false)
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
      })
    }
  }

  function reject() {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="mx-auto flex max-w-4xl flex-col items-start gap-4 rounded-2xl border border-[#E0DFF9] bg-white/95 p-5 shadow-2xl backdrop-blur md:flex-row md:items-center md:justify-between">
        <p className="text-sm leading-relaxed text-[#1A1A2E]">
          Usamos cookies e tecnologias similares para melhorar sua experiência,
          analisar tráfego e personalizar conteúdo.{' '}
          <a
            href="/privacidade"
            className="font-medium text-[#6C63FF] underline underline-offset-2 hover:text-[#5A52E0]"
          >
            Política de Privacidade
          </a>
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={reject}
            className="rounded-lg border border-[#E0DFF9] px-4 py-2 text-sm font-medium text-[#6C63FF] transition-colors hover:bg-[#F0EFFB]"
          >
            Recusar
          </button>
          <button
            onClick={accept}
            className="rounded-lg bg-[#6C63FF] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5A52E0]"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  )
}
