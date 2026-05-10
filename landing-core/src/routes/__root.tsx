import { createRootRouteWithContext, Outlet, ScrollRestoration, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { QueryClient } from '@tanstack/react-query'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

const AUTH_PATHS = ['/entrar', '/cadastro']

function RootLayout() {
  const { location } = useRouterState()
  const isAuth = AUTH_PATHS.some((p) => location.pathname.startsWith(p))

  if (isAuth) {
    return (
      <div className="bg-canvas text-ink font-body overflow-x-hidden">
        <ScrollRestoration />
        <Outlet />
        {import.meta.env.DEV && (
          <>
            <TanStackRouterDevtools position="bottom-right" />
            <ReactQueryDevtools buttonPosition="bottom-left" />
          </>
        )}
      </div>
    )
  }

  return (
    <div className="bg-canvas text-ink font-body overflow-x-hidden">
      <ScrollRestoration />
      <Navbar />
      <main className="pt-[58px] md:pt-[65px]">
        <Outlet />
      </main>
      <Footer />
      {import.meta.env.DEV && (
        <>
          <TanStackRouterDevtools position="bottom-right" />
          <ReactQueryDevtools buttonPosition="bottom-left" />
        </>
      )}
    </div>
  )
}
