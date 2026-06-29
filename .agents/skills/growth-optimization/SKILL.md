---
name: growth-optimization
description: Growth and conversion optimization skill for Evolua. Use when designing CRO experiments, creating landing pages, building email funnels, setting up analytics, running A/B tests, optimizing signup flows, or implementing retention programs. Drives measurable improvements across the entire customer acquisition and retention funnel.
---

# Growth Optimization — Evolua

## Core Responsibilities
Turn every visitor into a lead, every lead into a customer, every customer into an advocate. Own the conversion funnel end-to-end through experimentation, analytics, and optimization.

## Funnel Architecture

### Top of Funnel (Acquisition)
**Goal**: Convert traffic → leads
**Channels**: Landing pages, content gates, lead magnets, webinars
**Focus**: Improve CTA clarity, form optimization, load time
**Key Metrics**: Landing page conversion rate, cost per lead, bounce rate

### Middle of Funnel (Activation)
**Goal**: Convert leads → active trials
**Channels**: Email sequences, onboarding, product tours
**Focus**: Time-to-value, feature adoption, first key action
**Key Metrics**: Trial signup rate, activation rate, time-to-first-value

### Bottom of Funnel (Revenue)
**Goal**: Convert trials → paying customers
**Channels**: Sales emails, demo calls, pricing page, case studies
**Focus**: Objection handling, urgency, risk reversal
**Key Metrics**: Trial-to-paid conversion rate, average deal size, sales cycle length

### Post-Purchase (Retention)
**Goal**: Retain, upsell, referral
**Channels**: Email, in-app, WhatsApp, community
**Focus**: Onboarding completion, feature stickiness, NPS
**Key Metrics**: Churn rate, LTV, referral rate, expansion revenue

## CRO (Conversion Rate Optimization)

### Methodology
```
Hypothesis → Experiment → Analyze → Learn → Scale/Kill
```

### Hypothesis Structure
"Changing [element] on [page] from [current] to [variant] will [impact] because [reason]."

### Testing Priority Matrix
| Impact | Confidence | Effort | Score | Action |
|--------|------------|--------|-------|--------|
| High | High | Low | 9-10 | Do NOW |
| High | Medium | Low | 7-8 | This week |
| Medium | High | Low | 6-7 | This sprint |
| High | Low | Medium | 5-6 | Research first |
| Low | Any | Any | 1-4 | Deprioritize |

### Key Conversion Levers (Evolua-specific)
- **Pricing page**: Clarity on plan differences, annual vs. monthly savings, risk reversal (cancel anytime)
- **Signup flow**: Remove friction (social login, minimal fields), show value before asking for commitment
- **Trial onboarding**: First session setup wizard, WhatsApp integration demo, first patient import
- **Lead magnets**: Form length vs. conversion rate tradeoff; test 3-field vs. 5-field
- **Demo requests**: Calendar integration, auto-confirmation, reminder sequence

### A/B Testing Rules
- Run each test for minimum 7 days or 1000 visitors per variant (whichever comes last)
- Statistical significance: 95% minimum before declaring a winner
- One change per test (isolate variables)
- Document every test (hypothesis, results, learnings)
- No peeking at results before the test concludes

## Email Marketing

### Strategic Email Categories

| Type | Trigger | Goal | Cadence |
|------|---------|------|---------|
| Welcome Sequence | Trial signup | Activation | 5 emails over 7 days |
| Onboarding Drip | Day 2-14 | Feature adoption | 4 emails over 2 weeks |
| Nurture | Lead magnet download | Education → Trial | 6 emails over 3 weeks |
| Re-engagement | 30 days inactive | Win-back | 3 emails over 1 week |
| Newsletter | Weekly | Retention, authority | 1x/week (Sunday) |
| Promotional | Product launch, event | Conversion | As needed |
| Transactional | Billing, account | Support | As triggered |
| Referral | Post-purchase | Virality | 1 email post-purchase |

### Email Design Principles
- Mobile-first: 70%+ opens on mobile
- Preview text: 90-120 characters, extends subject line
- Single CTA per email
- Personalization: First name + segment (fono vs clinic owner)
- Plain text for nurture sequences (higher reply rates)
- HTML for newsletters and promotional

### Key Email Metrics
- Open rate (target: >25%)
- Click rate (target: >3%)
- Reply rate (target: >0.5% for nurture)
- Unsubscribe rate (max: <0.5%)
- Conversion rate (target: >2% for promotional)
- Deliverability rate (target: >98%)

## Landing Page Playbook

### Template Evolution
1. **Headline** (3-second value prop): Who this is for + what they get
2. **Sub-headline** (10-second clarification): Specific outcome + social proof hint
3. **Hero CTA**: 1 primary action, contrasting color, action-oriented text
4. **Trust signals**: Logos, testimonials, certifications, numbers
5. **Pain → Solution**: Problem their current reality → How Evolua fixes it
6. **Features as benefits**: "Import pacientes em 1 clique" not "Importação via CSV"
7. **Social proof**: Testimonials with real names + clinic + photo
8. **Risk reversal**: "Teste grátis por 7 dias, sem cartão"
9. **Final CTA**: Repeat the primary action with urgency element

### Page Types

| Page Type | Goal | Conversion Element |
|-----------|------|--------------------|
| Homepage | Awareness → Trial | Clear value prop + CTA |
| Feature page | Consideration → Signup | Demo video + comparison |
| Pricing page | Decision → Purchase | Plan comparison + FAQ |
| Landing page | Campaign → Lead | Focused CTA, no nav |
| Ebook LP | Content → Lead | Form + preview + benefits |

### Optimization Checklist per Page
- [ ] Loads in <2 seconds (desktop), <3 seconds (mobile)
- [ ] Primary CTA above the fold
- [ ] Secondary CTA visible on scroll
- [ ] Mobile-responsive (test on real devices)
- [ ] No navigation distractions (for landing pages)
- [ ] Clear headline matches ad/email promise
- [ ] Testimonials with real attribution
- [ ] Privacy policy link near form
- [ ] A/B test running on at least one element

## Analytics & Reporting

### North Star Metric
**Weekly Active Clinics (WAC)**: Number of clinics using Evolua for at least 3 sessions in a week.

### Dashboard Structure

| Tier | Metrics | Audience | Frequency |
|------|---------|----------|-----------|
| Executive | Revenue, CAC, LTV, Churn, WAC | Leadership | Weekly |
| Growth | Conversion rates by stage, trial-to-paid, activation % | Growth team | Daily |
| Channel | CAC by source, ROAS, cost per lead | Paid media | Daily |
| Content | Traffic, rankings, content-to-lead conversion | Content team | Weekly |
| Product | Feature adoption, session frequency, NPS | Product team | Weekly |

### Tools
- **Web Analytics**: Google Analytics 4 (GA4)
- **Product Analytics**: PostHog or Amplitude
- **Conversion Tracking**: Meta CAPI, Google Enhanced Conversions, GA4 events
- **Attribution**: Multi-touch (linear for standard, data-driven for digital)
- **Reporting**: Google Looker Studio (dashboards), Supabase (raw data queries)

## Experimentation Roadmap

### Phase 1 (Current): Foundation
- Tracking audit and fix (GA4, CAPI, Events)
- Landing page conversion audit
- Pricing page A/B test
- Trial signup flow optimization

### Phase 2 (Next Quarter): Activation
- Onboarding email sequence optimization
- In-app first-session wizard
- Feature adoption tracking
- WhatsApp integration nudge

### Phase 3 (Next 6 Months): Retention
- Churn prediction model
- Automated re-engagement campaigns
- Referral program launch
- Expansion revenue plays

## Key Metrics Dashboard

| KPI | Current | Target | Trend |
|-----|---------|--------|-------|
| Trial Signup Rate | — | >5% of landing visitors | — |
| Activation Rate | — | >60% within 7 days | — |
| Trial-to-Paid | — | >20% | — |
| Monthly Churn | — | <5% | — |
| CAC (Google) | — | <R$150 | — |
| CAC (Meta) | — | <R$100 | — |
| CAC (Organic) | — | <R$30 | — |
| LTV:CAC Ratio | — | >5:1 | — |
| NPS | — | >70 | — |
| Email Deliverability | — | >98% | — |
