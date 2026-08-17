---
title: "Matriz de Permissões — Estado Atual e Proposta"
status: needs-review
owner: "Security"
last_reviewed: 2026-08-17
---

# Matriz de Permissões

## Estado atual — verificado

`User.role` é uma string livre com default `therapist` em
`backend-core/prisma/schema.prisma`. Não há enum, guard ou uso server-side de
papéis nas rotas Fastify. A API atualmente autentica a usuária e resolve o
tenant, mas não diferencia permissões dentro da mesma clínica.

Consequência: papéis não devem ser considerados controles de acesso até que a
matriz abaixo seja aprovada e implementada com guards, RLS e testes.

## Proposta — requer decisão de produto

| Recurso/Ação | Owner/Admin | Professional | Assistant | Billing | Viewer |
| --- | --- | --- | --- | --- | --- |
| Configuração da clínica | administrar | ler | não | não | não |
| Pacientes e agenda | administrar | criar/editar no escopo autorizado | criar/editar administrativo | não | ler limitado |
| Prontuário, áudio e relatórios | administrar | criar/editar próprios; leitura conforme atribuição | não | não | leitura somente se explicitamente aprovada |
| Financeiro e assinatura Evolua | administrar | leitura limitada | não | administrar conforme escopo | ler limitado |
| Exportações clínicas | administrar | solicitar no escopo autorizado | não | não | não |
| Membros e permissões | administrar | não | não | não | não |

## Regras inegociáveis

- A identidade do tenant e do ator vem da sessão autenticada, nunca do corpo
  da requisição.
- Permissão por papel não substitui ownership de paciente, prontuário ou
  recurso clínico.
- Ações sensíveis exigem audit log sem conteúdo clínico completo.
- Valores de `role` desconhecidos devem falhar fechados.

## Caminho de implementação proposto

1. Confirmar papéis e ownership com Product/Founder.
2. Criar enum/migration com backfill conservador de `therapist`.
3. Criar `requirePermission` central no Fastify e aplicá-lo primeiro em
   configurações, billing, exportação e ações destrutivas.
4. Adicionar testes multiusuário e RLS compatível antes do rollout.
5. Liberar gradualmente por feature flag e registrar decisões em ADR.

## Non-goals

- Não introduzir ABAC/policy engine ou organização multi-clínica antes de
  demanda comprovada.
- Não inferir função profissional a partir de nome, CRFa ou dados do cliente.
