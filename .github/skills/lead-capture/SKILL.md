---
name: lead-capture
description: 'Use when: capturar e normalizar leads de landing page, instagram, linkedin, webinar ou indicação. Valida consentimento, atribui fila (sales/nurture/review) e retorna leadId. Chama leadCapture() de skills/lead-capture.skill.ts.'
---

# Lead Capture

Captura contatos de leads de diferentes fontes, normaliza os dados (nome, e-mail, telefone) e os encaminha para a fila correta com base no consentimento.

## Quando usar

- O usuário quer registrar um novo lead no funil.
- Um formulário de landing page ou ação social gerou um contato.
- Etapa de lead capture no pipeline do `marketing-orchestrator`.

## Input

```ts
{
  source: "landing_page" | "instagram" | "linkedin" | "webinar" | "referral";
  contact: {
    fullName: string;
    email: string;
    phone?: string;
  };
  consent: boolean;
  tags?: string[];
  metadata?: Record<string, string>;
}
```

## Output

```ts
{
  leadId: string;
  accepted: boolean;
  normalizedContact: { fullName: string; email: string; phone?: string };
  queue: "sales" | "nurture" | "review";
  capturedAt: string;
}
```

## Implementação

Código executável em [skills/lead-capture.skill.ts](../../../skills/lead-capture.skill.ts).  
Deps injetável: `saveLead` — persiste o lead em banco de dados real.

## Procedimento

1. Receber dados do contato e fonte.
2. Confirmar `consent: true` para evitar fila de revisão.
3. Chamar `leadCapture(input, deps)`.
4. Usar o `leadId` retornado como entrada para `lead-scoring` e `outreach`.
