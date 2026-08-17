---
title: "Inventário de Controles de Segurança"
status: active
owner: "Security"
last_reviewed: 2026-08-14
---

# Controles observados

- API: `helmet`, CORS com allowlist de ambiente, rate limit e validação Zod.
- Auth: JWT ES256 validado via JWKS Supabase; hook de autenticação com HMAC configurável.
- Web: CSP, HSTS, `nosniff`, frame denial e referrer policy nos dois `vercel.json`.
- Dados: migrations/RLS; `service_role` explicitamente restrito ao servidor por comentário e uso.
- Integrações: segredos de webhook configuráveis para Evolution, AbacatePay e Stripe.
- Operação: Sentry opcional, backup workflow e ledger de migrations documentado em `AGENTS.md`.
- Logging: revisão de 2026-08-14 removeu e-mail, nome/ID de paciente e identificador de clínica de logs operacionais em caminhos de auth, email, leads, billing, teleconsulta e timeline; `AuditLog` permanece a trilha de ações sensíveis.

Este inventário não é certificação nem evidência de cobertura completa.
