---
title: "API, Busca, Documentos e Billing"
status: active
owner: "Engineering"
last_reviewed: 2026-08-14
---

# API, Busca, Documentos e Billing

## API

Fastify registra rotas sob `/api` conforme `apps/api/src/app.ts`; a convenção `/api/v1` é uma direção declarada em `AGENTS.md`, não deve ser assumida universalmente sem checar cada rota. Contratos Zod validam boundaries. Erro público proposto: `{ error: { code, message, request_id } }`, sem SQL, stack trace, caminhos ou segredos.

## Busca e documentos

Busca deve aplicar autorização/tenant antes da recuperação, inclusive em RAG. Geração de documento deve versionar template, autor, timestamp, acesso, armazenamento e reemissão. Arquivos de pacientes devem ser privados por padrão e entregues por URL curta assinada quando aplicável; implementação específica de signed URL/antivírus requer validação.

## Billing

Separar assinatura da Evolua de cobrança do paciente. Autorização de feature deve ser resolvida no servidor por entitlement, nunca somente por estado do frontend. Planos, `Subscription`, `Invoice` e `BillingEvent` existem; catálogo público, grace period e política de refund são decisões comerciais pendentes.
