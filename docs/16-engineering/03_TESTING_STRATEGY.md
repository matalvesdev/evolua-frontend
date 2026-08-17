---
title: "Testing, Observability e Resiliência"
status: active
owner: "Engineering"
last_reviewed: 2026-08-14
---

# Testing, Observability e Resiliência

## Testes por risco

Unit: regras puras. Integration: banco e serviços. Contract: API/provider. E2E: login, paciente, agenda, sessão, prontuário/relatório, billing. Security: autorização, tenant isolation e exports. Regressão: bugs críticos. Não perseguir coverage arbitrário; testes flaky são dívida.

## Observabilidade

Separar logs operacionais, audit logs e product analytics. Logs estruturados usam correlation/request ID e não incluem senha, token, header de autorização, cookie completo, segredo, áudio, prontuário ou prompt bruto. Sentry/OTEL estão configuráveis; cobertura real de produção deve ser checada. Alertas são acionáveis, não ruído.

Em 2026-08-14, a revisão removeu PII direta de logs operacionais de caminhos identificados. Isso reduz exposição, mas não substitui uma revisão centralizada de redaction e configuração de provedores.

## Erros e resiliência

Erros de domínio, validação, infraestrutura e provider têm códigos estáveis e mensagem segura ao usuário. Integrações recebem timeout, retry limitado/backoff quando idempotente, idempotency key/unique constraint para efeitos externos e fallback/graceful degradation. Não enfileirar/usar circuit breaker sem necessidade medida. Jobs de conteúdo existem; jobs clínicos/fila não devem ser assumidos.
