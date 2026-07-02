#!/usr/bin/env node
/**
 * Run Daily — Pipeline unificado de conteúdo Evolua
 *
 * 1. Pesquisa tema do dia (IA via OpenRouter)
 * 2. Cria post de blog + publica no Supabase
 * 3. Cria posts sociais (texto)
 * 4. Gera HTML visual + screenshots PNG
 * 5. Converte ebooks para PDF
 * 6. Empacota .tar.gz + envia email com tudo
 *
 * Uso:
 *   node scripts/run-daily.mjs                        # tema automático do cronograma
 *   node scripts/run-daily.mjs --topic "texto"        # tema customizado
 *   node scripts/run-daily.mjs --skip-blog             # só visual + email
 *   node scripts/run-daily.mjs --skip-visual           # só blog + social text
 *   node scripts/run-daily.mjs --dry-run               # teste sem publicar/enviar
 *
 * Env: OPENROUTER_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// Auto-load .env for local dev (no dotenv dependency)
try {
  const envRaw = readFileSync(resolve(ROOT, '.env'), 'utf-8')
  for (const line of envRaw.split('\n')) {
    const clean = line.trim()
    if (!clean || clean.startsWith('#') || !clean.includes('=')) continue
    const idx = clean.indexOf('=')
    const key = clean.slice(0, idx).trim()
    let val = clean.slice(idx + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1)
    if (!process.env[key]) process.env[key] = val
  }
} catch {}

const args = process.argv.slice(2)
const TOPIC = (() => {
  const idx = args.indexOf('--topic')
  return idx === -1 ? null : args.slice(idx + 1).find(a => !a.startsWith('--')) || null
})()
const SKIP_BLOG = args.includes('--skip-blog')
const SKIP_VISUAL = args.includes('--skip-visual')
const DRY_RUN = args.includes('--dry-run')

const TIMESTAMP = new Date().toISOString().slice(0, 10)
const DAY_NAMES = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']
const TODAY = DAY_NAMES[new Date().getDay()]

const SCHEDULE = {
  segunda: { pilar: 'Marketing Digital', formato: 'guia-pratico' },
  terca: { pilar: 'Gestão de Clínica', formato: 'case-estudo' },
  quarta: { pilar: 'Tecnologia', formato: 'tutorial' },
  quinta: { pilar: 'Clínica', formato: 'artigo-tecnico' },
  sexta: { pilar: 'Carreira', formato: 'reflexao' },
}

const CATEGORY_MAP = {
  'Marketing Digital': 'Marketing',
  'Gestão de Clínica': 'Gestão',
  Tecnologia: 'Tecnologia',
  Clínica: 'Clínica',
  Carreira: 'Carreira',
}

function log(step, msg) {
  const ts = new Date().toISOString().slice(11, 19)
  console.log(`[${ts}] [${step}] ${msg}`)
}

function getTopic() {
  if (TOPIC) return { topic: TOPIC, pilar: 'Customizado', category: 'Marketing' }
  const entry = SCHEDULE[TODAY]
  if (!entry) return { topic: 'gestao de consultorio para fonoaudiologas', pilar: 'Gestão de Clínica', category: 'Gestão' }
  return {
    topic: `${entry.pilar} para fonoaudiologas`,
    pilar: entry.pilar,
    category: CATEGORY_MAP[entry.pilar] || 'Marketing',
  }
}

async function callAI(messages, systemPrompt, options = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set')
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://useevolua.com.br',
      'X-Title': 'Evolua Daily',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b:free',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
    }),
  })
  if (!res.ok) throw new Error(`AI ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content || null
}

function extractJson(raw) {
  if (!raw) throw new Error('Empty AI response')
  const cleaned = raw.replace(/```json\n?|```/g, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON in AI response')
  return JSON.parse(cleaned.slice(start, end + 1))
}

const COVER_IMAGES = {
  Marketing: 'https://images.pexels.com/photos/7654128/pexels-photo-7654128.jpeg?w=800&q=80',
  Gestão: 'https://images.pexels.com/photos/4386366/pexels-photo-4386366.jpeg?w=800&q=80',
  Clínica: 'https://images.pexels.com/photos/7578828/pexels-photo-7578828.jpeg?w=800&q=80',
  Carreira: 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?w=800&q=80',
  Tecnologia: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?w=800&q=80',
  Fonoaudiologia: 'https://images.pexels.com/photos/7654128/pexels-photo-7654128.jpeg?w=800&q=80',
}

// ─── 1. Research ─────────────────────────────────────────────────
async function research(topic) {
  log('🧠', `Pesquisando: "${topic}"`)
  const raw = await callAI(
    [{ role: 'user', content: `Pesquise sobre: ${topic} para fonoaudiólogas no Brasil.` }],
    `Você é uma pesquisadora de conteúdo para fonoaudiologia no Brasil. Retorne JSON puro:
{ "topic": "tema", "keywords": ["kw1","kw2"], "target_audience": "público", "pain_points": ["dor1","dor2"], "data_points": ["dado1","dado2"], "angle_suggestions": ["angulo1","angulo2"] }
Tema: ${topic}`
  )
  const data = extractJson(raw)
  // Save for reference
  const out = resolve(ROOT, 'scripts', 'content-pipeline', 'output')
  if (!existsSync(out)) mkdirSync(out, { recursive: true })
  writeFileSync(resolve(out, 'research.json'), JSON.stringify(data, null, 2))
  return data
}

// ─── 2. Create Blog Post + Publish ──────────────────────────────
async function createAndPublishBlog(researchData, topicInfo) {
  log('📝', 'Criando post de blog via IA...')
  const category = topicInfo.category || 'Marketing'

  const currentYear = new Date().getFullYear()
  const raw = await callAI(
    [{ role: 'user', content: `Pesquisa:\n${JSON.stringify(researchData, null, 2)}\n\nCrie o post para o blog.` }],
    `Você é redatora de fonoaudiologia para o blog da Evolua (CRM para fonoaudiólogas).
IMPORTANTE: O ano atual é ${currentYear}. NUNCA use anos anteriores (como 2024, 2023, etc.) em títulos ou conteúdo.
Retorne JSON puro:
{
  "title": "Título SEO (máx 60 chars) — use o ano ${currentYear} se necessário",
  "slug": "slug-amigavel",
  "excerpt": "Resumo (máx 160 chars)",
  "content_html": "Conteúdo em HTML (<p>, <h2>, <h3>, <blockquote>, <ul>). Mín. 800 palavras. Use ano ${currentYear}.",
  "author": "Equipe Evolua",
  "category": "Marketing|Gestão|Clínica|Carreira|Tecnologia|Fonoaudiologia",
  "cover_image": "URL Pexels (w=800&q=80)",
  "read_time": 5,
  "tags": ["tag1","tag2"]
}
Regras: Tom direto e acolhedor. Categoria: ${category}. NUNCA invente dados. Use sempre o ano ${currentYear}. Inclua CTA sutil para teste grátis no final.`,
    { maxTokens: 8192 }
  )

  const post = extractJson(raw)
  const slug = post.slug || researchData.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  post.slug = slug

  // Save draft
  const draftsDir = resolve(ROOT, 'docs', 'content-assets', '02-blog-posts')
  if (!existsSync(draftsDir)) mkdirSync(draftsDir, { recursive: true })
  writeFileSync(resolve(draftsDir, `${slug}.md`),
    `---\ntitle: "${post.title}"\nslug: "${slug}"\nexcerpt: "${post.excerpt}"\ncategory: "${post.category}"\nauthor: "${post.author || 'Equipe Evolua'}"\nread_time: ${post.read_time || 5}\ntags: [${(post.tags || []).map(t => `"${t}"`).join(', ')}]\ncover_image: "${post.cover_image || COVER_IMAGES[category] || COVER_IMAGES.Fonoaudiologia}"\npublished_at: "${new Date().toISOString()}"\n---\n\n${post.content_html.replace(/<[^>]+>/g, '').slice(0, 500)}...`)
  log('📝', `Rascunho salvo: ${slug}.md`)

  // Publish to Supabase
  if (!DRY_RUN) {
    const supabaseUrl = process.env.SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (supabaseUrl && serviceKey) {
      log('📡', 'Publicando no Supabase...')
      const res = await fetch(`${supabaseUrl}/rest/v1/blog_posts`, {
        method: 'POST',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          title: post.title,
          slug,
          excerpt: post.excerpt,
          content: post.content_html,
          cover_image: post.cover_image || COVER_IMAGES[category] || COVER_IMAGES.Fonoaudiologia,
          author: post.author || 'Equipe Evolua',
          category: post.category || category,
          read_time: post.read_time || 5,
          featured: false,
          status: 'published',
          published_at: new Date().toISOString(),
        }),
      })
      if (res.ok) log('📡', `✅ Publicado: "${post.title}"`)
      else log('📡', `⚠️ Falha publish: ${res.status}`)
    } else {
      log('📡', '⚠️ SUPABASE_URL/SERVICE_KEY não configurados')
    }
  } else {
    log('📝', '🧪 Dry-run — skip publish')
  }

  return post
}

// ─── 3. Create Social Posts (text) ──────────────────────────────
async function createSocial(blogPost, researchData) {
  log('📱', 'Criando posts sociais via IA...')
  const raw = await callAI(
    [{ role: 'user', content: `Blog: "${blogPost.title}"\nResumo: ${blogPost.excerpt}\n\nCrie posts sociais.` }],
    `Com base no post de blog, crie posts em JSON:
{
  "linkedin": { "post": "texto (500-800 chars)", "hashtags": ["#h1","#h2"] },
  "instagram": { "carrossel_slides": [{"slide":1,"texto":"slide1"},{"slide":2,"texto":"slide2"},{"slide":3,"texto":"slide3"},{"slide":4,"texto":"slide4"},{"slide":5,"texto":"slide5"}], "caption": "legenda (max 2200 chars)", "hashtags": ["#h1","#h2"] },
  "threads": { "tweets": ["t1","t2","t3","t4","t5"] },
  "x": { "post": "max 280 chars" }
}
Regras: LinkedIn profissional, Instagram visual, Threads narrativo, X impacto.`,
    { maxTokens: 8192 }
  )
  const posts = extractJson(raw)

  const out = resolve(ROOT, 'scripts', 'content-pipeline', 'output')
  writeFileSync(resolve(out, 'social-posts.json'), JSON.stringify(posts, null, 2))
  return posts
}

// ─── 4. Run Visual Generator ───────────────────────────────────
function runVisualGenerator() {
  log('🎨', 'Gerando visuais...')
  const genPath = resolve(ROOT, 'scripts', 'content-generator.mjs')
  if (!existsSync(genPath)) { log('⚠️', 'content-generator.mjs não encontrado'); return }
  try {
    execSync(`node "${genPath}"`, { cwd: ROOT, stdio: 'inherit', timeout: 300000 })
  } catch (e) {
    log('⚠️', `Visual generator: ${e.message}`)
  }
}

// ─── 5. Main ────────────────────────────────────────────────────
async function main() {
  console.log(`
╔══════════════════════════════════════════╗
║   Evolua Daily Pipeline                  ║
║   Data: ${TIMESTAMP} (${TODAY})                     ║
║   Modo: ${DRY_RUN ? '🧪 DRY RUN' : '🚀 PRODUÇÃO'}                        ║
╚══════════════════════════════════════════╝
  `)

  const topicInfo = getTopic()
  console.log(`   Tema:    "${topicInfo.topic}"
   Pilar:   ${topicInfo.pilar}
   Blog:    ${SKIP_BLOG ? '⏭️ skip' : '✅ ativo'}
   Visual:  ${SKIP_VISUAL ? '⏭️ skip' : '✅ ativo'}
  `)

  // 1. Research
  const researchData = await research(topicInfo.topic)

  // 2. Blog
  let blogPost = null
  if (!SKIP_BLOG) {
    blogPost = await createAndPublishBlog(researchData, topicInfo)
  }

  // 3. Social text posts (if blog was created)
  if (!SKIP_VISUAL && blogPost) {
    await createSocial(blogPost, researchData)
  }

  // 4. Visual generation (if not skipped)
  if (!SKIP_VISUAL) {
    runVisualGenerator()
  }

  // 5. Final log if dry run
  if (DRY_RUN) {
    log('🏁', 'Dry-run concluído — nada foi enviado')
  }

  console.log(`
╔══════════════════════════════════════════╗
║   Daily Pipeline Complete!               ║
║   Blog:  ${blogPost ? '✅ "' + blogPost.title.slice(0, 45) + '"' : '⏭️  skip'}   ║
║   Data:  ${TIMESTAMP} (${TODAY})                          ║
╚══════════════════════════════════════════╝
  `)
}

main().catch(e => {
  console.error(`\n❌ Pipeline failed: ${e.message}`)
  process.exit(1)
})
