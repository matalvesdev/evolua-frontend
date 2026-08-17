# Evolua — Decisões de Arquitetura (ADRs)

## ADR-001: Monorepo com pnpm workspaces
- **Status**: Aceito
- **Contexto**: Múltiplos packages (frontend, landing, backend, contracts)
- **Decisão**: pnpm workspaces com `backend-core/`, `frontend-core/`, `landing-core/`
- **Consequência**: Builds compartilhados, contratos Zod compartilhados, deploy independente

## ADR-002: Supabase como plataforma
- **Status**: Aceito
- **Contexto**: Precisamos de Auth, Postgres, Storage, Realtime
- **Decisão**: Supabase (sa-east-1) para tudo exceto AI service
- **Consequência**: Auth management simplificado, RLS nativo, vendor lock-in parcial

## ADR-003: AI Service separado (FastAPI + Python)
- **Status**: Aceito
- **Contexto**: IA requer Python (LangChain, HuggingFace)
- **Decisão**: FastAPI em container separado, comunicação via HTTP interno
- **Consequência**: Escala independente, cold start no Render free tier

## ADR-004: WhatsApp via Go gateway
- **Status**: Aceito
- **Contexto**: Evolution API v2 é Go, precisamos de performance
- **Decisão**: Gateway Go+chi como wrapper sobre Evolution API
- **Consequência**: Performance nativa, mas manutenção de código Go

## ADR-005: Zod como source of truth
- **Status**: Aceito
- **Contexto**: Frontend e backend compartilham contratos
- **Decisão**: Schemas Zod em `contracts/` definem tipos e validação
- **Consequência**: Type safety cross-stack, validação no boundary

## ADR-006: GEOS como growth engine (substitui FAANg + skills org)
- **Status**: Aceito (2026-08-12)
- **Contexto**: A camada organizacional antiga (FAANg skill, 203 agentes, 22 skills organizacionais, squads) era prompt-only — sem execução real, sem storage persistente, sem workflows determinísticos
- **Alternativas**:
  1. Manter FAANg como framework conceitual + adicionar GEOS
  2. Substituir completamente por GEOS
  3. Criar sistema custom
- **Trade-offs**:
  - FAANg: rico em conceitos mas zero execução (prompt engineering only)
  - GEOS: framework Python executável, local-first, 333 testes, SDD
  - Custom: caro, duplica esforço
- **Decisão**: Substituir completamente. GEOS oferece:
  - Agentes declarativos (YAML) vs. agentes em markdown (prompt-only)
  - Workflows executáveis vs. pipelines descritivos
  - Storage SQLite persistente vs. memória volátil
  - Research Engine real vs. instruções de pesquisa
  - Content Engine com scoring vs. templates estáticos
  - Analytics Engine determinístico vs. métricas manuais
  - Aprovação humana obrigatória em todo risco externo
- **Consequência**:
  - Removidos: `.opencode/skills/faang/`, `.opencode/agents/` (203), `.agents/skills/` (22), `squads/`
  - Adicionados: `.geos/` (config + db), `.doc/` (documentação), workflows executáveis
  - GEOS opera em brownfield mode: não modifica código do produto
  - Shadow mode antes de qualquer automação externa (ADR-0005 do GEOS)

## ADR-007: GEO (Generative Engine Optimization) como nova fronteira SEO
- **Status**: Aceito (2026-08-12)
- **Contexto**: Busca está migrando de Google para ChatGPT/Claude/Gemini. Otimizar para LLMs citarem a Evolua é a próxima fronteira
- **Decisão**: Criar experimento GEO com baseline, consultas-alvo, avaliação
- **Consequência**: Conteúdo otimizado para citation por LLMs, não apenas ranking

## ADR-008: Resend como substituto do Notifica
- **Status**: Aceito
- **Contexto**: Notifica serviço indisponível/inconsistente
- **Decisão**: Migrar todo envio para Resend (transacional + newsletter)
- **Consequência**: Maior controle, melhor deliverability, custo previsível

## ADR-009: Git Flow com CI/CD path-filtered
- **Status**: Aceito (2026-08-12)
- **Contexto**: Repositório crescendo com múltiplos serviços (frontend, landing, api, ai, whatsapp). CI rodava tudo para toda mudança, sem path filtering. Deployments diretos na main sem proteção.
- **Alternativas**:
  1. Trunk-based development (push direto na main)
  2. Git Flow simplificado (main + develop + feature)
  3. Git Flow completo (main + develop + feature + release + hotfix)
- **Trade-offs**:
  - Trunk-based: rápido mas arriscado para produção
  - Git Flow simplificado: bom equilíbrio, mas sem preparação de release
  - Git Flow completo: mais processos, mas mais controle
- **Decisão**: Git Flow simplificado (main + develop + feature/release/hotfix)
  - `main`: produção, deploy automático
  - `develop`: integração, sem deploy
  - `feature/*`: features novas, merge via PR squash
  - `release/*`: preparação de release, merge para main + develop
  - `hotfix/*`: correções urgentes, merge para main + develop
- **CI/CD**:
  - Path filters por domínio (só roda o que mudou)
  - Ordem: Build → TypeCheck → Lint (anti-pattern: inverter)
  - Filtros pnpm por path (`-F ./frontend-core`), não por nome
  - Landing usa `build:skip-sitemap` em CI (sem env Supabase)
  - Permissions: `contents: read` (least privilege)
  - Concurrency: cancel-in-progress para CI, false para deploys
  - Secret scanning (gitleaks) e dependency review em todo PR
  - Validação de `.doc/` e `.geos/` quando alterados
- **Consequência**:
  - PRs obrigatórios para main e develop
  - Deploys automáticos apenas via merge na main
  - CI mais rápido (path filters reduzem tempo ~60%)
  - Segurança reforçada (gitleaks + dependency review)
  - Runbook documentado em `.doc/git-flow-runbook.md`

## ADR-010: CI Build-First Order (TypeCheck/Lint após Build)
- **Status**: Aceito (2026-08-12)
- **Contexto**: `routeTree.gen.ts` (TanStack Router) é gitignored e gerado pelo `@tanstack/router-plugin` durante `vite build`. Rodar `tsc -b` antes do build causa TS2307/TS2345.
- **Decisão**: Ordem obrigatória: `build` → `typecheck` → `lint`
- **Consequência**: typecheck e lint só rodam após o build gerar os arquivos necessários
