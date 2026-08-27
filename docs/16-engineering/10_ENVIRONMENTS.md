---
title: "Ambientes, CI/CD e Configuração"
status: active
owner: "Engineering"
last_reviewed: 2026-08-27
---

# Ambientes, CI/CD e Configuração

Local, produção e staging são evidenciados por scripts/workflows/render config; preview deve ser conferido por projeto Vercel. Produção não deve fornecer credenciais por padrão ao local, e dados reais não devem ser copiados para inferiores sem minimização/anônimização/aprovação.

CI/deploy existentes incluem build/typecheck/lint por path, deploy Vercel/Render, migrations, backup e content pipeline. Staging/E2E autenticado tem secrets pendentes documentados no `AGENTS.md`. Variáveis devem ser documentadas por nome/finalidade/sensibilidade, nunca valor. `.env.example` raiz contém referências legadas e deve ser corrigido antes de ser usado como onboarding.

API e serviço de IA expõem `GET /version` com metadados públicos mínimos. Os gates de Render devem comparar os 12 primeiros caracteres de `RENDER_GIT_COMMIT` ao SHA do workflow, além de consultar `/readyz`; saúde isolada não comprova que o novo artefato entrou no ar.

Feature flags são úteis apenas para rollout/kill switch temporário: nome, owner, alvo, expiração e cleanup obrigatório. Não há prova de framework de flags atual.
