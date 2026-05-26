# Evolua CRM

CRM brasileiro para fonoaudiólogas com WhatsApp nativo, AI-powered content automation e billing (PIX/Cartão).

## Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React + TanStack Router + Vite + Tailwind |
| **Landing** | React + Vite (Vercel) |
| **API** | Fastify + TypeScript + Zod + Prisma (Render) |
| **AI** | FastAPI + LangChain + pgvector (Render) |
| **WhatsApp** | Go + chi + Evolution API v2.2.3 (Render) |
| **DB** | Postgres (Supabase) |
| **Infra** | Terraform (AWS), Render, Vercel |
| **Auth** | Supabase Auth (JWT ES256 via JWKS) |

## Directory Map

```
├── AGENTS.md              ← Harness engineering rules
├── openspec/              ← Spec-driven planning (specs + changes)
├── docs/                  ← Architecture, runbooks, editorial
├── backend-core/          ← Monorepo (api, ai, wa, prisma)
│   ├── apps/api/          ← Fastify (port 3000)
│   ├── apps/ai/           ← FastAPI AI service (port 8001)
│   └── apps/services/whatsapp/  ← Go gateway (port 8010)
├── frontend-core/         ← App SPA (app.useevolua.com.br)
├── landing-core/          ← Marketing site (useevolua.com.br)
├── supabase/migrations/   ← DB migrations
├── terraform/             ← AWS infrastructure
├── scripts/               ← Automation & codegen
└── .agents/               ← OpenCode agent definitions
```

## Development

```bash
pnpm install               # Install all packages
pnpm -F frontend-core dev  # Frontend dev server
pnpm -F landing-core dev   # Landing dev server
pnpm -F backend-core dev:api  # Fastify API
pnpm -F backend-core prisma:generate  # Prisma client
pnpm dev:ai                # AI service (uvicorn)
```

## Deployments

- **app.useevolua.com.br** — Vercel (frontend-core)
- **useevolua.com.br** — Vercel (landing-core)
- **api.useevolua.com.br** — Render (backend-core/api)
- **ai.useevolua.com.br** — Render (backend-core/ai)

## Key Features

- Google OAuth sign-up/sign-in via Supabase
- WhatsApp nativo (Evolution API) — CRM, automação, cobrança
- IA para relatórios, marketing, biblioteca (RAG)
- PIX/Cartão via AbacatePay + Stripe
- Prontuário digital completo (SOAP, anamnese, exames)
- Agenda inteligente com sincronização de calendário
- Onboarding wizard para nova clínica
- Newsletter + lead magnets para captação
- Knowledge base / central de ajuda

## Principles

1. Spec-driven development (OpenSpec)
2. Harness engineering (AGENTS.md)
3. Zod schemas as source of truth
4. Never trust raw data — parse at boundary
5. No `any`, no `console.log` in prod, no inline styles

## License

Privado — todos os direitos reservados.
