---
title: "Registro de Dívida Técnica"
status: active
owner: "Engineering"
last_reviewed: 2026-08-14
---

# Registro de dívida técnica

| ID | Área | Evidência | Impacto | Prioridade | Ação |
| --- | --- | --- | --- | --- | --- |
| TD-001 | Config | README/.env raiz legados; Terraform divergente | setup/deploy incorreto | P1 | consolidar fontes de verdade |
| TD-002 | Segurança | sanitização DOMPurify existe no blog/ajuda; cobertura de teste não foi inventariada | regressão de XSS | P2 | manter teste/revisão de source e sanitizer |
| TD-003 | Testes | isolamento cross-tenant não demonstrado transversalmente | exposição de dados | P0 | testes de autorização por recurso |
| TD-004 | Operação | DNS IA e staging/E2E incompletos | confiabilidade de release | P1 | completar configuração humana |
| TD-005 | Produto | Google OAuth documentado como no-op | ativação/frustração | P1 | corrigir ou remover expectativa |
