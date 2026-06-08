/**
 * Runner do Content Squad Evolua.
 * Executa o pipeline completo: pesquisar -> estrategista -> redatora -> designer -> revisora
 * Usa OpenRouter para gerar o conteudo e alimenta o gerador de PDF.
 *
 * Uso:
 *   node scripts/run-content-squad.mjs
 *   node scripts/run-content-squad.mjs --topic "teleconsulta fonoaudiologia"
 *   node scripts/run-content-squad.mjs --topic "dislexia" --format ebook
 *
 * Variaveis de ambiente:
 *   OPENROUTER_API_KEY  - chave da API OpenRouter (obrigatorio)
 *   OPENROUTER_MODEL    - modelo (default: openai/gpt-4o)
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')
const SQUAD_DIR = resolve(PROJECT_ROOT, 'squads', 'content-blog-fono')
const OUTPUT_DIR = resolve(SQUAD_DIR, 'output')
const CONTENT_GEN_SCRIPT = resolve(PROJECT_ROOT, 'landing-core', 'scripts', 'generate-content.mjs')
const PDF_GEN_SCRIPT = resolve(PROJECT_ROOT, 'landing-core', 'scripts', 'generate-lead-magnets.mjs')
const STATE_FILE = resolve(SQUAD_DIR, 'state.json')

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''
const MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o'

const args = process.argv.slice(2)
const topicIdx = args.indexOf('--topic')
const formatIdx = args.indexOf('--format')
const TOPIC = topicIdx !== -1 ? args[topicIdx + 1] : 'tendencias em fonoaudiologia para 2026'
const FORMAT = formatIdx !== -1 ? args[formatIdx + 1] : 'ebook'

function updateState(step, label, status) {
  const state = JSON.parse(readFileSync(STATE_FILE, 'utf-8'))
  state.step.current = step
  state.step.label = label
  state.status = status
  state.updatedAt = new Date().toISOString()

  // Marca o agente atual como "working" e os anteriores como "done"
  const agentOrder = ['researcher', 'strategist', 'copywriter', 'designer', 'reviewer']
  state.agents.forEach(a => {
    const idx = agentOrder.indexOf(a.id)
    if (idx < step - 1) a.status = 'done'
    else if (idx === step - 1) a.status = 'working'
    else a.status = 'idle'
  })

  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2))
  console.log(`[Squad] Passo ${step}/5: ${label}`)
}

async function callOpenRouter(messages, systemPrompt) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://useevolua.com.br',
      'X-Title': 'Evolua Content Squad',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenRouter error ${response.status}: ${err}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function runPipeline() {
  if (!OPENROUTER_API_KEY) {
    console.error('OPENROUTER_API_KEY nao definida')
    process.exit(1)
  }

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true })

  console.log(`\n🧠 Content Squad Evolua — "${TOPIC}" (${FORMAT})\n`)

  // Step 1: Researcher
  updateState(1, 'Pesquisando tendencias e dados', 'working')
  const researchSystemPrompt = `Voce e uma pesquisadora especializada em fonoaudiologia. 
Pesquise e compile informacoes sobre o tema solicitado. 
Formato JSON obrigatorio:
{
  "topic": "tema",
  "data": { "fontes": ["fonte1", "fonte2"], "estatisticas": ["dado1", "dado2"], "tendencias": ["tendencia1", "tendencia2"] },
  "competitors": ["concorrente1", "concorrente2"],
  "gaps": ["lacuna1", "lacuna2"],
  "keywords": ["palavra-chave1", "palavra-chave2"]
}`
  const researchRaw = await callOpenRouter(
    [{ role: 'user', content: `Pesquise sobre: ${TOPIC}. Nicho: fonoaudiologia no Brasil.` }],
    researchSystemPrompt
  )
  const research = JSON.parse(researchRaw.replace(/```json\n?|```/g, '').trim())
  writeFileSync(resolve(OUTPUT_DIR, 'research.json'), JSON.stringify(research, null, 2))
  console.log('  ✅ Pesquisa concluida')
  updateState(1, 'Pesquisando tendencias e dados', 'done')

  // Step 2: Strategist
  updateState(2, 'Definindo angulo e estrategia', 'working')
  const strategySystemPrompt = `Voce e uma estrategista de conteudo. 
Com base na pesquisa recebida, defina o angulo, formato, publico-alvo e CTA.
Formato JSON obrigatorio:
{
  "angle": "angulo unico do conteudo",
  "target_audience": "publico-alvo",
  "format": "formato",
  "cta": "call to action principal",
  "tone": "tom de voz",
  "structure": ["secao1", "secao2", "secao3"],
  "key_message": "mensagem principal"
}`
  const strategyRaw = await callOpenRouter(
    [{ role: 'user', content: `Pesquisa:\n${JSON.stringify(research, null, 2)}\n\nDefina a estrategia para "${TOPIC}".` }],
    strategySystemPrompt
  )
  const strategy = JSON.parse(strategyRaw.replace(/```json\n?|```/g, '').trim())
  writeFileSync(resolve(OUTPUT_DIR, 'strategy.json'), JSON.stringify(strategy, null, 2))
  console.log('  ✅ Estrategia definida')
  updateState(2, 'Definindo angulo e estrategia', 'done')

  // Step 3: Copywriter
  updateState(3, 'Produzindo conteudo', 'working')
  const copywriterSystemPrompt = `Voce e uma redatora especializada em fonoaudiologia. 
Produza o conteudo completo baseado na estrategia definida.
O conteudo deve ser em HTML valido (<p>, <h2>, <blockquote>, <ul>, <li>).
Inclua titulo, subtitulos, paragrafos, citacoes e lista de topicos.
Formato JSON obrigatorio:
{
  "title": "titulo",
  "content_html": "conteudo completo em HTML",
  "excerpt": "resumo de 2 linhas",
  "read_time": 5,
  "category": "Marketing|Gestao|Clinica|Carreira|Tecnologia|Fonoaudiologia",
  "tags": ["tag1", "tag2"]
}`
  const copyRaw = await callOpenRouter(
    [{ role: 'user', content: `Estrategia:\n${JSON.stringify(strategy, null, 2)}\n\nPesquisa:\n${JSON.stringify(research, null, 2)}\n\nProduza o conteudo completo.` }],
    copywriterSystemPrompt
  )
  const copy = JSON.parse(copyRaw.replace(/```json\n?|```/g, '').trim())
  writeFileSync(resolve(OUTPUT_DIR, 'content.json'), JSON.stringify(copy, null, 2))
  console.log('  ✅ Conteudo produzido')
  updateState(3, 'Produzindo conteudo', 'done')

  // Step 4: Reviewer
  updateState(4, 'Revisando qualidade', 'working')
  const reviewerSystemPrompt = `Voce e uma revisora de conteudo. Revise o conteudo produzido.
Checklist:
1. Tom de voz adequado? (direto, acolhedor, pratico)
2. CTA claro?
3. HTML valido?
4. Informacoes precisas?
5. Sem promessas milagrosas?
6. Categoria correta?

Retorne APROVADO ou REPROVADO com justificativa.
Formato JSON obrigatorio:
{
  "status": "APROVADO|REPROVADO",
  "issues": ["problema1", "problema2"],
  "suggestions": ["sugestao1", "sugestao2"],
  "final_verdict": "justificativa final"
}`
  const reviewRaw = await callOpenRouter(
    [{ role: 'user', content: `Conteudo:\n${JSON.stringify(copy, null, 2)}\n\nRevise o conteudo.` }],
    reviewerSystemPrompt
  )
  const review = JSON.parse(reviewRaw.replace(/```json\n?|```/g, '').trim())
  writeFileSync(resolve(OUTPUT_DIR, 'review.json'), JSON.stringify(review, null, 2))
  console.log(`  ✅ Revisao: ${review.status}`)
  updateState(4, 'Revisando qualidade', 'done')

  // Step 5: Finalizar
  if (review.status === 'APROVADO') {
    updateState(5, 'Conteudo aprovado e pronto para publicacao', 'done')
    console.log('\n  🎉 Pipeline concluido! Conteudo aprovado.')
    console.log(`  📁 Output: ${OUTPUT_DIR}/`)
    console.log(`  📄 Conteudo: ${OUTPUT_DIR}/content.json`)

    // Trigger PDF generation if applicable
    if (FORMAT === 'ebook' || FORMAT === 'infografico') {
      console.log('\n  🔄 Gerando PDF via generate-lead-magnets...')
      const { execSync } = await import('node:child_process')
      try {
        execSync(`node "${PDF_GEN_SCRIPT}"`, { stdio: 'inherit', env: { ...process.env } })
      } catch (e) {
        console.error('  ⚠️ Erro na geracao de PDF (pode ser esperado se nao configurado):', e.message)
      }
    }
  } else {
    updateState(5, 'Reprovado — necessario revisar', 'checkpoint')
    console.log('\n  ❌ Conteudo reprovado. Correcoes necessarias:')
    review.issues.forEach(i => console.log(`     - ${i}`))
    review.suggestions.forEach(s => console.log(`     💡 ${s}`))
    process.exit(1)
  }
}

runPipeline().catch(err => {
  console.error('\n  ❌ Erro no pipeline:', err.message)
  updateState(0, `Erro: ${err.message}`, 'error')
  process.exit(1)
})
