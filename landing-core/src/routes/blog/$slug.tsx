import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Suspense, useEffect } from 'react'
import DOMPurify from 'dompurify'
import { postBySlugQueryOptions, postsQueryOptions } from '../../queries/posts'

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ context: { queryClient }, params: { slug } }) => {
    const post = await queryClient.ensureQueryData(postBySlugQueryOptions(slug))
    if (!post) throw notFound()
    await queryClient.ensureQueryData(postsQueryOptions())
  },
  notFoundComponent: PostNotFound,
  component: PostPage,
})

function PostNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-5 text-center">
      <span className="font-headline font-black text-6xl text-surface-container-high mb-6">404</span>
      <h1 className="font-headline font-black text-3xl uppercase tracking-tighter mb-4">Post não encontrado</h1>
      <p className="text-on-surface-variant mb-8">Esse artigo não existe ou foi movido.</p>
      <Link to="/blog" className="bg-black text-white px-8 py-4 btn-text text-sm hover:bg-primary transition-colors">
        Voltar ao Blog
      </Link>
    </div>
  )
}

function PostContent() {
  const { slug } = Route.useParams()
  const { data: post } = useSuspenseQuery(postBySlugQueryOptions(slug))
  const { data: allPosts } = useSuspenseQuery(postsQueryOptions())

  useEffect(() => {
    if (post) document.title = `${post.titulo} | Evolua Blog`
  }, [post])

  if (!post) return <PostNotFound />

  const relacionados = allPosts
    .filter((p) => p.id !== post.id && p.categoria === post.categoria)
    .slice(0, 3)

  const dataFormatada = new Date(post.data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  // Sanitize HTML content before rendering
  const safeCorpo = post.corpo
    ? DOMPurify.sanitize(post.corpo, { USE_PROFILES: { html: true } })
    : ''

  return (
    <>
      {/* Header do post */}
      <section className="px-5 md:px-12 pt-12 md:pt-20 pb-10 md:pb-16 bg-surface border-b border-outline-variant">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] uppercase text-on-surface-variant hover:text-primary transition-colors mb-8 md:mb-12"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Voltar ao Blog
          </Link>
          <span className="inline-block bg-primary-container text-primary font-label text-[10px] font-bold tracking-[0.3em] uppercase px-3 py-1.5 mb-6">
            {post.categoria}
          </span>
          <h1 className="font-headline font-black text-2xl md:text-4xl lg:text-5xl uppercase tracking-tighter leading-[0.9] mb-6 md:mb-8">
            {post.titulo}
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant leading-relaxed mb-8 md:mb-10">{post.subtitulo}</p>
          <div className="flex flex-wrap items-center gap-4 md:gap-8 text-[10px] font-bold tracking-[0.2em] uppercase text-on-surface-variant">
            <span>{post.autor}</span>
            <span className="text-outline-variant">•</span>
            <time dateTime={post.data}>{dataFormatada}</time>
            <span className="text-outline-variant">•</span>
            <span>{post.tempoLeitura} min de leitura</span>
          </div>
        </div>
      </section>

      {/* Imagem de destaque */}
      <div className="w-full aspect-[21/9] overflow-hidden">
        <img src={post.imagem} alt={post.titulo} className="w-full h-full object-cover" loading="lazy" />
      </div>

      {/* Corpo do artigo */}
      <section className="px-5 md:px-12 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          {safeCorpo ? (
            <div
              className="prose prose-lg max-w-none text-on-surface-variant leading-relaxed"
              dangerouslySetInnerHTML={{ __html: safeCorpo }}
            />
          ) : (
            <div className="space-y-6 text-on-surface-variant leading-relaxed">
              <p className="text-lg md:text-xl font-medium text-on-surface">
                Este é um conteúdo de demonstração. Em produção, o corpo do artigo será carregado da API.
              </p>
              {Array.from({ length: 4 }).map((_, i) => (
                <p key={i}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
              ))}
            </div>
          )}

          {/* CTA inline */}
          <div className="mt-16 md:mt-20 p-8 md:p-12 bg-primary-container">
            <h3 className="font-headline font-black text-2xl md:text-3xl uppercase tracking-tighter mb-4">
              Quer colocar isso em prática hoje<span className="text-primary">?</span>
            </h3>
            <p className="text-on-surface-variant mb-6 leading-relaxed">
              O Evolua automatiza tudo isso pra você. Teste grátis por 14 dias.
            </p>
            <Link
              to="/cadastro"
              className="inline-block bg-black text-white px-8 py-4 btn-text text-sm hover:bg-primary hover:text-white transition-colors w-full sm:w-auto text-center"
            >
              Começar de graça
            </Link>
          </div>
        </div>
      </section>

      {/* Posts relacionados */}
      {relacionados.length > 0 && (
        <section className="px-5 md:px-12 py-16 md:py-24 bg-surface-container-low border-t border-outline-variant">
          <div className="max-w-[1920px] mx-auto">
            <h2 className="font-headline font-black text-3xl md:text-4xl uppercase tracking-tighter mb-10 md:mb-16">
              Continue lendo<span className="text-primary">.</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-outline-variant">
              {relacionados.map((p) => (
                <Link
                  key={p.id}
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="group block bg-white p-6 md:p-8 hover:bg-surface-container transition-colors"
                >
                  <span className="inline-block bg-primary-container text-primary font-label text-[10px] font-bold tracking-[0.3em] uppercase px-3 py-1.5 mb-4">
                    {p.categoria}
                  </span>
                  <h3 className="font-headline font-bold text-xl uppercase tracking-tight leading-[0.95] group-hover:text-primary transition-colors">
                    {p.titulo}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

function PostSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="px-5 md:px-12 pt-20 pb-16 bg-surface">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="h-4 w-24 bg-surface-container-high" />
          <div className="h-12 w-full bg-surface-container-high" />
          <div className="h-6 w-4/5 bg-surface-container-high" />
        </div>
      </div>
      <div className="w-full aspect-[21/9] bg-surface-container-high" />
    </div>
  )
}

function PostPage() {
  return (
    <Suspense fallback={<PostSkeleton />}>
      <PostContent />
    </Suspense>
  )
}
