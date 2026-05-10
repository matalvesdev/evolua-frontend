import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Suspense, useState } from 'react'
import { motion } from 'motion/react'
import { postsQueryOptions } from '../queries/posts'
import type { BlogPost } from '../lib/blog'

type NewsletterStatus = 'idle' | 'loading' | 'success' | 'error'

export const Route = createFileRoute('/blog')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(postsQueryOptions()),
  component: BlogPage,
})

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const CATEGORIAS = ['Todos', 'Marketing', 'Gestão', 'Clínica', 'Carreira', 'Tecnologia'] as const

function PostCard({ post, destaque = false }: { post: BlogPost; destaque?: boolean }) {
  const dataFormatada = new Date(post.data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  if (destaque) {
    return (
      <Link
        to="/blog/$slug"
        params={{ slug: post.slug }}
        className="group block md:col-span-2 bg-surface border border-outline-variant hover:border-primary transition-colors duration-300"
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="aspect-[16/9] md:aspect-auto overflow-hidden">
            <img
              src={post.imagem}
              alt={post.titulo}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
            />
          </div>
          <div className="p-8 md:p-12 flex flex-col justify-between">
            <div>
              <span className="inline-block bg-lavender text-primary font-label text-[10px] font-bold tracking-[0.3em] uppercase px-3 py-1.5 mb-6">
                {post.categoria}
              </span>
              <h2 className="font-headline font-black text-3xl md:text-4xl lg:text-5xl uppercase tracking-tighter leading-[0.95] mb-4 text-ink group-hover:text-primary transition-colors">
                {post.titulo}
              </h2>
              <p className="text-ink-soft/80 text-base md:text-lg leading-relaxed">{post.subtitulo}</p>
            </div>
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-outline-variant">
              <span className="font-label text-[10px] font-bold tracking-[0.2em] uppercase text-muted">
                {dataFormatada}
              </span>
              <span className="font-label text-[10px] font-bold tracking-[0.2em] uppercase text-muted">
                {post.tempoLeitura} min de leitura
              </span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group block bg-surface border border-outline-variant hover:border-primary transition-colors duration-300"
    >
      <div className="aspect-[16/9] overflow-hidden">
        <img
          src={post.imagem}
          alt={post.titulo}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-6 md:p-8">
        <span className="inline-block bg-lavender text-primary font-label text-[10px] font-bold tracking-[0.3em] uppercase px-3 py-1.5 mb-4">
          {post.categoria}
        </span>
        <h3 className="font-headline font-black text-xl md:text-2xl uppercase tracking-tighter leading-[0.95] mb-3 text-ink group-hover:text-primary transition-colors">
          {post.titulo}
        </h3>
        <p className="text-ink-soft/80 text-sm md:text-base leading-relaxed mb-6">{post.subtitulo}</p>
        <div className="flex items-center justify-between pt-4 border-t border-outline-variant">
          <span className="font-label text-[10px] font-bold tracking-[0.2em] uppercase text-muted">
            {dataFormatada}
          </span>
          <span className="font-label text-[10px] font-bold tracking-[0.2em] uppercase text-muted">
            {post.tempoLeitura} min
          </span>
        </div>
      </div>
    </Link>
  )
}

function PostsGrid({ categoria }: { categoria: string }) {
  const { data: posts } = useSuspenseQuery(postsQueryOptions(categoria === 'Todos' ? undefined : categoria))
  const [destaques, resto] = [posts.filter((p) => p.destaque), posts.filter((p) => !p.destaque)]

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 block">search_off</span>
        <p className="font-headline font-bold text-xl uppercase tracking-tight text-ink-soft/80">
          Nenhum post nesta categoria ainda
        </p>
      </div>
    )
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-px bg-outline-variant"
    >
      {destaques.length > 0 && (
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-px bg-outline-variant">
          {destaques.map((post) => (
            <PostCard key={post.id} post={post} destaque />
          ))}
        </motion.div>
      )}
      {resto.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-outline-variant">
          {resto.map((post) => (
            <motion.div key={post.id} variants={fadeUp}>
              <PostCard post={post} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function PostsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-outline-variant">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-surface animate-pulse">
          <div className="aspect-[16/9] bg-outline-variant" />
          <div className="p-6 md:p-8 space-y-3">
            <div className="h-4 w-20 bg-outline-variant" />
            <div className="h-6 w-full bg-outline-variant" />
            <div className="h-4 w-4/5 bg-outline-variant" />
            <div className="h-4 w-3/5 bg-outline-variant" />
          </div>
        </div>
      ))}
    </div>
  )
}

function BlogPage() {
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('Todos')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<NewsletterStatus>('idle')

  async function handleNewsletter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!newsletterEmail) return
    setNewsletterStatus('loading')
    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? ''
      const res = await fetch(`${apiUrl}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      setNewsletterStatus('success')
    } catch {
      setNewsletterStatus('error')
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="px-5 md:px-12 pt-16 md:pt-24 pb-12 md:pb-20 bg-canvas">
        <div className="max-w-7xl mx-auto">
          <motion.span
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-label text-[10px] font-bold tracking-[0.4em] uppercase text-primary mb-6 md:mb-10 block"
          >
            Blog & Dicas
          </motion.span>
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.08 }}
            className="font-headline font-black text-[clamp(2rem,5vw,4rem)] leading-[0.85] tracking-tighter uppercase mb-6 md:mb-10 max-w-4xl text-ink"
          >
            Conteúdo que faz sua clínica crescer de verdade<span className="text-primary">.</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.16 }}
            className="text-sm md:text-base text-ink-soft/80 max-w-xl leading-relaxed"
          >
            Sem enrolação. Estratégias reais de marketing, gestão e crescimento para fonoaudiólogas que querem mais.
          </motion.p>
        </div>
      </section>

      {/* Filtros */}
      <section className="px-5 md:px-12 pb-10 md:pb-16 bg-canvas/90 backdrop-blur-xl sticky top-20 md:top-24 z-40 border-b border-outline-variant">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaAtiva(cat)}
                className={`shrink-0 px-4 md:px-6 py-2 md:py-2.5 btn-text text-[10px] md:text-xs transition-all duration-200 ${
                  categoriaAtiva === cat
                    ? 'bg-primary text-white'
                    : 'bg-surface border border-outline-variant text-muted hover:border-primary hover:text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid de posts */}
      <section className="px-5 md:px-12 py-10 md:py-16 bg-canvas">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<PostsSkeleton />}>
            <PostsGrid categoria={categoriaAtiva} />
          </Suspense>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 md:py-32 px-5 md:px-12 bg-deep text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
            >
              <h2 className="font-headline font-black text-3xl md:text-4xl lg:text-5xl uppercase tracking-tighter leading-[0.9] mb-6">
                Todo conteúdo bom, direto no seu email<span className="text-neon">.</span>
              </h2>
              <p className="text-lavender-mid text-sm md:text-base leading-relaxed">
                Toda semana, um email com dicas práticas de marketing, gestão e crescimento. Sem spam. Pode cancelar quando quiser.
              </p>
            </motion.div>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: 0.15 }}
            >
              {newsletterStatus === 'success' ? (
                <div className="py-8 text-center">
                  <span className="material-symbols-outlined text-4xl text-neon mb-3 block">check_circle</span>
                  <p className="font-headline font-bold text-xl uppercase tracking-tight text-white">
                    Boa! Você está na lista.
                  </p>
                </div>
              ) : (
                <>
                  <form className="flex flex-col sm:flex-row gap-0" onSubmit={handleNewsletter}>
                    <label htmlFor="newsletter-email" className="sr-only">Seu email</label>
                    <input
                      id="newsletter-email"
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      required
                      aria-required="true"
                      placeholder="seu@email.com.br"
                      className="flex-1 px-5 py-5 bg-deep-mid text-white placeholder:text-lavender-mid/60 font-body text-base border border-deep-light focus:outline-none focus:border-neon transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={newsletterStatus === 'loading'}
                      className="bg-neon text-ink px-8 py-5 btn-text text-sm hover:scale-95 transition-all duration-200 whitespace-nowrap disabled:opacity-50"
                    >
                      {newsletterStatus === 'loading' ? 'Enviando...' : 'Quero receber'}
                    </button>
                  </form>
                  {newsletterStatus === 'error' && (
                    <p role="alert" className="text-rose text-xs mt-2">
                      Algo deu errado. Tente novamente.
                    </p>
                  )}
                  <p className="text-lavender-mid/70 text-[10px] font-bold tracking-[0.2em] uppercase mt-4">
                    Sem spam. Cancele quando quiser. Prometemos.
                  </p>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
