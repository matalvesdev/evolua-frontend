// src/report.js
// Report diário automático de performance — baseado no G4OS (vídeo 2)
//
// CONCEITO CENTRAL (vídeo 2):
// Report gerado às 9h com: MQLs do dia anterior, pace da semana, forecast do mês,
// saúde de captação, alertas de anomalia — enviado para Slack automaticamente.
//
// MÉTRICAS DE OUTPUT (não vaidade):
// — MQLs gerados (Meta: cliques no link da bio que viraram cadastros)
// — CPL (custo por lead — orgânico e pago separados)
// — Taxa de conversão do formulário
// — Pace: ritmo atual vs. meta mensal
// — Forecast: se continuar assim, fecha o mês em quanto?

import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { chat, chatJSON } from "./openai-client.js";
import { MODELS } from "./ai-client.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Estrutura de dados de performance ────────────────────────────────────────

/**
 * Carrega ou inicializa o arquivo de métricas da semana
 * @param {string} semanaSlug - Ex: "2026-W05"
 */
export async function carregarMetricas(semanaSlug) {
  const metricasPath = path.join(__dirname, `../output/${semanaSlug}/metricas.json`);

  if (await fs.pathExists(metricasPath)) {
    return await fs.readJSON(metricasPath);
  }

  // Estrutura inicial vazia
  const vazia = {
    semana: semanaSlug,
    atualizadoEm: new Date().toISOString(),
    metaMensal: {
      leads: parseInt(process.env.META_LEADS_MES || "100"),
      cplMaximo: parseFloat(process.env.CPL_MAXIMO || "30"),
    },
    dias: [],
    posts: [],
  };

  await fs.ensureDir(path.dirname(metricasPath));
  await fs.writeJSON(metricasPath, vazia, { spaces: 2 });
  return vazia;
}

/**
 * Registra as métricas do dia
 * @param {string} semanaSlug
 * @param {Object} dadosDoDia - { data, leadsOrganicos, leadsPagos, cliquesLinkBio, impressoes, alcance }
 */
export async function registrarDia(semanaSlug, dadosDoDia) {
  const metricas = await carregarMetricas(semanaSlug);

  metricas.dias.push({
    ...dadosDoDia,
    registradoEm: new Date().toISOString(),
  });

  metricas.atualizadoEm = new Date().toISOString();

  const metricasPath = path.join(__dirname, `../output/${semanaSlug}/metricas.json`);
  await fs.writeJSON(metricasPath, metricas, { spaces: 2 });

  return metricas;
}

/**
 * Registra métricas de um post específico
 * @param {string} semanaSlug
 * @param {Object} dadosPost - { postSlug, alcance, impressoes, salvamentos, cliques, leads }
 */
export async function registrarPost(semanaSlug, dadosPost) {
  const metricas = await carregarMetricas(semanaSlug);

  const idx = metricas.posts.findIndex((p) => p.postSlug === dadosPost.postSlug);
  if (idx >= 0) {
    metricas.posts[idx] = { ...metricas.posts[idx], ...dadosPost, atualizadoEm: new Date().toISOString() };
  } else {
    metricas.posts.push({ ...dadosPost, registradoEm: new Date().toISOString() });
  }

  const metricasPath = path.join(__dirname, `../output/${semanaSlug}/metricas.json`);
  await fs.writeJSON(metricasPath, metricas, { spaces: 2 });
}

// ── Geração do report ─────────────────────────────────────────────────────────

/**
 * Gera o report diário de performance com análise de IA
 * Equivalente ao report que o G4OS enviava ao Slack às 9h
 *
 * @param {Object} metricas - Dados carregados por carregarMetricas()
 * @param {Object} opcoes - { formato: 'slack' | 'markdown' | 'json' }
 */
export async function gerarReportDiario(metricas, opcoes = {}) {
  console.log(`\n📊 Gerando report diário de performance...`);

  const formato = opcoes.formato || "markdown";

  // Calcular agregados
  const totalLeads = metricas.dias.reduce((s, d) => s + (d.leadsOrganicos || 0) + (d.leadsPagos || 0), 0);
  const diasRegistrados = metricas.dias.length;
  const diasNoMes = 30;
  const diasRestantes = diasNoMes - diasRegistrados;
  const paceDiario = diasRegistrados > 0 ? totalLeads / diasRegistrados : 0;
  const forecast = Math.round(paceDiario * diasNoMes);
  const metaMensal = metricas.metaMensal?.leads || 100;
  const percMeta = Math.round((totalLeads / metaMensal) * 100);
  const tendencia = forecast >= metaMensal ? "✅ no ritmo" : forecast >= metaMensal * 0.8 ? "⚠️ abaixo" : "🚨 risco";

  // Post de melhor performance
  const melhorPost = metricas.posts.sort((a, b) => (b.leads || 0) - (a.leads || 0))[0];

  // Análise de IA das anomalias e próximos passos
  const analiseIA = await chat(
    `Você é o analista de performance do Evolua. Analisa métricas de geração de leads via Instagram.
Tom: direto, sem rodeios. Fala para o CMO (João Branco), não para iniciante.`,
    `Analise estes dados de performance da semana ${metricas.semana}:

Total de leads: ${totalLeads}
Meta do mês: ${metaMensal}
% da meta: ${percMeta}%
Pace diário: ${paceDiario.toFixed(1)} leads/dia
Forecast para o mês: ${forecast} leads
Tendência: ${tendencia}

Posts registrados: ${metricas.posts.length}
Melhor post: ${melhorPost ? `"${melhorPost.postSlug}" (${melhorPost.leads || 0} leads)` : "nenhum"}

Dados por dia:
${metricas.dias.map((d) => `- ${d.data}: ${(d.leadsOrganicos || 0) + (d.leadsPagos || 0)} leads (org: ${d.leadsOrganicos || 0}, pago: ${d.leadsPagos || 0}), ${d.cliquesLinkBio || 0} cliques no link`).join("\n")}

Gere:
1. Uma frase de diagnóstico do momento (máx 15 palavras)
2. O principal ponto de atenção (o que está travando ou acelerando)
3. 2 ações concretas para os próximos 2 dias
4. Um alerta se houver anomalia (queda > 30% em relação à média, ou aceleração incomum)

Formato: texto corrido, máx 120 palavras.`,
    { model: MODELS.rapido }
  );

  // Montar o report
  const report = {
    semana: metricas.semana,
    geradoEm: new Date().toISOString(),
    resumo: {
      totalLeads,
      metaMensal,
      percMeta,
      paceDiario: paceDiario.toFixed(1),
      forecast,
      tendencia,
      diasRegistrados,
      diasRestantes,
    },
    melhorPost,
    analiseIA,
    dias: metricas.dias,
  };

  // Formatar para o canal escolhido
  let output;

  if (formato === "slack") {
    output = formatarSlack(report);
  } else if (formato === "markdown") {
    output = formatarMarkdown(report);
  } else {
    output = report;
  }

  // Salvar
  const reportPath = path.join(
    __dirname,
    `../output/${metricas.semana}/report-${new Date().toISOString().slice(0, 10)}.${formato === "json" ? "json" : "md"}`
  );
  await fs.ensureDir(path.dirname(reportPath));

  if (formato === "json") {
    await fs.writeJSON(reportPath, output, { spaces: 2 });
  } else {
    await fs.writeFile(reportPath, typeof output === "string" ? output : JSON.stringify(output, null, 2));
  }

  console.log(`  ✅ Report salvo: ${path.basename(reportPath)}`);
  console.log(`  📈 ${percMeta}% da meta | Forecast: ${forecast} leads | ${tendencia}`);

  return { report, output, reportPath };
}

// ── Formatadores ──────────────────────────────────────────────────────────────

function formatarMarkdown(report) {
  const { resumo, analiseIA, melhorPost } = report;
  const data = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });

  return `# Report de Performance — ${data}
**Semana:** ${report.semana} | **Gerado às:** ${new Date().toLocaleTimeString("pt-BR")}

---

## Leads

| Métrica | Valor |
|---|---|
| Total no período | **${resumo.totalLeads}** |
| Meta do mês | ${resumo.metaMensal} |
| % da meta | **${resumo.percMeta}%** |
| Pace diário | ${resumo.paceDiario} leads/dia |
| Forecast do mês | **${resumo.forecast} leads** |
| Tendência | ${resumo.tendencia} |

---

## Análise IA

${analiseIA}

---

## Melhor post

${melhorPost ? `**${melhorPost.postSlug}** — ${melhorPost.leads || 0} leads | ${melhorPost.alcance || 0} alcance | ${melhorPost.salvamentos || 0} salvamentos` : "_Nenhum post registrado ainda._"}

---

## Dias registrados (${resumo.diasRegistrados} dias)

${report.dias.map((d) => `- **${d.data}:** ${(d.leadsOrganicos || 0) + (d.leadsPagos || 0)} leads | ${d.cliquesLinkBio || 0} cliques no link`).join("\n")}
`;
}

function formatarSlack(report) {
  const { resumo, analiseIA } = report;
  const emoji = resumo.tendencia.includes("✅") ? "🟢" : resumo.tendencia.includes("⚠️") ? "🟡" : "🔴";

  return `${emoji} *Report Evolua — ${new Date().toLocaleDateString("pt-BR")}*

*Leads:* ${resumo.totalLeads} | *Meta:* ${resumo.metaMensal} | *${resumo.percMeta}% da meta*
*Pace:* ${resumo.paceDiario}/dia → Forecast: *${resumo.forecast} leads no mês*
Tendência: ${resumo.tendencia}

*Análise:*
${analiseIA}`;
}

// ── Execução direta ───────────────────────────────────────────────────────────
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const semanaSlug = process.argv[2] || "2026-W18";

  // Exemplo: carrega métricas e gera report
  carregarMetricas(semanaSlug)
    .then((metricas) => gerarReportDiario(metricas, { formato: "markdown" }))
    .then(({ report }) => {
      console.log("\n📋 Report gerado:");
      console.log(`   Leads: ${report.resumo.totalLeads} / ${report.resumo.metaMensal}`);
      console.log(`   Forecast: ${report.resumo.forecast}`);
    })
    .catch(console.error);
}
