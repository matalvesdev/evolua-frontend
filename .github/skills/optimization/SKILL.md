---
name: optimization
description: 'Use when: priorizar backlog de experimentos de marketing por impacto/esforço, identificar quick wins para sprint atual e definir próxima data de revisão. Chama optimization() de skills/optimization.skill.ts.'
---

# Optimization

Prioriza experimentos do backlog pela razão impacto/esforço, retorna plano ordenado, lista de quick wins e data da próxima revisão.

## Quando usar

- Planejar quais experimentos de marketing executar no próximo sprint.
- Identificar ações de alto impacto e baixo esforço rapidamente.
- Etapa final do pipeline do `marketing-orchestrator` após analytics.

## Input

```ts
{
  objective: string;
  currentMetrics: {
    ctr: number; // click-through rate %
    cpl: number; // custo por lead
    conversionRate: number; // taxa de conversão %
  }
  experimentsBacklog: Array<{
    id: string;
    hypothesis: string;
    expectedImpact: number; // 0-100
    effort: number; // 1-10
  }>;
}
```

## Output

```ts
{
  priorityPlan: Array<{
    experimentId: string;
    priorityScore: number;      // expectedImpact / effort
    recommendation: string;
  }>;
  quickWins: string[];          // top 3 ações para o sprint
  nextReviewDate: string;       // ISO date +7 dias
}
```

## Implementação

Código executável em [skills/optimization.skill.ts](../../../skills/optimization.skill.ts).  
Deps injetável: `rankExperiments` — substitui por modelo de priorização avançado.
