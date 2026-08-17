---
title: "Runbook — Validar migrations em staging"
status: active
owner: "Engineering"
last_reviewed: 2026-08-17
---

# Validar migrations em staging

## Escopo atual

Este runbook cobre as migrations ainda não aplicadas:

- `20260817000003_fix_onboarding_progress_upsert.sql`
- `20260817000004_make_billing_webhooks_retryable.sql`
- `20260817000005_enforce_treatment_session_integrity.sql`

## Pré-requisitos

- Ambiente `staging` isolado, sem usar URL, banco ou secrets de produção.
- `DIRECT_URL` de staging apontando para a porta direta do Postgres, não para o
  pooler PgBouncer.
- Backup/restaurabilidade confirmada para o banco de staging.
- API staging e webhook billing desativados ou apontando somente a providers de
  teste durante a janela.

## Preflight obrigatório

Executar antes da migration de sessões. Se retornar linhas, parar e decidir a
correção de dados; nunca apagar histórico clínico automaticamente.

```sql
SELECT treatment_plan_id, session_number, count(*)
FROM public.treatment_sessions
GROUP BY treatment_plan_id, session_number
HAVING count(*) > 1;
```

Verificar também se a ledger de migrations está inicializada conforme o fluxo
descrito em `.doc/git-flow-runbook.md`; migrations antigas não devem ser
reexecutadas.

## Aplicação

1. Aplicar somente as migrations novas, em ordem lexical e uma transação por
   arquivo.
2. Confirmar que a função `advance_onboarding_progress` existe e que
   `service_role` possui `EXECUTE`.
3. Confirmar a coluna `billing_events.processing_at` e o índice de eventos não
   processados.
4. Confirmar a constraint única de `treatment_sessions`.

## Testes funcionais de staging

- Novo usuário completa duas etapas de onboarding; `completed_steps` preserva
  as duas e `completed` permanece falso até a etapa final.
- Falhar propositalmente um handler de billing de teste, reenviar o mesmo
  `externalId` e confirmar que ele é reprocessado; reenviar após sucesso deve
  ser deduplicado.
- Em duas clínicas diferentes, tentar criar protocolo, escala, tarefa,
  transação, relatório e sessão referenciando dados da outra clínica: todos
  devem falhar sem persistência.
- Disparar duas tentativas concorrentes de registrar a mesma próxima sessão:
  apenas uma deve criar registro e incrementar o plano.

## Critérios de parada e rollback

Parar se houver duplicidade prévia, falha de migration, regressão de tenant
isolation ou erro de API. Não executar DDL manual em produção. Rollback de
schema e de dados deve ser decidido por Engineering após preservar evidências.

## Evidências a registrar

- Identificador do deploy e migration ledger.
- Resultado anonimizado dos testes acima.
- Logs de erro sem conteúdo clínico, telefones, e-mails ou tokens.
