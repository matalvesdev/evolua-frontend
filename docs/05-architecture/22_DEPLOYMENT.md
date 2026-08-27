---
title: "Deployment, Confiabilidade e Escala"
status: active
owner: "Engineering"
last_reviewed: 2026-08-27
---

# Deployment, Confiabilidade e Escala

## Current State

Vercel hospeda frontend e landing; Render hospeda API e IA; Supabase hospeda dados/auth. Workflows GitHub cobrem CI, deploys, migrations, staging, conteúdo e backup. O domínio padrão da IA no Render está operacional segundo `AGENTS.md`; `ai.useevolua.com.br` possui pendência de DNS. Em 2026-08-27, o ambiente isolado de staging foi validado de ponta a ponta: Supabase `ca-central-1`, API e IA no Render, aliases permanentes na Vercel e E2E autenticado. Os secrets foram confirmados por nome, sem registrar valores. O workflow `deploy-supabase-migrations-staging.yml` executa somente por despacho manual a partir de `develop`, exige confirmação explícita e usa `DIRECT_URL` do environment de staging.

## Operação segura

Deploy: mudança → CI → review → deploy → health check → observar → rollback. Não cancelar deploys em andamento por concorrência. Migrations SQL usam ledger para evitar reexecução histórica e conexão direta para DDL, conforme runbook existente em `AGENTS.md`. A `DIRECT_URL` local observada aponta para `sa-east-1` e não deve ser usada para staging.

## Pendência de configuração

Uma credencial de provider descontinuado ainda foi observada em ambiente privado local em 2026-08-17. Como não há consumo correspondente no código, a ação correta é revogar a credencial no provider e removê-la de ambientes locais/hosted por um administrador; não registrar valor ou nome da chave em documentação.

## Escala e SLO — Proposed

Medir antes de cache, réplica, sharding, Kubernetes ou microsserviços. Cenários: early/growing/scale devem usar `usuários × frequência × requests × dados`. SLOs internos de disponibilidade, latência e erro devem ser escolhidos após baseline, sem prometer SLA. IA e provedores externos devem degradar: continuar o workflow manualmente quando possível.
