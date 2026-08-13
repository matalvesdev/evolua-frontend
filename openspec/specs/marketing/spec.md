# Marketing Domain

> **Status**: Superseded by GEOS Growth Engine (2026-08-12)
> Marketing como módulo isolado foi removido. As capacidades de marketing agora
> operam via GEOS domains (Content, SEO, Social, Email Nurture, Campaigns) com
> workflows executáveis, aprovação humana e analytics determinístico.
> Configuração: `.geos/geos.yaml` | Experimento GEO: `.doc/geo-experiment.md`

## Canais Ativos
- **Blog**: Blog posts em Supabase (`blog_posts`), servidos na landing
- **Instagram**: @useevoluaapp
- **LinkedIn**: Evolua company page
- **Newsletter**: "Fono em Foco" (via Resend)

## Pipeline de Conteúdo (GEOS-orchestrated)
- **Diário**: `scripts/content-pipeline/pipeline.mjs` (Mon-Fri 06:00 BRT)
- **Semanal**: `scripts/content-engine/engine.mjs` (Sat 08:00 BRT)
- **Aprovação**: Obrigatória antes de publicar (blog_publish: required)
- **Distribuição**: Blog (Supabase) + Social (email para postagem manual)

## GEO (Generative Engine Optimization)
- **Baseline**: `.doc/geo-experiment.md` (2026-08-12)
- **Queries-alvo**: 5 queries principais
- **Plataformas**: ChatGPT, Claude, Gemini, Perplexity
- **Target 90d**: 3/5 queries com citação Evolua

## Gaps Remanescentes
- **Bio do Instagram**: Copy criada, não aplicada
- **Post LinkedIn**: Definido, não publicado
- **Calendar execution**: Posts publicados via pipeline mas engagement orgânico zero
- **Meta/Google Ads**: Budget definido (R$2.500/mês), não configurado
- **CSP fix not deployed**: landing-core/vercel.json fix pushed mas Vercel não redeployed
