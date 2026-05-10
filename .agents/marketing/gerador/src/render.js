// src/render.js
// Renderiza templates HTML em imagens PNG via Puppeteer

import puppeteer from "puppeteer";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { config, brand } from "./config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, "../templates");

let browserInstance = null;

async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
  }
  return browserInstance;
}

export async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

/**
 * Renderiza um template HTML preenchido como PNG
 * @param {string} htmlContent - HTML completo para renderizar
 * @param {string} outputPath - Caminho de saída do PNG
 * @param {{ width: number, height: number }} dimensions - Dimensões da imagem
 */
async function renderHtmlToPng(htmlContent, outputPath, dimensions) {
  const browser = await getBrowser();
  const page = await browser.newPage();

  await page.setViewport({
    width: dimensions.width,
    height: dimensions.height,
    deviceScaleFactor: 2, // 2x para qualidade maior
  });

  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  // Aguarda fontes carregarem
  await page.evaluateHandle("document.fonts.ready");

  await page.screenshot({
    path: outputPath,
    type: "png",
    clip: { x: 0, y: 0, width: dimensions.width, height: dimensions.height },
  });

  await page.close();
  return outputPath;
}

/**
 * Converte a descrição textual de ícone (vinda da IA) em um emoji adequado
 * e retorna o conteúdo do badge do slide de capa.
 * @param {string} iconeDescricao - Ex: "ícone de relógio ou pilha de papéis"
 * @param {string} pilar - Pilar editorial (opcional)
 */
function resolverBadge(iconeDescricao, pilar) {
  if (!iconeDescricao) return "📊 Fonoaudiologia";

  const desc = iconeDescricao.toLowerCase();

  if (desc.includes("relógio") || desc.includes("relogio") || desc.includes("tempo"))
    return "⏱️ Gestão de tempo";
  if (desc.includes("dinheiro") || desc.includes("financ") || desc.includes("cobrança") || desc.includes("pagamento"))
    return "💰 Gestão financeira";
  if (desc.includes("gráfico") || desc.includes("grafico") || desc.includes("dados") || desc.includes("dado"))
    return "📈 Dados clínicos";
  if (desc.includes("som") || desc.includes("aud") || desc.includes("microfone"))
    return "🔊 Fonoaudiologia";
  if (desc.includes("organiza") || desc.includes("pasta") || desc.includes("checklist") || desc.includes("prontuário"))
    return "📋 Organização clínica";
  if (desc.includes("calendar") || desc.includes("agenda"))
    return "📅 Agenda";
  if (desc.includes("paciente") || desc.includes("atendimento"))
    return "🩺 Atendimento";
  if (desc.includes("tecnologia") || desc.includes("digital") || desc.includes("sistema"))
    return "💻 Tecnologia";
  if (desc.includes("coração") || desc.includes("saúde") || desc.includes("saude"))
    return "❤️ Saúde";
  if (desc.includes("check") || desc.includes("sucesso") || desc.includes("resultado"))
    return "✅ Resultados";
  if (desc.includes("alerta") || desc.includes("erro") || desc.includes("problema"))
    return "⚠️ Atenção";

  return "📌 Fonoaudiologia";
}

/**
 * Lê um template HTML e substitui variáveis {{chave}} pelos valores
 * @param {string} templateName - Nome do arquivo (sem .html)
 * @param {Object} vars - Variáveis para substituir
 */
function preencherTemplate(templateName, vars) {
  const templatePath = path.join(TEMPLATES_DIR, `${templateName}.html`);
  let html = fs.readFileSync(templatePath, "utf-8");

  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    html = html.replace(regex, value ?? "");
  }

  return html;
}

/**
 * Renderiza todos os slides de um carrossel
 * @param {Object} postData - Dados do post (saída de generate-post.js)
 * @param {string} outputDir - Diretório de saída
 * @returns {string[]} - Array com caminhos dos PNGs gerados
 */
export async function renderCarrossel(postData, outputDir) {
  if (!config.render.images) {
    console.log("  ⏭️  Renderização de imagens desativada (RENDER_IMAGES=false)");
    return [];
  }

  const { slides } = postData;
  const pngs = [];
  const dims = { width: config.render.slideWidth, height: config.render.slideHeight };

  console.log(`  🖼️  Renderizando ${slides.length} slides do carrossel...`);

  for (const slide of slides) {
    const templateName = slide.tipo === "capa" ? "capa" : slide.tipo === "cta" ? "cta" : "conteudo";

    const vars = {
      TITULO: slide.titulo || "",
      SUBTITULO: slide.subtitulo || "",
      CORPO: slide.corpo || "",
      COR_FUNDO: slide.corFundo || brand.dark,
      COR_TEXTO: slide.corTexto || brand.branco,
      ICONE: slide.icone || "",
      BADGE: resolverBadge(slide.icone, postData.briefing?.pilar),
      FONTE: slide.fonte ? `<div class="fonte">${slide.fonte}</div>` : "",
      NUMERO: slide.numero,
      TOTAL: slides.length,
      ARROBA: "@useevoluaapp",
      NEON: brand.neon,
      DARK: brand.dark,
      PRIMARY: brand.primary,
    };

    const html = preencherTemplate(templateName, vars);
    const outputPath = path.join(outputDir, `slide-${String(slide.numero).padStart(2, "0")}.png`);

    await renderHtmlToPng(html, outputPath, dims);
    pngs.push(outputPath);
    console.log(`    ✓ slide-${slide.numero}.png`);
  }

  return pngs;
}

/**
 * Renderiza stories de um post
 * @param {Object} storiesData - { tipo, slides } ou array de slides
 * @param {string} outputDir - Diretório de saída
 * @returns {string[]} - Array com caminhos dos PNGs gerados
 */
export async function renderStories(storiesData, outputDir) {
  if (!config.render.images) return [];

  const dims = { width: config.render.storyWidth, height: config.render.storyHeight };
  const pngs = [];

  const slides = Array.isArray(storiesData) ? storiesData : storiesData.slides || [];

  console.log(`  📱 Renderizando ${slides.length} stories...`);

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const templateMap = {
      teaser: "story-teaser",
      dado: "story-dado",
      cta: "story-cta",
    };
    const templateName = templateMap[slide.tipo] || "story-teaser";

    const vars = {
      TITULO: slide.titulo || "",
      CORPO: slide.corpo || "",
      DADO: slide.dado || "",
      UNIDADE: slide.unidade || "",
      COR_FUNDO: slide.corFundo || brand.dark,
      COR_TEXTO: slide.corTexto || brand.branco,
      ARROBA: "@useevoluaapp",
      NEON: brand.neon,
      DARK: brand.dark,
      PRIMARY: brand.primary,
      NUMERO: i + 1,
      TOTAL: slides.length,
    };

    const html = preencherTemplate(templateName, vars);
    const outputPath = path.join(outputDir, `story-${String(i + 1).padStart(2, "0")}.png`);

    await renderHtmlToPng(html, outputPath, dims);
    pngs.push(outputPath);
    console.log(`    ✓ story-${i + 1}.png`);
  }

  return pngs;
}

/**
 * Renderiza um slide estático (post imagem única)
 * @param {Object} postData - Dados do post estático
 * @param {string} outputPath - Caminho do PNG de saída
 */
export async function renderEstatico(postData, outputPath) {
  if (!config.render.images) return null;

  const dims = { width: config.render.slideWidth, height: config.render.slideHeight };

  const vars = {
    TITULO: postData.titulo || "",
    SUBTITULO: postData.subtitulo || "",
    COR_FUNDO: postData.corFundo || brand.dark,
    COR_TEXTO: postData.corTexto || brand.branco,
    ARROBA: "@useevoluaapp",
    NEON: brand.neon,
    DARK: brand.dark,
    PRIMARY: brand.primary,
  };

  const html = preencherTemplate("capa", vars);
  await renderHtmlToPng(html, outputPath, dims);
  console.log(`  🖼️  Imagem estática renderizada: ${path.basename(outputPath)}`);
  return outputPath;
}

/**
 * Renderiza slides TikTok de um post
 * @param {Object} postData - Dados do post (slides de carrossel são reaproveitados)
 * @param {string} outputDir - Diretório de saída
 * @returns {string[]} - Array com caminhos dos PNGs gerados
 */
export async function renderTikTok(postData, outputDir) {
  if (!config.render.images) return [];

  const dims = { width: config.render.tiktokWidth, height: config.render.tiktokHeight };
  const { slides } = postData;
  const pngs = [];

  console.log(`  🎵 Renderizando ${slides.length} frames TikTok...`);

  for (const slide of slides) {
    let templateName;
    if (slide.tipo === "capa") templateName = "tiktok-hook";
    else if (slide.tipo === "cta") templateName = "tiktok-cta";
    else templateName = "tiktok-body";

    const vars = {
      TITULO: slide.titulo || "",
      SUBTITULO: slide.subtitulo || "",
      CORPO: slide.corpo || "",
      BADGE: resolverBadge(slide.icone, postData.briefing?.pilar),
      NUMERO: slide.numero,
      TOTAL: slides.length,
      ARROBA: "@useevoluaapp",
      NEON: brand.neon,
      DARK: brand.dark,
      PRIMARY: brand.primary,
    };

    const html = preencherTemplate(templateName, vars);
    const outputPath = path.join(outputDir, `tiktok-${String(slide.numero).padStart(2, "0")}.png`);

    await renderHtmlToPng(html, outputPath, dims);
    pngs.push(outputPath);
    console.log(`    ✓ tiktok-${slide.numero}.png`);
  }

  return pngs;
}

/**
 * Renderiza imagem OG de blog (1200×630)
 * @param {Object} artigo - { titulo, subtitulo, categoria }
 * @param {string} outputPath - Caminho do PNG de saída
 * @returns {string} - Caminho do PNG gerado
 */
export async function renderBlogOg(artigo, outputPath) {
  if (!config.render.images) return null;

  const dims = { width: config.render.blogWidth, height: config.render.blogHeight };

  const vars = {
    TITULO: artigo.titulo || "",
    SUBTITULO: artigo.subtitulo || artigo.descricao || "",
    CATEGORIA: artigo.categoria || "Blog",
    ARROBA: "@useevoluaapp",
    NEON: brand.neon,
    DARK: brand.dark,
    PRIMARY: brand.primary,
  };

  const html = preencherTemplate("blog-og", vars);
  await renderHtmlToPng(html, outputPath, dims);
  console.log(`  📰 Blog OG renderizada: ${path.basename(outputPath)}`);
  return outputPath;
}
