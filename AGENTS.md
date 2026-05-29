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

## Active Session — Dashboard Module Audit & Fixes
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
- **Fix: `marketing.tsx`** — refatoração completa:
  - Criado `src/hooks/use-marketing.ts` com `useGenerateMarketing()` mutation (React Query)
  - Substituído `api.post()` inline por mutation com loading/error states
  - Convertido arrays mock `TEMPLATES`/`SCHEDULED` de `const` para `useState`
  - Botão "Salvar template" agora adiciona template gerado à lista local
  - Botão "Copiar" funcional com `navigator.clipboard`
  - Extração automática de hashtags e inferência de categoria/título
  - Removida importação direta de `api` da página
- **Tabela de auditoria completa** gerada com saúde (✅/⚠️/❌) para cada módulo

### Audit Result Summary
| Status | Count | Modules |
|--------|-------|---------|
| ✅ Saudáveis | 17 | analytics, biblioteca, billing, caa, encaminhamentos, exercicios, financeiro, index, laudos, linha-do-tempo, materiais, onboarding, pacientes, plano-terapeutico, prontuario, relatorios, sessao, tarefas, whatsapp |
| ⚠️ Issues menores | 3 | agenda (sem loading/error), configuracoes (sem loading), perfil (sem loading) |
| ❌ Críticos (corrigidos) | 2 | **marketing** (mock data → hook + estado local), **mais** (links quebrados → corrigidos) |
| ❌ Críticos (pendentes) | 1 | **teleconsulta** — inline hooks + sem backend module |

### Fixes Applied
1. **mais.tsx**: Links WhatsApp e Teleconsulta apontando para rotas erradas → corrigidos
2. **use-marketing.ts** (novo hook): Mutation React Query para `/api/ai/marketing/generate`
3. **marketing.tsx**: Mock data eliminado — arrays viraram estado, "Salvar template" funcional, erro exibido, copy-to-clipboard implementado

### Still Pending
- **teleconsulta.tsx**: Usa inline `useQuery` (anti-pattern), chama `/api/teleconsulta/sessions` sem backend module correspondente
- **marketing.tsx**: Templates e agendamentos salvos apenas em estado local (sem persistência backend) — precisa de módulo `marketing/` no backend com CRUD
- **agenda.tsx**: Adicionar `apptQuery.isLoading` e `apptQuery.isError`
- **configuracoes.tsx**: Adicionar loading state do `useSettings`
- **perfil.tsx**: Adicionar loading state do `useProfile`

### Anti-Patterns Added
- ❌ `mais.tsx` links hardcoded pointing to wrong dashboard routes (/dashboard/pacientes instead of /dashboard/whatsapp) — always verify route paths when adding navigation items
- ❌ `marketing.tsx` hardcoded empty arrays masquerading as real data — never ship UI that shows permanent empty states; use state or hook so data can be populated
- ❌ `marketing.tsx` inline fetch without React Query mutation — always extract API calls to hooks in `src/hooks/`

## Installed Agent Skills (181 skills)

### Organização AI-Native (13 skills)
**Master skill:** `organizacao-ai-native` — carrega o framework organizacional completo (filosofia, princípios, camadas, operating model, formato de resposta).

**Layer skills (12):**
- `organizational-intelligence-layer` — Organizational Memory, Decision Intelligence, Metrics, Executive Reporting
- `executive-layer` — CEO, CTO, CPO, CMO, COO, CFO, Chief AI Officer, Chief Strategy Officer, Chief Data Officer
- `product-experience-layer` — PM, UX Research, UX Design, UX Writer, Design System, Accessibility, Clinical Experience, Customer Voice
- `engineering-layer` — Architecture, Backend, Frontend, Mobile, AI, QA, Performance, Security, Platform, DevOps, SRE, Observability
- `data-ai-layer` — Data Engineering, Analytics, ML, AI Research, RAG, Prompt Engineering, AI Governance
- `growth-marketing-layer` — Growth, Branding, CRM, SEO, Content, Social, Community, Performance Marketing, Market Intelligence
- `customer-experience-layer` — Customer Success, Support, Onboarding, Churn Prevention, NPS Intelligence
- `business-operations-layer` — Strategy, RevOps, Finance, Process Optimization, Automation
- `people-culture-layer` — Talent, People Ops, Culture, L&D, Leadership Coaching
- `legal-security-governance-layer` — Compliance, LGPD, Risk, Audit, IAM, Threat Intelligence
- `research-innovation-layer` — Innovation, AI Trends, Startup Intelligence, Experimentation
- `platform-infrastructure-layer` — Cloud, K8s, CI/CD, FinOps, Incident Response, DR

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

## Feedback Loop
1. Before any task: read relevant spec in `openspec/specs/`
2. Before commit: run `typecheck` + `build` for affected packages
3. After commit: verify deploy on Render/Vercel
4. On failure: document fix in AGENTS.md anti-patterns section

Skills provide specialized instructions and workflows for specific tasks.
Use the skill tool to load a skill when a task matches its description.
