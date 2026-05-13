import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'

export const Route = createFileRoute('/cookies')({
  component: CookiesPage,
})

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

const tipos = [
  {
    nome: 'Essenciais',
    sempreAtivo: true,
    descricao:
      'Mantêm o site funcionando: autenticação, preferências de idioma, segurança da sessão. Sem eles, partes da plataforma simplesmente não carregam.',
    exemplos: ['sb-access-token', 'sb-refresh-token', 'evolua_session'],
  },
  {
    nome: 'Funcionais',
    sempreAtivo: false,
    descricao:
      'Lembram suas preferências (tema, idioma, último filtro usado no blog) para te dar uma experiência consistente entre visitas.',
    exemplos: ['evolua_theme', 'evolua_locale'],
  },
  {
    nome: 'Analíticos',
    sempreAtivo: false,
    descricao:
      'Coletam dados agregados e anônimos sobre uso da plataforma para a gente entender o que funciona e o que precisa melhorar. Não identificam você.',
    exemplos: ['_ga', '_ga_*', 'plausible'],
  },
  {
    nome: 'Marketing',
    sempreAtivo: false,
    descricao:
      'Usados em campanhas para medir conversão e personalizar anúncios. Hoje, o Evolua não usa cookies de marketing de terceiros — quando começar, atualizamos esta página.',
    exemplos: [],
  },
]

function CookiesPage() {
  return (
    <>
      {/* Hero */}
      <section className="px-5 md:px-12 pt-16 md:pt-24 pb-16 md:pb-24 bg-canvas">
        <div className="max-w-7xl mx-auto">
          <motion.span
            variants={fadeUp} initial="hidden" animate="visible"
            className="font-label text-[10px] font-bold tracking-[0.4em] uppercase text-primary mb-6 md:mb-10 block"
          >
            Legal
          </motion.span>
          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible"
            transition={{ delay: 0.08 }}
            className="font-headline font-black text-[clamp(2rem,5vw,3.5rem)] leading-[0.9] tracking-tighter uppercase mb-6 max-w-3xl text-ink"
          >
            Política de Cookies<span className="text-primary">.</span>
          </motion.h1>
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible"
            transition={{ delay: 0.16 }}
            className="text-sm text-muted"
          >
            Última atualização: maio de 2026 · Conforme LGPD (Lei 13.709/2018)
          </motion.p>
        </div>
      </section>

      {/* O que são */}
      <section className="px-5 md:px-12 pb-16 md:pb-20 bg-canvas">
        <div className="max-w-3xl mx-auto space-y-6 text-ink-soft/80 text-sm md:text-base leading-relaxed">
          <h2 className="font-headline font-bold text-lg md:text-xl uppercase tracking-tight text-ink mb-4 pb-4 border-b border-outline-variant">
            O que são cookies
          </h2>
          <p>
            Cookies são pequenos arquivos de texto que ficam armazenados no seu navegador quando você visita um site. Eles servem para lembrar informações da sua sessão (como login, preferências) ou medir como o site é usado.
          </p>
          <p>
            O Evolua usa cookies — alguns são <strong>indispensáveis</strong> para o serviço funcionar; outros, opcionais, dependem do seu consentimento. Você pode revisar e ajustar suas preferências a qualquer momento.
          </p>
        </div>
      </section>

      {/* Tipos */}
      <section className="px-5 md:px-12 pb-16 md:pb-24 bg-canvas">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-headline font-bold text-lg md:text-xl uppercase tracking-tight text-ink mb-8 pb-4 border-b border-outline-variant">
            Tipos de cookies que usamos
          </h2>
          <div className="space-y-px bg-outline-variant">
            {tipos.map((t) => (
              <motion.div
                key={t.nome}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
                className="bg-canvas p-8 md:p-10"
              >
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h3 className="font-headline font-bold text-base md:text-lg uppercase tracking-tight text-ink">
                    {t.nome}
                  </h3>
                  <span
                    className={`font-label text-[9px] font-bold tracking-[0.25em] uppercase px-3 py-1 ${
                      t.sempreAtivo
                        ? 'bg-primary text-white'
                        : 'bg-surface border border-outline-variant text-muted'
                    }`}
                  >
                    {t.sempreAtivo ? 'Sempre ativo' : 'Opcional'}
                  </span>
                </div>
                <p className="text-ink-soft/80 text-sm md:text-base leading-relaxed mb-4">{t.descricao}</p>
                {t.exemplos.length > 0 && (
                  <div>
                    <span className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-muted">
                      Exemplos:{' '}
                    </span>
                    <span className="text-xs text-ink-soft/70 font-mono">{t.exemplos.join(', ')}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Como gerenciar */}
      <section className="px-5 md:px-12 pb-16 md:pb-24 bg-canvas">
        <div className="max-w-3xl mx-auto space-y-6 text-ink-soft/80 text-sm md:text-base leading-relaxed">
          <h2 className="font-headline font-bold text-lg md:text-xl uppercase tracking-tight text-ink mb-4 pb-4 border-b border-outline-variant">
            Como gerenciar suas preferências
          </h2>
          <p>
            Você pode aceitar, recusar ou personalizar os cookies opcionais a qualquer momento pelo banner exibido na primeira visita. Para revisar depois, limpe o cache do navegador e o banner volta a aparecer.
          </p>
          <p>
            Você também pode bloquear cookies diretamente nas configurações do seu navegador. Lembre-se de que <strong>desativar cookies essenciais pode quebrar funcionalidades</strong> da plataforma (como manter você logada).
          </p>
          <ul className="space-y-2 pt-2">
            <li>
              ·{' '}
              <a className="text-primary hover:underline" href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">
                Gerenciar cookies no Chrome
              </a>
            </li>
            <li>
              ·{' '}
              <a className="text-primary hover:underline" href="https://support.mozilla.org/pt-BR/kb/limpe-cookies-e-dados-de-sites-no-firefox" target="_blank" rel="noopener noreferrer">
                Gerenciar cookies no Firefox
              </a>
            </li>
            <li>
              ·{' '}
              <a className="text-primary hover:underline" href="https://support.apple.com/pt-br/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">
                Gerenciar cookies no Safari
              </a>
            </li>
          </ul>
        </div>
      </section>

      {/* Mais info */}
      <section className="py-16 md:py-24 px-5 md:px-12 bg-surface-low">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-ink-soft/80 text-sm md:text-base leading-relaxed">
            Para entender o tratamento completo dos seus dados pessoais, veja a{' '}
            <Link to="/privacidade" className="text-primary font-bold hover:underline">
              Política de Privacidade
            </Link>{' '}
            e nossas{' '}
            <Link to="/seguranca" className="text-primary font-bold hover:underline">
              práticas de segurança
            </Link>.
          </p>
          <p className="text-muted text-xs mt-6">
            Dúvidas? Escreva para{' '}
            <a href="mailto:privacidade@evolua.com.br" className="text-primary hover:underline">
              privacidade@evolua.com.br
            </a>
          </p>
        </div>
      </section>
    </>
  )
}
