# Evolua — Métricas

## North Star Metric
**Sessões completadas por fonoaudióloga por mês**
(Medir adoção real do produto — se a fono usa o Evolua para completar sessões, o produto está funcionando)

## Produto

### Adoção
| Métrica | Target | Atual | Fonte |
|---------|--------|-------|-------|
| Usuários ativos mensais (MAU) | 100 | Beta | Supabase Auth |
| Usuários ativos semanais (WAU) | 50 | Beta | Supabase Auth |
| Sessões criadas/mês | 500 | Beta | DB |
| Pacientes cadastrados | 1.000 | Beta | DB |
| Módulos usados/usuário | 5+ | Beta | Analytics |

### Engajamento
| Métrica | Target | Atual | Fonte |
|---------|--------|-------|-------|
| Dwell time (min/sessão) | 15 | ? | Analytics |
| WhatsApp messages processadas | 1.000/mês | 0 | WA gateway |
| Relatórios gerados por IA | 100/mês | 0 | AI service |
| Documentos RAG consultados | 200/mês | 0 | AI service |

### Qualidade
| Métrica | Target | Atual | Fonte |
|---------|--------|-------|-------|
| Uptime API | 99.9% | ? | Render |
| Uptime AI Service | 99.5% | ? | Render |
| Latência API p50 | <200ms | ? | Render |
| Latência AI p50 | <3s | ? | Render |
| Erros 5xx/dia | <5 | ? | Sentry |

## Negócio

### Revenue
| Métrica | Target | Atual | Fonte |
|---------|--------|-------|-------|
| MRR | R$ 5.000 | R$ 0 | AbacatePay/Stripe |
| ARR | R$ 60.000 | R$ 0 | Calculado |
| Churn mensal | <5% | N/A | Billing |
| LTV/CAC | >3x | N/A | Billing |
| ARPU | R$ 300 | N/A | Billing |

### Acquisition
| Métrica | Target | Atual | Fonte |
|---------|--------|-------|-------|
| Trial starts/mês | 50 | 0 | Auth |
| Trial → Paid conversion | >15% | N/A | Billing |
| CAC | <R$ 500 | N/A | Ads |
| Organic traffic/mês | 5.000 | ? | GA4 |
| Blog posts published | 30/mês | ~20 | Supabase |

## Marketing (GEOS Analytics)

### Content
| Métrica | Target | Atual | Fonte |
|---------|--------|-------|-------|
| Blog posts/mês | 30 | ~20 | Supabase |
| Pageviews/mês | 10.000 | ? | GA4 |
| Avg time on page | >2min | ? | GA4 |
| Bounce rate | <60% | ? | GA4 |
| Leads from content | 100/mês | 0 | CRM |

### SEO
| Métrica | Target | Atual | Fonte |
|---------|--------|-------|-------|
| Domain authority | 20+ | ? | Ahrefs |
| Backlinks | 100+ | ? | Ahrefs |
| Keywords top 10 | 50+ | ? | GSC |
| Organic traffic | 5.000/mês | ? | GSC |

### GEO (Generative Engine Optimization)
| Métrica | Target | Atual | Fonte |
|---------|--------|-------|-------|
| Citations in AI answers | 3+ queries | 0 | GEO experiment |
| Brand mentions in ChatGPT | Baseline | 0 | GEO experiment |
| Citations in Claude | Baseline | 0 | GEO experiment |
| Citations in Gemini | Baseline | 0 | GEO experiment |

## Infra
| Métrica | Target | Atual | Fonte |
|---------|--------|-------|-------|
| Deploy frequency | 1/day | ? | GitHub Actions |
| Lead time for changes | <1h | ? | GitHub Actions |
| MTTR | <30min | ? | Sentry |
| Change failure rate | <5% | ? | GitHub Actions |
