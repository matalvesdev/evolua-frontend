# Full Implementation Scope — Evolua Pendências

## Summary
This change implements the highest-priority pendências across the entire Evolua project, using OpenSpec spec-driven development and Harness Engineering principles.

## Changes Implemented

### Harness Engineering Foundation
- Created `AGENTS.md` with project overview, tech stack, directory map, commands, conventions, forbidden patterns, anti-patterns, and feedback loop
- All agent rules captured in version-controlled file

### OpenSpec Specs
- Domain specs for System, Auth, AI, Frontend, Marketing, Infra, Billing
- Change proposals for P0 fixes, Google OAuth, marketing execution, infrastructure hardening

### P0 Critical Fixes
- ✅ CSP fix (landing-core/vercel.json) — needs Vercel redeploy
- ✅ Evolution model: Llama-3.1-8B → zephyr-7b-beta
- ✅ Patient state: `.max(2)` vs `.length(2)`
- ✅ AI service warmup on startup (main.py)
- ✅ AI service readyz with DB/vector store check

### Google OAuth
- ✅ Implemented `supabase.auth.signInWithOAuth({ provider: 'google' })` in cadastro.tsx

### ErrorBoundary
- ✅ Integrated Sentry.captureException (was using console.error only)

### Report Persistence
- ✅ Session reports now persist to API via `POST /api/reports`
- ✅ Removed TODO placeholder text from UI

### IA Integration
- ✅ Biblioteca: RAG call to `/api/ai/rag/library`
- ✅ Marketing: Content generation via `/api/ai/marketing/generate`
- ✅ QuickActions: Study assistant + marketing generator wired to API
- ✅ Analytics: Real dashboard hook replacing mock data

### WhatsApp Exercise Prescription
- ✅ Now calls `/api/messages/batch` instead of just marking locally

### Marketing Automation
- Created `scripts/publish-content.sh` for content pipeline management
- Drafted Newsletter "Fono em Foco" setup procedure
- Documented Meta/Google Ads configuration

## Remaining Items (not in scope)
See: `openspec/changes/marketing-execution/` and `openspec/changes/infrastructure-hardening/`
