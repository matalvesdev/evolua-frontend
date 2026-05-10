// src/ai-client.js
// Cliente de IA multi-modelo — suporta GitHub Copilot (Azure OpenAI), OpenAI direto e Anthropic
// O gerador usa modelos diferentes para tarefas diferentes, conforme o playbook G4/Crasto

import OpenAI from "openai";
import { config } from "./config.js";

// ── Instâncias de cliente ─────────────────────────────────────────────────────

/**
 * GitHub Copilot usa a API do Azure OpenAI com endpoint próprio.
 * Variáveis: GITHUB_TOKEN (ou AZURE_OPENAI_API_KEY) + AZURE_OPENAI_ENDPOINT
 *
 * Com o Copilot você tem acesso a:
 *  - gpt-4o              → texto criativo, legendas, carrosseis
 *  - gpt-4o-mini         → tarefas rápidas, resumos, hashtags
 *  - o1-mini             → análise estratégica, briefing, funil
 *  - claude-3-5-sonnet   → copywriting emocional, gancho, CTA
 */
function buildCopilotClient() {
  if (!config.ai.copilotEndpoint) return null;

  return new OpenAI({
    baseURL: config.ai.copilotEndpoint,
    apiKey: config.ai.copilotToken || config.ai.azureApiKey || "placeholder",
    defaultHeaders: {
      ...(config.ai.copilotToken
        ? { Authorization: `Bearer ${config.ai.copilotToken}` }
        : {}),
      // Necessário para modelos de raciocínio (o1/o4) no GitHub Models
      "api-version": "2024-12-01-preview",
    },
  });
}

function buildOpenAIClient() {
  if (!config.ai.openaiApiKey) return null;
  return new OpenAI({ apiKey: config.ai.openaiApiKey });
}

const copilotClient = buildCopilotClient();
const openaiClient = buildOpenAIClient();

if (!copilotClient && !openaiClient) {
  throw new Error(
    "Nenhum cliente de IA configurado. Defina GITHUB_TOKEN (Copilot) ou OPENAI_API_KEY no .env"
  );
}

// ── Mapa de modelos por tarefa ────────────────────────────────────────────────

/**
 * Cada tarefa usa o modelo mais adequado.
 *
 * Filosofia do playbook G4/Crasto:
 *  - Gancho e legenda: precisa de criatividade → GPT-4o ou Claude
 *  - Estrutura de carrossel: análise + criação → GPT-4o
 *  - Briefing estratégico: raciocínio profundo → o1-mini
 *  - Hashtags e resumos: tarefa simples → GPT-4o-mini
 *  - Blog: extenso e bem escrito → GPT-4o
 */
export const MODELS = {
  // Texto criativo — legendas, ganchos, CTAs
  criativo: config.ai.models?.criativo || "gpt-4o",

  // Estrutura de carrossel — slides, narrativa progressiva
  carrossel: config.ai.models?.carrossel || "gpt-4o",

  // Análise estratégica — briefing da semana, posicionamento, funil
  estrategia: config.ai.models?.estrategia || "o1-mini",

  // Copywriting emocional — quando disponível via Copilot
  copy: config.ai.models?.copy || "claude-3-5-sonnet",

  // Tarefas rápidas — hashtags, resumos, traduções
  rapido: config.ai.models?.rapido || "gpt-4o-mini",

  // Artigo de blog — longo, bem estruturado
  blog: config.ai.models?.blog || "gpt-4o",
};

// ── Core call ────────────────────────────────────────────────────────────────

/**
 * Faz uma chamada de chat completion.
 * Tenta o Copilot primeiro; cai para OpenAI direto se não disponível.
 *
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @param {Object} options - { model, temperature, maxTokens, json }
 * @returns {string} - Conteúdo da resposta
 */
async function callAI(systemPrompt, userMessage, options = {}) {
  const model = options.model || MODELS.criativo;
  const isJson = options.json === true;

  // o1-mini não suporta system prompt nem temperature — trata diferente
  const isO1 = model.startsWith("o1") || model.startsWith("o3");

  const messages = isO1
    ? [{ role: "user", content: `${systemPrompt}\n\n${userMessage}` }]
    : [
        { role: "system", content: isJson ? systemPrompt + "\n\nSempre responda com JSON válido." : systemPrompt },
        { role: "user", content: userMessage },
      ];

  const requestBody = {
    model,
    messages,
    ...(isO1 ? {} : { temperature: options.temperature ?? 0.7 }),
    ...(isO1 ? {} : { max_tokens: options.maxTokens || 3000 }),
    ...(isJson && !isO1 ? { response_format: { type: "json_object" } } : {}),
  };

  // Prefere o Copilot (mais modelos disponíveis); fallback para OpenAI direto
  const client = copilotClient || openaiClient;

  try {
    const response = await client.chat.completions.create(requestBody);
    return response.choices[0].message.content.trim();
  } catch (err) {
    // Fallback 1: modelo não disponível neste provedor (404) → tenta OpenAI direto
    if (copilotClient && openaiClient && err.status === 404) {
      console.warn(`  ⚠️  Modelo ${model} não disponível no Copilot, usando OpenAI direto...`);
      const fallbackBody = {
        ...requestBody,
        model: options.fallbackModel || MODELS.criativo.replace("claude-3-5-sonnet", "gpt-4o"),
      };
      const response = await openaiClient.chat.completions.create(fallbackBody);
      return response.choices[0].message.content.trim();
    }
    // Fallback 2: erro de versão de API com modelos de raciocínio → usa gpt-4o no mesmo endpoint
    if (err.status === 400 && (model.startsWith("o1") || model.startsWith("o4"))) {
      console.warn(`  ⚠️  Modelo ${model} com erro de API version, usando gpt-4o como fallback...`);
      const fallbackBody = { ...requestBody, model: "gpt-4o" };
      // Remove campos não suportados pelo gpt-4o se vieram do modo o1
      if (!fallbackBody.temperature) fallbackBody.temperature = 0.7;
      if (!fallbackBody.max_tokens) fallbackBody.max_tokens = 4000;
      const response = await client.chat.completions.create(fallbackBody);
      return response.choices[0].message.content.trim();
    }
    throw err;
  }
}

// ── Funções públicas ──────────────────────────────────────────────────────────

/**
 * Gera texto livre (legendas, roteiros, artigos)
 */
export async function chat(systemPrompt, userMessage, options = {}) {
  return callAI(systemPrompt, userMessage, { ...options, json: false });
}

/**
 * Gera e parseia JSON estruturado
 */
export async function chatJSON(systemPrompt, userMessage, options = {}) {
  const raw = await callAI(systemPrompt, userMessage, { ...options, json: true });

  // Remove blocos markdown se o modelo os inseriu
  const clean = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

  try {
    return JSON.parse(clean);
  } catch {
    throw new Error(`AI retornou JSON inválido com o modelo ${options.model || MODELS.criativo}:\n${clean.slice(0, 300)}`);
  }
}

/**
 * Gera conteúdo criativo com o modelo de copy (Claude quando disponível)
 * Ideal para: gancho, primeira frase, CTA emocional
 */
export async function chatCopy(systemPrompt, userMessage, options = {}) {
  return chat(systemPrompt, userMessage, { ...options, model: MODELS.copy });
}

/**
 * Análise estratégica com raciocínio profundo (o1-mini)
 * Ideal para: briefing semanal, posicionamento, análise de funil
 */
export async function chatEstrategia(systemPrompt, userMessage, options = {}) {
  return chatJSON(systemPrompt, userMessage, { ...options, model: MODELS.estrategia });
}

/**
 * Tarefa rápida com modelo econômico (gpt-4o-mini)
 * Ideal para: hashtags, alt text, metadados
 */
export async function chatRapido(systemPrompt, userMessage, options = {}) {
  return chat(systemPrompt, userMessage, { ...options, model: MODELS.rapido });
}

// ── Retrocompatibilidade ──────────────────────────────────────────────────────
// Os módulos existentes importam de openai-client.js — re-exportamos daqui para lá

export const openai = copilotClient || openaiClient;
