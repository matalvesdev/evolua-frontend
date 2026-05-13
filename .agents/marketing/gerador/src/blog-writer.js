// src/blog-writer.js
// Gera artigos de blog completos para o Evolua

import { chatJSON, chat } from "./openai-client.js";
import { persona } from "./config.js";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import slugify from "slugify";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SYSTEM_PROMPT = `Você é o especialista em conteúdo de blog do Evolua.
Você escreve artigos para fonoaudiólogas brasileiras.

Persona: ${persona.nome} — ${persona.descricao}

REGRAS:
1. Tom: especialista que fala com colega, não para ela
2. Sem jargão corporativo
3. Posts de educação clínica devem citar fontes reais (PMID)
4. Cada artigo deve ter um CTA claro para testar o Evolua
5. Headings claros e diretos
6. Parágrafos curtos (máx 3 linhas)
7. Listas quando listar 3+ itens`;

/**
 * Gera um artigo de blog completo
 * @param {Object} briefing - { titulo, palavraChave, persona, objetivo, extensao, fontes? }
 */
export async function gerarBlogPost(briefing) {
  console.log(`\n📝 Gerando artigo de blog: "${briefing.titulo}"...`);

  // Etapa 1: Gerar estrutura do artigo
  const estrutura = await chatJSON(SYSTEM_PROMPT, `
Crie a estrutura completa de um artigo de blog sobre: "${briefing.titulo}"

Palavra-chave principal: ${briefing.palavraChave}
Persona: ${briefing.personaDescricao || persona.descricao}
Extensão: ${briefing.extensao || "1200"} palavras
${briefing.fontes ? `Fontes científicas a citar: ${briefing.fontes}` : ""}

Responda com JSON:
{
  "titulo": "H1 do artigo (com keyword)",
  "slug": "url-amigavel-com-keyword",
  "metaDescription": "Descrição para SEO (máx 155 caracteres)",
  "palavraChavePrincipal": "...",
  "palavrasChaveSecundarias": ["...", "...", "..."],
  "tempoLeituraMin": 5,
  "introducao": "2-3 parágrafos de abertura que conectam a dor da Camila ao tema",
  "secoes": [
    {
      "h2": "Título da seção",
      "conteudo": "Conteúdo completo da seção",
      "h3s": [
        { "titulo": "Subseção", "conteudo": "..." }
      ]
    }
  ],
  "conclusao": "Parágrafo de fechamento + CTA para testar o Evolua",
  "ctaTexto": "Texto do botão CTA",
  "ctaUrl": "/cadastro",
  "tags": ["tag1", "tag2", "tag3"],
  "categoria": "Gestão Clínica | Educação Clínica | Produto"
}
  `);

  // Etapa 2: Gerar HTML do artigo completo
  console.log("  Gerando HTML do artigo...");
  const htmlContent = await chat(SYSTEM_PROMPT, `
Com base nesta estrutura de artigo, escreva o artigo COMPLETO em HTML:

${JSON.stringify(estrutura, null, 2)}

Gere HTML semântico limpo. Use:
- <h1> para o título principal
- <h2> para as seções
- <h3> para subseções
- <p> para parágrafos
- <ul>/<li> para listas
- <strong> para destaques
- <blockquote> para citações científicas
- <a href="/cadastro" class="cta-button"> para o CTA

Não inclua <html>, <head>, <body> — apenas o conteúdo do artigo.
  `, { maxTokens: 4000 });

  // Salvar arquivos
  const slug = estrutura.slug || slugify(briefing.titulo, { lower: true, strict: true }).slice(0, 60);
  const outputDir = path.join(__dirname, "../output/blog");
  await fs.ensureDir(outputDir);

  const postData = {
    ...estrutura,
    destaque: briefing.destaque === true,
    geradoEm: new Date().toISOString(),
    briefing,
  };

  await fs.writeJSON(path.join(outputDir, `${slug}.json`), postData, { spaces: 2 });
  await fs.writeFile(path.join(outputDir, `${slug}.html`), htmlContent);

  console.log(`✅ Artigo salvo em: output/blog/${slug}.html`);
  return postData;
}

/**
 * Gera múltiplos artigos de blog para a semana
 * @param {Array} temas - Lista de temas/briefings
 */
export async function gerarBlogSemana(temas) {
  const posts = [];
  for (const tema of temas) {
    const post = await gerarBlogPost(tema);
    posts.push(post);
  }
  return posts;
}

// Execução direta
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const briefingExemplo = {
    titulo: "Prontuário eletrônico para fonoaudiologia: o que a lei exige e como organizar",
    palavraChave: "prontuário eletrônico fonoaudiologia",
    extensao: "1200",
    fontes: "Resolução CFFa nº 387/2010 — obrigações de documentação clínica",
  };

  gerarBlogPost(briefingExemplo)
    .then((post) => {
      console.log("\n📋 Artigo gerado:");
      console.log("Título:", post.titulo);
      console.log("Slug:", post.slug);
      console.log("Tempo de leitura:", post.tempoLeituraMin, "min");
    })
    .catch(console.error);
}
