# Evolua — Tecnologia

## Stack

### Frontend
- **Framework**: React 19 + TanStack Router + Vite
- **Styling**: Tailwind CSS
- **State**: React Query (TanStack Query)
- **Deploy**: Vercel (`app.useevolua.com.br`)
- **Auth**: Supabase Auth (JWT ES256 via JWKS)

### Landing
- **Framework**: React + Vite
- **Deploy**: Vercel (`useevolua.com.br`)
- **Conteúdo**: Blog, changelog, FAQ, páginas legais

### Backend API
- **Framework**: Fastify + TypeScript
- **Validation**: Zod (schemas em `contracts/` são fonte da verdade)
- **ORM**: Prisma → Supabase Postgres
- **Deploy**: Render (`api.useevolua.com.br`)
- **Port**: 3000 (dev) / 8080 (prod)

### AI Service
- **Framework**: FastAPI + LangChain + Python
- **Modelo**: zephyr-7b-beta (Hugging Face Inference API)
- **Features**: Transcrição (Whisper), Evolução clínica, RAG biblioteca
- **Deploy**: Render (`ai.useevolua.com.br`)
- **Port**: 8001
- **Fallback**: Render API → HF Inference API

### WhatsApp Gateway
- **Linguagem**: Go + chi
- **Provider**: Evolution API v2.2.3
- **Deploy**: Render (port 8010)
- **Features**: Webhooks, mensagens batch, media upload

### Database
- **Provider**: Supabase (Postgres)
- **ORM**: Prisma
- **Migrations**: Supabase migrations + Prisma migrations
- **Extensions**: pgvector (RAG)

### Infraestrutura
- **IaC**: Terraform (AWS) — state remote S3 + DynamoDB (pendente)
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry (frontend + backend) + Render metrics
- **Backup**: pg-backup.yml (não deployado)

### Monorepo
- **Tool**: pnpm workspaces
- **Packages**: `backend-core/`, `frontend-core/`, `landing-core/`
- **Contracts**: `backend-core/contracts/` (Zod schemas compartilhados)

## GEOS Integration
- **Local**: `.geos/` directory (brownfield mode)
- **Database**: SQLite (`.geos/geos.db`) — local-first, zero infra
- **Knowledge**: Ingestão de docs do projeto para RAG
- **Workflows**: Content pipeline, daily intelligence, SEO audit
- **Experimento GEO**: `.doc/geo-experiment.md`

## Conventions
- **Naming**: kebab-case (files), camelCase (vars), PascalCase (components)
- **Imports**: `@/` alias (frontend), `@evolua/` (backend)
- **Validation**: Zod parse no boundary, nunca confiar em dados brutos
- **API routes**: `/api/v1/resource`
- **Commits**: conventional commits (`type(scope): subject`)
- **Git Flow**: main → develop → feature/release/hotfix (ver `.doc/git-flow-runbook.md`)

## CI/CD
- **CI**: GitHub Actions com path filters por domínio
- **Ordem gates**: Build → TypeCheck → Lint (nunca inverter)
- **Filtros pnpm**: `-F ./frontend-core` (path, não nome de pacote)
- **Landing CI**: `build:skip-sitemap` (sem env Supabase)
- **Permissions**: `contents: read` (least privilege)
- **Concurrency**: cancel-in-progress: true (CI), false (deploys)
- **Secret scanning**: gitleaks em todo PR
- **Dependency review**: moderation threshold em PRs
- **Docs validation**: .doc/ e .geos/ validados quando alterados
- **Runbook completo**: `.doc/git-flow-runbook.md`

## Forbidden Patterns
- ❌ `any` type — usar `unknown` + Zod
- ❌ `console.log` em código commitado — usar pino (backend) / console.debug (frontend dev)
- ❌ Inline styles — usar Tailwind
- ❌ Secrets em código — usar env vars
- ❌ DB access direto do frontend — sempre via API
- ❌ `as` casts — usar Zod para type narrowing
- ❌ Typecheck/Lint antes de Build — `routeTree.gen.ts` é gerado pelo build
- ❌ Filtro pnpm por nome (`-F frontend-core`) — usar path (`-F ./frontend-core`)
- ❌ Push direto na main — sempre via PR
- ❌ Deploy sem CI verde — status checks são obrigatórios
