---
title: "Princípios e Workflow de Engenharia"
status: active
owner: "Engineering"
last_reviewed: 2026-08-14
---

# Princípios e workflow

Corretude antes de esperteza; arquitetura simples; limites explícitos; secure-by-default; sistemas observáveis; testes onde o risco vive; mudanças pequenas/reversíveis; migrations são código de produção; documentação faz parte do produto; tecnologia chata costuma ser boa.

Fluxo: issue/spec → branch a partir de `develop` → implementação mínima → testes afetados → review → CI → deploy → observação. Git Flow atual está em `.doc/git-flow-runbook.md`; commits usam convenção convencional. Backend é repo separado: validar e versionar com consciência dessa fronteira.

Antes de mudar: ler spec/domínio, inspecionar implementação/testes, preservar tenancy, não inventar regra clínica, atualizar docs e não reescrever código funcional sem necessidade.
