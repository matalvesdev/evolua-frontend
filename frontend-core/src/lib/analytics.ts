const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

export function initAnalytics() {
  if (!GA_ID) return
  if (typeof window === 'undefined') return

  const win = window as unknown as { dataLayer: unknown[]; gtag: (...args: unknown[]) => void }
  win.dataLayer = win.dataLayer || []
  win.gtag = function gtag(...args: unknown[]) { win.dataLayer.push(args) }
  win.gtag('js', new Date())

  const consent = localStorage.getItem('evolua-cookie-consent')
  win.gtag('consent', 'default', {
    analytics_storage: consent === 'accepted' ? 'granted' : 'denied',
    ad_storage: consent === 'accepted' ? 'granted' : 'denied',
  })

  win.gtag('config', GA_ID, { send_page_view: true })

  const script = document.createElement('script')
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  script.async = true
  document.head.appendChild(script)
}

type EventParams = Record<string, string | number | boolean | undefined>

export function trackEvent(name: string, params?: EventParams) {
  const win = window as unknown as { gtag: (...args: unknown[]) => void }
  if (typeof win.gtag === 'function') {
    win.gtag('event', name, params)
  }
}
