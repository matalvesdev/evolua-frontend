// src/generate-week.js
// Orquestrador principal: gera uma semana completa de conteúdo

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import { pesquisarSemana } from "./research.js";
import { gerarPost } from "./generate-post.js";
import { gerarBlogSemana } from "./blog-writer.js";
import { renderCarrossel, renderStories, renderEstatico, renderTikTok, renderBlogOg, closeBrowser } from "./render.js";
import { uploadPost, uploadBlog, salvarSemanaNoDb, inserirBlogPostsNoDb } from "./upload-to-supabase.js";
import { gerarRoteiroComponentes, gerarVariacoesHook, gerarScriptMontagem } from "./video-pipeline.js";
import { registrarSemana } from "./memory.js";
import { config } from "./config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "../output");

/**
 * Retorna a segunda-feira e domingo da semana que contém a data informada
 */
function getInicioFimSemana(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0=domingo ... 6=sábado
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (dt) =>
    `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  return { inicio: fmt(monday), fim: fmt(sunday) };
}

/**
 * Calcula o slug da semana no formato YYYY-MM-DD_a_YYYY-MM-DD
 */
function getSemanaSlug(date = new Date()) {
  const { inicio, fim } = getInicioFimSemana(date);
  return `${inicio}_a_${fim}`;
}

/**
 * Gera uma semana completa de conteúdo
 * @param {Object} opcoes
 * @param {string} [opcoes.semana] - Ex: "2026-W05". Padrão: semana atual
 * @param {string[]} [opcoes.temasFoco] - Temas para priorizar
 * @param {string[]} [opcoes.temasEvitar] - Temas já publicados recentemente
 * @param {boolean} [opcoes.upload] - Fazer upload para Supabase? Padrão: true
 * @param {boolean} [opcoes.somentePesquisa] - Apenas gerar briefing sem criar conteúdo?
 */
export async function gerarSemana(opcoes = {}) {
  const semana = opcoes.semana || getSemanaSlug();
  const fazerUpload = opcoes.upload !== false && !!config.supabase.url;
  const semanaDir = path.join(OUTPUT_DIR, semana);

  await fs.ensureDir(semanaDir);

  console.log(`\n${"=".repeat(60)}`);
  console.log(`🚀 GERADOR EVOLUA — Semana ${semana}`);
  console.log(`${"=".repeat(60)}\n`);

  // ── ETAPA 1: Pesquisa e briefing ──────────────────────────────
  const briefing = await pesquisarSemana({
    semana,
    numPosts: config.posts.porSemana,
    numBlogPosts: 2,
    temasFoco: opcoes.temasFoco || [],
    temasEvitar: opcoes.temasEvitar || [],
  });

  // Salvar briefing da semana
  await fs.writeJSON(path.join(semanaDir, "briefing.json"), briefing, { spaces: 2 });
  console.log(`\n📋 Briefing salvo em: output/${semana}/briefing.json`);

  if (opcoes.somentePesquisa) {
    console.log("\n✅ Modo somente-pesquisa: briefing gerado, sem criação de conteúdo.");
    return { semana, briefing };
  }

  // ── ETAPA 2: Gerar posts de Instagram ────────────────────────
  console.log(`\n${"─".repeat(60)}`);
  console.log(`📸 POSTS DE INSTAGRAM (${briefing.instagramPosts.length} posts)`);
  console.log(`${"─".repeat(60)}`);

  const postsGerados = [];

  for (const postBriefing of briefing.instagramPosts) {
    try {
      const postData = await gerarPost(postBriefing, semanaDir);
      const postDir = postData.postDir;

      // Renderizar imagens se for carrossel ou estático
      if (postData.tipo === "carrossel" && postData.slides) {
        const pngs = await renderCarrossel(postData, postDir);
        postData.imageFiles = pngs;
      } else if (postData.tipo === "estatico") {
        const png = await renderEstatico(postData, path.join(postDir, "post.png"));
        postData.imageFiles = png ? [png] : [];
      }

      // Renderizar stories se configurado
      if (postBriefing.stories && postBriefing.storyConfig) {
        const storyDir = path.join(postDir, "stories");
        await fs.ensureDir(storyDir);
        const storyPngs = await renderStories(postBriefing.storyConfig, storyDir);
        postData.storyFiles = storyPngs;
      }

      // Renderizar versão TikTok (reaproveitando slides do carrossel)
      if (postData.tipo === "carrossel" && postData.slides) {
        const tiktokDir = path.join(postDir, "tiktok");
        await fs.ensureDir(tiktokDir);
        const tiktokPngs = await renderTikTok(postData, tiktokDir);
        postData.tiktokFiles = tiktokPngs;
      }

      // Upload para Supabase
      let urls = {};
      if (fazerUpload) {
        const slug = path.basename(postDir);
        urls = await uploadPost(postDir, semana, slug);
      }

      postsGerados.push({ ...postData, urls });
    } catch (err) {
      console.error(`\n❌ Erro ao gerar post "${postBriefing.tema}": ${err.message}`);
    }
  }

  // ── ETAPA 3: Gerar roteiros de Reels (video pipeline) ────────
  console.log(`\n${"─".repeat(60)}`);
  console.log(`🎬 ROTEIROS DE REELS (video pipeline G4OS)`);
  console.log(`${"─".repeat(60)}`);

  const reelsGerados = [];

  for (const postBriefing of briefing.instagramPosts.filter((p) => p.formato?.toLowerCase().includes("reels"))) {
    try {
      const roteiroDir = path.join(semanaDir, `reels-${postBriefing.tema.slice(0, 30).replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`);
      await fs.ensureDir(roteiroDir);

      // Gera componentes Hook + Body + CTA separados
      const roteiro = await gerarRoteiroComponentes({
        tema: postBriefing.tema,
        ganchoAmplo: postBriefing.ganchoAmplo || postBriefing.tema,
        insight: postBriefing.insight || postBriefing.angulo,
        cta: postBriefing.cta,
        duracao: postBriefing.duracaoReels || 30,
      });

      // Gera 3 variações de hook para A/B test
      const variacoes = await gerarVariacoesHook(
        postBriefing.tema,
        roteiro.hook?.texto || roteiro.hook || "",
        3
      );
      roteiro.variacoesHook = variacoes;

      // Exporta script de montagem para DaVinci/CapCut
      await gerarScriptMontagem(roteiro, roteiroDir);

      await fs.writeJSON(path.join(roteiroDir, "roteiro.json"), roteiro, { spaces: 2 });
      console.log(`   ✅ Roteiro: ${postBriefing.tema}`);

      reelsGerados.push({ tema: postBriefing.tema, roteiroDir, roteiro });
    } catch (err) {
      console.error(`\n❌ Erro ao gerar roteiro "${postBriefing.tema}": ${err.message}`);
    }
  }

  // ── ETAPA 4: Gerar artigos de blog ─────────────────────────────
  console.log(`\n${"─".repeat(60)}`);
  console.log(`📝 ARTIGOS DE BLOG (${briefing.blogPosts.length} artigos)`);
  console.log(`${"─".repeat(60)}`);

  let blogGerado = [];
  let blogMetas = [];
  try {
    blogMetas = await gerarBlogSemana(briefing.blogPosts);
    blogGerado = blogMetas;

    // Renderizar OG image para cada artigo
    for (const artigo of blogMetas) {
      if (artigo.slug) {
        const ogPath = path.join(__dirname, "../output/blog", artigo.slug, "og.png");
        await renderBlogOg(artigo, ogPath).catch(() => null);
        artigo.ogImage = ogPath;
      }
    }

    if (fazerUpload) {
      const blogDir = path.join(__dirname, "../output/blog");
      const uploads = await uploadBlog(blogDir, semana);
      // Insere/atualiza registros em public.blog_posts (alimenta /blog da landing)
      await inserirBlogPostsNoDb(blogMetas, uploads, blogDir);
      // Mescla URLs nos metas para o relatório
      const urlBySlug = new Map(uploads.map((u) => [u.slug, u]));
      blogGerado = blogMetas.map((m) => ({ ...m, ...(urlBySlug.get(m.slug) || {}) }));
    }
  } catch (err) {
    console.error(`\n❌ Erro ao gerar blog: ${err.message}`);
  }

  // ── ETAPA 5: Registrar na memória (evitar repetição futura) ──────────────
  try {
    await registrarSemana(semana, briefing.instagramPosts);
  } catch (err) {
    console.warn(`\n⚠️  Falha ao registrar memória: ${err.message}`);
  }

  // ── ETAPA 6: Relatório final ───────────────────────────────────
  const relatorio = {
    semana,
    geradoEm: new Date().toISOString(),
    briefing: briefing.resumo,
    posts: postsGerados.map((p) => ({
      tema: p.briefing?.tema,
      formato: p.briefing?.formato,
      tipo: p.tipo,
      legenda: p.legenda?.slice(0, 100) + "...",
      imagens: p.imageFiles?.length || 0,
      stories: p.storyFiles?.length || 0,
      tiktok: p.tiktokFiles?.length || 0,
      urls: p.urls,
    })),
    reels: reelsGerados.map((r) => ({
      tema: r.tema,
      variacoesHook: r.roteiro?.variacoesHook?.length || 0,
      duracaoTotal: r.roteiro?.duracaoTotal,
      scriptMontagem: path.join(r.roteiroDir, "script-montagem.md"),
    })),
    blog: blogGerado,
  };

  await fs.writeJSON(path.join(semanaDir, "relatorio.json"), relatorio, { spaces: 2 });

  if (fazerUpload) {
    await salvarSemanaNoDb(relatorio);
  }

  // Fechar Puppeteer
  await closeBrowser();

  console.log(`\n${"=".repeat(60)}`);
  console.log(`✅ SEMANA ${semana} CONCLUÍDA`);
  console.log(`   Posts gerados: ${postsGerados.length}`);
  console.log(`   Roteiros de Reels: ${reelsGerados.length}`);
  console.log(`   Artigos de blog: ${blogGerado.length}`);
  console.log(`   Relatório: output/${semana}/relatorio.json`);
  console.log(`${"=".repeat(60)}\n`);

  return relatorio;
}
