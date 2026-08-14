# Evolua — Operação

## Modelo Operacional
Evolua opera como organização AI-Native: cada área é amplificada por agentes de IA,
com supervisão humana em todo risco externo.

## Ciclo de Produto
```
Especificação → Implementação → Review → Teste → Deploy → Monitoramento → Feedback
     ↑                                                                      │
     └──────────────────────────────────────────────────────────────────────┘
```

### Especificação (SDD)
- Toda feature começa com especificação completa em `openspec/specs/`
- Contexto, objetivo, regras, edge cases, tradeoffs, métricas, riscos
- ADR (Architecture Decision Record) para decisões significativas

### Implementação
- Código segue convenções do projeto (Zod, Clean Architecture, DDD)
- Hooks React Query no frontend, Fastify no backend
- Prisma para DB, contracts para validação compartilhada

### Review
- Code review obrigatório antes de merge (1 approval mínimo)
- Lint + typecheck antes de commit
- Build funciona antes de push
- PR template com checklist obrigatório

### Teste
- Unit tests (Vitest backend, pytest AI service)
- Integration tests (Playwright)
- E2E critical paths
- CI roda automaticamente em PRs

### Deploy
- **Git Flow**: main → develop → feature/release/hotfix (ver `.doc/git-flow-runbook.md`)
- **Frontend/Landing**: Vercel (auto-deploy from main via `amondnet/vercel-action@v42`)
- **API**: Render (auto-deploy from main via deploy hook)
- **AI Service**: Render (auto-deploy from main via deploy hook)
- **WhatsApp**: EC2 (auto-deploy from main via SSH + docker-compose)
- **Database Prisma**: Supabase migrations (manual gate, `DATABASE_URL` + `DIRECT_URL`)
- **Database SQL**: Supabase migrations SQL (ledger script, `DIRECT_URL`)
- **Staging Supabase**: projeto isolado, schema clonado sem dados clínicos; migrations incrementais fail-closed via ledger
- **Staging web**: preview Vercel em `develop`, protegido por automation bypass exclusivo do E2E; preflight exige `API_URL` de staging e impede auditoria contra backend ausente
- **Staging backend**: Blueprint Render em `backend-core/render.staging.yaml`; preflight fail-closed exige hooks e URLs dos serviços provisionados
- **CI gates**: Build → TypeCheck → Lint (ordem obrigatória, ver anti-patterns)
- **CI required check**: `ci-gate` (aceita success/skipped, falha em failure/cancelled)
- **Proteção de branches**: preparada para exigir apenas `ci-gate`, mas bloqueada pelo plano GitHub dos repositórios privados
- **Backend CI**: executado em repo separado (`backend-core`), não neste repo

### Monitoramento
- Sentry para erros (frontend + backend)
- Health checks: `/healthz` + `/readyz`
- Observabilidade: logs estruturados (pino)

### Feedback
- User research com fonoaudiólogas beta
- Analytics de uso dos módulos
- NPS e satisfação

## Pipeline de Conteúdo (GEOS)
```
Pesquisa (GEOS Research Engine)
  → Conhecimento (GEOS Knowledge + RAG)
  → Estratégia (GEOS Content Engine)
  → Criação (Content Pipeline scripts)
  → Aprovação Humana (gate obrigatório)
  → Publicação (Supabase blog + social email)
  → Distribuição (Landing + Redes Sociais)
  → Analytics (GEOS Analytics Engine)
```

## Cadência
- **Diária**: Pipeline de conteúdo (seg-sex, 06:00 BRT)
- **Semanal**: Content Engine (sábado, 08:00 BRT)
- **Mensal**: Review de métricas e roadmap
- **Trimestral**: Review estratégico

## Incident Response
1. Detectar (Sentry / health checks / logs)
2. Isolar (feature flag / rollback)
3. Corrigir (hotfix)
4. Comunicar (status page)
5. Documentar (post-mortem)

## Segurança
- LGPD compliance (dados de pacientes)
- RLS no Supabase (multi-tenant by row)
- JWT ES256 (não HS256)
- Secrets em env vars, nunca em código
- CSP headers no Vercel
- HMAC em webhooks de pagamento
