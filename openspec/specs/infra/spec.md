# Infrastructure Domain

## Infrastructure
- **Frontend**: Vercel (app.useevolua.com.br) — auto-deploy from main via `amondnet/vercel-action@v42`
- **Landing**: Vercel (useevolua.com.br) — auto-deploy from main via `amondnet/vercel-action@v42`
- **API**: Render web service (api.useevolua.com.br) — auto-deploy from main via deploy hook; novos recursos declarados em `virginia`
- **AI Service**: Render web service (ai.useevolua.com.br) — auto-deploy from main via deploy hook; novos recursos declarados em `virginia`
- **WhatsApp Gateway**: EC2 (go + chi) — auto-deploy from main via SSH + docker-compose
- **Database**: Supabase Postgres — produção em `sa-east-1` e staging isolado em `ca-central-1`; Prisma migrations + SQL migrations via ledger
- **Terraform**: AWS infra (state remote S3 + DynamoDB pending)
- **CI/CD**: GitHub Actions with path-based gates (Git Flow)
  - **CI**: `ci.yml` — path filters per domain (`dorny/paths-filter@v4`), Build → TypeCheck → Lint order
  - **CI gate**: `ci-gate` job (if always, needs all jobs, accepts success/skipped, fails on failure/cancelled) — only required check
  - **Backend CI**: `backend-core` is a separate repo with its own CI — not in this monorepo checkout
  - **Deploys**: `deploy-frontend.yml`, `deploy-landing.yml`, `deploy-api.yml`, `deploy-ai.yml`, `deploy-whatsapp.yml`
  - **Staging web**: `deploy-staging.yml` — previews Vercel protegidos + Playwright autenticado com automation bypass
  - **Staging backend**: workflow e Blueprint vivem no repositório separado `backend-core`
  - **Database**: `deploy-migrations.yml` (Prisma), `deploy-supabase-migrations.yml` (SQL + ledger)
  - **Content**: `content-pipeline.yml` — daily blog + social (Resend email)
  - **Backup**: `pg-backup.yml` — daily at 03:00 UTC
  - **Security**: secret-scanning (gitleaks) + dependency-review on every PR
  - **Docs validation**: `.doc/` and `.geos/` checked when altered
  - **Permissions**: `contents: read` (least privilege) — `write-all` only for content-pipeline

## Branching & Deploy Flow
- **main** → deploy automático (Vercel/Render/EC2) — requer PR + 1 approval mínimo + CI verde
- **develop** → integração + deploy de staging — CI roda em todo PR; deploys nunca usam `cancel-in-progress`
- **feature/\*** → feature branches, merge via PR squash para develop
- **release/\*** → preparação de release, merge para main + develop
- **hotfix/\*** → correções urgentes, merge para main + develop

## Current Gaps
- **Terraform state remote**: Code ready in `terraform/bootstrap/`, apply not done
- **Render staging**: Blueprint pronto e fail-closed; criação dos serviços, URLs e deploy hooks depende de provisionamento autenticado no Render
- **GitHub branch protection**: configuração bloqueada para repositórios privados no plano atual (GitHub Pro ou repositório público necessário)
- **AI custom domain**: `ai.useevolua.com.br` ainda não possui DNS; o serviço responde pela URL padrão do Render
- **WhatsApp not paired**: Evolution instance exists, QR never scanned
- **HMAC webhook**: Not enforced in production
- **Credential rotation**: Not executed (documented in CREDENTIAL-ROTATION.md)
