// src/research.js
// Pesquisa temas e gera briefings semanais com estratégia G4/Crasto.
//
// Fluxo:
//   1. Pesquisa real na web (PubMed + Google Trends + RSS) via web-research.js
//   2. Carrega histórico de posts publicados (memory.js) — evita repetição
//   3. Consolida fontes científicas encontradas + banco curado (science-sources.js)
//   4. Envia tudo ao Copilot (o1-mini) para gerar o briefing estratégico da semana

import { chatEstrategia } from "./openai-client.js";
import { persona, playbook } from "./config.js";
import { getHistoricoParaPrompt } from "./memory.js";
import { FONTES_CIENTIFICAS, formatarFonteParaPrompt } from "./science-sources.js";
import { executarPesquisaSemanal } from "./web-research.js";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SYSTEM_ESTRATEGIA = `Você é o estrategista-chefe de conteúdo do Evolua (@useevoluaapp).
Você aplica o playbook do G4 Educação e do RD Reservatório de Dopamina adaptado para fonoaudiólogas.

PRODUTO: Evolua — sistema de gestão para fonoaudiólogas (prontuário, agenda, cobrança, relatórios).
ICP: ${persona.icp}

POSICIONAMENTO: "${playbook.posicionamento}"
— O Evolua é uma emissora, não uma escola. Cada post é uma "matéria", não uma "aula".

REFERÊNCIAS DE ESTILO:
${playbook.referencias.map((r) => `• ${r.perfil}: ${r.lição}`).join("\n")}

ANATOMIA DO CARROSSEL (G4):
${Object.entries(playbook.anatomiaCarrossel)
  .map(([k, v]) => `• ${k}: ${v}`)
  .join("\n")}

REGRAS ABSOLUTAS:
${playbook.regrasDeVoz.join("\n")}

FOCO EM GERAÇÃO DE LEADS:
${playbook.funilDeLeads.meta}
CTAs disponíveis: ${playbook.funilDeLeads.ctas.join(" | ")}`;

// ── Formatadores de seção do prompt ───────────────────────────────────────────

function formatarInsightsPesquisa(pesquisa) {
  if (!pesquisa) return "";

  const blocos = [];

  if (pesquisa.resumoPesquisa) {
    blocos.push(`RESUMO DA PESQUISA DESTA SEMANA:\n${pesquisa.resumoPesquisa}`);
  }

  if (pesquisa.insightsPilar2?.length) {
    blocos.push(
      `INSIGHTS CIENTÍFICOS PARA PILAR 2 (baseados em artigos reais encontrados na web):\n` +
      pesquisa.insightsPilar2
        .map((ins, i) =>
          `${i + 1}. "${ins.titulo}"\n   Dado-chave: ${ins.dadoChave}\n   Ângulo de capa: ${ins.angulo}\n   Aplicação: ${ins.aplicacao}\n   Fonte: ${ins.fonteCitacao || "(sem fonte direta)"} ${ins.fontePmid ? `| PMID ${ins.fontePmid}` : ""}`
        )
        .join("\n\n")
    );
  }

  if (pesquisa.temasTendencia?.length) {
    blocos.push(
      `TENDÊNCIAS EM ALTA (oportunidade de timing):\n` +
      pesquisa.temasTendencia
        .map((t) => `• "${t.tema}" — Ângulo: ${t.angulo} — Por que agora: ${t.urgencia}`)
        .join("\n")
    );
  }

  if (pesquisa.noticiasRelevantes?.length) {
    blocos.push(
      `NOTÍCIAS DO SETOR (possíveis ganchos jornalísticos):\n` +
      pesquisa.noticiasRelevantes
        .map((n) => `• [${n.fonte}] "${n.titulo}" — ${n.aplicacao}`)
        .join("\n")
    );
  }

  return blocos.join("\n\n");
}

function formatarFontesDisponiveis(pesquisa) {
  // Fontes do banco curado
  const fontesBanco = FONTES_CIENTIFICAS.map(
    (f, i) => `${i + 1}. [BANCO] [${f.tags.join(", ")}] ${formatarFonteParaPrompt(f)}`
  );

  // Fontes encontradas na pesquisa web (com PMID real) — adiciona após o banco
  const fontesWeb = (pesquisa?.raw?.artigos || [])
    .filter((a) => a.pmid && a.resumo)
    .slice(0, 8)
    .map(
      (a, i) =>
        `${FONTES_CIENTIFICAS.length + i + 1}. [WEB-${a.pmid}] "${a.titulo}" — ${a.autores} (${a.ano}), ${a.revista} | PMID: ${a.pmid}. DADOS: ${a.resumo?.slice(0, 300) || "(abstract indisponível)"}`
    );

  return [...fontesBanco, ...fontesWeb].join("\n");
}

// ── Exportações principais ─────────────────────────────────────────────────────

/**
 * Pesquisa temas e gera briefings para uma semana de conteúdo.
 * Executa pesquisa real na web antes de chamar a IA.
 */
export async function pesquisarSemana({
  semana,
  numPosts = 5,
  numBlogPosts = 2,
  temasFoco = [],
  temasEvitar = [],
  salvarPesquisa = true,
}) {
  console.log(`\n🔍 Pesquisando semana ${semana}...`);

  // ── ETAPA A: Pesquisa web real ─────────────────────────────────────────────
  let pesquisa = null;
  try {
    pesquisa = await executarPesquisaSemanal();

    // Salva o resultado bruto da pesquisa para auditoria
    if (salvarPesquisa) {
      const pesquisaPath = path.join(__dirname, "../output", semana, "pesquisa-web.json");
      await fs.ensureDir(path.dirname(pesquisaPath));
      await fs.writeJSON(pesquisaPath, pesquisa, { spaces: 2 });
      console.log(`  💾 Pesquisa salva em output/${semana}/pesquisa-web.json`);
    }
  } catch (err) {
    console.warn(`  ⚠️  Pesquisa web falhou (continuando sem ela): ${err.message}`);
  }

  // ── ETAPA B: Histórico de publicações ─────────────────────────────────────
  const historico = await getHistoricoParaPrompt(16);
  const bloqueioHistorico = historico
    ? `\n\nHISTÓRICO DE CONTEÚDOS JÁ PUBLICADOS (NUNCA REPITA TEMA, ÂNGULO OU INSIGHT):
${historico}

REGRA ABSOLUTA: Nenhum dos ${numPosts} posts desta semana pode repetir tema, ângulo, insight ou gancho de qualquer post listado acima. Se o assunto for similar, o ângulo deve ser radicalmente diferente. A audiência já viu tudo acima.`
    : "";

  // ── ETAPA C: Consolida fontes disponíveis (banco curado + web) ────────────
  const listaDeFontes = formatarFontesDisponiveis(pesquisa);
  const totalFontes = FONTES_CIENTIFICAS.length + (pesquisa?.raw?.artigos?.filter((a) => a.resumo)?.length || 0);

  // ── ETAPA D: Síntese da pesquisa para o prompt ────────────────────────────
  const blocoPesquisa = pesquisa
    ? `\n\nDADOS DA PESQUISA DESTA SEMANA (extraídos automaticamente da web):\n${formatarInsightsPesquisa(pesquisa)}`
    : "";

  // ── ETAPA E: Gerar briefing com o Copilot ─────────────────────────────────
  console.log(`\n📋 Gerando briefing estratégico (modelo: o1-mini)...`);

  const result = await chatEstrategia(SYSTEM_ESTRATEGIA, `
Estamos planejando o conteúdo da semana ${semana} para o @useevoluaapp.

${temasFoco.length > 0 ? `Temas para priorizar esta semana: ${temasFoco.join(", ")}` : ""}
${temasEvitar.length > 0 ? `Temas explicitamente proibidos: ${temasEvitar.join(", ")}` : ""}
${bloqueioHistorico}
${blocoPesquisa}

DISTRIBUIÇÃO POR PILAR:
- Pilar 1 (Dor resolvida, 40%): ${Math.round(numPosts * 0.4)} posts
- Pilar 2 (Educação clínica, 25%): ${Math.round(numPosts * 0.25)} posts — USE OBRIGATORIAMENTE UMA FONTE DA LISTA ABAIXO
- Pilar 3 (Prova social, 20%): ${Math.round(numPosts * 0.2)} posts
- Pilar 4 (Produto em ação, 15%): ${Math.round(numPosts * 0.15)} posts

FONTES CIENTÍFICAS DISPONÍVEIS (${totalFontes} fontes — use apenas estas, não invente outras):
As fontes marcadas [BANCO] foram verificadas manualmente.
As fontes marcadas [WEB-PMID] foram encontradas automaticamente no PubMed esta semana.
${listaDeFontes}

Para posts de Pilar 2: você DEVE referenciar uma fonte da lista acima. Coloque o índice numérico em "fonteIndex".
IMPORTANTE: Se usar uma fonte [WEB-PMID], coloque o PMID real no campo "fontePmid" do post.

CRITÉRIOS DE QUALIDADE DO GANCHO (G4):
1. A capa NÃO começa com "fonoaudióloga" — é amplo o suficiente para qualquer pessoa clicar
2. O conteúdo afunila progressivamente até que só o ICP acompanha
3. O CTA é sempre de captura de lead — nunca "salva esse post"
4. Priorize dados e insights da PESQUISA DESTA SEMANA como ganchos quando relevante

Gere ${numPosts} posts de Instagram e ${numBlogPosts} artigos de blog.

REGRA DE DESTAQUE DOS ARTIGOS DE BLOG:
- Marque "destaque": true para NO MÁXIMO 1 artigo da semana — aquele que tem maior potencial de SEO/captura, que ataca a dor mais central da persona ou que ancora um lançamento.
- Se nenhum artigo for claramente superior, marque todos como "destaque": false.
- "destaque": true faz o artigo virar capa do /blog da landing por toda a semana.

Responda com JSON:
{
  "semana": "${semana}",
  "resumo": "Resumo estratégico: ângulo central da semana, dores atacadas, feature do produto destacada, e como a pesquisa web influenciou a escolha dos temas",
  "instagramPosts": [
    {
      "formato": "Carrossel 7 slides | Carrossel 5 slides | Reels 30s | Reels 60s | Estático",
      "pilar": 1,
      "tema": "Título interno para identificação",
      "ganchoAmplo": "A capa: frase ou dado que qualquer pessoa clicaria (não menciona fonoaudiologia ainda)",
      "afunilamento": "Como o conteúdo vai afunilando progressivamente até o ICP",
      "insight": "O insight da virada — o que muda como a pessoa pensa sobre o problema",
      "cta": "Qual CTA de lead usar e o texto exato",
      "fonteIndex": null,
      "fontePmid": null,
      "origemInsight": "banco | web | tendencia | noticia — de onde veio a ideia",
      "stories": true,
      "storiesConfig": {
        "slides": [
          { "tipo": "teaser", "titulo": "Gancho do story", "corpo": "Texto do story" },
          { "tipo": "dado", "dado": "X%", "unidade": "descrição do dado", "corpo": "contexto" },
          { "tipo": "cta", "titulo": "Não perdeu?", "corpo": "O carrossel completo tá no feed" }
        ]
      }
    }
  ],
  "blogPosts": [
    {
      "titulo": "Título com keyword para SEO",
      "palavraChave": "keyword principal",
      "extensao": "1400",
      "objetivo": "Ranquear para [keyword], gerar leads via CTA no meio e no fim",
      "destaque": false,
      "fonteIndex": null,
      "fontePmid": null
    }
  ]
}
  `);

  // ── ETAPA F: Resolve índices de fontes → objetos completos ────────────────
  const todasFontes = [
    ...FONTES_CIENTIFICAS,
    ...(pesquisa?.raw?.artigos?.filter((a) => a.resumo) || []).slice(0, 8).map((a) => ({
      pmid: a.pmid,
      titulo: a.titulo,
      autores: a.autores,
      ano: a.ano,
      revista: a.revista,
      doi: a.doi || null,
      resumo: a.resumo?.slice(0, 400) || "",
      tags: [],
      aplicacaoClinica: "(fonte encontrada automaticamente nesta semana)",
    })),
  ];

  function resolverFonte(item) {
    if (item.fonteIndex != null) {
      const idx = parseInt(item.fonteIndex) - 1;
      item.fontesCientificas = todasFontes[idx] || null;
    } else if (item.fontePmid) {
      // Fallback: busca diretamente pelo PMID na lista web
      item.fontesCientificas =
        (pesquisa?.raw?.artigos || []).find((a) => a.pmid === String(item.fontePmid)) || null;
    }
    delete item.fonteIndex;
    delete item.fontePmid;
  }

  (result.instagramPosts || []).forEach(resolverFonte);
  (result.blogPosts || []).forEach(resolverFonte);

  // Anexa a pesquisa raw ao resultado para auditoria
  result.pesquisaWeb = pesquisa
    ? {
        resumo: pesquisa.resumoPesquisa,
        totalArtigos: pesquisa.raw?.artigos?.length || 0,
        totalTendencias: pesquisa.raw?.tendencias?.length || 0,
        totalNoticias: pesquisa.raw?.noticias?.length || 0,
      }
    : null;

  console.log(`✅ Briefing gerado: ${result.instagramPosts?.length} posts + ${result.blogPosts?.length} artigos`);
  if (result.pesquisaWeb) {
    console.log(`   Pesquisa: ${result.pesquisaWeb.totalArtigos} artigos PubMed | ${result.pesquisaWeb.totalTendencias} tendências | ${result.pesquisaWeb.totalNoticias} notícias`);
  }
  console.log(`   Resumo: ${result.resumo}`);

  return result;
}

/**
 * Pesquisa fontes científicas sobre um tema específico via PubMed.
 * Útil para enriquecer manualmente o banco em science-sources.js.
 */
export async function pesquisarFontesCientificas(tema) {
  const { pesquisarFonteCientifica } = await import("./web-research.js");
  return pesquisarFonteCientifica(tema);
}
