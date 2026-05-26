# Billing Domain

## Providers
- **AbacatePay**: PIX, Boleto, assinaturas BRL (primary)
- **Stripe**: Cartão internacional (fallback)

## Status
- ✅ Webhook handlers idempotent (HMAC with replay tolerance)
- ✅ UI: `/billing` page with useBilling hook
- ✅ Contracts: Zod schemas for billing events
- ✅ Webhook event table (`billing_events` with UNIQUE provider+externalId)
- ✅ Test suite: 13/13 passing (Vitest)

## Current Gaps
- **Plans not defined**: Free / Starter / Pro / Business pricing not finalized
- **Pricing page**: Not on landing
- **Trust MRR**: Admin dashboard for MRR tracking not built
- **Plan sync**: Prisma seed not run with real AbacatePay/Stripe plan IDs
- **Dunning**: Retry logic for failed payments not implemented
