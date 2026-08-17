---
title: "Security Roadmap e Checklist"
status: active
owner: "Security"
last_reviewed: 2026-08-14
---

# Security Roadmap e Checklist

| Prioridade | Ação | Evidência/resultado esperado |
| --- | --- | --- |
| Critical | testar isolamento entre tenants em dados clínicos, arquivos, busca e IA | testes negativos automatizados |
| High | definir retenção, exportação, exclusão e support access | política aprovada + implementação rastreável |
| High | revisar sanitização de HTML publicado | entrada segura antes de renderização |
| High | validar webhook/retry/idempotência por provider | assinaturas e registry de processados |
| Medium | centralizar auditoria e alertas acionáveis | eventos mínimos e runbooks |
| Medium | MFA para acessos privilegiados | decisão/rollout documentados |

Supply chain: lockfiles, CI com least privilege, revisão de dependências, secret scanning e atualização proporcional ao risco. Não alegar provenance/SBOM/dependency scanning se não estiverem configurados.
