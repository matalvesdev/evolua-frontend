#!/usr/bin/env node
/**
 * Content Engine — Evolua Weekly Educational Content Multiplication Pipeline
 *
 * Gera materiais didáticos para fonoaudiólogas baseados em:
 * - Análise de inteligência competitiva (docs/competitive-intelligence/)
 * - Evidências científicas e prática clínica
 * - Protocolos: MBGR, DOSS, FOIS, GRBAS, VHI-10
 *
 * Multiplicação semanal: 1 Ebook + 3 Infográficos + 10 Carrosséis
 *   + 20 Posts Sociais + 10 Stories + 5 Reels + 5 Ad Creatives
 *   + 1 Landing Page + 1 Email Funnel
 *
 * TODO conteúdo é EDUCATIVO/CLÍNICO — NÃO gera conteúdo de marketing digital.
 * Atrai leads posicionando a Evolua como ferramenta que implementa os protocolos.
 *
 * Usage:
 *   node scripts/content-engine/engine.mjs                          # latest clinical topic
 *   node scripts/content-engine/engine.mjs --topic "FOIS escala"   # custom clinical topic
 *   node scripts/content-engine/engine.mjs --skip-email             # no email send
 *   node scripts/content-engine/engine.mjs --dry-run                # test no publish
 *
 * Env: OPENROUTER_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { resolve, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..', '..')
const CONFIG = JSON.parse(readFileSync(resolve(__dirname, 'config.json'), 'utf-8'))
const OUTPUT_DIR = resolve(__dirname, 'output', new Date().toISOString().slice(0, 10))
const ENGINE_MODULES = resolve(__dirname, 'modules')

// Auto-load .env for local dev
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
const CUSTOM_TOPIC = (() => {
  const idx = args.indexOf('--topic')
  return idx === -1 ? null : args.slice(idx + 1).find(a => !a.startsWith('--')) || null
})()
const SKIP_EMAIL = args.includes('--skip-email')
const DRY_RUN = args.includes('--dry-run')

function log(step, msg) {
  const ts = new Date().toISOString().slice(11, 19)
  console.log(`[${ts}] [${step}] ${msg}`)
}

function extractJson(raw) {
  if (!raw) throw new Error('Empty AI response')
  const cleaned = raw.replace(/```json\n?|```/g, '').trim()

  // Find balanced root JSON object by counting braces
  function findBalanced(str, open, close) {
    let depth = 0, start = -1
    for (let i = 0; i < str.length; i++) {
      if (str[i] === open) {
        if (start === -1) start = i
        depth++
      } else if (str[i] === close) {
        depth--
        if (depth === 0 && start !== -1) return { start, end: i + 1 }
        if (depth < 0) break
      } else if (str[i] === '"') {
        i++ // skip escaped quotes inside strings
        while (i < str.length && (str[i] !== '"' || str[i - 1] === '\\')) i++
      }
    }
    return null
  }

  const obj = findBalanced(cleaned, '{', '}')
  if (obj) {
    try { return JSON.parse(cleaned.slice(obj.start, obj.end)) } catch {}
  }

  const arr = findBalanced(cleaned, '[', ']')
  if (arr) {
    try { return JSON.parse(cleaned.slice(arr.start, arr.end)) } catch {}
  }

  safeWriteError(resolve(OUTPUT_DIR, 'json-error.txt'), cleaned.slice(0, 2000))
  throw new Error('No valid JSON found in AI response (balanced brace check failed)')
}

function safeWriteError(path, content) {
  try {
    const dir = dirname(path)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(path, content)
  } catch {}
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
      'X-Title': 'Evolua Content Engine',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || CONFIG.ai.model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: options.temperature ?? CONFIG.ai.temperature,
      max_tokens: options.maxTokens ?? CONFIG.ai.maxTokens,
    }),
  })
  if (!res.ok) throw new Error(`AI ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content || null
}

async function callAIBatch(prompt, msg, options = {}) {
  options.maxTokens = options.maxTokens ?? 8192
  const raw = await callAI(
    [{ role: 'user', content: msg }],
    `Você é o Content Engine Educacional da Evolua (CRM para fonoaudiólogas). Crie materiais didáticos baseados em evidências científicas para fonoaudiólogas. NUNCA invente estudos ou dados. Retorne APENAS JSON puro, sem markdown.\n\n${prompt}`,
    options
  )
  if (!raw || raw.length < 50) throw new Error('Empty or too short AI response')
  return extractJson(raw)
}

// ─── Load competitive intelligence & content strategy ──────
function loadMarketIntel() {
  const ciDir = resolve(ROOT, 'docs/competitive-intelligence')
  const data = { summary: '', customerResearch: '', contentStrategy: '', estrategiaConteudo: null }
  try { data.summary = readFileSync(resolve(ciDir, '_summary.md'), 'utf-8') } catch {}
  try { data.customerResearch = readFileSync(resolve(ciDir, '_customer-research.md'), 'utf-8') } catch {}
  try { data.contentStrategy = readFileSync(resolve(ciDir, '_content-strategy.md'), 'utf-8') } catch {}
  try { data.estrategiaConteudo = JSON.parse(readFileSync(resolve(ciDir, 'estrategia-conteudo.json'), 'utf-8')) } catch {}
  return data
}

// ─── Input: get latest week's blog posts (for inspiration) ──
function getWeekPosts() {
  const draftsDir = resolve(ROOT, 'docs/content-assets/02-blog-posts')
  if (!existsSync(draftsDir)) return []
  const posts = []
  const allFiles = readdirSync(draftsDir).filter(f => f.endsWith('.md')).slice(-5)
  for (const file of allFiles) {
    try {
      const content = readFileSync(resolve(draftsDir, file), 'utf-8')
      const meta = {}
      const metaMatch = content.match(/^---\n([\s\S]*?)\n---\n/)
      if (metaMatch) {
        for (const line of metaMatch[1].split('\n')) {
          const [k, ...v] = line.split(':')
          if (k && v.length) meta[k.trim()] = v.join(':').trim().replace(/^"|"$/g, '')
        }
      }
      const htmlMatch = content.match(/---\n[\s\S]*?\n---\n\n([\s\S]*)/)
      posts.push({ ...meta, content: htmlMatch ? htmlMatch[1] : content })
    } catch {}
  }
  return posts
}

// ─── Step 1: Research & Compile ──────────────────────────────
async function researchAndCompile(posts) {
  log('🔬', 'Compilando pesquisa semanal...')

  // Load competitive intelligence as context
  const marketIntel = loadMarketIntel()
  const clinicalTopics = [
    { id: 'mbgr', title: 'MBGR — Protocolo de Avaliação Miofuncional Orofacial', keywords: ['MBGR', 'avaliação miofuncional', 'motricidade orofacial'] },
    { id: 'doss', title: 'DOSS — Dysphagia Outcome and Severity Scale', keywords: ['DOSS', 'disfagia', 'escala de gravidade'] },
    { id: 'fois', title: 'FOIS — Functional Oral Intake Scale', keywords: ['FOIS', 'ingestão oral', 'disfagia'] },
    { id: 'grbas', title: 'GRBAS — Escala de Avaliação Perceptivo-Auditiva da Voz', keywords: ['GRBAS', 'voz', 'avaliação perceptivo-auditiva'] },
    { id: 'vhi-10', title: 'VHI-10 — Voice Handicap Index', keywords: ['VHI-10', 'qualidade de vida', 'voz'] },
    { id: 'anamnese-disfagia', title: 'Anamnese de Disfagia: Perguntas Essenciais', keywords: ['anamnese', 'disfagia', 'avaliação clínica'] },
    { id: 'cffa-documentacao', title: 'CFFa: Guia de Documentação Obrigatória 2026', keywords: ['CFFa', 'documentação', 'regularização'] },
    { id: 'relatorio-escolar', title: 'Relatório Fonoaudiológico para Escolas e Pais', keywords: ['relatório escolar', 'fonoaudiologia infantil', 'devolutiva'] },
    { id: 'prontuario-digital', title: 'Prontuário Eletrônico na Fonoaudiologia: Guia Prático', keywords: ['prontuário eletrônico', 'LGPD', 'fonoaudiologia'] },
  ]

  // Select topic: use existing posts' categories or cycle through clinical topics
  if (posts.length > 0 && !CUSTOM_TOPIC) {
    const bestPost = posts[0]
    return {
      topic: bestPost.title || clinicalTopics[0].title,
      keywords: [bestPost.category || 'Fonoaudiologia', ...clinicalTopics[0].keywords],
      target_audience: 'Fonoaudiólogas brasileiras',
      pain_points: ['Tempo gasto com documentação clínica', 'Ferramentas genéricas sem protocolos nativos', 'Relatórios manuais para escolas/pais'],
      data_points: [],
      angle_suggestions: ['Conteúdo educativo baseado em evidências científicas', 'Aplicação prática no dia a dia clínico'],
      source_posts: posts.map(p => ({ title: p.title, slug: p.slug })),
      marketIntel,
    }
  }

  // Pick clinical topic
  const topicIndex = new Date().getDay() % clinicalTopics.length
  const selectedTopic = CUSTOM_TOPIC
    ? { id: 'custom', title: CUSTOM_TOPIC, keywords: [CUSTOM_TOPIC] }
    : clinicalTopics[topicIndex]

  const raw = await callAI(
    [{ role: 'user', content: `Pesquise sobre o tema clínico para fonoaudiologia: ${selectedTopic.title}. Baseie-se em evidências científicas e práticas clínicas brasileiras.` }],
    `Você é pesquisadora clínica em Fonoaudiologia. Retorne JSON:
{ "topic": "tema", "keywords": ["kw1"], "target_audience": "público", "pain_points": ["dor1"], "data_points": ["dado científico 1"], "angle_suggestions": ["ângulo educativo 1"] }
Tema: ${selectedTopic.title}
Contexto de mercado: ${marketIntel.summary.slice(0, 500)}`
  )
  return { ...extractJson(raw), source_posts: [], marketIntel, topic: selectedTopic.title }
}

// ─── Step 2: Generate Ebook (didático-clínico) ────────────────
async function generateEbook(research) {
  log('📖', 'Gerando ebook didático...')
  const prompt = `Você é uma fonoaudióloga clínica e educadora, especialista em criar materiais didáticos para fonoaudiólogas brasileiras.
Crie um ebook educativo com embasamento científico sobre o tema. Use referências reais da literatura fonoaudiológica (cite autores/estudos quando possível, sem inventar).

Retorne JSON puro:
{
  "id": "ebook-slug",
  "title": "Título do Ebook",
  "subtitle": "Subtítulo educativo",
  "author": "Equipe Evolua",
  "cover_description": "Descrição para capa profissional, tons de azul/verde, estilo científico",
  "sections": [
    { "title": "Título da seção", "content": "<p>Conteúdo HTML da seção</p>", "icon": "descrição" }
  ],
  "cta": "CTA sutil sobre como a Evolua implementa esses protocolos nativamente",
  "word_count": 4000
}

Regras:
- 4-6 seções com conteúdo CLÍNICO PRÁTICO, não de marketing
- Tom educacional, técnico mas acessível, baseado em evidências
- Incluir exemplos reais do consultório, checklists, fluxos de avaliação
- CTA sutil no final: a Evolua já tem esses protocolos embutidos
- Conteúdo em HTML válido (<p>, <h2>, <h3>, <ul>, <blockquote>, <table>)
- NUNCA invente estudos, escalas ou dados científicos
- NÃO falar sobre marketing digital, redes sociais, ou captação de pacientes`

  const marketData = research.marketIntel
    ? `\n\nDiferenciais de mercado da Evolua (use com moderação):\n${research.marketIntel.summary?.slice(0, 300) || ''}`
    : ''

  const data = await callAIBatch(prompt,
    `Tema: ${research.topic}
Keywords: ${research.keywords.join(', ')}
Dores clínicas: ${research.pain_points.join(', ')}
Público: ${research.target_audience}
${marketData}

Crie o ebook didático com conteúdo clínico prático. Máximo 5 seções concisas.`,
    { maxTokens: 16384 }
  )

  data.source_topic = research.topic
  data.generated_at = new Date().toISOString()
  return data
}

// ─── Step 3: Generate Infographics (didáticos-clínicos) ──────
async function generateInfographics(ebook, count) {
  log('🎨', `Gerando ${count} infográficos educativos...`)
  const results = []
  for (let i = 0; i < count; i++) {
    const section = ebook.sections?.[i] || ebook.sections?.[0] || { title: ebook.title, content: '' }
    const prompt = `Crie um infográfico didático para fonoaudiólogas sobre o tema clínico: "${section.title}".
Retorne JSON:
{
  "id": "infografico-slug",
  "title": "Título do Infográfico",
  "subtitle": "Subtítulo",
  "source_section": "${section.title}",
  "visual_style": "estilo clean, profissional, cores em tons de azul e verde",
  "color_palette": ["#1A1A2E", "#2D2D5E", "#C4F135", "#8B5CF6"],
  "elements": [
    { "type": "header|stat|tip|step|quote|protocolo|checklist", "content": "texto", "icon": "descrição" }
  ],
  "layout": "vertical",
  "call_to_action": "Evolua — CRM para Fonoaudiólogas com protocolos nativos"
}
Regras:
- Elementos CLÍNICOS: etapas de avaliação, critérios de escala, checklist de anamnese, fluxograma de conduta
- Tom técnico-educativo, não promocional
- Incluir dados ou referências clínicas reais`
    let data
    try {
      data = await callAIBatch(prompt,
        `Baseado no ebook "${ebook.title}", crie um infográfico didático sobre: ${section.title}`,
        { maxTokens: 16384 }
      )
    } catch {
      log('🎨', `  ⚠️ Tentativa 1 falhou, regenerando infográfico ${i + 1}...`)
      const fallbackPrompt = `Crie um infográfico clínico conciso sobre "${section.title}". JSON: id, title, subtitle, elements (array de {type, content, icon}), layout. Máximo 6 elements. Tipo clínico-educativo.`
      const raw = await callAI(
        [{ role: 'user', content: `Crie infográfico clínico sobre: ${section.title} do ebook ${ebook.title}` }],
        fallbackPrompt,
        { maxTokens: 8192 }
      )
      data = extractJson(raw)
    }
    results.push(data)
    log('🎨', `  Infográfico ${i + 1}/${count}: "${data?.title || 'ok'}"`)
  }
  return results
}

// ─── Step 4: Generate Carousels (educativos-clínicos) ────────
async function generateCarousels(ebook, count) {
  log('🔄', `Gerando ${count} carrosséis educativos...`)
  const results = []
  for (let i = 0; i < count; i++) {
    const topics = [
      'Conceitos fundamentais e aplicação clínica',
      'Passo a passo da avaliação',
      'Erros comuns na prática clínica e como evitar',
      'Técnicas avançadas de intervenção',
      'Casos clínicos reais comentados',
      'Evidências científicas e benefícios',
      'Materiais e recursos recomendados',
      'FAQs: dúvidas frequentes da prática',
      'Checklist para o consultório',
      'Resultados esperados com a intervenção',
    ]
    const prompt = `Crie um carrossel educativo para Instagram/LinkedIn sobre o tema clínico "${ebook.title}" — foco didático em: ${topics[i % topics.length]}.
Retorne JSON:
{
  "id": "carrossel-slug",
  "title": "Título do Carrossel (hook clínico)",
  "platform": "instagram | linkedin",
  "slides": [
    { "slide": 1, "heading": "Título do slide", "content": "texto educativo (max 40 palavras)", "visual_note": "nota visual" }
  ],
  "caption": "Legenda com conteúdo clínico + CTA sutil",
  "hashtags": ["#Fonoaudiologia", "#PráticaClínica"],
  "call_to_action": "CTA educativo (ex: salve para consultar depois)"
}
Regras:
- Conteúdo didático, técnico e baseado em evidências
- NÃO falar sobre marketing digital ou captação
- Hook clínico no slide 1, CTA educativo no último
- 7 slides por carrossel`
    const data = await callAIBatch(prompt,
      `Ebook: "${ebook.title}". Tópico: ${topics[i % topics.length]}. Crie o carrossel clínico ${i + 1}.`,
      { maxTokens: 4096 }
    )
    results.push(data)
    log('🔄', `  Carrossel ${i + 1}/${count}: "${data.title}"`)
  }
  return results
}

// ─── Step 5: Generate Social Posts (educativos) ─────────────
async function generateSocialPosts(ebook, count) {
  log('📱', `Gerando ${count} posts educativos...`)
  const prompt = `Crie posts para redes sociais com dicas clínicas baseadas no material "${ebook.title}" da Evolua.
Retorne JSON (array):
[
  {
    "id": "post-1",
    "channel": "linkedin | instagram | threads | x | facebook",
    "format": "dica-clinica | pergunta-reflexao | checklist | citacao-estudo | caso-clinico",
    "content": "texto completo do post com dica clínica prática",
    "hashtags": ["#FonoaudiologiaClínica"],
    "best_time": "melhor horário",
    "visual_note": "descrição visual"
  }
]

Regras:
- LinkedIn: dicas técnicas profissionais, cases clínicos, reflexões sobre a prática
- Instagram: cards visuais com dicas rápidas, checklist, dados científicos
- Threads: fio explicativo sobre tema clínico, gancho no primeiro post
- X: dica clínica em 280 chars, citando evidência
- Facebook: conversas sobre desafios do dia a dia clínico
- VARIE formatos: dica, checklist, pergunta, dado científico, fluxograma
- NÃO falar sobre marketing digital, vendas ou captação de pacientes`
  let data
  try {
    data = await callAIBatch(prompt,
      `Material: "${ebook.title}". Gere ${count} posts com dicas clínicas para diferentes canais. Posts concisos (máx 200 chars cada).`,
      { maxTokens: 8192 }
    )
  } catch {
    log('📱', '⚠️ Tentativa 1 falhou, regenerando em lote menor...')
    try {
      const smallerPrompt = `Crie 10 posts com dicas clínicas baseadas em "${ebook.title}". Retorne JSON array. Cada post: { "id", "channel", "format", "content" (max 150 chars), "hashtags": [] }. Conteúdo técnico-educativo.`
      const raw = await callAI(
        [{ role: 'user', content: `Material: "${ebook.title}". Crie 10 dicas clínicas para redes sociais.` }],
        smallerPrompt,
        { maxTokens: 4096 }
      )
      data = extractJson(raw)
    } catch { data = [] }
  }
  return Array.isArray(data) ? data : []
}

// ─── Step 6: Generate Stories (educativas) ──────────────────
async function generateStories(ebook) {
  log('📸', 'Gerando stories educativos...')
  const prompt = `Crie 10 stories para Instagram com conteúdo educativo baseado em "${ebook.title}".
Retorne JSON (array):
[
  {
    "id": "story-1",
    "hook": "texto de abertura clínico (max 50 chars)",
    "content": "conteúdo educativo (max 100 chars)",
    "cta": "texto do CTA educativo",
    "interactive": "enquete | caixa de perguntas | quiz | slider | nenhum",
    "visual_style": "descrição visual clean, tons de azul/verde"
  }
]
Regras: Conteúdo clínico-didático. Story 1 gancho clínico. Stories 2-8 dicas. Story 9 recap. Story 10 CTA sutil.`
  const data = await callAIBatch(prompt, `Material: "${ebook.title}". Crie 10 stories educativos.`, { maxTokens: 4096 })
  return Array.isArray(data) ? data : []
}

// ─── Step 7: Generate Reels (educativos) ─────────────────────
async function generateReels(ebook) {
  log('🎬', 'Gerando scripts de reels educativos...')
  const prompt = `Crie 5 scripts de Reels/TikTok com dicas clínicas baseadas em "${ebook.title}".
Retorne JSON (array):
[
  {
    "id": "reel-1",
    "hook": "dica clínica de abertura (max 100 chars)",
    "script": "roteiro completo explicando conceito/checklist (max 60 segundos)",
    "visual_direction": "notas de direção visual para vídeo educativo",
    "music_vibe": "neutro/educativo",
    "cta_overlay": "salve esse post para consultar depois"
  }
]
Regras: Hook clínico nos primeiros 3 segundos. Conteúdo didático. Texto na tela. CTA educativo.`
  const data = await callAIBatch(prompt, `Material: "${ebook.title}". Crie 5 reels educativos.`, { maxTokens: 4096 })
  return Array.isArray(data) ? data : []
}

// ─── Step 8: Generate Ad Creatives (educativos/lead gen) ─────
async function generateAdCreatives(ebook) {
  log('📢', 'Gerando criativos de anúncios para lead magnet...')
  const prompt = `Crie 5 criativos de anúncios para promover o material gratuito "${ebook.title}" como isca digital (lead magnet).
Retorne JSON (array):
[
  {
    "id": "ad-1",
    "platform": "meta-feed | meta-stories | google-display | linkedin",
    "format": "imagem | video | carrossel",
    "headline": "headline (max 40 chars) — gancho educativo",
    "primary_text": "texto principal (max 125 chars) — prometendo aprendizado clínico",
    "description": "descrição (max 30 chars para Google)",
    "cta": "Baixar grátis | Quero o material",
    "visual_description": "descrição detalhada do visual: material didático, clean, profissional",
    "targeting_notes": "Interesse: Fonoaudiologia, Fonoaudiologia Clínica",
    "landing_utm": "utm_content para tracking"
  }
]
Regras: Foco em educação clínica, não em venda. Material gratuito como lead magnet.`
  const data = await callAIBatch(prompt, `Material: "${ebook.title}". Crie 5 anúncios para lead magnet educativo.`, { maxTokens: 4096 })
  return Array.isArray(data) ? data : []
}

// ─── Step 9: Generate Landing Page (lead magnet) ────────────
async function generateLandingPage(ebook) {
  log('🌐', 'Gerando landing page para material gratuito...')
  const prompt = `Crie o conteúdo de uma landing page para capturar leads oferecendo o material gratuito "${ebook.title}".
Retorne JSON:
{
  "id": "lp-slug",
  "title": "Headline (máx 60 chars) focada no aprendizado clínico",
  "subtitle": "Subheadline (máx 120 chars) prometendo conteúdo prático",
  "hero_cta": "QUERO BAIXAR GRÁTIS",
  "benefits": ["benefício clínico 1", "benefício clínico 2", "benefício clínico 3"],
  "social_proof": "\"Material excelente para o dia a dia\" — Dra. ×××",
  "form_fields": ["nome", "email", "whatsapp"],
  "sections": [
    { "type": "hero|benefits|content|testimonial|faq|cta", "content": "HTML do conteúdo educativo da seção" }
  ],
  "footer_cta": "Baixe grátis agora",
  "seo": { "title": "SEO title", "description": "Meta description educativa" }
}
Regras: Landing page para download de material didático. Tom educacional. CTA principal: baixar grátis.`
  const data = await callAIBatch(prompt,
    `Material: "${ebook.title}". Seções: ${ebook.sections?.map(s => s.title).join(', ') || 'conteúdo geral'}. Crie a landing page para lead magnet.`,
    { maxTokens: 4096 }
  )
  return data
}

// ─── Step 10: Generate Email Funnel (educativo) ─────────────
async function generateEmailFunnel(ebook) {
  log('📧', 'Gerando sequência de emails educativos...')
  const prompt = `Crie uma sequência de 5 emails para leads que baixaram o material gratuito "${ebook.title}".
Retorne JSON:
{
  "id": "funnel-slug",
  "name": "Nome da sequência educativa",
  "trigger": "Download do material",
  "emails": [
    {
      "day": 1,
      "subject": "Assunto — entrega do material + dica extra",
      "preview": "Preview (max 120 chars)",
      "body": "Corpo do email em HTML amigável (pode conter <p>, <br>, <strong>, <a>)",
      "cta": "Texto do CTA",
      "cta_link": "URL de destino"
    }
  ]
}
Regras:
- Email 1: Entrega do material + dica clínica extra
- Email 2: Aprofundamento do tema com mais conteúdo educativo
- Email 3: Como aplicar na prática clínica + template/checklist
- Email 4: Depoimento de fono que usa protocolos nativos (Evolua)
- Email 5: Convite para testar Evolua grátis (CTA suave)
- Tom: educacional, acolhedor, NÃO agressivo comercialmente`
  let data
  try {
    data = await callAIBatch(prompt,
      `Material: "${ebook.title}". Crie a sequência de 5 emails educativos. Cada email com no máximo 3 parágrafos. Tom educacional, não comercial.`,
      { maxTokens: 4096 }
    )
  } catch {
    log('📧', '⚠️ Primeira tentativa falhou, tentando novamente...')
    const simplePrompt = `Gere uma sequência de 5 emails educativos sobre "${ebook.title}". Retorne JSON com 5 emails, cada um com: day, subject, preview, body (resumido), cta, cta_link. Tom educacional.`
    const raw = await callAI(
      [{ role: 'user', content: `Crie sequência de emails educativos para material: "${ebook.title}". Seções: ${ebook.sections?.map(s => s.title).join(', ')}` }],
      simplePrompt,
      { maxTokens: 4096 }
    )
    data = extractJson(raw)
  }
  return data
}

// ─── Save assets ────────────────────────────────────────────
function saveOutput(ebook, infographics, carousels, socialPosts, stories, reels, ads, landingPage, emailFunnel) {
  log('💾', 'Salvando todos os ativos...')
  const base = OUTPUT_DIR
  if (!existsSync(base)) mkdirSync(base, { recursive: true })
  writeFileSync(resolve(base, 'manifest.json'), JSON.stringify({
    generated_at: new Date().toISOString(),
    engine_version: '1.0',
    multiplication_stats: {
      ebook: 1,
      infographics: infographics.length,
      carousels: carousels.length,
      social_posts: socialPosts.length,
      stories: stories.length,
      reels: reels.length,
      ad_creatives: ads.length,
      landing_page: landingPage ? 1 : 0,
      email_funnel: emailFunnel ? 1 : 0,
      total: 1 + infographics.length + carousels.length + socialPosts.length + stories.length + reels.length + ads.length + (landingPage ? 1 : 0) + (emailFunnel ? 1 : 0),
    },
  }, null, 2))

  // Save individual assets
  mkdirSync(resolve(base, 'html'), { recursive: true })
  mkdirSync(resolve(base, 'texts'), { recursive: true })
  mkdirSync(resolve(base, 'ads'), { recursive: true })
  mkdirSync(resolve(base, 'emails'), { recursive: true })

  // Ebook
  writeFileSync(resolve(base, 'ebook.json'), JSON.stringify(ebook, null, 2))
  writeFileSync(resolve(base, 'html/ebook.html'),
    buildEbookHtml(ebook)
  )

  // Save to lead magnets directory
  const magnetsDir = resolve(ROOT, CONFIG.output.ebooksDir)
  if (existsSync(magnetsDir)) {
    writeFileSync(resolve(magnetsDir, `${ebook.id || 'ebook'}.html`), buildEbookHtml(ebook))
    log('💾', `  Ebook salvo em lead-magnets/`)
  }

  // Infographics
  for (const inf of infographics) {
    writeFileSync(resolve(base, 'html/infografico.html'), buildInfographicHtml(infographics))
  }
  if (existsSync(magnetsDir)) {
    // Save individual infographic files
    infographics.forEach(inf => {
      writeFileSync(resolve(magnetsDir, `${inf.id}.html`), buildSingleInfographicHtml(inf))
    })
  }

  // Carousels
  writeFileSync(resolve(base, 'carousels.json'), JSON.stringify(carousels, null, 2))
  writeFileSync(resolve(base, 'html/carrosséis.html'),
    carousels.map(c => buildCarouselHtml(c)).join('\n<hr style="margin:40px 0;border:0;border-top:2px dashed #C4F135">\n')
  )

  // Social posts
  writeFileSync(resolve(base, 'social-posts.json'), JSON.stringify(socialPosts, null, 2))
  for (const channel of ['linkedin', 'instagram', 'threads', 'x', 'facebook']) {
    const channelPosts = socialPosts.filter(p => p.channel === channel)
    if (channelPosts.length > 0) {
      writeFileSync(resolve(base, `texts/posts-${channel}.txt`),
        channelPosts.map(p => `---\n${p.content}\n\n${(p.hashtags || []).join(' ')}`).join('\n\n')
      )
    }
  }

  // Stories
  writeFileSync(resolve(base, 'stories.json'), JSON.stringify(stories, null, 2))
  writeFileSync(resolve(base, 'texts/stories.txt'),
    stories.map(s => `Story ${s.id}: ${s.hook}\n${s.content}\nCTA: ${s.cta}`).join('\n\n---\n\n')
  )

  // Reels
  writeFileSync(resolve(base, 'reels.json'), JSON.stringify(reels, null, 2))
  writeFileSync(resolve(base, 'texts/reels-scripts.txt'),
    reels.map(r => `=== REEL ${r.id} ===\nHook: ${r.hook}\n\nRoteiro:\n${r.script}\n\nDireção visual: ${r.visual_direction || '—'}\nMúsica: ${r.music_vibe || '—'}\nCTA: ${r.cta_overlay || '—'}`).join('\n\n')
  )

  // Ad creatives
  writeFileSync(resolve(base, 'ad-creatives.json'), JSON.stringify(ads, null, 2))
  for (const platform of ['meta-feed', 'meta-stories', 'google-display', 'linkedin']) {
    const platformAds = ads.filter(a => a.platform === platform)
    if (platformAds.length > 0) {
      writeFileSync(resolve(base, `ads/ads-${platform}.txt`),
        platformAds.map(a => `---\nHeadline: ${a.headline}\nTexto: ${a.primary_text}\nDescrição: ${a.description || '—'}\nCTA: ${a.cta}\nVisual: ${a.visual_description}\nUTM: ${a.landing_utm || '—'}`).join('\n\n')
      )
    }
  }

  // Landing page
  if (landingPage) {
    writeFileSync(resolve(base, 'landing-page.json'), JSON.stringify(landingPage, null, 2))
    writeFileSync(resolve(base, 'html/landing-page.html'), buildLandingHtml(landingPage))
  }

  // Email funnel
  if (emailFunnel) {
    writeFileSync(resolve(base, 'email-funnel.json'), JSON.stringify(emailFunnel, null, 2))
    writeFileSync(resolve(base, 'emails/funnel.txt'),
      emailFunnel.emails?.map(e => `=== DIA ${e.day}: ${e.subject} ===\nPreview: ${e.preview}\n\n${e.body}\n\nCTA: ${e.cta} → ${e.cta_link}`).join('\n\n')
    )
  }

  log('💾', `✅ Todos os ativos salvos em ${base}`)
}

// ─── HTML Builders ─────────────────────────────────────────
function buildEbookHtml(ebook) {
  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${ebook.title} — Evolua</title>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,sans-serif;background:#F8F8FF;padding:40px 20px}
  .book{max-width:720px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden}
  .cover{background:linear-gradient(135deg,#1A1A2E,#2D2D5E);color:#C4F135;padding:60px 40px;text-align:center}
  .cover h1{font-size:28px;font-weight:700;margin-bottom:8px}
  .cover p{color:#8B5CF6;font-size:14px}
  .content{padding:40px}
  .content h2{font-size:20px;color:#1A1A2E;margin:32px 0 8px;padding-top:24px;border-top:1px solid #eee}
  .content h2:first-child{margin-top:0;padding-top:0;border-top:none}
  .content h3{font-size:16px;color:#2D2D5E;margin:20px 0 8px}
  .content p{font-size:15px;line-height:1.7;color:#333;margin-bottom:12px}
  .content ul{margin:8px 0 16px 20px}
  .content li{margin-bottom:6px;font-size:15px;line-height:1.5;color:#333}
  .content blockquote{border-left:3px solid #C4F135;padding:12px 16px;margin:16px 0;background:#F8F8FF;font-style:italic;color:#555}
  .cta{background:#C4F135;color:#1A1A2E;text-align:center;padding:32px;margin:32px -40px -40px}
  .cta h3{font-size:18px;margin-bottom:8px}
  .cta p{font-size:14px;margin-bottom:16px;color:#1A1A2E}
  .cta-btn{display:inline-block;background:#1A1A2E;color:#C4F135;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px}
</style></head><body>
<div class="book">
  <div class="cover">
    <h1>${ebook.title}</h1>
    <p>${ebook.subtitle || ''}</p>
  </div>
  <div class="content">
    ${(ebook.sections || []).map(s =>
      `<h2>${s.title}</h2>${s.content}`
    ).join('\n')}
    <div class="cta">
      <h3>Prontos para usar no seu dia a dia?</h3>
      <p>O Evolua já tem todos esses protocolos nativos — sem recriar do zero. Teste grátis.</p>
      <a class="cta-btn" href="https://app.useevolua.com.br/cadastro">TESTE GRÁTIS →</a>
    </div>
  </div>
</div>
</body></html>`
}

function buildSingleInfographicHtml(inf) {
  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${inf.title} — Evolua</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,sans-serif;background:#F8F8FF;display:flex;justify-content:center;padding:20px}
  .infografico{max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,.05)}
  .header{background:linear-gradient(135deg,${(inf.color_palette||['#1A1A2E','#2D2D5E']).slice(0,2).join(',')});color:#fff;padding:32px 24px;text-align:center}
  .header h1{font-size:22px;margin-bottom:4px}
  .header p{font-size:13px;opacity:.8}
  .body{padding:24px}
  .element{border-left:3px solid ${(inf.color_palette||['#C4F135'])[0]};padding:12px 16px;margin-bottom:12px;background:#F8F8FF;border-radius:0 6px 6px 0}
  .element .type{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#8B5CF6;font-weight:600;margin-bottom:4px}
  .element .text{font-size:14px;color:#333;line-height:1.5}
  .cta{background:#C4F135;padding:20px;text-align:center;font-weight:600;color:#1A1A2E;font-size:13px}
</style></head><body>
<div class="infografico">
  <div class="header"><h1>${inf.title}</h1><p>${inf.subtitle || ''}</p></div>
  <div class="body">
    ${(inf.elements || []).map(e =>
      `<div class="element"><div class="type">${e.type}</div><div class="text">${e.content}</div></div>`
    ).join('')}
  </div>
  <div class="cta">${inf.call_to_action || 'Evolua — CRM para Fonoaudiólogas'}</div>
</div>
</body></html>`
}

function buildInfographicHtml(infographics) {
  return infographics.map(inf => buildSingleInfographicHtml(inf)).join('<hr>')
}

function buildCarouselHtml(carousel) {
  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${carousel.title} — Carrossel Evolua</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,sans-serif;background:#F8F8FF;padding:20px;display:flex;flex-direction:column;align-items:center}
  .carrossel{max-width:400px;width:100%}
  .slide{background:#fff;border-radius:12px;margin-bottom:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06)}
  .slide-header{background:#1A1A2E;color:#C4F135;padding:12px 16px;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase}
  .slide-body{padding:20px 16px;min-height:160px}
  .slide-body h3{font-size:16px;color:#1A1A2E;margin-bottom:8px}
  .slide-body p{font-size:14px;color:#333;line-height:1.6}
  .slide-footer{background:#C4F135;padding:12px 16px;text-align:center;font-weight:600;font-size:12px;color:#1A1A2E}
  .meta{text-align:center;margin-bottom:20px;color:#8B5CF6;font-size:12px}
</style></head><body>
<div class="carrossel">
  <div class="meta">
    ${carousel.title}<br>
    ${carousel.platform || 'Instagram/LinkedIn'} · ${(carousel.slides||[]).length} slides
  </div>
  ${(carousel.slides||[]).map(s =>
    `<div class="slide">
      <div class="slide-header">Slide ${s.slide} / ${(carousel.slides||[]).length}</div>
      <div class="slide-body"><h3>${s.heading}</h3><p>${s.content}</p></div>
      ${s.slide === (carousel.slides||[]).length ? '<div class="slide-footer">' + (carousel.call_to_action || 'Evolua — Teste grátis') + '</div>' : ''}
    </div>`
  ).join('')}
  <p style="text-align:center;margin-top:12px;color:#888;font-size:11px">${(carousel.hashtags||[]).join(' ')}</p>
</div>
</body></html>`
}

function buildLandingHtml(lp) {
  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${lp.seo?.title || lp.title} — Evolua</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,sans-serif;background:#F8F8FF}
  .hero{background:linear-gradient(135deg,#1A1A2E,#2D2D5E);color:#fff;padding:60px 20px;text-align:center}
  .hero h1{font-size:32px;color:#C4F135;margin-bottom:12px;letter-spacing:-.5px}
  .hero p{font-size:16px;color:#8B5CF6;margin-bottom:24px;max-width:500px;margin-left:auto;margin-right:auto}
  .hero-btn{display:inline-block;background:#C4F135;color:#1A1A2E;padding:14px 40px;border-radius:6px;text-decoration:none;font-weight:700;font-size:15px}
  .section{padding:40px 20px;max-width:640px;margin:0 auto}
  .benefits{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:24px 0}
  .benefit{background:#fff;padding:16px;border-radius:8px;border-left:3px solid #C4F135;font-size:13px;color:#333;line-height:1.5}
  .testimonial{background:#fff;border-radius:8px;padding:20px;margin:24px 0;font-style:italic;color:#555;font-size:14px;border:1px solid #eee}
  .footer{background:#1A1A2E;color:#C4F135;padding:40px 20px;text-align:center}
  .footer h3{font-size:18px;margin-bottom:12px}
  .footer-btn{display:inline-block;background:#C4F135;color:#1A1A2E;padding:14px 40px;border-radius:6px;text-decoration:none;font-weight:700;font-size:15px;margin-top:12px}
</style></head><body>
<section class="hero">
  <div style="font-size:10px;letter-spacing:.3em;color:#8B5CF6;margin-bottom:16px">EVOLUA</div>
  <h1>${lp.title}</h1>
  <p>${lp.subtitle || ''}</p>
  <a class="hero-btn" href="https://app.useevolua.com.br/cadastro?utm_source=content&utm_medium=landing&utm_campaign=${lp.id}">${lp.hero_cta || 'QUERO BAIXAR GRÁTIS'}</a>
</section>
<div class="section">
  <h2 style="font-size:18px;color:#1A1A2E;margin-bottom:16px">O que você vai aprender</h2>
  <div class="benefits">
    ${(lp.benefits||[]).map(b => `<div class="benefit">${b}</div>`).join('')}
  </div>
  ${lp.social_proof ? `<div class="testimonial">${lp.social_proof}</div>` : ''}
  ${(lp.sections||[]).filter(s => s.type !== 'hero').map(s => `<div style="margin-top:24px">${s.content}</div>`).join('')}
</div>
<div class="footer">
  <h3>${lp.footer_cta || 'Comece agora, é grátis!'}</h3>
  <a class="footer-btn" href="https://app.useevolua.com.br/cadastro">TESTE GRÁTIS →</a>
</div>
</body></html>`
}

// ─── Email sending ──────────────────────────────────────────
async function sendEmailPackage(ebook, stats) {
  log('📧', 'Enviando pacote semanal por email...')
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey && !DRY_RUN) { log('📧', '⚠️ RESEND_API_KEY not set'); return }
  if (DRY_RUN) { log('📧', '🧪 Dry-run — skip email send'); return }

  const localized = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date())

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap');
</style></head>
<body style="margin:0;padding:0;background:#F8F8FF;font-family:'DM Sans',system-ui,sans-serif">
<div style="max-width:580px;margin:24px auto;background:#fff;border-radius:8px;overflow:hidden">
  <div style="background:#0A0A14;padding:48px 40px 40px;text-align:center">
    <div style="font-family:'Space Grotesk',sans-serif;font-size:10px;font-weight:700;letter-spacing:.3em;color:#8B5CF6;margin-bottom:12px">EVOLUA</div>
    <h1 style="font-family:'Space Grotesk',sans-serif;color:#C4F135;margin:0 0 4px;font-size:20px;font-weight:700">Pacote Semanal de Conteúdo</h1>
    <p style="color:#8B5CF6;margin:0;font-size:12px">${localized}</p>
  </div>
  <div style="padding:32px">
    <div style="background:#F8F8FF;border-radius:8px;padding:20px;margin-bottom:24px">
      <p style="margin:0;font-size:12px;color:#8B5CF6;font-weight:600">📖 ${ebook.title}</p>
      <p style="margin:4px 0 0;font-size:13px;color:#666">${ebook.subtitle || ''}</p>
    </div>
    <table style="width:100%;border-collapse:collapse">
      ${[
        ['📖', 'Ebook', stats.ebook],
        ['🎨', 'Infográficos', stats.infographics],
        ['🔄', 'Carrosséis', stats.carousels],
        ['📱', 'Posts Sociais', stats.social_posts],
        ['📸', 'Stories', stats.stories],
        ['🎬', 'Reels', stats.reels],
        ['📢', 'Ad Creatives', stats.ad_creatives],
        ['🌐', 'Landing Page', stats.landing_page],
        ['📧', 'Email Funnel', stats.email_funnel],
      ].map(([emoji, label, count]) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #f0f0f5"><span style="font-size:14px">${emoji}</span> <span style="font-size:13px;color:#333">${label}</span></td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f5;text-align:right;font-size:13px;font-weight:600;color:#1A1A2E">${count}</td></tr>`
      ).join('')}
      <tr><td style="padding:12px;font-size:13px;font-weight:700;color:#1A1A2E">📦 TOTAL DE ATIVOS</td><td style="padding:12px;text-align:right;font-size:16px;font-weight:700;color:#C4F135">${stats.total}</td></tr>
    </table>
    <div style="background:#F8F8FF;border-radius:6px;padding:16px;margin-top:24px;text-align:center">
      <p style="margin:0;font-size:12px;color:#8B5CF6">Gerado pelo Content Engine da Evolua</p>
      <p style="margin:2px 0 0;font-size:11px;color:#888">scripts/content-engine/output/</p>
    </div>
  </div>
</div>
</body></html>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@useevolua.com.br',
      to: CONFIG.email.recipient,
      subject: `${CONFIG.email.subject} — ${ebook.title}`,
      html,
      text: `Pacote Semanal Evolua — ${localized}\n\n${ebook.title}\n${ebook.subtitle || ''}\n\nAtivos gerados: ${stats.total}\n- Ebook: ${stats.ebook}\n- Infográficos: ${stats.infographics}\n- Carrosséis: ${stats.carousels}\n- Posts: ${stats.social_posts}\n- Stories: ${stats.stories}\n- Reels: ${stats.reels}\n- Ads: ${stats.ad_creatives}\n- Landing Page: ${stats.landing_page}\n- Email Funnel: ${stats.email_funnel}`,
    }),
  })
  if (res.ok) log('📧', `✅ Email enviado para ${CONFIG.email.recipient}`)
  else log('📧', `⚠️ Falha no email: ${res.status}`)
}

// ─── Update materials catalog ──────────────────────────────
function updateMaterialsCatalog(ebook, infographics) {
  const catalogPath = resolve(ROOT, 'docs/content-assets/05-lead-magnets/materials-catalog.json')
  if (!existsSync(catalogPath)) return
  try {
    const catalog = JSON.parse(readFileSync(catalogPath, 'utf-8'))
    const existingIdx = catalog.findIndex(m => m.id === ebook.id)
    const entry = { id: ebook.id, type: 'ebook', title: ebook.title, file: `${ebook.id}.html`, generated_at: new Date().toISOString().slice(0, 10) }
    if (existingIdx >= 0) catalog[existingIdx] = entry
    else catalog.push(entry)
    for (const inf of infographics) {
      const infIdx = catalog.findIndex(m => m.id === inf.id)
      const infEntry = { id: inf.id, type: 'infographic', title: inf.title, file: `${inf.id}.html`, generated_at: new Date().toISOString().slice(0, 10) }
      if (infIdx >= 0) catalog[infIdx] = infEntry
      else catalog.push(infEntry)
    }
    writeFileSync(catalogPath, JSON.stringify(catalog, null, 2))
    log('📋', 'Materials catalog updated')
  } catch (e) {
    log('⚠️', `Could not update catalog: ${e.message}`)
  }
}

// ─── Main ────────────────────────────────────────────────────
async function main() {
  console.log(`
╔══════════════════════════════════════════╗
║   Evolua Content Engine v1.0             ║
║   Multiplicação Semanal de Conteúdo      ║
║   ${new Date().toLocaleDateString('pt-BR')}                         ║
║   Modo: ${DRY_RUN ? '🧪 DRY RUN' : '🚀 PRODUÇÃO'}                        ║
╚══════════════════════════════════════════╝
  `)

  // 1. Get input
  let posts = getWeekPosts()
  log('📥', `${posts.length} posts da semana encontrados`)
  if (posts.length === 0 && !CUSTOM_TOPIC) {
    log('⚠️', 'Nenhum post encontrado e nenhum tópico customizado. Use --topic.')
    console.log('\nDica: Se é a primeira execução, use --topic "seu tema"')
    process.exit(0)
  }

  // Ensure output dirs
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true })
  for (const d of ['html', 'texts', 'ads', 'emails']) {
    try { mkdirSync(resolve(OUTPUT_DIR, d), { recursive: true }) } catch {}
  }

  // 2. Research & compile
  const research = await researchAndCompile(posts)
  log('🔬', `Tema: "${research.topic}"`)

  // 3. Generate Ebook
  const ebook = await generateEbook(research)
  log('📖', `Ebook: "${ebook.title}"`)

  // 4. Generate Infographics
  const infographics = await generateInfographics(ebook, CONFIG.multiplication.infographic.perBatch)

  // 5. Generate Carousels
  const carousels = await generateCarousels(ebook, CONFIG.multiplication.carousel.perEbook)

  // 6. Generate Social Posts
  const socialPosts = await generateSocialPosts(ebook, CONFIG.multiplication.socialPosts.perEbook)

  // 7. Generate Stories
  const stories = await generateStories(ebook)

  // 8. Generate Reels
  const reels = await generateReels(ebook)

  // 9. Generate Ad Creatives
  const ads = await generateAdCreatives(ebook)

  // 10. Generate Landing Page
  const landingPage = await generateLandingPage(ebook)

  // 11. Generate Email Funnel
  const emailFunnel = await generateEmailFunnel(ebook)

  // 12. Save everything (also saves partial results along the way)
  saveOutput(ebook, infographics, carousels, socialPosts, stories, reels, ads, landingPage, emailFunnel)

  // 13. Update catalog
  updateMaterialsCatalog(ebook, infographics)

  // 14. Send email
  const stats = {
    ebook: 1,
    infographics: infographics.length,
    carousels: carousels.length,
    social_posts: socialPosts.length,
    stories: stories.length,
    reels: reels.length,
    ad_creatives: ads.length,
    landing_page: landingPage ? 1 : 0,
    email_funnel: emailFunnel ? 1 : 0,
    total: 1 + infographics.length + carousels.length + socialPosts.length + stories.length + reels.length + ads.length + (landingPage ? 1 : 0) + (emailFunnel ? 1 : 0),
  }
  log('📊', `Total de ativos gerados: ${stats.total}`)

  if (!DRY_RUN && !SKIP_EMAIL) {
    await sendEmailPackage(ebook, stats)
  }

  console.log(`
╔══════════════════════════════════════════╗
║   Content Engine Complete!               ║
║   Tema: ${research.topic.slice(0, 40)}...              ║
║   Ativos: ${stats.total} gerados                       ║
║   Output: ${OUTPUT_DIR}         ║
╚══════════════════════════════════════════╝
  `)
}

main().catch(e => {
  console.error(`\n❌ Content Engine failed: ${e.message}`)
  process.exit(1)
})
