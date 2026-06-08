/**
 * Script de geracao de conteudo IA para lead magnets (ebooks + infograficos).
 * Usa OpenRouter (compativel com API OpenAI) para gerar o conteudo em JSON,
 * que e entao alimentado no pipeline de geracao de PDF.
 *
 * Uso:
 *   node scripts/generate-content.mjs                    # gera todos os ebooks
 *   node scripts/generate-content.mjs --topic "dislexia" # gera ebook especifico
 *
 * Variaveis de ambiente:
 *   OPENROUTER_API_KEY  - chave da API OpenRouter (obrigatorio)
 *   OPENROUTER_MODEL    - modelo (default: openai/gpt-4o)
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONTENT_DIR = resolve(__dirname, '..', 'content')
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''
const MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o'

const TOPICS = [
  {
    id: 'ebook-tendencias',
    format: 'ebook',
    title: 'Tendencias em Fonoaudiologia 2026',
    topic: 'Tendencias e inovacoes em fonoaudiologia para 2026: teleconsulta, IA, prontuario eletronico, gamificacao, dados, WhatsApp, envelhecimento, LGPD',
    keywords: ['teleconsulta', 'IA', 'prontuario', 'gamificacao', 'LGPD'],
  },
  {
    id: 'ebook-protocolos',
    format: 'ebook',
    title: 'Guia de Protocolos Clinicos',
    topic: 'Guia pratico de protocolos clinicos em fonoaudiologia: MBGR, DOSS, GRBAS, FOIS — aplicacao, documentacao e integracao com prontuario digital',
    keywords: ['MBGR', 'DOSS', 'GRBAS', 'FOIS', 'protocolos'],
  },
  {
    id: 'ebook-mkt-digital-fono',
    format: 'ebook',
    title: 'Marketing Digital para Fonoaudiologas',
    topic: 'Estrategias de marketing digital para fonoaudiologas: nicho, Google Meu Negocio, conteudo, Instagram, rede de indicacoes, WhatsApp',
    keywords: ['marketing digital', 'Instagram', 'Google', 'WhatsApp', 'pacientes'],
  },
  {
    id: 'infografico-marcos-fala',
    format: 'infografico',
    title: 'Marcos do Desenvolvimento da Fala',
    topic: 'Marcos do desenvolvimento da fala e linguagem dos 0 aos 6 anos, baseado em CDC Milestones e ASHA',
    keywords: ['desenvolvimento infantil', 'marcos da fala', 'linguagem'],
  },
  {
    id: 'infografico-montar-clinica',
    format: 'infografico',
    title: 'Como Montar sua Clinica de Fonoaudiologia',
    topic: 'Passo a passo para montar uma clinica de fonoaudiologia: documentacao, espaco, equipamentos, sistemas, fluxo, precificacao, marketing, LGPD, equipe',
    keywords: ['montar clinica', 'empreendedorismo', 'fonoaudiologia'],
  },
]

const SYSTEM_PROMPTS = {
  ebook: `Voce e um redator especializado em conteudo para fonoaudiologia.
Gere o conteudo de um ebook em formato JSON seguindo EXATAMENTE esta estrutura:
{
  "title": "Titulo do Ebook",
  "subtitle": "Subtitulo",
  "badge": "GRATIS",
  "toc": ["Item 1", "Item 2", ...],
  "chapters": [
    {
      "number": "01",
      "title": "Titulo do Capitulo",
      "subtitle": "Subtitulo do capitulo",
      "pages": [
        [
          {"type": "text", "value": "Paragrafo com informacoes uteis e dados", "sz": 9.5},
          {"type": "gap"},
          {"type": "chart", "data": [{"label": "Categoria", "val": 30}], "h": 80, "caption": "Legenda"},
          {"type": "text", "value": "Continuacao", "sz": 9.5}
        ],
        [
          {"type": "text", "value": "Texto", "sz": 9.5},
          {"type": "bullet", "value": "Item"},
          {"type": "bullet", "value": "Outro item"},
          {"type": "callout", "value": "Dica em destaque"}
        ]
      ],
      "takeaway": ["Ponto chave 1", "Ponto chave 2", "Ponto chave 3", "Ponto chave 4"]
    }
  ]
}

REGRAS:
- Conteudo em portugues brasileiro, tom especialista
- Use dados reais com fontes citadas
- Cada capitulo: 2-4 paginas de conteudo
- Textos concisos e diretos
- Inclua dados para graficos (chart) nos primeiros blocos
- bullets para listas, callout para dicas, stat para numeros grandes
- takeaway com 4 pontos-chave ao final de cada capitulo
- Nao use caracteres especiais (nem →, —)
- Valores de graficos realistas baseados em dados reais
- CAPITULOS: 6-8 capitulos com 2-4 paginas cada`,

  infografico: `Voce e um designer de infograficos especializado em saude.
Gere o JSON do infografico:
{
  "title": "Titulo",
  "subtitle": "Subtitulo",
  "source": "Fonte",
  "chart": {"data": [{"label": "Item", "val": 30}], "caption": "Legenda"},
  "blocks": [{"title": "Bloco", "items": [{"label": "Item", "description": "Descricao curta"}]}],
  "alert": "Mensagem de alerta"
}

REGRAS:
- Portugues brasileiro
- Conciso, dados numericos
- Max 8 itens por bloco
- Descricoes ate 60 chars
- Sem caracteres especiais`,
}

async function callOpenRouter(messages, maxTokens = 8192) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://useevolua.com.br',
      'X-Title': 'Evolua Content Generator',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 300)}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Resposta vazia do OpenRouter')
  return content
}

function extractJSON(raw) {
  let cleaned = raw.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.split('\n').slice(1).join('\n')
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3)
    if (cleaned.endsWith('``')) cleaned = cleaned.slice(0, -2)
  }
  cleaned = cleaned.trim()
  return JSON.parse(cleaned)
}

async function generateContent(topic) {
  console.log(`\n=== Gerando: ${topic.title} ===`)

  const system = SYSTEM_PROMPTS[topic.format]
  const userPrompt = `Gere um ${topic.format} sobre: ${topic.topic}

Palavras-chave: ${topic.keywords.join(', ')}

Responda APENAS com o JSON puro, sem markdown, sem comentarios.`

  const raw = await callOpenRouter([
    { role: 'system', content: system },
    { role: 'user', content: userPrompt },
  ])

  const content = extractJSON(raw)
  const json = JSON.stringify(content, null, 2)
  const outPath = resolve(CONTENT_DIR, `${topic.id}.json`)
  mkdirSync(CONTENT_DIR, { recursive: true })
  writeFileSync(outPath, json, 'utf-8')
  console.log(`  -> Salvo em: ${outPath}`)
  console.log(`  -> Capitulos: ${content.chapters?.length || 'N/A'}`)
  return content
}

async function main() {
  if (!OPENROUTER_API_KEY) {
    console.error('ERRO: Defina OPENROUTER_API_KEY no ambiente.')
    console.error('  OPENROUTER_API_KEY=sk-... node scripts/generate-content.mjs')
    process.exit(1)
  }

  const args = process.argv.slice(2)
  const topicFlag = args.find(a => a.startsWith('--topic='))
  const topicFilter = topicFlag?.split('=')[1]

  const toGenerate = topicFilter
    ? TOPICS.filter(t => t.id.includes(topicFilter) || t.title.toLowerCase().includes(topicFilter.toLowerCase()))
    : TOPICS

  if (toGenerate.length === 0) {
    console.error(`Nenhum topico encontrado para: ${topicFilter}`)
    process.exit(1)
  }

  console.log(`Modelo: ${MODEL}`)
  console.log(`Topicos a gerar: ${toGenerate.length}`)

  for (const topic of toGenerate) {
    try {
      await generateContent(topic)
    } catch (err) {
      console.error(`  ERRO: ${err.message}`)
    }
  }

  console.log('\n=== Done ===')
}

main()
