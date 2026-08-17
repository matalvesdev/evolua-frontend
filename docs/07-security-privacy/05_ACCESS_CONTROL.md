---
title: "Controle de Acesso, Audit e Integridade Clínica"
status: needs-review
owner: "Security"
last_reviewed: 2026-08-14
---

# Controle de acesso, audit e integridade clínica

## Modelo recomendado

**Current roles: UNKNOWN.** Modelo inicial proposto: owner/admin/professional/assistant/billing/viewer somente quando o produto precisar; cada papel recebe ações por recurso, e ownership restringe dados clínicos. UI não é barreira. Imposição server-side + RLS e testes cross-tenant são mandatórios. Em 2026-08-14, criação de agenda e relatório passou a validar que o paciente pertence à clínica autenticada e ignora o nome de paciente enviado pelo cliente em favor do registro persistido.

## Audit log

Eventos candidatos: login/falha, mudança de permissão, criação/edição/arquivamento de paciente, acesso/exportação sensível, mudança de prontuário, billing, credenciais e configurações críticas. Registrar actor, tenant, ação, recurso, timestamp, fonte e resultado — não conteúdo clínico completo, token ou segredo.

## Integridade clínica

Dados errados podem ser mais perigosos que indisponibilidade. Registros devem ter paciente/tenant/autoria/timestamp inequívocos; edição importante deve preservar trilha/audit e não sobrescrever silenciosamente. Restrições de exclusão, assinatura e retenção precisam validação regulatória/profissional. `AI-generated content is a draft until reviewed and accepted by the professional.`

## Suporte e acesso privilegiado

Acesso de suporte deve ser mínimo, justificado, limitado no tempo e auditado; evitar conteúdo clínico. Admins precisam de controles reforçados e MFA quando disponível. Nunca pedir senha. Impersonation não foi confirmada e não deve ser introduzida sem necessidade e controles explícitos.
