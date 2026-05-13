import * as Sentry from '@sentry/react'

/**
 * Sentry para a landing page.
 *
 * Configuração mais leve que o app principal:
 * - Sem replay (landing é pública, não tem dados sensíveis)
 * - tracesSampleRate menor (alto volume de visitantes)
 *
 * No-op se VITE_SENTRY_DSN não estiver definido.
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT ?? import.meta.env.MODE,
    release: import.meta.env.VITE_SENTRY_RELEASE,
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? '0.05'),
    tracePropagationTargets: [/^\//, /^https:\/\/[^/]*useevolua\.com/],
    integrations: [Sentry.browserTracingIntegration()],
    sendDefaultPii: false,
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      /Loading chunk \d+ failed/,
    ],
  })
}

export { Sentry }
