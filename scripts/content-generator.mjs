#!/usr/bin/env node
/**
 * Content Generator & Fixer — Gera/conserta TODOS os assets visuais
 *
 * Fluxo:
 * 1. Fixa ícones em todos HTMLs existentes (remove Material Symbols)
 * 2. Gera PDFs dos ebooks/infográficos
 * 3. Gera HTML das Stories (1080x1920) → PNG
 * 4. Gera HTML do LinkedIn (1200x627) → PNG
 * 5. Gera HTML dos Ads Meta (Feed 1080x1080 + Story 1080x1920) → PNG
 * 6. Gera HTML dos Ads Google Display (1200x628) → PNG
 * 7. Empacota .tar.gz + envia email
 *
 * Uso: node scripts/content-generator.mjs
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync, cpSync, readdirSync, rmSync } from 'node:fs'
import { resolve, dirname, relative, basename } from 'node:path'
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
const OUT = resolve(ROOT, 'scripts', 'content-pipeline', 'output')
const TIMESTAMP = new Date().toISOString().slice(0, 10)
const PACK_NAME = `evolua-${TIMESTAMP}`

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })
const relOut = relative(ROOT, OUT)

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`) }

// ─── Icon Map: Material Symbols name → emoji ────────────────────
const ICON_MAP = {
  badge: '📋', grid_view: '📱', reply: '↩️', lightbulb: '💡',
  check_circle: '✅', cancel: '❌', gavel: '⚖️', warning: '⚠️',
  schedule: '⏰', trending_up: '📈', bar_chart: '📊',
  handshake: '🤝', payments: '💳', auto_awesome: '✨',
  rocket_launch: '🚀', compare_arrows: '🔄', check: '✓',
  menu_book: '📖', campaign: '📢', info: 'ℹ️',
  home_health: '🏥', chat: '💬', attach_money: '💰',
  favorite: '❤️', download: '⬇️', assignment: '📝',
  description: '📄', groups: '👥', psychology: '🧠',
  speed: '⚡', star: '⭐', visibility: '👁️',
  phone: '📞', email: '📧', calendar_month: '📅',
  person: '👤', settings: '⚙️', exit_to_app: '🚪',
  play_circle: '▶️', pause_circle: '⏸️', stop_circle: '⏹️',
  stethoscope: '🩺', child_care: '🧒', smartphone: '📱',
  checklist: '✅', block: '❌',
  check: '✓',
}

// ─── 1. Fix ALL HTML files — remove Material Symbols ────────────
function fixAllIcons() {
  log('🔧 Corrigindo ícones em TODOS os HTMLs (seguro — só body)...')
  const files = [
    'docs/content-assets/05-lead-magnets/ebook-whatsapp-profissional.html',
    'docs/content-assets/05-lead-magnets/ebook-mkt-digital-fono.html',
    'docs/content-assets/05-lead-magnets/infraco-estrategia-precos.html',
    'docs/content-assets/05-lead-magnets/infraco-atendimento-humanizado.html',
    'docs/content-assets/03-instagram-feed/carrossel-5-passos.html',
  ]

  for (const file of files) {
    const fp = resolve(ROOT, file)
    if (!existsSync(fp)) { log(`  ⚠️ Não encontrado: ${file}`); continue }
    let html = readFileSync(fp, 'utf-8')
    const before = html

    // Safely remove Material Symbols Google Fonts link (targeted: only <link> with Material+Symbols in href)
    html = html.replace(/<link\s+(?:[^>]*?\s)?href\s*=\s*"[^"]*Material\+Symbols[^"]*"[^>]*\/?\s*>/gi, '')
    // Also safe: remove any remaining Material Symbols font-family from inline style attributes only
    html = html.replace(/(font-family\s*:\s*)['"][^'"]*Material Symbols[^'"]*['"]\s*;?/gi, '$1"DM Sans", system-ui, sans-serif;')

    // ONLY modify inside <style> and <body> — never touch <link> or <head> attributes
    let style = ''
    let body = ''

    // Extract <style>...</style> content
    const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/)
    if (styleMatch) {
      let s = styleMatch[1]
      // Inside style: replace Material Symbols font references with DM Sans fallback
      s = s.replace(/['"][^'"]*Material Symbols[^'"]*['"]\s*,?/gi, '')
      style = s
    }

    // Extract <body>...</body> content
    const bodyMatch = html.match(/<body[\s\S]*?>([\s\S]*)<\/body>/)
    if (bodyMatch) {
      let b = bodyMatch[1]
      // Replace icon spans with emoji — only inside body
      const replaceMap = {
        'mat-icon': (iconName) => `<span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;font-size:16px;flex-shrink:0">${ICON_MAP[iconName] || '•'}</span>`,
        'material-symbols-outlined': (iconName) => `<span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;font-size:14px;flex-shrink:0;color:#6C63FF">${ICON_MAP[iconName] || '•'}</span>`,
        'mat-icon-big': (iconName) => `<div style="font-size:32px;color:#6C63FF;margin-bottom:8px;text-align:center">${ICON_MAP[iconName] || '•'}</div>`,
        'data-card-icon': (iconName) => `<span style="color:#6C63FF;font-size:24px;vertical-align:middle;margin-right:8px">${ICON_MAP[iconName] || '•'}</span>`,
      }

      for (const [className, replacer] of Object.entries(replaceMap)) {
        const regex = new RegExp(`<span[^>]*class\\s*=\\s*"[^"]*\\b${className}\\b[^"]*"[^>]*>(\\w+)<\\/span>`, 'g')
        b = b.replace(regex, (m, iconName) => replacer(iconName))
      }
      // Also replace <div class="...check...">check</div> and <span class="...cb...">check</span>
      b = b.replace(/<(?:div|span)[^>]*class\s*=\s*"[^"]*\b(?:check|cb)\b[^"]*"[^>]*>\s*check\s*<\/(?:div|span)>/g,
        `<span style="width:22px;height:22px;background:#C4F135;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;color:#1A1A2E;font-size:12px;font-weight:700">✓</span>`)
      body = b
    }

    // Reassemble — only replace style and body content
    if (style) html = html.replace(/(<style>)[\s\S]*?(<\/style>)/, `$1${style}$2`)
    if (body) {
      const bodyStart = html.indexOf('<body')
      const bodyEnd = html.lastIndexOf('</body>')
      const bodyTag = html.slice(bodyStart, html.indexOf('>', bodyStart) + 1)
      html = html.slice(0, bodyStart) + bodyTag + body + '</body>' + html.slice(bodyEnd + 7)
    }

    if (html !== before) {
      writeFileSync(fp, html, 'utf-8')
      log(`  ✓ ${basename(file)}`)
    } else {
      log(`  ~ ${basename(file)} (sem alterações)`)
    }
  }
}

// ─── 2A. Generate Carrossel Instagram (1080×1080) — v5.0 ────────
function generateCarrossel() {
  log('📸 Gerando Carrossel Instagram HTML (v5.0)...')
  const carrosselDir = resolve(OUT, 'carrossel-html')
  if (!existsSync(carrosselDir)) mkdirSync(carrosselDir, { recursive: true })

  const content = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#E0DFEF;display:flex;flex-direction:column;align-items:center;gap:12px;padding:12px}
.slide{width:1080px;height:1080px;position:relative;overflow:hidden;border-radius:2px;flex-shrink:0}
.bg-canvas{background:#F8F8FF}.bg-surface{background:#FFFFFF}.bg-primary{background:#6C63FF}.bg-deep{background:#2D2B55}
.inner{display:flex;flex-direction:column;padding:72px 64px;height:100%;position:relative}
.inner.center{justify-content:center;align-items:center;text-align:center}
h1{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:64px;line-height:1.1;letter-spacing:-0.04em;max-width:800px}
h1.dark{color:#1A1A2E}h1.white{color:#FFFFFF}h1.neon{color:#C4F135}
h2{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:44px;line-height:1.15;letter-spacing:-0.03em;margin-bottom:16px;color:#1A1A2E}
p{font-family:'DM Sans',sans-serif;font-weight:400;font-size:20px;line-height:1.6;color:#4A4A6A;max-width:720px}
p.light{color:rgba(255,255,255,0.8)}
.badge{display:inline-flex;align-items:center;gap:8px;background:#EAE8FF;color:#5650D4;font-family:'DM Sans',sans-serif;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;padding:8px 16px;margin-bottom:20px;position:relative;z-index:1}
.badge.light{background:rgba(255,255,255,0.12);color:#C4F135}
.number-bg{position:absolute;top:20px;right:40px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:200px;line-height:1;letter-spacing:-0.06em;opacity:0.06;color:#6C63FF;pointer-events:none;user-select:none}
.code-bar{width:60px;height:4px;background:#6C63FF;margin-bottom:24px}
.code-bar.neon{background:#C4F135}
.card{background:#EAE8FF;border:1px solid #E0DFEF;padding:24px 32px;margin-top:24px;z-index:1;position:relative}
.card p{font-size:18px;color:#1A1A2E;font-weight:500}
.card p .highlight{color:#6C63FF;font-weight:700}
.steps{list-style:none;margin-top:24px;position:relative;z-index:1}
.steps li{display:flex;align-items:flex-start;gap:16px;margin-bottom:20px}
.step-num{width:36px;height:36px;background:#6C63FF;color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:16px;flex-shrink:0}
.step-text{font-family:'DM Sans',sans-serif;font-weight:400;font-size:18px;color:#4A4A6A;line-height:1.5}
.step-text strong{color:#1A1A2E}
.cta-btn{display:inline-block;background:#C4F135;color:#1A1A2E;font-family:'DM Sans',sans-serif;font-weight:700;font-size:18px;padding:18px 56px;border-radius:2px;margin-top:40px;letter-spacing:0.02em;text-decoration:none}
.cta-url{font-family:'DM Sans',sans-serif;font-weight:400;font-size:14px;color:rgba(255,255,255,0.4);margin-top:16px}
.logo-pos{position:absolute;bottom:36px;right:48px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:18px;letter-spacing:-0.02em;text-transform:lowercase}
.logo-neon{color:#C4F135}.logo-primary{color:#6C63FF}.logo-grey{color:#9D97F5}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px;position:relative;z-index:1}
.grid-item{background:#F8F8FF;border:1px solid #E0DFEF;padding:20px}
.grid-item h3{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:16px;color:#1A1A2E;margin-bottom:4px}
.grid-item p{font-size:14px;color:#8888AA}
.arrow-down{text-align:center;font-size:32px;color:#6C63FF;margin:12px 0;position:relative;z-index:1}
.stats-row{display:flex;gap:24px;margin-top:24px;position:relative;z-index:1}
.stat{text-align:center}
.stat-num{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:36px;color:#C4F135}
.stat-label{font-family:'DM Sans',sans-serif;font-weight:400;font-size:14px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.05em}
</style></head><body>

<!-- SLIDE 1: Capa -->
<div class="slide bg-primary">
  <div class="inner center">
    <div style="font-size:72px;margin-bottom:24px">📋</div>
    <h1 class="white">5 Passos para<br>Transformar <span style="color:#C4F135">Sua Clínica</span></h1>
    <div class="code-bar neon" style="margin:24px auto"></div>
    <p class="light" style="text-align:center">Estratégias práticas de gestão para crescer com tecnologia</p>
    <div style="font-family:'DM Sans',sans-serif;font-weight:700;font-size:11px;letter-spacing:0.3em;color:#9D97F5;text-transform:uppercase;margin-top:48px">⟶ Deslize</div>
    <div class="logo-pos logo-neon">evolua</div>
  </div>
</div>

<!-- SLIDE 2: Diagnóstico Financeiro -->
<div class="slide bg-surface">
  <div class="inner">
    <div class="number-bg">01</div>
    <div class="badge">💰 Passo 1</div>
    <h2>Diagnóstico Financeiro</h2>
    <p>Antes de crescer, entenda seus números. Custo por paciente, ticket médio, inadimplência.</p>
    <div class="card">
      <p>📊 <span class="highlight">60%</span> dos consultórios não sabem seu custo por paciente</p>
    </div>
    <div style="margin-top:32px;position:relative;z-index:1;width:100%">
      <div style="width:100%;height:12px;background:#EAE8FF;position:relative">
        <div style="width:60%;height:100%;background:linear-gradient(90deg,#6C63FF,#8B85FF);position:relative"></div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:8px;font-family:'DM Sans',sans-serif;font-weight:500;font-size:14px;color:#4A4A6A">
        <span>Sem controle financeiro</span>
        <span>60%</span>
      </div>
    </div>
    <div class="logo-pos logo-primary">evolua</div>
  </div>
</div>

<!-- SLIDE 3: Marketing Digital Ético -->
<div class="slide bg-canvas">
  <div class="inner">
    <div class="number-bg">02</div>
    <div class="badge">⚖️ Passo 2</div>
    <h2>Marketing Digital Ético</h2>
    <p>Promova seu trabalho dentro das regras do CFFA e atraia pacientes com conteúdo de valor.</p>
    <div class="grid-2">
      <div class="grid-item">
        <h3>✅ Permitido</h3>
        <p>Conteúdo educativo • Cases autorizados • Especialidades</p>
      </div>
      <div class="grid-item">
        <h3>❌ Vedado</h3>
        <p>Prometer cura • Sensacionalismo • Mercantilização</p>
      </div>
    </div>
    <div style="margin-top:12px;position:relative;z-index:1;font-family:'DM Sans',sans-serif;font-weight:500;font-size:13px;color:#8888AA">Resolução CFFA 600/2021</div>
    <div class="logo-pos logo-primary">evolua</div>
  </div>
</div>

<!-- SLIDE 4: Automação + CRM -->
<div class="slide bg-deep">
  <div class="inner">
    <div class="badge light">🤖 Passo 3 + 4</div>
    <h1 class="neon" style="font-size:44px;margin-bottom:12px">Automatização<br>+ CRM Especializado</h1>
    <p class="light">Menos tarefa manual, mais tempo para o que importa.</p>
    <ul class="steps">
      <li><span class="step-num">1</span><span class="step-text"><strong>Agenda automática</strong> com lembrete no WhatsApp e confirmação de presença</span></li>
      <li><span class="step-num">2</span><span class="step-text"><strong>Prontuário inteligente</strong> preenchido por IA em 30 segundos</span></li>
      <li><span class="step-num">3</span><span class="step-text"><strong>Cobrança unificada</strong> por PIX e cartão com controle de inadimplência</span></li>
      <li><span class="step-num">4</span><span class="step-text"><strong>Relatórios automáticos</strong> financeiros e de produção clínica</span></li>
    </ul>
    <div class="logo-pos logo-neon">evolua</div>
  </div>
</div>

<!-- SLIDE 5: CTA Final -->
<div class="slide bg-primary">
  <div class="inner center">
    <div style="font-size:72px;margin-bottom:20px">🚀</div>
    <h1 class="white">Comece Hoje</h1>
    <p class="light" style="text-align:center;margin-bottom:8px">Teste grátis por 7 dias. Sem compromisso.<br>Configure em 5 minutos.</p>
    <div class="cta-btn">QUERO TESTAR GRÁTIS</div>
    <div class="cta-url">useevolua.com.br</div>
    <div class="logo-pos logo-neon">evolua</div>
  </div>
</div>

</body></html>`
  writeFileSync(resolve(carrosselDir, 'carrossel-5-passos.html'), content, 'utf-8')
  // Also overwrite the original file for consistency
  writeFileSync(resolve(ROOT, 'docs/content-assets/03-instagram-feed/carrossel-5-passos.html'), content, 'utf-8')
  log('  ✓ carrossel-5-passos.html (1080×1080, 5 slides, v5.0)')
  return carrosselDir
}

// ─── 2B. Generate Infográficos (PDF-ready HTML, A4 portrait) ──
function generateInfograficos() {
  log('📊 Gerando Infográficos HTML (v5.0)...')
  const infraDir = resolve(OUT, 'infograficos-html')
  if (!existsSync(infraDir)) mkdirSync(infraDir, { recursive: true })

  const precos = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'DM Sans',sans-serif;background:#F8F8FF;color:#1A1A2E;display:flex;justify-content:center;padding:20px;line-height:1.6}
.infra{max-width:480px;width:100%;background:#FFFFFF}
.header{background:#6C63FF;padding:48px 28px 40px;text-align:center;position:relative;overflow:hidden}
.header::before{content:'';position:absolute;top:-60%;right:-40%;width:400px;height:400px;background:rgba(255,255,255,0.05);border-radius:50%}
.header::after{content:'';position:absolute;bottom:-40%;left:-30%;width:300px;height:300px;background:rgba(196,241,53,0.06);border-radius:50%}
.h-content{position:relative;z-index:1}
.h-badge{font-family:'Space Grotesk',sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:3px;color:#C4F135;font-weight:700;margin-bottom:12px}
.h-title{font-size:28px;color:#fff;line-height:1.2;margin-bottom:8px;font-family:'Space Grotesk',sans-serif;font-weight:700}
.h-title span{color:#C4F135}
.h-sub{font-size:14px;color:rgba(255,255,255,0.7);font-family:'DM Sans',sans-serif}
.section{padding:28px 24px}
.section:nth-child(even){background:#F8F8FF}
.section h2{font-size:18px;color:#1A1A2E;margin-bottom:16px;display:flex;align-items:center;gap:10px;font-family:'Space Grotesk',sans-serif;font-weight:600}
.price-card{background:#FFFFFF;padding:20px;margin-bottom:12px;border:1px solid #E0DFEF}
.price-card:last-child{margin-bottom:0}
.pc-title{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:16px;color:#1A1A2E;margin-bottom:4px}
.pc-desc{font-size:13px;color:#8888AA;margin-bottom:8px}
.pc-value{font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:700;color:#6C63FF}
.pc-value small{font-family:'DM Sans',sans-serif;font-size:13px;font-weight:400;color:#8888AA}
.formula-box{background:#2D2B55;padding:24px;color:#fff;text-align:center}
.formula-box .f-head{font-size:12px;opacity:0.6;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
.formula-box .f-body{font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;color:#C4F135;margin:12px 0;letter-spacing:1px}
.formula-box .f-step{font-size:13px;color:rgba(255,255,255,0.7);margin-top:8px;text-align:left}
.formula-box .f-step strong{color:#fff}
.region-list{list-style:none}
.region-list li{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #E0DFEF;font-size:14px}
.region-list li:last-child{border-bottom:none}
.r-name{font-weight:600;color:#1A1A2E}
.r-price{font-family:'Space Grotesk',sans-serif;font-weight:700;color:#6C63FF}
.comp-grid{display:flex;gap:12px;margin-bottom:12px}
.comp-item{flex:1;background:#FFFFFF;padding:20px;text-align:center;border:1px solid #E0DFEF}
.comp-item.highlight{background:#F8F8FF;border-color:#6C63FF}
.comp-icon{font-size:28px;margin-bottom:8px}
.comp-label{font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:600;color:#8888AA;text-transform:uppercase;letter-spacing:1px}
.comp-value{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;color:#1A1A2E;margin:4px 0}
.comp-desc{font-size:12px;color:#8888AA}
.when-box{display:flex;flex-direction:column;gap:10px}
.when-item{display:flex;align-items:flex-start;gap:12px;padding:14px;background:#FFFFFF;border:1px solid #E0DFEF}
.when-check{width:22px;height:22px;background:#C4F135;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#1A1A2E;font-weight:700}
.when-text{font-size:13px;color:#4A4A6A}
.when-text strong{color:#1A1A2E}
.err-list{list-style:none}
.err-list li{padding:10px 0 10px 28px;position:relative;font-size:13px;color:#4A4A6A;border-bottom:1px solid #E0DFEF}
.err-list li:last-child{border-bottom:none}
.err-dot{position:absolute;left:0;top:50%;transform:translateY(-50%);width:6px;height:6px;background:#8888AA}
.footer{text-align:center;padding:20px;background:#2D2B55;color:#fff}
.footer .f-name{font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700;color:#C4F135}
.footer .f-sub{font-size:11px;color:rgba(255,255,255,0.4);margin-top:4px}
.disclaimer{font-size:11px;color:#8888AA;text-align:center;margin-top:8px}
@media(max-width:480px){.comp-grid{flex-direction:column}.section{padding:24px 20px}}
</style></head><body>
<div class="infra">

<div class="header">
  <div class="h-content">
    <div class="h-badge">Evolua · Lead Magnet</div>
    <div class="h-title">Estratégia de<br><span>Preços</span></div>
    <div class="h-sub">Guia rápido para precificar seus serviços de fonoaudiologia</div>
  </div>
</div>

<div class="section">
  <h2>💰 Quanto cobrar?</h2>
  <div class="price-card">
    <div class="pc-title">Avaliação Fonoaudiológica</div>
    <div class="pc-desc">Sessão inicial com anamnese, testes e devolutiva</div>
    <div class="pc-value">R$ 150 — R$ 350 <small>/ sessão</small></div>
  </div>
  <div class="price-card">
    <div class="pc-title">Terapia Individual (sessão)</div>
    <div class="pc-desc">Sessões regulares de 30 a 50 minutos</div>
    <div class="pc-value">R$ 100 — R$ 250 <small>/ sessão</small></div>
  </div>
  <div class="price-card">
    <div class="pc-title">Pacote Mensal (4 sessões)</div>
    <div class="pc-desc">Valor fechado com desconto por fidelidade</div>
    <div class="pc-value">R$ 360 — R$ 880 <small>/ mês</small></div>
  </div>
  <div class="price-card">
    <div class="pc-title">Relatório / Parecer Técnico</div>
    <div class="pc-desc">Documentação para escola, plano de saúde ou justiça</div>
    <div class="pc-value">R$ 80 — R$ 200 <small>/ unidade</small></div>
  </div>
  <div class="price-card">
    <div class="pc-title">Atendimento Domiciliar (adicional)</div>
    <div class="pc-desc">Acréscimo sobre o valor da sessão para deslocamento</div>
    <div class="pc-value">R$ 20 — R$ 60 <small>/ adicional</small></div>
  </div>
</div>

<div class="section">
  <h2>🧮 Fórmula de Precificação</h2>
  <div class="formula-box">
    <div class="f-head">Preço ideal por sessão</div>
    <div class="f-body">(CV + CF + ML) ÷ HAT</div>
    <div class="f-step"><strong>CV</strong> = Custos variáveis (material, deslocamento, impostos)</div>
    <div class="f-step"><strong>CF</strong> = Custos fixos ÷ número de sessões no mês</div>
    <div class="f-step"><strong>ML</strong> = Margem de lucro desejada (20 a 40%)</div>
    <div class="f-step"><strong>HAT</strong> = Horas de atendimento por mês</div>
  </div>
</div>

<div class="section">
  <h2>📍 Ticket médio por região</h2>
  <ul class="region-list">
    <li><span class="r-name">São Paulo (capital)</span><span class="r-price">R$ 180 — R$ 350</span></li>
    <li><span class="r-name">Rio de Janeiro</span><span class="r-price">R$ 150 — R$ 300</span></li>
    <li><span class="r-name">Belo Horizonte</span><span class="r-price">R$ 130 — R$ 250</span></li>
    <li><span class="r-name">Curitiba / Porto Alegre</span><span class="r-price">R$ 120 — R$ 240</span></li>
    <li><span class="r-name">Cidades médias (100k-500k hab.)</span><span class="r-price">R$ 100 — R$ 200</span></li>
    <li><span class="r-name">Interior / Pequenas cidades</span><span class="r-price">R$ 80 — R$ 150</span></li>
  </ul>
  <p class="disclaimer">* Valores referenciais para consultório particular (sem convênio)</p>
</div>

<div class="section">
  <h2>⏰ Valor hora vs Valor sessão</h2>
  <div class="comp-grid">
    <div class="comp-item">
      <div class="comp-icon">⏰</div>
      <div class="comp-label">Valor Hora</div>
      <div class="comp-value">R$ 80 — R$ 150</div>
      <div class="comp-desc">Para pareceres, assessorias e horários avulsos</div>
    </div>
    <div class="comp-item highlight">
      <div class="comp-icon">🩺</div>
      <div class="comp-label">Valor Sessão</div>
      <div class="comp-value">R$ 100 — R$ 250</div>
      <div class="comp-desc">Inclui preparo, atendimento e registro</div>
    </div>
  </div>
  <p class="disclaimer">A sessão inclui o trabalho indireto (preparo, registro) que a hora avulsa não contempla</p>
</div>

<div class="section">
  <h2>📅 Quando reajustar</h2>
  <div class="when-box">
    <div class="when-item"><div class="when-check">✓</div><div class="when-text"><strong>Anualmente</strong> — Corrija pela inflação (IPCA) + ganho real de 5-10%</div></div>
    <div class="when-item"><div class="when-check">✓</div><div class="when-text"><strong>Nova especialização</strong> — Curso ou certificação justifica aumento de 10-20%</div></div>
    <div class="when-item"><div class="when-check">✓</div><div class="when-text"><strong>Mudança de endereço</strong> — Bairro nobre ou consultório reformado</div></div>
    <div class="when-item"><div class="when-check">✓</div><div class="when-text"><strong>Demanda maior que oferta</strong> — Agenda lotada há mais de 3 meses</div></div>
    <div class="when-item"><div class="when-check">✓</div><div class="when-text"><strong>Inadimplência baixa</strong> — Pacientes que pagam em dia suportam reajustes</div></div>
    <div class="when-item"><div class="when-check">✓</div><div class="when-text"><strong>+2 anos sem reajuste</strong> — Inflação acumulada corroeu seu poder de compra</div></div>
  </div>
</div>

<div class="section">
  <h2>⚠️ Erros comuns ao precificar</h2>
  <ul class="err-list">
    <li><span class="err-dot"></span><strong>Cobrar abaixo do mercado</strong> por medo — desvaloriza seu trabalho</li>
    <li><span class="err-dot"></span><strong>Não considerar custos indiretos</strong> — impostos, férias, reserva técnica</li>
    <li><span class="err-dot"></span><strong>Preço único para todos</strong> — pacotes e convênios devem ter tabelas distintas</li>
    <li><span class="err-dot"></span><strong>Não revisar preços periodicamente</strong> — o mercado e seus custos mudam</li>
    <li><span class="err-dot"></span><strong>Divulgar preços publicamente</strong> — CFFA veda mercantilização</li>
  </ul>
</div>

<div class="footer">
  <div class="f-name">Evolua</div>
  <div class="f-sub">CRM inteligente para fonoaudiólogas · useevolua.com.br</div>
</div>

</div></body></html>`

  const humanizado = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'DM Sans',sans-serif;background:#F8F8FF;color:#1A1A2E;display:flex;justify-content:center;padding:20px;line-height:1.6}
.infra{max-width:480px;width:100%;background:#FFFFFF}
.header{background:#2D2B55;padding:48px 28px 40px;text-align:center;position:relative;overflow:hidden}
.header::before{content:'';position:absolute;top:-60%;right:-40%;width:400px;height:400px;background:rgba(108,99,255,0.08);border-radius:50%}
.header::after{content:'';position:absolute;bottom:-40%;left:-30%;width:300px;height:300px;background:rgba(196,241,53,0.04);border-radius:50%}
.h-content{position:relative;z-index:1}
.h-badge{font-family:'Space Grotesk',sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:3px;color:#C4F135;font-weight:700;margin-bottom:12px}
.h-title{font-size:28px;color:#fff;line-height:1.2;margin-bottom:8px;font-family:'Space Grotesk',sans-serif;font-weight:700}
.h-title span{color:#C4F135}
.h-sub{font-size:14px;color:rgba(255,255,255,0.7);font-family:'DM Sans',sans-serif}
.section{padding:28px 24px}
.section:nth-child(even){background:#F8F8FF}
.section h2{font-size:18px;color:#1A1A2E;margin-bottom:16px;display:flex;align-items:center;gap:10px;font-family:'Space Grotesk',sans-serif;font-weight:600}
.pillars{display:flex;flex-direction:column;gap:12px}
.pillar{display:flex;align-items:flex-start;gap:14px;padding:16px;background:#FFFFFF;border:1px solid #E0DFEF}
.p-icon{width:44px;height:44px;background:#EAE8FF;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:22px}
.p-content{flex:1}
.p-title{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:15px;color:#1A1A2E;margin-bottom:2px}
.p-desc{font-size:13px;color:#4A4A6A}
.checklist{list-style:none}
.checklist li{display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid #E0DFEF;font-size:14px;color:#4A4A6A}
.checklist li:last-child{border-bottom:none}
.cb{width:22px;height:22px;background:#C4F135;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;color:#1A1A2E;font-weight:700;font-size:12px}
.comp-box{background:#FFFFFF;padding:20px;border:1px solid #E0DFEF;margin-bottom:12px}
.comp-box:last-child{margin-bottom:0}
.cb-title{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:15px;color:#1A1A2E;margin-bottom:8px}
.cb-title .cb-icon{vertical-align:middle;margin-right:6px}
.comp-box p{font-size:13px;color:#4A4A6A}
.comp-box ul{list-style:none;margin-top:8px}
.comp-box ul li{padding:4px 0 4px 20px;position:relative;font-size:13px;color:#4A4A6A}
.comp-box ul li::before{content:'';position:absolute;left:4px;top:50%;transform:translateY(-50%);width:4px;height:4px;background:#6C63FF}
.hybrid-tech{display:flex;gap:12px;margin-bottom:16px}
.ht-item{flex:1;padding:16px;text-align:center}
.ht-item:first-child{background:#EAE8FF}
.ht-item:last-child{background:#2D2B55;color:#fff}
.ht-icon{font-size:28px;margin-bottom:4px}
.ht-item:last-child .ht-icon{color:#C4F135}
.ht-label{font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-top:4px}
.ht-desc{font-size:11px;margin-top:4px;opacity:0.7}
.quote{background:#EAE8FF;padding:16px 20px;margin:16px 0;font-style:italic;font-size:14px;color:#1A1A2E}
.quote .q-author{font-style:normal;font-family:'Space Grotesk',sans-serif;font-weight:600;color:#6C63FF;margin-top:8px;font-size:13px}
.dica-item{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid #E0DFEF;font-size:13px;color:#4A4A6A}
.dica-item:last-child{border-bottom:none}
.dica-star{color:#6C63FF;font-size:18px;flex-shrink:0}
.footer{text-align:center;padding:20px 24px;background:#2D2B55;color:#fff}
.footer .f-name{font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700;color:#C4F135}
.footer .f-sub{font-size:11px;color:rgba(255,255,255,0.4);margin-top:4px}
@media(max-width:480px){.hybrid-tech{flex-direction:column}.section{padding:24px 20px}}
</style></head><body>
<div class="infra">

<div class="header">
  <div class="h-content">
    <div class="h-badge">Evolua · Lead Magnet</div>
    <div class="h-title">Atendimento<br><span>Humanizado</span></div>
    <div class="h-sub">Como acolher, comunicar e cuidar com excelência</div>
  </div>
</div>

<div class="section">
  <h2>❤️ Pilares do Atendimento Humanizado</h2>
  <div class="pillars">
    <div class="pillar">
      <div class="p-icon">👂</div>
      <div class="p-content">
        <div class="p-title">Escuta Ativa</div>
        <div class="p-desc">Mais que ouvir, é compreender. Faça perguntas abertas, valide sentimentos. O silêncio também é ferramenta clínica.</div>
      </div>
    </div>
    <div class="pillar">
      <div class="p-icon">🤝</div>
      <div class="p-content">
        <div class="p-title">Acolhimento</div>
        <div class="p-desc">A primeira consulta define o vínculo. Receba com sorriso, explique o que vai acontecer, use linguagem acessível.</div>
      </div>
    </div>
    <div class="pillar">
      <div class="p-icon">💬</div>
      <div class="p-content">
        <div class="p-title">Linguagem Clara</div>
        <div class="p-desc">Substitua jargões por explicações simples. O paciente só confia no que entende.</div>
      </div>
    </div>
  </div>
</div>

<div class="section">
  <h2>✅ Checklist para Primeira Consulta</h2>
  <ul class="checklist">
    <li><span class="cb">✓</span> Ambiente limpo, organizado e com materiais visíveis</li>
    <li><span class="cb">✓</span> Recepcionar usando o nome do paciente</li>
    <li><span class="cb">✓</span> Explicar duração e formato antes de começar</li>
    <li><span class="cb">✓</span> Perguntar sobre rotina, escola, histórico familiar</li>
    <li><span class="cb">✓</span> Validar as queixas: "Entendo sua preocupação"</li>
    <li><span class="cb">✓</span> Combinar próximos passos por escrito</li>
    <li><span class="cb">✓</span> Entregar resumo do que foi conversado</li>
    <li><span class="cb">✓</span> Deixar canal de contato claro para dúvidas</li>
    <li><span class="cb">✓</span> Perguntar se ficou alguma dúvida antes de encerrar</li>
  </ul>
</div>

<div class="section">
  <h2>🧒 Crianças vs Adultos</h2>
  <div class="comp-box">
    <div class="cb-title"><span class="cb-icon">🧒</span> Atendimento Infantil</div>
    <p>Estabeleça rapport primeiro com a criança — brinque, mostre materiais. Use linguagem lúdica: "Vamos brincar de fazer sons?" Inclua os pais com orientações claras.</p>
    <ul>
      <li>Sessões de 30 a 45 minutos</li>
      <li>Jogos e histórias como ferramentas terapêuticas</li>
      <li>Crie rotina previsível — a criança se sente segura</li>
    </ul>
  </div>
  <div class="comp-box">
    <div class="cb-title"><span class="cb-icon">🧑</span> Atendimento Adulto e Idoso</div>
    <p>Valide a trajetória do paciente. Com idosos, fale pausadamente, confirme a compreensão, envolva acompanhantes sem infantilizar.</p>
    <ul>
      <li>Sessões de 40 a 50 minutos com pausas</li>
      <li>Materiais impressos com fonte ampliada</li>
      <li>Envolva o paciente nas decisões do tratamento</li>
    </ul>
  </div>
</div>

<div class="section">
  <h2>👂 Escuta Ativa na Prática</h2>
  <p style="font-size:14px;color:#4A4A6A;margin-bottom:16px">A escuta ativa é a habilidade mais subestimada na formação em saúde. Estar presente, sem julgar e sem preparar a resposta enquanto o outro fala.</p>
  <div class="pillar" style="margin-bottom:8px">
    <div class="p-icon">👁️</div>
    <div class="p-content">
      <div class="p-title">Contato visual e postura</div>
      <div class="p-desc">Sente-se de frente, evite cruzar os braços. Pequenos sinais de abertura corporal fazem diferença.</div>
    </div>
  </div>
  <div class="pillar" style="margin-bottom:8px">
    <div class="p-icon">🔄</div>
    <div class="p-content">
      <div class="p-title">Parafraseie e valide</div>
      <div class="p-desc">"Se entendi corretamente, você está preocupada porque..." — mostra que você ouviu.</div>
    </div>
  </div>
  <div class="pillar">
    <div class="p-icon">❓</div>
    <div class="p-content">
      <div class="p-title">Perguntas abertas</div>
      <div class="p-desc">"Como tem sido o dia a dia?" abre mais espaço que "Melhorou ou piorou?".</div>
    </div>
  </div>
</div>

<div class="section">
  <h2>🤖 Tecnologia que Humaniza</h2>
  <p style="font-size:14px;color:#4A4A6A;margin-bottom:16px">Tecnologia não desumaniza o atendimento — ela libera tempo para o que realmente importa: o contato humano.</p>
  <div class="hybrid-tech">
    <div class="ht-item">
      <div class="ht-icon">⚡</div>
      <div class="ht-label">Automação</div>
      <div class="ht-desc">Lembretes, cobranças e agendamentos automáticos liberam horas</div>
    </div>
    <div class="ht-item">
      <div class="ht-icon">❤️</div>
      <div class="ht-label">Humanização</div>
      <div class="ht-desc">Mais tempo para escutar, acolher e personalizar cada sessão</div>
    </div>
  </div>
  <div class="quote">
    <p>"A tecnologia bem aplicada não rouba o toque humano — ela devolve o tempo que a burocracia roubava."</p>
    <div class="q-author">— Evolua CRM</div>
  </div>
</div>

<div class="section">
  <h2>💡 Dicas Rápidas</h2>
  <div class="dica-item"><span class="dica-star">⭐</span><span><strong>No primeiro contato</strong>, chame o paciente pelo nome. Isso cria conexão imediata.</span></div>
  <div class="dica-item"><span class="dica-star">⭐</span><span><strong>Na devolutiva</strong>, comece pelos pontos fortes, depois aborde dificuldades.</span></div>
  <div class="dica-item"><span class="dica-star">⭐</span><span><strong>Use exemplos concretos</strong> em vez de termos técnicos.</span></div>
  <div class="dica-item"><span class="dica-star">⭐</span><span><strong>A cada sessão</strong>, pergunte "como foi a semana?" — o paciente importa além da queixa.</span></div>
  <div class="dica-item"><span class="dica-star">⭐</span><span><strong>Lembre-se:</strong> o paciente não é um caso clínico. É uma pessoa que confiou sua saúde a você.</span></div>
</div>

<div class="footer">
  <div class="f-name">Evolua</div>
  <div class="f-sub">CRM inteligente para fonoaudiólogas · useevolua.com.br</div>
</div>

</div></body></html>`

  writeFileSync(resolve(infraDir, 'infraco-estrategia-precos.html'), precos, 'utf-8')
  writeFileSync(resolve(infraDir, 'infraco-atendimento-humanizado.html'), humanizado, 'utf-8')
  // Also overwrite originals
  writeFileSync(resolve(ROOT, 'docs/content-assets/05-lead-magnets/infraco-estrategia-precos.html'), precos, 'utf-8')
  writeFileSync(resolve(ROOT, 'docs/content-assets/05-lead-magnets/infraco-atendimento-humanizado.html'), humanizado, 'utf-8')
  log('  ✓ 2 infográficos (v5.0)')
  return infraDir
}

// ─── 2. Generate Stories HTML (1080×1920) ───────────────────────
function generateStories() {
  log('📱 Gerando Stories HTML...')
  const storiesDir = resolve(OUT, 'stories-html')
  if (!existsSync(storiesDir)) mkdirSync(storiesDir, { recursive: true })

  const content = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#E0DFEF;display:flex;flex-direction:column;align-items:center;gap:12px;padding:12px}
.story{width:1080px;height:1920px;position:relative;overflow:hidden;border-radius:2px;flex-shrink:0}
.bg-primary{background:#6C63FF}.bg-deep{background:#2D2B55}.bg-surface{background:#FFFFFF}.bg-canvas{background:#F8F8FF}
.story-content{display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;height:100%;padding:80px 60px;position:relative}
.story-content.top{justify-content:flex-start;padding-top:120px}
.logo{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:24px;letter-spacing:-0.02em;text-transform:lowercase}
.logo-neon{color:#C4F135}
h1{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:72px;line-height:1.1;letter-spacing:-0.04em;color:#FFFFFF;margin-bottom:24px}
h1.dark{color:#1A1A2E}
.sub{font-family:'DM Sans',sans-serif;font-weight:400;font-size:28px;color:rgba(255,255,255,0.8);line-height:1.5;max-width:800px}
.sub.dark{color:#4A4A6A}
.cta-btn{display:inline-block;background:#C4F135;color:#1A1A2E;font-family:'DM Sans',sans-serif;font-weight:700;font-size:24px;padding:20px 64px;border-radius:2px;margin-top:48px;letter-spacing:0.02em}
.bottom-logo{position:absolute;bottom:60px;left:50%;transform:translateX(-50%)}
.accent-dot{width:16px;height:16px;background:#C4F135;border-radius:50%;margin-bottom:32px}
.big-number{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:200px;letter-spacing:-0.06em;opacity:0.08;color:#6C63FF;position:absolute;top:40px;right:60px;pointer-events:none;user-select:none}
.quote-text{font-family:'DM Sans',sans-serif;font-weight:400;font-size:36px;line-height:1.5;color:#1A1A2E;max-width:860px}
.quote-author{font-family:'Space Grotesk',sans-serif;font-weight:600;color:#6C63FF;margin-top:24px;font-size:20px}
.icon-big{font-size:80px;margin-bottom:32px}
.accent-line{width:80px;height:4px;background:#C4F135;margin:24px auto}
.top-badge{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:13px;letter-spacing:0.3em;color:#6C63FF;text-transform:uppercase;margin-bottom:16px}.top-badge.light{color:#9D97F5}
</style></head><body>

<!-- STORY 1: Capa -->
<div class="story bg-primary">
  <div class="story-content">
    <div class="icon-big">📋</div>
    <h1>Chega de<br>Papelada</h1>
    <div class="accent-line"></div>
    <div class="sub">Seu prontuário em 30 segundos com IA</div>
    <div class="cta-btn">TESTE GRÁTIS →</div>
    <div class="bottom-logo"><span class="logo logo-neon">evolua</span></div>
  </div>
</div>

<!-- STORY 2: WhatsApp integrado -->
<div class="story bg-deep">
  <div class="story-content">
    <div class="top-badge light">📱 WhatsApp Nativo</div>
    <h1>Agenda + Cobrança<br>no WhatsApp</h1>
    <div class="sub">Lembrete automático • Cobrança por PIX • Confirmação de presença</div>
    <div class="cta-btn">SABER MAIS</div>
    <div class="bottom-logo"><span class="logo logo-neon">evolua</span></div>
  </div>
</div>

<!-- STORY 3: Economia de tempo -->
<div class="story bg-surface">
  <div class="story-content">
    <div class="accent-dot"></div>
    <h1 class="dark">+5h/semana<br>devolvidas</h1>
    <div class="sub dark">Foco no que importa: o paciente.<br>A burocracia a gente automatiza.</div>
    <div class="cta-btn">QUERO ECONOMIZAR</div>
    <div class="bottom-logo"><span class="logo" style="color:#6C63FF">evolua</span></div>
  </div>
</div>

<!-- STORY 4: Case real -->
<div class="story bg-primary">
  <div class="story-content">
    <div style="font-size:100px;margin-bottom:24px">💬</div>
    <h1>"Nunca mais perdi<br>paciente"</h1>
    <div class="sub">Dra. Carla M. — Fonoaudióloga há 8 anos</div>
    <div class="accent-line"></div>
    <div style="font-family:'DM Sans',sans-serif;font-weight:400;font-size:24px;color:rgba(255,255,255,0.6);margin-top:16px">Antes: 10h em burocracia. Depois: 30s.</div>
    <div class="bottom-logo"><span class="logo logo-neon">evolua</span></div>
  </div>
</div>

<!-- STORY 5: 7 dias grátis -->
<div class="story bg-deep">
  <div class="story-content">
    <div style="font-size:80px;margin-bottom:24px">🚀</div>
    <h1>7 Dias Grátis</h1>
    <div class="sub">Sem compromisso. Sem cartão.<br>Configure em 5 minutos.</div>
    <div class="cta-btn">COMEÇAR AGORA</div>
    <div style="margin-top:24px;font-family:'DM Sans',sans-serif;font-weight:400;font-size:20px;color:rgba(255,255,255,0.4)">useevolua.com.br</div>
    <div class="bottom-logo"><span class="logo logo-neon">evolua</span></div>
  </div>
</div>

<!-- STORY 6: Prova social -->
<div class="story bg-canvas">
  <div class="story-content">
    <div style="display:flex;gap:12px;margin-bottom:32px">
      <span style="font-size:60px">👥</span>
    </div>
    <h1 class="dark">+300 Fonoaudiólogas<br>já usam</h1>
    <div class="sub dark">A maior comunidade de fonoaudiologia<br>digital do Brasil.</div>
    <div class="cta-btn">QUERO PARTICIPAR</div>
    <div class="bottom-logo"><span class="logo" style="color:#6C63FF">evolua</span></div>
  </div>
</div>

</body></html>`

  writeFileSync(resolve(storiesDir, 'stories.html'), content, 'utf-8')
  log('  ✓ stories.html (1080×1920, 6 slides)')
  return storiesDir
}

// ─── 3. Generate LinkedIn Posts HTML (1200×627) ────────────────
function generateLinkedIn() {
  log('💼 Gerando LinkedIn HTML...')
  const linkedinDir = resolve(OUT, 'linkedin-html')
  if (!existsSync(linkedinDir)) mkdirSync(linkedinDir, { recursive: true })

  const content = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#E0DFEF;display:flex;flex-direction:column;align-items:center;gap:12px;padding:12px}
.post{width:1200px;height:627px;display:flex;flex-direction:column;position:relative;overflow:hidden;border-radius:2px;flex-shrink:0}
.post.purple{background:#6C63FF;color:#fff}
.post.dark{background:#2D2B55;color:#fff}
.post.white{background:#FFFFFF;color:#1A1A2E}
.post.light{background:#F8F8FF;color:#1A1A2E}
.post-content{display:flex;flex-direction:column;justify-content:center;padding:60px 80px;height:100%;position:relative;z-index:1}
.post-row{display:flex;gap:40px;align-items:center;height:100%}
.post-icon{flex-shrink:0;font-size:72px;width:120px;text-align:center}
.post-text{flex:1}
h2{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:40px;line-height:1.15;letter-spacing:-0.03em;margin-bottom:16px}
h2.neon{color:#C4F135}
p{font-family:'DM Sans',sans-serif;font-weight:400;font-size:20px;line-height:1.5;color:#4A4A6A;max-width:800px}
p.light{color:rgba(255,255,255,0.8)}
p.white{color:#1A1A2E}
.hashtag{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:14px;letter-spacing:0.1em;color:#6C63FF;margin-top:24px;text-transform:uppercase}
.logo-bottom{position:absolute;bottom:32px;right:48px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:18px;letter-spacing:-0.02em;text-transform:lowercase}
.logo-bottom.purple{color:#9D97F5}.logo-bottom.neon{color:#C4F135}.logo-bottom.primary{color:#6C63FF}
.stat-row{display:flex;gap:32px;margin-top:24px}
.stat{text-align:center}
.stat-num{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:32px;color:#C4F135}
.stat-label{font-family:'DM Sans',sans-serif;font-weight:400;font-size:14px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.05em}
.stat-num.primary{color:#6C63FF}.stat-label.dark{color:#8888AA}
.quote-block{border-left:4px solid #C4F135;padding-left:24px;margin:16px 0}
.quote-block p{font-style:italic;font-size:18px}
.big-stat{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:80px;color:#6C63FF;line-height:1;margin-bottom:8px}
.big-stat.neon{color:#C4F135}
.card{background:#F8F8FF;border:1px solid #E0DFEF;padding:24px 32px;margin-top:20px;border-radius:2px}
.card p{font-size:16px;color:#4A4A6A}
</style></head><body>

<!-- POST 1: Diagnóstico Financeiro -->
<div class="post purple">
  <div class="post-content">
    <div style="font-size:60px;margin-bottom:16px">📊</div>
    <h2>60% fecham em 5 anos</h2>
    <p class="light">Você sabe qual o custo real de cada sessão? O Sebrae revela: 6 em cada 10 consultórios de fonoaudiologia fecham por falta de gestão financeira.</p>
    <div class="stat-row">
      <div class="stat"><div class="stat-num">R$120</div><div class="stat-label">Sessão Média</div></div>
      <div class="stat"><div class="stat-num">30min</div><div class="stat-label">Papelada/Dia</div></div>
      <div class="stat"><div class="stat-num">80%</div><div class="stat-label">Tempo Recuperado</div></div>
    </div>
    <div class="hashtag">#Fonoaudiologia #GestaoClinica</div>
    <div class="logo-bottom purple">evolua</div>
  </div>
</div>

<!-- POST 2: Marketing Digital Ético -->
<div class="post white">
  <div class="post-content">
    <div class="post-row">
      <div class="post-icon">⚖️</div>
      <div class="post-text">
        <h2>Marketing Digital<br>sem medo do CFFA</h2>
        <p>Saiba o que é permitido e o que é vedado pelo Conselho. Conteúdo educativo, cases autorizados e especialidades podem — e devem — ser divulgados.</p>
        <div style="display:flex;gap:32px;margin-top:20px">
          <div><span style="color:#6C63FF;font-weight:700">✅</span> Permitido: educativo, cases</div>
          <div><span style="color:#8888AA;font-weight:700">❌</span> Vedado: prometer cura</div>
        </div>
        <div class="hashtag">#CFFA #MarketingParaFono</div>
      </div>
    </div>
    <div class="logo-bottom primary">evolua</div>
  </div>
</div>

<!-- POST 3: Automação com IA -->
<div class="post dark">
  <div class="post-content">
    <div style="font-size:60px;margin-bottom:16px">🤖</div>
    <h2 class="neon">1h/dia economizada</h2>
    <p class="light">6 pacientes/dia × 10min de prontuário = 1h/dia em burocracia. 20h/mês. 240h/ano. Com IA, seu prontuário fica pronto enquanto você atende.</p>
    <div class="card" style="background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.15);margin-top:24px">
      <p class="light" style="font-size:16px">✓ Prontuário em 30s • ✓ Laudo em 2 cliques • ✓ Relatório financeiro automático</p>
    </div>
    <div class="hashtag" style="color:#9D97F5">#IAparaFono #Fonoaudiologia</div>
    <div class="logo-bottom neon">evolua</div>
  </div>
</div>

<!-- POST 4: Teleconsulta -->
<div class="post light">
  <div class="post-content">
    <div class="post-row">
      <div class="post-icon">📹</div>
      <div class="post-text">
        <h2>Teleconsulta veio<br>pra ficar</h2>
        <p>Redução de 40% nas faltas. Alcance pacientes de outras cidades. Mais flexibilidade para você e para eles.</p>
        <div style="background:#FFFFFF;border:1px solid #E0DFEF;padding:20px;margin-top:16px;border-radius:2px">
          <p style="font-size:15px;color:#1A1A2E">✓ Ambiente adequado • ✓ Consentimento • ✓ Plataforma LGPD</p>
        </div>
        <div class="hashtag">#Teleconsulta #SaudeDigital</div>
      </div>
    </div>
    <div class="logo-bottom primary">evolua</div>
  </div>
</div>

<!-- POST 5: Precificação -->
<div class="post white">
  <div class="post-content">
    <div class="post-row">
      <div class="post-icon">💰</div>
      <div class="post-text">
        <h2>Quanto cobrar<br>por sessão?</h2>
        <p>A fórmula que toda fonoaudióloga deveria conhecer:</p>
        <div style="font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:28px;color:#6C63FF;margin:16px 0;letter-spacing:1px">(CV + CF + ML) ÷ HAT</div>
        <p style="font-size:15px">Custos variáveis + fixos + margem de lucro, dividido pelas horas de atendimento no mês.</p>
        <div class="hashtag">#Precificacao #GestaoFinanceira</div>
      </div>
    </div>
    <div class="logo-bottom primary">evolua</div>
  </div>
</div>

<!-- POST 6: Case Dra. Carla -->
<div class="post purple">
  <div class="post-content">
    <div style="font-size:60px;margin-bottom:12px">💬</div>
    <div class="quote-block">
      <p style="color:rgba(255,255,255,0.9);font-size:28px;font-style:italic">"O Evolua me devolveu<br>meu tempo de volta."</p>
    </div>
    <p class="light" style="margin-top:16px">— Dra. Carla M., Fonoaudióloga (SP)</p>
    <div style="display:flex;gap:32px;margin-top:24px">
      <div class="stat"><div class="stat-num">-10h</div><div class="stat-label">Burocracia/semana</div></div>
      <div class="stat"><div class="stat-num">+20%</div><div class="stat-label">Ticket Médio</div></div>
      <div class="stat"><div class="stat-num">+4h</div><div class="stat-label">Tempo Livre/semana</div></div>
    </div>
    <div class="hashtag" style="color:#9D97F5">#CaseDeSucesso #Evolua</div>
    <div class="logo-bottom purple">evolua</div>
  </div>
</div>

</body></html>`

  writeFileSync(resolve(linkedinDir, 'linkedin-posts.html'), content, 'utf-8')
  log('  ✓ linkedin-posts.html (1200×627, 6 posts)')
  return linkedinDir
}

// ─── 4. Generate Meta Ads HTML (Feed 1080×1080) ────────────────
function generateMetaAds() {
  log('📢 Gerando Meta Ads HTML...')
  const adsDir = resolve(OUT, 'meta-ads-html')
  if (!existsSync(adsDir)) mkdirSync(adsDir, { recursive: true })

  const feed = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#E0DFEF;display:flex;flex-direction:column;align-items:center;gap:12px;padding:12px}
.ad{width:1080px;height:1080px;position:relative;overflow:hidden;border-radius:2px;flex-shrink:0}
.bg-primary{background:#6C63FF}.bg-deep{background:#2D2B55}.bg-surface{background:#FFFFFF}.bg-canvas{background:#F8F8FF}
.ad-content{display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;height:100%;padding:80px 64px;position:relative}
.ad-content.left{align-items:flex-start;text-align:left}
h1{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:56px;line-height:1.1;letter-spacing:-0.04em;color:#FFFFFF;margin-bottom:16px;max-width:900px}
h1.dark{color:#1A1A2E}
h2{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:44px;line-height:1.15;letter-spacing:-0.03em;margin-bottom:12px}
.sub{font-family:'DM Sans',sans-serif;font-weight:400;font-size:24px;color:rgba(255,255,255,0.8);line-height:1.5;max-width:800px}
.sub.dark{color:#4A4A6A}
.cta{display:inline-block;background:#C4F135;color:#1A1A2E;font-family:'DM Sans',sans-serif;font-weight:700;font-size:20px;padding:18px 56px;border-radius:2px;margin-top:40px;letter-spacing:0.02em}
.logo-bottom{position:absolute;bottom:40px;right:48px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:20px;letter-spacing:-0.02em;text-transform:lowercase}
.logo-neon{color:#C4F135}.logo-purple{color:#9D97F5}.logo-primary{color:#6C63FF}
.top-badge{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:12px;letter-spacing:0.3em;color:#6C63FF;text-transform:uppercase;margin-bottom:12px}
.top-badge.light{color:#9D97F5}
.icon-big{font-size:72px;margin-bottom:24px}
.accent-line{width:60px;height:3px;background:#C4F135;margin:20px auto}
.accent-line.left{margin:20px 0}
.bullets{list-style:none;margin-top:20px}
.bullets li{display:flex;align-items:center;gap:12px;margin-bottom:12px;font-family:'DM Sans',sans-serif;font-weight:400;font-size:20px;color:rgba(255,255,255,0.85);text-align:left}
.bullets li.dark{color:#4A4A6A}
.bullet-dot{width:10px;height:10px;background:#C4F135;flex-shrink:0}
.split{display:flex;height:100%}
.split-left,.split-right{flex:1;display:flex;flex-direction:column;justify-content:center;padding:60px 48px}
.split-left{background:#2D2B55;color:#fff}
.split-right{background:#F8F8FF}
</style></head><body>

<!-- FEED 1: Chega de papelada -->
<div class="ad bg-primary">
  <div class="ad-content">
    <div class="icon-big">📋</div>
    <h1>Chega de papelada</h1>
    <div class="sub">Seu prontuário em 30 segundos com IA. Enquanto você atende, o Evolua documenta tudo.</div>
    <div class="cta">TESTAR GRÁTIS</div>
    <div class="logo-bottom logo-neon">evolua</div>
  </div>
</div>

<!-- FEED 2: CRM feito para fono -->
<div class="ad bg-surface">
  <div class="ad-content left">
    <div class="top-badge">📱 CRM ESPECIALIZADO</div>
    <h2 style="color:#1A1A2E">CRM feito para<br>fonoaudiólogas</h2>
    <div class="sub dark" style="font-size:20px">Prontuário, agenda, WhatsApp, cobrança e teleconsulta em um só lugar. Não é genérico — é feito para você.</div>
    <ul class="bullets">
      <li class="dark"><span class="bullet-dot"></span> Prontuário inteligente com IA</li>
      <li class="dark"><span class="bullet-dot"></span> WhatsApp nativo integrado</li>
      <li class="dark"><span class="bullet-dot"></span> Cobrança por PIX e cartão</li>
    </ul>
    <div class="cta" style="margin-top:32px">QUERO CONHECER</div>
    <div class="logo-bottom logo-primary">evolua</div>
  </div>
</div>

<!-- FEED 3: 60% fecham -->
<div class="ad bg-deep">
  <div class="ad-content">
    <h1>60% dos consultórios<br>fecham em 5 anos</h1>
    <div class="accent-line"></div>
    <div class="sub">Você não precisa ser estatística. Gestão financeira é o que separa consultórios que crescem dos que fecham.</div>
    <div class="cta">COMEÇAR GRÁTIS</div>
    <div class="logo-bottom logo-neon">evolua</div>
  </div>
</div>

<!-- FEED 4: WhatsApp integrado -->
<div class="ad bg-canvas">
  <div class="ad-content left">
    <div class="top-badge">💬 WHATSAPP NATIVO</div>
    <h2 style="color:#1A1A2E">Seu consultório<br>no WhatsApp</h2>
    <div class="sub dark" style="font-size:20px">Agenda, lembrete, cobrança e prontuário direto no WhatsApp dos seus pacientes. Tudo automatizado.</div>
    <div class="cta">SABER MAIS</div>
    <div class="logo-bottom logo-primary">evolua</div>
  </div>
</div>

<!-- FEED 5: Prontuário com IA -->
<div class="ad bg-primary">
  <div class="ad-content">
    <div class="icon-big">🤖</div>
    <h1>Prontuário em<br>30 segundos</h1>
    <div class="sub">Enquanto você foca no paciente, o Evolua documenta tudo. Laudos, evoluções e relatórios automáticos.</div>
    <div class="cta">TESTE GRÁTIS</div>
    <div class="logo-bottom logo-neon">evolua</div>
  </div>
</div>

<!-- FEED 6: Teleconsulta -->
<div class="ad bg-surface">
  <div class="ad-content left">
    <div class="top-badge">📹 TELECONSULTA</div>
    <h2 style="color:#1A1A2E">Teleconsulta nativa<br>sem complicação</h2>
    <div class="sub dark" style="font-size:20px">Atenda pacientes de qualquer lugar com videochamada integrada, agendamento sincronizado e prontuário compartilhado.</div>
    <ul class="bullets">
      <li class="dark"><span class="bullet-dot"></span> -40% de faltas</li>
      <li class="dark"><span class="bullet-dot"></span> Alcance outras cidades</li>
      <li class="dark"><span class="bullet-dot"></span> LGPD completa</li>
    </ul>
    <div class="cta" style="margin-top:24px">QUERO CONHECER</div>
    <div class="logo-bottom logo-primary">evolua</div>
  </div>
</div>

</body></html>`

  writeFileSync(resolve(adsDir, 'meta-ads-feed.html'), feed, 'utf-8')
  log('  ✓ meta-ads-feed.html (1080×1080, 6 ads)')
  return adsDir
}

// ─── 5. Generate Google Display Ads (1200×628) ─────────────────
function generateGoogleAds() {
  log('🔍 Gerando Google Ads HTML...')
  const googleDir = resolve(OUT, 'google-ads-html')
  if (!existsSync(googleDir)) mkdirSync(googleDir, { recursive: true })

  const content = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#E0DFEF;display:flex;flex-direction:column;align-items:center;gap:12px;padding:12px}
.ad{width:1200px;height:628px;display:flex;position:relative;overflow:hidden;border-radius:2px;flex-shrink:0}
.bg-primary{background:#6C63FF}.bg-deep{background:#2D2B55}.bg-surface{background:#FFFFFF}.bg-canvas{background:#F8F8FF}
.ad-content{display:flex;flex-direction:column;justify-content:center;padding:48px 56px;height:100%;position:relative;z-index:1}
.ad-row{display:flex;gap:32px;align-items:center;height:100%}
.ad-icon{flex-shrink:0;font-size:56px;width:100px;text-align:center}
.ad-text{flex:1}
h1{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:40px;line-height:1.15;letter-spacing:-0.03em;margin-bottom:8px}
h1.neon{color:#C4F135}h1.dark{color:#1A1A2E}h1.white{color:#FFFFFF}
p{font-family:'DM Sans',sans-serif;font-weight:400;font-size:18px;line-height:1.5;color:#4A4A6A;max-width:700px}
p.light{color:rgba(255,255,255,0.8)}p.white{color:#1A1A2E}
.cta{display:inline-block;background:#C4F135;color:#1A1A2E;font-family:'DM Sans',sans-serif;font-weight:700;font-size:16px;padding:14px 40px;border-radius:2px;margin-top:20px;letter-spacing:0.02em}
.cta.outline{background:transparent;border:2px solid #C4F135;color:#C4F135}
.logo{position:absolute;bottom:24px;right:36px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:16px;letter-spacing:-0.02em;text-transform:lowercase}
.logo.neon{color:#C4F135}.logo.primary{color:#6C63FF}.logo.grey{color:#9D97F5}
.url{font-family:'DM Sans',sans-serif;font-weight:400;font-size:13px;color:rgba(255,255,255,0.4);margin-top:8px}
.split{display:flex;height:100%;width:100%}
.split-left,.split-right{flex:1;display:flex;flex-direction:column;justify-content:center;padding:48px 40px}
.split-left{background:#2D2B55;color:#fff}
.split-right{background:#F8F8FF}
.bullets{list-style:none;margin-top:12px}
.bullets li{display:flex;align-items:center;gap:8px;margin-bottom:6px;font-family:'DM Sans',sans-serif;font-weight:400;font-size:15px;color:#4A4A6A}
.stat-row{display:flex;gap:24px;margin-top:16px}
.stat{text-align:center}
.stat-num{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:28px;color:#C4F135}
.stat-label{font-family:'DM Sans',sans-serif;font-weight:400;font-size:12px;color:rgba(255,255,255,0.5);text-transform:uppercase}
.badge-top{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:10px;letter-spacing:0.3em;color:#9D97F5;text-transform:uppercase;margin-bottom:8px}
</style></head><body>

<!-- GOOGLE 1: CRM para Fono -->
<div class="ad bg-primary">
  <div class="ad-content">
    <div style="display:flex;gap:32px;align-items:center">
      <div style="font-size:56px">📋</div>
      <div>
        <div class="badge-top">CRM ESPECIALIZADO</div>
        <h1 style="color:#FFFFFF">CRM para Fonoaudiólogas</h1>
        <p class="light">Prontuário com IA, WhatsApp integrado e gestão financeira. Teste grátis por 7 dias.</p>
        <div class="cta">TESTAR GRÁTIS</div>
        <div class="url">useevolua.com.br</div>
      </div>
    </div>
    <div class="logo neon">evolua</div>
  </div>
</div>

<!-- GOOGLE 2: Prontuário Digital -->
<div class="ad bg-surface">
  <div class="ad-row" style="padding:48px 56px;height:100%">
    <div class="ad-icon">📱</div>
    <div class="ad-text">
      <div class="badge-top" style="color:#6C63FF">PRONTUÁRIO DIGITAL</div>
      <h1 style="color:#1A1A2E">Prontuário em<br>30 segundos</h1>
      <p>Enquanto você atende, a IA documenta tudo. Laudo pronto em 2 cliques.</p>
      <ul class="bullets">
        <li>✓ Sem papelada</li>
        <li>✓ WhatsApp nativo</li>
        <li>✓ Cobrança automática</li>
      </ul>
      <div class="cta" style="margin-top:12px">COMEÇAR AGORA</div>
    </div>
  </div>
  <div class="logo primary">evolua</div>
</div>

<!-- GOOGLE 3: Gestão Financeira -->
<div class="ad bg-deep">
  <div class="ad-content">
    <div style="display:flex;gap:32px;align-items:center">
      <div style="font-size:56px">📊</div>
      <div>
        <h1 class="neon">60% fecham em 5 anos</h1>
        <p class="light">Não seja estatística. Gestão financeira inteligente com o Evolua.</p>
        <div class="stat-row">
          <div class="stat"><div class="stat-num">R$120</div><div class="stat-label">Sessão Média</div></div>
          <div class="stat"><div class="stat-num">80%</div><div class="stat-label">Menos Burocracia</div></div>
        </div>
        <div class="cta" style="margin-top:16px">QUERO SABER MAIS</div>
      </div>
    </div>
    <div class="logo neon">evolua</div>
  </div>
</div>

<!-- GOOGLE 4: WhatsApp + Agenda -->
<div class="ad bg-canvas">
  <div class="split">
    <div class="split-left">
      <div style="font-size:56px;margin-bottom:16px">💬</div>
      <h1 style="color:#C4F135">WhatsApp<br>integrado</h1>
      <p style="color:rgba(255,255,255,0.7);font-size:16px">Agenda, cobrança e lembretes automáticos</p>
    </div>
    <div class="split-right">
      <h2 style="font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:28px;color:#1A1A2E;margin-bottom:16px">Tudo que você precisa</h2>
      <ul class="bullets">
        <li><span style="color:#6C63FF;font-weight:700">✓</span> Lembrete automático</li>
        <li><span style="color:#6C63FF;font-weight:700">✓</span> Cobrança por PIX</li>
        <li><span style="color:#6C63FF;font-weight:700">✓</span> Prontuário compartilhado</li>
        <li><span style="color:#6C63FF;font-weight:700">✓</span> Confirmação de presença</li>
      </ul>
      <div class="cta" style="margin-top:16px">SABER MAIS</div>
    </div>
  </div>
  <div class="logo primary" style="bottom:20px;right:24px">evolua</div>
</div>

<!-- GOOGLE 5: Teleconsulta -->
<div class="ad bg-primary">
  <div class="ad-content">
    <div style="display:flex;gap:32px;align-items:center">
      <div style="font-size:56px">📹</div>
      <div>
        <h1 style="color:#FFFFFF">Teleconsulta<br>nativa e segura</h1>
        <p class="light">Atenda de qualquer lugar com videochamada integrada, agendamento sincronizado e prontuário compartilhado.</p>
        <div class="cta">QUERO CONHECER</div>
      </div>
    </div>
    <div class="logo neon">evolua</div>
  </div>
</div>

</body></html>`

  writeFileSync(resolve(googleDir, 'google-ads-display.html'), content, 'utf-8')
  log('  ✓ google-ads-display.html (1200×628, 5 ads)')
  return googleDir
}

// ─── 6. Playwright Screenshot: HTML sections → PNG ──────────────
function runPWScript(code) {
  const pwPath = resolve(OUT, `_pw-script-${Date.now()}.mjs`)
  writeFileSync(pwPath, code, 'utf-8')
  try {
    execSync(`node "${pwPath}"`, { cwd: ROOT, stdio: 'pipe', timeout: 60000 })
  } catch (e) {
    const stderr = e.stderr?.toString() || ''
    throw new Error(stderr.slice(0, 500))
  }
}

function toFileUrl(path) {
  const normalized = path.replace(/\\/g, '/')
  return 'file:///' + normalized.replace(/^\/?/, '')
}

function screenshotHTML(htmlFile, selector, outputDir, width, height) {
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true })
  const name = basename(htmlFile).replace('.html', '')
  const outPath = outputDir.replace(/\\/g, '/')

  const code = `
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: ${width}, height: ${height} } });
  const p = await ctx.newPage();
  await p.goto('${toFileUrl(htmlFile)}', { waitUntil: 'networkidle', timeout: 30000 });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(3000);

  const items = await p.$$('${selector}');
  if (items.length === 0) {
    console.log('NO_ITEMS for ${selector}');
    await p.screenshot({ path: '${outPath}/${name}.png', type: 'png' });
  } else {
    for (let i = 0; i < items.length; i++) {
      await items[i].screenshot({
        path: '${outPath}/${name}-' + (i + 1) + '.png',
        type: 'png',
      });
      console.log('OK ' + (i + 1));
    }
  }
  console.log('DONE:' + items.length);
  await b.close();
})().catch(e => { console.error('PW_ERR:', e.message); process.exit(1); });
`
  try {
    runPWScript(code)
  } catch (e) {
    log(`  ⚠️ Screenshot falhou: ${htmlFile}`)
  }
}

// ─── 7. Convert HTML → PDF ─────────────────────────────────────
function htmlToPDF(htmlFile, pdfPath) {
  const code = `
import { chromium } from 'playwright';
(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext();
  const p = await ctx.newPage();
  await p.goto('${toFileUrl(htmlFile)}', { waitUntil: 'networkidle', timeout: 30000 });
  await p.waitForTimeout(2000);
  await p.pdf({
    path: '${pdfPath.replace(/\\/g, '/')}',
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
  });
  console.log('PDF_OK');
  await b.close();
})().catch(e => { console.error('PDF_ERR:', e.message); process.exit(1); });
`
  try {
    runPWScript(code)
    return true
  } catch {
    return false
  }
}

// ─── 8. Generate .txt files ─────────────────────────────────────
function generateTexts() {
  log('📝 Gerando .txts...')
  const textsDir = resolve(OUT, 'texts')
  if (!existsSync(textsDir)) mkdirSync(textsDir, { recursive: true })

  writeFileSync(resolve(textsDir, 'legenda-instagram.txt'), `✨ Quer transformar sua clínica de fonoaudiologia?

O carrossel de hoje mostra 5 passos práticos para profissionalizar sua gestão, atrair mais pacientes e cuidar melhor de quem já te procura.

➡️ Deslize e salve para consultar depois

Qual desses passos você já aplica na sua clínica? Conta nos comentários!

#Fonoaudiologia #GestaoClinica #Fono #ClinicaDeFono #EvoluaCRM`, 'utf-8')

  writeFileSync(resolve(textsDir, 'linkedin-posts.txt'), readFileSync(resolve(ROOT, 'docs/content-assets/01-social-posts/linkedin-posts-julho-2026.html'), 'utf-8').slice(0, 200) + `...

(Conteúdos dos posts em formato visual nas PNGs anexadas)`, 'utf-8')

  writeFileSync(resolve(textsDir, 'legendas-stories.txt'), `STORY 1 - Chega de Papelada
Texto na tela: Chega de papelada. Seu prontuário em 30s.
CTA: TESTE GRÁTIS → useevolua.com.br/testar
---
STORY 2 - WhatsApp Nativo
Texto: Agenda + cobrança no WhatsApp.
CTA: SABER MAIS
---
STORY 3 - Economia de Tempo
Texto: +5h/semana devolvidas. Foco no paciente.
CTA: QUERO ECONOMIZAR
---
STORY 4 - Case Dra. Carla
Texto: "Nunca mais perdi paciente por falta de contato"
CTA: VER CASE
---
STORY 5 - 7 Dias Grátis
Texto: 7 dias grátis. Sem cartão. Configure em 5 min.
CTA: COMEÇAR AGORA
---
STORY 6 - Prova Social
Texto: +300 fonoaudiólogas já usam.
CTA: QUERO PARTICIPAR`, 'utf-8')

  return textsDir
}

// ─── 9. Package & Send ─────────────────────────────────────────
async function packageAndSend(dirs) {
  log('📦 Empacotando...')
  const packDir = resolve(OUT, `pack-${TIMESTAMP}`)
  if (existsSync(packDir)) rmSync(packDir, { recursive: true })
  mkdirSync(packDir, { recursive: true })

  let totalPngs = 0, totalPdfs = 0, totalTexts = 0

  for (const dir of dirs) {
    if (!existsSync(dir)) continue
    const subName = basename(dir)
    const subDir = resolve(packDir, subName)
    mkdirSync(subDir, { recursive: true })
    const files = readdirSync(dir)
    for (const f of files) {
      if (f.startsWith('_pw-') || f.startsWith('_fixed-')) continue
      const src = resolve(dir, f)
      const dest = resolve(subDir, f)
      try { cpSync(src, dest) } catch {}
      if (f.endsWith('.png')) totalPngs++
      if (f.endsWith('.pdf')) totalPdfs++
      if (f.endsWith('.txt')) totalTexts++
    }
  }

  execSync(`tar -czf "${relOut}/${PACK_NAME}.tar.gz" --force-local -C "${relOut}" "pack-${TIMESTAMP}"`, { cwd: ROOT, stdio: 'pipe' })
  execSync(`cp "${relOut}/${PACK_NAME}.tar.gz" "${relOut}/evolua-pack-latest.tar.gz"`, { cwd: ROOT, stdio: 'pipe' })

  const sizeKb = (readFileSync(resolve(ROOT, relOut, `${PACK_NAME}.tar.gz`)).length / 1024).toFixed(1)
  log(`✅ ${PACK_NAME}.tar.gz (${sizeKb} KB — ${totalPngs} PNGs, ${totalPdfs} PDFs, ${totalTexts} txts)`)

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) { log('⚠️ Sem RESEND_API_KEY'); return }

  log('📧 Enviando email...')
  const fileBuffer = readFileSync(resolve(ROOT, relOut, `${PACK_NAME}.tar.gz`))
  const base64Content = fileBuffer.toString('base64')

  const dirSummary = dirs.map(d => {
    const n = d.split('/').pop() || d.split('\\').pop()
    const files = existsSync(d) ? readdirSync(d).filter(f => !f.startsWith('_pw-') && !f.startsWith('_fixed-')) : []
    return `  • ${n}: ${files.length} arquivos`
  }).join('\n')

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: 'Evolua <noreply@useevolua.com.br>',
      to: 'contatouseevolua@gmail.com',
      subject: `📦 Conteúdo Evolua — ${TIMESTAMP} | ${totalPngs} PNGs + ${totalPdfs} PDFs + ${totalTexts} txts`,
      html: `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F8F8FF;font-family:'DM Sans',Arial,sans-serif">
<div style="max-width:580px;margin:24px auto;background:#FFFFFF;overflow:hidden">
  <div style="background:#2D2B55;padding:40px;text-align:center">
    <div style="font-family:'Space Grotesk',sans-serif;font-size:32px;font-weight:700;letter-spacing:-0.03em;color:#C4F135;margin-bottom:8px">evolua</div>
    <h1 style="font-family:'Space Grotesk',sans-serif;color:#fff;margin:0;font-size:20px;font-weight:600">Conteúdo Diário</h1>
    <p style="color:#9D97F5;margin:8px 0 0;font-size:13px">${today}</p>
  </div>
  <div style="padding:32px">
    <p style="color:#1A1A2E;margin:0 0 20px;line-height:1.6">Pack de conteúdo completo:</p>
    <pre style="background:#F8F8FF;border:1px solid #E0DFEF;border-radius:2px;padding:16px;font-family:'DM Sans',sans-serif;font-size:13px;color:#4A4A6A;line-height:1.6;margin:0">${dirSummary}</pre>
    <div style="background:#2D2B55;border-radius:2px;text-align:center;padding:20px;margin-top:20px">
      <p style="color:#C4F135;font-size:14px;font-weight:700;margin:0 0 4px">⬇ .tar.gz anexado</p>
      <p style="color:#9D97F5;font-size:12px;margin:0">${sizeKb} KB · ${totalPngs} PNGs · ${totalPdfs} PDFs · ${totalTexts} txts</p>
    </div>
  </div>
  <div style="background:#F8F8FF;padding:16px 32px;text-align:center;border-top:1px solid #E0DFEF">
    <p style="color:#8888AA;font-size:11px;margin:0">EVOLUA — Gestão Inteligente para Fonoaudiólogas</p>
  </div>
</div></body></html>`,
      text: `Conteúdo Evolua - ${TIMESTAMP}\n\n${totalPngs} PNGs · ${totalPdfs} PDFs · ${totalTexts} txts\n\nArquivo .tar.gz anexado.`,
      attachments: [{ filename: `${PACK_NAME}.tar.gz`, content: base64Content }],
    }),
  })

  if (res.ok) log(`✅ Email enviado! ID: ${(await res.json()).id}`)
  else log(`❌ Erro email: ${res.status} ${await res.text()}`)
}

// ─── Main ──────────────────────────────────────────────────────
async function main() {
  // 1. Fix all existing HTML files
  fixAllIcons()

  // 2. Generate Carrossel + Infográficos v5.0 (overwrites originals)
  generateCarrossel()
  generateInfograficos()

  // 3. Convert ebooks/infográficos to PDF
  log('📄 Convertendo ebooks/infográficos para PDF...')
  const pdfDir = resolve(OUT, 'pdfs')
  if (!existsSync(pdfDir)) mkdirSync(pdfDir, { recursive: true })
  const htmlFiles = [
    'docs/content-assets/05-lead-magnets/ebook-whatsapp-profissional.html',
    'docs/content-assets/05-lead-magnets/ebook-mkt-digital-fono.html',
    'docs/content-assets/05-lead-magnets/infraco-estrategia-precos.html',
    'docs/content-assets/05-lead-magnets/infraco-atendimento-humanizado.html',
  ]
  for (const f of htmlFiles) {
    const fp = resolve(ROOT, f)
    if (!existsSync(fp)) continue
    const name = f.split('/').pop().replace('.html', '')
    const pdfPath = resolve(pdfDir, `${name}.pdf`)
    if (htmlToPDF(fp, pdfPath)) log(`  ✓ ${name}.pdf`)
    else log(`  ⚠️ Falha: ${name}`)
  }

  // 4. Generate new visual HTML templates
  const storiesDir = generateStories()
  const linkedinDir = generateLinkedIn()
  const adsDir = generateMetaAds()
  const googleDir = generateGoogleAds()

  // 5. Screenshot EVERYTHING to PNG
  log('📸 Screenshot de todos os visuais...')

  // Carrossel (5 slides)
  const carrosselPath = resolve(ROOT, 'docs/content-assets/03-instagram-feed/carrossel-5-passos.html')
  const slidesDir = resolve(OUT, 'slides-carrossel')
  if (existsSync(carrosselPath)) {
    log('  Carrossel Instagram...')
    screenshotHTML(carrosselPath, '.slide', slidesDir, 1080, 1080)
  }

  // Stories (6 slides, 1080x1920)
  const storyPNGDir = resolve(OUT, 'slides-stories')
  log('  Stories Instagram...')
  screenshotHTML(resolve(storiesDir, 'stories.html'), '.story', storyPNGDir, 1080, 1920)

  // LinkedIn (6 posts, 1200x627)
  const linkedinPNGDir = resolve(OUT, 'slides-linkedin')
  log('  LinkedIn posts...')
  screenshotHTML(resolve(linkedinDir, 'linkedin-posts.html'), '.post', linkedinPNGDir, 1200, 627)

  // Meta Ads Feed (6 ads, 1080x1080)
  const metaFeedPNGDir = resolve(OUT, 'slides-meta-feed')
  log('  Meta Ads Feed...')
  screenshotHTML(resolve(adsDir, 'meta-ads-feed.html'), '.ad', metaFeedPNGDir, 1080, 1080)

  // Google Display (5 ads, 1200x628)
  const googlePNGDir = resolve(OUT, 'slides-google-display')
  log('  Google Display Ads...')
  screenshotHTML(resolve(googleDir, 'google-ads-display.html'), '.ad', googlePNGDir, 1200, 628)

  // 6. Generate text files
  const textsDir = generateTexts()

  // 7. Package & Send
  const allDirs = [pdfDir, slidesDir, storyPNGDir, linkedinPNGDir, metaFeedPNGDir, googlePNGDir, textsDir]
  await packageAndSend(allDirs)
}

main().catch(e => { console.error('[FATAL]', e); process.exit(1) })
