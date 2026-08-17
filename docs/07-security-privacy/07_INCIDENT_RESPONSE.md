---
title: "Incidentes, Abuso e Checklist"
status: active
owner: "Engineering"
last_reviewed: 2026-08-14
---

# Incidentes, abuso e checklist

## Severidade

- **P0:** exposição/risco grave de dados, indisponibilidade crítica ou integridade clínica comprometida.
- **P1:** fluxo principal indisponível ou degradação de alto impacto.
- **P2:** degradação relevante com workaround.
- **P3:** defeito menor/solicitação.

Fluxo: detectar → triar → conter → mitigar → recuperar → comunicar → aprender. Comunicação é clara, factual e sem especulação. Postmortem é blameless e rastreia ações.

## Checklist de release

- [ ] auth/authorization/tenant isolation revisados
- [ ] segredos fora do Git e logs mascarados
- [ ] HTTPS, CORS, CSP, validação e rate limits revisados
- [ ] upload/export/webhook/IA avaliados quando aplicáveis
- [ ] dependências, backup/restore e incident owner revisados
- [ ] audit e alertas proporcionais ao risco

## Abuso

Login/signup/reset, forms públicos, IA, export e webhooks exigem limites e observabilidade. Aplicar timeout, quota e custo máximo; não usar bot protection ou confirmação excessiva sem ameaça observada. Falhas de transcrição não devem registrar signed URLs, IDs de paciente/sessão ou respostas brutas de provider; a implementação foi endurecida nesse sentido em 2026-08-14.
