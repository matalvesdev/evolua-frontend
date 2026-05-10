# Gerador de Conteúdo — Evolua

Gera automaticamente posts de Instagram (carrosseis, reels, estáticos) e artigos de blog para o Evolua (`@useevoluaapp`), sistema de gestão para fonoaudiólogas.

## Como funciona

```
pesquisarSemana()      → briefing com temas e fontes científicas
  └── gerarPost()      → legenda + estrutura de slides por post
  └── gerarBlogPost()  → artigo HTML + JSON para cada tema de blog
  └── renderCarrossel() / renderStories() → PNG via Puppeteer
  └── uploadPost() / uploadBlog() → Supabase Storage
```

## Instalação

```bash
cd .agents/marketing/gerador
npm install
cp .env.example .env
# Preencha as variáveis no .env
```

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `OPENAI_API_KEY` | Sim | Chave da OpenAI |
| `OPENAI_MODEL` | Não | Modelo (padrão: `gpt-4o`) |
| `SUPABASE_URL` | Para upload | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Para upload | Service role key |
| `SUPABASE_BUCKET` | Não | Nome do bucket (padrão: `marketing-assets`) |
| `RENDER_IMAGES` | Não | `false` para pular Puppeteer |
| `POSTS_POR_SEMANA` | Não | Quantidade de posts (padrão: `5`) |

## Uso

```bash
# Gerar semana atual completa (pesquisa + posts + blog + imagens + upload)
node src/index.js semana

# Gerar semana específica sem upload
node src/index.js semana --semana=2026-W05 --sem-upload

# Apenas ver o briefing (sem gerar conteúdo)
node src/index.js pesquisa

# Priorizar temas específicos
node src/index.js semana --foco="disfagia,gagueira"

# Evitar temas já publicados
node src/index.js semana --evitar="prontuário,relatório"
```

## Output gerado

```
output/
└── 2026-W05/
    ├── briefing.json                    ← Briefing completo da semana
    ├── relatorio.json                   ← Relatório com URLs de tudo
    └── 5-sinais-de-disfagia/
        ├── instagram-post.json          ← Estrutura completa do post
        ├── instagram-legenda.txt        ← Legenda pronta para copiar
        ├── slide-01.png                 ← Capa (1080×1080)
        ├── slide-02.png                 ← Conteúdo
        ├── ...
        └── stories/
            ├── story-01.png             ← Teaser (1080×1920)
            ├── story-02.png             ← Dado
            └── story-03.png             ← CTA

output/blog/
    ├── prontuario-eletronico-fono.html  ← Artigo completo em HTML
    └── prontuario-eletronico-fono.json  ← Metadados + estrutura
```

## Arquitetura dos arquivos

| Arquivo | Função |
|---|---|
| `src/index.js` | Entry point / CLI |
| `src/config.js` | Config, cores, persona, pilares |
| `src/openai-client.js` | Wrapper do cliente OpenAI |
| `src/calendar.js` | Calendário editorial |
| `src/research.js` | Pesquisa de temas e fontes científicas |
| `src/generate-post.js` | Geração de posts (carrossel/reels/estático) |
| `src/blog-writer.js` | Geração de artigos de blog |
| `src/render.js` | HTML → PNG via Puppeteer |
| `src/generate-week.js` | Orquestrador da semana completa |
| `src/upload-to-supabase.js` | Upload para Supabase Storage |
| `templates/capa.html` | Slide de capa do carrossel (1080×1080) |
| `templates/conteudo.html` | Slide de conteúdo do carrossel |
| `templates/cta.html` | Slide de CTA do carrossel |
| `templates/story-teaser.html` | Story de anúncio do post (1080×1920) |
| `templates/story-dado.html` | Story com dado/estatística |
| `templates/story-cta.html` | Story de CTA final |

## Pilares de conteúdo

| Pilar | Nome | % |
|---|---|---|
| 1 | Dor resolvida | 40% |
| 2 | Educação clínica (com fontes) | 25% |
| 3 | Prova social | 20% |
| 4 | Produto em ação | 15% |

## Regras de voz

- Nunca usar: "solução", "inovar", "ecossistema", "maximizar", "potencializar", "transformar sua prática"
- Tom: especialista que fala **com** a fonoaudióloga, não para ela
- Posts de pilar 2 devem citar fonte científica real (com PMID quando disponível)
- Primeira linha de toda legenda deve parar o scroll
