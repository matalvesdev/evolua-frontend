#!/usr/bin/env node
/**
 * Daily Content Pipeline — Evolua
 * 
 * 1. Pesquisa tópico do dia (ou custom)
 * 2. Cria post do blog + publica no Supabase
 * 3. Gera Instagram Carrossel (HTML → PNG via Playwright)
 * 4. Gera LinkedIn posts (→ .txt)
 * 5. Gera legendas Instagram (→ .txt)
 * 6. Empacota PNGs + .txts → .zip
 * 7. Envia tudo por email via Resend
 *
 * Env vars:
 *   OPENROUTER_API_KEY
 *   RESEND_API_KEY
 *   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
 *
 * Uso:
 *   node scripts/daily-content-pipeline.mjs
 *   node scripts/daily-content-pipeline.mjs --topic "meu tema"
 *   node scripts/daily-content-pipeline.mjs --topic "meu tema" --dry-run
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')
const OUTPUT_DIR = resolve(PROJECT_ROOT, 'scripts', 'content-pipeline', 'output')
const ASSETS_DIR = resolve(PROJECT_ROOT, 'docs', 'content-assets')

const DAYS = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']

const args = process.argv.slice(2)
const TOPIC = (() => {
  const idx = args.indexOf('--topic')
  if (idx === -1) return null
  return args.slice(idx + 1).filter(a => !a.startsWith('--')).join(' ')
})()
const DRY_RUN = args.includes('--dry-run')

// Ensure output dir
if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true })

function log(step, msg) {
  const ts = new Date().toISOString().slice(11, 19)
  console.log(`[${ts}] [${step}] ${msg}`)
}

function getDayTopic() {
  const now = new Date()
  const day = DAYS[now.getDay()]
  const schedule = {
    segunda: { pilar: 'Marketing Digital', format: 'guia-pratico' },
    terca: { pilar: 'Gestão de Clínica', format: 'case-estudo' },
    quarta: { pilar: 'Tecnologia', format: 'tutorial' },
    quinta: { pilar: 'Clínica', format: 'artigo-tecnico' },
    sexta: { pilar: 'Carreira', format: 'reflexao' },
  }
  return schedule[day] || schedule.segunda
}

// ─── OpenRouter AI Call ────────────────────────────────────────────
async function callAI(prompt, schema) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set')

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://useevolua.com.br',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: schema ? { type: 'json_object' } : undefined,
    }),
  })

  if (!res.ok) throw new Error(`AI API error: ${res.status} ${await res.text()}`)
  const data = await res.json()
  const text = data.choices[0].message.content

  if (schema) {
    const cleaned = text.replace(/```json\n?|```/g, '').trim()
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    return JSON.parse(cleaned.slice(start, end + 1))
  }
  return text
}

// ─── Generate Instagram Carrossel HTML ──────────────────────────
async function generateCarrosselHTML(topic, slides) {
  log('CARROSSEL', 'Gerando HTML do carrossel...')

  const systemPrompt = `Você é um designer sênior especializado no Design System Evolua v5.0.

## Design System Evolua v5.0 (OBRIGATÓRIO)
- **Canvas**: #F8F8FF | **Surface**: #FFFFFF | **Lavender**: #EAE8FF
- **Primary**: #6C63FF | **Primary Dark**: #5650D4 | **Primary Light**: #8B85FF
- **Ink**: #1A1A2E | **Ink Soft**: #4A4A6A | **Muted**: #8888AA
- **Deep**: #2D2B55 | **Neon**: #C4F135
- **Outline Variant**: #E0DFEF
- **Headlines**: Space Grotesk, 700-600 weight, negative tracking
- **Body**: DM Sans, 400-500 weight
- **Labels**: DM Sans 700, 10px, uppercase, 0.3em tracking
- **Border-radius**: 2px em todo lugar
- ❌ NUNCA #8B5CF6, #F5F3FF, #0A0A14, #120D1E (v4 antiga)
- ❌ NUNCA Inter, Nunito
- ❌ Sem border-left accent
- ❌ Sem emoji como ícone (use Material Symbols Outlined)
- ❌ Sem gradientes decorativos

## Tom de Voz
- "Especialista que fala COM a fonoaudióloga"
- Frases curtas, presente do indicativo
- Max 3 emojis por post
- NUNCA: solução, inovar, ecossistema, maximizar, potencializar

Gere UM HTML COMPLETO com 5 slides de carrossel para Instagram (1080x1080px cada, lado a lado em flex row).`

  const prompt = `${systemPrompt}

TEMA: "${topic}"

## Estrutura dos 5 slides:
1. CAPA: Título chamativo, "Deslize →"
2. DICA 1: Conteúdo educacional com dado relevante
3. DICA 2: Continuação com mais informações
4. DICA 3+4: Duas dicas combinadas com bullets
5. CTA FINAL: Fundo escuro (Deep #2D2B55), "Teste grátis", useevolua.com.br, botão Neon #C4F135

Regras:
- Logo "evolua" no canto inferior direito de cada slide
- Fundo claro (#F8F8FF ou #FFFFFF) = logo Primary #6C63FF
- Fundo escuro (#2D2B55) = logo Neon #C4F135
- Adicione import do Google Fonts (Space Grotesk + DM Sans + Material Symbols Outlined)
- HTML auto-contido, sem js externo
- 5 divs .slide de 1080x1080px em flex row`
  
  return await callAI(prompt, false)
}

// ─── Screenshot Carrossel Slides ─────────────────────────────────
async function screenshotCarrossel(html, outputDir, topic) {
  log('SCREENSHOT', 'Renderizando slides para PNG...')

  const htmlPath = resolve(outputDir, `carrossel-${topic}.html`)
  writeFileSync(htmlPath, html, 'utf-8')

  const slidesDir = resolve(outputDir, `slides-${topic}`)
  if (!existsSync(slidesDir)) mkdirSync(slidesDir, { recursive: true })

  // Create a Playwright script
  const pwScript = `
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 1200 } });
  await page.goto('file:///${htmlPath.replace(/\\/g, '/')}', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const slides = await page.$$('.slide');
  for (let i = 0; i < slides.length; i++) {
    await slides[i].screenshot({ path: '${slidesDir.replace(/\\/g, '/')}/slide-${topic}-' + (i + 1) + '.png', type: 'png' });
    console.log('Slide ' + (i + 1) + ' capturado');
  }

  // Also take individual screenshots via page
  for (let i = 0; i < slides.length; i++) {
    const box = await slides[i].boundingBox();
    if (box) {
      await page.setViewportSize({ width: Math.ceil(box.width), height: Math.ceil(box.height) });
      await page.goto('file:///${htmlPath.replace(/\\/g, '/')}', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      const slideEl = await page.$$('.slide');
      await slideEl[i].screenshot({ path: '${slidesDir.replace(/\\/g, '/')}/slide-${topic}-' + (i + 1) + '.png', type: 'png' });
      console.log('Slide ' + (i + 1) + ' recapturado no tamanho correto');
    }
  }

  await browser.close();
})();
`

  const pwPath = resolve(outputDir, `screenshot-${topic}.cjs`)
  writeFileSync(pwPath, pwScript, 'utf-8')

  try {
    execSync(`npx playwright node "${pwPath}"`, { stdio: 'pipe', cwd: PROJECT_ROOT, timeout: 60000 })
    log('SCREENSHOT', 'Slides capturados com sucesso!')
  } catch (err) {
    // Fallback: try running screenshot via inline script
    log('SCREENSHOT', 'Erro com script separado, tentando inline...')
    try {
      const inlineScript = `
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1100, height: 1100 });
  await page.goto('file:///${htmlPath.replace(/\\/g, '/')}', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  for (let i = 0; i < 5; i++) {
    await page.screenshot({ path: '${slidesDir.replace(/\\/g, '/')}/slide-${topic}-' + (i+1) + '.png', clip: { x: 1080*i, y: 0, width: 1080, height: 1080 } });
    console.log('Slide ' + (i+1) + ' ok');
  }
  await browser.close();
  console.log('DONE');
})().catch(e => { console.error(e); process.exit(1); });
`
      const inlinePath = resolve(outputDir, `screenshot-inline-${topic}.cjs`)
      writeFileSync(inlinePath, inlineScript, 'utf-8')
      execSync(`node "${inlinePath}"`, { stdio: 'pipe', cwd: PROJECT_ROOT, timeout: 60000 })
    } catch (e2) {
      log('SCREENSHOT', 'ERRO: ' + e2.message)
      // Create a note file
      writeFileSync(resolve(slidesDir, 'INSTRUCOES.txt'),
`Para gerar os PNGs deste carrossel:

1. Abra o arquivo carrossel-${topic}.html no navegador
2. Dê Print Screen de cada slide (1080x1080px)
3. Salve como slide-${topic}-1.png, slide-${topic}-2.png, etc.

Ou execute:
npx playwright install chromium
node scripts/content-pipeline/output/screenshot-${topic}.cjs
`)
    }
  }

  // Check generated files
  const fs = await import('node:fs')
  const files = fs.readdirSync(slidesDir).filter(f => f.endsWith('.png'))
  log('SCREENSHOT', `${files.length} PNGs gerados em ${slidesDir}`)

  return slidesDir
}

// ─── Extract .txt files ──────────────────────────────────────────
async function extractTexts(carrosselHTML, topic) {
  log('TEXTS', 'Extraindo .txt dos conteúdos...')

  const textsDir = resolve(OUTPUT_DIR, `texts-${topic}`)
  if (!existsSync(textsDir)) mkdirSync(textsDir, { recursive: true })

  // Extract Instagram caption from AI
  const captionPrompt = `Com base no Design System Evolua v5.0 e no tom de voz "especialista que fala COM a fonoaudióloga", escreva a legenda completa para este carrossel do Instagram sobre "${topic}".

A legenda deve:
- Primeira linha parar o scroll
- Máximo 3 emojis
- Frases curtas
- Incluir CTA no final
- 5-8 hashtags relevantes (#Fonoaudiologia #GestaoClinica etc)
- NUNCA usar: solução, inovar, ecossistema

Gere APENAS a legenda, pronta para copiar e colar.`

  const caption = await callAI(captionPrompt, false)
  writeFileSync(resolve(textsDir, `legenda-instagram-${topic}.txt`), caption.trim(), 'utf-8')
  log('TEXTS', 'Legenda Instagram salva')

  // Generate LinkedIn posts
  const linkedinPrompt = `Com base no Design System Evolua v5.0, gere 3 posts completos para o LinkedIn sobre "${topic}".

Cada post deve ter:
- Título/headline chamativo
- 3-5 parágrafos de texto
- 3-5 hashtags
- Tom: especialista que fala COM a fonoaudióloga
- NUNCA: solução, inovar, ecossistema

Separe cada post com "---"`

  const linkedin = await callAI(linkedinPrompt, false)
  writeFileSync(resolve(textsDir, `linkedin-posts-${topic}.txt`), linkedin.trim(), 'utf-8')
  log('TEXTS', 'Posts LinkedIn salvos')

  // Generate Ads texts
  const adsPrompt = `Com base no Design System Evolua v5.0, gere os textos para campanha de anúncios Meta Ads sobre "${topic}".

Gere:
1. 3 FEED ADS com: Headline, Primary Text, CTA
2. 2 STORY ADS com: Texto curto, CTA

Formato: separado por "---" por anúncio`

  const ads = await callAI(adsPrompt, false)
  writeFileSync(resolve(textsDir, `ads-legendas-${topic}.txt`), ads.trim(), 'utf-8')
  log('TEXTS', 'Textos Ads salvos')

  // Generate Ad config
  const config = `CONFIGURAÇÃO DE CAMPANHA - EVOLUA ${topic.toUpperCase()}
Data de geração: ${new Date().toLocaleDateString('pt-BR')}
---
PLATAFORMA: Meta Ads (Facebook + Instagram)
OBJETIVO: Tráfego / Conversão
BUDGET DIÁRIO: R$ 80-120/dia
PÚBLICO: Fonoaudiólogas, 25-50 anos, Brasil
SEGMENTAÇÃO: Interesse em Fonoaudiologia, Saúde, Clínicas
AGENDA: 7 dias a partir da publicação
HORÁRIO: 08:00 - 22:00
FORMATO: Feed (1080x1080) + Story (1080x1920)
CTA: Testar Grátis / Quero Conhecer / Começar Agora
---
PLATAFORMA: Google Ads
OBJETIVO: Tráfego do Site
BUDGET DIÁRIO: R$ 100-150/dia
PALAVRAS-CHAVE: CRM fonoaudiologia, sistema clínica fono, prontuário digital
REDE: Pesquisa + Display
AGENDA: 7 dias a partir da publicação
---
UTMs: utm_source=meta&utm_medium=cpc&utm_campaign=${topic.replace(/\s+/g, '-').toLowerCase()}
KPIs: CPL ≤ R$8,00 | CTR > 2,5% | Taxa de Conversão > 3%
---
PIXEL: Meta Pixel + Google Ads Conversion Tracking
TESTE A/B: 3 variações de criativo por anúncio`
  writeFileSync(resolve(textsDir, `ads-config-${topic}.txt`), config, 'utf-8')
  log('TEXTS', 'Config Ads salva')

  return textsDir
}

// ─── Package & Send ──────────────────────────────────────────────
async function packageAndSend(slidesDir, textsDir, topic) {
  log('PACK', 'Empacotando...')

  const packDir = resolve(OUTPUT_DIR, `pack-${topic}`)
  if (!existsSync(packDir)) mkdirSync(packDir, { recursive: true })

  // Copy PNGs
  const slides = readdirSyncSafe(slidesDir).filter(f => f.endsWith('.png'))
  for (const f of slides) {
    copyFileSync(resolve(slidesDir, f), resolve(packDir, f))
  }

  // Copy .txts
  const texts = readdirSyncSafe(textsDir).filter(f => f.endsWith('.txt'))
  for (const f of texts) {
    copyFileSync(resolve(textsDir, f), resolve(packDir, f))
  }

  // Create tar.gz
  const packName = `evolua-${topic.replace(/\s+/g, '-').toLowerCase()}`
  execSync(`tar -czf "${OUTPUT_DIR}/${packName}.tar.gz" -C "${OUTPUT_DIR}" "pack-${topic}"`, {
    stdio: 'pipe', cwd: PROJECT_ROOT,
  })

  // Update latest pack
  const latestLink = resolve(OUTPUT_DIR, 'evolua-pack-latest.tar.gz')
  execSync(`cp "${OUTPUT_DIR}/${packName}.tar.gz" "${latestLink}"`, { stdio: 'pipe' })

  log('PACK', `Pacote criado: ${OUTPUT_DIR}/${packName}.tar.gz`)

  // Send via Resend
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    log('EMAIL', '⚠️ RESEND_API_KEY não definida')
    return
  }

  const fileBuffer = readFileSync(resolve(OUTPUT_DIR, `${packName}.tar.gz`))
  const base64Content = fileBuffer.toString('base64')

  const slideList = slides.map(f => `  • ${f}`).join('\n')
  const textList = texts.map(f => `  • ${f}`).join('\n')

  const emailHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=DM+Sans:wght@400;500;700&display=swap');
</style></head>
<body style="margin:0;padding:0;background:#F8F8FF;font-family:'DM Sans',Arial,sans-serif">
<div style="max-width:580px;margin:24px auto;background:#FFFFFF;overflow:hidden">
  <div style="background:#2D2B55;padding:40px;text-align:center">
    <div style="font-family:'Space Grotesk',sans-serif;font-size:32px;font-weight:700;letter-spacing:-0.03em;color:#C4F135;margin-bottom:8px">evolua</div>
    <h1 style="font-family:'Space Grotesk',sans-serif;color:#fff;margin:0;font-size:20px;font-weight:600">Conteúdo Diário</h1>
    <p style="color:#9D97F5;margin:8px 0 0;font-size:13px">${new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>
  <div style="padding:32px">
    <p style="font-size:15px;line-height:1.6;color:#1A1A2E;margin:0 0 24px">O conteúdo de hoje está pronto!</p>
    <div style="background:#F8F8FF;border:1px solid #E0DFEF;padding:16px;margin-bottom:16px">
      <div style="font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:700;color:#6C63FF;letter-spacing:0.3em;text-transform:uppercase;margin-bottom:8px">TEMA</div>
      <div style="font-size:16px;font-weight:600;color:#1A1A2E">${topic}</div>
    </div>
    <div style="background:#F8F8FF;border:1px solid #E0DFEF;padding:16px;margin-bottom:16px">
      <div style="font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:700;color:#6C63FF;letter-spacing:0.3em;text-transform:uppercase;margin-bottom:8px">📸 SLIDES INSTAGRAM</div>
      <pre style="font-size:12px;color:#4A4A6A;margin:0;white-space:pre-wrap">${slideList}</pre>
    </div>
    <div style="background:#F8F8FF;border:1px solid #E0DFEF;padding:16px;margin-bottom:24px">
      <div style="font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:700;color:#6C63FF;letter-spacing:0.3em;text-transform:uppercase;margin-bottom:8px">📝 ARQUIVOS .TXT</div>
      <pre style="font-size:12px;color:#4A4A6A;margin:0;white-space:pre-wrap">${textList}</pre>
    </div>
    <div style="background:#2D2B55;text-align:center;padding:16px">
      <p style="color:#C4F135;font-size:13px;font-weight:700;margin:0">⬇ .tar.gz anexado — extraia e publique!</p>
    </div>
  </div>
  <div style="background:#F8F8FF;padding:16px 32px;text-align:center;border-top:1px solid #E0DFEF">
    <p style="color:#8888AA;font-size:11px;margin:0">EVOLUA — Gestão Inteligente para Fonoaudiólogas</p>
  </div>
</div>
</body>
</html>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: 'Evolua <noreply@useevolua.com.br>',
      to: 'contatouseevolua@gmail.com',
      subject: `📦 Conteúdo Evolua — ${topic} | ${new Date().toLocaleDateString('pt-BR')}`,
      html: emailHtml,
      text: `Conteúdo Evolua - ${topic}\n\nSlides: ${slides.length} PNGs\nTextos: ${texts.length} .txts\n\nArquivo anexado.`,
      attachments: [{ filename: `${packName}.tar.gz`, content: base64Content }],
    }),
  })

  if (res.ok) {
    const data = await res.json()
    log('EMAIL', `✅ Enviado! ID: ${data.id}`)
  } else {
    log('EMAIL', `❌ Erro: ${res.status} ${await res.text()}`)
  }
}

function readdirSyncSafe(dir) {
  try { return readdirSync(dir) } catch { return [] }
}

// ─── Main ─────────────────────────────────────────────────────────
async function main() {
  log('START', '=== Daily Content Pipeline ===')
  
  const dayInfo = getDayTopic()
  const topic = TOPIC || `${dayInfo.pilar}: ${dayInfo.format} para fonoaudiólogas`
  log('TOPIC', topic)

  if (DRY_RUN) {
    log('DRY-RUN', 'Modo dry-run — sem publicar ou enviar')
  }

  // 1. Generate Carrossel HTML
  const html = await generateCarrosselHTML(topic, null)
  const topicSlug = topic.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().slice(0, 30)

  // 2. Screenshot to PNG
  const slidesDir = await screenshotCarrossel(html, OUTPUT_DIR, topicSlug)

  // 3. Extract .txt files
  const textsDir = await extractTexts(html, topicSlug)

  // 4. Package and send
  if (!DRY_RUN) {
    await packageAndSend(slidesDir, textsDir, topicSlug)
  }

  log('DONE', 'Pipeline concluído!')
}

main().catch(err => {
  console.error('[FATAL]', err)
  process.exit(1)
})
