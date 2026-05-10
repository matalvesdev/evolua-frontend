#!/usr/bin/env node
// src/index.js
// Entry point do gerador de conteúdo do Evolua

import { gerarSemana } from "./generate-week.js";
import { pesquisarSemana, pesquisarFontesCientificas } from "./research.js";
import { executarPesquisaSemanal } from "./web-research.js";
import { carregarMetricas, gerarReportDiario } from "./report.js";
import { montarCampanha, adaptarPostParaAnuncio } from "./ads-builder.js";
import { closeBrowser } from "./render.js";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const comando = args[0] || "semana";

function parseArgs(args) {
  const opts = {};
  for (const arg of args) {
    if (arg.startsWith("--")) {
      const [key, value] = arg.slice(2).split("=");
      opts[key] = value !== undefined ? value : true;
    }
  }
  return opts;
}

const opts = parseArgs(args.slice(1));

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

async function main() {
  console.log("🎯 Evolua Content Generator\n");

  switch (comando) {
    // ── Gerar semana completa ──────────────────────────────────────────────
    case "semana": {
      await gerarSemana({
        semana: opts.semana,
        temasFoco: opts.foco ? opts.foco.split(",") : [],
        temasEvitar: opts.evitar ? opts.evitar.split(",") : [],
        upload: opts["sem-upload"] ? false : true,
      });
      break;
    }

    // ── Somente gerar briefing (com pesquisa web) ──────────────────────────
    case "pesquisa": {
      await gerarSemana({
        semana: opts.semana,
        temasFoco: opts.foco ? opts.foco.split(",") : [],
        temasEvitar: opts.evitar ? opts.evitar.split(",") : [],
        somentePesquisa: true,
      });
      break;
    }

    // ── Somente executar a pesquisa web (PubMed + Trends + RSS) ───────────
    case "pesquisar": {
      const semana = opts.semana || getSemanaSlug();
      console.log(`🌐 Executando pesquisa web para a semana ${semana}...\n`);

      const resultado = await executarPesquisaSemanal();

      const outputPath = path.join(__dirname, `../output/${semana}/pesquisa-web.json`);
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeJSON(outputPath, resultado, { spaces: 2 });

      console.log(`\n✅ Pesquisa concluída:`);
      console.log(`   ${resultado.raw?.artigos?.length || 0} artigos PubMed`);
      console.log(`   ${resultado.raw?.tendencias?.length || 0} tendências Google`);
      console.log(`   ${resultado.raw?.noticias?.length || 0} notícias do setor`);
      console.log(`   ${resultado.insightsPilar2?.length || 0} insights prontos para Pilar 2`);
      console.log(`\n   Resumo: ${resultado.resumoPesquisa}`);
      console.log(`\n   Salvo em: output/${semana}/pesquisa-web.json`);
      break;
    }

    // ── Pesquisar fontes científicas de um tema no PubMed ─────────────────
    case "fontes": {
      if (!opts.tema) {
        console.error('❌ Informe o tema: --tema="disfagia em idosos"');
        process.exit(1);
      }

      console.log(`🔬 Pesquisando fontes científicas para: "${opts.tema}"\n`);
      const fontes = await pesquisarFontesCientificas(opts.tema);

      console.log(`\n✅ ${fontes.length} artigos encontrados:\n`);
      for (const f of fontes) {
        console.log(`• PMID ${f.pmid} — ${f.titulo}`);
        console.log(`  ${f.autores} (${f.ano}), ${f.revista}`);
        if (f.resumo) console.log(`  ${f.resumo.slice(0, 200)}...`);
        console.log();
      }

      // Salva para consulta manual
      if (fontes.length > 0) {
        const outputPath = path.join(__dirname, `../output/fontes-${opts.tema.replace(/\s+/g, "-").slice(0, 30)}.json`);
        await fs.ensureDir(path.dirname(outputPath));
        await fs.writeJSON(outputPath, fontes, { spaces: 2 });
        console.log(`   Salvo em: ${outputPath}`);
      }
      break;
    }

    // ── Report diário de performance (G4OS) ───────────────────────────────
    case "report": {
      const semana = opts.semana || getSemanaSlug();
      const formato = opts.formato || "markdown";

      console.log(`📊 Gerando report da semana ${semana}...`);
      const metricas = await carregarMetricas(semana);
      const report = await gerarReportDiario(metricas, { formato });

      const outputPath = path.join(__dirname, `../output/${semana}/report-${new Date().toISOString().slice(0, 10)}.${formato === "slack" ? "json" : "md"}`);
      await fs.ensureDir(path.dirname(outputPath));

      if (formato === "slack") {
        await fs.writeJSON(outputPath, report, { spaces: 2 });
      } else {
        await fs.writeFile(outputPath, typeof report === "string" ? report : JSON.stringify(report, null, 2));
      }

      console.log(`\n✅ Report salvo em: ${outputPath}`);
      if (typeof report === "string") {
        console.log("\n" + "─".repeat(60));
        console.log(report);
      }
      break;
    }

    // ── Montar campanha de anúncios em < 7 minutos (G4OS) ─────────────────
    case "campanha": {
      const semana = opts.semana || getSemanaSlug();

      if (!opts.objetivo) {
        console.error("❌ Informe o objetivo: --objetivo=leads|trafego|alcance");
        process.exit(1);
      }

      if (!opts.tema) {
        console.error('❌ Informe o tema do criativo: --tema="disfagia em adultos"');
        process.exit(1);
      }

      if (opts.post) {
        const postDir = path.resolve(opts.post);
        const postJson = path.join(postDir, "post.json");

        if (!(await fs.pathExists(postJson))) {
          console.error(`❌ post.json não encontrado em: ${postDir}`);
          process.exit(1);
        }

        const postOrganico = await fs.readJSON(postJson);
        const publicos = opts.publico ? opts.publico.split(",") : ["lal1pct", "remarketing30d"];

        console.log(`\n📣 Adaptando post orgânico para anúncio...`);
        const campanha = await adaptarPostParaAnuncio(postOrganico, publicos);
        const outputDir = path.join(postDir, "campanha");
        const { salvarPlanoCampanha } = await import("./ads-builder.js");
        await salvarPlanoCampanha(campanha, outputDir);
        console.log(`\n✅ Campanha salva em: ${outputDir}`);
      } else {
        const campanha = await montarCampanha({
          objetivo: opts.objetivo,
          budgetSemanal: parseFloat(opts.budget || "500"),
          criativo: { tipo: opts.tipo || "carrossel", tema: opts.tema },
          landingPage: opts.lp || process.env.LANDING_PAGE_URL || "https://useevolua.app",
          semana,
          publicos: opts.publico ? opts.publico.split(",") : undefined,
        });

        const outputDir = path.join(__dirname, `../output/${semana}/campanha-${opts.tema.slice(0, 20).replace(/\s+/g, "-").toLowerCase()}`);
        const { salvarPlanoCampanha } = await import("./ads-builder.js");
        await salvarPlanoCampanha(campanha, outputDir);
        console.log(`\n✅ Plano de campanha salvo em: ${outputDir}`);
      }
      break;
    }

    // ── Ajuda ──────────────────────────────────────────────────────────────
    case "help":
    default: {
      console.log(`Uso: node src/index.js <comando> [opções]

COMANDOS:
  semana      Ciclo completo — pesquisa web → briefing → posts → reels → blog → imagens → upload
  pesquisa    Gera apenas o briefing da semana (inclui pesquisa web, sem criar conteúdo)
  pesquisar   Executa só a pesquisa web (PubMed + Google Trends + RSS) e salva o resultado
  fontes      Pesquisa fontes científicas de um tema no PubMed e lista os artigos encontrados
  report      Gera o report diário de performance (G4OS)
  campanha    Monta campanha de anúncios em < 7 minutos (G4OS)
  help        Exibe esta mensagem

OPÇÕES GERAIS:
  --semana=2026-04-28_a_2026-05-04   Semana específica (padrão: semana atual)

OPÇÕES — semana / pesquisa:
  --foco=tema1,tema2    Temas para priorizar
  --evitar=tema1,tema2  Temas já publicados (para não repetir)
  --sem-upload          Não faz upload para Supabase

OPÇÕES — fontes:
  --tema="disfagia em idosos"   Tema a pesquisar no PubMed (obrigatório)

OPÇÕES — report:
  --formato=markdown    Formato de saída: markdown (padrão) | slack | json

OPÇÕES — campanha:
  --objetivo=leads      leads | trafego | alcance (obrigatório)
  --tema="disfagia"     Tema do criativo (obrigatório)
  --budget=500          Budget semanal em R$ (padrão: 500)
  --tipo=carrossel      Tipo de criativo: carrossel | reels | estatico
  --publico=lal1pct     Públicos: interesse,lal1pct,remarketing30d,engajados90d
  --lp=https://...      URL da landing page
  --post=output/...     Pasta de post orgânico para adaptar direto para anúncio

EXEMPLOS:
  node src/index.js semana
  node src/index.js semana --sem-upload
  node src/index.js pesquisar
  node src/index.js pesquisa --foco="disfagia,gagueira"
  node src/index.js fontes --tema="orofacial myofunctional therapy"
  node src/index.js report --formato=slack
  node src/index.js campanha --objetivo=leads --tema="disfagia em adultos" --budget=800
`);
      break;
    }
  }
}

main()
  .catch((err) => {
    console.error("\n❌ Erro fatal:", err.message);
    console.error(err.stack);
    process.exit(1);
  })
  .finally(async () => {
    await closeBrowser();
  });

