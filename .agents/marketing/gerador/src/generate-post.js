// src/generate-post.js
// Gera posts completos seguindo o playbook G4/Crasto:
// — gancho amplo na capa (qualquer pessoa clica)
// — afunila progressivamente até só o ICP chegar ao CTA
// — CTA sempre de captura de lead, nunca de "salva esse post"

import { chatJSON, chatCopy } from "./openai-client.js";
import { MODELS } from "./ai-client.js";
import { persona, brand, playbook } from "./config.js";
import { formatarFonteParaPrompt, formatarFonteParaSlide } from "./science-sources.js";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import slugify from "slugify";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── System prompt com o playbook completo ─────────────────────────────────────
const SYSTEM_PROMPT = `Você é o time de conteúdo do Evolua (@useevoluaapp).
Você aplica o playbook do G4 Educação e do RD Reservatório de Dopamina para fonoaudiólogas brasileiras.

PRODUTO: Evolua — sistema de gestão para fonoaudiólogas (prontuário, agenda, cobrança, relatórios).
ICP: ${persona.icp}

POSICIONAMENTO: "${playbook.posicionamento}"

REFERÊNCIAS DE ESTILO:
${playbook.referencias.map((r) => `• ${r.perfil}: ${r.estilo}`).join("\n")}

ANATOMIA DO CARROSSEL (obrigatória):
${Object.entries(playbook.anatomiaCarrossel)
  .map(([k, v]) => `• ${v}`)
  .join("\n")}

REGRAS ABSOLUTAS:
${playbook.regrasDeVoz.join("\n")}
• Posts de Pilar 2 DEVEM citar fonte científica real
• CTA sempre de captura de lead: ${playbook.funilDeLeads.ctas.slice(0, 2).join(" ou ")}
• Legenda: máximo 150 palavras. Primeira frase para o scroll. CTA no final.`;

// ── Gerador principal ─────────────────────────────────────────────────────────

/**
 * Gera um post completo a partir de um briefing
 * @param {Object} briefing - vindo do research.js
 * @param {string} outputDir - diretório raiz da semana
 */
export async function gerarPost(briefing, outputDir) {
  console.log(`\n📝 Gerando: "${briefing.tema}"...`);

  let resultado;
  const formato = briefing.formato.toLowerCase();

  if (formato.includes("carrossel")) {
    resultado = await gerarCarrossel(briefing);
  } else if (formato.includes("reels")) {
    resultado = await gerarReels(briefing);
  } else {
    resultado = await gerarEstatico(briefing);
  }

  // Gerar legenda com Claude (copy emocional) se o modelo estiver disponível
  if (resultado.legenda) {
    resultado.legenda = await refinarLegenda(resultado.legenda, briefing);
  }

  // Salvar arquivos
  const slug = slugify(briefing.tema, { lower: true, strict: true }).slice(0, 50);
  const postDir = path.join(outputDir, slug);
  await fs.ensureDir(postDir);

  const postData = {
    briefing,
    geradoEm: new Date().toISOString(),
    modeloUsado: MODELS.carrossel,
    ...resultado,
  };

  await fs.writeJSON(path.join(postDir, "instagram-post.json"), postData, { spaces: 2 });
  await fs.writeFile(
    path.join(postDir, "instagram-legenda.txt"),
    `${resultado.legenda}\n\n${resultado.hashtags?.join(" ") || ""}`
  );

  console.log(`  ✅ Salvo em: ${path.basename(postDir)}/`);
  return { postDir, ...postData };
}

// ── Carrossel (formato principal — playbook G4) ───────────────────────────────

async function gerarCarrossel(briefing) {
  const numSlides = extrairNumSlides(briefing.formato) || 7;

  // Monta bloco de fonte científica — só usa o banco curado, nunca inventa
  const fonte = briefing.fontesCientificas;
  const blocoFonte = fonte
    ? `FONTE CIENTÍFICA OBRIGATÓRIA (use esta — não invente outra):
${formatarFonteParaPrompt(fonte)}
Aplicação clínica: ${fonte.aplicacaoClinica}
Citação para o slide: "${formatarFonteParaSlide(fonte)}"
IMPORTANTE: O dado do slide deve vir desta fonte. Não adicione estatísticas que não estão nela.`
    : "";

  const result = await chatJSON(SYSTEM_PROMPT, `
Crie um carrossel de ${numSlides} slides para o @useevoluaapp seguindo EXATAMENTE a anatomia G4.

BRIEFING:
- Tema: ${briefing.tema}
- Pilar: ${briefing.pilar}
- Gancho amplo: ${briefing.ganchoAmplo}
- Afunilamento: ${briefing.afunilamento}
- Insight da virada: ${briefing.insight}
- CTA: ${briefing.cta}
${blocoFonte}

REGRA DE AFUNILAMENTO (crítica):
- Slide 1 (capa): O gancho é amplo — NÃO menciona fonoaudióloga ainda. Qualquer pessoa clicaria.
- Slides 2-3: Contexto e problema. Começa a qualificar o público.
- Slides 4-5: Aprofundamento. Só o ICP (fonoaudióloga com clínica) ainda está acompanhando.
- Slide ${numSlides - 1}: O insight que muda como a pessoa pensa sobre o problema.
- Slide ${numSlides} (CTA): Uma ação de lead — link na bio, DM, formulário. Nunca "salva esse post".

${fonte ? `REGRA DE FONTE: Um dos slides intermediários deve apresentar o dado da fonte científica acima. Cite a fonte no campo "fonte" do slide como: "${formatarFonteParaSlide(fonte)}"` : ""}

Responda com JSON:
{
  "tipo": "carrossel",
  "numSlides": ${numSlides},
  "slides": [
    {
      "numero": 1,
      "tipo": "capa",
      "titulo": "Gancho amplo — máx 8 palavras, impacto máximo",
      "subtitulo": "Contexto que amplia o gancho — máx 15 palavras",
      "icone": "ícone temático"
    },
    {
      "numero": 2,
      "tipo": "conteudo",
      "titulo": "Título da seção",
      "corpo": "Conteúdo do slide (pode ter quebras de linha, máx 80 palavras)",
      "fonte": null
    }
  ],
  "legenda": "Primeira frase para o scroll. Máx 150 palavras. CTA de lead no final.",
  "primeiraLinha": "Só a primeira frase da legenda",
  "hashtags": ["#fonoaudiologia", "#fonoaudióloga", "#gestãoclínica", "#useevolua", "#tag5"],
  "sugestaoVisual": "Como deve parecer visualmente o carrossel"
}
  `);

  return result;
}

// ── Reels (roteiro) ────────────────────────────────────────────────────────────

async function gerarReels(briefing) {
  const duracao = extrairDuracao(briefing.formato) || 30;

  const result = await chatJSON(SYSTEM_PROMPT, `
Crie o roteiro de um Reels de ${duracao} segundos para o @useevoluaapp.

BRIEFING:
- Tema: ${briefing.tema}
- Pilar: ${briefing.pilar}
- Gancho: ${briefing.ganchoAmplo}
- Insight: ${briefing.insight}
- CTA: ${briefing.cta}

REGRAS DO REELS:
- Os primeiros 3 segundos decidem tudo — gancho visual + frase de impacto
- Narração em primeira pessoa ou direto ao ponto, nunca "Olá pessoal"
- CTA verbal + visual no final (falar E mostrar o link da bio)

Responda com JSON:
{
  "tipo": "reels",
  "duracao": ${duracao},
  "hook": "Os primeiros 3 segundos — texto exato da frase de abertura",
  "roteiro": [
    { "segundo": "0-3", "visual": "o que mostrar na tela", "narracao": "texto falado ou legenda na tela" },
    { "segundo": "4-10", "visual": "...", "narracao": "..." }
  ],
  "legenda": "Primeira frase para o scroll. Máx 150 palavras. CTA de lead no final.",
  "primeiraLinha": "Só a primeira frase",
  "hashtags": ["#fonoaudiologia", "#fonoaudióloga", "#gestãoclínica", "#useevolua", "#tag5"],
  "musicaSugerida": "Estilo de música — agitado, reflexivo, motivacional",
  "sugestaoGravacao": "Câmera, luz, cenário, roupa — o que torna o vídeo profissional"
}
  `);

  return result;
}

// ── Estático ───────────────────────────────────────────────────────────────────

async function gerarEstatico(briefing) {
  const result = await chatJSON(SYSTEM_PROMPT, `
Crie um post estático (imagem única) para o @useevoluaapp.

BRIEFING:
- Tema: ${briefing.tema}
- Gancho: ${briefing.ganchoAmplo}
- CTA: ${briefing.cta}

REGRA: A imagem deve ser um dado, frase ou pergunta — algo que a pessoa salva ou compartilha.

Responda com JSON:
{
  "tipo": "estatico",
  "titulo": "Texto principal da imagem (máx 8 palavras, impacto máximo)",
  "subtitulo": "Texto secundário opcional (máx 15 palavras)",
  "legenda": "Legenda completa (máx 150 palavras). CTA de lead no final.",
  "primeiraLinha": "Só a primeira frase",
  "hashtags": ["#fonoaudiologia", "#fonoaudióloga", "#gestãoclínica", "#useevolua", "#tag5"],
  "sugestaoVisual": "O que torna essa imagem visualmente única"
}
  `);

  return result;
}

// ── Refinamento de legenda com Claude (copy emocional) ────────────────────────

async function refinarLegenda(legendaRascunho, briefing) {
  try {
    const refinada = await chatCopy(
      `Você é o copywriter do Evolua (@useevoluaapp). Você escreve para fonoaudiólogas brasileiras.
Seu trabalho é refinar legendas de Instagram para maximizar cliques no link da bio (geração de leads).

REGRAS:
- Primeira frase: deve PARAR o scroll — dado surpreendente, pergunta provocativa ou contradição
- Tom: especialista falando COM a colega, não ensinando
- Frases curtas. Sem jargão corporativo.
- Máximo 150 palavras
- CTA de lead no final (nunca "salva esse post")
- Máximo 3 emojis
- Proibido: "solução", "inovar", "ecossistema", "maximizar", "potencializar"`,
      `Refine esta legenda mantendo a ideia central, mas com mais impacto na primeira frase e CTA mais direto:

LEGENDA ATUAL:
${legendaRascunho}

TEMA: ${briefing.tema}
CTA DESEJADO: ${briefing.cta}

Retorne APENAS o texto da legenda refinada, sem comentários.`
    );
    return refinada;
  } catch {
    // Se Claude não estiver disponível, retorna o rascunho original
    return legendaRascunho;
  }
}

// ── Utilitários ────────────────────────────────────────────────────────────────

function extrairNumSlides(formato) {
  const match = formato.match(/(\d+)\s*slides?/i);
  return match ? parseInt(match[1]) : null;
}

function extrairDuracao(formato) {
  const match = formato.match(/(\d+)\s*s/i);
  return match ? parseInt(match[1]) : null;
}

// ── Execução direta com briefing de exemplo ───────────────────────────────────
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const briefingExemplo = {
    formato: "Carrossel 7 slides",
    pilar: 1,
    tema: "fonoaudióloga perdendo dinheiro sem saber",
    ganchoAmplo: "Você provavelmente está deixando dinheiro na mesa toda semana",
    afunilamento: "Começa com dado sobre profissionais autônomos → afunila para saúde → chega na fonoaudióloga que não sabe quanto ganha de verdade",
    insight: "Não é problema de valor de sessão — é problema de gestão financeira sem dados",
    cta: "Testa grátis por 14 dias — link na bio",
    fontesCientificas: null,
    stories: true,
  };

  const outputDir = path.join(__dirname, "../output/teste");
  gerarPost(briefingExemplo, outputDir)
    .then((post) => {
      console.log("\n📋 Post gerado:");
      console.log("Legenda:", post.legenda);
    })
    .catch(console.error);
}
