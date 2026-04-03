---
name: outreach
description: 'Use when: enviar mensagens personalizadas para leads via e-mail, WhatsApp ou LinkedIn usando template com variáveis {{name}} e {{sender}}. Retorna status de despacho por contato. Chama outreach() de skills/outreach.skill.ts.'
---

# Outreach

Despacha mensagens personalizadas para uma lista de contatos usando o canal preferido de cada lead, com substituição de variáveis no template.

## Quando usar

- Enviar follow-up personalizado para leads capturados.
- Disparar comunicação de campanha com template único para múltiplos contatos.
- Etapa após `lead-scoring` no pipeline do orchestrator.

## Input

```ts
{
  campaignId: string;
  contacts: Array<{
    leadId: string;
    name: string;
    email?: string;
    phone?: string;
    preferredChannel: 'email' | 'whatsapp' | 'linkedin';
  }>;
  template: string; // ex: "Oi {{name}}, aqui é {{sender}}. Podemos conversar?"
  senderName: string;
}
```

## Output

```ts
{
  dispatches: Array<{
    leadId: string;
    channel: string;
    status: 'sent' | 'queued' | 'failed';
    externalMessageId?: string;
  }>;
  sentAt: string;
}
```

## Implementação

Código executável em [skills/outreach.skill.ts](../../../skills/outreach.skill.ts).  
Deps injetável: `sendMessage` — integra com provedor real (SendGrid, Twilio, LinkedIn API).

## Variáveis de template suportadas

| Variável     | Substituído por    |
| ------------ | ------------------ |
| `{{name}}`   | `contact.name`     |
| `{{sender}}` | `input.senderName` |
