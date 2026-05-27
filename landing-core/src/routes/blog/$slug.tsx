import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Suspense, useEffect, useMemo } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { postBySlugQueryOptions, postsQueryOptions } from '../../queries/posts'
import { ReadingProgress } from '../../components/blog/ReadingProgress'
import { TableOfContents, extractTocItems } from '../../components/blog/TableOfContents'
import { ShareButtons } from '../../components/blog/ShareButtons'
import { LeadMagnetInline } from '../../components/blog/LeadMagnetInline'
import { FeatureHighlight } from '../../components/blog/FeatureHighlight'
import { NewsletterSignup } from '../../components/NewsletterSignup'
import { PLACEMENT_BY_CATEGORY } from '../../components/blog/placement-data'

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
      <Link
        to="/blog"
        className="group inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-on-surface-variant hover:text-primary transition-all border border-outline-variant hover:border-primary px-4 py-2 rounded-full"
      >
        <span className="material-symbols-outlined text-base group-hover:-translate-x-1 transition-transform">arrow_back</span>
        Voltar ao Blog
      </Link>
    </div>
  )
}

function splitIntoSections(markdown: string): string[] {
  const sections = markdown.split(/\n(?=## )/)
  return sections.filter(Boolean)
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function addHeadingIds(html: string): string {
  return html.replace(/<h([23])\b[^>]*>(.*?)<\/h\1>/gi, (_m, level, content) => {
    const id = slugify(content)
    return `<h${level} id="${id}">${content}</h${level}>`
  })
}

function renderMarkdown(md: string): string {
  const html = marked.parse(md, { async: false })
  const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
  return addHeadingIds(clean)
}

const AUTHOR_BIO: Record<string, string> = {
  'Equipe Evolua': 'Profissionais de tecnologia, marketing e gestão que vivem o dia a dia da fonoaudiologia digital.',
  'Dra. Carla Mendes': 'Fonoaudióloga clínica há 12 anos, especialista em motricidade orofacial e gestão de clínica digital.',
  'Ana Beatriz Lima': 'Especialista em marketing digital para saúde e growth; ajuda fonoaudiólogas a atrair e reter pacientes.',
  'Dr. Rafael Oliveira': 'Fonoaudiólogo com foco em audiologia e tecnologia assistiva; pesquisa inovações para a prática clínica.',
  'Juliana Costa': 'Analista de dados e product manager no Evolua; transforma informação em decisão para fonoaudiólogas.',
  'Pedro Vasconcelos': 'Engenheiro de software especializado em IA e automação; constrói ferramentas que amplificam o trabalho clínico.',
}

function PostContent() {
  const { slug } = Route.useParams()
  const { data: post } = useSuspenseQuery(postBySlugQueryOptions(slug))
  const { data: allPosts } = useSuspenseQuery(postsQueryOptions())

  useEffect(() => {
    if (!post) return
    document.title = `${post.titulo} | Evolua Blog`

    const canon = document.querySelector('link[rel="canonical"]')
    if (canon) canon.setAttribute('href', `https://evolua.app/blog/${post.slug}`)

    const desc = document.querySelector('meta[name="description"]')
    if (desc) desc.setAttribute('content', post.subtitulo)

    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', `${post.titulo} | Evolua Blog`)

    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) ogDesc.setAttribute('content', post.subtitulo)

    const ogUrl = document.querySelector('meta[property="og:url"]')
    if (ogUrl) ogUrl.setAttribute('content', `https://evolua.app/blog/${post.slug}`)

    const ogImage = document.querySelector('meta[property="og:image"]')
    if (ogImage) ogImage.setAttribute('content', post.imagem)

    const twTitle = document.querySelector('meta[name="twitter:title"]')
    if (twTitle) twTitle.setAttribute('content', `${post.titulo} | Evolua Blog`)

    const twDesc = document.querySelector('meta[name="twitter:description"]')
    if (twDesc) twDesc.setAttribute('content', post.subtitulo)
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

  const sections = useMemo(() => splitIntoSections(post.corpo), [post.corpo])
  const tocItems = useMemo(() => extractTocItems(post.corpo), [post.corpo])
  const placementData = PLACEMENT_BY_CATEGORY[post.categoria] ?? PLACEMENT_BY_CATEGORY.Tecnologia
  const hasMultipleSections = sections.length > 1

  const bodySections = hasMultipleSections ? sections : []
  const introHtml = useMemo(() => (sections[0] ? renderMarkdown(sections[0]) : ''), [sections])

  const renderedBodySections = useMemo(() => {
    if (!hasMultipleSections) return [] as string[]

    const result: string[] = []
    const total = bodySections.length

    const leadMagnetIndex = Math.max(1, Math.floor(total * 0.35))
    const featureIndex = Math.max(2, Math.floor(total * 0.7))

    bodySections.forEach((sec, i) => {
      result.push(renderMarkdown(sec))

      const index = i + 1
      if (index === leadMagnetIndex) {
        result.push('__PLACEMENT_LEAD_MAGNET__')
      }
      if (index === featureIndex) {
        result.push('__PLACEMENT_FEATURE__')
      }
    })

    return result
  }, [bodySections, hasMultipleSections])

  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <>
      <ReadingProgress />

      {/* Post Header */}
      <section className="px-5 md:px-12 pt-12 md:pt-20 pb-10 md:pb-16 bg-surface border-b border-outline-variant">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/blog"
            className="group inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-on-surface-variant hover:text-primary transition-all mb-8 md:mb-12 border border-outline-variant hover:border-primary px-4 py-2 rounded-full"
          >
            <span className="material-symbols-outlined text-base group-hover:-translate-x-1 transition-transform">arrow_back</span>
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

      {/* Cover image */}
      <div className="px-5 md:px-12">
        <div className="max-w-5xl mx-auto aspect-[16/7] max-h-[420px] overflow-hidden rounded-2xl shadow-sm bg-surface-container-high relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-surface-container-high to-surface-container-high" />
          <img
            src={post.imagem}
            alt={post.titulo}
            className="w-full h-full object-cover relative z-10 opacity-0 transition-opacity duration-500"
            fetchPriority="high"
            onLoad={e => (e.currentTarget.style.opacity = '1')}
          />
        </div>
      </div>

      {/* Article + Sidebar layout */}
      <section className="px-5 md:px-12 py-16 md:py-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8 lg:gap-12">
          {/* Main content column */}
          <div>
            {/* TOC mobile */}
            {tocItems.length > 0 && <TableOfContents sections={tocItems} />}

            {/* Intro section */}
            {introHtml && (
              <div
                className="prose prose-lg prose-evolua max-w-none text-on-surface-variant leading-relaxed first-section"
                dangerouslySetInnerHTML={{ __html: introHtml }}
              />
            )}

            {/* Body sections with placements interleaved */}
            {renderedBodySections.map((item, i) => {
              if (item === '__PLACEMENT_LEAD_MAGNET__') {
                return (
                  <div key={`lm-${i}`}>
                    <hr className="border-t border-outline-variant my-10 md:my-12" />
                    <LeadMagnetInline magnetId={placementData.leadMagnetId} />
                    <hr className="border-t border-outline-variant my-10 md:my-12" />
                  </div>
                )
              }
              if (item === '__PLACEMENT_FEATURE__') {
                return (
                  <div key={`fh-${i}`}>
                    <hr className="border-t border-outline-variant my-10 md:my-12" />
                    <FeatureHighlight feature={placementData.feature} variant="inline" />
                    <hr className="border-t border-outline-variant my-10 md:my-12" />
                  </div>
                )
              }
              return (
                <div
                  key={i}
                  className="prose prose-lg prose-evolua max-w-none text-on-surface-variant leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: item }}
                />
              )
            })}

            {/* Fallback: single-section post */}
            {!hasMultipleSections && introHtml && (
              <>
                <div
                  className="prose prose-lg prose-evolua max-w-none text-on-surface-variant leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: introHtml }}
                />
                <hr className="border-t border-outline-variant my-10 md:my-12" />
                <LeadMagnetInline magnetId={placementData.leadMagnetId} />
                <hr className="border-t border-outline-variant my-10 md:my-12" />
                <div className="my-16" />
                <FeatureHighlight feature={placementData.feature} variant="inline" />
              </>
            )}

            {/* Enhanced CTA */}
            <div className="mt-16 md:mt-20 p-8 md:p-12 bg-primary-container" data-placement="cta-banner">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="max-w-lg">
                  <h3 className="font-headline font-black text-2xl md:text-3xl uppercase tracking-tighter mb-3">
                    Quer colocar isso em prática hoje<span className="text-primary">?</span>
                  </h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    O Evolua automatiza tudo isso pra você. Teste grátis por 14 dias, sem compromisso.
                  </p>
                </div>
                <Link
                  to="/cadastro"
                  className="inline-block bg-black text-white px-8 py-4 btn-text text-sm hover:bg-primary hover:text-white transition-colors text-center shrink-0"
                >
                  Começar de graça
                </Link>
              </div>
            </div>

            {/* Author bio */}
            <div className="mt-12 flex items-start gap-4 border-t border-outline-variant pt-8">
              <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: '"FILL" 1' }}>person</span>
              </div>
              <div>
                <p className="text-sm font-bold text-ink">{post.autor}</p>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  {AUTHOR_BIO[post.autor] ?? `Especialista em ${post.categoria?.toLowerCase()} e ecossistema Evolua.`}
                </p>
                <Link
                  to="/blog"
                  className="text-xs font-bold text-primary hover:text-primary-dark transition-colors mt-2 inline-flex items-center gap-1"
                >
                  Ver todos os posts
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Newsletter signup */}
            <div className="mt-16 p-8 bg-surface-container-low border border-outline-variant" data-placement="newsletter">
              <h3 className="font-headline font-bold text-lg uppercase tracking-tight mb-2">
                Receba conteúdos como esse no seu email
              </h3>
              <p className="text-xs text-on-surface-variant mb-5 leading-relaxed">
                Uma edição semanal com dicas de marketing, gestão e tecnologia para fonoaudiólogas.
              </p>
              <NewsletterSignup variant="inline" />
            </div>
          </div>

          {/* Sidebar column — desktop only */}
          <aside className="hidden lg:block space-y-8">
            <div className="sticky top-24 space-y-8">
              {/* Share buttons */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant mb-3">Compartilhar</p>
                <ShareButtons url={currentUrl} title={post.titulo} text={post.subtitulo} />
              </div>

              {/* TOC */}
              <TableOfContents sections={tocItems} />

              {/* Feature highlight */}
              <FeatureHighlight feature={placementData.feature} variant="sidebar" />
            </div>
          </aside>
        </div>
      </section>

      {/* Mobile share bar — fixed at bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-outline-variant px-5 py-3 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Compartilhar</span>
        <ShareButtons url={currentUrl} title={post.titulo} text={post.subtitulo} />
      </div>

      {/* Related posts */}
      {relacionados.length > 0 && (
        <section className="px-5 md:px-12 py-16 md:py-24 bg-surface-container-low border-t border-outline-variant pb-24 md:pb-24">
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
                  className="group block bg-white hover:bg-surface-container transition-colors"
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={p.imagem}
                      alt={p.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6 md:p-8">
                    <span className="inline-block bg-primary-container text-primary font-label text-[10px] font-bold tracking-[0.3em] uppercase px-3 py-1.5 mb-4">
                      {p.categoria}
                    </span>
                    <h3 className="font-headline font-bold text-xl uppercase tracking-tight leading-[0.95] group-hover:text-primary transition-colors">
                      {p.titulo}
                    </h3>
                  </div>
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
      <div className="px-5 md:px-12">
        <div className="max-w-5xl mx-auto aspect-[16/7] max-h-[420px] bg-surface-container-high rounded-2xl" />
      </div>
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
