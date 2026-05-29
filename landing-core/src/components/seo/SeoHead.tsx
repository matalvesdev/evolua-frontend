import { Helmet } from 'react-helmet-async'
import { SITE, buildTitle, buildCanonical } from '../../lib/seo'
import type { SeoMeta } from '../../lib/seo'
import { organizationJsonLd } from './jsonld'

interface SeoHeadProps extends Partial<SeoMeta> {
  /** Extra JSON-LD blocks to inject (e.g. BlogPosting, FAQPage) */
  jsonLd?: Record<string, unknown>[]
  /** When true, prevents default organization JSON-LD from being injected */
  skipDefaultJsonLd?: boolean
  /** Route path used to compute canonical URL (e.g. /blog/como-crescer) */
  path?: string
}

/**
 * SeoHead — one component to rule all meta tags.
 *
 * Usage in route components:
 *   <SeoHead title="Planos" description="..." path="/planos" />
 *
 * For blog posts:
 *   <SeoHead title={post.titulo} description={post.subtitulo} path={post.slug}
 *            ogImage={post.imagem} jsonLd={[blogPostingJsonLd({…})]} />
 */
export function SeoHead({
  title,
  description,
  path,
  canonical,
  ogImage,
  ogType = 'website',
  jsonLd,
  skipDefaultJsonLd = false,
  noindex,
}: SeoHeadProps) {
  const resolvedTitle = title ? buildTitle(title) : buildTitle(SITE.name)
  const resolvedDescription = description ?? SITE.tagline
  const resolvedCanonical = canonical ?? (path ? buildCanonical(path) : SITE.url)
  const resolvedOgImage = ogImage ?? SITE.defaultOgImage
  const siteTitle = `${SITE.name} | ${SITE.tagline}`

  const schemas: Record<string, unknown>[] = []

  // If this page has its own JSON-LD, include those
  if (jsonLd) {
    schemas.push(...jsonLd)
  }

  // Inject Organization schema by default on all crawlable pages
  if (!skipDefaultJsonLd && !noindex) {
    const org = organizationJsonLd()
    // Check if organization is already included in jsonLd to avoid duplicates
    const hasOrg = schemas.some((s) => (s as Record<string, unknown>)['@type'] === 'Organization')
    if (!hasOrg) {
      schemas.push(org)
    }
  }

  return (
    <Helmet>
      {/* ── Title ── */}
      <title>{resolvedTitle}</title>

      {/* ── Meta description ── */}
      <meta name="description" content={resolvedDescription} />

      {/* ── Canonical ── */}
      <link rel="canonical" href={resolvedCanonical} />

      {/* ── Robots ── */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* ── Open Graph ── */}
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:url" content={resolvedCanonical} />
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:locale" content={SITE.locale} />

      {/* ── Twitter Cards ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SITE.twitterHandle} />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={resolvedOgImage} />

      {/* ── JSON-LD ── */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}

      {/* ── Homepage overrides ── */}
      {resolvedTitle === siteTitle && <meta property="og:title" content={siteTitle} />}
    </Helmet>
  )
}
