---
title: "Backlog de Recomendações"
status: active
owner: "Founder"
last_reviewed: 2026-08-17
---

# Backlog de recomendações

| ID | Área | Recomendação | Evidência | Impacto | Esforço | Prioridade | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| REC-001 | Segurança | testar e reforçar isolamento de tenant por recurso e rota | validações de paciente/clínica aplicadas em agenda e relatório | crítico | médio | P0 | In progress |
| REC-002 | Produto | definir e instrumentar fluxo de primeiro valor | amplo conjunto de módulos, sem evento de ativação confirmado | alto | médio | P0 | Proposed |
| REC-003 | IA | instituir avaliação humana/versionamento para ASR, RAG e rascunhos | `docs/ai-evals/`, providers IA | alto | médio | P0 | Proposed |
| REC-004 | Configuração | corrigir README, `.env.example` e Terraform legados | conflitos descobertos | alto | baixo | P1 | Proposed |
| REC-005 | Privacidade | validar retenção, direito de exclusão e subprocessadores com jurídico | dados sensíveis | alto | médio | P1 | Needs validation |
| REC-006 | Operação | resolver DNS do AI e executar staging/E2E autenticado após entrega do `develop` | secrets de staging confirmados; DNS de IA ainda ausente | médio | baixo | P1 | Blocked by remote delivery/DNS |
| REC-007 | Growth | validar ICP, wedge e mensagem com entrevistas | estratégia sem tração verificável | alto | médio | P1 | Proposed |
| REC-008 | Observabilidade | separar logs, audit logs e analytics e definir alertas | cobertura atual desconhecida | alto | médio | P1 | Proposed |
| REC-009 | Segurança web | manter teste/revisão da sanitização de HTML do blog | DOMPurify antes de `dangerouslySetInnerHTML` | médio | baixo | P2 | Control observed |
| REC-010 | Arquitetura | manter monólito modular e medir gargalos antes de extrair serviços | código já dividido por módulos | médio | baixo | P2 | Proposed |
| REC-011 | Growth/Brand | remover ou comprovar claims de tração, resultados, depoimentos e conformidade na landing | smoke Playwright em 2026-08-17 encontrou claims sem fonte rastreável | crítico | baixo | P0 | Needs founder/marketing validation |
| REC-012 | Segurança/Configuração | revogar e remover credenciais legadas de provider descontinuado dos ambientes privados | configuração local do backend ainda contém variáveis sem consumo no código | alto | baixo | P0 | Manual secret rotation required |
