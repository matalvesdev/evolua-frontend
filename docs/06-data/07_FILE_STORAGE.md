---
title: "Arquivos, Exportação, Exclusão e Ownership"
status: active
owner: "Security"
last_reviewed: 2026-08-14
---

# Arquivos, exportação, exclusão e ownership

O código contém uso de Supabase Storage para áudio. A configuração de bucket/política/URLs deve ser revisada por ambiente. Arquivos de paciente são privados por padrão; validar tipo/MIME/tamanho, caminho não previsível, autorização server-side, expiração/revogação de download e malware scanning conforme tipos aceitos.

Exports são ações de alto risco: autorização por tenant/recurso, escopo mínimo, processamento assíncrono quando grande, URL temporária, registro de auditoria e expiração. Cancelamento de assinatura não é exclusão de dados. Arquivamento reduz ruído; exclusão exige regras de retenção e impactos em registros assinados/históricos.

## Matriz de ownership — Proposed

| Entidade | Tenant | Visível para | Sensível |
| --- | --- | --- | --- |
| Paciente/registro/áudio | clínica autorizada | profissional autorizada | altamente |
| Billing SaaS | organização | billing/owner autorizado | confidencial |
| Lead/newsletter | marketing permitido | owner de growth | confidencial |
| Audit log | organização/segurança | acesso privilegiado | confidencial |
