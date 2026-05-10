# Plano Estratégico de Marketing - Evolua 2026

## Visão Geral

O blog do Evolua será o **hub central de conteúdo** para atração e nutrição de leads no mercado de fonoaudiologia. Seguindo as tendências de marketing 2026, focamos em **SEO conversacional com IA**, **E-E-A-T** (Experience, Expertise, Authoritativeness, Trustworthiness), e **conteúdo季 Driven**.

---

## 1. Objetivos de Marketing

### Metas 2026
| Meta | target | Timeline |
|------|--------|----------|
| Visitantes únicos/mês | 15.000 | Dez/2026 |
| Leads qualificados (SQLs) | 150/mês | Dez/2026 |
| Taxa de conversão blog→demo | 4% | Dez/2026 |
| Artigos publicados | 48 (4/mês) | Dez/2026 |

### Funil de Conteúdo
```
TOFU (Awareness)     → Artigos educativos, tendências
    ↓
MOFU (Consideration)  → Comparativos, case studies
    ↓
BOFU (Decision)      → Demo requests, pricing
```

---

## 2. Estratégia de Conteúdo

### Pilares de Conteúdo

1. **Gestão de Clínica**
   - Produtividade
   - Automação
   - Software para fonoaudiologia

2. **Marketing para Fonoaudiólogos**
   - Atração de pacientes
   - Presença digital
   - Redes sociais

3. **Tendências em Fonoaudiologia**
   - Teleconsulta
   - IA na saúde
   - Tecnologias emergentes

4. **Vida Profissional**
   - Equilíbrio trabalho-vida
   - Escalabilidade de clínica
   - Especialização

### Formatos de Conteúdo

| Formato | Frequência | Objetivo |
|---------|------------|----------|
| Artigos longos (SEO) | 2x/mês | Traffic + leads |
| Posts curtos | 2x/mês | Engajamento |
| Infográficos | 1x/mês | Compartilhamento |
| Webinars gravados | 1x/mês | Nutrição |
| Templates/Links | 1x/mês | Lead magnets |

---

## 3. Tendências 2026 Aplicadas

### 3.1 SEO com IA Generativa
- Otimização para **Search Generative Experience (SGE)**
- FAQs estruturados para featured snippets
- Conteúdo conversacional respondendo perguntas reais

### 3.2 E-E-A-T Centered Content
- Perfis de autores especialistas
- Citações de estudos e fontes confiáveis
- Atualização contínua de artigos

### 3.3 Omnichannel Experience
- Blog → Email → Demo
- Integração com redes sociais
- Remarketing baseado em conteúdo

### 3.4 IA para Personalização
- Recomendações de artigos baseadas em comportamento
- CTAs dinâmicos por segmento
- Email marketing automatizado

---

## 4. Estrutura do Blog

### Rotas
```
/blog                          → Lista de artigos
/blog/[slug]                   → Artigo individual
/blog/categoria/[category]      → Artigos por categoria
/blog/autor/[author]           → Artigos por autor
/blog/busca                   → Busca de artigos
```

### Componentes
- **BlogCard**: Card de preview para lista
- **ArticleHeader**: Header com meta info
- **TableOfContents**: Índice lateral
- **AuthorBio**: Bio do autor com credenciais
- **RelatedPosts**: Artigos relacionados
- **NewsletterCTA**: Call-to-action para newsletter
- **ShareButtons**: Botões de compartilhamento

---

## 5. Lead Magnets

| Lead Magnet | Conteúdo | Gatilho |
|-------------|----------|---------|
| Checklist Gestão | PDF com 20 dicas | Download |
| Planilha Financeiro | Controle mensal | Download |
| Curso Email Marketing | 7 emails | Cadastro |
| Consultoria Gratuita | 30min | Demo request |
| E-book Tendências | Guia completo | Download |

---

## 6. Métricas e KPIs

### Vanity Metrics
- Visitantes únicos
- Pageviews
- Tempo na página
- Taxa de rejeição

### Business Metrics
- Leads gerados
- SQLs (Sales Qualified Leads)
- Taxa conversão demo
- CAC (Customer Acquisition Cost)
- ROI de conteúdo

### Engagement Metrics
- Newsletter subscribers
- Comentários
- Compartilhamentos
- Backlinks

---

## 7. Calendário Editorial 2026

### Q1: Fundação
- [ ] Estrutura técnica do blog
- [ ] 8 artigos base (2 por pilar)
- [ ] Configuração SEO (sitemap, robots, schema)
- [ ] Integração analytics

### Q2: Crescimento
- [ ] 12 artigos adicionais
- [ ] 3 lead magnets
- [ ] Email marketing configurado
- [ ] Redes sociais integradas

### Q3: Escala
- [ ] 12 artigos + video
- [ ] Webinar mensal
- [ ] Guest posts
- [ ] Parcerias

### Q4: Otimização
- [ ] Análise e ajustes
- [ ] 12 artigos finais
- [ ] Automação de nutricao
- [ ] Relatório anual

---

## 8. Stack Técnica

- **CMS**: Next.js (mesma estrutura do evolua-landing)
- **Banco de dados**: Supabase (mesmo do CRM)
- **SEO**: next-sitemap, schema markup, Open Graph
- **Analytics**: Himetrica + Google Analytics 4
- **Email**: Notifica + automação
- **Hosting**: Vercel

---

## 10. Sistema de Automação de Conteúdo

O conteúdo é gerado automaticamente usando o sistema em `squads/marketing/skills/content-automation/`.

### Componentes

1. **Research Engine** (`research.ts`)
   - Pesquisa artigos científicos no PubMed/BVS
   - Monitora Google Trends
   - Identifica topics relevantes

2. **Blog Post Generator** (`content-generator.ts`)
   - Gera posts completos com estrutura SEO
   - Inclui estatísticas e dicas práticas
   - Cria prompts para geração de imagens

3. **Ebook Generator** (`ebook-generator.ts`)
   - Cria lead magnets (checklists, guias)
   - Formatos: checklist, guide, blueprint
   - Include CTA e páginas de captura

4. **Social Content Generator** (`social-generator.ts`)
   - **Stories**: 5 slides por artigo
   - **Carrosséis**: 5 slides educativos
   - **Posts**: Otimizados para cada plataforma

### Como Usar

```bash
# Gerar conteúdo automaticamente
npm run generate

# Resultado
npm run generate
🎯 Evolua Content Automation

📝 BLOG POSTS GERADOS:
  Título: Guia Completo: gestão clínica
  Slug: guia-completo-gestao-clinica
  Tags: gestão clínica, fonoaudiologia, clínica, produtividade, organização

📚 EBOOK GERADO:
  Título: Checklist: Gestão de Clínica de Fonoaudiologia

📱 CONTEÚDO PARA REDES SOCIAIS:
  Total de assets: 6
  Stories: 5 slides
  Carrossel: 1
```

### Fluxo de Automação

```
Pesquisa Topics → Gera Blog Posts → Cria Ebook → Gera Social Content
       ↓               ↓                ↓              ↓
  Artigos       SEO Otimizado     Lead Magnet     Stories/Carrosséis
  Científicos   + Image Prompts  + CTA           + Captions
```

---

## 9. Cronograma de Implementação

### Fase 1: MVP (2 semanas)
1. Estrutura de rotas `/blog`
2. Componentes base
3. 4 artigos iniciais
4. SEO básico

### Fase 2: Lead Gen (2 semanas)
1. Newsletter signup
2. Lead magnets
3. CTAs otimizados
4. Analytics avançado

### Fase 3: Escala (4 semanas)
1. 12+ artigos
2. Categorização
3. Busca
4. Redes sociais
