#!/usr/bin/env node
// scripts/cronjob-semanal.js
//
// Cronjob semanal de geração de conteúdo + envio de email
//
// Uso manual:
//   node scripts/cronjob-semanal.js
//   node scripts/cronjob-semanal.js --sem-upload
//   node scripts/cronjob-semanal.js --so-email            (só envia o email, não regera)
//   node scripts/cronjob-semanal.js --semana=2026-05-05_a_2026-05-11
//
// Agendamento (cron):
//   Toda segunda-feira às 07:00 → 0 7 * * 1
//
//   No Linux/Mac (crontab -e):
//     0 7 * * 1 cd /caminho/para/projeto && node scripts/cronjob-semanal.js >> logs/cron.log 2>&1
//
//   No Windows (Task Scheduler) ou via GitHub Actions (.github/workflows/content-weekly.yml)

import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { config as dotenvConfig } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GERADOR_DIR = path.join(__dirname, "../.agents/marketing/gerador");
const ENV_FILE = path.join(GERADOR_DIR, ".env");

// Carrega o .env do gerador
if (fs.existsSync(ENV_FILE)) {
  dotenvConfig({ path: ENV_FILE });
} else {
  console.error(`❌ .env não encontrado em: ${ENV_FILE}`);
  console.error(`   Crie o arquivo baseado em: ${ENV_FILE}.example`);
  process.exit(1);
}

// ── Parse de argumentos ───────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(name) {
  const arg = args.find((a) => a.startsWith(`--${name}`));
  if (!arg) return null;
  const parts = arg.split("=");
  return parts.length > 1 ? parts[1] : true;
}

const semOptArg = getArg("semana");
const semUpload = !args.includes("--sem-upload");
const soEmail = args.includes("--so-email");

// ── Helpers ───────────────────────────────────────────────────────────────────
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

const semanaSlug = semOptArg || getSemanaSlug();

// ── Log com timestamp ─────────────────────────────────────────────────────────
function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
}

// ── Etapa 1: Gerar conteúdo ───────────────────────────────────────────────────
async function gerarConteudo() {
  log(`🚀 Iniciando geração de conteúdo da semana ${semanaSlug}...`);

  const uploadFlag = semUpload ? "" : " --sem-upload";
  const semanaFlag = semOptArg ? ` --semana=${semOptArg}` : "";
  const cmd = `node src/index.js semana${semanaFlag}${uploadFlag}`;

  log(`   Comando: ${cmd}`);
  log(`   Diretório: ${GERADOR_DIR}\n`);

  try {
    execSync(cmd, {
      cwd: GERADOR_DIR,
      stdio: "inherit",
      env: { ...process.env },
    });
    log("✅ Conteúdo gerado com sucesso.");
  } catch (err) {
    log(`❌ Erro ao gerar conteúdo: ${err.message}`);
    throw err;
  }
}

// ── Etapa 2: Enviar email ─────────────────────────────────────────────────────
async function enviarEmail() {
  log(`\n📧 Enviando relatório por email...`);

  // Import dinâmico para usar o módulo ESM do gerador
  const { enviarRelatorioSemanal } = await import(
    path.join(GERADOR_DIR, "src/email-report.js")
  );

  await enviarRelatorioSemanal(semanaSlug);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  log("═══════════════════════════════════════════════════");
  log("  Evolua — Cronjob Semanal de Conteúdo");
  log(`  Semana: ${semanaSlug}`);
  log("═══════════════════════════════════════════════════\n");

  try {
    if (!soEmail) {
      await gerarConteudo();
    } else {
      log("⏩ Pulando geração (--so-email). Usando output existente.");
    }

    await enviarEmail();

    log("\n═══════════════════════════════════════════════════");
    log("  ✅ Cronjob concluído com sucesso!");
    log("═══════════════════════════════════════════════════");
  } catch (err) {
    log(`\n❌ Cronjob falhou: ${err.message}`);
    log(err.stack);
    process.exit(1);
  }
}

main();
