# Copilot Workspace Instructions

Este workspace usa monorepo com frontend Next.js, backend NestJS e automacoes de marketing em TypeScript.

## Objetivo de produtividade

- Entregar mudancas completas, com verificacao local quando possivel.
- Evitar respostas teoricas quando o pedido for de implementacao.
- Priorizar alteracoes pequenas, seguras e com baixo impacto colateral.
- Sempre confirmar impacto em frontend, backend e skills quando a tarefa tocar mais de uma area.

## Stack e comandos principais

- Frontend: `frontend-evolua` (Next.js)
- Backend: `backend-evolua/backend-evolua` (NestJS + Prisma)
- Skills de agentes: `skills/*.skill.ts`

Sempre que alterar frontend:

1. Rodar lint de frontend
2. Rodar testes de frontend quando relevante

Sempre que alterar backend:

1. Rodar lint de backend
2. Rodar testes de backend quando relevante

## Convencoes obrigatorias

- TypeScript com tipagem forte, evitar `any`.
- Interfaces de entrada/saida explicitas para funcoes de dominio.
- Nomes de arquivos em kebab-case.
- Funcoes assincronas com async/await para I/O.
- Logs estruturados para fluxos de orquestracao e integracao externa.
- Evitar mudancas grandes sem dividir em etapas verificaveis.

## Edicao e seguranca

- Nao reverter alteracoes que nao foram solicitadas pelo usuario.
- Nao usar comandos destrutivos de git sem aprovacao.
- Em mudancas grandes, reportar riscos e validar com testes.

## Respostas no chat

- Responder em PT-BR, objetivo e direto.
- Mostrar caminhos de arquivo alterados.
- Quando nao conseguir executar algo, declarar explicitamente o bloqueio.
- Informar sempre quais validacoes foram executadas (lint, teste, build) e o que nao foi validado.
