// src/web-research.js
// Pesquisa automática de conteúdo na web.
// Sem API paga — usa fontes públicas abertas:
//   • PubMed E-utilities (API gratuita, NCBI)
//   • Google Trends RSS (público)
//   • RSS de associações e portais de fonoaudiologia
//   • Copilot para síntese estratégica dos resultados
//
// Fluxo:
//   1. buscarArtigosPubMed()    → artigos científicos recentes
//   2. buscarTendenciasGoogle() → o que está sendo buscado no Brasil
//   3. buscarNoticiasSetor()    → RSS de portais de fono/saúde
//   4. sintetizarPesquisa()     → Copilot transforma os dados em insights de conteúdo

import { load } from "cheerio";
import { chatEstrategia } from "./openai-client.js";

const HEADERS = {
  "User-Agent": "EoluaContentBot/2.0 (research@useevolua.com.br; educational use)",
  "Accept": "application/json, application/xml, text/html, */*",
};

const TIMEOUT_MS = 10000;

// ── Utilitário: fetch com timeout e retry ──────────────────────────────────────
async function fetchComTimeout(url, opts = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...opts, headers: { ...HEADERS, ...opts.headers }, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// ── 1. PubMed E-utilities ──────────────────────────────────────────────────────
// Documentação: https://www.ncbi.nlm.nih.gov/books/NBK25499/
// Sem necessidade de chave para uso educacional (limite: 3 req/s)

const PUBMED_QUERIES = [
  "speech language pathology clinical management",
  "fonoaudiologia gestão clínica",
  "voice disorder treatment outcomes",
  "dysphagia rehabilitation",
  "autism spectrum disorder speech therapy",
  "orofacial myofunctional therapy",
  "language development intervention",
  "hearing loss rehabilitation adults",
  "stuttering treatment efficacy",
  "speech language pathology telehealth",
];

/**
 * Busca artigos recentes no PubMed para um query.
 * Retorna array de objetos { pmid, titulo, autores, ano, revista, resumo }
 */
async function buscarArtigosPubMed(query, maxResultados = 5) {
  try {
    // Etapa 1: buscar PMIDs
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResultados}&sort=date&retmode=json&mindate=2020&maxdate=2026`;
    const searchRes = await fetchComTimeout(searchUrl);
    const searchData = await searchRes.json();
    const pmids = searchData.esearchresult?.idlist || [];

    if (pmids.length === 0) return [];

    // Etapa 2: buscar detalhes dos artigos
    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmids.join(",")}&retmode=json`;
    const summaryRes = await fetchComTimeout(summaryUrl);
    const summaryData = await summaryRes.json();
    const result = summaryData.result || {};

    return pmids
      .filter((id) => result[id])
      .map((id) => {
        const art = result[id];
        return {
          pmid: id,
          titulo: art.title || "",
          autores: (art.authors || []).slice(0, 3).map((a) => a.name).join(", ") || "",
          ano: art.pubdate ? art.pubdate.slice(0, 4) : "",
          revista: art.source || "",
          doi: (art.elocationid || "").replace("doi: ", ""),
        };
      });
  } catch (err) {
    console.warn(`    ⚠️  PubMed query falhou ("${query}"): ${err.message}`);
    return [];
  }
}

/**
 * Busca resumo (abstract) de um artigo específico pelo PMID
 */
async function buscarAbstractPubMed(pmid) {
  try {
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmid}&rettype=abstract&retmode=text`;
    const res = await fetchComTimeout(url);
    const texto = await res.text();
    // Extrai só o abstract — remove header e rodapé do formato text
    const match = texto.match(/Abstract\n([\s\S]+?)(?:\n\n|\nCopyright|$)/i);
    return match ? match[1].trim().slice(0, 800) : "";
  } catch {
    return "";
  }
}

// ── 2. Google Trends RSS ───────────────────────────────────────────────────────
// RSS público de tendências de busca no Brasil por categoria

// Google Trends RSS mudou de endpoint — usando rss2.0 via exportação
const TRENDS_FEEDS = [
  // Google Trends público bloqueou RSS daily; mantemos como tentativa graceful
  // {
  //   url: "https://trends.google.com/trends/trendingsearches/realtime/rss?geo=BR&hl=pt-BR&cat=h",
  //   categoria: "trending-br-realtime",
  // },
];

async function buscarTendenciasGoogle() {
  const tendencias = [];
  for (const feed of TRENDS_FEEDS) {
    try {
      const res = await fetchComTimeout(feed.url);
      const xml = await res.text();
      const $ = load(xml, { xmlMode: true });
      $("item").each((_, el) => {
        const titulo = $(el).find("title").first().text().trim();
        const trafico = $(el).find("ht\\:approx_traffic").text().trim();
        if (titulo) tendencias.push({ titulo, trafico, categoria: feed.categoria });
      });
    } catch (err) {
      console.warn(`    ⚠️  Google Trends RSS falhou: ${err.message}`);
    }
  }
  return tendencias.slice(0, 20);
}

// ── 3. RSS de portais de saúde / fonoaudiologia ───────────────────────────────

const RSS_FONTES = [
  {
    url: "https://saude.abril.com.br/feed/",
    nome: "Saúde Abril",
    relevancia: "notícia",
  },
  {
    url: "https://www.folha.uol.com.br/fsp/equilibrio/rss091.xml",
    nome: "Folha de SP — Equilíbrio e Saúde",
    relevancia: "notícia",
  },
  {
    url: "https://g1.globo.com/rss/g1/bemestar/",
    nome: "G1 — Bem-Estar",
    relevancia: "notícia",
  },
  {
    url: "https://www.saudebusiness.com/feed/",
    nome: "Saúde Business",
    relevancia: "mercado",
  },
  {
    url: "https://www.cff.org.br/?format=feed&type=rss",
    nome: "CFF — Conselho Federal de Farmácia (regulatório saúde)",
    relevancia: "regulatório",
  },
  {
    url: "https://www.cfm.org.br/index.php?option=com_content&view=category&id=46&format=feed&type=rss",
    nome: "CFM — Conselho Federal de Medicina",
    relevancia: "regulatório",
  },
];

async function buscarNoticiasSetor() {
  const noticias = [];
  for (const fonte of RSS_FONTES) {
    try {
      const res = await fetchComTimeout(fonte.url, {
        headers: { ...HEADERS, Accept: "application/rss+xml, application/atom+xml, text/xml" },
      });
      const xml = await res.text();
      const $ = load(xml, { xmlMode: true });

      // Suporte a RSS e Atom
      const itens = $("item, entry");
      itens.slice(0, 5).each((_, el) => {
        const $el = $(el);
        const titulo = $el.find("title").first().text().trim();
        const descricao = ($el.find("description, summary, content").first().text() || "")
          .replace(/<[^>]+>/g, "")
          .trim()
          .slice(0, 200);
        const data = $el.find("pubDate, published, updated").first().text().trim().slice(0, 10);
        const link = $el.find("link").first().text().trim() || $el.find("link").first().attr("href") || "";

        if (titulo) {
          noticias.push({
            titulo,
            descricao,
            data,
            link,
            fonte: fonte.nome,
            relevancia: fonte.relevancia,
          });
        }
      });
    } catch (err) {
      console.warn(`    ⚠️  RSS "${fonte.nome}" falhou: ${err.message}`);
    }
  }
  return noticias;
}

// ── 4. Síntese via Copilot ─────────────────────────────────────────────────────

const SYSTEM_SINTESE = `Você é o estrategista de conteúdo do Evolua (@useevoluaapp).
Produto: sistema de gestão para fonoaudiólogas brasileiras.
ICP: fonoaudióloga autônoma ou em clínica pequena, 2+ anos, 15+ pacientes/semana.

Sua tarefa é analisar dados brutos de pesquisa (artigos científicos, tendências, notícias) 
e extrair INSIGHTS ACIONÁVEIS para conteúdo de redes sociais.

Regras de extração:
- Priorize dados recentes (2022-2026)
- Prefira estudos brasileiros ou com dados do Brasil quando disponíveis
- Conecte cada dado à dor real da Camila (a fonoaudióloga ICP)
- Identifique o "ângulo amplo" — o dado que qualquer pessoa acha fascinante
- Um bom insight tem: dado surpreendente + contexto + aplicação prática para a fonoaudióloga`;

/**
 * Usa o Copilot para sintetizar os dados de pesquisa em insights de conteúdo
 */
async function sintetizarPesquisa({ artigos, tendencias, noticias }) {
  const artigosTexto = artigos
    .map((a) => `• [PMID ${a.pmid}] "${a.titulo}" — ${a.autores} (${a.ano}), ${a.revista}`)
    .join("\n");

  const tendenciasTexto = tendencias
    .slice(0, 10)
    .map((t) => `• "${t.titulo}" (${t.trafico || "tendência"})`)
    .join("\n");

  const noticiasTexto = noticias
    .slice(0, 15)
    .map((n) => `• [${n.fonte}] "${n.titulo}" — ${n.descricao}`)
    .join("\n");

  const resultado = await chatEstrategia(
    SYSTEM_SINTESE,
    `Analise os dados de pesquisa abaixo e extraia insights para conteúdo do Evolua.

ARTIGOS CIENTÍFICOS RECENTES (PubMed):
${artigosTexto || "(nenhum encontrado)"}

TENDÊNCIAS DE BUSCA NO BRASIL (Google Trends):
${tendenciasTexto || "(nenhuma encontrada)"}

NOTÍCIAS DO SETOR (RSS):
${noticiasTexto || "(nenhuma encontrada)"}

Responda com JSON:
{
  "insightsPilar2": [
    {
      "titulo": "Título interno do insight",
      "dadoChave": "O dado mais surpreendente encontrado (com fonte)",
      "angulo": "Como usar esse dado como gancho amplo (não menciona fonoaudióloga na capa)",
      "aplicacao": "Como conectar ao dia a dia da Camila",
      "fontePmid": "PMID do artigo base (null se não vier do PubMed)",
      "fonteCitacao": "Autores (ano), Revista — para exibir no slide"
    }
  ],
  "temasTendencia": [
    {
      "tema": "Tema em alta que pode ser abordado",
      "angulo": "Ângulo específico para fonoaudiologia",
      "urgencia": "por que publicar agora"
    }
  ],
  "noticiasRelevantes": [
    {
      "titulo": "Notícia relevante",
      "aplicacao": "Como usar como gancho de conteúdo",
      "fonte": "nome da fonte"
    }
  ],
  "resumoPesquisa": "Parágrafo curto resumindo o que a pesquisa desta semana revelou de mais útil"
}`
  );

  return resultado;
}

// ── Exportação principal ───────────────────────────────────────────────────────

/**
 * Executa a pesquisa completa e retorna insights prontos para o briefing.
 * @param {Object} [opcoes]
 * @param {string[]} [opcoes.queriesExtras] - Queries adicionais para o PubMed
 * @returns {Promise<Object>} - { insightsPilar2, temasTendencia, noticiasRelevantes, resumoPesquisa, raw }
 */
export async function executarPesquisaSemanal(opcoes = {}) {
  console.log("\n🌐 Iniciando pesquisa automática na web...");

  // Seleciona 4 queries do PubMed aleatoriamente (para variar a cada semana)
  const todasQueries = [...PUBMED_QUERIES, ...(opcoes.queriesExtras || [])];
  const queriesSelecionadas = embaralhar(todasQueries).slice(0, 4);

  // Roda buscas em paralelo (com pequeno delay para respeitar limite PubMed)
  console.log("  📚 Buscando artigos no PubMed...");
  const resultadosPubMed = [];
  for (const query of queriesSelecionadas) {
    const artigos = await buscarArtigosPubMed(query, 4);
    resultadosPubMed.push(...artigos);
    await sleep(400); // respeita limite de 3 req/s do PubMed
  }

  // Remove duplicatas por PMID
  const artigosUnicos = deduplicarPorChave(resultadosPubMed, "pmid");
  console.log(`    ✓ ${artigosUnicos.length} artigos encontrados`);

  // Busca abstract dos 5 mais relevantes para enriquecer o contexto
  console.log("  📄 Buscando abstracts...");
  const artigosComAbstract = await Promise.all(
    artigosUnicos.slice(0, 5).map(async (a) => {
      const resumo = await buscarAbstractPubMed(a.pmid);
      await sleep(350);
      return { ...a, resumo };
    })
  );
  // Artigos sem abstract ficam sem o campo
  const todosArtigos = [
    ...artigosComAbstract,
    ...artigosUnicos.slice(5),
  ];

  // Google Trends e RSS em paralelo
  console.log("  📈 Buscando tendências e notícias...");
  const [tendencias, noticias] = await Promise.all([
    buscarTendenciasGoogle(),
    buscarNoticiasSetor(),
  ]);
  console.log(`    ✓ ${tendencias.length} tendências | ${noticias.length} notícias`);

  // Síntese via Copilot
  console.log("  🤖 Sintetizando com Copilot...");
  const sintese = await sintetizarPesquisa({
    artigos: todosArtigos,
    tendencias,
    noticias,
  });
  console.log(`    ✓ ${sintese.insightsPilar2?.length || 0} insights científicos | ${sintese.temasTendencia?.length || 0} tendências`);

  return {
    ...sintese,
    raw: {
      artigos: todosArtigos,
      tendencias,
      noticias,
    },
  };
}

/**
 * Busca artigos do PubMed sobre um tema específico e retorna formatado para o banco.
 * Útil para enriquecer o science-sources.js manualmente.
 */
export async function pesquisarFonteCientifica(tema) {
  console.log(`\n🔬 Pesquisando fontes científicas para: "${tema}"`);
  const artigos = await buscarArtigosPubMed(tema, 8);
  const comAbstract = await Promise.all(
    artigos.map(async (a, i) => {
      await sleep(i * 400);
      const resumo = await buscarAbstractPubMed(a.pmid);
      return { ...a, resumo };
    })
  );
  return comAbstract;
}

// ── Utilitários ────────────────────────────────────────────────────────────────

function embaralhar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function deduplicarPorChave(arr, chave) {
  const seen = new Set();
  return arr.filter((item) => {
    if (seen.has(item[chave])) return false;
    seen.add(item[chave]);
    return true;
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
