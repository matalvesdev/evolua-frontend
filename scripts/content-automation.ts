/**
 * scripts/content-automation.ts
 *
 * Script legado de automação de conteúdo.
 *
 * ATENÇÃO: A geração de conteúdo foi migrada para o gerador standalone:
 *   .agents/marketing/gerador/
 *
 * Para gerar conteúdo, use:
 *   cd .agents/marketing/gerador
 *   npm install
 *   node src/index.js semana
 *
 * Ver README completo em: .agents/marketing/gerador/README.md
 */

async function main() {
  console.log("⚠️  Este script foi substituído pelo gerador standalone.\n");
  console.log("Para gerar conteúdo, execute:\n");
  console.log("  cd .agents/marketing/gerador");
  console.log("  npm install");
  console.log("  node src/index.js semana\n");
  console.log("Documentação: .agents/marketing/gerador/README.md");
}

main().catch(console.error);
