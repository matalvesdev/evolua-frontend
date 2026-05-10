# Time de Dados — Índice
**Evolua CRM | Squad de Dados**

---

## Estrutura

```
.agents/data/
├── INDICE.md                    ← Este arquivo
├── agente-data-lead.md          ← Head of Data / coordenação do time
├── agente-engenheiro-dados.md   ← Pipelines, ETL, modelagem
├── agente-analista.md           ← Análise, insights, SQL ad hoc
├── agente-bi.md                 ← Dashboards, visualizações, relatórios
├── agente-ml.md                 ← Machine learning, modelos preditivos
└── agente-qualidade-dados.md    ← Data quality, governança, catalogação
```

---

## Missão do time

Transformar dados brutos do Evolua em **decisões melhores** para:
- O time de produto (o que construir a seguir)
- O time de marketing (quem e como converter)
- O time de CS (quem está em risco de churn)
- O CEO (onde estamos e para onde vamos)

---

## Fontes de dados do Evolua

| Fonte | O que tem | Responsável |
|-------|-----------|-------------|
| PostgreSQL (backend) | Usuárias, prontuários, sessões, relatórios | Engenheiro de Dados |
| Supabase Auth | Logins, sessões, dispositivos | Engenheiro de Dados |
| PostHog / Mixpanel | Eventos de produto, funil, feature usage | Analista |
| Instagram Insights | Alcance, engajamento, seguidores | Marketing / Analista |
| Meta Ads / Google Ads | CPL, ROAS, criativos | Paid Media / Analista |
| Stripe / Financeiro | MRR, churn, LTV | Analista / BI |

---

## Stack de dados

| Camada | Ferramenta | Status |
|--------|-----------|--------|
| Armazenamento | PostgreSQL (Supabase) | Produção |
| Orquestração | dbt (futura) | Planejado |
| BI / Dashboards | Metabase ou Superset | Planejado |
| ML | Python (scikit-learn, pandas) | Planejado |
| Feature tracking | PostHog | Avaliar |

---

## KPIs que o time de dados monitora

### Produto
- DAU / MAU (usuárias ativas diárias / mensais)
- Feature adoption rate por feature
- Time-to-value (tempo até criar primeiro prontuário)
- D7 / D30 / D90 retention

### Negócio
- MRR (Monthly Recurring Revenue)
- CAC por canal
- LTV estimado por coorte
- Churn rate mensal
- NPS por segmento

### Dados
- Data freshness (atualidade dos dados)
- % de registros com campos obrigatórios preenchidos
- Alertas de anomalia ativados
