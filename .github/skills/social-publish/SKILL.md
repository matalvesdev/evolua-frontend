---
name: social-publish
description: 'Use when: publicar ou agendar posts em redes sociais (instagram, facebook, linkedin, tiktok, x) com mídia associada. Retorna status por publicação. Chama socialPublish() de skills/social-publish.skill.ts.'
---

# Social Publish

Publica ou agenda posts em redes sociais com suporte a mídia, retornando status (published/scheduled/failed) e URL por canal.

## Quando usar

- Publicar ou agendar conteúdo gerado pela skill `content-generation`.
- Associar assets da `media-generation` a posts de campanha.
- Etapa após `media-generation` no pipeline do orchestrator.

## Input

```ts
{
  campaignId: string;
  posts: Array<{
    channel: 'instagram' | 'facebook' | 'linkedin' | 'tiktok' | 'x';
    content: string;
    mediaUrls?: string[];
    scheduledAt: string; // ISO datetime
  }>;
}
```

## Output

```ts
{
  results: Array<{
    channel: string;
    postId: string;
    status: 'published' | 'scheduled' | 'failed';
    url?: string;
    error?: string;
  }>;
  publishedAt: string;
}
```

## Lógica de agendamento

- Se `scheduledAt` for no futuro → status `"scheduled"`.
- Se `scheduledAt` for no passado ou agora → status `"published"`.

## Implementação

Código executável em [skills/social-publish.skill.ts](../../../skills/social-publish.skill.ts).  
Deps injetável: `publishPost` — integra com API real de cada rede social.
