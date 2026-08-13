# Infrastructure Domain

## Infrastructure
- **Frontend**: Vercel (app.useevolua.com.br) — auto-deploy from main via `amondnet/vercel-action@v42`
- **Landing**: Vercel (useevolua.com.br) — auto-deploy from main via `amondnet/vercel-action@v42`
- **API**: Render web service (api.useevolua.com.br) — auto-deploy from main via deploy hook
- **AI Service**: Render web service (ai.useevolua.com.br) — auto-deploy from main via deploy hook
- **WhatsApp Gateway**: EC2 (go + chi) — auto-deploy from main via SSH + docker-compose
- **Database**: Supabase Postgres (sa-east-1) — Prisma migrations + SQL migrations via ledger
- **Terraform**: AWS infra (state remote S3 + DynamoDB pending)
- **CI/CD**: GitHub Actions with path-based gates (Git Flow)
  - **CI**: `ci.yml` — path filters per domain (`dorny/paths-filter@v3`), Build → TypeCheck → Lint order
  - **CI gate**: `ci-gate` job (if always, needs all jobs, accepts success/skipped, fails on failure/cancelled) — only required check
  - **Backend CI**: `backend-core` is a separate repo with its own CI — not in this monorepo checkout
  - **Deploys**: `deploy-frontend.yml`, `deploy-landing.yml`, `deploy-api.yml`, `deploy-ai.yml`, `deploy-whatsapp.yml`
  - **Database**: `deploy-migrations.yml` (Prisma), `deploy-supabase-migrations.yml` (SQL + ledger)
  - **Content**: `content-pipeline.yml` — daily blog + social (Resend email)
  - **Backup**: `pg-backup.yml` — daily at 03:00 UTC
  - **Security**: secret-scanning (gitleaks) + dependency-review on every PR
  - **Docs validation**: `.doc/` and `.geos/` checked when altered
  - **Permissions**: `contents: read` (least privilege) — `write-all` only for content-pipeline

## Branching & Deploy Flow
- **main** → deploy automático (Vercel/Render/EC2) — requer PR + 1 approval mínimo + CI verde
- **develop** → integração, sem deploy automático — CI roda em todo PR
- **feature/\*** → feature branches, merge via PR squash para develop
- **release/\*** → preparação de release, merge para main + develop
- **hotfix/\*** → correções urgentes, merge para main + develop

## Current Gaps
- **Terraform state remote**: Code ready in `terraform/bootstrap/`, apply not done
- **Dev/prod Supabase**: Not yet separated
- **WhatsApp not paired**: Evolution instance exists, QR never scanned
- **HMAC webhook**: Not enforced in production
- **Credential rotation**: Not executed (documented in CREDENTIAL-ROTATION.md)
