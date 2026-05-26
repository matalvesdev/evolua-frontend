# Tasks — Full Implementation Scope

## Harness Engineering
- [x] Create AGENTS.md with project rules, commands, anti-patterns
- [x] Define feedback loop for future agent sessions

## OpenSpec
- [x] Create openspec/ directory structure
- [x] Create domain specs (system, auth, AI, frontend, marketing, infra, billing)
- [x] Create change proposals (P0 fixes, Google OAuth, marketing, infra)
- [x] Create config.yaml

## Frontend Fixes
- [x] Google OAuth: implement signInWithOAuth in cadastro.tsx
- [x] ErrorBoundary: add Sentry.captureException
- [x] Report persistence: POST /api/reports on sign
- [x] Biblioteca: async RAG API call
- [x] Marketing: async content generation API call
- [x] QuickActions: study + marketing wired to API
- [x] Analytics: real hook with useDashboardAnalytics
- [x] Exercícios: prescription via /api/messages/batch

## Backend Fixes
- [x] AI service warmup on startup
- [x] AI service readyz health check
- [x] Add useDashboardAnalytics hook to use-dashboard.ts

## Marketing
- [x] Create content publishing workflow script
- [x] Draft marketing execution change proposal
- [x] Draft infrastructure hardening change proposal
