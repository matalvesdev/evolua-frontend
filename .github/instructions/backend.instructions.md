---
applyTo: 'backend-evolua/backend-evolua/src/**/*.ts'
description: 'Use when: creating backend endpoints, services, DTOs, and domain logic in NestJS'
---

## Backend Rules

- Controllers devem permanecer finos; regra de negocio no service.
- Validacao de entrada em DTOs com tipagem clara.
- Evitar queries ineficientes e montar resposta explicita.
- Tratamento de erro padronizado e sem vazar detalhes sensiveis.
- Preferir respostas e contratos estaveis para nao quebrar o frontend consumidor.

## Quality Gate

- Rodar `Backend - Lint` apos mudancas relevantes.
- Rodar `Test - Backend` quando alterar regra de negocio.
- Se mexer em schema, validar fluxo Prisma correspondente.
- Se alterar bootstrap/config principal, validar `npm run build` no backend.
