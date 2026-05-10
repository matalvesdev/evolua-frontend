// src/ads-builder.js
// Montagem automática de campanhas de anúncios — baseado no G4OS (vídeo 2)
//
// CONCEITO CENTRAL (vídeo 2):
// Um processo que levava 1h30 agora leva 7 minutos.
// Prompts estruturados configuram: público, criativos, budgets e taxonomia de rastreamento.
//
// REGRA DO EVOLUA (playbook Crasto):
// Orgânico valida → só vai para mídia paga o que já performou organicamente.
// O orgânico gera base engajada → barateia o lookalike → flywheel se fecha.

import { chatJSON } from "./openai-client.js";
import { MODELS } from "./ai-client.js";
import { persona } from "./config.js";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_ADS = `Você é o especialista em mídia paga do Evolua (@useevoluaapp).
Você configura campanhas no Meta Ads seguindo o playbook G4OS: prompts estruturados que geram
a estrutura completa de campanha (público, criativos, budget, taxonomia) em minutos.

ICP: ${persona.icp}

PRINCÍPIO FUNDAMENTAL:
Só vai para mídia paga o que já funcionou no orgânico.
O orgânico valida a mensagem → o pago escala o que funciona.
Lookalike é gerado a partir da base orgânica engajada → CPL cai → flywheel se fecha.

TAXONOMIA DE RASTREAMENTO (obrigatória):
Formato: evolua_[objetivo]_[público]_[criativo]_[semana]
Exemplo: evolua_leads_lal1pct_reels-disfagia_W05`;

// ── Tipos de público disponíveis ──────────────────────────────────────────────

const PUBLICOS = {
  interesse: {
    nome: "Interesse — Fonoaudiologia",
    descricao: "Interesses: Fonoaudiologia, Saúde, Clínica, Empreendedorismo",
    temperatura: "frio",
    cplEstimado: "R$ 25-45",
    uso: "Topo de funil — descoberta",
  },
  lal1pct: {
    nome: "Lookalike 1% — usuárias ativas",
    descricao: "Lookalike gerado a partir das usuárias ativas nos últimos 30 dias",
    temperatura: "morno",
    cplEstimado: "R$ 15-25",
    uso: "Principal de aquisição",
  },
  remarketing30d: {
    nome: "Remarketing — visitantes LP 30d",
    descricao: "Pessoas que visitaram a landing page nos últimos 30 dias mas não converteram",
    temperatura: "quente",
    cplEstimado: "R$ 8-18",
    uso: "Conversão de quem já conhece",
  },
  engajados90d: {
    nome: "Engajados — Instagram 90d",
    descricao: "Quem interagiu com o perfil @useevoluaapp nos últimos 90 dias",
    temperatura: "morno-quente",
    cplEstimado: "R$ 10-20",
    uso: "Conversão de seguidores",
  },
};

// ── Montagem de campanha ──────────────────────────────────────────────────────

/**
 * Monta a estrutura completa de uma campanha de anúncios
 * em < 7 minutos (equivalente ao G4OS)
 *
 * @param {Object} params
 * @param {string} params.objetivo - "leads" | "trafego" | "alcance"
 * @param {number} params.budgetSemanal - Budget em R$
 * @param {Object} params.criativo - { tipo, tema, postSlug?, videoUrl?, imageUrl? }
 * @param {string} params.landingPage - URL da LP de destino
 * @param {string} params.semana - Ex: "2026-W05" (para taxonomia)
 * @param {string[]} [params.publicos] - Subset de PUBLICOS a usar (padrão: todos)
 */
export async function montarCampanha(params) {
  console.log(`\n📣 Montando campanha: ${params.objetivo} | Budget: R$ ${params.budgetSemanal}/semana`);
  console.log(`   Criativo: ${params.criativo.tema} (${params.criativo.tipo})`);

  const publicosAtivos = params.publicos
    ? params.publicos.map((k) => PUBLICOS[k]).filter(Boolean)
    : Object.values(PUBLICOS);

  const resultado = await chatJSON(SYSTEM_ADS, `
Monte a estrutura completa de campanha no Meta Ads para o Evolua.

PARÂMETROS:
- Objetivo: ${params.objetivo}
- Budget semanal: R$ ${params.budgetSemanal}
- Criativo base: ${params.criativo.tipo} sobre "${params.criativo.tema}"
- Landing page: ${params.landingPage}
- Semana: ${params.semana}

PÚBLICOS DISPONÍVEIS:
${publicosAtivos.map((p) => `- ${p.nome}: ${p.descricao} | CPL est.: ${p.cplEstimado}`).join("\n")}

REGRAS DE ORÇAMENTO:
- Distribuir o budget entre os públicos por temperatura: quente > morno > frio
- Nunca colocar > 60% em um único conjunto
- Reservar 20% do budget para testes de criativo

REGRAS DE CRIATIVO:
- Primeiros 3s do vídeo: mostrar a dor ou resultado — nunca a marca
- Copy do anúncio: mesma linguagem do post orgânico (não mudar o tom)
- Headline: pergunta ou dado concreto
- CTA: "Teste grátis" (nunca "Compre agora" nessa fase)

Responda com JSON:
{
  "campanha": {
    "nome": "nome da campanha com taxonomia",
    "objetivo": "${params.objetivo}",
    "budgetSemanal": ${params.budgetSemanal},
    "dataInicio": "hoje",
    "dataFim": "7 dias"
  },
  "conjuntos": [
    {
      "nome": "nome do conjunto com taxonomia",
      "publico": "tipo de público",
      "descricaoPublico": "como configurar no gerenciador de negócios",
      "budget": "R$ X/dia",
      "criativos": [
        {
          "nome": "nome do criativo com taxonomia",
          "tipo": "video | imagem | carrossel",
          "headline": "Texto do headline (máx 10 palavras)",
          "textoPrincipal": "Texto principal do anúncio (máx 150 palavras, tom orgânico)",
          "cta": "Teste grátis | Saiba mais",
          "url": "${params.landingPage}",
          "parametrosUTM": "utm_source=instagram&utm_medium=paid&utm_campaign=[taxonomia]&utm_content=[criativo]"
        }
      ],
      "kpis": {
        "cplAlvo": "R$ X",
        "ctrMinimo": "X%",
        "prazoAnalise": "X dias"
      }
    }
  ],
  "taxonomiaRastreamento": {
    "padrao": "evolua_[objetivo]_[publico]_[criativo]_${params.semana}",
    "exemplos": ["..."]
  },
  "checklistSubida": [
    "Pixel instalado na LP ✓",
    "Evento de conversão configurado (Lead) ✓",
    "UTMs em todos os links ✓",
    "Criativos aprovados pela política do Meta ✓",
    "Budget diário ≤ budget semanal / 7 ✓"
  ],
  "projecao": {
    "leadsEstimados": "X-Y leads/semana",
    "cplEstimado": "R$ X-Y",
    "impressoesEstimadas": "X-Y mil"
  }
}
  `, { model: MODELS.carrossel });

  return resultado;
}

/**
 * Gera as copies de anúncio para múltiplos públicos a partir de um post orgânico
 * que já performou bem. Mantém o tom orgânico — não "vira anúncio".
 *
 * @param {Object} postOrganico - { legenda, tema, primeiraLinha, tipo }
 * @param {string[]} publicosAlvo - Quais públicos adaptar
 */
export async function adaptarPostParaAnuncio(postOrganico, publicosAlvo = ["lal1pct", "remarketing30d"]) {
  console.log(`\n✂️  Adaptando post orgânico para anúncio: "${postOrganico.tema}"...`);

  const result = await chatJSON(SYSTEM_ADS, `
Este post orgânico performou bem e vai ser impulsionado.
Adapte a copy para anúncio mantendo o tom original — não "vira anúncio", continua parecendo post.

POST ORIGINAL:
"${postOrganico.legenda}"

PÚBLICOS PARA ADAPTAR:
${publicosAlvo.map((k) => `- ${k}: ${PUBLICOS[k]?.descricao || k}`).join("\n")}

Para cada público, gere uma variação de copy que:
- Mantém a primeira frase do post original (já estava funcionando)
- Ajusta o CTA para o nível de consciência daquele público
  → Frio: foco na dor
  → Morno: foco no benefício
  → Quente: foco na oferta/trial

Responda com JSON:
{
  "adaptacoes": [
    {
      "publico": "nome do público",
      "temperatura": "frio | morno | quente",
      "textoPrincipal": "Copy completa do anúncio (máx 150 palavras)",
      "headline": "Headline (máx 10 palavras)",
      "cta": "Teste grátis | Saiba mais | Entrar na lista",
      "diferencaDoOriginal": "O que foi ajustado e por quê"
    }
  ]
}
  `, { model: MODELS.criativo });

  return result.adaptacoes || [];
}

/**
 * Salva o plano de campanha em arquivo e exibe o checklist de subida
 *
 * @param {Object} campanha - Saída de montarCampanha()
 * @param {string} outputDir - Diretório de saída
 */
export async function salvarPlanoCampanha(campanha, outputDir) {
  await fs.ensureDir(outputDir);

  const jsonPath = path.join(outputDir, "campanha.json");
  await fs.writeJSON(jsonPath, campanha, { spaces: 2 });

  // Checklist em .txt para o time de mídia
  const checklist = `
PLANO DE CAMPANHA — ${campanha.campanha?.nome || "Evolua"}
${"=".repeat(60)}

CAMPANHA:
  Nome: ${campanha.campanha?.nome}
  Objetivo: ${campanha.campanha?.objetivo}
  Budget semanal: ${campanha.campanha?.budgetSemanal}
  Período: ${campanha.campanha?.dataInicio} → ${campanha.campanha?.dataFim}

PROJEÇÃO:
  Leads estimados: ${campanha.projecao?.leadsEstimados}
  CPL estimado: ${campanha.projecao?.cplEstimado}

CONJUNTOS DE ANÚNCIOS:
${(campanha.conjuntos || [])
  .map(
    (c) => `
  [${c.nome}]
  Público: ${c.publico}
  Budget: ${c.budget}
  CPL alvo: ${c.kpis?.cplAlvo}
  CTR mínimo: ${c.kpis?.ctrMinimo}
  Prazo de análise: ${c.kpis?.prazoAnalise}
  
  Criativos:
${(c.criativos || []).map((cr) => `    • ${cr.nome}\n      Headline: "${cr.headline}"\n      UTM: ${cr.parametrosUTM}`).join("\n")}
`
  )
  .join("\n")}

CHECKLIST ANTES DE SUBIR:
${(campanha.checklistSubida || []).map((item) => `  ☐ ${item}`).join("\n")}
`.trim();

  const checklistPath = path.join(outputDir, "campanha-checklist.txt");
  await fs.writeFile(checklistPath, checklist);

  console.log(`  ✅ Plano salvo em: ${path.basename(outputDir)}/`);
  console.log(`  📋 Conjuntos: ${campanha.conjuntos?.length || 0} | Projeção: ${campanha.projecao?.leadsEstimados}`);

  return { jsonPath, checklistPath };
}

// ── Execução direta ───────────────────────────────────────────────────────────
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const semana = process.argv[2] || "2026-W18";

  montarCampanha({
    objetivo: "leads",
    budgetSemanal: 500,
    criativo: {
      tipo: "Reels 30s",
      tema: "fonoaudióloga perdendo dinheiro sem saber",
    },
    landingPage: "https://useevolua.com.br/cadastro",
    semana,
    publicos: ["lal1pct", "remarketing30d"],
  })
    .then((campanha) => {
      const outputDir = path.join(__dirname, `../output/${semana}/campanha`);
      return salvarPlanoCampanha(campanha, outputDir);
    })
    .catch(console.error);
}
