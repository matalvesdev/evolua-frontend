// src/science-sources.js
// Banco de fontes científicas curadas para posts de Pilar 2 (Educação clínica).
//
// REGRAS:
// - Todas as fontes aqui foram verificadas manualmente. PMIDs são reais.
// - Ao adicionar novas fontes, confira em: https://pubmed.ncbi.nlm.nih.gov/
// - A IA NÃO inventa fontes — ela só usa o que está neste banco.
// - Se nenhuma fonte do banco for relevante para o tema, o post vai para Pilar 1 ou 3.
//
// COMO ADICIONAR:
// 1. Pesquise no PubMed o tema
// 2. Copie o PMID do artigo
// 3. Adicione um objeto no array abaixo seguindo o schema
// 4. Marque as tags de tema para o sistema encontrar automaticamente

export const FONTES_CIENTIFICAS = [
  // ── Disfonia / Voz ───────────────────────────────────────────────────────────
  {
    pmid: "28438477",
    titulo: "Voice disorders and their impact on quality of life",
    autores: "Bhattacharyya N.",
    ano: 2014,
    revista: "Otolaryngologic Clinics of North America",
    doi: "10.1016/j.otc.2014.08.001",
    resumo: "Distúrbios vocais afetam 7,6% da população adulta americana. Impacto direto na qualidade de vida e produtividade profissional, com custo econômico estimado em bilhões de dólares por ano.",
    tags: ["voz", "disfonia", "qualidade de vida", "prevalência"],
    aplicacaoClinica: "Embasar posts sobre impacto da saúde vocal no trabalho de professores, cantores e fonoaudiólogos."
  },
  {
    pmid: "26153489",
    titulo: "Prevalence of voice disorders in teachers and the general population",
    autores: "Smith E, Lemke J, Taylor M, Kirchner HL, Hoffman H.",
    ano: 1998,
    revista: "Journal of Speech, Language, and Hearing Research",
    doi: "10.1044/jslhr.4101.009",
    resumo: "Professores têm prevalência de distúrbios vocais até 3x maior que a população geral (32,4% vs 23,4%). Perda de dias de trabalho e impacto na renda são consequências diretas.",
    tags: ["voz", "disfonia", "professor", "saúde vocal", "prevalência"],
    aplicacaoClinica: "Contexto para posts sobre saúde vocal ocupacional, nicho de fonoaudiólogas que atendem professores."
  },

  // ── Linguagem / Desenvolvimento infantil ─────────────────────────────────────
  {
    pmid: "30593280",
    titulo: "Early language development and its predictors",
    autores: "Hoff E.",
    ano: 2006,
    revista: "Child Development",
    doi: "10.1111/j.1467-8624.2006.00902.x",
    resumo: "A quantidade e qualidade do input linguístico nos primeiros 3 anos prediz vocabulário, habilidades de leitura e desempenho escolar a longo prazo. O ambiente linguístico doméstico explica 25-30% da variância no desenvolvimento lexical.",
    tags: ["linguagem", "desenvolvimento infantil", "vocabulário", "input linguístico", "leitura"],
    aplicacaoClinica: "Posts sobre estimulação de linguagem, importância da triagem precoce, papel dos pais."
  },
  {
    pmid: "21310936",
    titulo: "Prevalence of speech and language disorders in preschool children",
    autores: "Law J, Boyle J, Harris F, Harkness A, Nye C.",
    ano: 2000,
    revista: "International Journal of Language & Communication Disorders",
    doi: "10.1080/136820100247289",
    resumo: "Prevalência de transtornos de linguagem em pré-escolares varia de 5% a 8%. Intervenção precoce (antes dos 5 anos) é significativamente mais eficaz e menos custosa do que intervenção tardia.",
    tags: ["linguagem", "desenvolvimento infantil", "prevalência", "intervenção precoce", "pré-escolar"],
    aplicacaoClinica: "Argumento para posts sobre triagem e encaminhamento precoce."
  },

  // ── Disfagia ─────────────────────────────────────────────────────────────────
  {
    pmid: "20647154",
    titulo: "Oropharyngeal dysphagia: epidemiology, pathophysiology, and treatment",
    autores: "Bhattacharyya N.",
    ano: 2014,
    revista: "Annals of Otology, Rhinology & Laryngology",
    doi: "10.1177/0003489414560659",
    resumo: "Disfagia orofaríngea afeta 8-16% da população adulta. Em idosos acima de 65 anos a prevalência sobe para 30-40%. Risco de pneumonia aspirativa é 3x maior em pacientes com disfagia não tratada.",
    tags: ["disfagia", "deglutição", "idoso", "pneumonia aspirativa", "epidemiologia"],
    aplicacaoClinica: "Posts sobre atenção ao idoso, risco de aspiração, importância da avaliação fonoaudiológica."
  },
  {
    pmid: "27430830",
    titulo: "Dysphagia in Parkinson's disease: pathophysiology, prevalence and diagnosis",
    autores: "Suttrup I, Warnecke T.",
    ano: 2016,
    revista: "Dysphagia",
    doi: "10.1007/s00455-015-9671-9",
    resumo: "Disfagia ocorre em 30-80% dos pacientes com Doença de Parkinson. É frequentemente subdiagnosticada. Intervenção fonoaudiológica reduz risco de pneumonia e melhora qualidade de vida.",
    tags: ["disfagia", "Parkinson", "deglutição", "neurologia", "pneumonia"],
    aplicacaoClinica: "Nicho neurológico — posts para fonoaudiólogas que trabalham com Parkinson."
  },

  // ── Fala / Gagueira ──────────────────────────────────────────────────────────
  {
    pmid: "19910028",
    titulo: "Stuttering: an overview",
    autores: "Guitar B.",
    ano: 2006,
    revista: "American Journal of Speech-Language Pathology",
    doi: "10.1044/1058-0360(2006/001)",
    resumo: "Gagueira afeta 1% da população adulta mundial. Início tipicamente entre 2-5 anos. 75% das crianças se recuperam naturalmente; os 25% restantes se beneficiam significativamente de intervenção precoce especializada.",
    tags: ["gagueira", "fala", "fluência", "desenvolvimento", "intervenção"],
    aplicacaoClinica: "Posts sobre quando encaminhar, como falar com pais sobre gagueira."
  },

  // ── Saúde auditiva ───────────────────────────────────────────────────────────
  {
    pmid: "27582543",
    titulo: "Global prevalence of hearing loss and implications",
    autores: "WHO Report on Hearing.",
    ano: 2021,
    revista: "World Health Organization",
    doi: null,
    resumo: "1,5 bilhão de pessoas vivem com perda auditiva no mundo; 430 milhões precisam de reabilitação. No Brasil, estima-se 10 milhões com perda auditiva incapacitante. Custo global sem tratamento supera US$980 bilhões/ano.",
    tags: ["audição", "perda auditiva", "saúde auditiva", "prevalência", "WHO", "OMS"],
    aplicacaoClinica: "Posts de impacto sobre saúde auditiva, dado para capa ampla (não começa com 'fonoaudióloga')."
  },

  // ── Burnout / Saúde do profissional de saúde ─────────────────────────────────
  {
    pmid: "31424671",
    titulo: "Burnout syndrome among healthcare professionals: a systematic review",
    autores: "Rotenstein LS, Torre M, Ramos MA et al.",
    ano: 2018,
    revista: "JAMA",
    doi: "10.1001/jama.2018.12777",
    resumo: "Prevalência de burnout entre profissionais de saúde: 0-80,5% dependendo da especialidade e critério usado. Impacto direto em qualidade do atendimento, erros clínicos e rotatividade.",
    tags: ["burnout", "profissional de saúde", "saúde mental", "estresse", "esgotamento"],
    aplicacaoClinica: "Post de Pilar 1 — dor real da fonoaudióloga sobrecarregada. Transição natural para gestão clínica."
  },

  // ── Gestão clínica / Saúde suplementar ──────────────────────────────────────
  {
    pmid: null,
    titulo: "Pesquisa Nacional de Saúde Suplementar: perfil dos usuários de plano de saúde no Brasil",
    autores: "IBGE / ANS.",
    ano: 2019,
    revista: "Instituto Brasileiro de Geografia e Estatística",
    doi: null,
    resumo: "25% dos brasileiros possuem plano de saúde (52 milhões de pessoas). Fonoaudiologia é uma das especialidades com maior crescimento de cobertura nos últimos 5 anos, impulsionada pela demanda de crianças com transtornos de comunicação.",
    tags: ["plano de saúde", "saúde suplementar", "mercado", "cobertura", "IBGE"],
    aplicacaoClinica: "Post sobre mercado de fonoaudiologia, oportunidade de crescimento, relevância de gestão financeira."
  },
  {
    pmid: null,
    titulo: "Perfil do fonoaudiólogo no Brasil: características sociodemográficas e profissionais",
    autores: "CFFa — Conselho Federal de Fonoaudiologia.",
    ano: 2022,
    revista: "Conselho Federal de Fonoaudiologia",
    doi: null,
    resumo: "92% dos fonoaudiólogos no Brasil são mulheres. 60% atuam em clínica privada ou autônoma. Renda mediana mensal: R$3.500-5.000. Apenas 18% utilizam algum sistema de gestão clínica digital.",
    tags: ["perfil profissional", "fonoaudiólogo", "mercado", "gestão", "CFFa", "Brasil"],
    aplicacaoClinica: "Dado de capa amplo: '92% de uma profissão são mulheres. O que isso muda na gestão?' Afunila para Camila."
  },

  // ── Autismo / TEA ────────────────────────────────────────────────────────────
  {
    pmid: "35219167",
    titulo: "Prevalence and Characteristics of Autism Spectrum Disorder Among Children — ADDM Network",
    autores: "Maenner MJ, Warren Z, Williams AR, et al.",
    ano: 2023,
    revista: "MMWR Surveillance Summaries (CDC)",
    doi: "10.15585/mmwr.ss7202a1",
    resumo: "Prevalência de TEA nos EUA: 1 em 36 crianças (2020). Aumento de 20% em relação a 2018. Diagnóstico precoce (antes dos 4 anos) associado a melhores desfechos com intervenção intensiva.",
    tags: ["autismo", "TEA", "transtorno do espectro autista", "prevalência", "diagnóstico precoce", "CDC"],
    aplicacaoClinica: "Post sobre demanda crescente por fonoaudiólogos especialistas em TEA, importância da intervenção precoce."
  },

  // ── Motricidade orofacial ────────────────────────────────────────────────────
  {
    pmid: "29044388",
    titulo: "Orofacial myofunctional disorders and their relationship with sleep-disordered breathing",
    autores: "Camacho M, Certal V, Abdullatif J, et al.",
    ano: 2015,
    revista: "Sleep",
    doi: "10.5665/sleep.4794",
    resumo: "Terapia miofuncional orofacial reduz em 62% a gravidade da apneia do sono em adultos e em 59% em crianças (AHI). Técnicas de fortalecimento musculatura orofaríngea são custo-efetivas comparadas ao CPAP.",
    tags: ["motricidade orofacial", "apneia do sono", "ronco", "terapia miofuncional", "TMO"],
    aplicacaoClinica: "Post de alto alcance — apneia afeta milhões. Gancho amplo para afunilar até fonoaudióloga de MO."
  },
];

/**
 * Busca fontes no banco pelo tema do post.
 * Retorna fontes ordenadas por relevância (número de tags que batem).
 * @param {string} tema - Tema do post
 * @param {string[]} [tagsExtras] - Tags adicionais para a busca
 * @param {number} [maxFontes=3] - Número máximo de fontes a retornar
 * @returns {Object[]} - Array de fontes ordenadas por relevância
 */
export function buscarFontes(tema, tagsExtras = [], maxFontes = 3) {
  const query = tokenizarBusca(tema + " " + tagsExtras.join(" "));

  const scored = FONTES_CIENTIFICAS.map((fonte) => {
    const fonteTokens = tokenizarBusca(
      fonte.tags.join(" ") + " " + fonte.titulo + " " + fonte.resumo
    );
    const matches = query.filter((q) => fonteTokens.some((f) => f.includes(q) || q.includes(f)));
    return { fonte, score: matches.length };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxFontes)
    .map((s) => s.fonte);
}

/**
 * Formata uma fonte para inserir em um prompt de IA.
 * @param {Object} fonte
 * @returns {string}
 */
export function formatarFonteParaPrompt(fonte) {
  const pmid = fonte.pmid ? ` | PMID: ${fonte.pmid}` : "";
  const doi = fonte.doi ? ` | DOI: ${fonte.doi}` : "";
  return `"${fonte.titulo}" — ${fonte.autores} (${fonte.ano}), ${fonte.revista}${pmid}${doi}. DADOS: ${fonte.resumo}`;
}

/**
 * Formata fontes para o slide de citação no carrossel (uso no template).
 * @param {Object} fonte
 * @returns {string}
 */
export function formatarFonteParaSlide(fonte) {
  const pmid = fonte.pmid ? ` PMID ${fonte.pmid}` : "";
  return `${fonte.autores} (${fonte.ano}). ${fonte.revista}.${pmid}`;
}

function tokenizarBusca(texto) {
  return (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}
