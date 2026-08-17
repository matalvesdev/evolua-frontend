---
title: "Matriz de Prioridade"
status: active
owner: "Founder"
last_reviewed: 2026-08-14
---

# Matriz de prioridade

| Quadrante | Ações |
| --- | --- |
| Alto impacto / baixo esforço | alinhar README/env/infra; fechar DNS IA; validar HTML sanitizado; registrar eventos de ativação mínimos |
| Alto impacto / alto esforço | testes de isolamento por tenant; ciclo de vida de dados/LGPD; validação E2E autenticada; avaliação contínua de IA |
| Baixo impacto / baixo esforço | consolidar glossário, links e templates; melhorar empty/error copy conforme auditoria |
| Baixo impacto / alto esforço | microsserviços, Kubernetes, app nativo, marketplace, data warehouse — não priorizar sem evidência |

## Top 10 próximos movimentos

1. Provar autorização e isolamento de tenant nos fluxos clínicos.
2. Testar e medir paciente → agenda → sessão → prontuário/relatório.
3. Validar ICP e problema por entrevistas sem dados de pacientes.
4. Definir política de IA/áudio/retencão com revisão jurídica e de fornecedores.
5. Corrigir fontes de configuração legadas.
6. Completar credenciais de staging/E2E e smoke deploy.
7. Definir eventos de ativação, retenção e qualidade.
8. Estabelecer versão/auditoria de registros e rascunhos IA.
9. Testar mensagem e landing para o wedge escolhido.
10. Operar backlog por evidência, não por quantidade de módulos.
