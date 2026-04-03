---
name: trend-analysis
description: 'Use when: identificar tendências de keywords em redes sociais (instagram, tiktok, youtube, linkedin, x), calcular momentum score e gerar recomendações de conteúdo a partir dessas tendências. Chama trendAnalysis() de skills/trend-analysis.skill.ts.'
---

# Trend Analysis

Analisa keywords em múltiplas plataformas sociais por período informado, retornando tópicos com momentum score, sentimento e recomendações de conteúdo.

## Quando usar

- O usuário quer saber o que está em alta para criar conteúdo relevante.
- Primeira etapa do pipeline do `marketing-orchestrator`, antes de `content-generation`.
- Identificar janelas de oportunidade de 48h para publicação.

## Input

```ts
{
  keywords: string[];
  platforms: Array<"instagram" | "tiktok" | "youtube" | "linkedin" | "x">;
  periodDays: number;    // ex: 14
  locale: string;        // ex: "pt-BR"
}
```

## Output

```ts
{
  trends: Array<{
    topic: string;
    momentumScore: number;    // 0-100
    sentiment: "positive" | "neutral" | "negative";
    sampleMentions: number;
  }>;
  recommendations: string[];  // somente tópicos com score ≥ 60 e sentimento não-negativo
  generatedAt: string;
}
```

## Implementação

Código executável em [skills/trend-analysis.skill.ts](../../../skills/trend-analysis.skill.ts).  
Deps injetável: `fetchTrends` — integra com API real (ex: Google Trends, Brandwatch, Sprout Social).

## Procedimento

1. Definir keywords relevantes para o nicho da campanha.
2. Chamar `trendAnalysis(input, deps)`.
3. Injetar `recommendations` no `brief` da skill `content-generation`.
