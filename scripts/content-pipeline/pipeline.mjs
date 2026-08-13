#!/usr/bin/env node
/**
 * Content Pipeline Evolua — fully automated content factory.
 *
 * Usage:
 *   node scripts/content-pipeline/pipeline.mjs                  # auto topic from schedule
 *   node scripts/content-pipeline/pipeline.mjs --topic "texto"  # custom topic
 *   node scripts/content-pipeline/pipeline.mjs --skip-blog      # social only
 *   node scripts/content-pipeline/pipeline.mjs --skip-social    # blog only
 *   node scripts/content-pipeline/pipeline.mjs --dry-run        # no publish/send
 *
 * Env vars required:
 *   OPENROUTER_API_KEY
 *   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY  (for blog publish)
 *   RESEND_API_KEY                             (for social email)
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..', '..')
const CONFIG = JSON.parse(readFileSync(resolve(__dirname, 'config.json'), 'utf-8'))
const OUTPUT_DIR = resolve(__dirname, 'output')

const args = process.argv.slice(2)
const TOPIC = (() => {
  const idx = args.indexOf('--topic')
  if (idx === -1) return null
  const topicArgs = []
  for (let i = idx + 1; i < args.length; i++) {
    if (args[i].startsWith('--')) break
    topicArgs.push(args[i])
  }
  return topicArgs.join(' ')
})()
const SKIP_BLOG = args.includes('--skip-blog')
const SKIP_SOCIAL = args.includes('--skip-social')
const DRY_RUN = args.includes('--dry-run')

if (process.env.OPENROUTER_MODEL) {
  CONFIG.ai.model = process.env.OPENROUTER_MODEL
}

function extractJson(raw) {
  if (!raw) throw new Error('Empty AI response')
  const cleaned = raw.replace(/```json\n?|```/g, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) {
    console.error('RAW AI RESPONSE (first 500 chars):', raw.slice(0, 500))
    throw new Error('No JSON object found in AI response')
  }
  let json = cleaned.slice(start, end + 1)

  // Fix common LLM JSON issues before parsing
  json = json
    // Remove literal newlines inside strings (replace with \n)
    .replace(/[\r\n]+/g, ' ')
    // Collapse multiple spaces
    .replace(/[ \t]+/g, ' ')
    // Fix unescaped control characters (like actual tabs)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ')

  try {
    return JSON.parse(json)
  } catch (e) {
    // Try more aggressive fix: find the actual content string and sanitize it
    try {
      const contentMatch = json.match(/"content_html":\s*"((?:[^"\\]|\\.)*)"/)
      if (contentMatch) {
        const dirty = contentMatch[1]
        const clean = dirty.replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, ' ').replace(/"/g, "'")
        json = json.replace(contentMatch[1], clean)
      }
      return JSON.parse(json)
    } catch (e2) {
      writeFileSync(resolve(OUTPUT_DIR, 'json-error-raw.txt'), json)
      console.error('JSON PARSE ERROR. Saved raw JSON to output/json-error-raw.txt')
      console.error('Error:', e.message)
      const lines = json.split('\n')
      const lineMatch = e.message.match(/position (\d+)/)
      if (lineMatch) {
        const pos = parseInt(lineMatch[1])
        const lineNum = json.slice(0, pos).split('\n').length
        console.error(`Near line ${lineNum}:`, lines[lineNum - 1]?.slice(0, 200))
      }
      throw e
    }
  }
}

function log(step, msg) {
  const ts = new Date().toISOString().slice(11, 19)
  console.log(`[${ts}] [${step}] ${msg}`)
}

function getTodayTopic() {
  const days = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']
  const today = days[new Date().getDay()]
  const entry = CONFIG.blog.schedule.find(s => s.day === today)
  if (!entry) {
    log('SCHEDULE', `No schedule for ${today} — falling back to "gestao"`)
    return { topic: 'gestao de consultorio para fonoaudiologas', pilar: 'Gestão de Clínica' }
  }
  return { topic: `${entry.pilar} para fonoaudiologas`, pilar: entry.pilar }
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 60000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function callAI(messages, systemPrompt, options = {}, retries = 3) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set')
  let lastErr
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetchWithTimeout('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://useevolua.com.br',
          'X-Title': 'Evolua Content Pipeline',
        },
        body: JSON.stringify({
          model: CONFIG.ai.model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
          ],
          temperature: options.temperature ?? CONFIG.ai.temperature,
          max_tokens: options.maxTokens ?? CONFIG.ai.maxTokens,
        }),
      }, 60000)
      if (!response.ok) {
        const err = await response.text()
        throw new Error(`AI error ${response.status}: ${err.slice(0, 300)}`)
      }
      const data = await response.json()
      if (!data.choices?.[0]?.message?.content) {
        console.error('Unexpected API response:', JSON.stringify(data).slice(0, 500))
        return null
      }
      return data.choices[0].message.content
    } catch (err) {
      lastErr = err
      if (attempt < retries - 1) {
        const delay = 1000 * Math.pow(2, attempt)
        log('AI', `Retry ${attempt + 1}/${retries} after ${delay}ms: ${err.message}`)
        await new Promise(r => setTimeout(r, delay))
      }
    }
  }
  throw lastErr
}

async function research(topic) {
  log('RESEARCH', `Researching: "${topic}"`)
  const prompt = `Você é uma pesquisadora de conteúdo para fonoaudiologia no Brasil.
Pesquise sobre o tema abaixo e retorne em JSON puro (sem markdown):
{
  "topic": "tema",
  "keywords": ["kw1", "kw2"],
  "target_audience": "público-alvo",
  "pain_points": ["dor1", "dor2"],
  "data_points": ["dado1", "dado2"],
  "competitors_coverage": "como concorrentes cobrem o tema",
  "angle_suggestions": ["angulo1", "angulo2"],
  "faq": [{"q": "pergunta", "a": "resposta"}]
}
Tema: ${topic}`
  const raw = await callAI(
    [{ role: 'user', content: `Pesquise sobre: ${topic} para fonoaudiólogas no Brasil.` }],
    prompt
  )
  const data = extractJson(raw)
  writeFileSync(resolve(OUTPUT_DIR, 'research.json'), JSON.stringify(data, null, 2))
  log('RESEARCH', 'Done')
  return data
}

const COVER_IMAGES = {
  Marketing: 'https://images.pexels.com/photos/7654128/pexels-photo-7654128.jpeg?w=800&q=80',
  Gestão: 'https://images.pexels.com/photos/4386366/pexels-photo-4386366.jpeg?w=800&q=80',
  Clínica: 'https://images.pexels.com/photos/7578828/pexels-photo-7578828.jpeg?w=800&q=80',
  Carreira: 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?w=800&q=80',
  Tecnologia: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?w=800&q=80',
  Fonoaudiologia: 'https://images.pexels.com/photos/7654128/pexels-photo-7654128.jpeg?w=800&q=80',
}

async function createBlogPost(research, pilar) {
  log('BLOG', 'Creating blog post...')
  const category = pilar === 'Marketing Digital' ? 'Marketing' : pilar.includes('Gestão') ? 'Gestão' : pilar.includes('Tecnologia') ? 'Tecnologia' : pilar.includes('Clínica') ? 'Clínica' : 'Carreira'
  const currentYear = new Date().getFullYear()
  const prompt = `Você é uma redatora especializada em fonoaudiologia para o blog da Evolua (plataforma CRM para fonoaudiólogas).

IMPORTANTE: O ano atual é ${currentYear}. NUNCA use anos anteriores (como 2024, 2023, etc.) em títulos ou conteúdo.

Diretrizes obrigatórias:
1. CONTEÚDO VERDADEIRO — Toda informação deve ser factual, baseada em evidências científicas ou em boas práticas reconhecidas pela CFFa (Conselho Federal de Fonoaudiologia). Nunca invente dados, pesquisas ou estudos.
2. BASE CIENTÍFICA — Sempre que citar dado ou estatística, seja genérico e honesto ("estudos apontam", "pesquisas indicam") sem atribuir a fontes específicas que não existem. Priorize conteúdo baseado em prática clínica real.
3. SEM PROMESSAS MILAGROSAS — Nunca prometa resultados milagrosos, curas rápidas ou números exatos de conversão/faturamento.
4. CONCORRÊNCIA — Diferencie-se da concorrência pelo aprofundamento técnico e aplicação prática, nunca por ataques ou falsas comparações.

Gere um post de blog completo em JSON puro (sem markdown):
{
  "title": "Título SEO otimizado (máx 60 chars) — use o ano ${currentYear} se necessário",
  "slug": "slug-amigavel",
  "excerpt": "Resumo de 2 linhas (máx 160 chars)",
  "content_html": "Conteúdo completo em HTML válido (<p>, <h2>, <h3>, <blockquote>, <ul>, <li>, <strong>, <em>). Mínimo 800 palavras. Use ano ${currentYear}.",
  "author": "Equipe Evolua",
  "category": "Marketing|Gestão|Clínica|Carreira|Tecnologia|Fonoaudiologia",
  "cover_image": "URL da imagem de destaque do Pexels (ex: https://images.pexels.com/photos/..., w=800, q=80). Escolha uma imagem relevante ao tema do post.",
  "read_time": 5,
  "tags": ["tag1", "tag2"]
}

Regras de tom:
- Tom direto, acolhedor e prático — como se fosse uma fono mais experiente ajudando outra
- Incluir CTA sutil para teste grátis da Evolua no final
- Categoria deve ser "${category}"
- Slug em PT-BR, sem acentos, hífens entre palavras
- Título deve ser honesto e representar fielmente o conteúdo do post
- Use sempre o ano ${currentYear} em títulos e conteúdo`

  let raw = await callAI(
    [{ role: 'user', content: `Pesquisa:\n${JSON.stringify(research, null, 2)}\n\nCrie o post para o blog.` }],
    prompt,
    { maxTokens: 8192 }
  )
  if (!raw || raw.length < 50) {
    console.error('Short/empty AI response, retrying...')
    raw = await callAI(
      [{ role: 'user', content: `Pesquisa:\n${JSON.stringify(research, null, 2)}\n\nCrie o post para o blog. Retorne APENAS JSON válido, sem markdown.` }],
      prompt,
      { maxTokens: 8192 }
    )
  }
  const post = extractJson(raw)

  const filePath = resolve(PROJECT_ROOT, CONFIG.blog.outputDir, `${post.slug}.md`)
  const markdown = `---
title: "${post.title}"
slug: "${post.slug}"
excerpt: "${post.excerpt}"
category: "${post.category}"
author: "${post.author}"
read_time: ${post.read_time}
tags: [${post.tags.map(t => `"${t}"`).join(', ')}]
cover_image: "${post.cover_image || COVER_IMAGES[post.category] || COVER_IMAGES.Fonoaudiologia}"
published_at: "${new Date().toISOString()}"
---

${post.content_html.replace(/<[^>]+>/g, '').slice(0, 500)}...
`
  writeFileSync(filePath, markdown)
  log('BLOG', `Saved draft to ${filePath}`)
  return post
}

async function publishToSupabase(post) {
  log('PUBLISH', 'Publishing to Supabase (upsert by slug)...')
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    log('PUBLISH', '⚠️  SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — skipping publish')
    return null
  }

  const body = {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content_html,
    cover_image: post.cover_image || COVER_IMAGES[post.category] || COVER_IMAGES.Fonoaudiologia,
    author: post.author || 'Equipe Evolua',
    category: post.category,
    read_time: post.read_time || 5,
    featured: false,
    status: 'published',
    published_at: new Date().toISOString(),
  }

  let lastErr
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetchWithTimeout(`${supabaseUrl}/rest/v1/blog_posts?on_conflict=slug`, {
        method: 'POST',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation,resolution=merge-duplicates',
        },
        body: JSON.stringify(body),
      }, 30000)

      if (!response.ok) {
        const err = await response.text()
        lastErr = new Error(`Supabase publish failed: ${response.status} ${err.slice(0, 300)}`)
      } else {
        const result = await response.json()
        const published = Array.isArray(result) ? result[0] : result
        log('PUBLISH', `✅ Published: "${post.title}" (id: ${published.id})`)
        return published
      }
    } catch (err) {
      lastErr = err
    }
    if (attempt < 2) {
      const delay = 1000 * Math.pow(2, attempt)
      log('PUBLISH', `Retry publish ${attempt + 1}/3 after ${delay}ms: ${lastErr.message}`)
      await new Promise(r => setTimeout(r, delay))
    }
  }
  throw lastErr
}

async function createSocialPosts(blogPost, research) {
  log('SOCIAL', 'Creating social media posts...')
  const prompt = `Você é uma social media strategist especializada em fonoaudiologia.

Com base no post de blog abaixo, crie posts para 4 canais.
Retorne em JSON puro (sem markdown):
{
  "linkedin": {
    "post": "texto completo do post (500-800 chars)",
    "hashtags": ["#hashtag1", "#hashtag2"],
    "best_time": "melhor horário"
  },
  "instagram": {
    "carrossel_slides": [
      {"slide": 1, "texto": "texto do slide 1"},
      {"slide": 2, "texto": "texto do slide 2"},
      {"slide": 3, "texto": "texto do slide 3"},
      {"slide": 4, "texto": "texto do slide 4"},
      {"slide": 5, "texto": "texto do slide 5"}
    ],
    "caption": "legenda completa com CTA (máx 2200 chars)",
    "hashtags": ["#hashtag1", "#hashtag2"]
  },
  "threads": {
    "tweets": ["tweet 1", "tweet 2", "tweet 3", "tweet 4", "tweet 5"],
    "hashtags": ["#hashtag1"]
  },
  "x": {
    "post": "texto do post (máx 280 chars)",
    "hashtags": ["#hashtag1"]
  }
}

Regras:
- LinkedIn: tom profissional mas acessível, storytelling, CTA no final
- Instagram: visual-first, bullets curtos, linguagem informal, CTA para salvar/compartilhar
- Threads: sequência de 5 tweets que contam uma história, gancho no primeiro
- X: impacto máximo em 280 caracteres

Blog: "${blogPost.title}"
Resumo: ${blogPost.excerpt}`

  const raw = await callAI(
    [{ role: 'user', content: `Blog:\nTítulo: ${blogPost.title}\nConteúdo: ${blogPost.content_html}\nPesquisa: ${JSON.stringify(research, null, 2)}\n\nCrie os posts sociais.` }],
    prompt,
    { maxTokens: 8192 }
  )
  const posts = extractJson(raw)

  writeFileSync(resolve(OUTPUT_DIR, 'social-posts.json'), JSON.stringify(posts, null, 2))

  // Save to platform directories as fallback
  const contentDir = resolve(PROJECT_ROOT, 'docs/content-assets')
  try {
    writeFileSync(resolve(contentDir, '06-linkedin', `${blogPost.slug}.md`), `# LinkedIn — ${blogPost.title}\n\n${posts.linkedin.post}\n\n${posts.linkedin.hashtags.join(' ')}\n`)
    writeFileSync(resolve(contentDir, '03-instagram-feed', `${blogPost.slug}.md`), `# Instagram — ${blogPost.title}\n\n## Carrossel\n${posts.instagram.carrossel_slides.map(s => `**Slide ${s.slide}:** ${s.texto}`).join('\n\n')}\n\n## Legenda\n${posts.instagram.caption}\n\n${posts.instagram.hashtags.join(' ')}\n`)
    writeFileSync(resolve(contentDir, '08-threads', `${blogPost.slug}.md`), `# Threads — ${blogPost.title}\n\n${posts.threads.tweets.map((t, i) => `${i + 1}/${posts.threads.tweets.length} ${t}`).join('\n\n')}\n`)
    writeFileSync(resolve(contentDir, '09-x', `${blogPost.slug}.md`), `# X — ${blogPost.title}\n\n${posts.x.post}\n\n${posts.x.hashtags.join(' ')}\n`)
    log('SOCIAL', 'Saved to content-assets directories')
  } catch (e) {
    log('SOCIAL', `⚠️  Could not save to content-assets: ${e.message}`)
  }

  log('SOCIAL', 'Social posts created')
  return posts
}

async function emailSocialPosts(posts, blogPost) {
  log('EMAIL', 'Sending social posts via Resend...')
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@useevolua.com.br'

  if (!apiKey) {
    log('EMAIL', '⚠️  RESEND_API_KEY not set — saving to file instead')
    return
  }

  function buildHtml(posts, blogPost) {
    const channelStyles = {
      linkedin: { label: 'LINKEDIN', bg: '#0A66C2', border: '#0A66C2' },
      instagram: { label: 'INSTAGRAM', bg: '#0A0A14', border: '#C4F135' },
      threads: { label: 'THREADS', bg: '#0A0A14', border: '#8B5CF6' },
      x: { label: 'X / TWITTER', bg: '#0A0A14', border: '#8B5CF6' },
    }
    function channelHeader(key) {
      const s = channelStyles[key]
      return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
        <div style="width:4px;height:24px;border-radius:2px;background:${s.border}"></div>
        <span style="font-family:Space Grotesk,system-ui,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.15em;color:#8B5CF6">${s.label}</span>
      </div>`
    }
    function hashtagsHtml(tags) {
      return tags.length ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:11px;color:#8B5CF6;letter-spacing:0.02em">${tags.join(' ')}</div>` : ''
    }
    const channelBlocks = {
      linkedin: `${channelHeader('linkedin')}<p style="font-size:14px;line-height:1.7;color:#1A1A2E;margin:0">${posts.linkedin.post.replace(/\n/g, '<br>')}</p>${hashtagsHtml(posts.linkedin.hashtags)}`,
      instagram: `${channelHeader('instagram')}
        <div style="display:flex;gap:4px;margin-bottom:16px;overflow-x:auto;padding-bottom:4px">${posts.instagram.carrossel_slides.map(s => `<div style="min-width:90px;height:90px;background:#f3f4f6;border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:9px;padding:4px;text-align:center;font-weight:600;color:#1A1A2E;border:1px solid #e2e8f0">${s.texto.slice(0, 60)}</div>`).join('')}</div>
        <p style="font-size:14px;line-height:1.7;color:#1A1A2E;margin:0">${posts.instagram.caption.replace(/\n/g, '<br>')}</p>${hashtagsHtml(posts.instagram.hashtags)}`,
      threads: `${channelHeader('threads')}<ol style="margin:0;padding-left:20px">${posts.threads.tweets.map((t, i) => `<li style="margin-bottom:10px;font-size:14px;line-height:1.7;color:#1A1A2E">${t}</li>`).join('')}</ol>`,
      x: `${channelHeader('x')}<p style="font-size:14px;line-height:1.7;color:#1A1A2E;margin:0">${posts.x.post}</p>${hashtagsHtml(posts.x.hashtags)}`,
    }
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap');
</style></head>
<body style="margin:0;padding:0;background:#F8F8FF;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="max-width:580px;margin:24px auto;background:#FFFFFF;border-radius:8px;overflow:hidden">
  <div style="background:#0A0A14;padding:48px 40px 40px;text-align:center">
    <div style="font-family:'Space Grotesk',system-ui,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.3em;color:#8B5CF6;margin-bottom:12px">EVOLUA</div>
    <h1 style="font-family:'Space Grotesk',system-ui,sans-serif;color:#C4F135;margin:0 0 4px;font-size:20px;font-weight:700;letter-spacing:-0.02em">Posts Sociais</h1>
    <p style="color:#8B5CF6;margin:0;font-size:12px;font-weight:400;letter-spacing:0.02em">Prontos para publicar</p>
  </div>
  <div style="padding:32px 32px 24px">
    <div style="display:flex;align-items:flex-start;gap:12px;background:#F8F8FF;border-radius:6px;padding:16px;margin-bottom:32px">
      <div style="width:3px;height:48px;background:#8B5CF6;border-radius:2px;flex-shrink:0"></div>
      <div>
        <p style="margin:0 0 2px;font-size:10px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:#8B5CF6">Post de referência</p>
        <a href="https://useevolua.com.br/blog/${blogPost.slug}" style="color:#1A1A2E;font-family:'Space Grotesk',system-ui,sans-serif;font-weight:600;font-size:15px;text-decoration:none;line-height:1.4">${blogPost.title}</a>
      </div>
    </div>
    ${Object.values(channelBlocks).join('<div style="height:24px;border-top:1px solid #F0F0F5;margin:24px 0 0;padding-top:24px"></div>')}
  </div>
  <div style="background:#F8F8FF;padding:20px 32px;text-align:center;border-top:1px solid #F0F0F5">
    <p style="color:#8B5CF6;font-family:'Space Grotesk',system-ui,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.15em;margin:0 0 4px">EVOLUA</p>
    <p style="color:#4A4A6A;font-size:11px;margin:0;line-height:1.5">Gerado pelo Content Pipeline Evolua</p>
    <p style="color:#4A4A6A;font-size:10px;margin:2px 0 0">${new Date().toLocaleString('pt-BR')}</p>
  </div>
</div>
</body>
</html>`
  }

  const res = await fetchWithTimeout('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: fromEmail,
      to: CONFIG.social.emailRecipient,
      subject: `${CONFIG.social.emailSubject} — "${blogPost.title}"`,
      html: buildHtml(posts, blogPost),
      text: `Posts Sociais — ${blogPost.title}\n\nLinkedIn:\n${posts.linkedin.post}\n\nInstagram:\n${posts.instagram.caption}\n\nThreads:\n${posts.threads.tweets.join('\n')}\n\nX:\n${posts.x.post}`,
    }),
  }, 30000)

  if (!res.ok) {
    const err = await res.text()
    log('EMAIL', `⚠️  Resend failed: ${res.status} ${err.slice(0, 200)}`)
    log('EMAIL', '💡 Posts saved locally — check output/social-posts.json')
  } else {
    const data = await res.json().catch(() => ({}))
    log('EMAIL', `✅ Email sent to ${CONFIG.social.emailRecipient} (id: ${data.id || 'ok'})`)
  }
}

async function run() {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('OPENROUTER_API_KEY is required')
    process.exit(1)
  }

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true })

  const topicData = TOPIC
    ? { topic: TOPIC, pilar: 'Customizado' }
    : getTodayTopic()

  console.log(`
╔══════════════════════════════════════════╗
║   Evolua Content Pipeline               ║
║   Tema: "${topicData.topic.slice(0, 50)}"       ║
║   Modo: ${DRY_RUN ? '🧪 DRY RUN' : '🚀 PRODUÇÃO'}                        ║
╚══════════════════════════════════════════╝
`)

  const researchData = await research(topicData.topic)

  let blogPost = null
  let socialPosts = null

  if (!SKIP_BLOG) {
    blogPost = await createBlogPost(researchData, topicData.pilar)

    if (!DRY_RUN) {
      const result = await publishToSupabase(blogPost)
      if (result) {
        blogPost.id = result.id
      }
    } else {
      log('BLOG', '🧪 DRY RUN — skipping Supabase publish')
    }
  }

  if (!SKIP_SOCIAL) {
    const socialBlogPost = blogPost || {
      title: researchData.topic,
      excerpt: researchData.pain_points?.slice(0, 2).join('. ') || 'Conteúdo sobre ' + researchData.topic,
      content_html: `<p>${researchData.pain_points?.join('</p><p>') || 'Conteúdo gerado automaticamente.'}</p>`,
      slug: researchData.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    }
    socialPosts = await createSocialPosts(socialBlogPost, researchData)

    if (!DRY_RUN) {
      await emailSocialPosts(socialPosts, socialBlogPost)
    } else {
      log('SOCIAL', '🧪 DRY RUN — skipping email send')
    }
  }

  console.log(`
╔══════════════════════════════════════════╗
║   Pipeline Complete!                     ║
║   Blog: ${blogPost ? '✅ ' + blogPost.title.slice(0, 40) : '⏭️  skipped'}   ║
║   Social: ${socialPosts ? '✅ Ready' : '⏭️  skipped'}                      ║
║   Files: ${OUTPUT_DIR}/                      ║
╚══════════════════════════════════════════╝
`)
}

run().catch(err => {
  console.error('\n❌ Pipeline failed:', err.message)
  process.exit(1)
})
