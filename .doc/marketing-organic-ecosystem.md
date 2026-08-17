# Evolua — Marketing Orgânico: Ecossistema de Aquisição por Educação

> **Documento vivo** · Autor: CMO & Growth Lead (IA) · Revisado: 2026-08-13
> Escopo: **exclusivamente marketing**. Não altera código, workflows, banco, secrets nem arquivos de engenharia.
> Base de conhecimento: `.doc/` · `openspec/` · `docs/` · GEOS (`.geos/geos.yaml`, brownfield, `geos doctor` ✅ em 2026-08-13)
> Fonte de pesquisa externa: seção [24. Fontes](#24-fontes) com links e data de acesso.

---

## Sumário

1. [Tese e Posicionamento](#1-tese-e-posicionamento)
2. [ICP / JTBD](#2-icp--jtbd)
3. [Arquitetura do Ecossistema](#3-arquitetura-do-ecossistema)
4. [Evolua Academy](#4-evolua-academy)
5. [Blog e Topic Clusters](#5-blog-e-topic-clusters)
6. [Newsletter](#6-newsletter)
7. [Comunidade](#7-comunidade)
8. [Materiais (Lead Magnets)](#8-materiais-lead-magnets)
9. [Ferramentas Gratuitas](#9-ferramentas-gratuitas)
10. [SEO + AEO + GEO](#10-seo--aeo--geo)
11. [Canais e Repurposing](#11-canais-e-repurposing)
12. [Loop Produto-Conteúdo-Comunidade](#12-loop-produto-conteúdo-comunidade)
13. [Funil e Lead Scoring](#13-funil-e-lead-scoring)
14. [Automações](#14-automações)
15. [Governança Editorial Clínica e LGPD](#15-governança-editorial-clínica-e-lgpd)
16. [Métricas: North Star e por Etapa](#16-métricas-north-star-e-por-etapa)
17. [Experimentos 30/60/90 Dias](#17-experimentos-306090-dias)
18. [Roadmap 12 Meses](#18-roadmap-12-meses)
19. [RACI Enxuto](#19-raci-enxuto)
20. [Custos](#20-custos)
21. [Riscos](#21-riscos)
22. [Critérios de Kill / Scale](#22-critérios-de-kill--scale)
23. [Instrumentação e Dashboards](#23-instrumentação-e-dashboards)
24. [Fontes](#24-fontes)

---

## 1. Tese e Posicionamento

### 1.1 Tese central

**A aquisição orgânica da Evolua é uma máquina de educação.** O padrão que AWS (Skill Builder), Google (Skills/Skillshop), Microsoft (Learn), Meta (Blueprint), iFood (Decola) e McDonald's (Hamburger University) provam em escala: **quem educa o mercado vira a fonte de confiança, e a confiança vira adoção com CAC próximo de zero**. O que a AWS faz com cloud e a Meta com ads, a Evolua fará com **gestão clínica + WhatsApp profissional + LGPD para fonoaudiólogas**.

A tese tem três camadas, em ordem de prioridade para o estágio MVP:

1. **Educar antes de vender** — toda fonoaudióloga compra um CRM depois de aprender que aquele problema tem solução. O blog, a newsletter, a Academy e as ferramentas gratuitas criam o "aha moment" de gestão.
2. **Autoridade de nicho = moat defensável** — os concorrentes são generalistas (iClinic, Ninsaúde, Holmed) que **não criam conteúdo de fono** (`competitive-intelligence/_summary.md`). Ninguém educa fonoaudiólogas sobre prontuário eletrônico, MBGR/DOSS/FOIS ou WhatsApp profissional. Esse vazio é o nosso espaço.
3. **IA gera conteúdo com consistência humana** — a capacidade de produzir 1 post/dia (já operante via Content Pipeline) é o que permite competir com empresas 100x maiores. GEOS (Content Engine) orquestra; humano aprova ([blog_publish: required](../.geos/geos.yaml)).

### 1.2 Posicionamento

- **Categoria que criamos**: "CRM de fonoaudiologia" — não "prontuário genérico que serve fono". Simples Dental criou a categoria dental no Brasil; EasyFono existe mas não educa o mercado (0 conteúdo de gestão). A Evolua ocupa **categoria + educação**.
- **Promise**: "Menos burocracia, mais sessão. A Evolua ajuda a fonoaudióloga a gerenciar a clínica, documentar em minutos e crescer — com WhatsApp, IA e conteúdo que ensina."
- **Tom de voz** (mandatório do `BRAND-KIT.md`): especialista que fala **COM** a fono, frases curtas, zero "solução/inovar/ecossistema/maximizar/potencializar". Primeira linha para o scroll. Máx. 3 emojis em legenda, zero no blog.

### 1.3 Por que "orgânico" e não "pago" no estágio MVP

- CAC orgânico B2B SaaS é ~50% do CAC pago (US$164 vs US$310 por lead — Sopro 2025; ver [24. Fontes](#24-fontes)).
- O orçamento Meta/Google Ads definido (R$2.500/mês) fica **apoiando** o orgânico (retargeting + boost de conteúdo top), não substituindo. Ads testam mensagens; orgânico constrói ativo.
- Estágio MVP (pré-launch, beta): o produto ainda está sendo validado. Investir em aquisição paga massiva antes de produto-ajuste queima caixa e gera trial de baixa qualidade. Educação constrói audiência que pode ser convertida **quando** o produto estiver pronto para escalar.

---

## 2. ICP / JTBD

Fonte base: [.doc/cliente.md](cliente.md). Complementado com micro-segmentação e jornada.

### 2.1 Persona principal

**Fonoaudióloga clínica** (25–45), consultório próprio ou clínica compartilhada, 20–80 pacientes ativos, WhatsApp como canal principal, perde 2–4h/dia em tarefas administrativas, quer crescer mas não tem tempo para marketing.

### 2.2 Micro-segmentos (para conteúdo e mensagem)

| Segmento | Característica | Ângulo de conteúdo | Fase do funil |
|----------|---------------|--------------------|---------------|
| **Fono em papel/planilha** | Anotações manuais, agenda manual | "Prontuário eletrônico vs papel" (LGPD, segurança, tempo) | Awareness |
| **Fono digital-ansiosa** | Já tenta iClinic/Ninsaúde genérico, recria MBGR no texto livre | "Sistema feito pra médico, não pra você" | Consideration |
| **Fono WhatsApp-sobrecarregada** | Tudo pelo WhatsApp pessoal, perde mensagem | "WhatsApp profissional para fono" | Consideration |
| **Fono que cresce** | Quer captar pacientes, precificar melhor, ter marca | Marketing/carreira para fono | Decision |
| **Estudante / recém-formada** | Documentação, CFFa, primeiros passos | CFFa, anamnese, checklists clínicos | Awareness (futuro lead) |
| **Clínica / equipe** (Fase 3) | Multi-profissional, faturamento maior | Multi-profissional, compliance | Fase 3 |

### 2.3 JTBD (Jobs To Be Done) — hierarquia

**Job funcional:** "Quando meu consultório vira um caos de papel/planilha/WhatsApp, quero **gerenciar tudo em um só lugar** para não perder paciente e não trabalhar à noite."

| Nível | Job | Métrica do job |
|-------|-----|----------------|
| Funcional | Gerenciar clínica em um só lugar (agenda, prontuário, cobrança) | Tempo de gestão/dia |
| Funcional | Automatizar o repetitivo (agendamento, confirmação, cobrança) | Nº de tarefas manuais |
| Funcional | Documentação clínica rápida e padronizada (MBGR, DOSS, GRBAS, relatórios) | Minutos/evolução |
| Funcional | WhatsApp profissional, separado do pessoal | Mensagens misturadas |
| Emocional | Sentir-se no controle, profissional, sem culpa (relatório escolar atrasado) | Autoeficácia |
| Social | Ser vista como profissional moderna (colégio, escola, convênio, pares) | Percepção de status |
| Crescimento | Criar conteúdo para atrair pacientes sem gastar horas | Pacientes novos/mês |

### 2.4 Jornada e momentos de necessidade

```
SENTE A DOR  →  BUSCA  →  COMPARA  →  TESTA  →  PAGA  →  ADOTA  →  RECOMENDA
  (no-show,    (Google/  (iClinic,   (trial     (plano    (sessões  (indica para
   papel, IA/IG/      EasyFono,   14 dias)   pago)    completas) amiga, review)
   WhatsApp)   WhatsApp) Amplimed)
```

- **Momentos de gatilho orgânico**: fim de mês (cobrança), início de ano letivo (relatório escolar), renovação CFFa (nov-dez), congressos (CBFA), teleconsulta depois de doença, "tempo perdido" no Instagram.
- **Chave de conteúdo**: responder no momento da busca com a melhor resposta — é a mesma lógica de SEO/AEO/GEO ([§10](#10-seo--aeo--geo)).

---

## 3. Arquitetura do Ecossistema

### 3.1 Mapa de camadas (padrão big-tech adaptado ao ICP)

```
                    ┌──────────────────────────────────────────────┐
                    │          CAMADA DE APRENDIZADO                │
                    │  Evolua Academy (trilhas + certificado)       │  ← AWS/MS/Meta/iFood
                    │  Central de Ajuda + Guias Clínicos "Docs"     │  ← Stripe (docs = aquisição)
                    └───────────────▲──────────────────────────────┘
                                    │ feed
                    ┌───────────────┴──────────────────────────────┐
                    │          CAMADA DE CONTEÚDO                  │
                    │  Blog (topic clusters) · Newsletter          │
                    │  Lead magnets · Social (IG/LinkedIn/YT)      │
                    └───────────────▲──────────────────────────────┘
                                    │ distribuição
                    ┌───────────────┴──────────────────────────────┐
                    │          CAMADA DE FERRAMENTAS GRÁTIS         │
                    │  Calculadoras · Gerador de relatório ·       │
                    │  Buscador de protocolos · Trial 14d + Free   │  ← Stripe Atlas / free tier
                    └───────────────▲──────────────────────────────┘
                                    │ captura
                    ┌───────────────┴──────────────────────────────┐
                    │          CAMADA DE COMUNIDADE                │
                    │  Comunidade WhatsApp · Encontros ao vivo     │  ← iFood Decola/Move,
                    │  Eventos (CBFA) · Indicação                  │     McDonald's (consistência)
                    └───────────────▲──────────────────────────────┘
                                    │ feedback (dores → conteúdo → produto)
                    ┌───────────────┴──────────────────────────────┐
                    │          CAMADA DE DISTRIBUIÇÃO              │
                    │  SEO · AEO · GEO · Repurposing · Parcerias   │
                    │  (CREFono, universidades, cursos)            │
                    └──────────────────────────────────────────────┘
```

### 3.2 Princípio de construção (estágio MVP)

**Camadas por fases — nunca tudo de uma vez.** Big-tech tem anos de conteúdo; a Evolua tem uma operação lean IA-amplificada. Ordem de ativação:

| Fase | Camada ativada | Justificativa |
|------|---------------|---------------|
| Agora (0–30d) | Conteúdo + Distribuição + Ferramentas (1ª) | Blog/SEO já existe; ferramenta grátis gera lead rápido e linkable asset |
| 30–90d | Academy (modo leve) + Comunidade (seed) | Academia via email + comunidade WhatsApp = ativação e retenção |
| 90–180d | Comunidade ativa + Eventos + Certificação | Prova social (casos) destrava conversão |
| 180–365d | Academy LMS + Relatório de dados proprietários | Autoridade para GEO + receita/retenção |

### 3.3 Ativos já existentes (não recriar)

- Content Pipeline diário (blog auto-publicado seg-sex 06:00 BRT) e Content Engine semanal (sáb 08:00 BRT) — [.doc/automation-marketing-audit.md](automation-marketing-audit.md)
- Newsletter "Fono em Foco" (Resend, quarta 10:00 BRT)
- Blog no Supabase `blog_posts` (schema inglês; RLS publica só `published`)
- 6 lead magnets catalogados + pipeline de materiais HTML
- Baseline GEO (2.4/10, 0/5 citações) e 5 queries-alvo — [.doc/geo-experiment.md](geo-experiment.md)
- Landing + app em produção; Instagram @useevoluaapp; LinkedIn company

---

## 4. Evolua Academy

### 4.1 Referências e adaptação

- **AWS Skill Builder** (600+ cursos grátis, 200+ labs, trilhas por papel, certificação → pipeline de adoção) e **Microsoft Learn** (aprendizado gratuito, certificação reconhecida) provam: **ensinar o uso correto da categoria gera clientes mais preparados e menos churn**.
- **iFood Decola** (100+ cursos grátis para donos de restaurante, 135–215 mil inscritos, 140 mil certificados) é o caso brasileiro mais próximo do nosso ICP: **plataforma que educa o parceiro para ele ter sucesso no produto**.
- **McDonald's Hamburger University**: treinamento **padronizado e repetível** como motor de consistência e marca.
- Adaptação: nosso "API docs" é o **guia de gestão clínica + documentação clínica**. Nossa "certificação" é o **Evolua Certified** — prova de domínio de gestão de consultório moderno.

### 4.2 Modelo MVP (sem LMS pesado)

Academy em **4 degraus**, do zero-custo ao escalável:

| Degrau | Formato | Custo | Quando |
|--------|---------|-------|--------|
| 1. **Mini-cursos por email** (7 emails) | Resend + landing HTML (capability já existe no Content Engine) | ~R$0 | 30–60d |
| 2. **Trilhas em páginas web** (landing-core) | HTML com lições + quiz simples | Baixo | 60–120d |
| 3. **Certificado PDF + badge** | PDF via Resend + badge compartilhável | Baixo | 90–150d |
| 4. **LMS completo** (avaliação, progresso, gamificação) | Decisão condicionada a demanda | Médio | 180d+ (gate de scale) |

> **Regra LGPD/Academy**: inscrição = consentimento explícito para receber material educativo. Dado de saúde NUNCA é pedido para baixar curso.

### 4.3 Trilhas (currículo) — alinhadas aos topic clusters (§5)

| Trilha | Carga | Público | Certificação | Cluster relacionado |
|--------|-------|---------|--------------|---------------------|
| **T1 · Gestão de Consultório** (agenda, financeiro, precificação, fluxo de caixa) | 5 aulas | Fono iniciante/autônoma | Evolua Certified — Gestão | Gestão de consultório |
| **T2 · WhatsApp Profissional para Fono** (agendamento, lembrete, cobrança, LGPD) | 5 aulas | Fono WhatsApp-sobrecarregada | Evolua Certified — WhatsApp | WhatsApp profissional |
| **T3 · Documentação Clínica e LGPD** (prontuário eletrônico, MBGR/DOSS/GRBAS/FOIS/VHI-10, relatório escolar, consentimento) | 6 aulas | Todas | Evolua Certified — Documentação | Prontuário eletrônico fono |
| **T4 · Marketing e Captação para Fono** (Instagram, Google Meu Negócio, indicação, precificação de serviço) | 5 aulas | Fono que quer crescer | Evolua Certified — Crescimento | Marketing para fono |
| **T5 · Fono e Tecnologia/IA** (teleconsulta, automação, IA na documentação) | 4 aulas | Fono digital | — (badge) | Fono + tecnologia |

**Mecânica de certificação** (modelo Meta Blueprint: treino grátis, certificação separada):
- **Aulas gratuitas** (educação como lead magnet). **Certificado** = prova objetiva simples (5 questões por trilha) + conclusão de todas as aulas.
- Certificado gera **badge compartilhável** (modelo AWS Credly / Google Skill Badges) → cada certificada vira **distribuidora de marca** no LinkedIn/Instagram/currículo.
- **Meta de escala**: certificação só vira ativo real quando ≥300 inscrições acumuladas (evita custo/ruído cedo). Antes disso, certificado PDF simples (degrau 3).

### 4.4 Indicadores de saúde da Academy

- Inscritos/mês · conclusão de trilha (%) · certificados emitidos · **conversão certificada → trial** · churn de quem fez curso vs quem não fez.

---

## 5. Blog e Topic Clusters

### 5.1 Arquitetura hub & spoke

6 clusters (hubs), cada um com posts (spokes) priorizados por dor + volume + dificuldade competitiva:

| Cluster (hub) | Keywords-âncora | Posts-spokes (exemplos) |
|---------------|-----------------|--------------------------|
| **A · Prontuário eletrônico fono** | "prontuário eletrônico fonoaudiologia", "software para clínica de fonoaudiologia" | MBGR explicado, FOIS/DOSS/GRBAS/VHI-10, relatório escolar em 30s, anamnese de disfagia, prontuário vs papel (LGPD) |
| **B · Gestão de consultório fono** | "como gerenciar consultório de fono", "como organizar consultório de fonoaudiologia" | agenda, precificação, fluxo de caixa, inadimplência, 5 erros de gestão |
| **C · WhatsApp profissional fono** | "WhatsApp profissional para fono", "agenda online fonoaudióloga" | WhatsApp Business vs API, agendamento automático, lembrete que reduz no-show, cobrança via PIX |
| **D · Marketing para fono** | "como atrair pacientes fonoaudiologia", "marketing digital para fonoaudiólogas" | Instagram para fono, Google Meu Negócio, indicação, conteúdo sem gastar horas |
| **E · Fono + tecnologia/IA** | "automação para fonoaudióloga", "IA fonoaudiologia" | IA na documentação, teleconsulta, prontuário com transcrição |
| **F · Carreira fono** | "CFFa documentação obrigatória", "quanto cobrar por sessão de fonoaudiologia" | CFFa, especializações, empregabilidade, estudante→clínica |

**Regras de estrutura (SEO/AEO/GEO-ready)**:
- Título com a query, **resposta na primeira 100 palavras**, H1/H2/H3, listas, tabelas, **FAQ schema**.
- **Dados únicos e citáveis** (número de fono, horas perdidas, benchmarks) — LLMs citam dados ([GEO experimento](geo-experiment.md); Princeton GEO).
- Sempre um **lead magnet ou ferramenta grátis** conectado (CTA de newsletter/trial).
- Cadência já operante: **1 post/dia** (AGENTS.md), categorias validades (Marketing/Gestão/Clínica/Carreira/Tecnologia/Fonoaudiologia).

### 5.2 Pauta: método das 3 skills (padrão AGENTS.md)

Mapear concorrentes (`competitor-profiling` + `docs/competitive-intelligence/`) → achar lacunas (`content-strategy` + `customer-research`) → gerar pauta (alimenta `docs/calendario-editorial.md`). Lacunas já mapeadas: protocolos nativos, WhatsApp integrado, IA em relatórios, PIX recorrente, conteúdo 100% fono (`_summary.md`).

---

## 6. Newsletter

### 6.1 Posição na arquitetura

A newsletter é o **canal de propriedade** (owned media) que amarra tudo: blog → newsletter → comunidade → trial. Benchmark: 71% dos marketers B2B usam email newsletter como canal de distribuição (CMI 2025).

### 6.2 Produto atual → upgrade

- **Hoje**: "Fono em Foco" via Resend, quarta 10:00 BRT, envia último post (auto).
- **Upgrade (proposto, sem tocar workflow — é plano)**: edição semanal com 3 blocos — (1) dica prática (30s), (2) link do melhor post do cluster da semana, (3) mini-curso da Academy ou ferramenta grátis. CTA único: trial 14 dias OU material.

### 6.3 Crescimento (loop de aquisição)

```
Blog/tool/Instagram → capture de email (lead magnet permitido) → welcome sequence (3 emails)
→ newsletter semanal → comunidade WhatsApp → trial → cliente → indicação
```

- **Objetivo 90d**: 500 inscritos (já é OKR em `docs/calendario-editorial.md`).
- **Captura**: popup no blog, CTA no fim de post, ferramentas grátis (ver §9), matérias da Academy.
- **Deliverability**: Resend já configurado; adicionar double opt-in e remoção fácil (LGPD).

---

## 7. Comunidade

### 7.1 Por que comunidade (dados)

Community-led growth reduz CAC em **30–60%**, clientes de comunidades têm **40% menor churn** e UGC gera **~400% mais leads** que conteúdo de marca (Fungies/MetricRig 2026). Para o ICP, comunidade é ainda mais natural: fonoaudiólogas já vivem em **grupos de WhatsApp**.

### 7.2 Formato (adaptado ao ICP, não copiar Discord/Slack)

| Camada | Canal | Frequência | Papel |
|--------|-------|-----------|-------|
| **Comunidade WhatsApp "Evolua na Prática"** | Grupo/Comunidade WhatsApp (nativo ao ICP — modelo iFood AprendiZap, educação via WhatsApp) | Diária (moderada) | Dúvidas de gestão, troca de protocolos, vitórias |
| **Encontro ao vivo mensal** | Live IG + WhatsApp (modelo "iFood na Prática" do iFood) | 1x/mês | Aula prática + Q&A ao vivo |
| **Banco de casos (UGC)** | Blog + IG + LinkedIn | Contínuo | Prova social (cases) alimentam §5/§11 |

**Regras anti-spam/anti-suporte** (lição de community-led B2B): comunidade = estratégia e benchmarking; **suporte ticketed = fora**. Moderar com "compartilhe um exemplo antes de pedir ajuda". Nunca virar canal de atendimento.

### 7.3 GEOS

Domínio `community` está **shadow** em `.geos/geos.yaml` — plano é promovê-lo quando a comunidade ativa tiver >100 membros.

---

## 8. Materiais (Lead Magnets)

### 8.1 Regra AGENTS.md (mandatória)

**Permitidos**: ebooks, infográficos, guias visuais, mini-cursos, templates de conteúdo visual.
**Proibidos**: planilhas (.xlsx), checklists, "templates" de formulário.

### 8.2 Catálogo atual (6) + lacunas

| Material | Estágio | Status | Já conectado a |
|----------|---------|--------|----------------|
| `ebook-whatsapp-profissional` | Consideration | ✅ | CTA trial |
| `ebook-tendencias` | Awareness | 📋 | — |
| `ebook-protocolos` | Awareness/Educação clínica | 📋 | Cluster A |
| `ebook-mkt-digital-fono` | Consideration | 📋 | Cluster D |
| `infografico-marcos-fala` | Awareness (viral) | ✅ | Social |
| `infografico-montar-clinica` | Awareness | ✅ | Social |

### 8.3 Novos materiais priorizados (dentro das regras)

| # | Material | Formato permitido | Funil | Gancho |
|---|----------|-------------------|-------|--------|
| 1 | **Mini-curso "WhatsApp profissional em 5 dias"** (email) | Mini-curso | Consideration | Dá o 1º ganho sem produto |
| 2 | **Guia visual "MBGR em uma página"** | Guia visual | Awareness/Clínico | Viral no IG + citável (GEO) |
| 3 | **Guia visual "Fluxo de caixa do consultório"** | Guia visual | Consideration | Ligado ao financeiro |
| 4 | **E-book "LGPD para fono: o que você precisa saber"** | E-book | Consideration | Risco real; autoridade |
| 5 | **Relatório "Estado da Fono no Brasil 2026"** (dados proprietários) | E-book/relatório | Awareness + GEO | LLMs citam dados únicos |

**Onde publicar**: `docs/content-assets/05-lead-magnets/` (já existe) + `materials-catalog.json`.

---

## 9. Ferramentas Gratuitas

Padrão: **free tool = linkable asset + lead capture + showcase do produto** (Stripe Atlas; AWS free tier; Google free tools). Cada ferramenta é uma micro-landing com CTA para trial/newsletter.

### 9.1 Roadmap de ferramentas (MVPs — landing HTML + JS simples)

| # | Ferramenta | Valor para a fono | Valor para a Evolua | Fase |
|---|-----------|--------------------|----------------------|------|
| 1 | **Calculadora de precificação de sessão** (custo/hora, margem, preço sugerido) | Precificar sem medo | Keyword "quanto cobrar por sessão fonoaudiologia"; dados de uso | 0–60d |
| 2 | **Calculadora de custo do tempo administrativo** (2–4h/dia → R$/mês perdidos) | Consciência da dor | Tese de venda (ROI) + lead | 0–60d |
| 3 | **Gerador de relatório de evolução (demo IA)** | Relatório pronto em 30s | Showcase do produto | 60–120d |
| 4 | **Buscador de protocolos** (MBGR/DOSS/FOIS/GRBAS/VHI-10 indexados) | Referência clínica rápida | Autoridade de nicho + GEO | 90–180d |
| 5 | **Trial 14 dias + Free tier** (produto) | Testar sem risco | Motor principal de conversão | já existe |

### 9.2 Regras

- Tool nunca pede dado de saúde. Pede apenas email (consentimento).
- Tool gera **link de compartilhamento** (ex.: "sua precificação" com URL única) → viralização orgânica.
- Tool ligada a 1 keyword e 1 cluster (SEO).

---

## 10. SEO + AEO + GEO

### 10.1 Contexto 2026 (por que AEO/GEO agora)

- **AI Overviews derrubam CTR** do 1º resultado tradicional em ~58% (Ahrefs 2025); **zero-click** chega a 83% com resumos de IA (The Digital Bloom 2025); ~60% das buscas terminam na SERP (AIOSEO, jan 2026).
- **Tráfego generativo cresceu ~796% YoY** (Media Copilot 2025) e a citação em IA vem **94% de fontes de terceiros** (earned media) — marca não pode depender só de canal próprio.
- **GEO não substitui SEO — é o pacote de expansão** (princípio validado por Princeton/Georgia Tech no estudo GEO, arXiv 2311.09735).

### 10.2 Plano integrado

| Camada | Ações | Métrica |
|--------|-------|---------|
| **SEO técnico** | site speed, mobile-first, indexação, schema (SoftwareApplication + FAQPage + HowTo + Organization), sitemap | Core Web Vitals, indexação GSC |
| **SEO conteúdo** | topic clusters (§5), internal linking, links = hub→spoke, responder query no título/H1 e 1ª 100 palavras | Rankings top 10, impressions GSC |
| **Off-page** | backlinks via: ferramentas grátis (linkable assets), cases, diretórios (G2/Capterra/CREFono/lista "melhor software para fono"), guest post em blogs de fono/educação, participação em listas | DR/Ahrefs, backlinks 50+ (target 90d) |
| **AEO (Answer Engine Optimization)** | resposta-primeiro, FAQ schema, trecho "direct answer" em cada post, dados citáveis | Featured snippets, aparecer em AI Overviews |
| **GEO (Generative Engine Optimization)** | 5 queries-alvo do experimento (.doc/geo-experiment.md): posts otimizados, página `/fonoaudiologia` (SoftwareApplication+FAQPage), diretórios, dados proprietários, consistência de entidade (NAP, redes, Google Business) | Citações em ChatGPT/Claude/Gemini/Perplexity — target 3/5 em 90d |

### 10.3 Baseline e metas (herdadas do GEO experiment)

| Métrica | Baseline (12/08) | 30d | 90d |
|---------|------------------|-----|-----|
| Citações Evolua (web) | 0/5 | 1/5 | 3/5 |
| Citações Evolua (LLMs) | 0/5 (não testado) | 1/5 | 3/5 |
| Score GEO estimado | 2.4/10 | 4/10 | 6/10 |
| Backlinks | ? | 10 | 50+ |
| Pageviews/mês (blog) | ~0 | 1.000 | 5.000+ |

**Monitoramento AEO/GEO**: query nas 4 plataformas 1x/semana (manual ou ferramentas dedicadas — ver §23); GA4 para AI referrals.

---

## 11. Canais e Repurposing

### 11.1 Matriz de canais (ICP-first)

| Canal | Frequência | Formato | Papel no funil | Prioridade |
|-------|-----------|---------|----------------|------------|
| **Blog (landing-core)** | 1/dia (auto) | Artigo + FAQ schema | Awareness→Consideration | 🔴 Alta |
| **Instagram @useevoluaapp** | 5/sem | Reels 3x, carrossel 1x, estático 1x | Awareness (topo) | 🔴 Alta |
| **Newsletter** | 1/sem | Email | Consideration→Retenção | 🔴 Alta |
| **Comunidade WhatsApp** | Diária | Conversa + material | Consideration→Decision | 🟡 Média (ativa 30–90d) |
| **LinkedIn** (pessoal fundador + company) | 2/sem | Post técnico + cases | B2B/parceiros/profissionais | 🟡 Média |
| **YouTube** | 1/sem | Tutorial 3–8min | Consideration | 🟡 Média (backlog) |
| **Parcerias** (CREFono, universidades, cursos de pós) | Mensal | Webinar, material co-branded | Consideration (confiança) | 🟡 Média |
| **Eventos** (CBFA, congressos regionais) | Sazonal | Palestra, stand, QR trial | Decision | 🟢 Baixa (sazonal) |

### 11.2 Regra de repurposing (Content Multiplication Rule já implementada)

Cada **1 post de blog** → carrossel IG + reels 30s + thread (X/Threads) + resumo newsletter + post LinkedIn. O Content Engine semanal (sábado) já gera: 1 ebook + 3 infográficos + 10 carrosséis + 20 posts + 10 stories + 5 reels + 5 ads + landing + email funnel. **Aprovação humana obrigatória** para publicação (AGENTS.md: `social_publish: required`).

### 11.3 Cuidado de marca (IG-first)

Para o ICP, **Instagram é o topo de funil** (concorrentes como EasyFono têm YouTube forte). Prioridade de produção visual: IG Reels e carrosséis clínicos (protocolos, marcos da fala). LinkedIn não é o canal da fono autônoma — é o canal do B2B/parceiros/fundador.

---

## 12. Loop Produto-Conteúdo-Comunidade

### 12.1 O flywheel

```
        ┌──────────────────────────────────────────────────┐
        │                                                  │
        │   CONTEÚDO educa (blog, Academy, tools, IG)      │
        │        │  desce a dor e atrai trial              │
        │        ▼                                          │
        │   TRIAL 14d → PRODUTO cria resultado             │
        │   (sessões completas, relatório IA, WhatsApp)    │
        │        │  gera dados únicos (anonimizados)       │
        │        ▼                                          │
        │   COMUNIDADE compartilha vitória (case)          │
        │        │  UGC + prova social + indicação          │
        │        ▼                                          │
        │   DADOS → CONTEÚDO melhor (report, benchmark)    │
        │        │  retroalimenta a camada educativa        │
        │        ▼                                          │
        └──────── CONTEÚDO ... (loop)                       ┘
```

### 12.2 Mecanismos concretos

1. **Produto gera prova**: relatório de evolução gerado em 30s vira screenshot para carrossel ("antes/depois").
2. **Produto gera dado proprietário**: horas economizadas, sessões/mês, no-show antes/depois → alimenta "Relatório Estado da Fono 2026" (GEO data moat).
3. **Comunidade gera UGC**: "como você resolveu a cobrança parcelada?" → resposta vira post (400% mais leads que conteúdo de marca).
4. **Indicação** (kanban de tarefas, encaminhamentos entre profissionais) → programa de indicação simples no trial.

### 12.3 North Star do loop

A NSM do produto é **sessões completadas por fono/mês** ([.doc/metricas.md](metricas.md)). O marketing contribui com **trial starts qualificados/mês** e **% de trial que completa onboarding** (activation). Loop saudável = conteúdo → trial → sessões → cases → mais conteúdo.

---

## 13. Funil e Lead Scoring

### 13.1 Funil (estágio MVP)

```
ATRAIR (orgânico) → CAPTURAR (email/trial) → NUTRIR (newsletter/comunidade)
→ QUALIFICAR (scoring) → TESTAR (trial 14d) → CONVERTER (pago)
→ ADOTAR (sessões) → EXPANDIR/RECOMENDAR (indicação, review, case)
```

### 13.2 Definições de lead

| Tipo | Critério | Exemplo |
|------|----------|---------|
| **Lead orgânico** | Baixou material ou se inscreveu na newsletter | Email de lead magnet |
| **MQL** | Fit ICP (fono clínica) + comportamento (2+ interações, baixou material, visitou página de preço) | Email + IG + visitou /materiais |
| **Trial activado** | Criou conta trial e completou onboarding (1 paciente + 1 sessão) | Auth + uso |
| **SQL/Pagante** | Trial→pago ou pedido de demo | Billing |

### 13.3 Modelo de lead scoring (GEOS `lead_scoring`, hoje shadow → ativo na Fase 3)

**Score = Fit (0–40) + Comportamento (0–60)**, thresholds: ≥60 MQL, ≥80 SQL.

| Fator | Peso |
|-------|------|
| **Fit**: perfil fono (formação), consultório próprio, 20+ pacientes, região | 40 |
| **Comportamento**: abriu 3+ emails (5), baixou ebook (10), usou calculadora (10), visitou pricing (15), iniciou trial (20), completou onboarding (+15) | 60 |
| **Negativo**: institucional/não-fono, bounce, 60d inativo | desconta |

**Uso**: priorizar nurture manual/founders para SQLs (meetings, aprovação humana obrigatória — `meeting_invite: required`).

---

## 14. Automações

> Estado atual detalhado em [.doc/automation-marketing-audit.md](automation-marketing-audit.md). Este plano **não altera** workflows — lista gaps e melhorias propostas para decisão.

### 14.1 Já operantes

| Automação | Quando | O que faz |
|-----------|--------|-----------|
| Daily Content Pipeline (CI) | Seg–Sex 06:00 BRT | Research → blog (auto-publish) → posts sociais (email) |
| Weekly Content Engine (CI) | Sáb 08:00 BRT | Multiplicação: ebooks, infográficos, carrosséis, stories, reels, ads, landing, email funnel |
| Newsletter | Qua 10:00 BRT | Último post para subscribers via Resend |
| DB Healthcheck | Diário 03:17 BRT | Saúde do banco |

### 14.2 Gaps propostos (para próximas sprints de marketing — fora do escopo desta sessão)

| # | Automação | Trigger | Ação | Observação GEOS |
|---|-----------|---------|------|-----------------|
| 1 | **Welcome sequence (3 emails)** pós-inscrição | Novo subscriber | 3 emails de ativação (material → caso → trial) | `email_nurture` shadow→active |
| 2 | **Entrega de lead magnet** | Download | Email com material + CTA | aprovação `email_send` |
| 3 | **Certificado Academy** | Conclusão de trilha | PDF + badge automático | — |
| 4 | **Re-baseline GEO semanal** | Semanal | Query nas 4 plataformas → log | `seo`/research |
| 5 | **Comunidade onboarding** | Novo membro WhatsApp | Boas-vindas + regras + material | `community` shadow |
| 6 | **Falha sem alerta** (gap crítico do audit) | Pipeline falhou | Email/Slack de alerta | `automations` |
| 7 | **Lead capture em tools** | Calculadora usada | Email + score + nurture | `leads`/`lead_scoring` |

**Princípio**: toda automação com risco externo (publicar, enviar, convidar) exige **aprovação humana** (AGENTS.md/GEOS approvals).

---

## 15. Governança Editorial Clínica e LGPD

### 15.1 Riscos de conteúdo clínico (não-negociável)

Conteúdo menciona protocolos e escalas (MBGR, DOSS, FOIS, GRBAS, VHI-10), condutas e documentação. **Não somos referência clínica substituta.**

| Regra | Como cumprir |
|-------|--------------|
| **Revisão clínica** | Todo post que cita protocolo/escala/conduta passa por 1 fonoaudióloga consultora (RACI §19). Post não revisado = `draft`. |
| **Disclaimer** | Posts clínicos com rodapé: "Conteúdo educativo, não substitui avaliação profissional." |
| **Citações científicas** | Referenciar fonte (artigo, diretriz, CFFa) quando apresentar dado/protocolo. |
| **Sem promessas de resultado clínico** | Não prometer diagnóstico/tratamento; não usar pacientes reais sem autorização escrita (LGPD). |
| **Consistência CFFa** | Mencionar regras de documentação com fonte (CFFa) e data de consulta. |

### 15.2 LGPD (dados de saúde = dados sensíveis)

- **Consentimento explícito e granular** para: newsletter, Academy, comunidade, trial. Opt-in claro, opt-out a 1 clique (Resend já permite).
- **Coleta mínima**: nunca pedir dado de saúde para baixar material ou entrar em comunidade.
- **DPO/registro**: manter registro de bases legais (Artigo 7º e 11º LGPD) em `.doc/operacao.md`.
- **Contratos**: parcerias (CREFono, universidades) com cláusula de dados.
- **LGPD como tema de conteúdo/autoridade**: e-book LGPD para fono (§8) posiciona a Evolua como guardiã — e é SEO/GEO relevante ("LGPD fonoaudiologia").

### 15.3 Fluxo editorial (human-in-the-loop)

```
Pauta (research/IA + fono consultora) → Rascunho (Content Engine)
→ Revisão de qualidade/estilo (BRAND-KIT) → Revisão clínica (fono, se aplicável)
→ Aprovação de publicação (AGENTS.md: blog_publish required) → Publicar (Supabase)
→ Distribuir (newsletter/IG/LinkedIn) → Medir (GA4/GSC/GEO) → Aprender → feedback à pauta
```

---

## 16. Métricas: North Star e por Etapa

### 16.1 North Star

**Produto (oficial):** sessões completadas por fonoaudióloga/mês ([.doc/metricas.md](metricas.md)).
**Marketing (contribuinte):** trial starts **qualificados**/mês (fit ICP) — alimenta a NSM e evita métrica de vaidade.

### 16.2 Pirâmide de métricas por etapa do funil

| Etapa | Métricas-chave | Target 90d | Fonte |
|-------|----------------|-----------|-------|
| **ATRAIR** | Pageviews/mês (orgânico) · rankings top 10 · citações GEO · backlinks | 5.000 · 50+ · 3/5 · 50+ | GA4, GSC, GEO log, Ahrefs |
| **CAPTURAR** | Inscritos newsletter · downloads lead magnet · uses de ferramenta | 500 · 100/mês · 50/mês | Supabase, Resend |
| **NUTRIR** | Open rate · CTR · conversão email→material | 40% · 3% · 10% | Resend |
| **QUALIFICAR** | MQLs · taxa lead→MQL | 40/mês · 25% | CRM/GEOS |
| **TESTAR** | Trial starts · onboarding completion (activation) | 50/mês (meta produto) · 60% | Auth/analytics |
| **CONVERTER** | Trial→paid · MRR · CAC · LTV/CAC | >15% · R$5k · <R$500 · >3x | AbacatePay/Stripe |
| **ADOTAR** | Sessões completas/mês · WAU | 500 · 50 | DB |
| **RECOMENDAR** | Casos publicados · indicações · NPS/reviews | 3 · 10 · 8+ | UGC, G2/Capterra |

### 16.3 Métricas de Academy e comunidade

- Academy: inscritos, conclusão de trilha %, certificados emitidos, certificada→trial.
- Comunidade: membros ativos, posts/semana, resposta em <24h, comunidade-influenced trials.

---

## 17. Experimentos 30/60/90 Dias

Cada experimento tem **hipótese, métrica, critério de sucesso e kill/scale** (ver §22). Todos com aprovação humana.

### 17.1 Dias 0–30 (fundação orgânica)

| # | Experimento | Hipótese | Métrica | Sucesso |
|---|-------------|----------|---------|---------|
| 1 | Publicar posts otimizados para as **5 queries GEO** + página `/fonoaudiologia` | Responder query no topo atrai citação | Rankings + citações | 1/5 citações web |
| 2 | **Calculadora de precificação** (1ª ferramenta grátis) | Tool com valor real captura lead + link | Downloads/uses + email capture | 50 uses, 30 emails |
| 3 | **Welcome sequence 3 emails** | Ativação rápida reduz trial frio | Open, CTR, trial | 40% open |
| 4 | Re-baseline **GEO** (log semanal) | Medir melhora real | Score GEO | 3.0/10 |
| 5 | Popup de newsletter no blog | Capturar quem já lê | Inscritos | +50/mês |

### 17.2 Dias 30–60 (educação + comunidade seed)

| # | Experimento | Hipótese | Métrica | Sucesso |
|---|-------------|----------|---------|---------|
| 6 | **Mini-curso T2 WhatsApp em 5 dias** (email) | Educação gera trial qualificado | Inscritos→trial | 10 trials |
| 7 | **Comunidade WhatsApp "Evolua na Prática"** (seed 20 fono beta) | Pares geram confiança e prova | Membros ativos, trials influenciados | 50 membros |
| 8 | **Guia visual MBGR** (viral IG) | Visual clínico é compartilhável | Saves/shares, seguidores | 500 saves |
| 9 | 1º **case** de cliente beta (com consentimento) | Prova social converte | Downloads/trial do case | 5 trials |

### 17.3 Dias 60–90 (certificação + dados + escala)

| # | Experimento | Hipótese | Métrica | Sucesso |
|---|-------------|----------|---------|---------|
| 10 | **Certificado Evolua Certified** (T1+T2) | Badge vira distribuidor de marca | Certificados emitidos | 20 |
| 11 | **Relatório Estado da Fono 2026** (dados proprietários) | LLMs citam dados únicos | Citações GEO + downloads | 3/5 citações |
| 12 | **Encontro ao vivo mensal** (live IG) | Ao vivo gera comunidade ativa | Participantes, Q&A | 30 live |
| 13 | **Diretórios**: G2/Capterra/CREFono | Presença externa = earned media | Backlinks, avaliações | 10 backlinks |
| 14 | Revamp **página de pricing/trial** CTA | Trial qualificado | Trial→onboarding | 60% activation |

---

## 18. Roadmap 12 Meses

Alinhado ao [.doc/roadmap.md](roadmap.md) (Fase 2 Growth / Fase 3 Scale / Fase 4 Platform).

| Trimestre | Foco | Entregáveis | Gates |
|-----------|------|-------------|-------|
| **Q1 (M1–3)** | Fundação orgânica | 5 clusters publicados; ferramenta #1 e #2; welcome sequence; comunidade seed; página `/fonoaudiologia`; GEO 3/5; newsletter 500 | GEO≥3/5; newsletter 500; 5 cases em pipeline |
| **Q2 (M4–6)** | Academy + comunidade ativa | Mini-cursos T1–T5; certificado (degrau 3); encontros ao vivo; 3 cases publicados; diretórios; backlinks 100 | 300 inscritos Academy; 100 membros comunidade; 3 cases |
| **Q3 (M7–9)** | Escala + dados + eventos | Relatório Estado da Fono; parcerias CREFono/universidades; evento CBFA; certificação como produto; trial 50/mês | MRR R$5k; trial→paid >15%; DR 20+ |
| **Q4 (M10–12)** | Platform & community-led | Academy LMS (gate); programa de indicação; API pública (Fase 3); marketplace; teleconsulta avançada; 12 cases acumulados | LTV/CAC>3x; churn<5%; comunidade >500 |

**Métricas trimestrais de portão**: GEO score, newsletter, trials, MRR, churn, cases publicados.

---

## 19. RACI Enxuto

Operação AI-native lean (fundador + IA + parceiros). R = Responsável · A = Accountable · C = Consulta · I = Informado.

| Atividade | Fundador/CEO | CMO & Growth (IA) | Fono consultora clínica | Content Engine (GEOS) | Parceiro externo (design/eventos) |
|-----------|:---:|:---:|:---:|:---:|:---:|
| Tese, posicionamento, orçamento | **A** | R | C | I | — |
| Estratégia de conteúdo/pauta | C | **A** | C | R | — |
| Produção de conteúdo (rascunho) | I | A | C | **R** | — |
| Revisão clínica (protocolos/LGPD) | I | A | **R** | I | — |
| Aprovação de publicação/send (risco externo) | **A** | R | — | R | — |
| SEO/AEO/GEO (auditoria, schema, links) | I | **A** | C | R | C |
| Academy (trilhas, certificação) | C | **A** | C | R | I |
| Comunidade WhatsApp/lives | I | **A** | R (moderação) | R | — |
| Casos de cliente (consentimento) | **A** | R | R (depoimento) | R | — |
| Ferramentas grátis (conteúdo/landing) | I | **A** | C | R | C (design) |
| Métricas/dashboard/reporting | C | **A** | I | R | — |
| Eventos/parcerias (CREFono, CBFA) | **A** | R | C | I | R (logística) |
| Automações de marketing (proposta) | C | **A** | — | R | — |

---

## 20. Custos

Orçamento MVP-lean (mensal), aproveitando stack existente. **Ads R$2.500/mês** permanece reservado para boost/retargeting (não é o motor principal).

| Item | Mês (R$) | Nota |
|------|----------|------|
| SEO/AEO tooling (Ahrefs/SE Ranking ou Semrush básico) | 100–250 | Priorizar: rank tracking + backlinks; alternativas free para começar |
| Email/Resend (volume) | 20–50 | Já existe |
| Design (brand kit, infográficos, cases) — freelancer pontual | 300–500 | Coberto pelo Content Engine quando possível |
| Certificação/badges (emissão PDF, plataforma leve) | 0–100 | Degrau 3, barato |
| Comunidade (nada) / lives (ferramenta) | 0–50 | WhatsApp é grátis; lives no IG |
| Diretórios premium (G2, Capterra) | 0–150 | Gratuitos com cadastro |
| Parcerias/eventos (CBFA, congressos) | 0–1.500 | Sazonal, Q3 |
| Ads (boost de conteúdo top + retargeting) | 0–2.500 | Gateado por experimento bem-sucedido |
| **Total lean** | **~R$ 450–1.600/mês** | Sem ads: fica abaixo de R$1k/mês |

**Regra de investimento**: orgânico primeiro; ads só quando um ativo provou converter (kill/scale §22).

---

## 21. Riscos

| # | Risco | Prob. | Impacto | Mitigação |
|---|-------|:-----:|:-------:|-----------|
| 1 | **Erro clínico no conteúdo** (protocolo/escala errada) | Média | Alto | Revisão clínica obrigatória (fono consultora), disclaimers, fonte CFFa |
| 2 | **LGPD: coleta sem consentimento / dado de saúde** | Baixa | Alto | Consentimento granular, coleta mínima, opt-out fácil, registro de base legal |
| 3 | **Conteúdo IA de baixa qualidade / duplicado** | Média | Médio | Padrões AGENTS.md, upsert por slug, revisão de estilo, human approval |
| 4 | **Dependência de algoritmo IG/Google** | Alta | Médio | Owned media (newsletter, comunidade WhatsApp, SEO/GEO), distribuição multi-canal |
| 5 | **Mudanças de SEO/AEO/GEO** (zero-click, AI Overviews) | Alta | Médio | Diversificar (earned media, dados proprietários, comunidade), monitorar semanal |
| 6 | **Burnout de operação 1-pessoa + IA** | Média | Alto | Automações com gate humano; não "fazer tudo"; RACI enxuto; kill de experimentos que não escalam |
| 7 | **Falso positivo de tração** (tráfego sem trial) | Média | Médio | Métricas de funil, trial qualificado, activation tracking |
| 8 | **Parcerias/eventos caros sem retorno** | Baixa | Médio | Eventos apenas no Q3 com critério de convite/ROI |
| 9 | **Reputação: concorrente generalista copia conteúdo** | Média | Baixo | Velocidade (1 post/dia), dados proprietários, autoridade de nicho |
| 10 | **Certificação sem valor percebido** | Média | Baixo | Gate de escala (300 inscritos) antes de investir em LMS |

---

## 22. Critérios de Kill / Scale

**Kill** (matar) e **Scale** (escalar) por experimento — decisão mensal, dados orientam (princípio GEOS/AGENTS.md).

| Experimento | Kill se... | Scale quando... |
|-------------|-----------|-----------------|
| Blog cluster | Cluster sem tráfego/impressões em 90d OU nenhum lead | Cluster com 500+ visitas/mês e CTR→email >1% |
| Newsletter | Open <20% por 3 semanas seguidas | 500 inscritos e open >35% |
| Ferramentas grátis | <30 uses/mês após 60d | >200 uses/mês e conversão tool→email >20% |
| Academy | <50 inscritos em 90d OU conclusão <10% | 300 inscritos acumulados + 15% conclusão |
| Comunidade | <20 membros ativos em 60d OU vira canal de suporte | 100 membros ativos, <24h resposta, trials influenciados |
| Certificação | <20 certificados em 90d pós-lançamento | 100+ certificados e certificada→trial >10% |
| Eventos/parcerias | Custo/lead >3x CAC pago | Custo/lead < CAC e 5+ trials por evento |
| Ads (boost) | ROAS<1 em 2 semanas de teste | ROAS>2 e tração do ativo provada |
| GEO (queries) | Sem melhora de score em 90d apesar de posts | 3/5 citações e 1 citação com clique (GA4 AI referral) |

---

## 23. Instrumentação e Dashboards

### 23.1 Stack de medição

| Camada | Ferramenta | O que mede |
|--------|-----------|------------|
| Tráfego/comportamento | GA4 | Pageviews, sessões, AI referrals, conversões de email |
| Busca orgânica | Google Search Console | Impressões, cliques, posição, indexação |
| Rank/backlinks | Ahrefs/SE Ranking (ou free: GSC + ferramentas de site) | Rankings top 10, DR, backlinks |
| GEO/AEO | Log semanal manual nas 4 plataformas + ferramenta dedicada (opcional) | Citações, share of voice, score |
| Email | Resend | Open, CTR, unsubscribe, conversão de sequência |
| Conversão/produto | Supabase + Analytics interno | Trial starts, onboarding, sessões, MRR (billing) |
| Comunidade | Métricas do grupo WhatsApp (participação) + CSV mensal | Membros ativos, respostas <24h |
| **GEOS** | `geos analytics collect` / `geos cc audit` / `geos doctor` | Métricas determinísticas, health check |

### 23.2 Dashboards recomendados

1. **Painel Crescimento Orgânico (semanal)**: pageviews, rankings, GEO score, inscritos newsletter, downloads de materiais, uses de tools, trials.
2. **Painel Funil (semanal)**: atrair→capturar→nutrir→qualificar→testar→converter (nºs e taxas).
3. **Painel Academy/Comunidade (mensal)**: inscritos, conclusão, certificados, membros ativos, cases.
4. **Painel GEOS (mensal)**: `geos analytics collect` + score GEO + health.

### 23.3 Modelo de atribuição (realista para o estágio)

**Attribution influenced, não first/last-touch.** Um lead que leu 3 posts + newsletter + usou calculadora + trial conta como influenciado por conteúdo. Registrar source em cada etapa (UTM + eventos). A comunidade exige "influence model" que a equipe aceite (lição community-led B2B).

---

## 24. Fontes

> **Data de acesso: 2026-08-13.** Pesquisa web atual (fontes primárias e análises especializadas). Todos os links verificados sintaticamente; alguns (paywalled/dinâmicos) validados pela busca, não por navegação completa. Nota: `mcdonalds.com/qa/.../training-and-education.html` (fonte #23) bloqueia acesso por script (CDN/geo) — conteúdo verificado via busca (200 nos buscadores, página oficial "Training & Education", campi da Hamburger University).

### 24.1 Big tech / ecossistemas de educação

| # | Empresa | Fonte | Link | Tipo |
|---|---------|-------|------|------|
| 1 | AWS | AWS Skill Builder (digital training oficial) | https://skillbuilder.aws/ · https://aws.amazon.com/training/digital | Primária |
| 2 | AWS | AWS Training & Certification (Educate, re:Post, Ramp-Up Guides, Twitch live) | https://aws.amazon.com/training | Primária |
| 3 | AWS | AWS Education Programs (Skills Centers) | https://educationprograms.skillbuilder.aws/ | Primária |
| 4 | AWS | Análise do ecossistema Skill Builder (tiers, Cloud Quest, microcredentials, 31M learners) | https://skywork.ai/slide/en/aws-skill-builder-ai-courses-2069435054270586880 | Análise |
| 5 | AWS | Guia de cursos gratuitos Skill Builder + badges Credly | https://scholaty.com/career/articles/cloud-computing/amazon-aws/free-aws-skill-builder-courses.html | Análise |
| 6 | Stripe | Developer resources / API docs (agent-ready) | https://docs.stripe.com/development | Primária |
| 7 | Stripe | Teardown da DX (docs 3 colunas, Markdoc, agent-readable) | https://www.moesif.com/blog/best-practices/api-product-management/the-stripe-developer-experience-and-docs-teardown/ | Análise |
| 8 | Stripe | Developer-first business model (bottom-up, 7 linhas de código) | https://www.stratrix.com/vault/stripe-developer-first-strategy | Análise |
| 9 | Stripe | Case study content/growth (~367k visits docs, Capture the Flag, Atlas) | https://foundationinc.co/lab/stripe-content-marketing | Análise |
| 10 | Stripe | Docs como crescimento (academic-style) | https://devdocs.work/post/stripe-twilio-achieving-growth-through-cutting-edge-documentation | Análise |
| 11 | Google | Google Cloud training resources (Google Skills, 3.000+ recursos, badges, GEAR 35 créditos) | https://cloud.google.com/learn/training | Primária |
| 12 | Google | Google Cloud Skills Boost (antes Qwiklabs; badges, créditos, 300+ cursos grátis) | https://go.cloudskillsboost.google/ · https://meshworld.in/blog/reference/learning/google-cloud-skills-boost-badges | Primária/Análise |
| 13 | Google | Google Skillshop (treino grátis de produtos) | https://skillshop.withgoogle.com/ | Primária |
| 14 | Google | Road to Google Developers Certification / GDG (eventos comunitários, 5.000+ participantes) | https://developers.googleblog.com/road-to-google-developers-certification-google-cloud-expert-shares-insight/ | Primária |
| 15 | Microsoft | Microsoft Learn (treino grátis, certificações, comunidade, 4.459 resultados) | https://learn.microsoft.com/en-us/training/browse · https://www.microsoft.com/en/microsoft-learn | Primária |
| 16 | Microsoft | Microsoft Learn for Organizations (Virtual Training Days, AI Tour, Tech Community, Applied Skills) | https://learn.microsoft.com/en-us/training/organizations | Primária |
| 17 | Meta | Meta Blueprint (100+ cursos grátis, 8 certificações, webinars) | https://www.facebook.com/business/learn · https://www.facebookblueprint.com/ | Primária |
| 18 | Meta | Guia da certificação Meta Blueprint 2026 (custo exames US$99–150) | https://certififree.com/guides/meta-blueprint-certification-guide.html · https://www.stackmatix.com/blog/meta-ads-certification | Análise |
| 19 | iFood | iFood Decola (100+ cursos grátis, 200 mil inscritos, 140 mil certificados) | https://blog-parceiros.ifood.com.br/ifood-decola/ | Primária |
| 20 | iFood | iFood Educação (Decola, Potência Tech, Meu Diploma, AprendiZap) | https://institucional.ifood.com.br/noticias/ifood-educacao | Primária |
| 21 | iFood | iFood Move 2026 (evento anual São Paulo Expo, conteúdo + networking) | https://www.ifoodmove.com.br/ | Primária |
| 22 | iFood | Embarque iFood (30 dias de consultoria grátis a novos parceiros) | https://blog-parceiros.ifood.com.br/embarque-ifood/ | Primária |
| 23 | McDonald's | Treinamento e educação oficial (Hamburger University, campi globais) | https://www.mcdonalds.com/qa/en-qa/career_mcd/training-and-education.html | Primária |
| 24 | McDonald's | Análise do sistema de treino (3 camadas: crew, HU, Archways) | https://amazingworkplaces.co/mcdonalds-employee-training-programs-explained/ | Análise |
| 25 | McDonald's | HU como "sistema operacional" de consistência global | https://www.prismnews.com/workplace/mcdonalds/mcdonalds-hamburger-university-trains-managers-for-global | Análise |

### 24.2 SEO / AEO / GEO (2025–2026)

| # | Fonte | Link | Insight usado |
|---|-------|------|---------------|
| 26 | Estudo GEO (Princeton/Georgia Tech/Allen AI) — paper original | https://arxiv.org/abs/2311.09735 | Fundamento do GEO; 10k queries |
| 27 | Guia AEO/GEO 2026 (CTR -58% AI Overviews, zero-click 83%, tráfego generativo +796%) | https://www.doingdigital.me/o-guia-definitivo-de-aeo-e-geo-para-2026-como-posicionar-o-seu-site-na-era-da-pesquisa-por-ia | Dados de mercado |
| 28 | GEO como pacote de expansão do SEO (BrightonSEO; tríade do SEO moderno) | https://br.hedgehogdigital.co.uk/blog/generative-engine-optimization | Enquadramento estratégico |
| 29 | Guia de otimização de LLM/GEO (citações de terceiros 94%, dados estruturados, entidade) | https://dageno.ai/pt/blog/how-to-do-llm-optimization | Práticas GEO |
| 30 | Top ferramentas AEO 2026 (Semrush, Airefs, LLMClicks, etc.) | https://dageno.ai/pt/blog/best-aeo-tools | Instrumentação GEO |

### 24.3 Community-led growth / cases / conteúdo B2B

| # | Fonte | Link | Insight usado |
|---|-------|------|---------------|
| 31 | Community-led growth: CAC -30-60%, NRR 2-3x, churn -40%, UGC +400% leads | https://fungies.io/community-led-growth-saas | Tese comunidade |
| 32 | Community over ads (playbook, influence model, regras anti-suporte) | https://www.influencers-time.com/community-growth-over-ads-scalable-saas-strategy-for-2025 | Operação de comunidade |
| 33 | Case studies influenciam compra: 73% dos buyers B2B | https://www.heinzmarketing.com/blog/the-power-of-social-proof-how-b2b-case-studies-influence-purchasing-decisions/ | Prova social |
| 34 | CMI B2B Content Marketing Benchmarks 2025 (newsletter 71%, cases/vídeos top) | https://contentmarketinginstitute.com/b2b-research/b2b-content-marketing-trends-research-2025 | Benchmarks de conteúdo |
| 35 | Benchmarks lead gen SaaS (CAC orgânico US$164 vs pago US$310) | https://www.leadscrape.com/lead-generation-for-saas.html | CAC orgânico |

### 24.4 Fontes internas (base Evolua)

| # | Fonte | Caminho |
|---|-------|---------|
| 36 | Cliente (persona, dores, JTBD, mercado) | `.doc/cliente.md` |
| 37 | Empresa (posicionamento, modelo, tiers) | `.doc/empresa.md` |
| 38 | Produto (módulos, integrações) | `.doc/produto.md` |
| 39 | Métricas (North Star, funil, GEO) | `.doc/metricas.md` |
| 40 | Roadmap (fases) | `.doc/roadmap.md` |
| 41 | GEO experiment (baseline 2.4/10, 5 queries, concorrentes) | `.doc/geo-experiment.md` |
| 42 | Automações de marketing (auditoria) | `.doc/automation-marketing-audit.md` |
| 43 | Spec marketing (canais ativos, GEO, gaps) | `openspec/specs/marketing/spec.md` |
| 44 | Inteligência competitiva (vacância, gaps, concorrentes) | `docs/competitive-intelligence/_summary.md` |
| 45 | Estratégia de conteúdo (15 ideias priorizadas) | `docs/competitive-intelligence/_content-strategy.md` |
| 46 | Brand kit (tom de voz, cores, proibições) | `docs/BRAND-KIT.md` |
| 47 | Calendário editorial (pilares, canais, lead magnets, OKRs) | `docs/calendario-editorial.md` |
| 48 | GEOS config (domínios, aprovações, experimento) | `.geos/geos.yaml` |

---

### Anexo — Decisões de adaptação (por que NÃO copiar táticas)

| Tática big-tech | Por que não copiar crua | Adaptação Evolua |
|-----------------|--------------------------|------------------|
| Docs/API como aquisição (Stripe) | ICP não é dev | "Central de Ajuda + Guias Clínicos" e Academy como produto educacional |
| Certificação paga como receita (AWS/Meta, US$99–200) | Fono não paga por certificado de software cedo; mercado pequeno | Certificação grátis com badge (distribuição), monetizar depois via Academy como produto (Fase 4) |
| Discord/Slack como comunidade (devs) | Fono vive no WhatsApp | Comunidade WhatsApp (modelo iFood AprendiZap) + lives no IG |
| LinkedIn-first B2B | Fono autônoma é Instagram-first | IG topo de funil; LinkedIn para fundador/parceiros/B2B |
| LMS/cursos gigantes (Skill Builder 600+ cursos) | Estágio MVP, 1 pessoa + IA | Academy em 4 degraus, começa por email (mini-cursos) |
| Free tier de infra massivo (AWS) | Custo de infra alto para MVP | Trial 14d + Ferramentas grátis de conteúdo (calculadoras, gerador) |
| Evento presencial gigante (iFood Move/Microsoft AI Tour) | Custo alto cedo | Evento/saída a partir do Q3, com ROI definido; live IG mensal como substituto barato |
| McDonald's (treinamento interno de funcionários) | Nossa "franquia" é a base de clientes | Aplicar o princípio: **conteúdo padronizado e repetível** (playbook de gestão) como motor de consistência da marca |
