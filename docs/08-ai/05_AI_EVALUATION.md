---
title: "Avaliação, Governança e Operação de IA"
status: active
owner: "AI/Engineering"
last_reviewed: 2026-08-14
---

# Avaliação, Governança e Operação de IA

## Template operacional por feature

Definir input/output, modelo e versão de prompt, contexto, exposição de PII/health data, provider, retenção, revisão humana, riscos de alucinação, fallback, custo, latência, métricas, dataset e rollback. Use o [template](templates/AI_FEATURE_TEMPLATE.md).

## Níveis de ação — Proposed

| Nível | Exemplo | Regra |
| --- | --- | --- |
| 0 | busca/sumarização read-only | acesso e contexto mínimo |
| 1 | rascunho | revisão humana obrigatória |
| 2 | ação reversível | autorização e confirmação contextual |
| 3 | ação sensível | confirmação explícita + audit |
| 4 | decisão clínica/crítica | não automatizar autonomamente |

Prompts são código: owner, versão, avaliação, mudança revisada e rollout. Custo considera tokens de entrada/saída, embeddings, retrieval, rerank, storage e retries; roteamento escolhe modelo por risco, precisão, latência e custo, não apenas o menor ou o mais caro.

Falhas de provider devem expor mensagem segura à usuária e não registrar respostas brutas, transcrições, signed URLs ou identificadores clínicos em logs operacionais. Este comportamento foi endurecido no serviço IA em 2026-08-17.
