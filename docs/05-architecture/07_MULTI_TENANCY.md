---
title: "Multi-tenancy e Autorização Arquitetural"
status: active
owner: "Security"
last_reviewed: 2026-08-14
---

# Multi-tenancy

## Current State

`Clinic` e RLS/migrations indicam tenancy compartilhada por dados. O modelo de resolução de tenant, memberships e papéis completos precisa ser tratado como **Needs Validation** até ser demonstrado por schema, políticas e testes de cada recurso.

## Invariante inegociável

Identidade de tenant vem do contexto autenticado e autorizado; nunca apenas de ID recebido do navegador. Toda query, cache key, busca, job, arquivo, exportação, audit log e contexto de IA deve carregar e validar o escopo correto antes de acessar dados.

## Target State — Proposed

`User → Membership/role → Clinic/tenant → resource ownership`. RBAC simples com ownership pode ser suficiente no estágio atual; ABAC/policy engine só quando papéis e compartilhamento exigirem. Testes negativos de tenant são obrigatórios nos recursos clínicos e exports.
