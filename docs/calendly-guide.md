# Calendly — Integração com Evolua

## Para que serve
Permite que leads agendem uma call de onboarding diretamente pelo site, sem troca de emails.

## Setup

1. Criar conta em calendly.com
2. Criar evento: "Onboarding Evolua — 30min"
3. Configurar disponibilidade (horário comercial, fuso -03:00)
4. Link gerado: `https://calendly.com/evoluacrm/onboarding`

## Onde colocar

| Local | Tipo |
|-------|------|
| Página /cadastro pós-signup | Botão "Agendar onboarding" |
| Página /planos (após trial) | "Quer ajuda? Agende uma call" |
| Email de boas-vindas | CTA principal |
| WhatsApp onboarding | Link enviado automaticamente |
| Footer /ajuda | "Precisa de ajuda? Agende" |

## Integração Técnica

```html
<!-- Inline widget (React-friendly) -->
<div
  className="calendly-inline-widget"
  data-url="https://calendly.com/evoluacrm/onboarding"
  style="min-width:320px;height:700px"
/>

<script
  type="text/javascript"
  src="https://assets.calendly.com/assets/external/widget.js"
  async
/>
```

Ou usar link direto: `https://calendly.com/evoluacrm/onboarding`

## Webhook (opcional)

Calendly pode notificar via webhook quando um agendamento é criado:
- POST para `/api/webhooks/calendly`
- Criar lead em `public.leads`
- Disparar email de confirmação via Notifica
