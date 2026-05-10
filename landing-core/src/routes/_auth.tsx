import { createFileRoute, Outlet, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Minimal header */}
      <header className="px-5 md:px-12 py-5 flex items-center justify-between border-b border-outline-variant">
        <Link to="/" className="font-headline font-black text-2xl tracking-tighter text-ink hover:opacity-70 transition-opacity">
          EVOLUA
        </Link>
        <Link
          to="/"
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted hover:text-ink transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Voltar ao site
        </Link>
      </header>
      <main className="flex-1 flex">
        <Outlet />
      </main>
    </div>
  )
}
