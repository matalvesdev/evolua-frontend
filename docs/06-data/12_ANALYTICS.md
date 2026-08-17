---
title: "Analytics e Taxonomia de Eventos"
status: active
owner: "Product"
last_reviewed: 2026-08-14
---

# Analytics e Taxonomia de Eventos

Separar logs operacionais, audit logs e product analytics. Não enviar nomes, conteúdo de prontuário, transcrições ou identificadores clínicos a analytics. Evento segue `object_action`, por exemplo `patient_created`, `appointment_created`, `session_completed`, `report_saved`, `subscription_started`.

Cada evento deve definir propósito, trigger, actor pseudonimizado, propriedades permitidas, propriedades proibidas, owner e retenção. Atributos mínimos para funil: source/medium/campaign/landing page, sem combinar com dados clínicos. Cohorts por mês de signup, ativação, segmento e aquisição são aceitáveis; nunca por condição clínica.
