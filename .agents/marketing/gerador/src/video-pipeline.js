// src/video-pipeline.js
// Pipeline de produção de vídeos em escala — baseado no G4: 420 vídeos em 6h
//
// CONCEITO CENTRAL (vídeo 3):
// Cada Reels é composto de 3 componentes independentes: Hook + Body + CTA
// Esses componentes são gerados separadamente e podem ser recombinados.
// A legendagem usa Whisper (transcrição de alta fidelidade) com estilo Netflix.
//
// FLUXO:
// roteiro → [Hook, Body, CTA] → script de edição para DaVinci/CapCut → legenda Whisper

import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { chatJSON, chat } from "./openai-client.js";
import { MODELS } from "./ai-client.js";
import { persona, playbook } from "./config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── System prompts ────────────────────────────────────────────────────────────

const SYSTEM_VIDEO = `Você é o roteirista e editor de vídeo do Evolua (@useevoluaapp).
Você cria Reels para fonoaudiólogas brasileiras seguindo o playbook G4/Shibata.

ICP: ${persona.icp}

ESTRUTURA OBRIGATÓRIA DE REELS (Hook + Body + CTA):
— Hook (0-3s): O único trabalho é fazer a pessoa NÃO rolar. Dado, contradição, pergunta que incomoda.
— Body (4s até penúltimo): Desenvolvimento que afunila do amplo ao específico. Só o ICP chega ao fim.
— CTA (últimos 3-5s): UMA ação de lead. Falar E mostrar (texto na tela + narração).

REGRAS DE LEGENDA (estilo Netflix):
— Máximo 2 linhas por legenda
— Máximo 42 caracteres por linha
— Sincroniza com a fala, não com o corte
— Usa vírgula para pausa curta, ponto para pausa longa
— Não repete o texto do vídeo se já estiver na tela

PROIBIDO: "${playbook.regrasDeVoz[0].replace("Nunca use: ", "")}"`;

// ── Geração de roteiro por componentes ───────────────────────────────────────

/**
 * Gera um roteiro de Reels dividido em componentes Hook + Body + CTA
 * @param {Object} briefing - { tema, ganchoAmplo, insight, cta, duracao }
 * @returns {Object} - { hook, body, cta, roteiro, legenda, duracaoTotal }
 */
export async function gerarRoteiroComponentes(briefing) {
  const duracao = briefing.duracao || 30;

  console.log(`\n🎬 Gerando roteiro por componentes: "${briefing.tema}" (${duracao}s)...`);

  const result = await chatJSON(SYSTEM_VIDEO, `
Crie o roteiro de um Reels de ${duracao} segundos para o @useevoluaapp.

BRIEFING:
- Tema: ${briefing.tema}
- Gancho amplo: ${briefing.ganchoAmplo}
- Insight central: ${briefing.insight}
- CTA de lead: ${briefing.cta}

Gere o roteiro DIVIDIDO em 3 componentes independentes.
Cada componente deve poder ser gravado separadamente e depois montado.

Responda com JSON:
{
  "hook": {
    "duracao": 3,
    "texto": "Frase exata de abertura — o que é falado/mostrado nos primeiros 3 segundos",
    "visual": "O que aparece na tela (câmera, texto, gráfico)",
    "textNaTela": "Texto de legenda que aparece sobre o vídeo (se houver)",
    "instrucaoGravacao": "Como gravar esse trecho: posição, distância, ação"
  },
  "body": [
    {
      "numero": 1,
      "segundo": "4-10",
      "texto": "O que é falado",
      "visual": "O que aparece na tela",
      "textNaTela": "Texto de legenda sobre o vídeo (se houver)",
      "instrucaoGravacao": "Como gravar"
    }
  ],
  "cta": {
    "duracao": 4,
    "texto": "Frase exata do CTA falado",
    "visual": "Mostrar a tela do app / apontar para bio / mostrar link",
    "textNaTela": "Texto na tela reforçando o CTA",
    "instrucaoGravacao": "Como gravar o CTA"
  },
  "duracaoTotal": ${duracao},
  "musicaSugerida": "Estilo e energia da trilha (sem citar músicas com direitos)",
  "sugestaoMontagem": "Ordem de montagem, transições, ritmo de corte",
  "legenda": "Legenda completa para o post (máx 150 palavras, CTA de lead no final)"
}
  `, { model: MODELS.carrossel });

  return result;
}

/**
 * Gera múltiplas variações de Hook para um mesmo tema
 * Útil para teste A/B de ganchos (qual para mais o scroll)
 *
 * @param {string} tema - Tema do vídeo
 * @param {string} ganchoBase - O gancho original
 * @param {number} quantidade - Quantas variações gerar (padrão: 3)
 */
export async function gerarVariacoesHook(tema, ganchoBase, quantidade = 3) {
  console.log(`\n🎣 Gerando ${quantidade} variações de hook para: "${tema}"...`);

  const result = await chatJSON(SYSTEM_VIDEO, `
Gere ${quantidade} variações de Hook (0-3s) para um Reels sobre: "${tema}"

Hook base: "${ganchoBase}"

TIPOS de hook para variar:
- Dado surpreendente: "X% das fonoaudiólogas..."
- Contradição: "Todo mundo faz X. Está errado."
- Pergunta que incomoda: "Você sabe quanto realmente ganha por hora?"
- Afirmação polêmica: "Prontuário no papel custa caro. E não é o papel."
- Problema visual: mostrar a tela de caos (planilha, WhatsApp, bloco de notas)

Responda com JSON:
{
  "variacoes": [
    {
      "tipo": "dado | contradicao | pergunta | afirmacao | visual",
      "texto": "Frase exata do hook (máx 10 palavras)",
      "visual": "O que aparece na tela",
      "hipoteseDePerformance": "Por que este hook deve parar o scroll"
    }
  ]
}
  `, { model: MODELS.rapido });

  return result.variacoes || [];
}

/**
 * Gera legendas no estilo Netflix para um trecho transcrito
 * Simula o que o Whisper produziria após a transcrição
 *
 * @param {string} transcricao - Texto transcrito do vídeo
 * @param {Object} opcoes - { estiloNetflix, maxCharsLinha, maxLinhas }
 */
export async function gerarLegendasNetflix(transcricao, opcoes = {}) {
  const maxChars = opcoes.maxCharsLinha || 42;
  const maxLinhas = opcoes.maxLinhas || 2;

  console.log(`\n📝 Gerando legendas estilo Netflix...`);

  const legendas = await chat(SYSTEM_VIDEO, `
Formate este texto como legendas estilo Netflix para um Reels:

TRANSCRIÇÃO:
${transcricao}

REGRAS:
- Máximo ${maxLinhas} linhas por legenda
- Máximo ${maxChars} caracteres por linha
- Quebra no ritmo da fala, não no meio de palavras
- Vírgula = pausa curta, ponto = pausa longa
- Números por extenso se < 10, numeral se >= 10
- Não corta entre artigo e substantivo

Retorne APENAS o texto formatado como legendas, com cada bloco separado por linha em branco.
Não adicione timestamps — apenas o texto formatado.
  `, { model: MODELS.rapido });

  return legendas;
}

/**
 * Gera o script de automação de montagem para DaVinci Resolve / CapCut
 * Baseado no sistema do G4 que usa Python + API para interagir com o editor
 *
 * @param {Object} roteiroComponentes - Saída de gerarRoteiroComponentes()
 * @param {string} outputDir - Onde salvar o script
 */
export async function gerarScriptMontagem(roteiroComponentes, outputDir) {
  console.log(`  🎞️  Gerando script de montagem...`);

  // Estrutura de pastas esperada pelo editor
  const estrutura = {
    hook: "01_hook.mp4",
    body: roteiroComponentes.body.map((b, i) => `02_body_${String(i + 1).padStart(2, "0")}.mp4`),
    cta: "03_cta.mp4",
  };

  const instrucoes = {
    geradoEm: new Date().toISOString(),
    tema: roteiroComponentes.tema,
    duracaoTotal: roteiroComponentes.duracaoTotal,
    estruturaDePastas: estrutura,
    ordemDeMontagem: [
      estrutura.hook,
      ...estrutura.body,
      estrutura.cta,
    ],
    transicoes: "corte seco entre hook e body, fade in 0.3s antes do CTA",
    musica: roteiroComponentes.musicaSugerida,
    sugestaoMontagem: roteiroComponentes.sugestaoMontagem,
    legendas: {
      fonte: "Inter Bold",
      tamanho: 52,
      cor: "#FFFFFF",
      contorno: "2px #000000",
      posicao: "bottom-center, 10% do rodapé",
      estiloNetflix: true,
    },
    checklistFinal: [
      "Hook < 3s confirmado",
      "Legenda sincronizada com a fala",
      "CTA visível na tela E narrado",
      "Logo @useevoluaapp no canto superior direito",
      "Música fadeia no CTA",
      "Vídeo exportado em 1080x1920 (9:16), 30fps, H.264",
    ],
  };

  await fs.ensureDir(outputDir);
  const scriptPath = path.join(outputDir, "montagem-instrucoes.json");
  await fs.writeJSON(scriptPath, instrucoes, { spaces: 2 });

  // Gera também um .txt legível para o editor humano
  const txtPath = path.join(outputDir, "montagem-checklist.txt");
  const txt = `
INSTRUÇÃO DE MONTAGEM — ${roteiroComponentes.tema || "Reels"}
${"=".repeat(60)}

ORDEM DOS CLIPS:
${instrucoes.ordemDeMontagem.map((f, i) => `  ${i + 1}. ${f}`).join("\n")}

TRANSIÇÕES: ${instrucoes.transicoes}
MÚSICA: ${instrucoes.musica}
DURAÇÃO TOTAL: ${instrucoes.duracaoTotal}s

LEGENDAS:
  Fonte: ${instrucoes.legendas.fonte} ${instrucoes.legendas.tamanho}pt
  Cor: ${instrucoes.legendas.cor} com contorno ${instrucoes.legendas.contorno}
  Posição: ${instrucoes.legendas.posicao}

CHECKLIST ANTES DE EXPORTAR:
${instrucoes.checklistFinal.map((item) => `  ☐ ${item}`).join("\n")}
`.trim();

  await fs.writeFile(txtPath, txt);

  console.log(`  ✅ Script de montagem salvo em: ${path.basename(outputDir)}/`);
  return { scriptPath, txtPath, instrucoes };
}

/**
 * Pipeline completo de vídeo: briefing → roteiro → variações de hook → script de montagem
 *
 * @param {Object} briefing - { tema, ganchoAmplo, insight, cta, duracao }
 * @param {string} outputDir - Diretório de saída
 */
export async function pipelineVideoCompleto(briefing, outputDir) {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`🎬 PIPELINE DE VÍDEO: "${briefing.tema}"`);
  console.log(`${"─".repeat(60)}`);

  const videoDir = path.join(outputDir, "video");
  await fs.ensureDir(videoDir);

  // 1. Roteiro por componentes
  const roteiro = await gerarRoteiroComponentes(briefing);

  // 2. Variações de hook para A/B
  const variacoesHook = await gerarVariacoesHook(
    briefing.tema,
    roteiro.hook?.texto || briefing.ganchoAmplo
  );

  // 3. Script de montagem
  const { instrucoes } = await gerarScriptMontagem(roteiro, videoDir);

  // Salvar tudo
  const resultado = {
    briefing,
    roteiro,
    variacoesHook,
    instrucoes,
    geradoEm: new Date().toISOString(),
  };

  await fs.writeJSON(path.join(videoDir, "video-completo.json"), resultado, { spaces: 2 });

  // Salvar legenda
  if (roteiro.legenda) {
    await fs.writeFile(path.join(videoDir, "legenda.txt"), roteiro.legenda);
  }

  console.log(`\n✅ Pipeline de vídeo concluído:`);
  console.log(`   Hook principal: "${roteiro.hook?.texto}"`);
  console.log(`   Variações de hook: ${variacoesHook.length}`);
  console.log(`   Componentes body: ${roteiro.body?.length}`);
  console.log(`   Output: ${videoDir}`);

  return resultado;
}
