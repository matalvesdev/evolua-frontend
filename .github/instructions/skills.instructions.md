---
applyTo: 'skills/**/*.skill.ts'
description: 'Use when: building reusable agent skills and orchestrators with structured IO'
---

## Skills Architecture

- Cada skill deve ter responsabilidade unica.
- Definir `Input` e `Output` com interfaces explicitas.
- Integracoes externas devem entrar por `Deps` para facilitar testes e mocks.
- Sempre usar async/await.
- Incluir logs estruturados por etapa.

## Reusabilidade

- Evitar acoplamento entre skills fora de orchestrators.
- Reaproveitar tipos exportados em `skills/index.ts`.
- Em orchestracao, registrar status por etapa e erro de forma rastreavel.
- Incluir `exampleUsage` em cada skill para acelerar validacao manual e onboarding.
