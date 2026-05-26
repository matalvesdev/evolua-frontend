# Change Proposal 006 — CI/CD Pipeline

**Status:** Proposed
**Date:** 2026-05-22

## Motivation
Currently no automated checks on PRs. TypeScript type errors and lint issues are caught only when running locally.

## Proposal

### GitHub Actions Workflow: `ci.yml`

**Triggers:** `pull_request` on `main` and `develop`

**Jobs:**

1. **lint-typecheck**
   - Runs on: `ubuntu-latest`
   - Steps:
     - `pnpm install`
     - `pnpm -F landing-core typecheck`
     - `pnpm -F landing-core lint`
     - `pnpm -F frontend-core typecheck`
     - `pnpm -F frontend-core lint`
   - Caches: `pnpm store`, `node_modules`

2. **backend-checks** (optional, can be separate workflow)
   - `pnpm -F backend-core prisma:generate`
   - `pnpm -F backend-core lint`

### Vercel Preview Deployments
Vercel already deploys on every push. Ensure:
- `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` set in GitHub Secrets
- Preview URLs posted as PR comments

### Required Secrets
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `SENTRY_AUTH_TOKEN`

## Impact
- New file: `.github/workflows/ci.yml`
- GitHub Secrets must be configured
- No breaking changes

## Rollback
Remove or disable the workflow file.
