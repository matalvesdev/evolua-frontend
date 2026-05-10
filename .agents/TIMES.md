# Times de Agentes — Evolua CRM
**Visão geral de todos os squads e agentes**

---

## Organograma

```
Evolua
│
├── 📣 MARKETING (CMO: João Branco)
│   ├── agente-cmo.md                   ← João Branco: estratégia e prioridades
│   ├── agente-operacoes-conteudo.md    ← Operador em tempo real (Pilar 7 Shibata)
│   ├── agente-legenda.md               ← Copywriting Instagram
│   ├── agente-roteiro-reels.md         ← Roteiros de Reels
│   ├── agente-carrossel.md             ← Carrosséis de conteúdo
│   ├── agente-calendario.md            ← Calendário editorial
│   ├── agente-growth.md                ← Growth hacking e funil
│   ├── agente-crm.md                   ← Email / onboarding / jornada
│   ├── agente-paid-media.md            ← Meta Ads / Google Ads (G4OS)
│   ├── agente-seo.md                   ← SEO e blog
│   └── agente-comunidade.md            ← Parcerias e comunidade
│
├── 💻 DESENVOLVIMENTO
│   ├── agente-tech-lead.md        ← Tech Lead: liderança técnica
│   ├── agente-arquiteto.md        ← Arquitetura de sistema
│   ├── agente-frontend.md         ← Next.js / React / TypeScript
│   ├── agente-backend.md          ← NestJS / Prisma / PostgreSQL
│   ├── agente-mobile.md           ← React Native (roadmap futuro)
│   ├── agente-qa.md               ← Testes automatizados e QA
│   └── agente-seguranca.md        ← Security e LGPD
│
├── 📊 DADOS
│   ├── agente-data-lead.md        ← Head of Data: coordenação
│   ├── agente-engenheiro-dados.md ← Pipelines, ETL, modelagem
│   ├── agente-analista.md         ← Análises e insights de negócio
│   ├── agente-bi.md               ← Dashboards e visualizações
│   ├── agente-ml.md               ← ML, LLMs e IA do produto
│   └── agente-qualidade-dados.md  ← Governança e qualidade
│
├── ⚙️ INFRA & DEVOPS
│   ├── agente-devops.md           ← CI/CD e automação de deploy
│   ├── agente-cloud.md            ← AWS / Terraform / cloud
│   ├── agente-sre.md              ← Confiabilidade e incidentes
│   └── agente-database-ops.md     ← Banco, backup e migrations
│
├── 💼 COMERCIAL
│   ├── agente-vendas.md           ← Scripts, objeções, pipeline, upsell
│   └── agente-cs.md               ← Onboarding, retenção, NPS, churn
│
├── 💰 CONTABILIDADE & FINANCEIRO
│   ├── agente-contador.md         ← NF-e, impostos, folha, obrigações
│   └── agente-cfo.md              ← Modelagem financeira, pricing, runway
│
├── 🎧 CUSTOMER EXPERIENCE (CX)
│   ├── agente-cx-lead.md          ← Estratégia de CX, NPS, jornada, voz do cliente
│   └── agente-suporte.md          ← Suporte técnico, triagem, escalada para Dev
│
├── ⚖️ JURÍDICO & PRIVACIDADE
│   ├── agente-juridico.md         ← Contratos, regulatório CFoF/ANVISA, PI, conflitos
│   └── agente-lgpd.md             ← DPO: LGPD, privacidade, ROPA, incidentes, titulares
│
├── 👥 RH & PEOPLE
│   ├── agente-rh.md               ← Recrutamento, performance, PDI, comp, offboarding
│   └── agente-cultura.md          ← Cultura, rituais, comunicação interna, clima
│
└── 🎨 PRODUTO
    ├── agente-po.md               ← Discovery, priorização, roadmap, user stories, GTM
    └── agente-ux.md               ← UX/UI, testes de usabilidade, design system, handoff
```

---

## Como usar os agentes

Cada agente é um arquivo Markdown com:
- **Identidade** — quem é e qual seu papel
- **Responsabilidades** — o que faz
- **Regras / padrões** — como trabalha
- **Como ativar** — o que fornecer para obter um output
- **Output padrão** — formato esperado da resposta

**Para usar:** abra o arquivo do agente correspondente à tarefa, forneça as informações solicitadas na seção "Como usar este agente" e ele responderá no formato definido.

---

## Índices por time

- Marketing: `.agents/marketing/INDICE.md`
- Desenvolvimento: `.agents/dev/INDICE.md`
- Dados: `.agents/data/INDICE.md`
- Infra: `.agents/infra/INDICE.md`
- Comercial: `.agents/comercial/INDICE.md`
- Contabilidade & Financeiro: `.agents/contabilidade/INDICE.md`
- Customer Experience: `.agents/cx/INDICE.md`
- Jurídico & Privacidade: `.agents/juridico/INDICE.md`
- RH & People: `.agents/rh/INDICE.md`
- Produto: `.agents/produto/INDICE.md`

---

## Total de agentes: 42

| Time | Agentes |
|------|---------|
| Marketing | 11 |
| Desenvolvimento | 7 |
| Dados | 6 |
| Infra & DevOps | 4 |
| Comercial | 2 |
| Contabilidade & Financeiro | 2 |
| Customer Experience (CX) | 2 |
| Jurídico & Privacidade | 2 |
| RH & People | 2 |
| Produto | 2 |
| **Total** | **42** |

---

## Mapa de acionamento rápido

| Situação | Time | Agente |
|----------|------|--------|
| Criar post / conteúdo / anúncio | Marketing | agente-operacoes-conteudo.md |
| Estratégia de marketing e prioridades | Marketing | agente-cmo.md |
| Bug no produto / feature request | Desenvolvimento | agente-tech-lead.md |
| Incidente de infraestrutura | Infra | agente-sre.md |
| Análise de dados / dashboard | Dados | agente-analista.md |
| Lead inativo / objeção de venda | Comercial | agente-vendas.md |
| Cliente em risco de churn | Comercial | agente-cs.md |
| Ticket de suporte / bug reportado por cliente | CX | agente-suporte.md |
| NPS baixo / jornada de onboarding | CX | agente-cx-lead.md |
| Contrato / regulatório CFoF | Jurídico | agente-juridico.md |
| LGPD / solicitação de titular / incidente de dados | Jurídico | agente-lgpd.md |
| Contratação / desligamento / PDI | RH | agente-rh.md |
| All-hands / retro / clima organizacional | RH | agente-cultura.md |
| NF-e, impostos, folha, obrigações fiscais | Contabilidade | agente-contador.md |
| Runway, pricing, modelagem financeira | Contabilidade | agente-cfo.md |
| Priorizar backlog / roadmap / user story | Produto | agente-po.md |
| Wireframe / teste de usabilidade / design system | Produto | agente-ux.md |
