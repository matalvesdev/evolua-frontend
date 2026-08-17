---
title: "Mapa de Fontes de Verdade"
status: active
owner: "Engineering"
last_reviewed: 2026-08-14
---

# Mapa de fontes de verdade

| Assunto | Fonte primária | Fonte complementar |
| --- | --- | --- |
| Comportamento do produto | código e testes | `docs/03-product/` |
| Schema e políticas de dados | `backend-core/prisma/schema.prisma`, `supabase/migrations/` | `docs/06-data/` |
| Contratos de API | `backend-core/contracts/`, rotas Fastify | `docs/05-architecture/` |
| Infra e deploy | `.github/workflows/`, `render*.yaml`, `vercel.json`, Terraform | `docs/05-architecture/22_DEPLOYMENT.md` |
| Estratégia e hipóteses | `docs/01-company/` e `docs/02-market/` | `.doc/` como material histórico/operacional |
| Terminologia | [Ubiquitous Language](04-domain/01_DOMAIN_MODEL.md) | código e contratos |
| Decisões arquiteturais | `docs/18-decisions/` | Git history quando disponível |
| Operação de growth/GEOS | `.geos/`, `.doc/marketing-organic-ecosystem.md` | `docs/11-growth/` |

Quando houver conflito, prevalece nesta ordem: comportamento em runtime/código, migrations/schema, testes, configuração, documentação existente, inferência e proposta. Um comportamento observado pode ser um bug; registre essa possibilidade em vez de tratá-lo automaticamente como intenção.
