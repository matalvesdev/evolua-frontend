---
name: analytics
description: 'Use when: analisar métricas de campanhas de marketing, calcular CTR, CPL, taxa de conversão, gerar insights por canal (instagram, linkedin, email, tiktok). Chama a função analytics() de skills/analytics.skill.ts.'
---

# Analytics

Analisa métricas de performance de uma campanha por canal e período, retornando sumário consolidado e insights acionáveis.

## Quando usar

- O usuário pede relatório de desempenho de campanha.
- É necessário calcular impressões, cliques, leads ou conversões acumuladas.
- Parte do pipeline do `marketing-orchestrator` após social-publish e outreach.

## Input

```ts
{
  dateFrom: string;        // ISO date: "2026-03-01"
  dateTo: string;          // ISO date: "2026-03-31"
  channels: string[];      // ex: ["instagram", "linkedin", "email"]
  goals: string[];         // ex: ["leads", "webinar_signups"]
}
```

## Output

```ts
{
  metrics: ChannelMetric[];       // por canal: impressions, clicks, leads, conversions
  summary: {
    totalImpressions: number;
    totalClicks: number;
    totalLeads: number;
    totalConversions: number;
    conversionRate: number;       // percentual
  };
  insights: string[];             // recomendações textuais
  generatedAt: string;
}
```

## Implementação

Código executável em [skills/analytics.skill.ts](../../../skills/analytics.skill.ts).  
Deps injetável: `fetchChannelMetrics` — substitui a lógica padrão por dados reais de uma API de analytics.

## Procedimento

1. Receber `dateFrom`, `dateTo`, `channels` e `goals`.
2. Chamar `analytics(input, deps)` importando de `skills/analytics.skill.ts`.
3. Apresentar `summary` e `insights` ao usuário ou passar para o passo `optimization` no orchestrator.
