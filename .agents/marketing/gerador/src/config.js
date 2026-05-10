// src/config.js
// Configurações centrais do gerador

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

export const config = {
  // ── Clientes de IA ─────────────────────────────────────────────────────────
  ai: {
    // GitHub Copilot (Azure OpenAI) — acesso a GPT-4o, o1-mini, Claude via Copilot
    copilotToken: process.env.GITHUB_TOKEN,
    copilotEndpoint: process.env.COPILOT_ENDPOINT || "https://models.inference.ai.azure.com",

    // OpenAI direto — fallback se o modelo não estiver no Copilot
    openaiApiKey: process.env.OPENAI_API_KEY,

    // Sobrescrever modelos por tarefa (opcional)
    models: {
      criativo: process.env.MODEL_CRIATIVO || "gpt-4o",
      carrossel: process.env.MODEL_CARROSSEL || "gpt-4o",
      estrategia: process.env.MODEL_ESTRATEGIA || "o1-mini",
      copy: process.env.MODEL_COPY || "claude-3-5-sonnet",
      rapido: process.env.MODEL_RAPIDO || "gpt-4o-mini",
      blog: process.env.MODEL_BLOG || "gpt-4o",
    },
  },

  // ── Supabase ───────────────────────────────────────────────────────────────
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    bucket: process.env.SUPABASE_BUCKET || "marketing-assets",
  },

  // ── Renderização ───────────────────────────────────────────────────────────
  render: {
    images: process.env.RENDER_IMAGES !== "false",
    // Feed Instagram / carrossel (quadrado)
    slideWidth: parseInt(process.env.SLIDE_WIDTH || "1080"),
    slideHeight: parseInt(process.env.SLIDE_HEIGHT || "1080"),
    // Stories Instagram (vertical)
    storyWidth: parseInt(process.env.STORY_WIDTH || "1080"),
    storyHeight: parseInt(process.env.STORY_HEIGHT || "1920"),
    // TikTok (vertical — mesmo aspect ratio do story, visual diferente)
    tiktokWidth: 1080,
    tiktokHeight: 1920,
    // Blog OG image (horizontal)
    blogWidth: 1200,
    blogHeight: 630,
  },

  // ── Cadência editorial ─────────────────────────────────────────────────────
  posts: {
    porSemana: parseInt(process.env.POSTS_POR_SEMANA || "5"),
  },
};

// ── Paleta de cores do Evolua — Brand Kit v3 (Violet / Lilás) ────────────────
export const brand = {
  // Escala Violet
  v950: "#1E1033",   // fundo base dos posts dark e páginas
  v900: "#2E1065",   // fundo de capa de posts, headers
  v800: "#4C1D95",   // cards premium, seções de destaque
  v700: "#6D28D9",   // hover de botão primário
  v600: "#7C3AED",   // botão primário, CTA principal
  v500: "#8B5CF6",   // barra lateral 6px, divisores, bordas ativas
  v400: "#A78BFA",   // texto de destaque, links, nav hover
  v300: "#C4B5FD",
  v200: "#DDD6FE",
  v100: "#EDE9FE",
  v50:  "#FAF5FF",

  // Acento fúcsia/magenta
  acc500: "#E879F9",
  acc400: "#F0ABFC",

  // Neon — CTA sobre fundos escuros (contraste 12.4:1)
  neon: "#C4F135",
  // Rose — urgência, dado crítico
  rose: "#FB7185",

  // Surfaces escuras
  surface:     "#120D1E",   // fundo base da página/app
  surfaceMid:  "#1A1230",   // cards, sidebars
  surfaceHigh: "#241A3F",   // hover, elevated
  border:      "#2D2050",   // bordas sutis
  borderBright:"#4C3580",   // bordas ativas

  // Texto
  textPrimary:   "#F5F0FF",
  textSecondary: "#A78BFA",
  textMuted:     "#6B5A9A",

  // Preto/branco absoluto
  black:  "#0A0612",
  white:  "#FFFFFF",
};

// ── Persona: Camila ───────────────────────────────────────────────────────────
export const persona = {
  nome: "Camila",
  descricao: "Fonoaudióloga autônoma ou em clínica pequena (1-3 profissionais)",
  dores: [
    "Perde horas com burocracia: prontuário, relatório, cobrança",
    "Usa WhatsApp pra tudo: agendamento, lembrete, cobrança",
    "Já tentou Google Agenda + planilha + bloco de notas e não funciona",
    "Sente culpa quando não consegue entregar relatório rápido",
    "Tem medo de perder paciente por falha de comunicação",
    "Não sabe quanto realmente ganha — sem relatório financeiro claro",
  ],
  arroba: "@useevoluaapp",
  icp: "Fonoaudióloga com 2+ anos de experiência, atende 15+ pacientes/semana, quer escalar sem contratar recepcionista",
};

// ── Pilares de conteúdo ───────────────────────────────────────────────────────
export const pilares = {
  1: { nome: "Dor resolvida", percentual: 40, descricao: "Problemas reais do dia a dia que o Evolua resolve" },
  2: { nome: "Educação clínica", percentual: 25, descricao: "Conteúdo científico com fontes reais — pilar de autoridade" },
  3: { nome: "Prova social", percentual: 20, descricao: "Histórias de fonoaudiólogas, resultados com dados" },
  4: { nome: "Produto em ação", percentual: 15, descricao: "Demos, funcionalidades, cases de uso" },
};

// ── Playbook de conteúdo (baseado no G4 / Crasto) ────────────────────────────
export const playbook = {
  // O Evolua é uma emissora, não uma escola — compete atenção com portais, não com colegas de profissão
  posicionamento: "emissora de referência para fonoaudiólogas brasileiras",

  // Referências de estilo (como o G4 Educação e o RD Reservatório de Dopamina)
  referencias: [
    {
      perfil: "@g4educacao",
      lição: "Gancho amplo (celebridade, notícia, dado provocativo) → afunila progressivamente até o ICP. Público desqualificado distribui; qualificado converte.",
      estilo: "Tom de análise jornalística, não tutorial. Cada post é uma 'matéria', não uma 'aula'.",
    },
    {
      perfil: "@rdreservatoriodesopamina",
      lição: "Conteúdo científico apresentado com narrativa. Dado surpreendente + contexto + aplicação prática. Zero didatismo.",
      estilo: "Curiosidade intelectual. Faz a pessoa sentir que aprendeu algo que ninguém mais sabe.",
    },
  ],

  // Regras absolutas do Evolua
  regrasDeVoz: [
    "Nunca use: 'solução', 'inovar', 'ecossistema', 'maximizar', 'potencializar', 'transformar sua prática'",
    "Tom: especialista que fala COM a fonoaudióloga, nunca PARA ela",
    "Frases curtas. Verbos no presente. Linguagem falada",
    "Emojis: máximo 3 por legenda. Zero no blog",
    "Primeira linha DEVE parar o scroll — dado, pergunta provocativa ou contradição",
  ],

  // Anatomia do carrossel baseado no G4
  anatomiaCarrossel: {
    slide1: "Capa: gancho AMPLO — entra qualquer pessoa (não começa com 'fonoaudióloga')",
    slide2: "Contexto: por que isso importa agora? Dado ou fato surpreendente",
    slides35: "Desenvolvimento: aprofunda. Só o ICP ainda está aqui",
    penultimo: "Virada: o insight que muda como a pessoa pensa sobre o problema",
    ultimo: "CTA de lead: uma ação clara e única — link na bio, formulário, DM",
  },

  // Funil de geração de leads
  funilDeLeads: {
    meta: "Cada post tem um destino de negócio — não é conteúdo por conteúdo",
    metricas: ["cliques no link da bio", "leads gerados", "taxa de conversão do formulário"],
    ctas: [
      "Testa grátis por 14 dias — link na bio",
      "Quer ver como funciona? Manda 'EVOLUA' no direct",
      "Acessa o link na bio e começa agora",
      "Entra na lista de espera — link na bio",
    ],
  },
};
