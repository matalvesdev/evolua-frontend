---
title: "Operating Model, Riscos e Continuidade"
status: active
owner: "Founder"
last_reviewed: 2026-08-14
---

# Operating Model, riscos e continuidade

Founders podem acumular Product/Engineering/Growth/Customer/Operations inicialmente. Cada função tem owner de decisão, sem exigir organograma precoce. Cadência: revisão semanal de clientes/produto/growth/incidentes; mensal de métricas/roadmap/riscos; trimestral de estratégia e segurança.

## Registro de riscos

| Risco | Exposição | Mitigação | Owner role |
| --- | --- | --- | --- |
| vazamento/cross-tenant | crítica | RLS+server auth+testes negativos | Security/Engineering |
| erro/falha de IA | alta | revisão humana, eval, fallback | AI/Product |
| perda/corrupção de dados | alta | backup, restore test, migration safety | Engineering |
| ICP/mensagem errados | alta | entrevistas e experimentos | Founder/Growth |
| provider outage | média/alta | timeouts, degradação e runbooks | Engineering |
| configuração/deploy divergente | alta | fonte de verdade e validação | Engineering |

## Continuidade e DR

Eventos: outage cloud/DB/provider, regressão de deploy, credencial comprometida e corrupção. Definir RTO/RPO internos apenas após baseline; não prometer. Backups precisam criptografia, acesso mínimo, retenção e restore testado. Runbook: detectar → avaliar impacto → conter → restaurar/validar → comunicar → postmortem.
