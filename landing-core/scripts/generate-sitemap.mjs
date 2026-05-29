/**
 * Generate sitemap.xml at build time.
 *
 * Queries Supabase for blog post slugs so they're included dynamically.
 * Falls back to static pages only if Supabase env vars are not set.
 *
 * Usage:
 *   node scripts/generate-sitemap.mjs
 *
 * Expected env:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 *
 * Loaded from .env.local (landing-core root) or manually set in CI.
 */

import { createClient } from '@supabase/supabase-js'
import { writeFileSync, existsSync, readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SITE_URL = 'https://useevolua.com.br'

// ── Load environment variables ───────────────────────────────────────────────
const envLocalPath = resolve(ROOT, '.env.local')
const envPath = resolve(ROOT, '.env')

function loadEnvVars() {
  const files = []
  if (existsSync(envLocalPath)) files.push(envLocalPath)
  if (existsSync(envPath)) files.push(envPath)

  for (const file of files) {
    const content = readFileSync(file, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      let value = trimmed.slice(eqIdx + 1).trim()
      // Strip surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  }
}

loadEnvVars()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

// ── Static pages (all known landing-core routes) ─────────────────────────────
const staticPages = [
  { loc: '/',                       priority: '1.0', changefreq: 'weekly' },
  { loc: '/blog',                   priority: '0.9', changefreq: 'daily' },
  { loc: '/planos',                 priority: '0.8', changefreq: 'monthly' },
  { loc: '/sobre',                  priority: '0.7', changefreq: 'monthly' },
  { loc: '/nosso-jeito',            priority: '0.7', changefreq: 'monthly' },
  { loc: '/ajuda',                  priority: '0.6', changefreq: 'monthly' },
  { loc: '/changelog',              priority: '0.5', changefreq: 'weekly' },
  { loc: '/contato',                priority: '0.5', changefreq: 'yearly' },
  { loc: '/materiais',              priority: '0.6', changefreq: 'weekly' },
  { loc: '/termos',                 priority: '0.3', changefreq: 'yearly' },
  { loc: '/privacidade',            priority: '0.3', changefreq: 'yearly' },
  { loc: '/seguranca',              priority: '0.3', changefreq: 'yearly' },
  { loc: '/cookies',                priority: '0.3', changefreq: 'yearly' },
  { loc: '/status',                 priority: '0.4', changefreq: 'daily' },
]

// ── Dynamic pages (blog posts from Supabase) ─────────────────────────────────
async function fetchBlogSlugs() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠️  VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set — skipping blog posts in sitemap.')
    return []
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const { data, error } = await supabase
      .from('blog_posts')
      .select('slug, published_at')

    if (error) {
      console.warn('⚠️  Supabase query failed:', error.message)
      return []
    }

    return (data ?? []).map((post) => ({
      loc: `/blog/${post.slug}`,
      priority: '0.8',
      changefreq: 'monthly',
      lastmod: post.published_at
        ? new Date(post.published_at).toISOString()
        : undefined,
    }))
  } catch (err) {
    console.warn('⚠️  Failed to fetch blog posts:', err.message)
    return []
  }
}

// ── Generate XML ─────────────────────────────────────────────────────────────
function buildXml(urls) {
  const urlElements = urls
    .map((u) => {
      let xml = `  <url>\n    <loc>${SITE_URL}${u.loc}</loc>\n`
      if (u.lastmod) xml += `    <lastmod>${u.lastmod}</lastmod>\n`
      if (u.changefreq) xml += `    <changefreq>${u.changefreq}</changefreq>\n`
      xml += `    <priority>${u.priority}</priority>\n  </url>`
      return xml
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>
`
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const blogUrls = await fetchBlogSlugs()
  const urls = [...staticPages, ...blogUrls]

  const xml = buildXml(urls)
  const outPath = resolve(ROOT, 'public', 'sitemap.xml')
  writeFileSync(outPath, xml, 'utf-8')

  console.log(`✅ Sitemap generated: ${outPath}`)
  console.log(`   ${urls.length} URLs (${staticPages.length} static + ${blogUrls.length} blog posts)`)
}

main().catch((err) => {
  console.error('❌ Sitemap generation failed:', err)
  process.exit(1)
})
