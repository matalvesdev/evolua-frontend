---
title: "Modelo de Segurança, Autenticação e Autorização"
status: active
owner: "Security"
last_reviewed: 2026-08-14
---

# Modelo de Segurança

## Current State — VERIFIED

- Supabase Auth emite tokens; API valida JWT ES256 via JWKS remoto em `apps/api/src/plugins/auth.ts`.
- API Fastify registra `@fastify/helmet`, CORS orientado por `CORS_ORIGINS`, rate limit global e limites por rotas sensíveis em `apps/api/src/app.ts` e módulos.
- Frontend e landing definem CSP, HSTS, frame denial, `nosniff`, Referrer/Permissions Policy em seus `vercel.json`.
- Zod valida ambiente e boundaries de dados; Prisma/Supabase/migrations são usados para dados.
- `SUPABASE_SERVICE_ROLE_KEY` é marcada para uso somente server-side em `apps/api/src/lib/supabase.ts`.

## Limites e recomendações

Authentication responde “quem é”; authorization responde “pode acessar este recurso deste tenant?”. O controle de frontend é UX, nunca autoridade. Implementar/provar checks por recurso no servidor e RLS no banco; testar sempre acesso permitido e negado entre dois tenants. Privileged roles, MFA, expiração/revogação de sessões, recovery e acesso de suporte precisam de inventário e owner operacional.

## Segurança de desenvolvimento

Antes de merge: validar input, autorização, isolamento, segredo, logs, dependências, privacidade, testes e rollback. Nunca adicionar segredo ao repositório; `raw_user_metadata` não serve para autorização; não confiar em IDs enviados pelo cliente para delimitar tenant.
