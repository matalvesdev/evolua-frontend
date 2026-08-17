---
title: "Visão, Mapa e Estratégia de Produto"
status: active
owner: "Product"
last_reviewed: 2026-08-14
---

# Visão, mapa e estratégia de produto

## Visão

**PROPOSED:** Evolua deve fazer a rotina clínica parecer contínua: encontrar o paciente, saber o próximo atendimento, registrar o que importa e preparar o próximo passo sem trocar de sistema.

## PRFAQ resumido — Proposed

**Headline:** Evolua organiza a rotina de fonoaudiologia em um só fluxo.
**Problema:** informação e tarefas administrativas fragmentam o trabalho.
**Solução:** pacientes, agenda, registros, planos, relatórios e recursos assistidos por IA conectados por contexto.
**Citação hipotética, não evidência:** “Em vez de procurar informações em vários lugares, começo o atendimento sabendo o que preciso fazer.”
**FAQ de segurança:** dados sensíveis exigem acesso autorizado, registros auditáveis e revisão humana de IA. A implementação e requisitos legais ainda precisam validação contínua.

## Mapa atual

| Área | Estado observado | Objetivo de usuário |
| --- | --- | --- |
| Identidade/onboarding | rotas e dashboard onboarding | iniciar uso com dados mínimos |
| Pacientes | implementado | encontrar e organizar pessoas atendidas |
| Agenda/sessões | implementado | planejar e conduzir atendimento |
| Prontuário/relatórios | implementado | registrar e revisar informação clínica |
| Plano/metas/exercícios/materiais | implementado | acompanhar e preparar trabalho terapêutico |
| Comunicação/WhatsApp | parcial conforme integração | reduzir fragmentação operacional |
| Financeiro/billing | implementado | gerir cobrança/assinatura em limites distintos |
| Teleconsulta | implementado recentemente | sessão remota, validação operacional pendente |
| IA/biblioteca | existente | criar rascunho, busca e apoio; profissional decide |

## Jornada central

```mermaid
flowchart LR
  A[Profissional autenticada] --> B[Paciente]
  B --> C[Agendamento]
  C --> D[Sessão]
  D --> E[Prontuário ou relatório]
  E --> F[Plano, exercício ou próximo agendamento]
```

Esse fluxo é inferido de modelos/rotas. Estados e regras devem seguir contratos e testes, não este diagrama.

## Métricas

**Não confirmadas como existentes:** ativação, retenção, receita e qualidade. **Propostas:** tempo ao primeiro fluxo completo; profissionais que completam o workflow central por período apropriado; falhas de salvamento; taxa de revisão/aceitação de rascunhos IA; suporte por etapa. Nunca usar conteúdo clínico como propriedade de analytics.

## Desenvolvimento de produto

`Problema → evidência → hipótese → design → build → medir → aprender`. Toda feature deve ter non-goals, permissões, casos de erro, privacidade, acessibilidade, rollback e métrica proporcional ao risco.
