---
title: "Tempo, Agenda e Domínio Clínico"
status: active
owner: "Engineering"
last_reviewed: 2026-08-14
---

# Tempo, agenda e domínio clínico

Agenda é domínio crítico: persistir timestamps em formato consistente, apresentar no locale/timezone da prática e testar recorrência, cancelamento, reagendamento e mudanças de horário. O modelo exato de timezone atual deve ser confirmado nos campos Prisma e contratos antes de mudança.

Estados sugeridos para validação, não implementação declarada: `scheduled`, `confirmed`, `completed`, `cancelled`, `no_show`. Evitar múltiplos booleans contraditórios. Registros clínicos devem manter autor, horário, versão/edição e vínculo inequívoco com paciente/tenant. Não há protocolo clínico ou conduta terapêutica nesta documentação.
