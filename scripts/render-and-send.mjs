#!/usr/bin/env node
/**
 * Render & Send — Pipeline de conteúdo Evolua
 *
 * - Converte ebooks HTML → PDF via Playwright
 * - Screenshot carrossel → PNGs (1080x1080)
 * - Gera .txts (legendas, LinkedIn, Ads)
 * - Empacota .tar.gz
 * - Envia email com anexo via Resend
 *
 * Uso:
 *   node scripts/render-and-send.mjs                         # full pipeline
 *   node scripts/render-and-send.mjs --send-only             # reenviar último pack
 *   node scripts/render-and-send.mjs --dry-run               # não envia email
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync, cpSync, readdirSync, rmSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT = resolve(ROOT, 'scripts', 'content-pipeline', 'output')
const args = process.argv.slice(2)
const SEND_ONLY = args.includes('--send-only')
const DRY_RUN = args.includes('--dry-run')
const TIMESTAMP = new Date().toISOString().slice(0, 10)
const PACK_NAME = `evolua-${TIMESTAMP}`

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`) }

// ─── Helpers: gera script Playwright inline ──────────────────────
function writePWScript(code) {
  const pwPath = resolve(OUT, `_pw-script-${TIMESTAMP}.mjs`)
  writeFileSync(pwPath, code.replace(/\${ROOT}/g, ROOT.replace(/\\/g, '/')).replace(/\${OUT}/g, OUT.replace(/\\/g, '/')), 'utf-8')
  return pwPath
}

function runPW(pwPath, timeoutSec = 30) {
  execSync(`node "${pwPath}"`, {
    cwd: ROOT, stdio: 'pipe', timeout: timeoutSec * 1000,
  })
}

// ─── 1. Ebooks HTML → PDF ────────────────────────────────────────
function convertEbooksToPDF() {
  log('📄 Convertendo ebooks para PDF...')
  const pdfDir = resolve(OUT, 'pdfs')
  if (!existsSync(pdfDir)) mkdirSync(pdfDir, { recursive: true })

  const ebooks = [
    'docs/content-assets/05-lead-magnets/ebook-whatsapp-profissional.html',
    'docs/content-assets/05-lead-magnets/ebook-mkt-digital-fono.html',
    'docs/content-assets/05-lead-magnets/infraco-estrategia-precos.html',
    'docs/content-assets/05-lead-magnets/infraco-atendimento-humanizado.html',
  ]

  for (const ebook of ebooks) {
    const fp = resolve(ROOT, ebook)
    if (!existsSync(fp)) { log(`⚠️  Não encontrado: ${ebook}`); continue }
    const name = ebook.split('/').pop().replace('.html', '')
    const pdfPath = resolve(pdfDir, `${name}.pdf`)

    const pwCode = `
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext();
  const p = await ctx.newPage();
  const htmlPath = path.resolve('${ebook}');
  await p.goto('file://' + htmlPath, { waitUntil: 'networkidle', timeout: 30000 });
  await p.waitForTimeout(2000);
  await p.pdf({
    path: '${pdfPath.replace(/\\/g, '/')}',
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
  });
  console.log('PDF_OK:' + path.basename(htmlPath));
  await b.close();
})().catch(e => { console.error('PDF_ERR:' + e.message); process.exit(1); });
`
    const pwPath = writePWScript(pwCode)
    try {
      runPW(pwPath, 30)
      log(`  ✓ ${name}.pdf`)
    } catch (e) {
      log(`  ⚠️ Falha PDF: ${name}`)
    }
  }

  const pdfs = readdirSync(pdfDir).filter(f => f.endsWith('.pdf'))
  log(`✅ ${pdfs.length} PDFs gerados`)
  return pdfDir
}

// ─── 2. Carrossel HTML → PNGs ───────────────────────────────────
async function screenshotCarrossel(htmlPath) {
  log('📸 Capturando slides...')
  const slidesDir = resolve(OUT, `slides-${TIMESTAMP}`)
  if (!existsSync(slidesDir)) mkdirSync(slidesDir, { recursive: true })
  if (!existsSync(htmlPath)) { log('⚠️ Carrossel não encontrado'); return slidesDir }

  const pwCode = `
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1080, height: 1080 } });
  const p = await ctx.newPage();
  await p.goto('file://' + path.resolve('${relative(ROOT, htmlPath).replace(/\\/g, '/')}'), { waitUntil: 'networkidle', timeout: 30000 });
  await p.waitForTimeout(3000);

  const slides = await p.$$('.slide');
  const count = slides.length || 1;
  if (slides.length === 0) {
    // Full page as single image
    await p.screenshot({ path: '${slidesDir.replace(/\\/g, '/')}/slide-1.png', fullPage: true });
    console.log('OK slide 1 (full page)');
  } else {
    for (let i = 0; i < slides.length; i++) {
      await slides[i].screenshot({
        path: '${slidesDir.replace(/\\/g, '/')}/slide-' + (i + 1) + '.png',
      });
      console.log('OK slide ' + (i + 1));
    }
  }
  console.log('DONE:' + (slides.length || 1));
  await b.close();
})().catch(e => { console.error('PW_ERR:', e.message); process.exit(1); });
`
  const pwPath = writePWScript(pwCode)
  try {
    runPW(pwPath, 45)
  } catch (e) {
    log('⚠️ Playwright falhou nos slides')
  }

  const pngs = readdirSync(slidesDir).filter(f => f.endsWith('.png'))
  log(`✅ ${pngs.length} PNGs em ${slidesDir}`)
  return slidesDir
}

// ─── 3. .txt files ──────────────────────────────────────────────
function createTextFiles() {
  log('📝 Criando .txts...')
  const textsDir = resolve(OUT, `texts-${TIMESTAMP}`)
  if (!existsSync(textsDir)) mkdirSync(textsDir, { recursive: true })

  writeFileSync(resolve(textsDir, 'legenda-instagram.txt'), `✨ Quer transformar sua clínica de fonoaudiologia?

O carrossel de hoje mostra 5 passos práticos para profissionalizar sua gestão, atrair mais pacientes e cuidar melhor de quem já te procura.

➡️ Deslize e salve para consultar depois

Qual desses passos você já aplica na sua clínica? Conta nos comentários!

#Fonoaudiologia #GestaoClinica #Fono #EmpreendedorismoFono #ClinicaDeFono #Fonoaudiologa #MarketingParaFono #EvoluaCRM`, 'utf-8')

  writeFileSync(resolve(textsDir, 'linkedin-posts.txt'), `POST 1: Diagnóstico Financeiro
---
60% dos consultórios de fonoaudiologia fecham em até 5 anos (Sebrae).

O motivo? Falta de gestão financeira.

Você sabe qual é o custo real de cada sessão?

• Aluguel + contas
• Material clínico
• Impostos
• Software/ferramentas
• Tempo administrativo

Se você cobra R$120 por sessão mas gasta 30min com papelada, seu lucro real é menor do que parece.

Um CRM especializado corta o tempo administrativo em 80%.

#Fonoaudiologia #GestaoClinica #EmpreendedorismoFono

---
POST 2: Marketing Digital Ético
---
Muita fonoaudióloga tem medo de postar e levar advertência do Conselho.

Vamos esclarecer o que o CFFA permite:

✅ PERMITIDO:
• Posts educativos
• Cases sem identificar paciente
• Divulgação de especialidades
• Conteúdo sobre gestão

❌ VEDADO:
• Prometer cura
• Sensacionalismo
• Imagem de paciente sem autorização

O digital é seu maior aliado — desde que feito com ética.

#CFFA #MarketingParaFono #Fonoaudiologia

---
POST 3: Automação com IA
---
Uma fonoaudióloga atende em média 6 pacientes por dia.

Se cada prontuário leva 10min: 1h/dia em burocracia. 20h/mês. 240h/ano.

Agora imagina:
• Prontuário preenchido por IA
• Laudo pronto em 2 cliques
• Lembrete automático no WhatsApp
• Relatório financeiro em segundos

Isso não é futuro. É o que o Evolua já faz.

#IAparaFono #Fonoaudiologia #GestaoClinica

---
POST 4: Teleconsulta
---
A teleconsulta veio pra ficar. Mas tem regras:

1. Ambiente adequado
2. Consentimento do paciente
3. Plataforma com LGPD
4. Registro como teleconsulta
5. Cuidado com pacientes de voz/audição

Benefícios reais:
• Redução de faltas em 40%
• Alcance outras cidades
• Mais flexibilidade

#Teleconsulta #Fonoaudiologia #SaudeDigital

---
POST 5: Precificação
---
Essa é a pergunta que mais ouvimos: quanto cobrar por sessão?

Para precificar direito:

1. CUSTOS FIXOS: aluguel, contas, material, ferramentas
2. CUSTOS VARIÁVEIS: impostos (~15%), taxa de cartão (~3%)
3. SEU TEMPO: 50min atendimento + 10min prontuário

Fórmula: (Custos Mensais ÷ Pacientes/Dia ÷ Dias) + Margem + Impostos

#Precificacao #Fonoaudiologia #GestaoFinanceira

---
POST 6: Case Dra. Carla
---
Dra. Carla M., fonoaudióloga em SP, atendia 25 pacientes por semana e passava 10h em burocracia.

Com o Evolua:
• Prontuário: de 10min para 30 segundos
• Agendamento: zero ligações
• Faturamento: ticket médio +20%

Resultado: 4h por semana DEVOLVIDAS.

"O Evolua me deu meu tempo de volta."

#CaseDeSucesso #Fonoaudiologia #Evolua`, 'utf-8')

  writeFileSync(resolve(textsDir, 'ads-criativos-meta.txt'), `FORMATO: FEED (1080x1080px) — Imagem estática ou vídeo até 60s
---
FEED 1 - "Chega de papelada"
Headline: Chega de papelada. Seu prontuário em 30 segundos.
Body: Enquanto você atende, o Evolua preenche o prontuário com IA. Laudo pronto em 2 cliques. WhatsApp integrado. Teste grátis por 7 dias.
CTA: Testar Grátis
Imagem sugerida: Dashboard do Evolua mostrando prontuário sendo preenchido
---
FEED 2 - "CRM feito para fono"
Headline: CRM feito para fonoaudiólogas
Body: Prontuário, agenda, WhatsApp, cobrança e teleconsulta em um só lugar. Não é genérico — é feito para você.
CTA: Quero Conhecer
Imagem sugerida: Fonoaudióloga usando o app no celular
---
FEED 3 - "60% fecham em 5 anos"
Headline: 60% dos consultórios fecham em 5 anos. Você não precisa ser estatística.
Body: Gestão financeira é o que separa consultórios que crescem dos que fecham. Evolua te ajuda a não ser só mais uma.
CTA: Começar Grátis
Imagem sugerida: Gráfico de crescimento com a marca Evolua
---
FEED 4 - "WhatsApp integrado"
Headline: Seu consultório no WhatsApp
Body: Agenda, lembrete, cobrança e prontuário direto no WhatsApp dos seus pacientes. Tudo automatizado.
CTA: Saber Mais
Imagem sugerida: Print de conversa no WhatsApp com lembretes automáticos
---
FEED 5 - "Prontuário com IA"
Headline: Prontuário em 30 segundos com IA
Body: Enquanto você foca no paciente, o Evolua documenta tudo. Laudos, evoluções e relatórios automáticos.
CTA: Teste Grátis
Imagem sugerida: Antes/depois do tempo gasto com burocracia
---
FEED 6 - "Teleconsulta inclusa"
Headline: Teleconsulta nativa e sem complicação
Body: Atenda pacientes de qualquer lugar com videochamada integrada, agendamento sincronizado e prontuário compartilhado.
CTA: Quero Conhecer
Imagem sugerida: Tela de videochamada com paciente
---
FORMATO: STORY (1080x1920px) — Vídeo 15s ou imagem estática vertical
---
STORY 1 - Prontuário 30s
Headline (texto na tela): Prontuário em 30 segundos
Subtexto: Enquanto você atende, a IA documenta tudo.
CTA: TESTE GRÁTIS →
CTA Link: useevolua.com.br/testar
---
STORY 2 - WhatsApp integrado
Headline: WhatsApp do paciente + seu CRM
Subtexto: Agenda, cobrança e prontuário no mesmo lugar.
CTA: SAIBA MAIS
---
STORY 3 - Economia de tempo
Headline: +5h/semana devolvidas
Subtexto: Chega de papelada. Foco no que importa: o paciente.
CTA: QUERO ECONOMIZAR
---
STORY 4 - Case real
Headline: "Nunca mais perdi paciente por falta de contato"
Subtexto: Dra. Carla M. — Fonoaudióloga há 8 anos
CTA: VER CASE
---
STORY 5 - Oferta
Headline: 7 dias grátis. Sem compromisso.
Subtexto: Teste o Evolua completo. Configure em 5 minutos.
CTA: COMEÇAR AGORA
---
STORY 6 - Prova social
Headline: +300 fonoaudiólogas já usam
Subtexto: Junte-se à maior comunidade de fonoaudiologia do Brasil.
CTA: QUERO PARTICIPAR`, 'utf-8')

  writeFileSync(resolve(textsDir, 'ads-config.txt'), `CONFIGURAÇÃO DE CAMPANHA - EVOLUA
Data: ${new Date().toLocaleDateString('pt-BR')}
Responsável: Equipe Marketing Evolua
Objetivo: Aquisição de leads (fonoaudiólogas) para teste grátis do CRM

---
META ADS — FEED + STORIES
Budget: R$ 80-120/dia (total Meta)
Público: Fonoaudiólogas, 25-50 anos, Brasil
Segmentação: Interesses > Fonoaudiologia, Saúde, Clínicas, Reabilitação, Educação Especial
Exclusão: Quem já visitou o site (pixel) — exceto remarketing
Agenda: 7 dias corridos, das 06h às 23h
Formatos:
  • Feed: Imagem estática 1080x1080px (JPG/PNG, <30MB) ou vídeo 4:5 até 60s
  • Stories: Vídeo vertical 9:16 (1080x1920px), 15s ideal, máximo 60s
  • Reels: Vídeo 9:16 (1080x1920px), 15-30s, com música tendência
Placements: Feed + Stories + Reels (otimizado automático)
CTA disponíveis: Testar Grátis / Quero Conhecer / Começar Agora / Saber Mais
Links: useevolua.com.br/testar (com UTM)
Pixel: Evento Lead + PageView + InitiateCheckout
Campanhas:
  • Prospecção (CBO) — 70% budget
  • Remarketing (site + engajamento) — 30% budget

---
GOOGLE ADS — PESQUISA + DISPLAY + PMAX
Budget: R$ 100-150/dia (total Google)
Agenda: 7 dias corridos, 24h

REDE DE PESQUISA (40% budget):
  Formatos: Texto expansível (3 headlines x 30 chars + 2 descrições x 90 chars)
  Palavras-chave:
    • CRM fonoaudiologia, sistema para fonoaudiólogo, prontuário digital fono
    • software clínica fonoaudiologia, agenda fonoaudióloga
    • gestão de clínica de fonoaudiologia
    • [marca] Evolua CRM
  Correspondência: Exata + Frase + Modificada
  Extensões: Sitelinks (+5 links), Callout (+3 textos), Snippet de estrutura (CRM), Ligação
  Headlines (30 chars): CRM para Fono | Prontuário Digital | Gestão de Clínica | Teste Grátis |
  Descrições (90 chars): O CRM feito para fonoaudiólogas. Prontuário, agenda e WhatsApp em um só lugar. Teste grátis 7 dias.

REDE DE DISPLAY (30% budget):
  Formatos: Responsivo (logotipo + imagens 1200x628 + headlines + descrições)
  Segmentação: Palavras-chave + Público-alvo + Tópicos (Saúde, Negócios)
  Exclusão: Sites de notícias gerais, conteúdo sensível

PMAX (30% budget):
  Assets: Até 20 imagens + 5 logotipos + 5 vídeos curtos
  Grupos de produtos: CRM, Prontuário, Gestão, WhatsApp

---
YOUTUBE ADS — IN-STREAM + BUMPER
Budget: R$ 60-80/dia (separado ou incluso no Google Ads)
Agenda: 7 dias, segmentação por canal de fonoaudiologia + público-alvo

IN-STREAM SKIPPABLE (TrueView):
  • Formato: Vídeo 16:9 (1920x1080px), duração 15-30s (ideal: 20s)
  • Call-to-action nos 5s finais
  • Headline (texto do anúncio): até 30 chars
  • CTA: Testar Grátis / Saiba Mais
  • Script 20s: [0-5s] "Você perde horas com papelada?"
                      [5-15s] "O Evolua é o CRM que preenche prontuário com IA, agenda pelo WhatsApp e cobra automaticamente."
                      [15-20s] "Teste grátis por 7 dias. Link na descrição."

BUMPER (não pulável, 6s):
  • Formato: Vídeo 16:9 (1920x1080px), exatos 6s
  • Texto na tela: "CRM para Fono. Teste Grátis."
  • Script 6s: "CRM para fonoaudióloga. Teste grátis no evolua.com.br"
  • Sem CTA clicável — usa card ou tela final

IN-STREAM NON-SKIPPABLE (15s):
  • Formato: Vídeo 16:9 (1920x1080px), exatos 15s
  • Script 15s: [0-5s] "Chega de papelada no seu consultório."
                      [5-12s] "Prontuário com IA, WhatsApp integrado, teleconsulta e gestão financeira."
                      [12-15s] "Teste grátis. Evolua CRM."
  • CTA: Saiba Mais (sobreposição)

---
KPIS
  Meta: CPL ≤ R$8 | CTR > 2.5% | Taxa de Conversão Lead→Teste > 3%
  Google: CTR > 3% | CPC < R$3 | Taxa de Conversão > 4%
  YouTube: Taxa de visualização > 25% (instream) | Lembrança > 50% (bumper)
  Geral: Custo por lead qualificado < R$12

UTMs: utm_source=meta&utm_medium=cpc&utm_campaign=evolua_${TIMESTAMP}
TESTE A/B: 3 variações de criativo por anúncio, 1 variação de público`, 'utf-8')

  writeFileSync(resolve(textsDir, 'post-instagram-educativo.txt'), `📌 DICA RÁPIDA: Como montar seu plano de tratamento em 3 etapas

1. ANAMNESE COMPLETA
Entenda histórico, queixas e expectativas do paciente.
Dados objetivos + percepção do paciente.

2. AVALIAÇÃO DIRECIONADA
Testes específicos para a queixa principal.
Use protocolos validados (ABFW, TDDH, etc).

3. PLANO PERSONALIZADO
Metas claras e mensuráveis.
Prazos realistas.
Envolvimento da família.

💡 Com o Evolua, você monta o plano em 2 minutos com templates inteligentes.

#Fonoaudiologia #PlanodeTratamento #ClinicaFono #GestaoClinica #EvoluaCRM`, 'utf-8')

  log(`✅ ${readdirSync(textsDir).length} .txts em ${textsDir}`)
  return textsDir
}

// ─── 4. Package & Send ──────────────────────────────────────────
async function packageAndSend(pdfDir, slidesDir, textsDir) {
  log('📦 Empacotando...')
  const packDir = resolve(OUT, `pack-${TIMESTAMP}`)
  if (existsSync(packDir)) rmSync(packDir, { recursive: true })
  mkdirSync(packDir, { recursive: true })

  // PDFs
  if (existsSync(pdfDir)) {
    const pdfs = readdirSync(pdfDir).filter(f => f.endsWith('.pdf'))
    for (const f of pdfs) cpSync(resolve(pdfDir, f), resolve(packDir, f))
  }

  // PNGs
  if (existsSync(slidesDir)) {
    const slides = readdirSync(slidesDir).filter(f => f.endsWith('.png'))
    for (const f of slides) cpSync(resolve(slidesDir, f), resolve(packDir, f))
  }

  // .txts
  if (existsSync(textsDir)) {
    const texts = readdirSync(textsDir).filter(f => f.endsWith('.txt'))
    for (const f of texts) cpSync(resolve(textsDir, f), resolve(packDir, f))
  }

  // Tar (--force-local for Windows MSYS2 compat)
  const relOut = relative(ROOT, OUT)
  execSync(`tar -czf "${relOut}/${PACK_NAME}.tar.gz" --force-local -C "${relOut}" "pack-${TIMESTAMP}"`, { cwd: ROOT, stdio: 'pipe' })
  execSync(`cp "${relOut}/${PACK_NAME}.tar.gz" "${relOut}/evolua-pack-latest.tar.gz"`, { cwd: ROOT, stdio: 'pipe' })

  const tarPath = resolve(ROOT, relOut, `${PACK_NAME}.tar.gz`)
  const sizeKb = (readFileSync(tarPath).length / 1024).toFixed(1)
  log(`✅ ${PACK_NAME}.tar.gz (${sizeKb} KB)`)

  if (DRY_RUN) { log('🏁 Dry-run — email não enviado'); return }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) { log('⚠️ Sem RESEND_API_KEY'); return }

  log('📧 Enviando email...')
  const fileBuffer = readFileSync(tarPath)
  const base64Content = fileBuffer.toString('base64')

  const pdfList = existsSync(pdfDir) ? readdirSync(pdfDir).filter(f => f.endsWith('.pdf')) : []
  const slideList = existsSync(slidesDir) ? readdirSync(slidesDir).filter(f => f.endsWith('.png')) : []
  const textList = existsSync(textsDir) ? readdirSync(textsDir).filter(f => f.endsWith('.txt')) : []

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const emailHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8F8FF;font-family:'DM Sans',Arial,sans-serif">
<div style="max-width:580px;margin:24px auto;background:#FFFFFF;overflow:hidden">
  <div style="background:#2D2B55;padding:40px;text-align:center">
    <div style="font-family:'Space Grotesk',sans-serif;font-size:32px;font-weight:700;letter-spacing:-0.03em;color:#C4F135;margin-bottom:8px">evolua</div>
    <h1 style="font-family:'Space Grotesk',sans-serif;color:#fff;margin:0;font-size:20px;font-weight:600">Conteúdo Diário</h1>
    <p style="color:#9D97F5;margin:8px 0 0;font-size:13px">${today}</p>
  </div>
  <div style="padding:32px">
    <p style="font-size:15px;line-height:1.6;color:#1A1A2E;margin:0 0 20px">O pack de conteúdo de hoje está pronto!</p>
    ${pdfList.length ? `<div style="background:#F8F8FF;border:1px solid #E0DFEF;border-radius:2px;padding:16px;margin-bottom:12px">
      <div style="font-family:'Space Grotesk',sans-serif;font-size:10px;font-weight:700;color:#6C63FF;letter-spacing:0.3em;text-transform:uppercase;margin-bottom:8px">📄 E-books / Infográficos (PDF)</div>
      <ul style="font-size:12px;color:#4A4A6A;margin:0;padding-left:20px">${pdfList.map(f => `<li>${f}</li>`).join('')}</ul>
    </div>` : ''}
    ${slideList.length ? `<div style="background:#F8F8FF;border:1px solid #E0DFEF;border-radius:2px;padding:16px;margin-bottom:12px">
      <div style="font-family:'Space Grotesk',sans-serif;font-size:10px;font-weight:700;color:#6C63FF;letter-spacing:0.3em;text-transform:uppercase;margin-bottom:8px">📸 Instagram (PNG)</div>
      <ul style="font-size:12px;color:#4A4A6A;margin:0;padding-left:20px">${slideList.map(f => `<li>${f}</li>`).join('')}</ul>
    </div>` : ''}
    ${textList.length ? `<div style="background:#F8F8FF;border:1px solid #E0DFEF;border-radius:2px;padding:16px;margin-bottom:12px">
      <div style="font-family:'Space Grotesk',sans-serif;font-size:10px;font-weight:700;color:#6C63FF;letter-spacing:0.3em;text-transform:uppercase;margin-bottom:8px">📝 Textos (.txt)</div>
      <ul style="font-size:12px;color:#4A4A6A;margin:0;padding-left:20px">${textList.map(f => `<li>${f}</li>`).join('')}</ul>
    </div>` : ''}
    <div style="background:#2D2B55;border-radius:2px;text-align:center;padding:16px;margin-top:20px">
      <p style="color:#C4F135;font-size:13px;font-weight:700;margin:0">⬇ .tar.gz anexado</p>
      <p style="color:#9D97F5;font-size:11px;margin:4px 0 0">${sizeKb} KB</p>
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
      subject: `📦 Conteúdo Evolua — ${TIMESTAMP} | PDFs + PNGs + Textos`,
      html: emailHtml,
      text: `Conteúdo Evolua - ${TIMESTAMP}\n\nPDFs: ${pdfList.length}\nSlides: ${slideList.length}\nTextos: ${textList.length}\n\nArquivo anexado.`,
      attachments: [{ filename: `${PACK_NAME}.tar.gz`, content: base64Content }],
    }),
  })

  if (res.ok) {
    const data = await res.json()
    log(`✅ Email enviado! ID: ${data.id}`)
  } else {
    log(`❌ Erro email: ${res.status} ${await res.text()}`)
  }
}

// ─── 5. Fix ebook icons (emoji fallback) ──────────────────────
function fixEbookIcons() {
  log('🔧 Corrigindo ícones nos ebooks...')
  const iconMap = {
    'badge': '📋', 'grid_view': '📱', 'reply': '↩️', 'lightbulb': '💡',
    'check_circle': '✅', 'cancel': '❌', 'gavel': '⚖️', 'warning': '⚠️',
    'schedule': '⏰', 'trending_up': '📈', 'bar_chart': '📊',
    'handshake': '🤝', 'payments': '💳', 'auto_awesome': '✨',
    'rocket_launch': '🚀', 'compare_arrows': '🔄', 'check': '✓',
    'menu_book': '📖', 'campaign': '📢', 'info': 'ℹ️',
    'home_health': '🏥', 'chat': '💬', 'attach_money': '💰',
    'favorite': '❤️', 'download': '⬇️', 'assignment': '📝',
    'description': '📄', 'groups': '👥', 'psychology': '🧠',
    'speed': '⚡', 'star': '⭐', 'visibility': '👁️',
    'phone': '📞', 'email': '📧', 'calendar_month': '📅',
    'person': '👤', 'settings': '⚙️', 'exit_to_app': '🚪',
    'play_circle': '▶️', 'pause_circle': '⏸️', 'stop_circle': '⏹️',
  }

  const ebooks = [
    'docs/content-assets/05-lead-magnets/ebook-whatsapp-profissional.html',
    'docs/content-assets/05-lead-magnets/ebook-mkt-digital-fono.html',
    'docs/content-assets/05-lead-magnets/infraco-estrategia-precos.html',
    'docs/content-assets/05-lead-magnets/infraco-atendimento-humanizado.html',
  ]

  for (const ebook of ebooks) {
    const fp = resolve(ROOT, ebook)
    if (!existsSync(fp)) continue
    let content = readFileSync(fp, 'utf-8')

    if (content.includes('mat-icon')) {
      content = content.replace(
        /<span class="mat-icon">(\w+)<\/span>/g,
        (match, iconName) => {
          const emoji = iconMap[iconName] || '•'
          return `<span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;font-size:16px;flex-shrink:0">${emoji}</span>`
        }
      )
      writeFileSync(fp, content, 'utf-8')
      log(`  ✓ ${ebook.split('/').pop()}`)
    }
  }
}

// ─── Main ──────────────────────────────────────────────────────
async function main() {
  if (SEND_ONLY) {
    log('📤 Reenviando último pack...')
    const latest = resolve(OUT, 'evolua-pack-latest.tar.gz')
    if (!existsSync(latest)) { log('⚠️ Nenhum pack anterior'); return }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) { log('⚠️ Sem RESEND_API_KEY'); return }

    const fileBuffer = readFileSync(latest)
    const base64Content = fileBuffer.toString('base64')
    const sizeKb = (fileBuffer.length / 1024).toFixed(1)

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'Evolua <noreply@useevolua.com.br>',
        to: 'contatouseevolua@gmail.com',
        subject: `📦 Conteúdo Evolua — reenvio | ${TIMESTAMP}`,
        html: `<div style="font-family:'DM Sans',sans-serif;max-width:580px;margin:24px auto;background:#F8F8FF;padding:32px">
          <h2 style="font-family:'Space Grotesk',sans-serif;color:#1A1A2E">Reenvio do pack</h2>
          <p style="color:#4A4A6A">Conteúdo Evolua (${sizeKb} KB).</p>
        </div>`,
        text: `Reenvio do pack Evolua (${sizeKb} KB).`,
        attachments: [{ filename: `evolua-pack-latest.tar.gz`, content: base64Content }],
      }),
    })

    if (res.ok) log(`✅ Reenvio OK! ID: ${(await res.json()).id}`)
    else log(`❌ Erro: ${res.status} ${await res.text()}`)
    return
  }

  fixEbookIcons()
  const pdfDir = convertEbooksToPDF()

  const carrosselPath = resolve(ROOT, 'docs/content-assets/03-instagram-feed/carrossel-5-passos.html')
  const slidesDir = existsSync(carrosselPath) ? await screenshotCarrossel(carrosselPath) : resolve(OUT, `slides-${TIMESTAMP}`)
  if (!existsSync(slidesDir)) mkdirSync(slidesDir, { recursive: true })

  const textsDir = createTextFiles()
  await packageAndSend(pdfDir, slidesDir, textsDir)
}

main().catch(e => { console.error('[FATAL]', e); process.exit(1) })
