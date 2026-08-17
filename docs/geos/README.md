# GEOS — Evolua V2

> Inicializado por `geos init` — modo **BROWNFIELD**, instalação **SIDECAR**.
> Documento vivo. Última auditoria: **2026-08-13**.

## Visão Geral

GEOS (Growth, Education & Organizational System) é o framework de crescimento da Evolua.
Opera em `brownfield mode` (não modifica código do produto), com storage SQLite local-first
(`.geos/geos.db`, schema v16) e workflows declarativos com aprovação humana.

- **Framework**: [github.com/matalvesdev/geos](https://github.com/matalvesdev/geos)
- **Versão**: v0.15.0
- **Config**: `.geos/geos.yaml`
- **DB**: `.geos/geos.db` (SQLite + FTS5 + hash embeddings)
- **Experimento GEO**: `.doc/geo-experiment.md` + `.doc/geo-baselines/`

## Environment & Doctor (2026-08-13)

```bash
# Versão
& ".geos/.venv/Scripts/geos.exe" --version
# → geos v0.15.0 — AI Agent Framework for Growth

# Doctor
& ".geos/.venv/Scripts/geos.exe" doctor
# ── GEOS Doctor ──────────────────────────────
#   + Python >= 3.11 — 3.14
#   + PyYAML
#   + SQLite >= 3.35 (FTS5) — 3.50.4
#   + Config — .geos/geos.yaml
#   + Database — .geos/geos.db at schema v16
#   + Workspace writable
#   [ALL CHECKS PASSED]

# Self-audit
& ".geos/.venv/Scripts/geos.exe" cc audit
# → 100.0% score (6 passed, 0 warnings, 0 errors)
```

## Knowledge Layer (2026-08-13)

Ingestão executada nesta auditoria:

```bash
geos knowledge ingest .doc/  --source evolua-company   # 0 arquivos via caminho direto (ver Limitações)
geos knowledge ingest openspec/ --source evolua-openspec  # files=28 added=28 chunks=34
geos knowledge ingest docs/   --source evolua-docs     # files=37 added=0 updated=1 unchanged=36
```

> **Workaround `.doc/`**: o diretório `.doc/` é oculto (inicia com `.`). O filtro em
> `geos/intelligence/knowledge.py:53` (`not any(part.startswith(".") for part in p.parts)`)
> exclui todo path com parte oculta → `files=0`. Workaround **dentro do workspace**:
> copiar `.doc/*.md` → `_geos-ingest-doc/`, ingerir com `--source evolua-company`, remover staging.
> Resultado: **files=13 added=2 updated=1 unchanged=10** (adicionados `automation-marketing-audit.md`
> e `marketing-organic-ecosystem.md` — os 2 maiores docs de marketing, antes ausentes).

### Contagens reais (SQLite `.geos/geos.db`)

| Métrica | Valor |
|---------|-------|
| Documents | **163** |
| Document chunks | **940** |
| Embeddings (hash determinístico) | **940** |
| Knowledge nodes (graph) | **70** |
| Knowledge edges (graph) | **75** |

| Source | Docs |
|--------|------|
| `project://` (legado, ingestões anteriores) | 57 |
| `evolua-docs://` | 37 |
| `evolua-openspec://` (nova nesta auditoria) | 28 |
| `evolua-specs://` (legado, label antiga de openspec) | 28 |
| `evolua-company://` | 13 |

> **Hygiene**: labels duplicadas (`project://` x `evolua-company://`, `evolua-specs://` x
> `evolua-openspec://`) são resquício de ingestões com sources diferentes nas sessões anteriores.
> Nada foi deletado (preservação). Recomenda-se consolidar para um único label por diretório.

### Buscas de validação (5 target_queries)

| Query | Resultados | Top source | Cobertura |
|-------|-----------|------------|-----------|
| CRM para fonoaudiólogas | 10 | `produto.md` (project + evolua-company) | ✅ |
| software para clínica de fonoaudiologia | 10 | `campaign-config.md`, `_customer-research.md` | ✅ |
| como gerenciar consultório de fono | 6 | `marketing-organic-ecosystem.md` (novo) | ✅ |
| automação para fonoaudióloga | 8 | `calendario-editorial.md` | ✅ |
| WhatsApp profissional para fono | 10 | `calendario-editorial.md`, `marketing-organic-ecosystem.md` | ✅ |

## Knowledge Graph (SPEC-013)

```bash
geos graph extract
# → 163 docs | nodes=70 edges=75
#   COMPANY=1 CONTENT=56 INSIGHT=2 PRODUCT=1 TOPIC=10

geos graph inspect
# → nodes=70 edges=75 (mesmos)
```

> 2 nós `INSIGHT` foram criados pelo run de research (ver abaixo) — o graph evolui com a atividade.

## Workflows Audit (SPEC-007)

`geos workflows list` → 4 workflows declarativos (em `.geos/geos-repo/workflows/`):

| Workflow | Steps | Trigger | Status da auditoria |
|----------|-------|---------|---------------------|
| `content-factory` | 7 (research→knowledge→brief→draft→social→approval→schedule) | cron `0 7 * * 1` | ✅ Definido, **não testado** (inputs mock `"origem de crédito bancário"`) |
| `content-idea` | 4 (research→brief→approval→social) | manual | ✅ **Testado**: `WAITING_APPROVAL` no gate `publish` (respeitou aprovação humana) |
| `daily-intelligence` | 6 (research→knowledge→draft→brand→social→approval) | cron `0 8 * * 1-5` | ✅ Definido (comentário no YAML: cron wiring não implementado, rodar manual) |
| `hello` | 2 (echo→approval) | manual | ✅ **Testado**: `SUCCESS` (trace `8a349ab1...`) |

```bash
geos workflows run hello --input message="auditoria GEOS 2026-08-13"
# → status: SUCCESS  (say ✅, gate ✅)

geos workflows run content-idea
# → status: WAITING_APPROVAL (research ✅, brief ✅, publish ⏳, social ⏭ SKIPPED)
#   Criou content item DRAFTED "Conciliação bancária" (score=0.56)
```

### Telemetria de runs

```bash
geos runs list
# → 2 run(s): content-idea (WAITING_APPROVAL), hello (SUCCESS)
```

> **Observação**: os inputs dos steps em `content-idea`/`content-factory`/`daily-intelligence`
> estão **hardcoded** no YAML (ex.: `research.summary topic="conciliação bancária"`) e não usam
> `$ref inputs.*`. O `--input` do CLI não sobrescreve esses valores — o workflow não é
> parametrizável por CLI nesta versão.

## GEO Experiment (SPEC-034) — 2026-08-13

### Baseline GEO real

Limitação registrada honestamente: **GEOS v0.15.0 NÃO automatiza consultas externas a LLMs**
(ChatGPT/Claude/Gemini/Perplexity) nem web search. `geos research run` executa research sobre a
**base local** com síntese determinística:

```bash
geos research run "CRM para fonoaudiólogas" --sources-limit 5
# → status=COMPLETED | mock=True | empty=False
#   sources: produto.md (project), produto.md (evolua-company), legendas-meta.md, geo-experiment.md x2
#   insights: OBSERVATION (conhecimento local associa query a produto) + HYPOTHESIS
```

O `mock=True` confirma: síntese gerada por template determinístico, sem pesquisa externa.
**Portanto, o baseline de citação Evolua permanece o manual de 2026-08-12** (`0/5`, score 2.4/10)
— não foram inventadas respostas novas.

### Oportunidades GEO (uma por target_query)

| Query | Oportunidade | Status |
|-------|--------------|--------|
| CRM para fonoaudiólogas | `a60b9f72…` (research collect) | **EXPERIMENTING** |
| software para clínica de fonoaudiologia | `488dd60c…` (manual, RICE 3.6) | OPEN |
| como gerenciar consultório de fono | `9e28bb1c…` (manual, RICE 3.6) | OPEN |
| automação para fonoaudióloga | `74d07715…` (manual, RICE 6.0) | OPEN |
| WhatsApp profissional para fono | `98e45eca…` (manual, RICE 7.0) | OPEN |

### Experimento criado

```bash
geos experiments create a60b9f723e604235885400e1797422d6 \
  --metric geo_citation_rate --change 0.2 \
  --hypothesis "Conteúdo otimizado para as 5 target_queries (blog + landing + diretérios) eleva citation rate Evolua de 0% para 20% em 90 dias"
# → created e467166b75054a7eaf689f1166413682 | PROPOSED | metric=geo_citation_rate

geos experiments list
# → 1 experimento: PROPOSED geo_citation_rate
```

> **Próximo passo**: quando as ações de conteúdo forem implementadas, usar
> `geos experiments status <id> --status RUNNING` e `geos experiments complete <id>`
> para fechar o ciclo com learning.

## SEO Audit (SPEC-023) — 2026-08-13

### Antes (3 críticos → 0 depois)

```bash
geos seo audit   # antes da correção
# → total=400 critical=3 warning=160 info=237  (scopes=docs, content)
#   [critical] broken_link → 'evolua-company://..\docs\BRAND-KIT.md'
#   [critical] broken_link → 'evolua-company://..\docs\competitive-intelligence\_summary.md'
#   [critical] broken_link → 'evolua-docs://..\.doc\marketing-organic-ecosystem.md'  (calendario-editorial.md)

geos seo issues  # → 200 issue(s) registradas (info content_gap, warning orphan, ...)
```

Os 3 `broken_link` críticos eram links Markdown **cross-source** (path relativo
`..\docs\...` / `..\.doc\...`) resolvendo para fora do diretório de origem — o quebrado em
`.doc/marketing-organic-ecosystem.md` para `docs/`, e em `docs/calendario-editorial.md` para
`.doc/`. Fix compatível com sources separadas: convertidos para **referências textuais com path
em backticks** (sem link), preservando rótulos e conteúdo.

```bash
geos seo audit   # depois da correção
# → total=412 critical=0 warning=164 info=248  (scopes=docs, content)
```

### Alterações aplicadas

| Doc | Antes (link quebrado) | Depois (referência textual) |
|-----|----------------------|-----------------------------|
| `.doc/marketing-organic-ecosystem.md` §1.2 | `[BRAND-KIT.md](../docs/BRAND-KIT.md)` | `` `BRAND-KIT.md` `` |
| `.doc/marketing-organic-ecosystem.md` §1.1 | `[competitive-intelligence/_summary.md](../docs/competitive-intelligence/_summary.md)` | `` `competitive-intelligence/_summary.md` `` |
| `.doc/marketing-organic-ecosystem.md` §5.2 | `[_summary.md](../docs/competitive-intelligence/_summary.md)` | `` `_summary.md` `` |
| `docs/calendario-editorial.md` | `[.doc/marketing-organic-ecosystem.md](../.doc/marketing-organic-ecosystem.md)` | `` `.doc/marketing-organic-ecosystem.md` `` |

Reingestão dos dois docs: `.doc/marketing-organic-ecosystem.md` via staging
(`_geos-ingest-doc/` → `--source evolua-company`, removido após) e `docs/` via path direto
(`--source evolua-docs`). Resultado: `marketing-organic-ecosystem.md` updated=1,
`docs/` updated=2.

## Analytics Engine (SPEC-035) — 2026-08-13

```bash
geos analytics collect
# → snapshot d68d2ac0… | 21 métricas | 2 insight(s)
#   [INVESTIGATION] 3 issue(s) crítica(s) de SEO pendente(s) — revisar auditoria
#   [OBSERVATION  ] 11 oportunidade(s) priorizada(s) aberta(s) — considerar transformar as top em experimentos

geos analytics metrics
```

Métricas-chave do snapshot:

| Métrica | Valor | | Métrica | Valor |
|---------|-------|-|---------|-------|
| seo_issues_total | 401 | | opportunities_open | 11 |
| seo_issues_critical | 3 | | research_runs | 1 |
| insights_total | 2 | | experiments_running | 0 |
| workflow_runs | 0 (antes de teste) | | content_total | 1 |

> Blog/social/crm/leads todos zerados — consistente com `brownfield` + `shadow mode` dos domínios.

## Estado do DB pós-auditoria

```sql
-- via .geos/.venv/Scripts/python.exe (sqlite3)
documents=163  document_chunks=940  embeddings=940
knowledge_nodes=70  knowledge_edges=75
research=1  experiments=1  opportunities=15  approvals=2  runs=2  content=1
```

## Limitações Honestas (v0.15.0)

1. **Sem consulta externa automatizada**: research é local-only (`mock=True`), sem web search nem APIs de LLMs. Baseline GEO externo segue manual.
2. **Diretórios ocultos são ignorados**: `.doc/` exige workaround de staging (documentado acima).
3. **Workflows não parametrizáveis via CLI**: inputs dos steps são hardcoded no YAML.
4. **Cron declarativo sem wiring**: `daily-intelligence`/`content-factory` têm trigger cron no YAML, mas o agendamento real (SPEC-006) não está ligado.
5. **Labels duplicadas no knowledge**: `project://`/`evolua-company://` e `evolua-specs://`/`evolua-openspec://` para o mesmo conteúdo.
6. **Embeddings por hash**: provider `hash` (determinístico, barato) — sem semântica vetorial de verdade; RAG híbrido pleno depende de provider `openai` configurado.

## Riscos

| Risco | Severidade | Mitigação |
|-------|-----------|-----------|
| Docs de marketing com links cross-source quebrados → prejudicam audit SEO | Média | ✅ **Resolvido 2026-08-13**: 3 links convertidos para referências textuais em backticks (`critical=3→0`) |
| Knowledge com duplicidade de sources → busca retorna duplicados | Baixa | Consolidar labels numa próxima reingestão |
| Baseline GEO sem consulta direta a LLMs → métrica pode divergir do real | Média | Validar manualmente 1 query em cada plataforma |
| Dependência de `.doc/` staging para reingestão | Baixa | Documentar workaround; ou mover docs para path visível |

## Próximos Experimentos

1. **GEO citation baseline v2** (experimento `e467166b…`): implementar ações do `geo-experiment.md` (10 posts otimizados, landing `/fonoaudiologia`, diretórios Capterra/G2) e re-medir citation rate em 90d.
2. **SEO link-fix** (3 críticos): ✅ **Feito 2026-08-13** — links cross-source convertidos para referências textuais em backticks; `seo audit` pós-fix → `critical=0`.
3. **SEO content-gap**: as 10 oportunidades `content_gap` (tópicos sem conteúdo: pix, crédito, reconciliação, etc.) → transformar top em experimentos via `experiments create`.
4. **Content-factory end-to-end**: rodar `content-factory` e validar research→brief→draft→social com aprovação real (requer topic parametrizável).
5. **Reingestão consolidada**: re-ingerir `.doc/`, `openspec/`, `docs/` com um único label por dir e dropar labels legadas (após aprovação).

## Referências

- `.doc/geo-experiment.md` — experimento GEO (objetivo, baseline 2026-08-12, estratégia)
- `.doc/geo-baselines/2026-08-12.md` — baseline manual detalhado (concorrentes, scoring, gap analysis)
- `.doc/geo-baselines/2026-08-13.md` — auditoria GEOS + baseline desta sessão
- `AGENTS.md` — contexto organizacional GEOS
- GEOS specs: `.geos/geos-repo/docs/geos/specs/` (SPEC-007 Workflows, SPEC-013 Graph, SPEC-021 Research, SPEC-034 Experiments, SPEC-035 Analytics, SPEC-038 Control Center)
