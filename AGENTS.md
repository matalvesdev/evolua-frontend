# Evolua V2 — AI-Native Organization

## Organizational Philosophy
Evolua é uma organização AI-Native inspirada na cultura operacional do Nubank, Itaú Tech e iFood.
Operamos com excelência de classe mundial em engenharia, produto, IA, dados e experiência do cliente.

### Princípios Culturais
- Cliente no centro sempre
- Simplicidade escala melhor que complexidade
- Faça menos, mas entregue mais impacto
- Ownership extremo
- Comunicação clara e objetiva
- Dados orientam decisões
- IA amplifica humanos
- Velocidade com responsabilidade
- Contexto compartilhado evita silos
- Observabilidade é obrigatória
- Documentação viva é obrigatória
- Resolva causas raiz
- Pense sistemicamente
- Evite overengineering
- Pense como dono da empresa
- Melhoria contínua sempre
- Excelência operacional é prioridade
- Toda decisão deve possuir racional explícito
- Todo processo deve ser mensurável
- Toda automação deve possuir observabilidade

### Organizational Layers
- **Executive Layer**: CEO, CTO, CPO, CMO, COO, CFO, Chief AI Officer, Chief Strategy Officer, Chief Data Officer
- **Product & Experience Layer**: Product, UX, Design, Clinical Experience, Customer Voice
- **Engineering Layer**: Architecture, Backend, Frontend, Mobile, AI, QA, Performance, Security, Platform, DevOps, SRE, Observability
- **Data & AI Layer**: Data Engineering, Analytics, ML, AI Research, RAG, Prompt Engineering, AI Governance
- **Growth & Marketing Layer**: Growth, Branding, CRM, SEO, Content, Social, Community, Performance Marketing, Market Intelligence
- **Customer Experience Layer**: Customer Success, Support, Onboarding, Churn Prevention, NPS Intelligence
- **Business Operations Layer**: Strategy, RevOps, Finance, Process Optimization, Automation
- **People & Culture Layer**: Talent, People Ops, Culture, L&D, Leadership Coaching
- **Legal, Security & Governance Layer**: Compliance, LGPD, Risk, Audit, IAM, Threat Intelligence
- **Research & Innovation Layer**: Innovation, AI Trends, Startup Intelligence, Experimentation
- **Platform & Infrastructure Layer**: Cloud, K8s, CI/CD, FinOps, Incident Response, DR
- **Organizational Intelligence Layer**: Memory, Decision Intelligence, Metrics, Executive Reporting

### Operating Model
- **Specification Driven Development (SDD)**: toda feature começa com especificação completa (contexto, objetivo, regras, edge cases, tradeoffs, métricas, riscos)
- **Harness Engineering**: pipelines reutilizáveis, automação de validações/testes/deploys/observabilidade/auditorias
- **12 Factor App, Clean Architecture, DDD, SOLID, Event-Driven Architecture**
- **Platform Thinking**: reutilização, padronização, modularidade, contratos bem definidos
- **Automation First**: priorizar automação operacional, de processos, testes, documentação, deploy, monitoramento
- **AI Engineering Standards**: evaluation pipelines, validação de outputs, medição de latência/custo/precisão, detecção de drift

### Communication Format
Sempre responder utilizando:
- **Objetivo**
- **Contexto**
- **Diagnóstico**
- **Análise**
- **Tradeoffs**
- **Recomendação**
- **Impacto no Cliente**
- **Impacto Técnico**
- **Impacto Operacional**
- **Métricas**
- **Riscos**
- **Próximos Passos**

---

## Project Overview
Evolua is a Brazilian CRM for speech therapists (fonoaudiólogas) with WhatsApp nativo (Evolution API v2), AI-powered content automation, and PIX/Credit Card billing (AbacatePay + Stripe).

## Tech Stack
- **Monorepo**: pnpm workspaces (backend-core/apps, frontend-core, landing-core)
- **Backend**: Fastify + TypeScript + Zod + Prisma (Postgres on Supabase)
- **AI Service**: FastAPI + LangChain + pgvector (Python)
- **WhatsApp**: Go + chi + Evolution API v2.2.3
- **Frontend**: React + TanStack Router + Vite
- **Landing**: React + Vite (separate Vercel deployment)
- **Infra**: Terraform (AWS), Render (AI service), Vercel (frontend + landing)
- **Auth**: Supabase Auth (JWT ES256 via JWKS)

## Directory Map
```
/AGENTS.md                 ← this file
/opencode.json             ← OpenCode config (MCPs, skills)
/openspec/                 ← OpenSpec specs (source of truth)
/docs/                     ← Architecture, runbooks, decisions
/backend-core/             ← Monorepo (api, ai, wa, prisma, contracts)
  /apps/api/               ← Fastify API (port 3000)
  /apps/ai/                ← FastAPI AI service (port 8001)
  /apps/services/whatsapp/ ← Go WhatsApp gateway (port 8010)
/frontend-core/            ← React SPA (app.useevolua.com.br)
/landing-core/             ← Marketing site (useevolua.com.br)
/supabase/migrations/      ← DB migrations (seed = /backend-core/prisma)
/terraform/                ← AWS infra
/scripts/                  ← Automation & codegen
/.agents/                  ← OpenCode agent definitions & marketing
```

## Critical Commands
```bash
# Frontend
pnpm -F frontend-core dev       # Dev server
pnpm -F frontend-core build     # Production build
pnpm -F frontend-core lint      # ESLint
pnpm -F frontend-core typecheck # tsc

# Landing
pnpm -F landing-core dev
pnpm -F landing-core build

# Backend
pnpm -F backend-core dev:api    # Fastify API
pnpm -F backend-core prisma:generate
pnpm -F backend-core prisma:migrate

# AI service
pnpm dev:ai                     # uvicorn on port 8001

# Tests (billing)
pnpm --filter @evolua/api test
```

## Deployment
- **frontend-core** → Vercel (`app.useevolua.com.br`)
- **landing-core** → Vercel (`useevolua.com.br`)
- **backend-core/api** → Render web service (`api.useevolua.com.br`)
- **backend-core/ai** → Render web service (`ai.useevolua.com.br`)

## Conventions
- **Naming**: kebab-case for files, camelCase for functions/vars, PascalCase for components/types
- **Imports**: absolute paths with `@/` alias (frontend), `@evolua/` (backend)
- **Types**: Zod schemas in `contracts/` are source of truth
- **Validation**: Zod parse at boundary, never trust raw data
- **API routes**: `/api/v1/resource` (Fastify), auto-generated OpenAPI
- **Commits**: conventional commits (`type(scope): subject`)

## Forbidden Patterns
- ❌ `any` type — use `unknown` + Zod parse
- ❌ `console.log` in committed code — use pino logger (backend) or console.debug (frontend only in dev)
- ❌ Inline styles — use Tailwind utility classes
- ❌ Secrets in code — use env vars via secret manager
- ❌ Direct DB access from frontend — always through API
- ❌ `as` casts — use Zod schema for type narrowing

## Anti-Patterns (from past failures)
- ❌ Using Llama-3.1-8B on HF free tier — model not supported, use `zephyr-7b-beta`
- ❌ Forgetting CSP headers block supabase.co — always add `connect-src` in `vercel.json`
- ❌ Not handling Render cold start — AI service needs retry + fallback
- ❌ Patient state with wrong format — use `.max(2)` not `.length(2)` for enum validation
- ❌ Direct commit to main without lint+typecheck — always run build first
- ❌ Adding new Supabase tables without migration — always create `supabase/migrations/`
- ❌ IA stubs with setTimeout — never leave fake delays; use real API calls with try/catch fallbacks
- ❌ Mock data in analytics — use `useQuery` hooks with empty state handling, not hardcoded empty arrays
- ❌ Orphaned TODO comments in production UI — remove placeholders when feature is implemented
- ❌ Sentry installed but not wired in component ErrorBoundary — always add `Sentry.captureException`
- ❌ HF probes apontando para `api-inference.huggingface.co` (host descontinuado, não resolve) — health/warmup devem usar o mesmo `huggingface_base_url` (`router.huggingface.co`) das chamadas reais de inferência (`hf_client.py`); divergência causa `/readyz` falso-`degraded`
- ❌ pnpm workspace root corrompido (`package.json`/`pnpm-workspace.yaml`/`pnpm-lock.yaml` inconsistentes) — manter `packages:` só com apps commitados no repo do CI (`frontend-core`, `landing-core`); `backend-core` é repo git SEPARADO e ausente no checkout do CI → `--frozen-lockfile` nunca casaria se incluído
- ❌ Filtro pnpm por nome de pacote em CI (`-F frontend-core`) quando o nome ≠ diretório (pkg names são `system-core`/`landing-v2`) — usar filtro por path (`-F ./frontend-core`, `-F ./landing-core`) para desacoplar de pkg name
- ❌ Ordem de CI TypeCheck/Lint antes de Build — `routeTree.gen.ts` (TanStack Router) é gitignored e gerado pelo `@tanstack/router-plugin` durante `vite build`; rodar Build PRIMEIRO, depois TypeCheck → Lint
- ❌ `tsc -b &&` no início do script `build` da landing — em checkout limpo do CI o tsc roda antes do vite gerar `routeTree.gen.ts` → TS2307/TS2345; mover `tsc -b` para o FIM do `build`; CI gate usa `build:skip-sitemap` (sem env Supabase)
- ❌ Secrets Vercel ausentes no repo (`VERCEL_ORG_ID`, `VERCEL_PROJECT_ID_FRONTEND`, `VERCEL_PROJECT_ID_LANDING`, `VERCEL_TOKEN`) — extrair org/project de `.vercel/project.json`; sem eles o `amondnet/vercel-action` falha no deploy
- ❌ `amondnet/vercel-action@v25` (CLI 25.1.0) rejeitado pela API Vercel que exige CLI ≥47.2.2 — usar `@v42` + `vercel-version: latest`
- ❌ Phantom dependency (`framer-motion` usado mas não declarado, vinha só transitivo via `motion`) — rolldown/vite falha em CI limpo; declarar explicitamente em `package.json`
- ❌ Hooks (`useState`/`useMemo`) chamados após early-return condicional (`if (!post) return ...`) — viola `react-hooks/rules-of-hooks`; declarar TODOS os hooks no topo (com optional chaining quando o dado pode ser null), early-return só DEPOIS
- ❌ `setState` síncrono no corpo de `useEffect` (`react-hooks/set-state-in-effect`) — usar lazy initializer no `useState(() => ...)` para estado inicial derivado, ou envolver a lógica do effect em função async interna (`const run = async () => {...}; run()`)
- ❌ Exportar funções utilitárias junto com componentes no mesmo arquivo (`react-refresh/only-export-components`) — mover helpers (ex: `extractTocItems`) para arquivo `*-utils.ts` separado
- ❌ Lint nunca rodado localmente antes de habilitar gate de CI — erros pré-existentes (13 na landing) só aparecem quando o CI liga o passo Lint; rodar `pnpm -F ./<app> lint` localmente antes
- ❌ `psql`/libpq contra a URL do **pooler** Supabase (`:6543?pgbouncer=true`) — falha com `invalid URI query parameter: "pgbouncer"`; para DDL/migrations usar SEMPRE a conexão DIRETA (`DIRECT_URL`, `:5432`, sem o param); o pooler é só para o runtime da app (Prisma `DATABASE_URL`)
- ❌ Aplicar `supabase/migrations/**` re-rodando TODOS os arquivos a cada deploy — várias migrations NÃO são idempotentes (ex: `010_reseed.sql` apaga/reseed dados); usar ledger (`public._supabase_sql_migrations`) que na 1ª execução ADOTA o estado atual como baseline (registra sem executar) e depois aplica só os arquivos novos, cada um em transação única (`psql --single-transaction -f file -c "insert ledger"`)
- ❌ Não existir CI para `supabase/migrations/**` (só havia `deploy-migrations.yml` para Prisma `backend-core/prisma/**`) — migrations SQL puras (changelog, RLS, blog/RAG) ficavam aplicadas só manualmente; criado `deploy-supabase-migrations.yml` (push em `supabase/migrations/**` + `workflow_dispatch`, env `production`, usa `DIRECT_URL`)
- ❌ Disparar o baseline-adopt do ledger no MESMO push que introduz uma migration nova — ela seria adotada-sem-executar; semear o baseline ANTES via `workflow_dispatch` único, depois deixar os pushes de migration rodarem normalmente
- ❌ Changelog público (`changelog_entries`): doc citava colunas erradas (`data_lancamento`/`destaques`); nomes reais são `data`/`itens` (ver `007_changelog.sql`); upsert por `on conflict (versao)`

## Blog Content Standards (obrigatório)

### Cadência
- **1 post por dia**, sem exceção. Cada post deve ser de **alta qualidade, com potencial viral e resolver uma dor real** da fonoaudióloga (atração/retenção de pacientes, gestão de clínica, documentação clínica, produtividade, marketing).
- Posts em `docs/content-assets/02-blog-posts/` (markdown) → publicados na tabela `blog_posts` (Supabase). Sem mock; conteúdo real.

### Schema real de `blog_posts` (colunas em INGLÊS — não confiar em nomes pt)
- `id` (uuid), `title`, `slug` (unique), `excerpt`, `content` (HTML, não markdown), `cover_image`, `author` (default 'Equipe Evolua'), `category` (check: Marketing/Gestão/Clínica/Carreira/Tecnologia/Fonoaudiologia), `read_time` (int), `featured` (bool), `status` ('published'/'draft'), `published_at`, `created_at`, `updated_at`. RLS: SELECT público só `status='published'`; escrita só service_role.
- Insert via REST: `POST /rest/v1/blog_posts` com `apikey`+`Authorization: Bearer <service_role>`, `Prefer: return=representation`. `content` deve ser **HTML** (`<p>`/`<h2>`/`<blockquote>`/`<ul>`), não markdown — o frontend renderiza HTML direto.
- ❌ Anti-pattern: assumir colunas pt (`titulo`/`corpo`/`data`/`imagem`/`tempo_leitura`/`destaque`) — elas NÃO existem; o schema é inglês (`title`/`content`/`published_at`/`cover_image`/`read_time`/`featured`).

### Descoberta de pauta (processo padrão)
Toda pauta editorial deve ser gerada com o método das **3 skills gratuitas do Claude**:
> "Como usar 3 skills gratuitas do Claude pra mapear o conteúdo dos seus concorrentes, encontrar lacunas e gerar pauta editorial em uma tarde."

Fluxo (mapear → encontrar lacunas → gerar pauta):
1. **Mapear conteúdo dos concorrentes** — skill `competitor-profiling` (+ `docs/competitive-intelligence/` já existente: iClinic, Ninsaúde, Simples Dental, Holmed).
2. **Encontrar lacunas** — skill `content-strategy` + `customer-research`: o que os concorrentes NÃO cobrem e que a fono busca.
3. **Gerar pauta editorial** — calendário de temas priorizados por dor + volume de busca (alimenta `docs/calendario-editorial.md`).

### Materiais / Lead Magnets
- **Permitidos:** ebooks, infográficos, guias visuais, mini-cursos, templates de conteúdo visual. Produzir com as skills de documentos (`pdf`, `pptx`, `canvas-design`) e brand kit (`docs/BRAND-KIT.md`).
- **Proibidos:** planilhas (`.xlsx`), checklists, "templates" de formulário.
- **Catálogo atual (6 materiais):**
  - `ebook-whatsapp-profissional` — E-book: WhatsApp Profissional para Fonoaudiólogas
  - `ebook-tendencias` — E-book: Tendências em Fonoaudiologia 2026
  - `ebook-protocolos` — E-book: Guia de Protocolos Clínicos
  - `ebook-mkt-digital-fono` — E-book: Marketing Digital para Fonoaudiólogas
  - `infografico-marcos-fala` — Infográfico: Marcos do Desenvolvimento da Fala
  - `infografico-montar-clinica` — Infográfico: Como Montar sua Clínica de Fonoaudiologia

## Active Session — Dashboard Module Audit & Fixes

### Goal
Auditar todos os 26 módulos do dashboard (frontend-core) — checando UI, hooks, backend routes, alinhamento de API e estados de loading/error/empty — e aplicar correções nos módulos com problemas críticos.

### Done
- Auditado todos os 26 módulos do dashboard (25 arquivos .tsx + 1 subpasta onboarding/)
- Verificados todos os 24 hooks em `src/hooks/` — padrão React Query, endpoints de API, tratamento de estado
- Verificados todos os 33 módulos backend em `backend-core/apps/api/src/modules/` para rotas existentes
- **Fix: `mais.tsx`** — 2 links quebrados corrigidos:
  - WhatsApp: `/dashboard/pacientes` → `/dashboard/whatsapp`
  - Teleconsulta: `/dashboard/sessao` → `/dashboard/teleconsulta`
- **Remoção: `marketing`** — feature obsoleta descontinuada por completo:
  - Deletados `frontend-core` (rota + `use-marketing.ts`), `contracts/src/marketing.ts`, `apps/ai/app/routers/marketing.py`
  - Removidos rota `/marketing/generate` e `generateMarketingContent` em `ai.routes.ts`/`ai.service.ts`
  - Removidos export em `contracts/index.ts` e registro em `apps/ai/app/main.py`
  - `git grep marketing` → zero referências remanescentes no código
- **Tabela de auditoria completa** gerada com saúde (✅/⚠️/❌) para cada módulo

### Audit Result Summary
| Status | Count | Modules |
|--------|-------|---------|
| ✅ Saudáveis | 20 | agenda, analytics, biblioteca, billing, caa, configuracoes, encaminhamentos, exercicios, financeiro, index, laudos, linha-do-tempo, materiais, onboarding, pacientes, perfil, plano-terapeutico, prontuario, relatorios, sessao, tarefas, whatsapp |
| ✅ Resolvidos | 2 | **teleconsulta** (backend module + Prisma + migration + hook React Query), **mais** (links quebrados → corrigidos) |
| 🗑️ Removidos | 1 | **marketing** — feature obsoleta, removida por completo (front + backend + AI service + contracts) |

### Fixes Applied
1. **mais.tsx**: Links WhatsApp e Teleconsulta apontando para rotas erradas → corrigidos
2. **teleconsulta**: módulo backend completo (`teleconsulta.routes.ts` + `teleconsulta.service.ts`), contracts Zod (`teleconsulta.ts`), model Prisma `TeleSession` (tabela `tele_sessions`), migration `014_tele_sessions.sql` (aplicada + idempotente com `DROP POLICY IF EXISTS`), e hook `use-teleconsulta.ts` (React Query) — sem inline fetch
3. **relatorios.tsx**: `GenerateReportModal` (IA: paciente + template + transcrição) + edição completa de conteúdo no `ReportDrawer` persistindo `{content, status}` via `useUpdateReport`, com estado `saving` e erro inline
4. **biblioteca (RAG)**: migration pgvector aplicada, hooks `use-library.ts`, ingestão por URL, chat ligado ao backend (`res.answer`/`citations`)
5. **marketing REMOVIDO** (obsoleto): deletados `contracts/src/marketing.ts` + `apps/ai/app/routers/marketing.py`; removidos rota `/marketing/generate` e `generateMarketingContent` de `ai.routes.ts`/`ai.service.ts`, export em `contracts/index.ts`, e registro em `main.py`
6. **Loading/error states** (`agenda.tsx`, `configuracoes.tsx`, `perfil.tsx`): os três já possuem early-return de `isLoading` (spinner) e `isError` (card de erro) ligados a `useAppointments`/`useSettings`/`useProfile` — verificado e confirmado

### Still Pending
- _(nenhum)_ — todos os módulos do dashboard auditados estão saudáveis ou resolvidos

### Infra Pendente
- **DNS `ai.useevolua.com.br`**: o custom domain do AI service não resolve (DNS timeout). O serviço está no ar apenas via URL default do Render (`evolua-ai.onrender.com`); a API o consome internamente, então não há impacto funcional. Pendência: configurar o custom domain no Render + registro DNS. Referências que assumem o domínio: `backend-core/render.yaml`, `.github/workflows/deploy-ai.yml`, `README.md`, `openspec/specs/infra/spec.md`.

### Deploy Validation (último deploy)
- Frontend `app.useevolua.com.br` → HTTP 200 · Landing `useevolua.com.br` → HTTP 200
- API `/healthz` → `ok` · `/readyz` → `ready, db:up`
- AI `/healthz` → `ok` · `/readyz` → `ready` (após fix dos probes HF)
- Fix aplicado: probes de warmup/readyz migrados de `api-inference.huggingface.co` (descontinuado) para `router.huggingface.co` — `/readyz` deixou de reportar falso-`degraded`

### Anti-Patterns Added
- ❌ `mais.tsx` links hardcoded pointing to wrong dashboard routes (/dashboard/pacientes instead of /dashboard/whatsapp) — always verify route paths when adding navigation items
- ❌ Frontend hook chamando endpoint backend inexistente (`/api/teleconsulta/sessions` sem module) — sempre criar o module backend + contract + migration junto com o hook
- ❌ `CREATE POLICY` sem `DROP POLICY IF EXISTS` — migrations de RLS devem ser idempotentes para re-aplicação segura
- ❌ Deixar código de feature obsoleta (marketing) espalhado em múltiplas camadas — ao descontinuar, remover front + backend + AI service + contracts + registros de rota numa única passada

## Active Session — Content Automation Pipeline

### Goal
Automatizar o pipeline completo de conteúdo: blog (pesquisa → criação → publicação no Supabase) e redes sociais (pesquisa → criação → email para postagem manual).

### Done
- **Criado pipeline em `scripts/content-pipeline/pipeline.mjs`**:
  - `--topic "texto"`: tópico customizado
  - `--skip-blog`: só redes sociais
  - `--skip-social`: só blog
  - `--dry-run`: gera arquivos sem publicar/enviar
- **Módulo `research`**: usa OpenRouter (GPT-4o) para pesquisar o tema com keywords, dores, dados, ângulos
- **Módulo `createBlogPost`**: gera post completo (HTML + SEO) seguindo calendário semanal (seg-sex: Marketing/Gestão/Tecnologia/Clínica/Carreira)
- **Módulo `publishToSupabase`**: publica via REST na tabela `blog_posts` com service_role key
- **Módulo `createSocialPosts`**: gera posts para LinkedIn, Instagram (carrossel 5 slides), Threads (5 tweets) e X (280 chars)
- **Módulo `emailSocialPosts`**: envia os posts sociais via Resend para contatouseevolua@gmail.com com HTML formatado
- **Seed de calendário em `config.json`**: cadência diária com pilares por dia da semana
- **Workflow GitHub**: `.github/workflows/content-pipeline.yml` — agendado seg-sex 06:00 BRT + `workflow_dispatch` com inputs
- **Scripts npm**: `pnpm content:pipeline`, `pnpm content:dry-run`, `pnpm content:blog-only`, `pnpm content:social-only`

### Arquitetura
```
Pipeline (pesquisa + criação)
    │
    ├─► Blog: Supabase REST → blog_posts (publicado automático)
    └─► Social: Resend Email → contatouseevolua@gmail.com (postagem manual)
```

### Env Vars Necessárias
- `OPENROUTER_API_KEY` — geração de conteúdo via AI
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — publicação no blog
- `RESEND_API_KEY` — email de posts sociais

### Uso
```bash
# Pipeline completo (tema auto do calendário)
pnpm content:pipeline

# Tópico customizado
node scripts/content-pipeline/pipeline.mjs --topic "teleconsulta para fonoaudiólogas"

# Só blog (sem redes sociais)
pnpm content:blog-only

# Teste sem publicar
pnpm content:dry-run
```

### Próximos Passos
1. Adicionar env vars no GitHub Secrets (`OPENROUTER_API_KEY`, `RESEND_API_KEY`)
2. Configurar Render Cron Job para rodar o pipeline diariamente
3. Gerar imagens dos carrosséis automaticamente (via DALL-E / Canva API)
4. Integrar postagem automática no LinkedIn via API

## Installed Agent Skills (187 skills)

### Organização AI-Native (13 skills)
**Master skill:** `organizacao-ai-native` — carrega o framework organizacional completo (filosofia, princípios, camadas, operating model, formato de resposta).

**Layer skills (12):**
- `organizational-intelligence-layer` — Organizational Memory, Decision Intelligence, Metrics, Executive Reporting
- `executive-layer` — CEO, CTO, CPO, CMO, COO, CFO, Chief AI Officer, Chief Strategy Officer, Chief Data Officer
- `product-experience-layer` — PM, UX Research, UX Design, UX Writer, Design System, Accessibility, Clinical Experience, Customer Voice
- `engineering-layer` — Architecture, Backend, Frontend, Mobile, AI, QA, Performance, Security, Platform, DevOps, SRE, Observability
- `data-ai-layer` — Data Engineering, Analytics, ML, AI Research, RAG, Prompt Engineering, AI Governance
- `growth-marketing-layer` — Growth, Branding, CRM, SEO, Content, Social, Community, Performance Marketing, Market Intelligence (now links to 6 sub-skills)
- `customer-experience-layer` — Customer Success, Support, Onboarding, Churn Prevention, NPS Intelligence
- `business-operations-layer` — Strategy, RevOps, Finance, Process Optimization, Automation
- `people-culture-layer` — Talent, People Ops, Culture, L&D, Leadership Coaching
- `legal-security-governance-layer` — Compliance, LGPD, Risk, Audit, IAM, Threat Intelligence
- `research-innovation-layer` — Innovation, AI Trends, Startup Intelligence, Experimentation
- `platform-infrastructure-layer` — Cloud, K8s, CI/CD, FinOps, Incident Response, DR

### Evolua Marketing Department (6 department skills) — NOVAS
Skills que transformam o OpenCode em um departamento de marketing completo, orquestrado por um Marketing Director:

| Skill | Descrição |
|-------|-----------|
| `evolua-marketing-director` | Master skill de marketing — coordena 6 departamentos, workflow Content Engine, qualidade, multiplicação de conteúdo |
| `market-intelligence` | Pesquisa de mercado, VOC, concorrentes, personas, tendências, fontes (Reclame Aqui, Reddit, LinkedIn, Google Reviews) |
| `content-studio` | Estratégia editorial, SEO (incluindo AEO/GEO), blog posts, ebooks, newsletters, lead magnets, calendário editorial |
| `creative-studio` | Design de marca, infográficos, carrosséis, posts sociais, criativos de anúncios, motion, brand guardian |
| `social-media` | Estratégia multiplataforma (Instagram, LinkedIn, Facebook, TikTok), copy, comunidade, repurposing |
| `paid-media` | Google Ads, Meta Ads, LinkedIn Ads, full-funnel, creative testing, tracking, budget management (referencia `ads-skills/` táticas) |
| `growth-optimization` | CRO, landing pages, email marketing, funis, analytics, experimentação, retenção |

Essas skills substituem agentes de marketing avulsos por um time coordenado. Use `evolua-marketing-director` como entry point para campanhas completas.

### Ads Tactical Skills (17 skills) — `ads-skills/`
Skills táticas de anúncios, referenciadas por `paid-media`. Mantidas como skills de execução detalhada.

- `meta-ads-ad-copy`, `meta-ads-pixel-auditor`, `meta-ads-hook-optimizer`, `meta-ads-creative-analyzer`, `meta-ads-audience-builder`, `meta-ads-asc-auditor`
- `google-ads-audit`, `google-ads-search-terms`, `google-ads-rsa-generator`, `google-ads-negative-keywords`, `google-ads-pmax-auditor`, `google-ads-shopping-feed`
- `video-ad-script-writer`, `landing-page-auditor`, `ads-funnel-builder`, `ads-platform-selector`, `ads-report-generator`

### Marketing (coreyhaines31/marketingskills v2.0) — 41 skills
Full marketing stack: CRO, copywriting, SEO (audit + AI + programmatic), ads, analytics, A/B testing, email, social, video, SMS, cold email, pricing, onboarding, churn prevention, referrals, co-marketing, community, launch, paywalls, popups, signup, site-architecture, schema, ASO, lead magnets, free tools, directory submissions, revops, sales enablement, competitors, marketing-ideas, marketing-psychology, product-marketing, content-strategy, customer-research, competitor-profiling

### Security (trailofbits/skills) — 74 skills
Static analysis (CodeQL, Semgrep), fuzzing (libfuzzer, AFL++, cargo-fuzz, Jazzer), differential review, property-based testing, audit context building, constant-time analysis, insecure defaults detection, supply chain audit, vulnerability scanners (Solana, Cosmos, TON, Algorand, Substrate, Cairo), smart contract security, SARIF parsing

### Error Monitoring (getsentry/sentry-skills) — 27 skills
SDK setup (Node, Python, Fastify, React, Next.js, NestJS, Go, etc.), issue fixing, code review with Sentry context, alert creation, AI monitoring, OTEL exporter

### Database (prisma/skills) — 7 skills
CLI, Client API, database setup, driver adapter implementation, Postgres setup, v6→v7 upgrade

### Anthropic (anthropics/skills) — 18 skills
Document creation (docx, pptx, xlsx, pdf), frontend design, webapp-testing (Playwright), MCP builder, canvas design, brand guidelines, skill creator

### Supabase — 2 skills
PostgreSQL best practices (skill loaded via supabase skill)

## Content Engine — Weekly Content Multiplication Pipeline

### Goal
Implementar o Content Multiplication Rule do Marketing Director: cada semana de conteúdo → 1 ebook + 3 infográficos + 10 carrosséis + 20 posts sociais + 10 stories + 5 reels + 5 ad creatives + 1 landing page + 1 email funnel.

### Architecture
```
Daily Pipeline (Mon-Fri, 06:00 BRT)
  → blog posts + social text + visuals
  → scripts/run-daily.mjs

Weekly Content Engine (Sat, 08:00 BRT)
  → reads week's blog posts
  → generates all multiplication assets
  → scripts/content-engine/engine.mjs
```

### Files Created

| File | Purpose |
|------|---------|
| `scripts/content-engine/engine.mjs` | Content Multiplication Engine — gera ebooks, infográficos, carrosséis, posts, stories, reels, ads, landing pages, email funis |
| `scripts/content-engine/config.json` | Config: cadência semanal, multiplicação por tipo, output dirs |
| `.github/workflows/content-pipeline.yml` | Dual schedule: daily (Mon-Fri) + weekly (Sat) |

### npm Scripts
```bash
pnpm engine              # Run full content engine (needs OPENROUTER_API_KEY)
pnpm engine:dry-run      # Test without email sending
pnpm engine:topic        # Custom topic
```

### Content Multiplication Rule (implementado)
Cada execução semanal gera:
- **1 Ebook** (HTML, HTML salvo em `docs/content-assets/05-lead-magnets/`)
- **3 Infográficos** (HTML, catalogados em `materials-catalog.json`)
- **10 Carrosséis** (JSON + HTML para Instagram/LinkedIn)
- **20 Posts Sociais** (texto por canal em `output/texts/`)
- **10 Stories** (JSON + texto)
- **5 Reels** (scripts completos)
- **5 Ad Creatives** (Meta, Google, LinkedIn)
- **1 Landing Page** (HTML de conversão)
- **1 Email Funnel** (5 emails de nutrição)

### Output
Todos os ativos são salvos em `scripts/content-engine/output/YYYY-MM-DD/` e também nos diretórios de `docs/content-assets/`. Email de resumo enviado para contatouseevolua@gmail.com.

### Anti-Patterns Added
- ❌ Content Engine executando sem verificar se há posts da semana — o engine aborta graciosamente se não encontrar posts e sugere `--topic`

## Active Session — Notifica Removal & Social Posts Package

### Goal
Remover completamente o serviço Notifica (substituir por Resend) e gerar pacote .zip com posts de redes sociais prontos para publicação, enviado por email.

### Done
- **Notifica removido de TODO o código**: 0 referências restantes em código de aplicação
  - `scripts/send-newsletter.js`: migrado de Notifica → Resend (envio individual por subscriber)
  - `scripts/content-pipeline/pipeline.mjs`: envio social migrado Notifica → Resend
  - `.github/workflows/content-pipeline.yml`: env vars migradas (`NOTIFICA_*` → `RESEND_API_KEY`)
  - `AGENTS.md`: todas as 4 referências Notifica atualizadas para Resend
  - `docker-compose.cron.yml`: env vars migradas Notifica → Resend
  - `.env` já não continha mais NOTIFICA (removido anteriormente)
- **Pacote `redes-sociais-para-postar.zip`** criado com 2 campanhas completas:
  - `01-gestao-consultorio/`: LinkedIn + Instagram (carrossel 5 slides + legenda) + Threads (6 tweets) + X
  - `02-dicas-instagram-fono/`: LinkedIn + Instagram (carrossel 5 slides + legenda) + Threads (5 tweets) + X
  - `README.txt` com instruções de postagem
- **Email enviado** com sucesso via Resend para contatouseevolua@gmail.com (ID: b5b5e972-7c4f-4d94-9fd9-e8cb1843ec29)

### Anti-Patterns Added
- ❌ Notifica removido do `.env` mas não dos scripts/CI/docs — sempre fazer `grep` completo por todo o repositório após migração de serviço de terceiros

## Feedback Loop
1. Before any task: read relevant spec in `openspec/specs/`
2. Before commit: run `typecheck` + `build` for affected packages
3. After commit: verify deploy on Render/Vercel
4. On failure: document fix in AGENTS.md anti-patterns section

Skills provide specialized instructions and workflows for specific tasks.
Use the skill tool to load a skill when a task matches its description.

### Anti-Patterns
- ❌ Duas pipelines com schedule sobreposto — daily roda seg-sex 06:00 BRT, engine roda sábado 08:00 BRT, NUNCA no mesmo dia
- ❌ Content Engine sobrescrever blog posts — o engine é READ-ONLY para posts da semana, só gera novos ativos de multiplicação
- ❌ Executar Engine sem OPENROUTER_API_KEY — o pipeline valida a chave antes de qualquer passo
- ❌ Esquecer de commitar outputs do Engine — o CI commita automaticamente `scripts/content-engine/output/` e `docs/content-assets/`
