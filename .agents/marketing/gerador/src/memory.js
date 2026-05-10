// src/memory.js
// Memória persistente de conteúdos publicados.
// Impede repetição de temas, ângulos e insights entre semanas.
//
// Estrutura do arquivo memory.json:
// {
//   "publicados": [
//     {
//       "semana": "2026-04-27_a_2026-05-03",
//       "publicadoEm": "2026-04-29T...",
//       "tema": "fonoaudióloga perdendo dinheiro sem saber",
//       "ganchoAmplo": "Você provavelmente está deixando dinheiro na mesa toda semana",
//       "insight": "Não é problema de valor — é problema de gestão sem dados",
//       "pilar": 1,
//       "formato": "Carrossel 7 slides",
//       "slug": "fonoaudiologa-perdendo-dinheiro-sem-saber"
//     }
//   ]
// }

import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MEMORY_PATH = path.join(__dirname, "../memory.json");

/**
 * Carrega a memória do disco. Cria arquivo vazio se não existir.
 */
async function carregarMemoria() {
  await fs.ensureFile(MEMORY_PATH);
  try {
    const data = await fs.readJSON(MEMORY_PATH);
    return data;
  } catch {
    return { publicados: [] };
  }
}

/**
 * Salva a memória no disco.
 */
async function salvarMemoria(data) {
  await fs.writeJSON(MEMORY_PATH, data, { spaces: 2 });
}

/**
 * Retorna todos os temas já publicados (para injetar no prompt).
 * Inclui tema, gancho, insight e slug — para que a IA evite QUALQUER sobreposição.
 * @param {number} [limiteSemanas=16] - Quantas semanas de histórico considerar (padrão: 4 meses)
 */
export async function getTemasPublicados(limiteSemanas = 16) {
  const memoria = await carregarMemoria();
  return memoria.publicados.slice(-limiteSemanas * 7); // ~7 posts/semana
}

/**
 * Retorna os temas das últimas N semanas em formato texto para o prompt da IA.
 * @param {number} [limiteSemanas=16]
 */
export async function getHistoricoParaPrompt(limiteSemanas = 16) {
  const publicados = await getTemasPublicados(limiteSemanas);
  if (publicados.length === 0) return null;

  // Agrupa por semana para leitura mais clara
  const porSemana = {};
  for (const item of publicados) {
    if (!porSemana[item.semana]) porSemana[item.semana] = [];
    porSemana[item.semana].push(item);
  }

  const linhas = [];
  for (const [semana, posts] of Object.entries(porSemana)) {
    linhas.push(`Semana ${semana}:`);
    for (const p of posts) {
      linhas.push(
        `  • [Pilar ${p.pilar}] "${p.tema}" — gancho: "${p.ganchoAmplo}" — insight: "${p.insight}"`
      );
    }
  }

  return linhas.join("\n");
}

/**
 * Registra os posts gerados na memória persistente.
 * Chame esta função APÓS gerar e salvar os arquivos da semana.
 * @param {string} semana - Ex: "2026-04-27_a_2026-05-03"
 * @param {Object[]} posts - Array de briefings dos posts gerados
 */
export async function registrarSemana(semana, posts) {
  const memoria = await carregarMemoria();

  const novos = posts.map((p) => ({
    semana,
    publicadoEm: new Date().toISOString(),
    tema: p.tema,
    ganchoAmplo: p.ganchoAmplo || "",
    insight: p.insight || "",
    pilar: p.pilar,
    formato: p.formato,
    slug: (p.tema || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60),
  }));

  memoria.publicados.push(...novos);
  await salvarMemoria(memoria);

  console.log(`\n💾 Memória atualizada: ${novos.length} posts registrados (total: ${memoria.publicados.length})`);
}

/**
 * Verifica se um tema é muito similar a algo já publicado.
 * Usa comparação simples de tokens — a IA faz a validação semântica mais fina.
 * @param {string} tema
 * @returns {{ repetido: boolean, similar: Object|null }}
 */
export async function verificarUnicidade(tema) {
  const publicados = await getTemasPublicados();
  const temaTokens = tokenizar(tema);

  for (const p of publicados) {
    const tokens = tokenizar(p.tema + " " + p.ganchoAmplo + " " + p.insight);
    const sobreposicao = temaTokens.filter((t) => tokens.includes(t)).length;
    const similaridade = sobreposicao / Math.max(temaTokens.length, 1);

    // Mais de 60% de sobreposição de tokens = similar demais
    if (similaridade > 0.6) {
      return { repetido: true, similar: p };
    }
  }

  return { repetido: false, similar: null };
}

function tokenizar(texto) {
  return (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((t) => t.length > 3); // ignora palavras curtas
}
