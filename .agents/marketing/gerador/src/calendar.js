// src/calendar.js
// Gera o calendário editorial da semana baseado nos pilares de conteúdo

import { chatJSON } from "./openai-client.js";
import { pilares, persona } from "./config.js";
import { format, startOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SYSTEM_PROMPT = `Você é o CMO do Evolua — João Branco, ex-CMO do McDonald's Brasil.
Você cria calendários editoriais para o Instagram do Evolua (@useevoluaapp), 
um sistema de gestão para fonoaudiólogas.

Persona alvo: ${persona.nome} — ${persona.descricao}

Pilares de conteúdo:
${Object.entries(pilares).map(([id, p]) => `  Pilar ${id}: ${p.nome} (${p.percentual}% do feed)`).join("\n")}

Regras de frequência:
- Reels (15-30s): 3x por semana (Seg/Qua/Sex às 19h)
- Carrossel (4-7 slides): 2x por semana (Ter/Qui às 12h)
- Stories: diários (8h + 20h)

Tom de voz: próximo, direto, leve, especialista. Sem "solução", "inovar", "ecossistema".`;

/**
 * Gera o calendário da semana atual
 * @returns {Array} Array de posts planejados
 */
export async function gerarCalendario(dataReferencia = new Date()) {
  const inicioSemana = startOfWeek(dataReferencia, { weekStartsOn: 1 }); // Segunda
  const diasSemana = Array.from({ length: 5 }, (_, i) => addDays(inicioSemana, i));

  const semanaFormatada = `${format(diasSemana[0], "dd/MM", { locale: ptBR })} a ${format(diasSemana[4], "dd/MM", { locale: ptBR })}`;

  console.log(`📅 Gerando calendário para a semana de ${semanaFormatada}...`);

  const result = await chatJSON(SYSTEM_PROMPT, `
Gere o calendário editorial para a semana de ${semanaFormatada}.

Crie exatamente 5 posts (um por dia útil: Seg, Ter, Qua, Qui, Sex).

Distribuição obrigatória desta semana:
- 3 Reels (Seg, Qua, Sex) — escolha pilares variados
- 2 Carrosséis (Ter, Qui) — escolha pilares variados

Responda com JSON no formato:
{
  "semana": "${semanaFormatada}",
  "posts": [
    {
      "dia": "Segunda",
      "data": "DD/MM/AAAA",
      "horario": "19:00",
      "formato": "Reels 30s",
      "pilar": 1,
      "tema": "Título curto e direto do post",
      "gancho": "Primeira linha que para o scroll",
      "descricao": "2-3 frases sobre o que o post vai abordar",
      "cta": "O que você quer que a pessoa faça",
      "hashtags": ["#fono1", "#fono2", "#fono3", "#fono4", "#fono5"]
    }
  ]
}
  `);

  // Salvar calendário
  const outputDir = path.join(__dirname, "../output", `Semana ${semanaFormatada.replace("/", "-")}`);
  await fs.ensureDir(outputDir);
  const calPath = path.join(outputDir, "calendario.json");
  await fs.writeJSON(calPath, result, { spaces: 2 });

  console.log(`✅ Calendário gerado: ${calPath}`);
  return result;
}

// Execução direta: node src/calendar.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  gerarCalendario()
    .then((cal) => {
      console.log("\n📋 Posts da semana:");
      cal.posts.forEach((p) => {
        console.log(`  ${p.dia} (${p.data}) ${p.horario} — ${p.formato} | Pilar ${p.pilar}: ${p.tema}`);
      });
    })
    .catch(console.error);
}
