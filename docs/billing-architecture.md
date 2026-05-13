# Billing — Arquitetura

> Última atualização: 2026-05-12
> Owners: backend-core (`apps/api/src/modules/billing`) + frontend-core (`src/routes/dashboard/billing.tsx`)

## Visão geral

O módulo de **Billing** gerencia as cobranças que a Evolua faz das clínicas que
contratam a plataforma SaaS (B2B). **NÃO confundir** com o módulo `finances`,
que é o financeiro **interno** da clínica (contas a pagar/receber por paciente).

| Conceito         | Quem cobra      | Quem paga | Tabelas                                    |
|------------------|-----------------|-----------|--------------------------------------------|
| **Billing SaaS** | Evolua          | Clínica   | `plans`, `subscriptions`, `invoices`, `billing_events` |
| **Finanças**     | Clínica         | Paciente  | `transactions`, `transaction_categories`   |

## Providers

Suportamos dois gateways em paralelo, atrás de uma interface comum:

- **AbacatePay** (`providers/abacatepay.ts`) — provider primário Brasil:
  PIX e Boleto. Webhook em `POST /webhooks/billing/abacatepay`, header
  `x-abacate-signature` validado por HMAC-SHA256 com `ABACATEPAY_WEBHOOK_SECRET`.
- **Stripe** (`providers/stripe.ts`) — fallback internacional, cartão de crédito.
  Webhook em `POST /webhooks/billing/stripe`, header `Stripe-Signature` no
  formato `t=<timestamp>,v1=<hash>` validado contra `STRIPE_WEBHOOK_SECRET`,
  com proteção de replay de **5 minutos**.

A escolha do provider acontece no checkout (`POST /api/billing/checkout`)
através do campo `provider`. O frontend mostra um seletor PIX/Boleto vs. cartão.

## Fluxo de checkout

```
[Usuário]
  └── POST /api/billing/checkout {planSlug, provider}
       └── billingService.createCheckout
            ├── busca Plan no banco (valida abacatepayProductId / stripePriceId)
            └── delega para o provider → retorna {url, providerSessionId}
       └── front redireciona para a URL hospedada do provider
            └── provider processa pagamento e dispara webhook
                 └── POST /webhooks/billing/<provider>
```

## Idempotência de webhooks

Todo evento recebido é registrado em `billing_events` com a `UNIQUE
(provider, external_id)`. Se o mesmo evento chegar duas vezes (retries do
provider são comuns), a segunda inserção falha com `P2002` e o handler
retorna `{duplicate: true}` sem reprocessar.

```sql
CREATE TABLE billing_events (
  ...
  UNIQUE (provider, external_id)
);
```

Após processar com sucesso, `processed_at` é preenchido. Se falhar, o
campo `error` recebe a mensagem (sem reprocessar automaticamente — fica
para job de reconciliação futuro).

## Eventos suportados

| Provider     | Evento                          | Efeito                                                        |
|--------------|---------------------------------|---------------------------------------------------------------|
| abacatepay   | `billing.paid`                  | upsert `Invoice` (status=paid) + ativa Subscription           |
| abacatepay   | `billing.created`               | upsert `Invoice` (status=open)                                |
| abacatepay   | `billing.failed`                | Subscription → `past_due`                                     |
| abacatepay   | `subscription.canceled`         | Subscription → `canceled` + `canceledAt`                      |
| stripe       | `invoice.paid`                  | upsert `Invoice` (status=paid) + Subscription → `active`      |
| stripe       | `invoice.payment_failed`        | Subscription → `past_due`                                     |
| stripe       | `customer.subscription.updated` | sincroniza status, períodos e `cancelAtPeriodEnd`             |
| stripe       | `customer.subscription.deleted` | Subscription → `canceled`                                     |
| stripe       | `checkout.session.completed`    | apenas log (subscription real vem em `subscription.updated`)  |

Eventos não mapeados são logados em nível `info` para observabilidade futura.

## Configuração de raw body

A validação HMAC requer o **corpo cru** (string), não o JSON parseado. Em
`app.ts` os webhooks de billing são registrados em um contexto encapsulado
do Fastify com seu próprio `addContentTypeParser`:

```ts
await app.register(async (instance) => {
  instance.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    (_req, body, done) => done(null, body),
  )
  await instance.register(billingWebhookRoutes)
}, { prefix: '/webhooks' })
```

Isso garante que `req.body` chega como string nessas rotas, sem afetar
o resto da aplicação.

## Segurança

- Webhooks **sem JWT**: validados exclusivamente por HMAC.
- Stripe: comparação em **timing-safe** (`crypto.timingSafeEqual`) e
  janela de tolerância de 5 minutos para mitigar replay.
- AbacatePay: comparação em **timing-safe** sobre o digest hex.
- RLS habilitado em `subscriptions` e `invoices` na migração
  `20260512000000_add_billing` — clínicas só enxergam seus próprios
  dados via `clinic_id = auth.jwt() -> 'clinic_id'`.

## Variáveis de ambiente

Todas em `apps/api/src/config/env.ts`:

```
APP_URL                          # http://localhost:5173 em dev
ABACATEPAY_API_URL               # default: https://api.abacatepay.com/v1
ABACATEPAY_API_KEY               # secret
ABACATEPAY_WEBHOOK_SECRET        # min 16 chars
STRIPE_API_URL                   # default: https://api.stripe.com/v1
STRIPE_SECRET_KEY                # secret (sk_live_... | sk_test_...)
STRIPE_WEBHOOK_SECRET            # whsec_...
```

Em desenvolvimento todas são opcionais — o servidor sobe mesmo sem
provider configurado, mas tentar criar checkout falhará com erro
`401`/`500`. Em produção o deploy deve falhar se faltarem as duas
chaves de pelo menos um provider.

## Roadmap

- [ ] Job de reconciliação que reprocessa `billing_events` com `error != null`.
- [ ] Sync de planos com Stripe/AbacatePay via CLI (`scripts/sync-plans.ts`).
- [ ] Dunning automático: e-mail via Notifica quando `status=past_due`.
- [ ] Suporte a cupons / descontos por código.
- [ ] Página pública de pricing na landing-core consumindo `/api/billing/plans`.
- [ ] Faturamento anual com desconto (`interval=yearly`).

## Referências

- AbacatePay docs: https://docs.abacatepay.com
- Stripe webhooks: https://stripe.com/docs/webhooks/signatures
- Migration: `backend-core/prisma/migrations/20260512000000_add_billing/`
- Schema: `backend-core/prisma/schema.prisma` linhas 786-875
