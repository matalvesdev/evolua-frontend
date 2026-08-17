---
title: "Repository Discovery"
status: active
owner: "Engineering"
last_reviewed: 2026-08-14
source_of_truth: "Código, migrations e configuração referenciados abaixo"
---

# Repository Discovery

## Executive Summary

**VERIFIED.** Evolua é uma plataforma web brasileira para organizar a operação de profissionais de fonoaudiologia. O repositório contém um app autenticado com pacientes, agenda, prontuário, relatórios, planos terapêuticos, exercícios, materiais, comunicação/WhatsApp, financeiro, billing, teleconsulta e recursos de IA; uma landing pública; API Fastify; serviço de IA FastAPI; e gateway WhatsApp em Go. A presença de `Clinic`, `User` e de módulos de agenda/registro indica suporte arquitetural a práticas, não prova adoção atual por clínicas de qualquer porte.

O produto já tem amplitude funcional incomum para um MVP. O risco dominante não é falta de telas: é consolidar confiabilidade do fluxo central, isolamento por tenant, integridade de registro clínico, medição de ativação e clareza de posicionamento antes de ampliar escopo.

## Technology Stack

| Área | Evidência | Estado |
| --- | --- | --- |
| Frontend do produto | React, Vite, TanStack Router e React Query em `frontend-core/` | VERIFIED |
| Landing | React/Vite em `landing-core/`, SEO via `react-helmet-async` | VERIFIED |
| API | Fastify, TypeScript, Zod, Prisma em `backend-core/apps/api/` | VERIFIED |
| IA | FastAPI, LangChain, Hugging Face, OpenRouter, pgvector em `backend-core/apps/ai/` | VERIFIED |
| Dados/Auth | Supabase Postgres/Auth; Prisma e migrations SQL | VERIFIED |
| WhatsApp | gateway Go/chi + Evolution API em `apps/services/whatsapp/` | VERIFIED |
| Pagamentos | AbacatePay e Stripe configuráveis no schema de ambiente e módulo billing | VERIFIED |
| Email | Resend; SMTP como fallback configurável | VERIFIED |
| Deploy | Vercel (apps web) e Render (API/IA) | VERIFIED |
| Observabilidade | Sentry opcional e OTEL configurável na IA | VERIFIED, cobertura desconhecida |
| Cache/filas | Redis e Postgres existem no `docker-compose.yml`; uso em produção/filas não confirmado | UNKNOWN |
| Infra AWS | Terraform existe, mas descreve arquitetura conflitante/legada | VERIFIED como artefato; NÃO é fonte do deploy atual |

## Repository Structure

| Caminho | Papel observado |
| --- | --- |
| `frontend-core/` | SPA autenticada do produto |
| `landing-core/` | site público, blog e captação |
| `backend-core/` | repositório Git separado: API, IA, gateway WhatsApp, Prisma e contratos |
| `supabase/migrations/` | migrations SQL e RLS complementares |
| `.github/workflows/` | CI, deploy, backups, staging e conteúdo |
| `scripts/` | automação de conteúdo/newsletter e utilitários |
| `.geos/` | framework local-first de growth/knowledge |
| `.doc/` | documentação operacional e estratégica anterior, preservada |
| `openspec/` | specs e histórico de mudanças |

## Existing Product Capabilities

| Capacidade | Evidência | Classificação |
| --- | --- | --- |
| Autenticação e recuperação | rotas públicas, Supabase Auth, plugin JWKS | Implemented |
| Gestão de pacientes | rota/hook/módulo `patients`, modelo `Patient` | Implemented |
| Agenda e atendimentos | `appointments`, `agenda.tsx`, `Appointment` | Implemented |
| Prontuário e relatórios | `MedicalRecord`, `Report`, rotas e UI | Implemented; integridade avançada é parcial |
| Plano terapêutico, metas e exercícios | modelos e módulos correlatos | Implemented |
| Biblioteca/RAG e IA | módulos AI/library, pgvector, avaliações | Experimental/Implemented com revisão humana necessária |
| Áudio/transcrição | `AudioSession`, módulo audio e Whisper configurado | Implemented; qualidade operacional requer benchmark contínuo |
| WhatsApp/CRM | gateway, modelos `WaConversation`/`WaMessage`, UI | Partial: integração externa depende de configuração |
| Teleconsulta | `TeleSession`, rotas/hook/UI e migration recente | Implemented; operação em produção precisa validação |
| Billing SaaS | planos, assinaturas, faturas, webhooks | Implemented; preços/entitlements comerciais não confirmados |
| Blog/newsletter/conteúdo | `BlogPost`, `NewsletterSubscriber`, pipeline agendado | Implemented; publicação social permanece com aprovação humana |
| Marketing como módulo do dashboard | removido por decisão registrada em `AGENTS.md` | Deprecated/Removed |

## Existing Domain Model

O schema Prisma confirma entidades clínicas e operacionais: `Clinic`, `User`, `Patient`, `Appointment`, `Report`, `MedicalRecord`, `AudioSession`, `Task`, `Transaction`, `Message`, metas, planos, protocolos, materiais, exercícios, CAA, billing, blog/newsletter e `TeleSession`. Relações e invariantes específicos estão em [Domain Model](../04-domain/01_DOMAIN_MODEL.md); migrations continuam autoritativas.

## Existing Architecture and Journeys

Arquitetura atual é um conjunto de aplicações especializadas, com API Fastify central, banco Supabase/Postgres, serviço IA interno e gateway externo para WhatsApp. A jornada central inferida é: profissional autenticada → paciente → agendamento → sessão/prontuário → relatório/plano/atividades → próximo acompanhamento. Ver [Architecture](../05-architecture/01_ARCHITECTURE_OVERVIEW.md) e [Product](../03-product/01_PRODUCT_STRATEGY.md).

## Findings

| Finding | Evidence | Confidence | Impact |
| --- | --- | --- | --- |
| Produto e backend não são um único workspace pnpm | `backend-core/.git`; root workspace só inclui apps web | High | setup e CI |
| Domínio de saúde contém dados altamente sensíveis | modelos de paciente, prontuário, áudio e IA | High | segurança/LGPD |
| Há controles de borda na API | `@fastify/helmet`, CORS, rate limit e JWKS em `apps/api/src/app.ts` | High | positivo; não substitui testes de autorização |
| CSP e sanitização de HTML existem nos apps web | `frontend-core/vercel.json`, `landing-core/vercel.json`, `landing-core/src/routes/blog/$slug.tsx` com DOMPurify | High | positivo; manter teste/revisão de mudanças |
| Terraform diverge do deploy atual | `terraform/README.md` versus Render/Vercel configs | High | risco de operação |
| Env example raiz ainda cita Notifica | `.env.example`; código/pipeline já usam Resend | High | onboarding e segredo/configuração |
| Google OAuth parece não concluído | registro em `AGENTS.md` aponta no-op no cadastro | Medium | fricção de ativação |
| AI custom domain não resolve | registro operacional em `AGENTS.md` | High | risco de deploy/documentação, não impacto atual interno comprovado |

## Security and Privacy Findings

Há headers, JWT via JWKS, validação Zod, rate limits por rota, secrets via ambiente, RLS/migrations, client `service_role` explicitamente server-side e sanitização DOMPurify antes da renderização de HTML público. Ainda precisam de evidência consolidada: cobertura de testes de autorização cross-tenant, política efetiva de retenção/backups/restore, cobertura de audit log e configuração real de produção de Sentry/OTEL. Não há alegação de conformidade LGPD, SOC 2 ou certificação.

## Documentation Gaps and Open Questions

Os documentos existentes são valiosos, mas distribuídos entre `docs/`, `.doc/` e `openspec/`, sem mapa único. Perguntas materiais: ICP prioritário, modelo comercial/preços efetivos, papéis de clínica, base legal e retenção, políticas de provedores de IA, responsável operacional por incidentes, e estado de staging/credenciais E2E.

## Documentation Outcome

Esta documentação cria uma navegação única, registra conflitos e consolida recomendações sem apagar `.doc/`, `openspec/` ou docs de avaliações existentes. Os maiores riscos e as prioridades estão em [Gap Analysis](02_GAP_ANALYSIS.md) e [Recommendation Backlog](03_RECOMMENDATION_BACKLOG.md).
