# System Architecture

## Overview
Evolua is a multi-service CRM for Brazilian speech therapists. The system comprises a Fastify API backend, React frontend, FastAPI AI service, Go WhatsApp gateway, a Vite landing site, and the GEOS growth engine.

## Services

### API (Fastify + TypeScript)
- Port 3000 (dev), 8080 (prod)
- Auth: Supabase Auth with JWKS ES256 verification
- Database: Prisma ORM → Supabase Postgres
- Validation: Zod schemas in `contracts/` are source of truth

### AI Service (FastAPI + LangChain + Python)
- Port 8001
- Endpoints: `/transcribe`, `/generate/evolution`, `/rag/library`
- Model: zephyr-7b-beta (Hugging Face Inference API)
- Fallback chain: Render API → Hugging Face Inference API

### WhatsApp Gateway (Go + chi)
- Port 8010
- Evolution API v2.2.3 wrapper
- Webhooks for incoming messages

### Frontend (React + TanStack Router + Vite)
- URL: app.useevolua.com.br
- Auth: Supabase Auth JS client
- Routes: dashboard, billing, patients, sessions

### Landing (React + Vite)
- URL: useevolua.com.br
- Content: Blog, changelog, FAQ, contact, legal pages

### GEOS Growth Engine (Python — local-first)
- Config: `.geos/geos.yaml` (brownfield mode)
- DB: SQLite (`.geos/geos.db`)
- Domains: Research, Content, SEO, Leads, CRM, Analytics
- Knowledge: RAG + FTS5 + Knowledge Graph
- Experimento GEO: `.doc/geo-experiment.md`

## Data Flow
1. User authenticates via Supabase Auth → JWT in cookie
2. Frontend calls API with JWT → Fastify validates via JWKS
3. API calls Prisma → Supabase Postgres
4. AI features: API proxies to AI service (internal)
5. WhatsApp: API communicates via Go gateway → Evolution API
6. Billing: API communicates with AbacatePay/Stripe webhooks
7. Growth: GEOS orchestrates content, SEO, leads, analytics (local-first)
