---
title: "Arquitetura, Ciclo de Vida e Banco de Dados"
status: active
owner: "Engineering"
last_reviewed: 2026-08-14
---

# Arquitetura de dados

Supabase/Postgres é a persistência confirmada, com Prisma no backend e migrations em `backend-core/prisma` e `supabase/migrations`. O schema contém entidades de clínica, paciente, registro clínico, áudio, comunicação, billing e growth. `pgvector` é evidenciado pelos módulos/migrations de biblioteca/RAG.

## Classificação

| Classe | Exemplos | Regra |
| --- | --- | --- |
| Public | blog publicado | conteúdo aprovado para publicação |
| Internal | configuração não secreta, métricas agregadas | acesso interno limitado |
| Confidential | conta, billing, leads | mínimo necessário |
| Sensitive | contato, mensagens | acesso por finalidade |
| Highly Sensitive | prontuário, áudio, transcrição, plano/escala clínica | tenant+papel, auditoria e retenção explícita |

## Ciclo de vida — Proposed controls

Coletar → validar → armazenar com escopo → usar para finalidade definida → reter pelo período aprovado → exportar/excluir com autorização e audit → expirar backups conforme política. Retenção, soft/hard delete, legal hold e direitos de titulares requerem validação jurídica. Backups também são altamente sensíveis; backup sem restore testado não é proteção completa.

## Migrations e integridade

Migrations são código de produção: pequenas, versionadas, observáveis e reversíveis quando possível. Para mudanças de alto risco: backup, migration forward-compatible, backfill, verificação e plano de rollback. Regras críticas devem usar constraints/transações quando o banco puder garanti-las. Não alterar produção manualmente sem registro.
