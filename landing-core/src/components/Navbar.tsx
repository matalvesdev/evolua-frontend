import { useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { Logo } from './Logo'

const NAV_LINKS = [
  { label: 'Início', to: '/' },
  { label: 'Nosso Jeito', to: '/nosso-jeito' },
  { label: 'Planos', to: '/planos' },
  { label: 'Blog', to: '/blog' },
] as const

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { location } = useRouterState()
  const currentPath = location.pathname

  const isActive = (to: string) =>
    to === '/' ? currentPath === '/' : currentPath.startsWith(to)

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-outline-variant">
      <div className="flex justify-between items-center px-5 md:px-12 py-4 md:py-5 w-full max-w-[1920px] mx-auto">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <Logo width={140} variant="light" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8 xl:gap-10">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`text-[10px] lg:text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap relative group ${
                isActive(item.to) ? 'text-ink' : 'text-muted hover:text-ink-soft'
              }`}
            >
              {item.label}
              <span
                className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
                  isActive(item.to) ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          <Link
            to="/entrar"
            className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-muted hover:text-ink-soft transition-colors whitespace-nowrap"
          >
            Entrar
          </Link>
          <Link
            to="/cadastro"
            className="bg-primary text-white px-4 lg:px-6 py-2.5 btn-text text-[10px] lg:text-xs hover:bg-primary-dark transition-all duration-200 whitespace-nowrap"
          >
            Experimente de graça
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col justify-center gap-[5px] p-2 -mr-1"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          <span className={`block w-6 h-0.5 bg-ink transition-all duration-300 origin-center ${mobileOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block w-6 h-0.5 bg-ink transition-all duration-300 ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-ink transition-all duration-300 origin-center ${mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-surface border-t border-outline-variant px-5 overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? 'max-h-[500px] py-6 opacity-100' : 'max-h-0 py-0 opacity-0'
        }`}
      >
        <div className="flex flex-col gap-1">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`px-3 py-3 text-xs font-bold uppercase tracking-widest transition-colors rounded-sm ${
                isActive(item.to)
                  ? 'text-primary bg-lavender'
                  : 'text-muted hover:text-ink-soft hover:bg-lavender'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/entrar"
            onClick={() => setMobileOpen(false)}
            className="px-3 py-3 text-xs font-bold uppercase tracking-widest transition-colors rounded-sm text-muted hover:text-ink-soft hover:bg-lavender"
          >
            Entrar
          </Link>
          <Link
            to="/cadastro"
            onClick={() => setMobileOpen(false)}
            className="mt-1 bg-primary text-white px-6 py-3 btn-text text-xs text-center hover:bg-primary-dark transition-all duration-200"
          >
            Experimente de graça
          </Link>
        </div>
      </div>
    </nav>
  )
}
