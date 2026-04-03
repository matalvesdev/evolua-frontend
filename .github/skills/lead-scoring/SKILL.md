---
name: lead-scoring
description: 'Use when: pontuar um lead (0-100) com base em perfil (cargo, tamanho da empresa, região) e comportamento (e-mails abertos, cliques, visita à página de preços, pedido de demo). Classifica como cold/warm/hot e sugere ação. Chama leadScoring() de skills/lead-scoring.skill.ts.'
---

# Lead Scoring

Pontua leads entre 0 e 100 combinando dados de perfil e sinais de comportamento, retornando tier (cold/warm/hot) e ação sugerida.

## Quando usar

- Priorizar quais leads devem ser enviados para vendas.
- Determinar se um lead entra em sequência de nutrição ou contato direto.
- Etapa após `lead-capture` no pipeline do orchestrator.

## Input

```ts
{
  leadId: string;
  profile: {
    role: string;
    companySize: number;
    region: string;
  }
  behavior: {
    openedEmails: number;
    clickedLinks: number;
    visitedPricingPage: boolean;
    requestedDemo: boolean;
  }
}
```

## Output

```ts
{
  leadId: string;
  score: number;           // 0-100
  tier: "cold" | "warm" | "hot";
  reasons: string[];
  suggestedAction: string;
  scoredAt: string;
}
```

## Lógica de pontuação padrão

| Sinal                    | Pontos   |
| ------------------------ | -------- |
| E-mail aberto            | +5 cada  |
| Link clicado             | +10 cada |
| Visitou página de preços | +20      |
| Solicitou demo           | +35      |
| Empresa > 5 pessoas      | +10      |

- `hot` ≥ 75 → enviar para vendas em 1 hora
- `warm` ≥ 45 → sequência de nutrição
- `cold` < 45 → conteúdo educacional

## Implementação

Código executável em [skills/lead-scoring.skill.ts](../../../skills/lead-scoring.skill.ts).  
Deps injetável: `customScorer` — substitui por modelo de scoring proprietário.
