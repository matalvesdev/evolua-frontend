// src/email-report.js
// Envia o resumo semanal de conteúdo gerado por email

import nodemailer from "nodemailer";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "../output");

/**
 * Retorna o slug da semana atual no formato YYYY-MM-DD_a_YYYY-MM-DD
 */
function getSemanaSlug(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (dt) =>
    `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  return `${fmt(monday)}_a_${fmt(sunday)}`;
}

/**
 * Lê o relatorio.json de uma semana
 */
async function lerRelatorio(semanaSlug) {
  const relatorioPath = path.join(OUTPUT_DIR, semanaSlug, "relatorio.json");
  if (await fs.pathExists(relatorioPath)) {
    return fs.readJSON(relatorioPath);
  }
  return null;
}

/**
 * Lê o briefing.json de uma semana
 */
async function lerBriefing(semanaSlug) {
  const briefingPath = path.join(OUTPUT_DIR, semanaSlug, "briefing.json");
  if (await fs.pathExists(briefingPath)) {
    return fs.readJSON(briefingPath);
  }
  return null;
}

/**
 * Lê todos os posts gerados na semana
 */
async function lerPosts(semanaSlug) {
  const semanaDir = path.join(OUTPUT_DIR, semanaSlug);
  if (!(await fs.pathExists(semanaDir))) return [];

  const entries = await fs.readdir(semanaDir);
  const posts = [];

  for (const entry of entries) {
    const postJsonPath = path.join(semanaDir, entry, "instagram-post.json");
    if (await fs.pathExists(postJsonPath)) {
      const post = await fs.readJSON(postJsonPath);
      posts.push({ slug: entry, ...post });
    }
  }

  return posts;
}

/**
 * Lê todos os artigos de blog gerados
 */
async function lerBlogPosts(semanaSlug) {
  const blogDir = path.join(OUTPUT_DIR, "blog");
  if (!(await fs.pathExists(blogDir))) return [];

  const files = await fs.readdir(blogDir);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));
  const posts = [];

  for (const file of jsonFiles) {
    const post = await fs.readJSON(path.join(blogDir, file));
    // Filtra só os da semana atual (pelo campo geradoEm, se existir)
    posts.push(post);
  }

  // Retorna os últimos 3 (mais recentes)
  return posts.slice(-3);
}

/**
 * Gera o HTML do email de resumo
 */
function gerarHtmlEmail({ semana, posts, blogPosts, briefing, relatorio }) {
  const totalSlides = posts.reduce((acc, p) => acc + (p.slides?.length || 0), 0);
  const totalStories = posts.filter((p) => p.stories).length;
  const uploadOk = relatorio?.uploadStatus === "success";

  const postsHtml = posts
    .map(
      (p, i) => `
    <tr>
      <td style="padding:12px 16px; border-bottom:1px solid #E0DFEF; font-family:'DM Sans',sans-serif; font-size:14px; color:#1A1A2E;">
        <strong>${i + 1}. ${p.titulo || p.slug}</strong>
        ${p.pilar ? `<br><span style="font-size:11px; color:#8888AA; text-transform:uppercase; letter-spacing:0.1em;">Pilar ${p.pilar} · ${p.tipo || "carrossel"}</span>` : ""}
        ${p.palavraChave ? `<br><span style="font-size:11px; color:#6C63FF;">🔑 ${p.palavraChave}</span>` : ""}
      </td>
      <td style="padding:12px 16px; border-bottom:1px solid #E0DFEF; font-family:'DM Sans',sans-serif; font-size:13px; color:#4A4A6A; text-align:center;">
        ${p.slides?.length || 0} slides
      </td>
      <td style="padding:12px 16px; border-bottom:1px solid #E0DFEF; text-align:center;">
        ${uploadOk && p.urlCarrossel ? `<a href="${p.urlCarrossel}" style="color:#6C63FF; font-size:12px; font-family:'DM Sans',sans-serif;">Ver no Storage</a>` : '<span style="color:#8888AA; font-size:12px; font-family:\'DM Sans\',sans-serif;">Local</span>'}
      </td>
    </tr>`
    )
    .join("");

  const blogHtml = blogPosts
    .map(
      (b) => `
    <tr>
      <td style="padding:12px 16px; border-bottom:1px solid #E0DFEF; font-family:'DM Sans',sans-serif; font-size:14px; color:#1A1A2E;">
        <strong>${b.titulo || b.slug}</strong>
        ${b.categoria ? `<br><span style="font-size:11px; color:#8888AA; text-transform:uppercase; letter-spacing:0.1em;">${b.categoria}</span>` : ""}
        ${b.palavraChavePrincipal ? `<br><span style="font-size:11px; color:#6C63FF;">🔑 ${b.palavraChavePrincipal}</span>` : ""}
      </td>
      <td style="padding:12px 16px; border-bottom:1px solid #E0DFEF; font-family:'DM Sans',sans-serif; font-size:13px; color:#4A4A6A; text-align:center;">
        ${b.tempoLeituraMin || "–"} min
      </td>
      <td style="padding:12px 16px; border-bottom:1px solid #E0DFEF; text-align:center;">
        ${b.urlHtml ? `<a href="${b.urlHtml}" style="color:#6C63FF; font-size:12px; font-family:'DM Sans',sans-serif;">Ver artigo</a>` : '<span style="color:#8888AA; font-size:12px;">Local</span>'}
      </td>
    </tr>`
    )
    .join("");

  const temasBriefing = briefing?.temas
    ? briefing.temas
        .map(
          (t) => `<li style="margin-bottom:8px; font-family:'DM Sans',sans-serif; font-size:14px; color:#4A4A6A;">
          <strong style="color:#1A1A2E;">${t.titulo || t.tema}</strong>
          ${t.pilar ? ` · Pilar ${t.pilar}` : ""}
          ${t.fonte ? `<br><span style="font-size:12px; color:#8888AA;">Fonte: ${t.fonte}</span>` : ""}
        </li>`
        )
        .join("")
    : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Semanal de Conteúdo — Evolua</title>
</head>
<body style="margin:0; padding:0; background-color:#F8F8FF; font-family:'DM Sans',Arial,sans-serif;">

  <!-- Header -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#6C63FF;">
    <tr>
      <td style="padding:32px 40px;">
        <p style="margin:0; font-size:11px; font-weight:700; letter-spacing:0.4em; text-transform:uppercase; color:rgba(255,255,255,0.6);">Evolua · Marketing</p>
        <h1 style="margin:8px 0 4px; font-size:28px; font-weight:900; color:#FFFFFF; letter-spacing:-0.03em; line-height:1;">
          Conteúdo da Semana
        </h1>
        <p style="margin:0; font-size:13px; color:rgba(255,255,255,0.7);">${semana.replace(/_a_/, " a ")}</p>
      </td>
    </tr>
  </table>

  <!-- Resumo -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF; border-bottom:1px solid #E0DFEF;">
    <tr>
      <td style="padding:32px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align:center; padding:16px;">
              <p style="margin:0; font-size:36px; font-weight:900; color:#6C63FF; letter-spacing:-0.03em;">${posts.length}</p>
              <p style="margin:4px 0 0; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.2em; color:#8888AA;">Posts Instagram</p>
            </td>
            <td style="text-align:center; padding:16px; border-left:1px solid #E0DFEF;">
              <p style="margin:0; font-size:36px; font-weight:900; color:#6C63FF; letter-spacing:-0.03em;">${totalSlides}</p>
              <p style="margin:4px 0 0; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.2em; color:#8888AA;">Slides Gerados</p>
            </td>
            <td style="text-align:center; padding:16px; border-left:1px solid #E0DFEF;">
              <p style="margin:0; font-size:36px; font-weight:900; color:#6C63FF; letter-spacing:-0.03em;">${blogPosts.length}</p>
              <p style="margin:4px 0 0; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.2em; color:#8888AA;">Artigos de Blog</p>
            </td>
            <td style="text-align:center; padding:16px; border-left:1px solid #E0DFEF;">
              <p style="margin:0; font-size:36px; font-weight:900; color:${uploadOk ? "#C4F135" : "#FB7185"}; letter-spacing:-0.03em;">${uploadOk ? "✓" : "–"}</p>
              <p style="margin:4px 0 0; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.2em; color:#8888AA;">Upload Supabase</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px; margin:0 auto;">
    <tr><td style="padding:0 40px;">

      <!-- Posts Instagram -->
      ${posts.length > 0 ? `
      <h2 style="margin:32px 0 16px; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.3em; color:#6C63FF;">Posts Instagram</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E0DFEF;">
        <thead>
          <tr style="background-color:#F0EFF9;">
            <th style="padding:10px 16px; text-align:left; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.2em; color:#8888AA;">Post</th>
            <th style="padding:10px 16px; text-align:center; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.2em; color:#8888AA; width:80px;">Slides</th>
            <th style="padding:10px 16px; text-align:center; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.2em; color:#8888AA; width:100px;">Link</th>
          </tr>
        </thead>
        <tbody>${postsHtml}</tbody>
      </table>` : ""}

      <!-- Artigos de Blog -->
      ${blogPosts.length > 0 ? `
      <h2 style="margin:32px 0 16px; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.3em; color:#6C63FF;">Artigos de Blog</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E0DFEF;">
        <thead>
          <tr style="background-color:#F0EFF9;">
            <th style="padding:10px 16px; text-align:left; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.2em; color:#8888AA;">Artigo</th>
            <th style="padding:10px 16px; text-align:center; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.2em; color:#8888AA; width:80px;">Leitura</th>
            <th style="padding:10px 16px; text-align:center; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.2em; color:#8888AA; width:100px;">Link</th>
          </tr>
        </thead>
        <tbody>${blogHtml}</tbody>
      </table>` : ""}

      <!-- Briefing de temas -->
      ${temasBriefing ? `
      <h2 style="margin:32px 0 16px; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.3em; color:#6C63FF;">Briefing de Temas</h2>
      <div style="background-color:#F0EFF9; padding:20px 24px; border-left:3px solid #6C63FF;">
        <ul style="margin:0; padding-left:16px; list-style:disc;">${temasBriefing}</ul>
      </div>` : ""}

      <!-- Próximos passos -->
      <div style="margin:32px 0; padding:20px 24px; background-color:#EAE8FF; border-left:3px solid #6C63FF;">
        <p style="margin:0 0 8px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.3em; color:#6C63FF;">Próximos passos</p>
        <ul style="margin:0; padding-left:16px; list-style:disc;">
          <li style="font-family:'DM Sans',sans-serif; font-size:14px; color:#4A4A6A; margin-bottom:6px;">Revisar legendas e ajustar antes de postar</li>
          <li style="font-family:'DM Sans',sans-serif; font-size:14px; color:#4A4A6A; margin-bottom:6px;">Agendar posts no Creator Studio ou Buffer</li>
          <li style="font-family:'DM Sans',sans-serif; font-size:14px; color:#4A4A6A; margin-bottom:6px;">Publicar artigos de blog no CMS</li>
          <li style="font-family:'DM Sans',sans-serif; font-size:14px; color:#4A4A6A;">Revisar hashtags antes de publicar</li>
        </ul>
      </div>

      <!-- Output path -->
      <p style="font-family:'DM Sans',sans-serif; font-size:12px; color:#8888AA; margin:24px 0 0;">
        📁 Arquivos salvos em: <code style="background:#F0EFF9; padding:2px 6px; font-size:11px;">.agents/marketing/gerador/output/${semana}/</code>
      </p>

    </td></tr>
  </table>

  <!-- Footer -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#2D2B55; margin-top:40px;">
    <tr>
      <td style="padding:24px 40px; text-align:center;">
        <p style="margin:0; font-size:11px; color:rgba(255,255,255,0.4); font-family:'DM Sans',sans-serif;">
          Evolua · Relatório gerado automaticamente em ${new Date().toLocaleDateString("pt-BR", { dateStyle: "full" })}
        </p>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

/**
 * Envia o email de relatório semanal
 * @param {string} semanaSlug - ex: "2026-05-05_a_2026-05-11"
 */
export async function enviarRelatorioSemanal(semanaSlug) {
  const {
    GMAIL_USER,
    GMAIL_APP_PASSWORD,
    EMAIL_DESTINO = "mateusalvesbassanelli@gmail.com",
  } = process.env;

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.warn(
      "⚠️  GMAIL_USER ou GMAIL_APP_PASSWORD não configurados — email não enviado.\n" +
        "   Adicione ao .env: GMAIL_USER e GMAIL_APP_PASSWORD\n" +
        "   (Gere uma App Password em: https://myaccount.google.com/apppasswords)"
    );
    return;
  }

  const slug = semanaSlug || getSemanaSlug();
  console.log(`\n📧 Preparando relatório da semana ${slug}...`);

  const [relatorio, briefing, posts, blogPosts] = await Promise.all([
    lerRelatorio(slug),
    lerBriefing(slug),
    lerPosts(slug),
    lerBlogPosts(slug),
  ]);

  const htmlEmail = gerarHtmlEmail({
    semana: slug,
    posts,
    blogPosts,
    briefing,
    relatorio,
  });

  const assunto = `[Evolua] Conteúdo da semana ${slug.replace(/_a_/, " a ")} — ${posts.length} posts + ${blogPosts.length} artigos`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Evolua Marketing" <${GMAIL_USER}>`,
    to: EMAIL_DESTINO,
    subject: assunto,
    html: htmlEmail,
  });

  console.log(`✅ Email enviado para ${EMAIL_DESTINO}`);
  console.log(`   Assunto: ${assunto}`);
}
