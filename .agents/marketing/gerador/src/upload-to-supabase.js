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
 * @param {string} blogDir - Diretório local dos artigos
 * @param {string} semanaSlug - Ex: "2026-W04"
 * @returns {Object[]} - Array de { slug, htmlUrl, jsonUrl }
 */
export async function uploadBlog(blogDir, semanaSlug) {
  console.log(`  ☁️  Fazendo upload dos artigos de blog...`);

  const arquivos = await fs.readdir(blogDir);
  const artigos = {};

  for (const arquivo of arquivos) {
    const localPath = path.join(blogDir, arquivo);
    const slug = path.basename(arquivo, path.extname(arquivo));
    const ext = path.extname(arquivo);
    const storagePath = `${semanaSlug}/blog/${arquivo}`;

    try {
      const url = await uploadArquivo(localPath, storagePath);
      if (!artigos[slug]) artigos[slug] = { slug };

      if (ext === ".html") artigos[slug].htmlUrl = url;
      if (ext === ".json") artigos[slug].jsonUrl = url;

      console.log(`    ✓ ${arquivo}`);
    } catch (err) {
      console.error(`    ✗ Erro no upload de ${arquivo}: ${err.message}`);
    }
  }

  return Object.values(artigos);
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
