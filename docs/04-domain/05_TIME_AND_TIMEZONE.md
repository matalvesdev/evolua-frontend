---
title: "Tempo, Agenda e Domínio Clínico"
status: active
owner: "Engineering"
last_reviewed: 2026-08-14
---

# Tempo, agenda e domínio clínico

Agenda é domínio crítico: persistir timestamps em formato consistente, apresentar no locale/timezone da prática e testar recorrência, cancelamento, reagendamento e mudanças de horário. `Clinic.timeZone` é persistido em `clinics.time_zone`, com backfill/default `America/Sao_Paulo`. API usa a timezone resolvida pela clínica autenticada para dashboard, analytics e agenda de hoje; timestamps continuam UTC no banco.

Estados sugeridos para validação, não implementação declarada: `scheduled`, `confirmed`, `completed`, `cancelled`, `no_show`. Evitar múltiplos booleans contraditórios. Registros clínicos devem manter autor, horário, versão/edição e vínculo inequívoco com paciente/tenant. Não há protocolo clínico ou conduta terapêutica nesta documentação.
