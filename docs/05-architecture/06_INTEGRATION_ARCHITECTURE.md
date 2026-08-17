---
title: "Integrações, Email, Comunicação e Webhooks"
status: active
owner: "Engineering"
last_reviewed: 2026-08-14
---

# Integrações, email, comunicação e webhooks

| Integração | Finalidade | Dados sensíveis | Falha/controle observado |
| --- | --- | --- | --- |
| Supabase | Auth, Postgres, Storage | alto | RLS/migrations; service role só server-side |
| Evolution API | WhatsApp | alto conforme mensagem | gateway Go; HMAC configurável |
| Hugging Face/OpenRouter | IA | potencialmente muito alto | provider configurável; revisão humana necessária |
| Resend/SMTP | email | contato e conteúdo | Resend primário, SMTP fallback |
| AbacatePay/Stripe | billing | financeiro | secrets e webhooks configuráveis |
| Google Calendar | agenda externa | agenda | configurável; uso efetivo desconhecido |
| Sentry/OTEL | observabilidade | pode receber metadados | DSN/OTEL opcionais; sanitização a validar |

Email deve passar por serviço/template/provider, separar transacional de marketing e suportar bounce/unsubscribe conforme aplicável. Comunicação profissional, paciente e marketing não devem compartilhar permissões ou conteúdo por acidente.

Webhooks: validar assinatura e, quando fornecido, timestamp/replay; persistir identificador processado; executar com idempotência; registrar resultado sem payload sensível. Billing já tem `BillingEvent` e unicidade por provider/external ID como evidência de desenho idempotente.
