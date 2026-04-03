---
name: marketing-orchestrator
description: 'Use when: executar pipeline completo de campanha de marketing em sequência: trend-analysis → content-generation → media-generation → social-publish → lead-capture → lead-scoring → outreach → analytics → optimization. Retorna status por etapa e outputs consolidados. Chama marketingOrchestrator() de skills/marketing-orchestrator.skill.ts.'
---

# Marketing Orchestrator

Executa o pipeline completo de campanha de marketing, encadeando todas as skills em sequência com log estruturado por etapa e tratamento de falha rastreável.

## Quando usar

- Lançar uma campanha de marketing do zero (end-to-end).
- O usuário fornece `campaignId` e parâmetros das etapas principais.
- Precisa de visibilidade total do status de cada passo em uma única chamada.

## Pipeline

```
trend-analysis
  → content-generation   (brief enriquecido com tendências)
  → media-generation
  → social-publish       (posts gerados automaticamente se não fornecidos)
  → lead-capture
  → lead-scoring         (leadId vindo do lead-capture)
  → outreach             (contatos derivados do lead-capture)
  → analytics
  → optimization
```

## Input principal

```ts
{
  campaignId: string;
  trendAnalysis: TrendAnalysisInput;
  contentGeneration: ContentGenerationInput;
  mediaGeneration: MediaGenerationInput;
  socialPublish?: { posts?: SocialPost[] };   // opcional, gerado automaticamente
  leadCapture: LeadCaptureInput;
  leadScoring: Omit<LeadScoringInput, "leadId">;
  outreach: OutreachInput sem campaignId/contacts;  // contacts opcionais
  analytics: AnalyticsInput;
  optimization: OptimizationInput;
}
```

## Output

```ts
{
  campaignId: string;
  status: "completed" | "failed";
  steps: StepStatus[];          // ok, at, error por etapa
  outputs?: { ... };            // outputs de todas as skills
  failedStep?: StepName;
  generatedAt: string;
}
```

## Implementação

Código executável em [skills/marketing-orchestrator.skill.ts](../../../skills/marketing-orchestrator.skill.ts).  
Todas as deps das sub-skills podem ser injetadas via `MarketingOrchestratorDeps`.

## Skills encadeadas

Cada etapa é documentada na sua própria skill:

- [trend-analysis](../../skills/trend-analysis/SKILL.md)
- [content-generation](../../skills/content-generation/SKILL.md)
- [media-generation](../../skills/media-generation/SKILL.md)
- [social-publish](../../skills/social-publish/SKILL.md)
- [lead-capture](../../skills/lead-capture/SKILL.md)
- [lead-scoring](../../skills/lead-scoring/SKILL.md)
- [outreach](../../skills/outreach/SKILL.md)
- [analytics](../../skills/analytics/SKILL.md)
- [optimization](../../skills/optimization/SKILL.md)
