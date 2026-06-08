#!/usr/bin/env node
/**
 * Send Creative Pack — empacota e envia por email o pack mensal de criativos.
 *
 * Uso:
 *   node scripts/send-creative-pack.mjs
 *
 * Env vars:
 *   RESEND_API_KEY (obrigatório)
 *   RESEND_FROM_EMAIL (opcional, default: noreply@useevolua.com.br)
 */

import { execSync } from 'node:child_process'
import { readFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')
const OUTPUT_DIR = resolve(PROJECT_ROOT, 'scripts', 'content-pipeline', 'output')
const PACK_NAME = `evolua-pack-julho-2026`

// Ensure output dir exists
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true })
}

console.log(`[PACK] Criando pacote ${PACK_NAME}...`)

// Create tar.gz archive with all creative assets
const filesToPackage = [
  'docs/content-assets/03-instagram-feed/carrossel-5-passos.html',
  'docs/content-assets/01-social-posts/linkedin-posts-julho-2026.html',
  'docs/content-assets/06-campaigns/julho-2026/',
  'docs/content-assets/05-lead-magnets/emails/',
  'docs/content-assets/05-lead-magnets/ebook-whatsapp-profissional.html',
  'docs/content-assets/05-lead-magnets/ebook-mkt-digital-fono.html',
  'docs/content-assets/05-lead-magnets/infraco-estrategia-precos.html',
  'docs/content-assets/05-lead-magnets/infraco-atendimento-humanizado.html',
  'docs/content-assets/05-lead-magnets/materials-catalog.json',
]

// Git Bash tar: use relative path for output, CWD is project root
const relOutput = `${PACK_NAME}.tar.gz`
try {
  execSync(`tar -czf "${relOutput}" ${filesToPackage.map(f => `"${f}"`).join(' ')}`, {
    stdio: 'pipe',
    cwd: PROJECT_ROOT,
  })
  // Move file to output dir
  execSync(`mv "${PROJECT_ROOT}/${relOutput}" "${OUTPUT_DIR}/${relOutput}"`, { stdio: 'pipe' })
  console.log(`[PACK] Arquivo criado: ${OUTPUT_DIR}/${relOutput}`)
} catch (err) {
  console.error('[PACK] Erro ao criar tar.gz:', err.message)
  process.exit(1)
}

// Read the file for base64 encoding
const filePath = resolve(OUTPUT_DIR, `${PACK_NAME}.tar.gz`)
const fileBuffer = readFileSync(filePath)
const base64Content = fileBuffer.toString('base64')

// Send via Resend
const apiKey = process.env.RESEND_API_KEY
const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@useevolua.com.br'

if (!apiKey) {
  console.log('[EMAIL] ⚠️  RESEND_API_KEY não definida. Pacote salvo em:')
  console.log(`[EMAIL] ${filePath}`)
  process.exit(0)
}

console.log('[EMAIL] Enviando pacote via Resend...')

const emailHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
  </style>
</head>
<body style="margin:0;padding:0;background:#F5F3FF;font-family:'Inter',Arial,sans-serif">
  <div style="max-width:580px;margin:24px auto;background:#FFFFFF;border-radius:0;overflow:hidden">
    <div style="background:#0A0A14;padding:48px 40px 32px;text-align:center">
      <div style="font-size:32px;font-weight:900;letter-spacing:-0.03em;color:#C4F135;margin-bottom:8px">evolua</div>
      <h1 style="font-family:'Inter',Arial,sans-serif;color:#FFFFFF;margin:0;font-size:22px;font-weight:700">Pack de Criativos • Julho 2026</h1>
      <p style="color:#8B5CF6;margin:8px 0 0;font-size:13px">Pronto para publicar</p>
    </div>
    <div style="padding:32px">

      <p style="font-size:15px;line-height:1.6;color:#1A1A2E;margin:0 0 24px">Olá! O pack de criativos de <strong>Julho 2026</strong> está pronto. Aqui está o resumo do que você vai encontrar:</p>

      <div style="display:grid;gap:16px;margin-bottom:28px">

        <div style="background:#F5F3FF;padding:16px;border-left:3px solid #8B5CF6">
          <div style="font-size:11px;font-weight:700;color:#8B5CF6;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:4px">Instagram Carrossel</div>
          <div style="font-size:14px;color:#1A1A2E">5 slides — "5 Passos para Transformar sua Clínica"<br>Formato: HTML (1080x1080px, pronto para screenshot)</div>
        </div>

        <div style="background:#F5F3FF;padding:16px;border-left:3px solid #0A66C2">
          <div style="font-size:11px;font-weight:700;color:#0A66C2;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:4px">LinkedIn Posts</div>
          <div style="font-size:14px;color:#1A1A2E">6 posts completos com visual mockup<br>Diagnóstico Financeiro, Marketing Ético, IA, Teleconsulta, Precificação, Case</div>
        </div>

        <div style="background:#F5F3FF;padding:16px;border-left:3px solid #C4F135">
          <div style="font-size:11px;font-weight:700;color:#0A0A14;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:4px">Campanha Meta Ads + Google Ads</div>
          <div style="font-size:14px;color:#1A1A2E">3 Feed + 2 Story + 3 Search Ads + 2 YouTube Pre-roll<br>Configurações completas de campanha e legendas</div>
        </div>

        <div style="background:#F5F3FF;padding:16px;border-left:3px solid #120D1E">
          <div style="font-size:11px;font-weight:700;color:#120D1E;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:4px">E-mails de Nutrição (Drip)</div>
          <div style="font-size:14px;color:#1A1A2E">5 emails + template mestre<br>Contraste WCAG AA garantido em todos</div>
        </div>

        <div style="background:#F5F3FF;padding:16px;border-left:3px solid #5B21B6">
          <div style="font-size:11px;font-weight:700;color:#5B21B6;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:4px">Novos Materiais (Lead Magnets)</div>
          <div style="font-size:14px;color:#1A1A2E">2 novos e-books + 2 novos infográficos<br>WhatsApp Profissional, Marketing Digital, Preços, Atendimento Humanizado</div>
        </div>

      </div>

      <div style="background:#0A0A14;text-align:center;padding:20px">
        <p style="color:#C4F135;font-size:13px;font-weight:700;margin:0 0 4px">⬇ Arquivo anexo: evolua-pack-julho-2026.tar.gz</p>
        <p style="color:#8B5CF6;font-size:12px;margin:0">Extraia e publique! 🚀</p>
      </div>

      <div style="margin-top:24px;padding-top:20px;border-top:1px solid #E2E8F0">
        <p style="font-size:11px;color:#8B5CF6;margin:0;text-align:center;letter-spacing:0.05em">
          EVOLUA — Gestão Inteligente para Fonoaudiólogas<br>
          Gerado em ${new Date().toLocaleString('pt-BR')}
        </p>
      </div>
    </div>
  </div>
</body>
</html>`

const textBody = `Pack de Criativos Evolua — Julho 2026

O pack completo está anexo. Conteúdo:
- Instagram Carrossel: 5 slides (HTML)
- LinkedIn: 6 posts prontos (HTML)
- Meta Ads + Google Ads: criativos e configurações
- E-mails Drip: 5 templates + builder
- Lead Magnets: 2 e-books + 2 infográficos

Extraia o arquivo .tar.gz e publique!`

try {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: 'Evolua <noreply@useevolua.com.br>',
      to: 'contatouseevolua@gmail.com',
      subject: '📦 Pack de Criativos Evolua — Julho 2026 | Pronto para Publicar',
      html: emailHtml,
      text: textBody,
      attachments: [
        {
          filename: `${PACK_NAME}.tar.gz`,
          content: base64Content,
        },
      ],
    }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    console.error('[EMAIL] Erro Resend:', res.status, errBody)
    process.exit(1)
  }

  const data = await res.json()
  console.log(`[EMAIL] ✅ Enviado com sucesso! ID: ${data.id}`)
  console.log(`[EMAIL] Para: contatouseevolua@gmail.com`)
  console.log(`[EMAIL] Arquivo: ${PACK_NAME}.tar.gz (${(fileBuffer.length / 1024).toFixed(1)} KB)`)
} catch (err) {
  console.error('[EMAIL] Erro ao enviar:', err.message)
  process.exit(1)
}
