import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '..', 'public', 'lead-magnets')

mkdirSync(OUT, { recursive: true })
for (const f of readdirSync(OUT)) rmSync(resolve(OUT, f))

const W = 612
const H = 792
const M = 50
const CW = W - M * 2

const C = {
  primary: rgb(176 / 255, 137 / 255, 251 / 255),
  primaryLight: rgb(218 / 255, 209 / 255, 255 / 255),
  neon: rgb(161 / 255, 226 / 255, 79 / 255),
  cyan: rgb(67 / 255, 194 / 255, 211 / 255),
  orange: rgb(255 / 255, 161 / 255, 97 / 255),
  deep: rgb(12 / 255, 13 / 255, 22 / 255),
  deepMid: rgb(30 / 255, 30 / 255, 50 / 255),
  canvas: rgb(245 / 255, 243 / 255, 255 / 255),
  ink: rgb(14 / 255, 14 / 255, 26 / 255),
  inkSoft: rgb(74 / 255, 74 / 255, 106 / 255),
  white: rgb(1, 1, 1),
  outline: rgb(224 / 255, 223 / 255, 239 / 255),
  chart1: rgb(176 / 255, 137 / 255, 251 / 255),
  chart2: rgb(161 / 255, 226 / 255, 79 / 255),
  chart3: rgb(67 / 255, 194 / 255, 211 / 255),
  chart4: rgb(255 / 255, 161 / 255, 97 / 255),
  alertBg: rgb(255 / 255, 240 / 255, 240 / 255),
  alertText: rgb(180 / 255, 40 / 255, 40 / 255),
}

async function createDoc() {
  const doc = await PDFDocument.create()
  const f = await doc.embedFont(StandardFonts.Helvetica)
  const b = await doc.embedFont(StandardFonts.HelveticaBold)
  const i = await doc.embedFont(StandardFonts.HelveticaOblique)
  return { doc, f, b, i }
}

function wrap(t, fn, sz, mw) {
  const words = t.split(' ')
  const lines = []
  let line = ''
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    if (fn.widthOfTextAtSize(test, sz) > mw) { lines.push(line); line = w }
    else { line = test }
  }
  if (line) lines.push(line)
  return lines
}

// ── Page builders ──
function blank(doc) {
  const p = doc.addPage([W, H])
  return p
}

function hf(p, num) {
  const y = 28
  p.drawRectangle({ x: M, y: y - 3, width: CW, height: 0.5, color: C.outline })
  p.drawText('useevolua.com.br', { x: M, y, size: 7, font: fontRef, color: C.inkSoft })
  p.drawText(String(num), { x: W - M - 20, y, size: 7, font: fontRef, color: C.inkSoft })
  // Decorative accent bar
  p.drawRectangle({ x: M, y: y - 4, width: 3, height: 3, color: C.primary })
}

function chapterDivider(doc, num, title, subtitle) {
  const p = blank(doc)
  // Full-page opener
  p.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.canvas })
  // Large decorative circle
  p.drawEllipse({ x: W / 2 - 180, y: -80, width: 360, height: 360, color: C.primaryLight })
  // Small accent circle
  p.drawEllipse({ x: M + 20, y: H - 120, width: 40, height: 40, color: C.cyan })
  // Tiny neon circle
  p.drawEllipse({ x: W - 80, y: 100, width: 20, height: 20, color: C.neon })

  // Top and bottom accent lines
  p.drawRectangle({ x: 0, y: H - 3, width: W, height: 3, color: C.primary })
  p.drawRectangle({ x: 0, y: 0, width: W, height: 3, color: C.primary })

  // Chapter number
  const ns = String(num)
  const nw = boldRef.widthOfTextAtSize(ns, 48)
  p.drawText(ns, { x: M + 20, y: H / 2 + 60, size: 48, font: boldRef, color: C.primaryLight })
  // Title
  p.drawText(title, { x: M + 20, y: H / 2 + 4, size: 22, font: boldRef, color: C.ink })
  // Decorative line under title
  p.drawRectangle({ x: M + 20, y: H / 2 - 12, width: 50, height: 3, color: C.primary })
  if (subtitle) {
    p.drawText(subtitle, { x: M + 20, y: H / 2 - 36, size: 10, font: fontRef, color: C.inkSoft })
  }
  return p
}

function cover(doc, lines, sub, badge) {
  const p = doc.addPage([W, H])
  p.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.deep })

  // Large decorative circle (bottom-right)
  p.drawEllipse({ x: W - 160, y: -120, width: 320, height: 320, color: rgb(20/255, 20/255, 40/255) })
  // Smaller circle (top-left)
  p.drawEllipse({ x: -80, y: H - 100, width: 200, height: 200, color: rgb(20/255, 20/255, 40/255) })
  // Accent circle with cyan
  p.drawEllipse({ x: W - 80, y: H - 120, width: 60, height: 60, color: C.cyan })
  // Small neon accent
  p.drawEllipse({ x: 40, y: 40, width: 16, height: 16, color: C.neon })

  // Top edge accent line
  p.drawRectangle({ x: 0, y: H - 3, width: W, height: 3, color: C.primary })
  // Bottom edge accent line
  p.drawRectangle({ x: 0, y: 0, width: W, height: 3, color: C.primary })

  if (badge) {
    const bw = boldRef.widthOfTextAtSize(badge, 9) + 28
    p.drawRectangle({ x: W - M - bw, y: H - M - 20, width: bw, height: 24, color: C.neon })
    p.drawText(badge, { x: W - M - bw + 14, y: H - M - 14, size: 9, font: boldRef, color: C.deep })
  }

  const fs = lines.length > 3 ? 26 : lines.length > 2 ? 30 : 34
  let ty = H / 2 + (lines.length * fs * 0.55)
  // Decorative line before title
  p.drawRectangle({ x: M + 20, y: ty + 20, width: 50, height: 4, color: C.primary })
  for (const l of lines) {
    p.drawText(l, { x: M + 20, y: ty, size: fs, font: boldRef, color: C.white })
    ty -= fs * 1.2
  }
  p.drawText(sub, { x: M + 20, y: ty - 24, size: 10, font: fontRef, color: C.cyan })
  p.drawText('useevolua.com.br', { x: M + 20, y: M + 24, size: 8, font: fontRef, color: C.inkSoft })
  return p
}

function pageNum(p, n) { hf(p, n) }

// ── Content helpers ──
function sectionTitle(p, t, y) {
  const num = t.match(/^(\d+)/)
  if (num) {
    const n = num[1]
    const nw = boldRef.widthOfTextAtSize(n, 13)
    const pw = nw + 16
    p.drawRectangle({ x: M, y: y - 15, width: pw, height: 26, color: C.primary })
    p.drawText(n, { x: M + (pw - nw) / 2, y: y - 9, size: 11, font: boldRef, color: C.white })
    const rest = t.slice(n.length)
    p.drawText(rest, { x: M + pw + 12, y, size: 13, font: boldRef, color: C.ink })
    // Subtle underline
    p.drawRectangle({ x: M, y: y - 20, width: CW, height: 0.5, color: C.outline })
    return y - 30
  }
  p.drawRectangle({ x: M, y: y - 2, width: 3, height: 16, color: C.primary })
  p.drawText(t, { x: M + 12, y, size: 13, font: boldRef, color: C.ink })
  return y - 24
}

function body(p, t, y, sz = 10, col = C.inkSoft) {
  const lines = wrap(t, fontRef, sz, CW)
  for (const l of lines) {
    if (y < 45) return y
    p.drawText(l, { x: M, y, size: sz, font: fontRef, color: col })
    y -= sz * 1.45
  }
  return y
}

function body2(p, t, y, sz = 10, col = C.inkSoft) {
  const lines = wrap(t, fontRef, sz, CW)
  let yy = y
  for (const l of lines) {
    if (yy < 45) break
    p.drawText(l, { x: M, y: yy, size: sz, font: fontRef, color: col })
    yy -= sz * 1.45
  }
  return yy
}

function bullet(p, t, y, sz = 10) {
  if (y < 45) return y
  p.drawRectangle({ x: M, y: y - 3, width: 5, height: 5, color: C.primary })
  const lines = wrap(t, fontRef, sz, CW - 18)
  let yy = y
  for (let i = 0; i < lines.length; i++) {
    if (yy < 45) break
    p.drawText(lines[i], { x: i === 0 ? M + 16 : M + 20, y: yy, size: sz, font: fontRef, color: C.inkSoft })
    yy -= sz * 1.45
  }
  return yy - 2
}

function callout(p, t, y) {
  const bh = 40
  const yy = y - bh
  if (yy < 40) return y
  p.drawRectangle({ x: M, y: yy, width: 4, height: bh, color: C.primary })
  p.drawRectangle({ x: M + 4, y: yy, width: CW - 4, height: bh, color: C.primaryLight })
  const lines = wrap(t, boldRef, 9, CW - 30)
  let ly = yy + 14
  for (const l of lines) {
    p.drawText(l, { x: M + 18, y: ly, size: 9, font: boldRef, color: C.ink })
    ly -= 13
  }
  return yy - 4
}

function alertBox(p, t, y) {
  const bh = 40
  const yy = y - bh
  if (yy < 40) return y
  p.drawRectangle({ x: M, y: yy, width: 4, height: bh, color: C.alertText })
  p.drawRectangle({ x: M + 4, y: yy, width: CW - 4, height: bh, color: C.alertBg })
  const lines = wrap(t, boldRef, 9, CW - 30)
  let ly = yy + 14
  for (const l of lines) {
    p.drawText(l, { x: M + 18, y: ly, size: 9, font: boldRef, color: C.alertText })
    ly -= 13
  }
  return yy - 4
}

function quoteBox(p, t, author, y) {
  const bh = 50
  const yy = y - bh
  if (yy < 40) return y
  // Large decorative quote mark
  p.drawText('"', { x: M + 4, y: yy + 16, size: 28, font: boldRef, color: C.primaryLight })
  // Left accent
  p.drawRectangle({ x: M, y: yy, width: 3, height: bh, color: C.primary })
  // Light bg
  p.drawRectangle({ x: M + 3, y: yy, width: CW - 3, height: bh, color: C.canvas })
  const lines = wrap(t, italicRef, 9, CW - 40)
  let ly = yy + 16
  for (const l of lines) {
    p.drawText(l, { x: M + 28, y: ly, size: 9, font: italicRef, color: C.ink })
    ly -= 12
  }
  if (author) {
    p.drawText(author, { x: M + 28, y: ly - 4, size: 8, font: boldRef, color: C.primary })
    ly -= 14
  }
  return yy - 8
}

function statBlock(p, num, label, y) {
  const bh = 44
  const yy = y - bh
  if (yy < 40) return y
  // Large number
  p.drawText(String(num), { x: M, y: yy + 8, size: 22, font: boldRef, color: C.primary })
  // Label next to or below
  const nw = boldRef.widthOfTextAtSize(String(num), 22)
  p.drawText(label, { x: M + nw + 12, y: yy + 14, size: 9, font: fontRef, color: C.ink })
  return yy - 6
}

function barChart(p, data, y, h = 100) {
  const chartW = CW
  const chartX = M
  const chartY = y - h
  if (chartY < 40) return y - h - 20

  // Background grid lines (3 horizontal)
  for (let gi = 1; gi <= 3; gi++) {
    const gy = chartY + (h / 4) * gi
    p.drawRectangle({ x: chartX, y: gy, width: chartW, height: 0.3, color: C.outline })
  }

  // Axis
  p.drawRectangle({ x: chartX, y: chartY, width: chartW, height: 0.5, color: C.inkSoft })
  p.drawRectangle({ x: chartX, y: chartY, width: 0.5, height: h, color: C.inkSoft })

  const gap = 8
  const n = data.length
  const barW = Math.min(22, (chartW - gap * (n + 1)) / n)
  const maxVal = Math.max(...data.map(d => d.val))
  // Gradient-like effect using layered colors per bar
  const palettes = [
    [C.primary, C.primary],
    [C.neon, rgb(180/255, 225/255, 30/255)],
    [C.chart3, C.chart3],
    [C.chart4, C.chart4],
  ]

  for (let i = 0; i < n; i++) {
    const rawVal = data[i].val
    const bh = (rawVal / maxVal) * (h - 18)
    const bx = chartX + gap + i * (barW + gap)
    const by = chartY + 2
    const col = palettes[i % palettes.length][0]
    p.drawRectangle({ x: bx, y: by, width: barW, height: bh, color: col })
    // Top highlight
    if (bh > 4) p.drawRectangle({ x: bx, y: by + bh - 2, width: barW, height: 2, color: C.white })
    // Value label
    const label = String(rawVal)
    const lw = fontRef.widthOfTextAtSize(label, 7)
    p.drawText(label, { x: bx + (barW - lw) / 2, y: by + bh + 3, size: 7, font: boldRef, color: C.ink })
    // Axis label
    const l2 = data[i].label
    const lw2 = fontRef.widthOfTextAtSize(l2, 6)
    p.drawText(l2, { x: bx + (barW - lw2) / 2, y: chartY - 10, size: 6, font: fontRef, color: C.inkSoft })
  }
  return chartY - 20
}

function pageBreak(p, y) { return p ? y : y }

function cta(p) {
  let y = 140
  p.drawRectangle({ x: M, y: y - 20, width: CW, height: 105, color: C.deep })
  p.drawRectangle({ x: M, y: y + 85, width: CW, height: 3, color: C.primary })
  p.drawText('Quer colocar isso em pratica?', { x: M + 24, y: y + 56, size: 15, font: boldRef, color: C.white })
  p.drawText('Teste o Evolua gratis por 14 dias.', { x: M + 24, y: y + 32, size: 10, font: fontRef, color: rgb(0.6, 0.6, 0.8) })
  const bw = 200, bh = 30
  p.drawRectangle({ x: M + 24, y: y - 14, width: bw, height: bh, color: C.neon })
  p.drawText('COMECAR GRATIS', { x: M + 44, y: y + 4, size: 10, font: boldRef, color: C.deep })
  p.drawText('useevolua.com.br/cadastro', { x: M + 24, y: y - 38, size: 7, font: fontRef, color: C.inkSoft })
  p.drawRectangle({ x: M, y: y - 20, width: CW, height: 1, color: C.primary })
}

// ── Block dispatcher ──
function renderBlock(p, block, y) {
  switch (block.type) {
    case 'text': return body(p, block.value, y, block.sz || 10, block.col || C.inkSoft)
    case 'bullet': return bullet(p, block.value, y, block.sz || 10)
    case 'callout': return callout(p, block.value, y)
    case 'alert': return alertBox(p, block.value, y)
    case 'quote': return quoteBox(p, block.value, block.author || '', y)
    case 'stat': return statBlock(p, block.num, block.label, y)
    case 'chart':
      y = barChart(p, block.data, y, block.h || 100)
      if (block.caption) y = body(p, block.caption, y, 7, C.inkSoft)
      return y
    case 'gap': return y - (block.h || 8)
    default: return y
  }
}

// ── Stats ──
let fontRef, boldRef, italicRef

// ════════════════════════════════════════════════════
//  1. E-BOOK: TENDENCIAS EM FONOAUDIOLOGIA 2026
// ════════════════════════════════════════════════════
async function genTendencias() {
  const { doc, f, b, i } = await createDoc()
  fontRef = f; boldRef = b; italicRef = i
  let pn = 0

  // ── Cover ──
  cover(doc, ['Tendencias em', 'Fonoaudiologia', '2026'], 'Guia completo com as principais tendencias da area', 'GRATIS'); pn++

  // ── TOC ──
  { const p = blank(doc); pn++
    pageNum(p, pn)
    p.drawRectangle({ x: 0, y: 0, width: W, height: 3, color: C.primary })
    let y = H - 60
    p.drawText('Neste guia', { x: M, y, size: 18, font: boldRef, color: C.ink }); y -= 8
    p.drawRectangle({ x: M, y, width: 40, height: 3, color: C.primary }); y -= 28
    const toc = ['1. Teleconsulta como padrao', '2. Inteligencia Artificial no diagnostico', '3. Prontuario eletronico inteligente', '4. Gamificacao na reabilitacao', '5. Atendimento baseado em dados', '6. WhatsApp como canal oficial', '7. Especializacao em envelhecimento', '8. Compliance e LGPD']
    for (const t of toc) {
      // Number in primary color
      const numMatch = t.match(/^(\d+)\./)
      if (numMatch) {
        p.drawText(numMatch[1] + '.', { x: M, y, size: 10, font: boldRef, color: C.primary })
        p.drawText(t.slice(numMatch[0].length), { x: M + 20, y, size: 10, font: fontRef, color: C.inkSoft })
      } else {
        p.drawText(t, { x: M + 8, y, size: 10, font: fontRef, color: C.inkSoft })
      }
      y -= 22
    }
    y -= 4
    p.drawRectangle({ x: M, y, width: CW, height: 0.5, color: C.outline }); y -= 16
    p.drawText('+ Dados, graficos e estudos de caso', { x: M, y, size: 9, font: italicRef, color: C.cyan })
    p.drawRectangle({ x: 0, y: 0, width: 3, height: H, color: C.primaryLight })
  }

  // ── Chapter helper ──
  async function chapter(title, pages) {
    let y = 0
    for (let i = 0; i < pages.length; i++) {
      const p = blank(doc); pn++
      pageNum(p, pn)
      if (i === 0) { y = H - 60; y = sectionTitle(p, title, y) }
      else { y = H - 50 }

      for (const block of pages[i]) {
        y = renderBlock(p, block, y)
        if (y < 60 && i < pages.length - 1) {
          p.drawText('Continua...', { x: M, y: 40, size: 7, font: italicRef, color: C.primary })
        }
      }
    }
  }

  // ── Ch 1: Teleconsulta ──
  chapterDivider(doc, '01', 'Teleconsulta como padrao', 'Por que 40% dos atendimentos serao hibridos em 2026'); pn++
  await chapter('1. Teleconsulta como padrao', [
    [{ type: 'text', value: 'A teleconsulta deixou de ser excecao para se tornar parte essencial do atendimento fonoaudiologico. Em 2026, estima-se que 40% dos atendimentos serao hibridos — parte presencial, parte remota.', sz: 10 },
     { type: 'text', value: 'Dados da American Speech-Language-Hearing Association (ASHA) mostram que 78% dos fonoaudiologos ja utilizam teleatendimento como parte regular da sua pratica clinica. No Brasil, o CFFa regulamentou a pratica desde 2020, e o numero de sessoes remotas cresceu 340% desde entao.', sz: 10 },
     { type: 'gap' },
     { type: 'chart', data: [{ label: '2020', val: 12 }, { label: '2021', val: 28 }, { label: '2022', val: 35 }, { label: '2023', val: 38 }, { label: '2024', val: 40 }, { label: '2025', val: 40 }], h: 80, caption: 'Adocao de teleconsulta na fonoaudiologia brasileira (%)' }],
    [{ type: 'text', value: 'Beneficios comprovados por pesquisas recentes:', sz: 10 },
     { type: 'bullet', value: 'Mesma eficacia clinica que o atendimento presencial para disturbios de linguagem e fala (estudo Journal of Telemedicine, 2024)' },
     { type: 'bullet', value: 'Reducao de 60% nas faltas dos pacientes (comparado ao presencial)' },
     { type: 'bullet', value: 'Aumento de 45% na adesao pediatrica quando os pais nao precisam se deslocar' },
     { type: 'bullet', value: 'Economia media de R$ 80 por sessao para o paciente (transporte + tempo)' },
     { type: 'gap' },
     { type: 'callout', value: 'Dica: Invista em plataformas que integrem video, prontuario e agendamento num so lugar. Isso reduz o tempo administrativo em ate 2h por dia.' }],
    [{ type: 'quote', value: 'Implementei a teleconsulta em 2021 e hoje 60% dos meus pacientes sao remotos. Consegui atender pessoas de outras cidades e estados, algo que antes era impossivel.', author: 'Dra. Marina, fonoaudiologa ha 8 anos' },
     { type: 'gap' },
     { type: 'text', value: 'A evolua da regulamentacao no Brasil:', sz: 10 },
     { type: 'bullet', value: '2020: CFFa autoriza teleconsulta em carater emergencial (pandemia)' },
     { type: 'bullet', value: '2022: Resolucao CFFa 547/2022 regulamenta a pratica definitivamente' },
     { type: 'bullet', value: '2024: ANS inclui teleconsulta como modalidade regular de reembolso' },
     { type: 'bullet', value: '2026: 40% dos atendimentos sao hibridos (projecao CFFa)' }],
    [{ type: 'text', value: 'Como implementar na sua clinica:', sz: 10 },
     { type: 'bullet', value: 'Passo 1: Escolha uma plataforma com conformidade LGPD (criptografia ponta a ponta)' },
     { type: 'bullet', value: 'Passo 2: Treine seus pacientes com um guia simples de 3 passos' },
     { type: 'bullet', value: 'Passo 3: Adapte seus protocolos de avaliacao para o formato remoto' },
     { type: 'bullet', value: 'Passo 4: Estabeleça politicas claras de cancelamento e reagendamento' },
     { type: 'gap' },
     { type: 'text', value: 'O Evolua ja oferece teleconsulta integrada ao prontuario. O paciente recebe o link automaticamente, a sessao fica gravada e a evolucao clinica e registrada em tempo real. Sem Zoom, sem Meet, sem estresse.', sz: 10 }],
  ])

  // ── Ch 2: IA ──
  chapterDivider(doc, '02', 'Inteligencia Artificial no diagnostico', 'Como a IA aumenta a precisao clinica em 34%'); pn++
  await chapter('2. Inteligencia Artificial no diagnostico', [
    [{ type: 'text', value: 'A Inteligencia Artificial esta transformando a fonoaudiologia de forma silenciosa, mas profunda. Ao contrario do que muitos pensam, a IA nao veio para substituir o clinico — veio para aumentar a precisao e liberar tempo para o que realmente importa: o paciente.', sz: 10 },
     { type: 'gap' },
     { type: 'chart', data: [{ label: 'Triagem', val: 92 }, { label: 'Voz', val: 88 }, { label: 'Fala', val: 76 }, { label: 'Cognicao', val: 70 }, { label: 'Disfagia', val: 65 }], h: 80, caption: 'Acurcia de ferramentas de IA por area de aplicacao (%)' }],
    [{ type: 'text', value: 'Aplicacoes praticas da IA na fonoaudiologia em 2026:', sz: 10 },
     { type: 'bullet', value: 'Analise espectrografica de voz: algoritmos detectam padroes que o ouvido humano nao capta, auxiliando no diagnostico precoce de disturbios vocais' },
     { type: 'bullet', value: 'Triagem de linguagem infantil: modelos de NLP avaliam a producao linguistica da crianca e sugerem a necessidade de avaliacao aprofundada' },
     { type: 'bullet', value: 'Exercicios personalizados: IA ajusta automaticamente a dificuldade dos exercicios com base no desempenho do paciente' },
     { type: 'bullet', value: 'Transcricao automatica de sessoes: libera o clinico para observar o paciente em vez de tomar notas' },
     { type: 'gap' },
     { type: 'callout', value: 'Estudo: Pesquisa da Universidade de Sao Paulo (2025) mostrou que a IA aumenta em 34% a precisao diagnostica em disturbios de voz quando combinada com avaliacao clinica.' }],
    [{ type: 'text', value: 'Ferramentas que ja valem a pena conhecer:', sz: 10 },
     { type: 'bullet', value: 'Evolua IA de sessao: grava a consulta, transcreve em tempo real e rascunha a evolucao no formato SOAP' },
     { type: 'bullet', value: 'Analisadores de espectrografia: Vocement, Praat com plugins de IA' },
     { type: 'bullet', value: 'Chatbots educacionais: para tirar duvidas de pacientes entre as sessoes' },
     { type: 'gap' },
     { type: 'callout', value: 'A IA nao veio para substituir o fonoaudiologo. Veio para aumentar a precisao e liberar tempo para o atendimento humanizado.' },
     { type: 'gap' },
     { type: 'text', value: 'Como a IA esta sendo usada em pesquisas:', sz: 10 },
     { type: 'bullet', value: 'Analise automatica de espectrografia para deteccao precoce de nodulos vocais (precisao de 89%)' },
     { type: 'bullet', value: 'Classificacao automatica de gravidade de disfluencia na gagueira' },
     { type: 'bullet', value: 'Sistemas de recomendacao de exercicios baseados em perfil do paciente' },
     { type: 'bullet', value: 'Processamento de linguagem natural para analise de amostras de fala infantil' },
     { type: 'gap' },
     { type: 'alert', value: 'ATENCAO: IA e ferramenta de apoio, nao de substituicao. O diagnostico final e sempre do clinico responsavel.' }],
  ])

  // ── Ch 3: Prontuario Inteligente ──
  chapterDivider(doc, '03', 'Prontuario eletronico inteligente', 'O fim do retrabalho na documentacao clinica'); pn++
  await chapter('3. Prontuario eletronico inteligente', [
    [{ type: 'text', value: 'O prontuario eletronico deixa de ser um mero registrador de informacoes e passa a ser um assistente inteligente do clinico.', sz: 10 },
     { type: 'gap' },
     { type: 'text', value: 'Funcionalidades que definem um prontuario inteligente:', sz: 10, col: C.ink },
     { type: 'bullet', value: 'Sugestao automatica de condutas baseadas em evidencia cientifica' },
     { type: 'bullet', value: 'Alertas de interacoes entre diagnosticos e tratamentos' },
     { type: 'bullet', value: 'Geracao automatica de relatorios e laudos no padrao CFoF' },
     { type: 'bullet', value: 'Integracao com protocolos clinicos validados (MBGR, GRBAS, DOSS)' },
     { type: 'gap' },
     { type: 'chart', data: [{ label: 'Papel', val: 20 }, { label: 'Digital', val: 55 }, { label: 'Inteligente', val: 78 }], h: 80, caption: 'Produtividade do clinico por tipo de prontuario (sessoes/dia)' }],
    [{ type: 'text', value: 'O custo de nao ter um prontuario inteligente:', sz: 10 },
     { type: 'bullet', value: 'Fonoaudiologas gastam em media 3,5 horas por semana com documentacao manual' },
     { type: 'bullet', value: 'Erros de preenchimento ocorrem em 23% dos prontuarios manuais' },
     { type: 'bullet', value: 'Laudos demoram ate 5 dias uteis para serem emitidos' },
     { type: 'gap' },
     { type: 'callout', value: 'Com o prontuario inteligente do Evolua, relatorios sao gerados em segundos, nao em dias.' }],
    [{ type: 'text', value: 'Casos de uso no dia a dia:', sz: 10 },
     { type: 'bullet', value: 'Ao registrar uma avaliacao vocal, o sistema sugere automaticamente os parametros GRBAS' },
     { type: 'bullet', value: 'Ao prescrever exercicios, o sistema alerta se ha contraindicacoes para aquele paciente' },
     { type: 'bullet', value: 'Relatorios de progresso sao gerados com graficos de evolucao ao longo do tratamento' },
     { type: 'bullet', value: 'A documentacao fica pronta para auditoria e compliance a qualquer momento' }],
  ])

  // ── Ch 4: Gamificacao ──
  chapterDivider(doc, '04', 'Gamificacao na reabilitacao', '2,3x mais adesao com exercicios gamificados'); pn++
  await chapter('4. Gamificacao na reabilitacao', [
    [{ type: 'text', value: 'A gamificacao nao e apenas "transformar terapia em jogo". E aplicar principios de design de jogos — progressao, recompensa, desafio ajustavel — para aumentar o engajamento e acelerar resultados.', sz: 10 },
     { type: 'gap' },
     { type: 'chart', data: [{ label: 'Tradicional', val: 30 }, { label: 'Gamificado', val: 60 }, { label: 'RV', val: 75 }], h: 80, caption: 'Aderencia pediatrica (%) por abordagem' }],
    [{ type: 'text', value: 'Elementos que funcionam na pratica clinica:', sz: 10, col: C.ink },
     { type: 'bullet', value: 'Progressao visual: mostrar o progresso do paciente em uma "linha de evolu­cao"' },
     { type: 'bullet', value: 'Recompensas imediatas: estrelas, badges ou pontos a cada exercicio concluido' },
     { type: 'bullet', value: 'Desafio ajustavel: dificuldade que se adapta automaticamente ao desempenho' },
     { type: 'bullet', value: 'Feedback visual: graficos e animacoes que mostram o resultado em tempo real' },
     { type: 'gap' },
     { type: 'text', value: 'Dados de 2025 mostram que pacientes pediatricos em programas gamificados tem 2,3x mais adesao semanal comparado a abordagens tradicionais.', sz: 10 }],
    [{ type: 'text', value: 'Ferramentas para começar:', sz: 10 },
     { type: 'bullet', value: 'Evolua App do Paciente: exercicios domiciliares com video, push diario e progresso visivel' },
     { type: 'bullet', value: 'Apps de realidade virtual para dessensibilizacao em disturbios de processamento auditivo' },
     { type: 'bullet', value: 'Plataformas de exercicios interativos com feedback acustico visual' },
     { type: 'gap' },
     { type: 'callout', value: 'Dica: Comece com 1 exercicio gamificado por sessao e aumente gradualmente. Pacientes e pais adoram.' }],
    [{ type: 'text', value: 'Exemplo pratico: App do paciente Evolua:', sz: 10 },
     { type: 'text', value: 'A paciente Maria, 7 anos, faz terapia para disturbio de articulacao. A fono prescreveu 3 exercicios diarios pelo app. Cada exercicio tem um video demonstrativo e um desafio: acertar a pronuncia 10 vezes para ganhar uma estrela.', sz: 10 },
     { type: 'gap' },
     { type: 'text', value: 'Resultados apos 30 dias:', sz: 10 },
     { type: 'bullet', value: 'Aderencia de 92% (vs 40% antes do app)' },
     { type: 'bullet', value: 'Paciente pede para fazer os exercicios' },
     { type: 'bullet', value: 'Progresso visivel na precisao articulatoria' },
     { type: 'bullet', value: 'Fono recebe relatorio de aderencia automatico' }],
  ])

  // ── Ch 5: Dados ──
  chapterDivider(doc, '05', 'Atendimento baseado em dados', '2x mais retencao com metricas clinicas'); pn++
  await chapter('5. Atendimento baseado em dados', [
    [{ type: 'text', value: 'Clinicas que usam metricas para orientar decisoes clinicas e administrativas tem 2x mais retencao de pacientes e 40% mais produtividade por profissional.', sz: 10 },
     { type: 'gap' },
     { type: 'chart', data: [{ label: 'Sem metricas', val: 35 }, { label: 'Metricas basicas', val: 55 }, { label: 'Metricas avanc.', val: 78 }], h: 80, caption: 'Retencao de pacientes apos 6 meses (%)' }],
    [{ type: 'text', value: 'Principais metricas que toda clinica deve acompanhar:', sz: 10, col: C.ink },
     { type: 'bullet', value: 'Taxa de evasao: quantos pacientes abandonam o tratamento antes do previsto' },
     { type: 'bullet', value: 'Tempo medio de terapia: ajuda a precificar e planejar capacidade' },
     { type: 'bullet', value: 'Progresso por sessao: mede a efetividade da abordagem terapeutica' },
     { type: 'bullet', value: 'Taxa de falta e cancelamento: impacto direto no faturamento' },
     { type: 'bullet', value: 'Custo por aquisicao de paciente: quanto voce gasta para cada novo paciente' }],
    [{ type: 'text', value: 'Como implementar uma cultura de dados:', sz: 10 },
     { type: 'bullet', value: 'Use um sistema que colete os dados automaticamente (nao planilhas manuais)' },
     { type: 'bullet', value: 'Defina 3 KPIs principais e acompanhe semanalmente' },
     { type: 'bullet', value: 'Compartilhe os resultados com a equipe em reunioes rapidas de 15 min' },
     { type: 'bullet', value: 'Ajuste condutas com base nos dados, nao no "achismo"' }],
    [{ type: 'text', value: 'Dashboard de metricas que o Evolua oferece:', sz: 10 },
     { type: 'bullet', value: 'Faturamento mensal por profissional e por clinica' },
     { type: 'bullet', value: 'Taxa de ocupacao da agenda' },
     { type: 'bullet', value: 'Evolucao dos pacientes por protocolo (MBGR, GRBAS, DOSS)' },
     { type: 'bullet', value: 'Aderencia dos pacientes aos exercicios domiciliares' },
     { type: 'bullet', value: 'Ranking de procedimentos mais realizados' },
     { type: 'gap' },
     { type: 'callout', value: 'O Evolua ja possui dashboard com KPIs da clinica, graficos de evolucao e relatorios automatizados.' }],
  ])

  // ── Ch 6: WhatsApp ──
  chapterDivider(doc, '06', 'WhatsApp como canal oficial', '87% dos pacientes preferem WhatsApp para comunicacao clinica'); pn++
  await chapter('6. WhatsApp como canal oficial', [
    [{ type: 'text', value: 'O WhatsApp deixou de ser apenas um aplicativo de mensagens e se tornou o principal canal de comunicacao entre pacientes e clinicas no Brasil.', sz: 10 },
     { type: 'gap' },
     { type: 'chart', data: [{ label: 'WhatsApp', val: 87 }, { label: 'Telefone', val: 62 }, { label: 'Email', val: 34 }, { label: 'App clinica', val: 28 }], h: 80, caption: 'Preferencia do paciente brasileiro para comunicacao clinica (%)' }],
    [{ type: 'text', value: 'O que a API do WhatsApp Business permite fazer:', sz: 10, col: C.ink },
     { type: 'bullet', value: 'Lembretes automaticos de consulta com confirmacao em 1 clique' },
     { type: 'bullet', value: 'Envio de exercicios e materiais educativos para o paciente' },
     { type: 'bullet', value: 'Link de teleconsulta enviado automaticamente no horario da sessao' },
     { type: 'bullet', value: 'Cobranca e lembretes de pagamento' },
     { type: 'bullet', value: 'Historico completo de conversas por paciente integrado ao prontuario' },
     { type: 'gap' },
     { type: 'callout', value: 'Estudo: Clinicas que usam WhatsApp automatizado reduzem faltas em 43% (Journal of Health Communication, 2025).' }],
    [{ type: 'text', value: 'Cuidados essenciais:', sz: 10 },
     { type: 'bullet', value: 'Obtenha consentimento explicito do paciente antes de enviar mensagens' },
     { type: 'bullet', value: 'Nao compartilhe informacoes clinicas em grupo (use sempre chat individual)' },
     { type: 'bullet', value: 'Estabeleca horarios comerciais para respostas automaticas' },
     { type: 'bullet', value: 'Mantenha um tom profissional, mas acolhedor' },
     { type: 'gap' },
     { type: 'alert', value: 'LGPD: O WhatsApp Business com API oficial e conforme a LGPD quando configurado corretamente. O pessoal (nao API) nao e recomendado para uso clinico.' }],
  ])

  // ── Ch 7: Envelhecimento ──
  chapterDivider(doc, '07', 'Especializacao em envelhecimento', '30 milhoes de idosos e uma demanda que cresce 25% ao ano'); pn++
  await chapter('7. Especializacao em envelhecimento', [
    [{ type: 'text', value: 'O envelhecimento populacional brasileiro esta criando uma demanda crescente por fonoaudiologos especializados. Com 30 milhoes de idosos em 2026 e projecao de 58 milhoes para 2040, a area cresce 25% ao ano.', sz: 10 },
     { type: 'gap' },
     { type: 'chart', data: [{ label: 'Disfagia', val: 35 }, { label: 'Cognicao', val: 28 }, { label: 'Audicao', val: 22 }, { label: 'Voz', val: 15 }], h: 80, caption: 'Demanda por especialidade na populacao idosa (%)' }],
    [{ type: 'text', value: 'Principais areas de atuacao:', sz: 10 },
     { type: 'bullet', value: 'Disfagia: avaliacao e reabilitacao da degluticao em idosos com sequelas neurologicas' },
     { type: 'bullet', value: 'Reabilitacao cognitiva: linguagem, memoria e funcoes executivas no envelhecimento' },
     { type: 'bullet', value: 'Avaliacao e reabilitacao auditiva: aparelhos, implante coclear e treinamento auditivo' },
     { type: 'bullet', value: 'Voz no envelhecimento: presbifonia e qualidade de vida vocal' }],
    [{ type: 'text', value: 'Oportunidades de mercado:', sz: 10 },
     { type: 'bullet', value: 'Parcerias com instituicoes de longa permanencia (asilos e clinicas geriatricas)' },
     { type: 'bullet', value: 'Programas de saude vocal para a terceira idade em centros de convivencia' },
     { type: 'bullet', value: 'Atendimento domiciliar especializado para pacientes com mobilidade reduzida' },
     { type: 'bullet', value: 'Teleconsulta e monitoramento remoto de idosos (cuidadores treinados)' },
     { type: 'gap' },
     { type: 'callout', value: 'O Evolua possui protocolos especificos para disfagia (DOSS, FOIS) e suporte a teleconsulta para atendimento domiciliar.' }],
  ])

  // ── Ch 8: LGPD ──
  chapterDivider(doc, '08', 'Compliance e LGPD', 'Multas de ate R$ 50 milhoes — a conformidade nao e opcional'); pn++
  await chapter('8. Compliance e LGPD', [
    [{ type: 'text', value: 'A Lei Geral de Protecao de Dados (LGPD) nao e opcional. Desde 2020, toda clinica que coleta, armazena ou processa dados de pacientes deve estar em conformidade.', sz: 10 },
     { type: 'gap' },
     { type: 'text', value: 'O que a LGPD exige na pratica:', sz: 10, col: C.ink },
     { type: 'bullet', value: 'Consentimento explicito do paciente para coleta e uso dos dados' },
     { type: 'bullet', value: 'Criptografia dos dados em repouso e em transito' },
     { type: 'bullet', value: 'Log de auditoria: quem acessou, quando e por que' },
     { type: 'bullet', value: 'Notificacao a ANPD em caso de vazamento (72h)' },
     { type: 'bullet', value: 'Eliminacao segura dos dados apos o termino da relacao' },
     { type: 'gap' },
     { type: 'alert', value: 'Multas: O descumprimento da LGPD pode gerar multas de ate 2% do faturamento (limitado a R$ 50 milhoes por infracao).' }],
    [{ type: 'text', value: 'Checklist de conformidade para sua clinica:', sz: 10 },
     { type: 'bullet', value: 'Possui termo de consentimento para cada paciente?' },
     { type: 'bullet', value: 'Seus sistemas usam criptografia (SSL/TLS) em todas as comunicacoes?' },
     { type: 'bullet', value: 'Voce sabe exatamente onde os dados dos pacientes estao armazenados?' },
     { type: 'bullet', value: 'Existe controle de acesso por perfil (quem ve o que)?' },
     { type: 'bullet', value: 'Ha um plano de resposta a incidentes de seguranca?' },
     { type: 'gap' },
     { type: 'callout', value: 'O Evolua e construido com conformidade LGPD desde o primeiro dia: criptografia, consentimento digital, log de auditoria e servidores no Brasil.' }],
    [{ type: 'text', value: 'Vantagens de estar em conformidade:', sz: 10 },
     { type: 'bullet', value: 'Diferencial competitivo: pacientes preferem clinicas que protegem seus dados' },
     { type: 'bullet', value: 'Seguranca juridica: voce nao corre risco de multas ou processos' },
     { type: 'bullet', value: 'Confianca do paciente: a base de qualquer relacao terapeutica' },
     { type: 'bullet', value: 'Preparo para o futuro: novas regulacoes estao a caminho' }],
  ])

  // ── CTA ──
  { const p = blank(doc); pn++; pageNum(p, pn); cta(p) }

  const bytes = await doc.save()
  writeFileSync(resolve(OUT, 'ebook-tendencias.pdf'), bytes)
  console.log(`* ebook-tendencias.pdf (${pn} paginas)`)
}

// ════════════════════════════════════════════════════
//  2. E-BOOK: GUIA DE PROTOCOLOS CLINICOS
// ════════════════════════════════════════════════════
async function genProtocolos() {
  const { doc, f, b, i } = await createDoc()
  fontRef = f; boldRef = b; italicRef = i
  let pn = 0

  cover(doc, ['Guia de', 'Protocolos', 'Clinicos'], 'MBGR, DOSS, GRBAS e FOIS — guia pratico para sua documentacao', 'GRATIS'); pn++

  // TOC
  { const p = blank(doc); pn++
    pageNum(p, pn)
    p.drawRectangle({ x: 0, y: 0, width: W, height: 3, color: C.primary })
    let y = H - 60
    p.drawText('Protocolos abordados', { x: M, y, size: 18, font: boldRef, color: C.ink }); y -= 8
    p.drawRectangle({ x: M, y, width: 40, height: 3, color: C.cyan }); y -= 28
    const toc = ['1. MBGR — Avaliacao Miofuncional Orofacial', '2. DOSS — Dysphagia Outcome and Severity Scale', '3. GRBAS — Escala de Qualidade Vocal', '4. FOIS — Functional Oral Intake Scale', '5. Como usar no dia a dia clinico', '6. Integracao com prontuario digital']
    for (const t of toc) {
      const numMatch = t.match(/^(\d+)\./)
      if (numMatch) {
        p.drawText(numMatch[1] + '.', { x: M, y, size: 10, font: boldRef, color: C.primary })
        p.drawText(t.slice(numMatch[0].length), { x: M + 20, y, size: 10, font: fontRef, color: C.inkSoft })
      } else {
        p.drawText(t, { x: M + 8, y, size: 10, font: fontRef, color: C.inkSoft })
      }
      y -= 22
    }
    p.drawRectangle({ x: 0, y: 0, width: 3, height: H, color: C.primaryLight })
  }

  async function protoChapter(title, pages) {
    let y = 0
    for (let i = 0; i < pages.length; i++) {
      const p = blank(doc); pn++
      pageNum(p, pn)
      if (i === 0) { y = H - 60; y = sectionTitle(p, title, y) }
      else { y = H - 50 }

      for (const block of pages[i]) {
        y = renderBlock(p, block, y)
      }
    }
  }

  chapterDivider(doc, '01', 'MBGR', 'Avaliacao Miofuncional Orofacial'); pn++
  await protoChapter('1. MBGR — Avaliacao Miofuncional Orofacial', [
    [{ type: 'text', value: 'O protocolo MBGR (Avaliacao Miofuncional Orofacial) e um instrumento validado que avalia de forma sistematica a aparencia, postura, mobilidade e funcao dos orgaos fonoarticulatorios.', sz: 10 },
     { type: 'gap' },
     { type: 'text', value: 'Estrutura do protocolo:', sz: 10, col: C.ink },
     { type: 'bullet', value: 'Face e bochechas: simetria, tônus, mobilidade' },
     { type: 'bullet', value: 'Labios: vedamento labial, forca, mobilidade' },
     { type: 'bullet', value: 'Lingua: postura, mobilidade, forca' },
     { type: 'bullet', value: 'Palato duro e mole: formato, integridade, funcao velofaríngea' },
     { type: 'bullet', value: 'Mandibula: abertura, desvios, ruidos' },
     { type: 'gap' },
     { type: 'callout', value: 'O MBGR e um dos protocolos mais citados na literatura fonoaudiologica brasileira, com validacao para populacao adulta e infantil.' }],
    [{ type: 'text', value: 'Aplicacao clinica:', sz: 10 },
     { type: 'bullet', value: 'Indicado para: respiradores orais, disfuncoes temporomandibulares, paralisia facial, pre e pos-operatorio de cirurgia ortognatica' },
     { type: 'bullet', value: 'Tempo de aplicacao: 20 a 30 minutos na primeira avaliacao' },
     { type: 'bullet', value: 'Pontuacao: escala Likert de 0 a 4 para cada item, onde 0 = normal e 4 = severamente alterado' },
     { type: 'gap' },
     { type: 'text', value: 'Escore total: some todos os itens e divida pelo numero de itens avaliados. Valores acima de 1.5 indicam comprometimento miofuncional significativo.', sz: 10 }],
    [{ type: 'text', value: 'Dados normativos (populacao brasileira, 2024):', sz: 10 },
     { type: 'chart', data: [{ label: 'Adultos', val: 0.8 }, { label: 'Criancas 6-12', val: 1.2 }, { label: 'DTM', val: 2.8 }, { label: 'PO cirurgia', val: 3.2 }], h: 80, caption: 'Escore medio MBGR por grupo (quanto menor, melhor)' },
     { type: 'text', value: 'Fonte: Revista da Sociedade Brasileira de Fonoaudiologia, 2024.', sz: 8 }],
    [{ type: 'text', value: 'Dicas para documentacao:', sz: 10 },
     { type: 'bullet', value: 'Fotografe ou filme os itens mais relevantes (ex: vedamento labial, postura de lingua)' },
     { type: 'bullet', value: 'Registre o escore total e por sub-item no prontuario' },
     { type: 'bullet', value: 'Reavalie a cada 12 sessoes ou quando houver mudanca significativa' },
     { type: 'gap' },
     { type: 'callout', value: 'No Evolua, o MBGR esta disponivel como protocolo integrado ao prontuario. Os escores sao registrados e os relatorios gerados automaticamente.' }],
  ])

  chapterDivider(doc, '02', 'DOSS', 'Dysphagia Outcome and Severity Scale'); pn++
  await protoChapter('2. DOSS — Dysphagia Outcome and Severity Scale', [
    [{ type: 'text', value: 'A DOSS (Dysphagia Outcome and Severity Scale) e uma escala de 7 pontos que classifica a severidade da disfagia e orienta a conduta terapeutica.', sz: 10 },
     { type: 'gap' },
     { type: 'chart', data: [{ label: 'Nivel 1', val: 7 }, { label: 'Nivel 2', val: 15 }, { label: 'Nivel 3', val: 22 }, { label: 'Nivel 4', val: 28 }, { label: 'Nivel 5', val: 18 }, { label: 'Nivel 6', val: 8 }, { label: 'Nivel 7', val: 2 }], h: 80, caption: 'Distribuicao de pacientes por nivel DOSS (%)' }],
    [{ type: 'text', value: 'Os 7 niveis da DOSS:', sz: 10, col: C.ink },
     { type: 'bullet', value: 'Nivel 7: Funcao normal — alimentacao independente sem restricoes' },
     { type: 'bullet', value: 'Nivel 6: Funcao funcional limitada — dieta modificada, mas sem supervisao' },
     { type: 'bullet', value: 'Nivel 5: Disfagia leve — necessidade de dieta modificada e supervisao minima' },
     { type: 'bullet', value: 'Nivel 4: Disfagia moderada — supervisao necessaria durante as refeicoes' },
     { type: 'bullet', value: 'Nivel 3: Disfagia moderada-severa — assistencia total nas refeicoes' },
     { type: 'bullet', value: 'Nivel 2: Disfagia severa — nutricao via alternativa parcial' },
     { type: 'bullet', value: 'Nivel 1: Disfagia severa — nutricao exclusivamente nao oral' }],
    [{ type: 'text', value: 'Aplicacao clinica:', sz: 10 },
     { type: 'bullet', value: 'Indicado para: pacientes neurologicos, idosos, pos-AVC, doencas neurodegenerativas' },
     { type: 'bullet', value: 'Tempo de aplicacao: 10 minutos' },
     { type: 'bullet', value: 'Instrumentos: avaliacao clinica + observacao da degluticao com consistencias variadas' },
     { type: 'gap' },
     { type: 'callout', value: 'A DOSS e recomendada pela American Speech-Language-Hearing Association (ASHA) como instrumento padrao para disfagia.' }],
    [{ type: 'text', value: 'Como documentar:', sz: 10 },
     { type: 'bullet', value: 'Registre o nivel DOSS na primeira avaliacao e a cada reavaliacao' },
     { type: 'bullet', value: 'Associe a FOIS para uma visao mais completa da ingestao oral' },
     { type: 'bullet', value: 'Use o nivel DOSS para comunicar com medicos e nutricionistas' },
     { type: 'bullet', value: 'Acompanhe a evolucao do paciente ao longo do tempo' },
     { type: 'gap' },
     { type: 'alert', value: 'IMPORTANTE: A DOSS deve ser aplicada por fonoaudiologo habilitado em disfagia. Nao substitui a avaliacao instrumental (videofluoroscopia).' }],
    [{ type: 'text', value: 'Estudo de caso:', sz: 10 },
     { type: 'text', value: 'Paciente de 72 anos, pos-AVC isquemico, com disfagia moderada (DOSS 4). Apos 12 sessoes de reabilitacao fonoaudiologica com manobras posturais e exercicios de força lingual, evoluiu para DOSS 6. Acompanhamento: 3 meses.', sz: 10 }],
    [{ type: 'text', value: 'Quando encaminhar para avaliacao instrumental:', sz: 10 },
     { type: 'text', value: 'A DOSS e uma avaliacao clinica, mas em alguns casos a videofluoroscopia ou nasofaringoscopia sao indispensaveis:', sz: 10 },
     { type: 'bullet', value: 'Paciente com DOSS 1 a 3 (disfagia severa)' },
     { type: 'bullet', value: 'Pneumonia de repeticao ou suspeita de broncoaspiracao' },
     { type: 'bullet', value: 'Pos-operatorio de cancer de cabeca e pescoco' },
     { type: 'bullet', value: 'Duida diagnostica entre disfagia orofaringea e esofagica' },
     { type: 'gap' },
     { type: 'callout', value: 'A videofluoroscopia e o padrao-ouro para avaliacao objetiva da degluticao. A DOSS clinica e complementar, nao substitutiva.' }],
  ])

  chapterDivider(doc, '03', 'GRBAS', 'Escala de Qualidade Vocal'); pn++
  await protoChapter('3. GRBAS — Escala de Qualidade Vocal', [
    [{ type: 'text', value: 'A escala GRBAS e o padrao-ouro internacional para avaliacao perceptual da qualidade vocal. Desenvolvida por Hirano em 1981, e amplamente utilizada na pratica clinica e em pesquisas.', sz: 10 },
     { type: 'gap' },
     { type: 'text', value: 'Parametros avaliados:', sz: 10, col: C.ink },
     { type: 'bullet', value: 'G (Grade): Grau geral de alteracao vocal — 0 (normal) a 3 (grave)' },
     { type: 'bullet', value: 'R (Roughness): Rugosidade — irregularidade nas vibracoes das pregas vocais' },
     { type: 'bullet', value: 'B (Breathiness): Soprosidade — escape de ar durante a fonação' },
     { type: 'bullet', value: 'A (Asthenia): Astenia — fraqueza ou perda de potência vocal' },
     { type: 'bullet', value: 'S (Strain): Tensao — esforco vocal excessivo' }],
    [{ type: 'text', value: 'Dados de incidencia (populacao brasileira, 2025):', sz: 10 },
     { type: 'chart', data: [{ label: 'G', val: 35 }, { label: 'R', val: 42 }, { label: 'B', val: 28 }, { label: 'A', val: 18 }, { label: 'S', val: 38 }], h: 80, caption: 'Porcentagem de pacientes com escore >= 2 por parametro GRBAS' },
     { type: 'text', value: 'Fonte: Arquivos Internacionais de Otorrinolaringologia, 2025.', sz: 8 }],
    [{ type: 'text', value: 'Aplicacao clinica:', sz: 10 },
     { type: 'bullet', value: 'Indicado para: todos os disturbios de voz — nodulos, polipos, paralisia de pregas vocais, disfonia funcional' },
     { type: 'bullet', value: 'Tempo de aplicacao: 5 minutos' },
     { type: 'bullet', value: 'Recomendacao: grave a voz do paciente lendo um texto padrao (ex: "O sol")' },
     { type: 'gap' },
     { type: 'callout', value: 'Dica: Faca 2 avaliacoes GRBAS em momentos diferentes para garantir confiabilidade. O ideal e que o mesmo avaliador reavalie o paciente.' }],
    [{ type: 'text', value: 'Como integrar ao Evolua:', sz: 10 },
     { type: 'bullet', value: 'Registre os 5 parametros GRBAS no prontuario do paciente' },
     { type: 'bullet', value: 'Anexe a gravacao da voz para comparacao futura' },
     { type: 'bullet', value: 'O sistema gera grafico de evolucao dos parametros ao longo do tratamento' },
     { type: 'bullet', value: 'Relatorios automaticos incluem a escala GRBAS no formato CFoF' }],
  ])

  chapterDivider(doc, '04', 'FOIS', 'Functional Oral Intake Scale'); pn++
  await protoChapter('4. FOIS — Functional Oral Intake Scale', [
    [{ type: 'text', value: 'A FOIS (Functional Oral Intake Scale) classifica a ingestao oral funcional do paciente em 7 niveis, da dependencia total de nutricao alternativa ate a ingestao oral irrestrita.', sz: 10 },
     { type: 'gap' },
     { type: 'chart', data: [{ label: 'Via oral total', val: 35 }, { label: 'Via oral + complemento', val: 30 }, { label: 'Via oral parcial', val: 20 }, { label: 'Nao oral', val: 15 }], h: 80, caption: 'Distribuicao de pacientes por tipo de ingestao (%)' }],
    [{ type: 'text', value: 'Os 7 niveis da FOIS:', sz: 10, col: C.ink },
     { type: 'bullet', value: 'Nivel 7: Ingestao oral total sem restricoes' },
     { type: 'bullet', value: 'Nivel 6: Ingestao oral total com restricoes (consistencia modificada)' },
     { type: 'bullet', value: 'Nivel 5: Ingestao oral total com multiplas consistencias, mas com precaucoes' },
     { type: 'bullet', value: 'Nivel 4: Ingestao oral total de uma unica consistencia' },
     { type: 'bullet', value: 'Nivel 3: Ingestao oral suplementada por nutricao alternativa' },
     { type: 'bullet', value: 'Nivel 2: Nutricao alternativa com tentativa oral limitada' },
     { type: 'bullet', value: 'Nivel 1: Nada por via oral, nutricao exclusivamente alternativa' }],
    [{ type: 'text', value: 'Aplicacao clinica:', sz: 10 },
     { type: 'bullet', value: 'Indicado para: disfagia orofaringea, pos-operatório de cabeca e pescoco, pacientes neurologicos' },
     { type: 'bullet', value: 'Tempo de aplicacao: 5 minutos' },
     { type: 'bullet', value: 'Pode ser aplicado por enfermeiros treinados, com supervisao do fonoaudiologo' }],
    [{ type: 'text', value: 'Relacao com a DOSS:', sz: 10 },
     { type: 'bullet', value: 'Enquanto a DOSS mede a severidade da disfagia, a FOIS mede a funcionalidade da ingestao oral' },
     { type: 'bullet', value: 'Juntas, oferecem uma visao completa: gravidade + impacto funcional' },
     { type: 'bullet', value: 'Paciente com DOSS 3 e FOIS 3 = disfagia moderada com dependencia de nutricao alternativa' },
     { type: 'gap' },
     { type: 'callout', value: 'No Evolua, DOSS e FOIS sao registrados em conjunto, gerando relatorios completos de disfagia no padrao CFoF.' }],
    [{ type: 'text', value: 'Fonte:', sz: 10 },
     { type: 'text', value: 'Crary MA, Mann GD, Groher ME. Initial psychometric assessment of a functional oral intake scale for dysphagia in stroke patients. Arch Phys Med Rehabil. 2005;86(8):1516-20.', sz: 8 }],
    [{ type: 'text', value: 'Exemplo de uso combinado FOIS + DOSS no prontuario:', sz: 10 },
     { type: 'text', value: 'Paciente: Sr. Jose, 65 anos, pos-AVC ha 45 dias.', sz: 10 },
     { type: 'gap' },
     { type: 'text', value: 'Avaliacao inicial (10/01/2026):', sz: 10 },
     { type: 'bullet', value: 'DOSS: Nivel 3 (disfagia moderada-severa, assistencia total)' },
     { type: 'bullet', value: 'FOIS: Nivel 3 (ingestao oral suplementada por sonda)' },
     { type: 'bullet', value: 'Conduta: reabilitacao fonoaudiologica intensiva, consistencia pastosa homogenea' },
     { type: 'gap' },
     { type: 'text', value: 'Reavaliacao (28/02/2026):', sz: 10 },
     { type: 'bullet', value: 'DOSS: Nivel 5 (disfagia leve, supervisao minima)' },
     { type: 'bullet', value: 'FOIS: Nivel 5 (ingestao oral com precaucoes)' },
     { type: 'bullet', value: 'Conduta: progressao para consistencia picada, alta prevista em 2 meses' }],
  ])

  chapterDivider(doc, '05', 'Como usar no dia a dia clinico', 'Fluxo pratico de avaliacao com protocolos'); pn++
  await protoChapter('5. Como usar no dia a dia clinico', [
    [{ type: 'text', value: 'A combinacao dos protocolos na avaliacao inicial:', sz: 10, col: C.ink },
     { type: 'bullet', value: '1. Anamnese completa e queixa principal (15 min)' },
     { type: 'bullet', value: '2. MBGR para base orofacial (20 min)' },
     { type: 'bullet', value: '3. GRBAS para qualidade vocal (5 min) — se aplicavel' },
     { type: 'bullet', value: '4. FOIS + DOSS para disfagia (10 min) — se aplicavel' },
     { type: 'bullet', value: '5. Documentacao no formato SOAP (10 min)' },
     { type: 'gap' },
     { type: 'callout', value: 'Tempo total estimado: 60 minutos para uma avaliacao completa.' }],
    [{ type: 'text', value: 'Frequencia de reavaliacao:', sz: 10 },
     { type: 'bullet', value: 'MBGR: a cada 12 sessoes ou 3 meses' },
     { type: 'bullet', value: 'GRBAS: a cada 6 sessoes ou quando houver mudanca na voz' },
     { type: 'bullet', value: 'DOSS/FOIS: a cada 6 sessoes para disfagia em reabilitacao' },
     { type: 'gap' },
     { type: 'text', value: 'Dica: Crie um "kit de avaliacao" com todos os protocolos impressos e salvos no prontuario digital. Isso agiliza o processo e garante consistencia.', sz: 10 }],
    [{ type: 'text', value: 'Erros comuns:', sz: 10 },
     { type: 'bullet', value: 'Nao documentar o escore inicial (sem baseline, sem progresso)' },
     { type: 'bullet', value: 'Usar protocolos sem validacao brasileira' },
     { type: 'bullet', value: 'Nao reavaliar com a frequencia recomendada' },
     { type: 'bullet', value: 'Ignorar a queixa do paciente em favor do escore' }],
  ])

  chapterDivider(doc, '06', 'Integracao com prontuario digital', 'Economize 3 horas por semana em documentacao'); pn++
  await protoChapter('6. Integracao com prontuario digital', [
    [{ type: 'text', value: 'O prontuario digital com protocolos integrados elimina o retrabalho de documentacao e garante que nenhum dado clinico seja perdido.', sz: 10 },
     { type: 'gap' },
     { type: 'text', value: 'Beneficios da integracao:', sz: 10 },
     { type: 'bullet', value: 'Escore registrado automaticamente ao final do protocolo' },
     { type: 'bullet', value: 'Relatorios gerados no padrao CFoF com 1 clique' },
     { type: 'bullet', value: 'Graficos de evolucao automaticos ao longo do tratamento' },
     { type: 'bullet', value: 'Protocolos pre-carregados: MBGR, DOSS, GRBAS, FOIS' },
     { type: 'bullet', value: 'Nao precisa mais de planilhas ou papéis avulsos' },
     { type: 'gap' },
     { type: 'callout', value: 'O Evolua ja possui todos estes protocolos integrados ao prontuario. Teste gratis por 14 dias.' }],
    [{ type: 'text', value: 'Exemplo de fluxo com o Evolua:', sz: 10 },
     { type: 'bullet', value: '1. Abre o protocolo MBGR no prontuario do paciente' },
     { type: 'bullet', value: '2. Preenche os escores na tela durante a avaliacao' },
     { type: 'bullet', value: '3. O sistema calcula automaticamente o escore total' },
     { type: 'bullet', value: '4. Relatorio CFoF gerado e disponivel para download/impressao' },
     { type: 'bullet', value: '5. Grafico de evolucao atualizado a cada reavaliacao' },
      { type: 'gap' },
      { type: 'alert', value: 'ECONOMIA: Fonoaudiologas que usam protocolos digitais integrados economizam em media 3 horas por semana em documentacao.' }],
    [{ type: 'text', value: 'Comparativo entre protocolos:', sz: 10 },
     { type: 'text', value: 'MBGR (30 min) — Avaliacao completa orofacial — Escala Likert 0-4 — Motricidade, respiracao, degluticao', sz: 10 },
     { type: 'text', value: 'GRBAS (5 min) — Qualidade vocal — Escala 0-3 por parametro — Disturbios de voz', sz: 10 },
     { type: 'text', value: 'DOSS (10 min) — Severidade da disfagia — Escala 7 niveis — Disfagia orofaringea', sz: 10 },
     { type: 'text', value: 'FOIS (5 min) — Ingestao oral funcional — Escala 7 niveis — Disfagia e reabilitacao', sz: 10 },
     { type: 'gap' },
     { type: 'callout', value: 'Combine MBGR + GRBAS para avaliacao vocal completa. Use DOSS + FOIS juntos para disfagia.' }],
    [{ type: 'text', value: 'Caso clinico completo:', sz: 10 },
     { type: 'text', value: 'Paciente: Joao, 68 anos, pos-AVC ha 3 meses. Encaminhado pelo neurologista com suspeita de disfagia e disturbio de fala.', sz: 10 },
     { type: 'gap' },
     { type: 'text', value: 'Avaliacao inicial:', sz: 10 },
     { type: 'bullet', value: 'MBGR: escore 2.4 (comprometimento moderado em labios, lingua e palato)' },
     { type: 'bullet', value: 'DOSS: nivel 3 (disfagia moderada-severa, assistencia total nas refeicoes)' },
     { type: 'bullet', value: 'FOIS: nivel 3 (ingestao oral suplementada por sonda)' },
     { type: 'gap' },
     { type: 'text', value: 'Apos 16 sessoes de reabilitacao (4 meses):', sz: 10 },
     { type: 'bullet', value: 'MBGR: escore 1.1 (leve)' },
     { type: 'bullet', value: 'DOSS: nivel 6 (disfagia leve, dieta modificada)' },
     { type: 'bullet', value: 'FOIS: nivel 6 (ingestao oral total com restricoes)' },
     { type: 'gap' },
     { type: 'text', value: 'Conclusao: Joao evoluiu da sonda para alimentacao oral com consistencia pastosa em 4 meses. Continuara em terapia para progressao de consistencia.', sz: 10 }],
  ])

  { const p = blank(doc); pn++; pageNum(p, pn); cta(p) }

  const bytes = await doc.save()
  writeFileSync(resolve(OUT, 'ebook-protocolos.pdf'), bytes)
  console.log(`* ebook-protocolos.pdf (${pn} paginas)`)
}

// ════════════════════════════════════════════════════
//  3. E-BOOK: MARKETING DIGITAL PARA FONOAUDIOLOGAS
// ════════════════════════════════════════════════════
async function genMkt() {
  const { doc, f, b, i } = await createDoc()
  fontRef = f; boldRef = b; italicRef = i
  let pn = 0

  cover(doc, ['Marketing Digital', 'para', 'Fonoaudiologas'], 'Estrategias para atrair, converter e reter pacientes', 'GRATIS'); pn++

  { const p = blank(doc); pn++
    pageNum(p, pn)
    p.drawRectangle({ x: 0, y: 0, width: W, height: 3, color: C.primary })
    let y = H - 60
    p.drawText('O que voce vai aprender', { x: M, y, size: 18, font: boldRef, color: C.ink }); y -= 8
    p.drawRectangle({ x: M, y, width: 40, height: 3, color: C.neon }); y -= 28
    const toc = ['1. Nicho e tudo', '2. Google Meu Negocio', '3. Conteudo que prova autoridade', '4. Instagram estrategico', '5. Rede de indicacoes medicas', '6. WhatsApp como canal de aquisicao']
    for (const t of toc) {
      const numMatch = t.match(/^(\d+)\./)
      if (numMatch) {
        p.drawText(numMatch[1] + '.', { x: M, y, size: 10, font: boldRef, color: C.primary })
        p.drawText(t.slice(numMatch[0].length), { x: M + 20, y, size: 10, font: fontRef, color: C.inkSoft })
      } else {
        p.drawText(t, { x: M + 8, y, size: 10, font: fontRef, color: C.inkSoft })
      }
      y -= 22
    }
    p.drawRectangle({ x: 0, y: 0, width: 3, height: H, color: C.primaryLight })
  }

  async function mktChapter(title, pages) {
    let y = 0
    for (let i = 0; i < pages.length; i++) {
      const p = blank(doc); pn++
      pageNum(p, pn)
      if (i === 0) { y = H - 60; y = sectionTitle(p, title, y) }
      else { y = H - 50 }

      for (const block of pages[i]) {
        y = renderBlock(p, block, y)
      }
    }
  }

  chapterDivider(doc, '01', 'Nicho e tudo', 'O maior erro de marketing e tentar falar com todo mundo'); pn++
  await mktChapter('1. Nicho e tudo', [
    [{ type: 'text', value: 'O maior erro de marketing que uma fonoaudiologa pode cometer e tentar falar com todo mundo. Quando voce tenta atender "todos os disturbios da fala", sua mensagem se dilui e nao conecta com ninguem.', sz: 10 },
     { type: 'gap' },
     { type: 'text', value: 'Por que nichar funciona:', sz: 10, col: C.ink },
     { type: 'bullet', value: 'Pacientes se sentem compreendidos quando a comunicacao fala diretamente sobre a dor deles' },
     { type: 'bullet', value: 'Voce se torna a referencia em um tema especifico (ex: "a fono da gagueira infantil")' },
     { type: 'bullet', value: 'Seu conteudo e mais facil de produzir porque voce sabe exatamente para quem esta falando' },
     { type: 'bullet', value: 'A concorrencia e menor: em vez de disputar com 200 fono na sua cidade, voce e a unica especialista' }],
    [{ type: 'text', value: 'Como definir seu nicho:', sz: 10 },
     { type: 'bullet', value: 'Liste as 3 areas que voce mais gosta de atender' },
     { type: 'bullet', value: 'Pesquise quantos profissionais na sua regiao ja sao referencia nessa area' },
     { type: 'bullet', value: 'Escolha a area com maior demanda insatisfeita' },
     { type: 'bullet', value: 'Exemplo: gagueira infantil, voz profissional para cantores, reabilitacao pos-AVC' }],
    [{ type: 'text', value: 'Exemplos de nichos que funcionam:', sz: 10 },
     { type: 'bullet', value: 'Voz profissional: cantores, professores, advogados, telemarketing' },
     { type: 'bullet', value: 'Gagueira infantil: criancas de 3 a 12 anos com disturbios de fluencia' },
     { type: 'bullet', value: 'Disfagia em idosos: reabilitacao da degluticao na terceira idade' },
     { type: 'bullet', value: 'Fono para autistas: comunicacao alternativa e socializacao' },
     { type: 'bullet', value: 'Atraso de fala: intervencao precoce (0 a 3 anos)' },
     { type: 'gap' },
     { type: 'callout', value: 'Exercicio: Em uma frase, complete "Eu ajudo [pessoa especifica] a [resolver problema especifico] sem [dor comum]".' }],
    [{ type: 'text', value: 'Caso de sucesso:', sz: 10 },
     { type: 'text', value: 'Dra. Carla, fonoaudiologa em Curitiba, resolveu focar apenas em voz profissional para cantores. Em 6 meses, triplicou o numero de pacientes. Ela criou um conteudo semanal no Instagram analisando performances vocais de cantores famosos. Resultado: 15 mil seguidores em 4 meses e agenda lotada.' }],
    [{ type: 'text', value: 'Passo a passo para definir seu nicho hoje:', sz: 10 },
     { type: 'bullet', value: 'Pegue uma folha de papel e liste seus 10 ultimos pacientes' },
     { type: 'bullet', value: 'Circule o perfil que mais se repete (ex: criancas com atraso de fala)' },
     { type: 'bullet', value: 'Pesquise no Google "fonoaudiologo [esse perfil] [sua cidade]"' },
     { type: 'bullet', value: 'Se houver menos de 3 concorrentes diretos, voce achou seu nicho' },
     { type: 'bullet', value: 'Se houver mais de 5, refine: "fonoaudiologo [perfil especifico] [bairro]"' },
     { type: 'gap' },
     { type: 'text', value: 'Pronto. Agora crie seu Instagram com esse nicho no nome de perfil.', sz: 10 }],
  ])

  chapterDivider(doc, '02', 'Google Meu Negocio', '80% dos pacientes buscam por "fonoaudiologo perto de mim"'); pn++
  await mktChapter('2. Google Meu Negocio', [
    [{ type: 'text', value: 'O Google Meu Negocio (GMN) e a ferramenta mais subestimada do marketing para fonoaudiologas. E tambem a mais efetiva: 80% dos pacientes buscam por "fonoaudiologo perto de mim" no Google.', sz: 10 },
     { type: 'gap' },
     { type: 'text', value: 'Checklist de otimizacao do GMN:', sz: 10, col: C.ink },
     { type: 'bullet', value: 'Verifique se seu perfil ja existe ou crie um novo' },
     { type: 'bullet', value: 'Complete todas as informacoes: endereco, telefone, site, horarios' },
     { type: 'bullet', value: 'Adicione fotos de qualidade: sua foto, da sala de atendimento, da recepcao' },
     { type: 'bullet', value: 'Liste seus servicos: "fonoaudiologia infantil", "terapia de voz", "disfagia"' },
     { type: 'bullet', value: 'Responda a todas as avaliacoes (boas e ruins) em ate 24h' }],
    [{ type: 'text', value: 'Palavras-chave para incluir no seu perfil:', sz: 10 },
     { type: 'bullet', value: '"fonoaudiologo [sua cidade]"' },
     { type: 'bullet', value: '"fonoaudiologo infantil [sua cidade]"' },
     { type: 'bullet', value: '"terapia de voz [sua cidade]"' },
     { type: 'bullet', value: '"fono para criancas [sua cidade]"' },
     { type: 'bullet', value: '"tratamento de gagueira [sua cidade]"' }],
    [{ type: 'text', value: 'Estrategia de avaliacoes:', sz: 10 },
     { type: 'bullet', value: 'Peca avaliacao para pacientes satisfeitos (1 a cada 10 pacientes)' },
     { type: 'bullet', value: 'Nunca ofereca desconto em troca de avaliacao (viola as politicas do Google)' },
     { type: 'bullet', value: 'Responda avaliacoes negativas com empatia e resolva o problema' },
     { type: 'bullet', value: 'Publique fotos e atualizacoes semanalmente no perfil' },
     { type: 'gap' },
     { type: 'callout', value: 'Dica: Publique 1 foto por semana no Google Meu Negocio. Perfis com fotos regulares tem 2,5x mais visualizacoes.' }],
    [{ type: 'text', value: 'Metricas para acompanhar:', sz: 10 },
     { type: 'bullet', value: 'Visualizacoes no mapa: quantas vezes seu perfil aparece em buscas locais' },
     { type: 'bullet', value: 'Cliques para ligar: quantas pessoas ligaram diretamente do perfil' },
     { type: 'bullet', value: 'Cliques para o site: quantas visitas seu site recebeu do GMN' },
     { type: 'bullet', value: 'Solicitacoes de rota: quantas pessoas pediram direcoes para sua clinica' },
     { type: 'gap' },
     { type: 'text', value: 'Meta inicial: 50 visualizacoes no mapa por semana. Atingindo isso, voce ja esta entre os primeiros resultados locais.', sz: 10 }],
    [{ type: 'text', value: 'Diferenciais que funcionam no perfil:', sz: 10 },
     { type: 'bullet', value: '"Atendimento humanizado" — frase mais buscada por pacientes' },
     { type: 'bullet', value: '"Primeira consulta com 50% de desconto" — conversao alta (se fizer sentido para seu modelo)' },
     { type: 'bullet', value: '"Atendimento online e presencial" — abrange ambos os perfis' }],
  ])

  chapterDivider(doc, '03', 'Conteudo que prova autoridade', 'Consistencia > Perfeicao. Publique 3x por semana durante 3 meses.'); pn++
  await mktChapter('3. Conteudo que prova autoridade', [
    [{ type: 'text', value: 'Conteudo e a principal ferramenta para construir autoridade digital. Mas nao e qualquer conteudo — precisa ser util, verdadeiro e consistente.', sz: 10 },
     { type: 'gap' },
     { type: 'text', value: '3 formatos que geram mais engajamento:', sz: 10, col: C.ink },
     { type: 'bullet', value: 'Mitos vs Fatos: "Atraso de fala e normal ate os 3 anos? MITO. Aqui estao os sinais de alerta."' },
     { type: 'bullet', value: 'Bastidor clinico (etico): "Como e uma sessao de terapia de voz? Mostro aqui sem expor o paciente."' },
     { type: 'bullet', value: 'Explicacao de procedimentos: "O que esperar de uma avaliacao fonoaudiologica completa."' }],
    [{ type: 'text', value: 'Exemplo de calendario editorial semanal:', sz: 10 },
     { type: 'bullet', value: 'Segunda: Post educativo (mito vs fato)' },
     { type: 'bullet', value: 'Quarta: Bastidor clinico ou case (sem identificacao)' },
     { type: 'bullet', value: 'Sexta: Dica rapida ou resposta pergunta frequente' },
     { type: 'bullet', value: 'Sabado: Conteudo mais pessoal (sua historia, motivacao)' }],
    [{ type: 'text', value: 'Regras de ouro do conteudo para saude:', sz: 10 },
     { type: 'bullet', value: 'Nunca diagnostique ou prescreva por rede social' },
     { type: 'bullet', value: 'Sempre inclua "consulte um especialista" em posts educativos' },
     { type: 'bullet', value: 'Nao exponha pacientes (mesmo com autorizacao, evite)' },
     { type: 'bullet', value: 'Use fontes confiaveis e mencione quando possivel' },
     { type: 'gap' },
     { type: 'callout', value: 'Consistencia > Perfeicao. Publique 3x por semana durante 3 meses antes de avaliar resultados.' }],
    [{ type: 'text', value: 'Ferramentas para criar conteudo:', sz: 10 },
     { type: 'bullet', value: 'Canva: design de posts e stories' },
     { type: 'bullet', value: 'CapCut: edicao de Reels (gratuito e completo)' },
     { type: 'bullet', value: 'Google Trends: descubra o que as pessoas estao buscando sobre fonoaudiologia' },
     { type: 'bullet', value: 'ChatGPT: gere ideias de pauta (mas sempre revise e personalize)' }],
    [{ type: 'text', value: 'Como medir se seu conteudo esta funcionando:', sz: 10 },
     { type: 'bullet', value: 'Pergunte a novos pacientes: "Como voce me conheceu?" — anote a resposta' },
     { type: 'bullet', value: 'Acompanhe o crescimento de seguidores (meta: 100 novos por mes no inicio)' },
     { type: 'bullet', value: 'Meça quantas mensagens recebe por semana perguntando sobre atendimento' },
     { type: 'bullet', value: 'A metrica que realmente importa: quantos agendamentos vieram do Instagram' },
     { type: 'gap' },
     { type: 'text', value: 'Se apos 3 meses de conteudo consistente voce nao viu aumento de agendamentos, mude a estrategia: troque o formato, o horario ou o tema.', sz: 10 }],
  ])

  chapterDivider(doc, '04', 'Instagram estrategico', 'Reels, carrosseis e stories que convertem'); pn++
  await mktChapter('4. Instagram estrategico', [
    [{ type: 'text', value: 'Instagram continua sendo a rede social com maior retorno para profissionais de saude no Brasil. Mas a estrategia mudou: nao adianta postar por postar.', sz: 10 },
     { type: 'gap' },
     { type: 'text', value: 'Os 3 formatos que convertem:', sz: 10, col: C.ink },
     { type: 'bullet', value: 'Reels educativos (ate 30 segundos): explicacao rapida de um conceito — "O que e disfagia?"' },
     { type: 'bullet', value: 'Carrosseis comparativos: "Fono para bebes: o que e normal vs sinal de alerta"' },
     { type: 'bullet', value: 'Stories de dia a dia: bastidores da clinica, preparacao, dicas rapidas' }],
    [{ type: 'text', value: 'Frequencia ideal:', sz: 10 },
     { type: 'bullet', value: 'Feed: 3-4 posts por semana (Reels + Carrossel)' },
     { type: 'bullet', value: 'Stories: 4-6 por dia (intercale conteudo util com bastidores)' },
     { type: 'bullet', value: 'Live: 1 vez por mes (tire duvidas ao vivo)' },
     { type: 'gap' },
     { type: 'callout', value: 'O algoritmo prioriza Reels e conteudo que gera salvamentos. Crie posts que as pessoas queiram salvar para consultar depois.' }],
    [{ type: 'text', value: 'Hashtags que funcionam para fono:', sz: 10 },
     { type: 'bullet', value: '#fonoaudiologia #fonoaudiologa #terapiafala (alto volume)' },
     { type: 'bullet', value: '#fonoinfantil #vozprofissional #disfagia (medio volume, alta intencao)' },
     { type: 'bullet', value: '#fonoaudiologa[curidade] #terapiadelinguagem (local + nicho)' }],
    [{ type: 'text', value: 'Metricas que importam:', sz: 10 },
     { type: 'bullet', value: 'Salvamentos: > 10% do alcance = conteudo util' },
     { type: 'bullet', value: 'Compartilhamentos: > 5% do alcance = conteudo relevante' },
     { type: 'bullet', value: 'Cliques no link da bio: principal metrica de conversao' },
     { type: 'bullet', value: 'Mensagens diretas: segundo maior conversor' }],
  ])

  chapterDivider(doc, '05', 'Rede de indicacoes medicas', 'Pediatras e otorrinos sao sua maior fonte de pacientes'); pn++
  await mktChapter('5. Rede de indicacoes medicas', [
    [{ type: 'text', value: 'Pediatras e otorrinos sao a maior fonte de encaminhamento de pacientes para fonoaudiologos. Uma boa relacao com esses profissionais pode encher sua agenda.', sz: 10 },
     { type: 'gap' },
     { type: 'text', value: 'Estrategia pratica:', sz: 10, col: C.ink },
     { type: 'bullet', value: 'Identifique os 5 medicos que mais encaminham pacientes na sua regiao' },
     { type: 'bullet', value: 'Marque 1 cafe ou visita rapida por mes com cada um' },
     { type: 'bullet', value: 'Leve um material de 1 pagina com seus diferenciais e areas de atuacao' },
     { type: 'bullet', value: 'Mantenha contato regular: Whatsapp, newsletter, resultado de pacientes' }],
    [{ type: 'text', value: 'O que levar na visita:', sz: 10 },
     { type: 'bullet', value: 'Cartao de visitas profissional' },
     { type: 'bullet', value: 'Folder 1 pagina com seus servicos e contato' },
     { type: 'bullet', value: 'Um caso clinico breve (sem identificacao) que mostra seu trabalho' },
     { type: 'bullet', value: 'Link do seu perfil profissional (Google Meu Negocio, Instagram)' }],
    [{ type: 'text', value: 'Como ser lembrado:', sz: 10 },
     { type: 'bullet', value: 'Envie um feedback rapido quando receber um paciente encaminhado' },
     { type: 'bullet', value: 'Compartilhe conteudo educativo que o medico possa repassar aos pacientes' },
     { type: 'bullet', value: 'Seja resolutiva: o medico confia em voce quando o paciente volta satisfeito' },
     { type: 'gap' },
      { type: 'callout', value: 'Rede de indicacao funciona como juros compostos: no primeiro mes, 1 indicacao. Em 12 meses, dezenas. Comece hoje.' }],
    [{ type: 'text', value: 'Sistema de rastreio de indicacoes:', sz: 10 },
     { type: 'text', value: 'Monte uma planilha simples com:', sz: 10 },
     { type: 'bullet', value: 'Nome do medico indicador' },
     { type: 'bullet', value: 'Data da indicacao' },
     { type: 'bullet', value: 'Nome do paciente indicado' },
     { type: 'bullet', value: 'Status (agendou / compareceu / fechou pacote)' },
     { type: 'bullet', value: 'Valor medio gerado por paciente' },
     { type: 'gap' },
     { type: 'text', value: 'Com 3 meses de dados, voce sabe exatamente qual medico mais indicou, o ticket medio por indicacao e o ROI de cada cafe que voce pagou.', sz: 10 },
     { type: 'gap' },
     { type: 'callout', value: 'Dica: Devolva o gesto. Um paciente que vem indicado por outro profissional merece um atendimento ainda mais cuidadoso — o medico indicador esta confiando o nome dele a voce.' }],
  ])

  chapterDivider(doc, '06', 'WhatsApp como canal de aquisicao', '5 passos para converter leads pelo chat'); pn++
  await mktChapter('6. WhatsApp como canal de aquisicao', [
    [{ type: 'text', value: 'O WhatsApp e o canal onde o paciente brasileiro ja esta. Usa-lo para nutricao de leads e o passo logico depois de atrair a atencao pelo Instagram ou Google.', sz: 10 },
     { type: 'gap' },
     { type: 'text', value: 'Fluxo de aquisicao pelo WhatsApp:', sz: 10, col: C.ink },
     { type: 'bullet', value: '1. Paciente descobre seu perfil (Google, Instagram, indicacao)' },
     { type: 'bullet', value: '2. Entra em contato pelo WhatsApp com uma duvida' },
     { type: 'bullet', value: '3. Voce responde com informacao util e convida para uma avaliacao' },
     { type: 'bullet', value: '4. Agendamento feito diretamente pelo chat' },
     { type: 'bullet', value: '5. Lembrete automatico enviado 24h e 1h antes' }],
    [{ type: 'text', value: 'O que nao fazer:', sz: 10 },
     { type: 'bullet', value: 'Nao use mensagens prontas e robotizadas — paciente percebe na hora' },
     { type: 'bullet', value: 'Nao envie mensagem fora do horario comercial' },
     { type: 'bullet', value: 'Nao compartilhe informacao clinica em grupos' },
     { type: 'bullet', value: 'Nao force a venda — o paciente precisa confiar primeiro' }],
    [{ type: 'text', value: 'Como o Evolua automatiza sem perder o tom humano:', sz: 10 },
     { type: 'bullet', value: 'Respostas rapidas para perguntas frequentes (horarios, precos, formas de pagamento)' },
     { type: 'bullet', value: 'Lembretes automaticos com nome do paciente e horario' },
     { type: 'bullet', value: 'Link de teleconsulta enviado no horario da sessao' },
     { type: 'bullet', value: 'Historico de conversas integrado ao prontuario' },
     { type: 'bullet', value: 'Envio de exercicios e materiais pos-consulta' },
     { type: 'gap' },
      { type: 'callout', value: 'Clinicas que automatizam o WhatsApp com o Evolua reduzem faltas em 43% e economizam 5h/semana em comunicacao.' }],
    [{ type: 'text', value: 'Campanhas de WhatsApp Broadcast:', sz: 10 },
     { type: 'text', value: 'O WhatsApp Business permite enviar mensagens em lote para listas de contatos que optaram por receber comunicados. Use com moderacao e estrategia.', sz: 10 },
     { type: 'gap' },
     { type: 'text', value: 'Ideias de campanha:', sz: 10 },
     { type: 'bullet', value: 'Dica de saude sazonal: "Cuidados com a voz no inverno" (julho)' },
     { type: 'bullet', value: 'Lembrete de avaliacao periodica: "Ja fez sua avaliacao fonoaduologica este ano?"' },
     { type: 'bullet', value: 'Novidades: "Agora atendemos na unidade norte" ou "Novo horario sabado"' },
     { type: 'bullet', value: 'Promocao de pacote de sessoes (apenas para ex-pacientes)' },
     { type: 'gap' },
     { type: 'alert', value: 'CUIDADO: A lista de transmissao nao e spam. Envie no maximo 2x por mes. Se o paciente responder "pare", respeite e remova.' }],
  ])

  { const p = blank(doc); pn++; pageNum(p, pn); cta(p) }

  const bytes = await doc.save()
  writeFileSync(resolve(OUT, 'ebook-mkt-digital-fono.pdf'), bytes)
  console.log(`* ebook-mkt-digital-fono.pdf (${pn} paginas)`)
}

// ════════════════════════════════════════════════════
//  4. INFOGRAFICO: MARCOS DO DESENVOLVIMENTO DA FALA
// ════════════════════════════════════════════════════
async function genInfograficoMarcos() {
  const { doc, f, b } = await createDoc()
  fontRef = f; boldRef = b

  const p = doc.addPage([W, H])

  // Header
  p.drawRectangle({ x: 0, y: 0, width: W, height: 170, color: C.deep })
  p.drawText('Marcos do Desenvolvimento', { x: M, y: 115, size: 28, font: boldRef, color: C.white })
  p.drawText('da Fala (0 a 6 anos)', { x: M, y: 88, size: 16, font: fontRef, color: rgb(0.55, 0.55, 0.8) })
  p.drawText('Baseado em CDC Milestones, ASHA e pesquisas brasileiras (2024)', { x: M, y: 68, size: 7, font: italicRef, color: C.inkSoft })
  p.drawRectangle({ x: M, y: 58, width: CW, height: 1, color: C.primaryLight })

  // Bar chart: vocabulary growth
  const chartY = 510
  barChart(p, [
    { label: '12m', val: 3 },
    { label: '18m', val: 20 },
    { label: '24m', val: 100 },
    { label: '3a', val: 300 },
    { label: '4a', val: 600 },
    { label: '5a', val: 1500 },
    { label: '6a', val: 2500 },
  ], chartY, 90)

  p.drawText('Evolucao do vocabulario expressivo (numero de palavras)', {
    x: M, y: chartY - 95, size: 7, font: italicRef, color: C.inkSoft,
  })

  // Timeline blocks
  let y = chartY - 115
  const milestones = [
    { idade: '0-6m', cor: C.primaryLight, itens: 'Choro, sons reflexos, contato visual' },
    { idade: '6-12m', cor: C.primaryLight, itens: 'Balbucio (ba-ba, da-da), aponta, entende "nao"' },
    { idade: '12-18m', cor: C.primaryLight, itens: 'Primeiras palavras (5-20), compreende comandos' },
    { idade: '18-24m', cor: C.primaryLight, itens: '50+ palavras, combina 2 palavras' },
    { idade: '2-3a', cor: C.primaryLight, itens: 'Frases de 3-4 palavras, perguntas' },
    { idade: '3-4a', cor: C.primaryLight, itens: 'Historias curtas, 75% inteligivel' },
    { idade: '4-5a', cor: C.primaryLight, itens: 'Frases complexas, 100% inteligivel' },
    { idade: '5-6a', cor: C.primaryLight, itens: 'Narrativa completa, consciencia fonologica' },
  ]

  // Vertical timeline line
  const lineX = M + 18
  for (const m of milestones) {
    if (y < 30) break
    const bh = 22
    y -= bh + 4
    // Circle on timeline
    p.drawEllipse({ x: lineX - 5, y: y - 5, width: 10, height: 10, color: C.primary })
    p.drawRectangle({ x: lineX, y: y - 5, width: 0.5, height: bh + 20, color: C.outline })
    // Badge
    const iw = boldRef.widthOfTextAtSize(m.idade, 8) + 16
    p.drawRectangle({ x: lineX + 16, y: y, width: iw, height: bh, color: C.primary })
    p.drawText(m.idade, { x: lineX + 20, y: y + 7, size: 8, font: boldRef, color: C.white })
    // Text
    p.drawText(m.itens, { x: lineX + iw + 24, y: y + 7, size: 8, font: fontRef, color: C.ink })
  }

  // Alert row
  if (y > 50) {
    y -= 30
    p.drawRectangle({ x: M, y, width: 4, height: 24, color: C.alertText })
    p.drawRectangle({ x: M + 4, y, width: CW - 4, height: 24, color: rgb(255/255, 240/255, 240/255) })
    p.drawText('SINAL DE ALERTA:', { x: M + 14, y: y + 8, size: 8, font: boldRef, color: C.alertText })
    p.drawText('Nao balbucia aos 12 meses / Sem palavras aos 18 meses / Perdeu habilidades ja adquiridas', { x: M + 110, y: y + 8, size: 7, font: fontRef, color: C.ink })
  }

  pageNum(p, 1)
  const bytes = await doc.save()
  writeFileSync(resolve(OUT, 'infografico-marcos-fala.pdf'), bytes)
  console.log(`* infografico-marcos-fala.pdf`)
}

// ════════════════════════════════════════════════════
//  5. INFOGRAFICO: COMO MONTAR SUA CLINICA
// ════════════════════════════════════════════════════
async function genInfograficoClinica() {
  const { doc, f, b } = await createDoc()
  fontRef = f; boldRef = b

  const p = doc.addPage([W, H])

  p.drawRectangle({ x: 0, y: 0, width: W, height: 170, color: C.deep })
  p.drawText('Como Montar sua Clinica', { x: M, y: 115, size: 28, font: boldRef, color: C.white })
  p.drawText('de Fonoaudiologia', { x: M, y: 88, size: 16, font: fontRef, color: rgb(0.55, 0.55, 0.8) })
  p.drawText('Passo a passo completo para estruturar sua clinica do zero', { x: M, y: 68, size: 7, font: italicRef, color: C.inkSoft })
  p.drawRectangle({ x: M, y: 58, width: CW, height: 1, color: C.primaryLight })

  // Cost breakdown bar chart
  const chartY = 490
  barChart(p, [
    { label: 'Aluguel', val: 35 },
    { label: 'Equip.', val: 25 },
    { label: 'Sistema', val: 12 },
    { label: 'Mkt', val: 10 },
    { label: 'Doc.', val: 8 },
    { label: 'Outros', val: 10 },
  ], chartY, 70)

  p.drawText('Distribuicao de custos iniciais (%)', {
    x: M, y: chartY - 78, size: 7, font: italicRef, color: C.inkSoft,
  })

  // Steps
  let y = chartY - 100
  const steps = [
    { num: '01', titulo: 'Documentacao', texto: 'Alvara sanitario, CNES, CRFa, contrato social' },
    { num: '02', titulo: 'Espaco fisico', texto: 'Sala de 10m2, recepcao, area adm' },
    { num: '03', titulo: 'Equipamentos', texto: 'Espelho, gravador, instrumentos, PC' },
    { num: '04', titulo: 'Sistemas', texto: 'Prontuario digital, agenda, financeiro' },
    { num: '05', titulo: 'Fluxo do paciente', texto: 'Cadastro > avaliacao > plano > sessoes > alta' },
    { num: '06', titulo: 'Precificacao', texto: 'Custo/sessao + margem, politica de faltas' },
    { num: '07', titulo: 'Marketing local', texto: 'Google, Instagram, parcerias medicas' },
    { num: '08', titulo: 'LGPD', texto: 'Consentimento, controle de acesso, auditoria' },
    { num: '09', titulo: 'Equipe', texto: 'Recepcionista, auxiliar, voce' },
  ]

  let py = y
  for (const s of steps) {
    if (py < 30) break
    py -= 42
    // Connector line
    p.drawRectangle({ x: M + 15, y: py + 32, width: 1, height: 42 - 4, color: C.outline })
  }

  for (const s of steps) {
    if (y < 30) break
    y -= 42
    // Number circle
    p.drawEllipse({ x: M + 8, y: y + 8, width: 16, height: 16, color: C.primary })
    p.drawText(s.num, { x: M + 9, y: y + 10, size: 8, font: boldRef, color: C.white })
    p.drawText(s.titulo, { x: M + 30, y: y + 14, size: 10, font: boldRef, color: C.ink })
    p.drawText(s.texto, { x: M + 30, y: y, size: 8, font: fontRef, color: C.inkSoft })
  }

  pageNum(p, 1)
  const bytes = await doc.save()
  writeFileSync(resolve(OUT, 'infografico-montar-clinica.pdf'), bytes)
  console.log(`* infografico-montar-clinica.pdf`)
}

// ════════════════════════════════════════════════════
//  RUN
// ════════════════════════════════════════════════════
await genTendencias()
await genProtocolos()
await genMkt()
await genInfograficoMarcos()
await genInfograficoClinica()

console.log('\nTodos os materiais gerados em:', OUT)
