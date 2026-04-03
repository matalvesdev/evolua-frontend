---
name: content-generation
description: 'Use when: gerar copies de marketing multicanal (instagram, linkedin, tiktok, email, blog) com headline, body, hashtags e CTA personalizados para campanha e persona. Chama contentGeneration() de skills/content-generation.skill.ts.'
---

# Content Generation

Gera conteúdo de marketing adaptado por canal com base no objetivo da campanha, persona do público, tom de voz e brief.

## Quando usar

- O usuário pede copy ou texto para redes sociais ou e-mail marketing.
- É necessário criar múltiplas variações de conteúdo para diferentes plataformas.
- Etapa posterior à `trend-analysis` no pipeline do orchestrator.

## Input

```ts
{
  campaignGoal: string;
  audiencePersona: string;
  tone: 'educational' | 'inspirational' | 'promotional' | 'institutional';
  channels: Array<'instagram' | 'linkedin' | 'tiktok' | 'email' | 'blog'>;
  brief: string;
  callToAction: string;
}
```

## Output

```ts
{
  contents: Array<{
    channel: string;
    headline: string;
    body: string;
    hashtags: string[];
    callToAction: string;
  }>;
  generatedAt: string;
}
```

## Implementação

Código executável em [skills/content-generation.skill.ts](../../../skills/content-generation.skill.ts).  
Deps injetável: `generateWithLLM` — substitui a geração padrão por chamada real a um modelo LLM.

## Procedimento

1. Definir `campaignGoal`, `audiencePersona`, `tone`, `channels`, `brief` e `callToAction`.
2. Enriquecer o `brief` com recomendações da `trend-analysis` quando disponível.
3. Chamar `contentGeneration(input, deps)`.
4. Usar os conteúdos gerados como entrada para `media-generation` e `social-publish`.
