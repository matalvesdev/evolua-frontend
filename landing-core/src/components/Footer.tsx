import { Link } from '@tanstack/react-router'
import { Logo } from './Logo'

const navLinks = [
  { label: 'Início', to: '/' },
  { label: 'Nosso Jeito', to: '/nosso-jeito' },
  { label: 'Planos', to: '/planos' },
  { label: 'Blog', to: '/blog' },
  { label: 'Sobre', to: '/sobre' },
  { label: 'Changelog', to: '/changelog' },
]

const supportLinks = [
  { label: 'Central de Ajuda', to: '/ajuda' },
  { label: 'Contato', to: '/contato' },
  { label: 'Status', to: '/status' },
]

const legalLinks = [
  { label: 'Termos de Uso', to: '/termos' },
  { label: 'Privacidade', to: '/privacidade' },
  { label: 'Segurança & LGPD', to: '/seguranca' },
  { label: 'Cookies', to: '/cookies' },
]

const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/useevoluaapp',
    external: true,
  },
]

export function Footer() {
  return (
    <footer className="w-full pb-10 md:pb-16 pt-16 md:pt-32 bg-surface flex flex-col items-start px-5 md:px-12 border-t border-outline-variant">
        <div className="w-full max-w-7xl mx-auto">
        <div className="mb-10 md:mb-20">
          <Logo width={180} variant="light" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10 md:gap-20 mb-16 md:mb-32 w-full">
          {/* Mission */}
          <div className="sm:col-span-2">
            <h5 className="font-label text-[10px] font-bold tracking-[0.4em] uppercase text-muted mb-6 md:mb-10">
              Nossa Missão
            </h5>
            <p className="text-base md:text-lg lg:text-xl font-light text-ink-soft leading-snug max-w-xl">
              Gente que cuida de gente precisa de cuidado também. A gente criou tudo isso para fonoaudiólogas
              maravilhosas terem paz e sucesso.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h5 className="font-label text-[10px] font-bold tracking-[0.4em] uppercase text-muted mb-6 md:mb-10">
              Por onde começar
            </h5>
            <div className="flex flex-col gap-4 md:gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-xs font-bold tracking-widest uppercase text-muted hover:text-primary transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h5 className="font-label text-[10px] font-bold tracking-[0.4em] uppercase text-muted mb-6 md:mb-10">
              Suporte
            </h5>
            <div className="flex flex-col gap-4 md:gap-6">
              {supportLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-xs font-bold tracking-widest uppercase text-muted hover:text-primary transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal + Social */}
          <div>
            <h5 className="font-label text-[10px] font-bold tracking-[0.4em] uppercase text-muted mb-6 md:mb-10">
              Informações
            </h5>
            <div className="flex flex-col gap-4 md:gap-6">
              {legalLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-xs font-bold tracking-widest uppercase text-muted hover:text-primary transition-all"
                >
                  {link.label}
                </Link>
              ))}
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold tracking-widest uppercase text-muted hover:text-primary transition-all"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full pt-8 md:pt-16 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4 md:gap-8">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-muted text-center md:text-left">
            © 2025 EVOLUA. FEITO COM AMOR PARA FONOAUDIÓLOGAS.
          </p>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse shrink-0" />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-muted text-center">
              SEMPRE DE PORTAS ABERTAS PRA VOCÊ
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
