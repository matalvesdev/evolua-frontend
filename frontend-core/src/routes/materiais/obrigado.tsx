import { createFileRoute, Link } from '@tanstack/react-router'
import { Logo } from '@/components/Logo'

export const Route = createFileRoute('/materiais/obrigado')({
  component: ObrigadoPage,
})

function ObrigadoPage() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Header minimal */}
      <header className="px-5 md:px-12 py-5 flex items-center justify-between border-b border-border-soft">
        <Link to="/" className="hover:opacity-70 transition-opacity">
          <Logo variant="quad" size="sm" />
        </Link>
        <Link
          to="/"
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-text-tertiary hover:text-text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Voltar ao site
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="max-w-lg mx-auto text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-neon/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <span className="material-symbols-outlined text-4xl text-neon">check</span>
          </div>

          <h1 className="font-headline font-black text-3xl md:text-4xl uppercase tracking-tighter leading-[0.9] mb-4">
            Material enviado!
          </h1>

          <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
            Enviamos o e-book <strong className="text-text-primary">"WhatsApp Profissional para Fonoaudiólogas"</strong> para o seu email.
          </p>

          <div className="bg-surface border border-border-soft rounded-2xl p-8 mb-8 text-left">
            <h2 className="font-headline font-bold text-base uppercase tracking-tight mb-4">
              Próximos passos
            </h2>
            <ol className="space-y-3 text-sm text-on-surface-variant">
              <li className="flex items-start gap-3">
                <span className="font-bold text-neon shrink-0">1.</span>
                <span>Verifique sua caixa de entrada (e o spam) — o e-book já deve estar lá</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-neon shrink-0">2.</span>
                <span>Siga o roteiro de 7 dias para implementar o WhatsApp Profissional</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-neon shrink-0">3.</span>
                <span>Para acelerar: teste o Evolua — ele já faz tudo isso automaticamente</span>
              </li>
            </ol>
          </div>

          <Link
            to="/cadastro"
            className="inline-flex items-center gap-2 bg-dark text-neon px-8 py-4 btn-text text-sm hover:bg-ink transition-all duration-300"
          >
            COMECE SEU TESTE GRÁTIS →
          </Link>
          <p className="text-[10px] text-on-surface-variant mt-4">
            14 dias grátis · Sem cartão de crédito · Configuração em 5 minutos
          </p>
        </div>
      </main>

      <footer className="border-t border-border-soft py-8 px-5 text-center">
        <p className="text-[10px] text-on-surface-variant">
          Evolua CRM — Feito para fonoaudiólogas, por quem entende de fonoaudiologia.
        </p>
      </footer>
    </div>
  )
}
