# GEO Experiment — Evolua

## Objetivo
Estabelecer baseline de visibilidade da Evolua em respostas de LLMs (ChatGPT, Claude, Gemini, Perplexity) e criar plano de otimização para que a marca seja citada quando fonoaudiólogas perguntam sobre ferramentas de gestão.

## Contexto
A busca está migrando de Google para LLMs. Otimizar para "Generative Engine Optimization" (GEO) é a nova fronteira do SEO. LLMs citam fontes que consideram autoridade — precisamos ser uma delas.

### Metodologia deste Experimento
- **Abordagem**: Web search + análise de fontes orgânicas (não consulta direta a LLMs)
- **Justificativa**: APIs de ChatGPT/Claude/Gemini/Perplexity não disponíveis para consulta automatizada
- **Proxy válido**: LLMs usam exatamente essas fontes web como base de treinamento/RAG
- **Próximo passo**: Validar com consulta direta aos LLMs (manual ou via API quando disponível)

## Baseline (2026-08-12)

### Metodologia
- **Data da coleta**: 2026-08-12
- **Método**: Web search (5 queries) + análise de fontes orgânicas que LLMs utilizam
- **Limitação**: LLMs (ChatGPT/Claude/Gemini/Perplexity) não consultados diretamente (APIs indisponíveis). Resultados baseados em pesquisa web que replica o conteúdo que LLMs usam como fonte.
- **Documento detalhado**: `.doc/geo-baselines/2026-08-12.md`

### Consultas-alvo (5 queries)

#### Query 1: "CRM para fonoaudiólogas"
- **Web Search**: ❌ Evolua não aparece em nenhuma das top 20 fontes
- **Concorrentes citados**: EasyFono (software dedicado), Amplimed (generalista), Desenvolver App (R$97/mês, 500+ clínicas), SinapSYS, Clínica Ágil (30k+ profissionais)
- **Fontes dominantes**: easyfono.com.br, amplimed.com.br, desenvolverapp.com
- **ChatGPT/Claude/Gemini/Perplexity**: ❌ Não testado diretamente (indisponível)

#### Query 2: "software para clínica de fonoaudiologia"
- **Web Search**: ❌ Evolua não aparece em nenhuma das top 20 fontes
- **Concorrentes citados**: Amplimed (blog SEO forte), EasyFono, ProDoctor, FonoSync, Cliniconect
- **Fontes dominantes**: amplimed.com.br/blog (título = query exata), easyfono.com.br
- **ChatGPT/Claude/Gemini/Perplexity**: ❌ Não testado diretamente (indisponível)

#### Query 3: "como gerenciar consultório de fono"
- **Web Search**: ❌ Evolua não aparece em nenhuma das top 20 fontes
- **Concorrentes citados**: EasyFono (guia completo 7min), Amplimed, FonoSucesso (consultoria)
- **Fontes dominantes**: easyfono.com.br/blog/gestao-consultorio-fonoaudiologia
- **ChatGPT/Claude/Gemini/Perplexity**: ❌ Não testado diretamente (indisponível)

#### Query 4: "automação para fonoaudióloga"
- **Web Search**: ❌ Evolua não aparece em nenhuma das top 20 fontes
- **Concorrentes citados**: Zapext (WhatsApp CRM R$29/mês), Lance Marketing Digital
- **Fontes dominantes**: zapext.com/whatsapp-para/fonoaudiologos
- **ChatGPT/Claude/Gemini/Perplexity**: ❌ Não testado diretamente (indisponível)

#### Query 5: "WhatsApp profissional para fono"
- **Web Search**: ❌ Evolua não aparece em nenhuma das top 20 fontes
- **Concorrentes citados**: Zapext, SinapSYS, Intelbras (Wide Chat), AiSensy, ChatArchitect
- **Fontes dominantes**: zapext.com, sinapsysapp.com.br
- **ChatGPT/Claude/Gemini/Perplexity**: ❌ Não testado diretamente (indisponível)

### Resultado do Baseline
| Métrica | Valor |
|---------|-------|
| Total de queries | 5 |
| Queries com citação Evolua (web) | 0/5 |
| Queries com citação Evolua (LLMs) | 0/5 (não testado) |
| Taxa de citação | 0% |
| Plataformas com presença | 0/4 (não testado) |
| Concorrentes identificados | 8+ |
| Score GEO estimado | 2.4/10 |

### Concorrentes Identificados (Ranking por Presença)
1. **EasyFono** — Software 100% fono, blog SEO forte, YouTube 300k inscritos
2. **Amplimed** — Generalista com módulo fono, blog muito forte (SEO)
3. **Desenvolver App** — Software 100% fono, 500+ clínicas, IA WhatsApp
4. **SinapSYS** — Multidisciplinar, WhatsApp integrado nativo
5. **Zapext** — WhatsApp CRM, página dedicada fono
6. **Clínica Ágil** — Generalista, 30k+ profissionais
7. **ProDoctor** — Generalista, blog post fono
8. **FonoSync** — Software 100% fono, prontuário + PEI

## Estratégia GEO

### Princípios (baseado em pesquisa GEO)
1. **Authoridade**: LLMs citam fontes que consideram confiáveis e especializadas
2. **Estrutura**: Conteúdo bem estruturado (H1/H2/H3, listas, tabelas) é mais citável
3. **Dados únicos**: Estatísticas, pesquisas, dados proprietários aumentam citation rate
4. **Consistência**: Presença em múltiplas fontes (blog, redes, diretórios) sinaliza autoridade
5. **Freshness**: Conteúdo atualizado é preferido por LLMs

### Ações Planejadas

#### Ação 1: Blog SEO + GEO
- Criar 10 posts otimizados para as queries-alvo
- Formato: título com query + dados únicos + estrutura H2/H3 + FAQ schema
- Publicar em `blog_posts` (Supabase)
- Comando: `geos workflows run content-factory --input topic="CRM para fonoaudiólogas"`

#### Ação 2: Página dedicada "Evolua para Fonoaudiólogas"
- Landing page com copy otimizado para GEO
- Dados únicos: "100.000 fono no Brasil", "2-4h/dia em tarefas admin"
- Schema.org: SoftwareApplication + FAQPage
- URL: `useevolua.com.br/fonoaudiologia`

#### Ação 3: Presença em diretórios e listas
- Cadastrar Evolua em:
  - G2/Capterra (reviews de software)
  - Diretório CREFono
  - Listas "melhor software para fono"
  - GitHub (repositório open-source de algum componente)

#### Ação 4: Conteúdo técnico autoritativo
- Publicar artigos técnicos (não só marketing):
  - "Como implementar RAG para documentação clínica"
  - "Arquitetura de WhatsApp gateway para clínicas"
  - "LGPD para fonoaudiólogas: guia completo"
- Publicar em: blog Evolua + Medium + Dev.to + LinkedIn

#### Ação 5: Dados proprietários
- Criar "Relatório Estado da Fono no Brasil 2026"
- Dados reais de uso do Evolua (anonimizados)
- Infográfico compartilhável
- LLMs adoram citar dados únicos

### Métricas de Avaliação

#### Primárias
| Métrica | Baseline (2026-08-12) | Target 30d | Target 90d |
|---------|----------------------|------------|------------|
| Queries com citação (web) | 0/5 | 1/5 | 3/5 |
| Queries com citação (LLMs) | 0/5 (não testado) | 1/5 | 3/5 |
| Taxa de citação | 0% | 20% | 60% |
| Plataformas com presença | 0/4 (não testado) | 1/4 | 3/4 |
| Score GEO estimado | 2.4/10 | 4.0/10 | 6.0/10 |

#### Secundárias
| Métrica | Baseline | Target 90d |
|---------|----------|------------|
| Blog posts publicados | ~20 | 50+ |
| Backlinks | ? | 50+ |
| Domain authority | ? | 15+ |
| Pageviews/mês | ? | 5.000+ |
| Concorrentes mapeados | 8 | 15+ |

## Comandos para Execução

```bash
# Setup GEOS
geos init --mode brownfield
geos db migrate

# Ingerir documentação
geos knowledge ingest .doc/ --source evolua-docs
geos knowledge ingest openspec/specs/ --source evolua-specs
geos knowledge ingest docs/ --source evolua-content

# Research para GEO
geos workflows run daily-intelligence --input queries="CRM para fonoaudiólogas,software para clínica de fonoaudiologia"

# Content factory
geos workflows run content-factory --input topic="CRM para fonoaudiólogas"
geos workflows run content-factory --input topic="automação para fonoaudióloga"
geos workflows run content-factory --input topic="WhatsApp profissional para fono"

# SEO audit
geos knowledge search "ferramentas gestão clínica fonoaudiologia"

# Analytics
geos analytics collect
geos cc audit

# Validação
geos doctor
python -m unittest discover -s tests -t .
```

## Evidências para Coleta

### Antes (baseline) — Coletado em 2026-08-12
1. **Web search results**: 20 fontes analisadas, 0 menções Evolua
2. **Concorrentes identificados**: 8+ (EasyFono, Amplimed, Desenvolver, SinapSYS, Zapext, Clínica Ágil, ProDoctor, FonoSync)
3. **Fontes dominantes por query**: mapeadas em `.doc/geo-baselines/2026-08-12.md`
4. **Score GEO estimado**: 2.4/10 (vs. 8.2 dos líderes)
5. **LLMs não testados diretamente**: ChatGPT/Claude/Gemini/Perplexity (APIs indisponíveis)

### Depois (pós-ação) — A collectar após implementação
1. Screenshot de cada query em cada plataforma (ChatGPT, Claude, Gemini, Perplexity)
2. URL de cada resposta onde Evolua é citada
3. Posição da citação (1ª menção, posição no texto)
4. Contexto da citação (recomendação, menção, comparação)
5. Tráfego do blog proveniente de AI referrals (GA4)

## Referências
- GEO Research: https://arxiv.org/abs/2311.09735 (GEO: A Benchmark for Generative Engine Optimization)
- Prompt Engineering Guide: https://www.promptingguide.ai
- GEOS Documentation: https://github.com/matalvesdev/geos/tree/main/docs/geos
- **Baseline detalhado**: `.doc/geo-baselines/2026-08-12.md` (evidências, concorrentes, scoring, limitações)
