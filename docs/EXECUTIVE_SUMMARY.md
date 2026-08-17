---
title: "Resumo Executivo Evolua"
status: active
owner: "Founder"
last_reviewed: 2026-08-14
---

# Evolua

## O que é

Evolua é um SaaS vertical brasileiro para organizar a rotina de fonoaudiologia. O repositório confirma uma plataforma de operação clínica e administrativa, não apenas agenda ou CRUD.

## Para quem e qual problema

Atende workflows de profissionais e potencialmente clínicas. A tese a validar: profissionais não deveriam adaptar o trabalho a software genérico; o software deveria acompanhar o fluxo de atendimento. ICP, tração e preços atuais não foram inferidos como fatos.

## Produto e tecnologia

Fluxos implementados incluem pacientes, agenda, prontuário, relatórios, planos/metas, exercícios, comunicação, billing, teleconsulta e IA. Stack: React/Vite, Fastify/TypeScript/Zod/Prisma, FastAPI/LangChain, Go/chi, Supabase, Render e Vercel. IA usa Hugging Face/OpenRouter; marketing operacional usa GEOS, pipeline de conteúdo, Supabase e Resend.

## Estratégia

**PROPOSED:** foco em um fluxo completo de alto valor para fono autônoma/consultório pequeno, com expansão somente após evidência. Mensagem candidata: organizar o trabalho, acompanhar cada paciente e simplificar a rotina — sem promessas de melhora clínica.

## Segurança e privacidade

Há JWT/JWKS, RLS/migrations, validação, rate limit e headers. Ainda é necessário provar isolamento por tenant nos caminhos críticos, definir retenção/direitos dos dados, endurecer auditoria e validar governança de provedores de IA. Não há claim de conformidade LGPD ou certificação.

## Prioridades

1. Autorização e isolação cross-tenant testadas.
2. Jornada clínica central E2E, medível e recuperável.
3. IA com avaliação humana, redaction/contexto mínimo e fallback.
4. Configuração/deploy/staging coerentes.
5. ICP, wedge, ativação e mensagem validados por evidência.

Leia também: [Master Context](EVOLUA_MASTER_CONTEXT.md), [Discovery](00-discovery/00_REPOSITORY_DISCOVERY.md), [Gaps](00-discovery/02_GAP_ANALYSIS.md) e [Priority Matrix](00-discovery/06_PRIORITY_MATRIX.md).
