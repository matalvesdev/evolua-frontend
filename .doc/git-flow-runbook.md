# Git Flow & CI/CD Runbook — Evolua

## Estratégia de Branches

```
main (produção)
  ↑
  └── release/v1.x.x (preparação de release)
        ↑
        └── develop (integração)
              ↑
              ├── feature/nome-da-feature
              ├── feature/outra-feature
              └── hotfix/corrigir-bug-crítico
```

### Branches

| Branch | Origem | Merge em | Deploy | Proteção |
|--------|--------|----------|--------|----------|
| `main` | — | — | Auto (Vercel/Render) | PR obrigatório, 1 approval, status checks pass |
| `develop` | `main` | `main` (via release) | Nenhum | PR obrigatório, CI pass |
| `feature/*` | `develop` | `develop` | Nenhum | PR para develop |
| `release/*` | `develop` | `main` + `develop` | Nenhum | PR para main + develop |
| `hotfix/*` | `main` | `main` + `develop` | Nenhum | PR para main + develop |

### Fluxo Feature

```bash
# 1. Criar feature
git checkout develop
git pull origin develop
git checkout -b feature/nome-da-feature

# 2. Desenvolver (commits convencionais)
git add .
git commit -m "feat(frontend): descrição"
git push origin feature/nome-da-feature

# 3. Abrir PR para develop
# → CI roda: build → typecheck → lint (só para paths alterados)
# → Após aprovação e CI green → merge (squash)

# 4. Cleanup
git checkout develop
git pull origin develop
git branch -d feature/nome-da-feature
```

### Fluxo Release

```bash
# 1. Criar release
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# 2. Ajustes finais (chore, fix)
git commit -m "chore(release): bump version to 1.2.0"

# 3. PR para main
# → CI roda completo (typecheck, lint, build, e2e)
# → Após aprovação → merge para main
# → Deploy automático para produção

# 4. Backport para develop
git checkout develop
git merge release/v1.2.0
git branch -d release/v1.2.0

# 5. Tag
git checkout main
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
```

### Fluxo Hotfix

```bash
# 1. Criar hotfix
git checkout main
git pull origin main
git checkout -b hotfix/corrigir-bug

# 2. Corrigir
git commit -m "fix(api): corrigir bug crítico"

# 3. PR para main
# → CI roda completo
# → Após aprovação → merge para main
# → Deploy automático

# 4. Backport para develop
git checkout develop
git merge hotfix/corrigir-bug
git branch -d hotfix/corrigir-bug
```

## Convenções de Commit

Formato: `type(scope): subject`

### Types
| Type | Uso |
|------|-----|
| `feat` | Nova feature |
| `fix` | Correção de bug |
| `chore` | Manutenção, deps, config |
| `docs` | Documentação |
| `style` | Formatação (sem mudança lógica) |
| `refactor` | Refatoração (sem mudança de comportamento) |
| `test` | Adição/correção de testes |
| `ci` | Alteração em workflows CI/CD |
| `perf` | Melhoria de performance |
| `revert` | Reverter commit anterior |

### Scopes
| Scope | Área |
|-------|------|
| `frontend` | frontend-core |
| `landing` | landing-core |
| `api` | backend-core/apps/api |
| `ai` | backend-core/apps/ai |
| `whatsapp` | backend-core/apps/services/whatsapp |
| `prisma` | backend-core/prisma |
| `contracts` | backend-core/contracts |
| `content` | scripts/content-pipeline |
| `geos` | .geos/ |
| `ci` | .github/workflows/ |
| `infra` | terraform/ |

### Exemplos
```
feat(frontend): adicionar módulo de teleconsulta
fix(api): corrigir validação de CPF no cadastro
chore(deps): atualizar react para 19.2.5
ci(frontend): adicionar path filter no deploy
docs(geos): atualizar experimento GEO com baseline
```

## Convenções de PR

### Título
Mesmo formato do commit: `type(scope): subject`

### Template
```markdown
## O que mudou
- [ ] Descrição da mudança

## Por que
- [ ] Contexto /motivação

## Como testar
- [ ] Passos para reproduzir

## Checklist
- [ ] Build passa localmente
- [ ] TypeCheck passa
- [ ] Lint passa
- [ ] Testes passam
- [ ] Não quebra funcionalidade existente
- [ ] Docs atualizados (se aplicável)
```

### Review
- Mínimo 1 approval para merge
- CI deve estar verde (todos os status checks)
- Squash merge no develop, merge commit no main

## Política de Proteção

### `main`
- PR obrigatório (não pode push direto)
- 1 approval mínimo
- Status check obrigatório: **`ci-gate`** (único required check)
- Branch restrita para administradores

### `develop`
- PR obrigatório
- Status check obrigatório: **`ci-gate`** (único required check)
- Squash merge

### Por que `ci-gate` e não jobs individuais?
Jobs como `frontend-build`, `landing-build`, `e2e` são **path-scoped**: quando o PR não toca seus paths, eles são **skipped**. Se `frontend-build` fosse required check, um PR que só altera `.doc/` ficaria preso porque `frontend-build` nunca roda. O `ci-gate` usa `if: always()` e aceita `success` + `skipped`, falhando só em `failure`/`cancelled`. Portanto, ele é o único check que pode ser required sem bloquear PRs de outros domínios.

## CI/CD Pipeline

### Triggers por Path

| Workflow | Paths que disparam |
|----------|-------------------|
| `ci.yml` (PR/push develop) | Todos (com filter por job) |
| `deploy-frontend.yml` | `frontend-core/**`, `pnpm-lock.yaml` |
| `deploy-landing.yml` | `landing-core/**`, `pnpm-lock.yaml` |
| Backend `deploy-production.yml` | `apps/api/**`, `apps/ai/**`, `contracts/**`, `prisma/**` no repositório backend |
| Backend `deploy-staging.yml` | push em `develop` no repositório backend; deploy + validação de commit da API e IA |
| `deploy-whatsapp.yml` | gateway WhatsApp quando mantido no repositório responsável |
| `deploy-migrations.yml` | `backend-core/prisma/migrations/**` |
| `deploy-supabase-migrations.yml` | `supabase/migrations/**` |

### Ordem de Gates (CRÍTICO)

```
Build (vite build) → TypeCheck (tsc -b) → Lint (eslint)
```

**Anti-pattern**: Rodar typecheck/lint antes do build.
**Motivo**: `routeTree.gen.ts` (TanStack Router) é gitignored e gerado pelo `@tanstack/router-plugin` durante `vite build`. Sem ele, tsc falha com TS2307/TS2345.

### Filtros pnpm

```bash
# CORRETO — filtro por path (desacopla do pkg name)
pnpm -F ./frontend-core build
pnpm -F ./landing-core build

# ERRADO — filtro por nome (pkg name ≠ diretório)
pnpm -F frontend-core build    # pkg name é "system-core"
pnpm -F landing-core build     # pkg name é "landing-v2"
```

### Landing Build

```bash
# CI — sem env Supabase, usar skip-sitemap
pnpm -F ./landing-core build:skip-sitemap

# Produção — com env Supabase, build completo
pnpm -F ./landing-core build
```

### Permissions (Least Privilege)

Todos os workflows usam `permissions: contents: read` exceto:
- `content-pipeline.yml`: precisa de `contents: write` (commits automáticos)

### Concurrency

- **CI**: `cancel-in-progress: true` (cancela runs anteriores do mesmo branch)
- **Deploy**: `cancel-in-progress: false` (nunca cancelar deploy em andamento)

## Ambientes GitHub

| Environment | URL | Proteção |
|-------------|-----|----------|
| `production` | app.useevolua.com.br | Manual approval (deploy workflows) |

## Secrets Necessários

### Já existentes (NÃO criar novos)
| Secret | Uso |
|--------|-----|
| `VERCEL_TOKEN` | Deploy Vercel |
| `VERCEL_ORG_ID` | Vercel org |
| `VERCEL_PROJECT_ID_FRONTEND` | Vercel project frontend |
| `VERCEL_PROJECT_ID_LANDING` | Vercel project landing |
| `RENDER_DEPLOY_HOOK_API` | Deploy API no Render |
| `RENDER_DEPLOY_HOOK_AI` | Deploy AI no Render |
| `DATABASE_URL` | Supabase pooler (runtime) |
| `DIRECT_URL` | Supabase direct (migrations) |
| `SUPABASE_URL` | Supabase API URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role |
| `OPENROUTER_API_KEY` | Content pipeline AI |
| `RESEND_API_KEY` | Email sending |
| `SSH_HOST` / `SSH_USERNAME` / `SSH_KEY` | WhatsApp deploy |
| `SENTRY_DSN` | Error tracking |

### Não inventados
- Nenhum secret novo foi criado neste PR
- Todos os secrets referenciados já existem ou dependem de configuração manual

### Staging — provisionamento obrigatório

Os workflows são fail-closed e não executam deploy enquanto estes valores não existirem:

| Repositório | Secrets do environment `staging` |
|-------------|-----------------------------------|
| Frontend | `API_URL` |
| Backend | `API_URL`, `AI_URL`, `RENDER_DEPLOY_HOOK_API`, `RENDER_DEPLOY_HOOK_AI` |

As URLs e os deploy hooks devem ser copiados dos serviços de staging provisionados no Render;
é proibido usar endpoints de produção para satisfazer o preflight.

## Deploys

| Serviço | Trigger | Automático | Via |
|---------|---------|-----------|-----|
| Frontend (Vercel) | Push main + frontend-core/* | ✅ | `amondnet/vercel-action@v42` |
| Landing (Vercel) | Push main + landing-core/* | ✅ | `amondnet/vercel-action@v42` |
| API (Render) | Push main no repositório backend | ✅ | Auto deploy Render + gate próprio de migrations/readiness |
| AI (Render) | Push main + backend-core/apps/ai/* | ✅ | Deploy hook |
| WhatsApp (EC2) | Push main + whatsapp/* | ✅ | SSH + docker-compose |
| Prisma migrations | Push main + prisma/migrations/* | ✅ | `prisma migrate deploy` |
| Supabase migrations | Push main + supabase/migrations/* | ✅ | Ledger script |
| Content pipeline | Cron (seg-sex 06:00 BRT) | ✅ | Node.js script |

## Validação

### Local
```bash
# Frontend
pnpm -F ./frontend-core build && pnpm -F ./frontend-core typecheck && pnpm -F ./frontend-core lint

# Landing
pnpm -F ./landing-core build:skip-sitemap && pnpm -F ./landing-core typecheck && pnpm -F ./landing-core lint

# API
pnpm --filter @evolua/api lint

# AI
cd backend-core/apps/ai && ruff check .

# WhatsApp
cd backend-core/apps/services/whatsapp && go vet ./... && go build ./...

# Docs
ls .doc/*.md | wc -l  # deve retornar 9
cat .geos/geos.yaml | head -5
```

### CI (automático)
- `ci.yml` roda em PR para main/develop
- Path filters evitam rodar jobs irrelevantes
- Jobs: `paths` → `frontend-build`, `landing-build`, `e2e`, `validate-docs`, `secret-scanning`, `dependency-review`
- **`ci-gate`** agrega todos os resultados (aceita success/skipped, falha em failure/cancelled)
- **Apenas `ci-gate` deve ser required check** em branch protection rules
- Sem jobs backend neste repo (backend-core é repo separado com CI próprio)
- Build → TypeCheck → Lint (ordem correta)
- E2E após builds
- Secret scanning (gitleaks)
- Dependency review (PR only)
- Docs/geos validation (quando .doc/ ou .geos/ mudam)
