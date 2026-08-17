---
title: "ADR-0001 — Arquitetura atual multi-app"
status: accepted
owner: "Engineering"
last_reviewed: 2026-08-14
---

# ADR-0001 — Arquitetura atual multi-app

## Context

O repositório contém React/Vite para app e landing, API Fastify, IA FastAPI, gateway WhatsApp Go, Supabase e deploy Vercel/Render. O backend-core é repositório separado. Racional histórico completo indisponível; este ADR documenta arquitetura encontrada e tradeoffs inferidos.

## Decision

Manter a arquitetura atual como modular e orientada a responsabilidades, sem reclassificá-la como microservices. Usar contratos Zod, API central e Supabase como limites atuais. Evoluir por evidência.

## Alternatives

Consolidar tudo em um app, extrair mais serviços ou introduzir plataforma distribuída. Nenhuma é justificada apenas pela presença de vários processos.

## Consequences

Exige documentação clara de deploy, integrações e ownership entre os dois repositórios. Ganho: tecnologias adequadas para IA/WhatsApp; custo: mais configurações e releases para operar.

## Revisit When

Gargalos mensurados, falhas de deploy, necessidades de isolamento/compliance ou ownership independente justificarem mudança.
