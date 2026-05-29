import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { initSentry, Sentry } from './lib/sentry'
import { initAnalytics } from './lib/analytics'
import { CookieConsent } from './components/CookieConsent'
import type { ReactNode } from 'react'
import './index.css'

const SentryBoundary = Sentry.ErrorBoundary as unknown as (props: {
  children: ReactNode
  fallback: ReactNode
}) => ReactNode

initSentry()
initAnalytics()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SentryBoundary
      fallback={
        <div role="alert" style={{ padding: 24, fontFamily: 'system-ui' }}>
          <h1>Algo deu errado.</h1>
          <p>Tente recarregar a página.</p>
        </div>
      }
    >
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <CookieConsent />
        </QueryClientProvider>
      </HelmetProvider>
    </SentryBoundary>
  </StrictMode>,
)
