---
name: media-generation
description: 'Use when: planejar e enfileirar geração de assets visuais (imagem, vídeo, carrossel) para uma campanha de marketing com direção visual e brand guidelines. Retorna plano de assets e IDs de jobs do provider. Chama mediaGeneration() de skills/media-generation.skill.ts.'
---

# Media Generation

Gera plano de produção de assets visuais e submete jobs ao provider de geração de mídia, com dimensões e prompts derivados da direção visual da campanha.

## Quando usar

- O usuário precisa de imagens, vídeos ou carrosséis para uma campanha.
- Etapa após `content-generation` e antes de `social-publish` no orchestrator.

## Input

```ts
{
  campaignId: string;
  assets: Array<"image" | "video" | "carousel">;
  dimensions: string[];           // ex: ["1080x1350", "1080x1080"]
  visualDirection: string;        // descrição do tom visual
  brandGuidelines: string;        // regras de marca
}
```

## Output

```ts
{
  plan: Array<{
    assetType: "image" | "video" | "carousel";
    prompt: string;
    dimension: string;
    altText: string;
  }>;
  providerJobIds: string[];       // IDs de jobs no provider externo
  generatedAt: string;
}
```

## Implementação

Código executável em [skills/media-generation.skill.ts](../../../skills/media-generation.skill.ts).  
Deps injetável: `requestMediaProvider` — integra com API real (ex: Replicate, Midjourney API, DALL·E).

## Procedimento

1. Definir tipos de asset e dimensões baseados na plataforma alvo.
2. Descrever `visualDirection` e `brandGuidelines` de forma objetiva.
3. Chamar `mediaGeneration(input, deps)`.
4. Usar `providerJobIds` em `social-publish` para associar mídia às publicações.
