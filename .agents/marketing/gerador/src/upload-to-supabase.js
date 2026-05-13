// src/upload-to-supabase.js
// Faz upload dos assets gerados para o Supabase Storage

import { createClient } from "@supabase/supabase-js";
import fs from "fs-extra";
import path from "path";
import { config } from "./config.js";
import mime from "mime-types";

let supabaseClient = null;

function getSupabase() {
  if (!supabaseClient) {
    if (!config.supabase.url || !config.supabase.serviceRoleKey) {
      throw new Error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios para upload");
    }
    supabaseClient = createClient(config.supabase.url, config.supabase.serviceRoleKey);
  }
  return supabaseClient;
}

/**
 * Faz upload de um único arquivo para o Supabase Storage
 * @param {string} localPath - Caminho local do arquivo
 * @param {string} storagePath - Caminho no bucket (ex: "semana-2026-01/post-slug/slide-01.png")
 * @returns {string} - URL pública do arquivo
 */
export async function uploadArquivo(localPath, storagePath) {
  const supabase = getSupabase();
  const fileBuffer = await fs.readFile(localPath);
  const contentType = mime.lookup(localPath) || "application/octet-stream";

  const { error } = await supabase.storage
    .from(config.supabase.bucket)
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Falha no upload de ${path.basename(localPath)}: ${error.message}`);
  }

  const { data } = supabase.storage.from(config.supabase.bucket).getPublicUrl(storagePath);
  return data.publicUrl;
}

/**
 * Faz upload de todos os assets de um post para o Supabase Storage
 * @param {string} postDir - Diretório local do post
 * @param {string} semanaSlug - Ex: "2026-W04"
 * @param {string} postSlug - Slug do post
 * @returns {Object} - { slides: string[], stories: string[], json: string, legenda: string }
 */
export async function uploadPost(postDir, semanaSlug, postSlug) {
  console.log(`  ☁️  Fazendo upload para Supabase Storage...`);

  const baseStorage = `${semanaSlug}/${postSlug}`;
  const resultado = { slides: [], stories: [], json: null, legenda: null };

  const arquivos = await fs.readdir(postDir);

  for (const arquivo of arquivos) {
    const localPath = path.join(postDir, arquivo);
    const stat = await fs.stat(localPath);
    if (stat.isDirectory()) continue;

    const storagePath = `${baseStorage}/${arquivo}`;

    try {
      const url = await uploadArquivo(localPath, storagePath);

      if (arquivo.startsWith("slide-") && arquivo.endsWith(".png")) {
        resultado.slides.push(url);
      } else if (arquivo.startsWith("story-") && arquivo.endsWith(".png")) {
        resultado.stories.push(url);
      } else if (arquivo.endsWith(".json")) {
        resultado.json = url;
      } else if (arquivo.endsWith(".txt")) {
        resultado.legenda = url;
      }

      console.log(`    ✓ ${arquivo}`);
    } catch (err) {
      console.error(`    ✗ Erro no upload de ${arquivo}: ${err.message}`);
    }
  }

  return resultado;
}

/**
 * Faz upload de artigos de blog para o Supabase Storage
 * Inclui og.png em subpasta por slug (output/blog/<slug>/og.png)
 * @param {string} blogDir - Diretório local dos artigos
 * @param {string} semanaSlug - Ex: "2026-W04"
 * @returns {Object[]} - Array de { slug, htmlUrl, jsonUrl, ogUrl }
 */
export async function uploadBlog(blogDir, semanaSlug) {
  console.log(`  ☁️  Fazendo upload dos artigos de blog...`);

  const entradas = await fs.readdir(blogDir);
  const artigos = {};

  for (const entrada of entradas) {
    const localPath = path.join(blogDir, entrada);
    const stat = await fs.stat(localPath);

    if (stat.isDirectory()) {
      // Subpasta por slug — esperamos og.png aqui
      const slug = entrada;
      const ogLocal = path.join(localPath, "og.png");
      if (await fs.pathExists(ogLocal)) {
        try {
          const storagePath = `${semanaSlug}/blog/${slug}/og.png`;
          const url = await uploadArquivo(ogLocal, storagePath);
          if (!artigos[slug]) artigos[slug] = { slug };
          artigos[slug].ogUrl = url;
          console.log(`    ✓ ${slug}/og.png`);
        } catch (err) {
          console.error(`    ✗ Erro no upload de ${slug}/og.png: ${err.message}`);
        }
      }
      continue;
    }

    const slug = path.basename(entrada, path.extname(entrada));
    const ext = path.extname(entrada);
    const storagePath = `${semanaSlug}/blog/${entrada}`;

    try {
      const url = await uploadArquivo(localPath, storagePath);
      if (!artigos[slug]) artigos[slug] = { slug };

      if (ext === ".html") artigos[slug].htmlUrl = url;
      if (ext === ".json") artigos[slug].jsonUrl = url;

      console.log(`    ✓ ${entrada}`);
    } catch (err) {
      console.error(`    ✗ Erro no upload de ${entrada}: ${err.message}`);
    }
  }

  return Object.values(artigos);
}

// ── Mapeamento de categoria do gerador → categoria do blog_posts ─────────────
const CATEGORIA_MAP = {
  "Gestão Clínica": "Gestão",
  "Gestao Clinica": "Gestão",
  "Educação Clínica": "Clínica",
  "Educacao Clinica": "Clínica",
  "Produto": "Tecnologia",
  "Marketing": "Marketing",
  "Carreira": "Carreira",
  "Tecnologia": "Tecnologia",
  "Clínica": "Clínica",
  "Gestão": "Gestão",
};

function mapearCategoria(cat) {
  if (!cat) return "Gestão";
  return CATEGORIA_MAP[cat] || "Gestão";
}

function extrairSubtitulo(post) {
  if (post.metaDescription) return post.metaDescription.slice(0, 240);
  if (post.introducao) {
    const txt = String(post.introducao).replace(/<[^>]+>/g, "").trim();
    const primeiroParag = txt.split(/\n\n|\.\s+/)[0] || txt;
    return primeiroParag.slice(0, 240);
  }
  return "";
}

/**
 * Insere/atualiza artigos de blog em public.blog_posts.
 * @param {Array} metas - Posts retornados por gerarBlogSemana (com metadados)
 * @param {Array} uploads - Posts retornados por uploadBlog (com URLs)
 * @param {string} blogDirLocal - Diretório local com HTMLs (output/blog)
 */
export async function inserirBlogPostsNoDb(metas, uploads, blogDirLocal) {
  if (!Array.isArray(metas) || metas.length === 0) {
    console.log("  ℹ️  Nenhum artigo para inserir em blog_posts.");
    return [];
  }

  const supabase = getSupabase();
  const uploadsBySlug = new Map((uploads || []).map((u) => [u.slug, u]));
  const inseridos = [];

  for (const meta of metas) {
    const slug = meta.slug;
    if (!slug) {
      console.warn("    ⚠️  Post sem slug, pulando.");
      continue;
    }

    // Lê HTML local (fonte de verdade do corpo)
    const htmlPath = path.join(blogDirLocal, `${slug}.html`);
    let corpo = "";
    try {
      if (await fs.pathExists(htmlPath)) {
        corpo = await fs.readFile(htmlPath, "utf8");
      }
    } catch (err) {
      console.warn(`    ⚠️  Falha ao ler ${slug}.html: ${err.message}`);
    }

    if (!corpo) {
      console.warn(`    ⚠️  Sem corpo HTML para ${slug}, pulando insert.`);
      continue;
    }

    const upload = uploadsBySlug.get(slug) || {};
    const registro = {
      slug,
      titulo: meta.titulo || slug,
      subtitulo: extrairSubtitulo(meta),
      categoria: mapearCategoria(meta.categoria),
      autor: "Equipe Evolua",
      data: new Date().toISOString().slice(0, 10),
      tempo_leitura: Math.max(1, Number(meta.tempoLeituraMin) || 5),
      destaque: meta.destaque === true,
      imagem: upload.ogUrl || "",
      corpo,
    };

    const { error } = await supabase
      .from("blog_posts")
      .upsert(registro, { onConflict: "slug" });

    if (error) {
      console.error(`    ✗ Falha ao inserir ${slug} em blog_posts: ${error.message}`);
    } else {
      console.log(`    ✓ blog_posts: ${slug} (${registro.categoria})`);
      inseridos.push(slug);
    }
  }

  return inseridos;
}

/**
 * Cria (ou atualiza) o registro da semana no banco de dados
 * @param {Object} semanaData - Dados completos da semana gerada
 */
export async function salvarSemanaNoDb(semanaData) {
  const supabase = getSupabase();

  const { error } = await supabase.from("semanas_conteudo").upsert(
    {
      slug: semanaData.slug,
      semana: semanaData.semana,
      gerado_em: new Date().toISOString(),
      posts: semanaData.posts,
      blog: semanaData.blog,
      status: "gerado",
    },
    { onConflict: "slug" }
  );

  if (error) {
    console.error("  ⚠️  Erro ao salvar semana no banco:", error.message);
  } else {
    console.log("  ✅ Semana registrada no banco de dados");
  }
}
