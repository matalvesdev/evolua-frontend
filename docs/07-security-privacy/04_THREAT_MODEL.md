---
title: "Threat Model"
status: needs-review
owner: "Security"
last_reviewed: 2026-08-17
---

# Threat Model — STRIDE

## Escopo e assunções

Escopo: frontend/landing, API, Supabase, IA, WhatsApp, billing, email e operações de suporte. Este é um modelo inicial baseado no repositório; precisa de revisão com owner de produto, infra e jurídico. Ativos: credenciais, dados de paciente/registro/áudio, documentos, billing, tokens, contexto IA e backups.

| Ameaça | Cenário | Impacto | Controles atuais observados | Próximo controle | Prioridade |
| --- | --- | --- | --- | --- | --- |
| Spoofing | token/sessão comprometido | alto | JWT/JWKS, headers | revisão de sessão/MFA para privilégio | alta |
| Tampering | alteração indevida de prontuário | crítico | validação/RLS/audit model | versionamento e testes de autorização | crítica |
| Repudiation | ação sensível sem rastreio | alto | modelo `AuditLog` | eventos mínimos e acesso imutável/restrito | alta |
| Information disclosure | IDOR/cross-tenant, URL de arquivo, contexto IA | crítico | RLS, auth, CSP | testes negativos por recurso e contexto mínimo | crítica |
| Denial of service | abuso de login, IA, upload ou webhook | alto | rate limits por rota | quotas, timeout, alertas/circuito | alta |
| Elevation | papel/admin controlado por input ou metadata | crítico | orientação contra metadata não confiável | matriz de permissões e testes | crítica |
| Prompt injection | documento/mensagem instrui modelo a vazar dados/agir | alto | RAG filtra `clinic_id` antes do ranking; histórico não aceita papel `system` enviado pelo cliente | isolamento, tool policy, human review | alta |
| SSRF na ingestão RAG | URL de documento aponta para rede interna ou metadata | alto | HTTPS, bloqueio de IPs não públicos, sem redirects, download streaming limitado a 25 MB e allowlist obrigatória de hosts em staging/produção (`LIBRARY_INGEST_ALLOWED_HOSTS`) | manter allowlist mínima e revisar antes de cada novo conector | média |
| Spoofing de webhook WhatsApp | POST externo forjado cria inbound/lead ou aciona automação | crítico | gateway limita tamanho, assina o salto interno e exige CIDRs de origem em staging/produção (`EVOLUTION_WEBHOOK_ALLOWED_CIDRS`) | configurar CIDRs reais do ingress/provider e testar o caminho após deploy | alta |

## Fluxo de mitigação

Para toda ação sensível: autenticar → resolver tenant/role no servidor → autorizar recurso → validar entrada → executar com idempotência/transaction quando aplicável → auditar metadados mínimos → responder sem detalhes internos. Incidente: detectar → triar → conter → recuperar → comunicar fatos → postmortem sem culpa.
