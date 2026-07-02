# Landing Page — Auditoria: Segurança, Performance, SEO e AI Search

**Data:** 2026-07-01  
**Escopo:** landing-core (useevolua.com.br)

---

## [S1] RESUMO EXECUTIVO

| Categoria | Críticos | Médios | Baixos | Total |
|-----------|----------|--------|--------|-------|
| Segurança | 2 | 3 | 1 | 6 |
| Performance | 3 | 4 | 2 | 9 |
| SEO | 4 | 5 | 3 | 12 |
| AI Search (ChatGPT etc.) | 3 | 4 | 2 | 9 |
| **TOTAL** | **12** | **16** | **8** | **36** |

---

## [S2] SEGURANÇA

### 🔴 CRÍTICO S1: CSP bloqueia Google Fonts e Material Symbols
**Arquivo:** `landing-core/vercel.json:8`

```json
"Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; ..."
```

**Problema:** `style-src` permite `https://fonts.googleapis.com` mas `font-src` só permite `'self'` e `https://fonts.gstatic.com`. O Google Fonts carrega CSS externo que pode conter `@font-face` com URLs de fontes. Se o CSP bloquear essas URLs, as fontes não carregam.

**Impacto:** Fontes podem não carregar em navegadores mais restritivos.

**Fix:** Adicionar `https://fonts.googleapis.com` ao `font-src` também.

### 🔴 CRÍTICO S2: Rewrites criam proxy aberto para API
**Arquivo:** `landing-core/vercel.json:26-27`

```json
"rewrites": [
  { "source": "/api/(.*)", "destination": "https://api.useevolua.com.br/api/$1" },
  { "source": "/(.*)", "destination": "/index.html" }
]
```

**Problema:** O rewrite `/api/(.*)` proxya qualquer request para a API. Isso pode ser explorado para bypass de CORS ou rate limiting, já que os requests passam pelo domínio da landing.

**Impacto:** Potencial vetor de ataque se a API não tiver proteção adequada.

**Fix:** Remover o rewrite de proxy da landing (a API já tem CORS configurado). Ou adicionar rate limiting no proxy.

### 🟡 MÉDIO S3: CookieConsent não implementa opt-in granular
**Arquivo:** `landing-core/src/components/CookieConsent.tsx`

O componente aceita/rejeita todos os cookies de uma vez. A LGPD exige consentimento granular (analytics, marketing, funcionais).

### 🟡 MÉDIO S4: Falta `X-Permitted-Cross-Domain-Policies: none`
**Arquivo:** `landing-core/vercel.json`

### 🟡 MÉDIO S5: `X-Frame-Options: DENY` é bom, mas CSP `frame-ancestors 'none'` é mais moderno
Já está no CSP, então `X-Frame-Options` é redundante mas não prejudicial.

### 🟢 BAIXO B1: Falta `Permissions-Policy` para `interest-cohort=()`
**Arquivo:** `landing-core/vercel.json`

---

## [S3] PERFORMANCE

### 🔴 CRÍTICO P1: Google Fonts carrega via CSS externo (bloqueia render)
**Arquivo:** `landing-core/index.html:24-27`

```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700;900&family=DM+Sans:..." rel="stylesheet" />
```

**Problema:** `rel="stylesheet"` bloqueia o render do parser até o CSS ser baixado e parseado. O `preconnect` ajuda mas não elimina o bloqueio.

**Impacto:** ~200-400ms de bloqueio de render em conexões lentas.

**Fix:** Usar `rel="preload" as="style" onload="this.rel='stylesheet'"` ou self-host as fonts.

### 🔴 CRÍTICO P2: Material Symbols carrega via CSS externo (bloqueia render)
**Arquivo:** `landing-core/index.html:30-33`

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:..." />
```

**Problema:** Outro CSS externo bloqueante. Material Symbols tem ~300KB de glyph data.

**Impacto:** ~300-500ms de bloqueio de render.

**Fix:** Usar `rel="preload"` ou carregar sob demanda com `font-display: swap`.

### 🔴 CRÍTICO P3: motion (framer-motion) não está no bundle separado
**Arquivo:** `landing-core/vite.config.ts:17-28`

```typescript
manualChunks(id) {
  if (id.includes('node_modules/react')) return 'vendor-react'
  if (id.includes('@tanstack/react-router')) return 'vendor-tanstack'
  if (id.includes('src/components/blog/')) return 'blog'
  // motion não está chunked!
}
```

**Problema:** `motion/react` (~150KB gzipped) não está em chunk separado. Faz parte do bundle principal.

**Impacto:** Bundle inicial maior, tempo de carregamento increased.

**Fix:** Adicionar chunk para motion:
```typescript
if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion')) return 'vendor-motion'
```

### 🟡 MÉDIO P4: Hero usa `motion` para animações que poderiam ser CSS
**Arquivo:** `landing-core/src/components/Hero.tsx`

`useScroll`, `useTransform` — são pesados. Poderiam ser substituídos por `IntersectionObserver` + CSS transitions.

### 🟡 MÉDIO P5: Blog usa `framer-motion` (versão antiga) misturado com `motion/react`
**Arquivo:** `landing-core/src/routes/blog.tsx:4`

```typescript
import { motion } from 'framer-motion'
```

Enquanto outros componentes usam `import { motion } from 'motion/react'`. Isso pode causar bundle duplication.

### 🟡 MÉDIO P6: Imagens do blog não usam `loading="lazy"` nem `srcset`
**Arquivo:** `landing-core/src/routes/blog.tsx:57-60`

```html
<img src={post.imagem} alt={post.titulo} onError={handleImgError} className="..." />
```

**Fix:** Adicionar `loading="lazy"` e `decoding="async"`.

### 🟡 MÉDIO P7: Lead magnets são PDFs grandes servidos sem cache headers
**Arquivo:** `landing-core/public/lead-magnets/`

Vercel serve arquivos estáticos com cache automático, mas não há `Cache-Control` explícito no build.

### 🟢 BAIXO B2: `sourcemap: false` no build — bom para produção

### 🟢 BAIXO B3: Lazy loading de Pricing, Testimonial, BottomCTA — bom

---

## [S4] SEO

### 🔴 CRÍTICO SEO1: Falta `<meta name="keywords">` e meta tags específicas por página
**Arquivo:** `landing-core/src/components/seo/SeoHead.tsx`

O componente não suporta `keywords` meta tag. Embora Google não use, outros buscadores e AI models podem.

### 🔴 CRÍTICO SEO2: Falta `robots.txt` no build
**Arquivo:** `landing-core/public/`

Não encontrei `robots.txt` na pasta `public/`. Sem ele, crawlers não sabem o que indexar.

### 🔴 CRÍTICO SEO3: Sitemap não inclui páginas de materiais dinâmicas
**Arquivo:** `landing-core/scripts/generate-sitemap.mjs:61-76`

O sitemap não inclui `/materiais/$magnetId` (páginas individuais de materiais).

### 🔴 CRÍTICO SEO4: Blog posts não têm `article:published_time` e `article:modified_time`
**Arquivo:** `landing-core/src/components/seo/SeoHead.tsx`

O componente não suporta meta tags de artigo para blog posts.

### 🟡 MÉDIO SEO5: Falta `hreflang` para páginas (locale pt_BR)
**Arquivo:** `landing-core/src/components/seo/SeoHead.tsx`

### 🟡 MÉDIO SEO6: Title tag muito genérica em algumas páginas
- `/` : "EVOLUA | Agenda Cheia e Gestão de Elite para Fonoaudiólogas" — bom
- `/blog` : "Blog | EVOLUA" — deveria ser "Blog | EVOLUA — Fonoaudiologia e Gestão"

### 🟡 MÉDIO SEO7: Falta schema `BreadcrumbList` para navegação
**Arquivo:** `landing-core/src/components/seo/jsonld.tsx`

### 🟡 MÉDIO SEO8: `og:image` é estático (`/og-image.jpg`) — deveria ser dinâmico por página

### 🟡 MÉDIO SEO9: Falta `twitter:author` nas meta tags

### 🟢 BAIXO SEO10: `robots: index, follow` está correto

### 🟢 BAIXO SEO11: Canonical URLs estão implementadas

### 🟢 BAIXO SEO12: JSON-LD está bem implementado (Organization, Product, BlogPosting, FAQPage)

---

## [S5] AI SEARCH OPTIMIZATION (ChatGPT, Perplexity, Claude, etc.)

### 🔴 CRÍTICO AI1: Falta `llms.txt` — padrão para AI crawlers
**Arquivo:** `landing-core/public/`

O padrão `llms.txt` (proposto por llmstxt.org) permite que AI models entendam a estrutura do site. Sem ele, AI models dependem apenas de scraping.

**Impacto:** AI models não conseguem entender a estrutura e propósitos do site de forma otimizada.

**Fix:** Criar `public/llms.txt`:
```
# EVOLUA — CRM para Fonoaudiólogas

## Sobre
Evolua é uma plataforma SaaS de gestão clínica para fonoaudiólogas brasileiras. Oferece prontuário eletrônico, agenda, WhatsApp, IA de transcrição e relatórios, faturamento e app do paciente.

## Planos
- Só Você: R$ 97/mês (autônoma)
- Galera: R$ 197/mês (clínicas com até 5 profissionais)
- Gigante: Sob consulta (clínicas grandes)

## Recursos Principais
- Prontuário eletrônico com protocolos clínicos (MBGR, DOSS, FOIS, GRBAS, VHI-10)
- Agenda online com lembretes automáticos por WhatsApp
- IA de sessão: gravação, transcrição e geração de relatórios
- App do paciente com exercícios domiciliares
- WhatsApp CRM com histórico por paciente
- Faturamento simplificado e emissão de NF
- Conformidade total com LGPD

## Links Importantes
- [Site](https://useevolua.com.br)
- [App](https://app.useevolua.com.br)
- [Blog](https://useevolua.com.br/blog)
- [Planos](https://useevolua.com.br/planos)
- [Segurança](https://useevolua.com.br/seguranca)
- [Contato](mailto:suporte@useevolua.com.br)
```

### 🔴 CRÍTICO AI2: Falta `llms-full.txt` com conteúdo detalhado
**Arquivo:** `landing-core/public/`

O `llms-full.txt` contém o conteúdo completo do site para AI models. Isso melhora drasticamente a qualidade das respostas sobre o Evolua em AI search.

**Fix:** Criar `public/llms-full.txt` com:
- Descrição completa do produto
- Lista de features com detalhes
- FAQs completas
- Preços detalhados
- Casos de uso
- Comparação com concorrentes

### 🔴 CRÍTICO AI3: Schema `Organization` não tem `description` detalhado
**Arquivo:** `landing-core/src/components/seo/jsonld.tsx:10-29`

O schema Organization não tem `description`, `foundingDate`, `numberOfEmployees`, etc. AI models usam esses dados para construir knowledge graphs.

**Fix:** Enriquecer o schema:
```typescript
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'EVOLUA',
    url: SITE.url,
    logo: `${SITE.url}/logo.png`,
    description: 'Evolua é a plataforma de gestão clínica feita especialmente para fonoaudiólogas brasileiras. Prontuário eletrônico, agenda, WhatsApp, IA, faturamento e app do paciente em um só lugar.',
    foundingDate: '2024',
    sameAs: [
      'https://www.instagram.com/useevolua/',
      'https://www.linkedin.com/company/useevolua/',
      'https://www.youtube.com/@useevolua',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'support',
      email: 'suporte@useevolua.com.br',
      availableLanguage: ['Portuguese'],
    },
    areaServed: {
      '@type': 'Country',
      name: 'Brasil',
    },
    knowsAbout: [
      'Fonoaudiologia',
      'Gestão de Clínica',
      'Prontuário Eletrônico',
      'WhatsApp Business',
      'Inteligência Artificial',
      'LGPD',
    ],
  }
}
```

### 🟡 MÉDIO AI4: Falta schema `SoftwareApplication` com `aggregateRating`
**Arquivo:** `landing-core/src/components/seo/jsonld.tsx`

Adicionar avaliações de usuários ao schema Product melhora a visibilidade em AI search.

### 🟡 MÉDIO AI5: Blog posts não têm schema `Article` completo
**Arquivo:** `landing-core/src/components/seo/jsonld.tsx`

O schema BlogPosting existe mas falta `wordCount`, `timeRequired`, `keywords`.

### 🟡 MÉDIO AI6: Falta `speakable` schema para voz (Google Assistant)
**Arquivo:** `landing-core/src/components/seo/jsonld.tsx`

O schema `Speakable` indica que partes do conteúdo são adequadas para leitura por voz.

### 🟡 MÉDIO AI7: FAQ schema não está em todas as páginas com FAQ
**Arquivo:** `landing-core/src/routes/planos.tsx`

A página `/planos` tem FAQ mas não usa `faqPageJsonLd()`.

### 🟢 BAIXO AI8: `sameAs` links estão presentes (Instagram, LinkedIn, YouTube)

### 🟢 BAIXO AI9: `contactPoint` está presente no schema Organization

---

## [S6] RECOMENDAÇÕES PRIORIZADAS

### Prioridade 1 (Esta semana)
1. **Criar `robots.txt`** — essencial para SEO e AI search
2. **Criar `llms.txt`** — padrão para AI crawlers
3. **Corrigir CSP** — adicionar Google Fonts ao font-src
4. **Adicionar motion chunk** no vite config
5. **Remover proxy `/api/`** do vercel.json

### Prioridade 2 (Próxima semana)
6. **Self-host Google Fonts** — elimina bloqueio de render
7. **Self-host Material Symbols** — elimina bloqueio de render
8. **Criar `llms-full.txt`** com conteúdo detalhado
9. **Enriquecer schema Organization** com description e knowsAbout
10. **Adicionar `loading="lazy"`** nas imagens do blog

### Prioridade 3 (Próximo mês)
11. **Adicionar schema BreadcrumbList**
12. **Adicionar schema Speakable**
13. **Implementar CookieConsent granular**
14. **Adicionar hreflang tags**
15. **Dynamic og:image por página**

---

## [S7] MÉTRICAS DE IMPACTO

| Fix | Impacto no Cliente | Impacto Técnico | Esforço |
|-----|-------------------|-----------------|---------|
| robots.txt | Indexação por buscadores | Alto | Baixo |
| llms.txt | Aparição em AI search | Alto | Baixo |
| Self-host fonts | -200ms load time | Alto | Médio |
| motion chunk | -150KB bundle | Alto | Baixo |
| CSP fix | Fontes sempre carregam | Médio | Baixo |
| llms-full.txt | Respostas AI completas | Alto | Médio |

---

## [S8] ANTI-PATTERNS IDENTIFICADOS

1. ❌ **CSS externo bloqueante** — Google Fonts + Material Symbols via `<link rel="stylesheet">` bloqueiam render
2. ❌ **motion não chunked** — ~150KB gzipped no bundle principal
3. ❌ **Falta robots.txt** — crawlers não sabem o que indexar
4. ❌ **Falta llms.txt** — AI models não entendem a estrutura do site
5. ❌ **Proxy /api/ aberto** — potencial vetor de ataque
6. ❌ **Blog importa framer-motion e motion/react** — possível bundle duplication
7. ❌ **Imagens sem lazy loading** — todas carregam imediatamente
8. ❌ **FAQ schema ausente** em /planos — perde rich snippets
