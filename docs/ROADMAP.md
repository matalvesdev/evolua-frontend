# Roadmap — Evolua V2 (Lançamento Oficial)

> Documento vivo. Owner: PO. Revisão semanal nas terças.
> Status: 🟢 done · 🟡 in progress · 🔴 blocked · ⚪ todo
> Sincronizado com o board do Notion (database "Evolua — Roadmap").

---

## Visão

**Evolua é um CRM brasileiro com WhatsApp nativo (Evolution API v2), automação de conteúdo e cobranças PIX/Cartão integradas (AbacatePay + Stripe).**

Meta de lançamento oficial (v1.0 GA): **end of Q3 / sprint a definir com o time**.

---

## Marcos (high-level)

| Marco | Critério de saída | Status |
|---|---|---|
| **M0 — Foundation** | Monorepo, CI/CD, infra Terraform, Supabase prod isolado | 🟡 |
| **M1 — Beta fechado** | 5 clientes pagantes, NPS ≥ 40, churn < 10%/mês | ⚪ |
| **M2 — Beta público** | Self-signup, billing automático, onboarding < 10 min | ⚪ |
| **M3 — v1.0 GA** | SLA 99.5%, observabilidade, runbooks, suporte L1 | ⚪ |

---

## Workstreams

### 1. Plataforma & Infra (owner: tech lead)

- ⚪ Rotação completa de credenciais (ver `docs/CREDENTIAL-ROTATION.md`)
- ⚪ Aplicar migration de RLS (`prisma/migrations/20260509000000_enable_row_level_security/`)
- ⚪ Separar projeto Supabase de produção do de desenvolvimento
- ⚪ Pipeline GitHub Actions: lint → test → build → deploy (App Runner)
- ⚪ Terraform: revisar `terraform/` e versionar state remoto (S3 + DynamoDB lock)
- ⚪ Backup automático Postgres (PITR + dump diário S3)
- ⚪ Pre-deploy checklist incorporado no CI (gate manual)

### 2. Backend Core (owner: tech lead)

- ⚪ Auditoria de endpoints públicos vs autenticados
- ⚪ Rate limiting por tenant (Redis)
- ⚪ Refatorar contratos compartilhados (`backend-core/contracts`) → publicar como pacote interno
- ⚪ Webhooks idempotentes (AbacatePay, Stripe, Evolution) com tabela `webhook_events`
- ⚪ Jobs assíncronos: BullMQ ou pg-boss (decisão pendente)

### 3. Billing & Monetização (owner: PO + tech lead)

- ⚪ Definir planos: Free / Starter / Pro / Business
- ⚪ Integrar **AbacatePay** (PIX + Boleto + assinaturas BRL) — ver MCP `abacatepay`
- ⚪ Integrar **Stripe** (cartão internacional, fallback) — ver MCP `stripe`
- ⚪ Página `/billing` no frontend com upgrade/downgrade
- ⚪ Webhooks: `subscription.activated`, `subscription.canceled`, `payment.failed`
- ⚪ Dunning (retentativa) e e-mails transacionais via Notifica
- ⚪ Trust MRR (AbacatePay) → dashboard interno

### 4. WhatsApp / Evolution (owner: backend)

- 🟢 Stack `atendai/evolution-api:v2.2.3` + Postgres + Redis via docker-compose
- 🟢 Instância `evolua` criada (instanceId `8f5b20ee-…`)
- 🟢 Rename `EVOLUTION_GO_*` → `EVOLUTION_*` em todo o monorepo
- 🟡 Parear WhatsApp via QR (manager UI: http://localhost:8080/manager)
- ⚪ HMAC SHA-256 obrigatório em produção (`EVOLUTION_WEBHOOK_SECRET`)
- ⚪ Reconexão automática + alerta quando QR expira
- ⚪ Multi-instância por tenant
- ⚪ Templates de mensagem aprovados (HSM) — fluxo de submissão

### 5. Frontend & Landing (owner: frontend)

- ⚪ Auditoria de acessibilidade WCAG AA (axe)
- ⚪ Performance budget: LCP < 2.5s, CLS < 0.1 (lighthouse no CI)
- ⚪ Onboarding wizard (5 passos: empresa → WhatsApp → import contatos → primeira automação → upgrade)
- ⚪ Landing: nova home + página de pricing + comparativo com concorrentes (`docs/analise-mercado-concorrentes.md`)
- ⚪ Suite e2e Playwright (MCP `playwright`) cobrindo onboarding e checkout

### 6. Observabilidade & SRE (owner: tech lead)

- ⚪ **Sentry** (errors + performance) frontend + backend — MCP `sentry`
- ⚪ **Grafana + Prometheus** (métricas, opensource self-hosted) — MCP `grafana`
- ⚪ **Dynatrace** (APM enterprise — avaliar custo vs valor pós-M2) — MCP `dynatrace`
- ⚪ Logs estruturados (pino) → Loki ou CloudWatch
- ⚪ SLO definido: API p95 < 400ms, disponibilidade 99.5%
- ⚪ Alertas no Slack: error budget, fila WhatsApp travada, webhooks falhando
- ⚪ Runbooks: incidente DB, fila travada, AbacatePay down, Evolution offline

### 7. Segurança & Compliance (owner: tech lead + PO)

- ⚪ LGPD: política de privacidade, registro de operações, DPO designado
- ⚪ Termos de uso revisados por jurídico
- ⚪ DPA template para clientes B2B
- ⚪ Pentest (interno na M2, externo antes da GA)
- ⚪ Backup restore drill mensal

### 8. Conteúdo & Go-to-Market (owner: PO + marketing)

- 🟡 Plano de marketing (`docs/marketing-plan.md`)
- ⚪ Automação de conteúdo (`scripts/content-automation.ts`) rodando 5×/semana
- ⚪ SEO técnico landing (sitemap, schema.org, meta tags)
- ⚪ 10 cases de uso documentados
- ⚪ Programa de indicação (revenue share via AbacatePay payouts)

### 9. Suporte & Operação (owner: PO)

- ⚪ Chat de suporte in-app (Crisp ou self-hosted)
- ⚪ Base de conhecimento pública (Notion → site)
- ⚪ SLA de resposta por plano
- ⚪ Status page pública (`status.useevolua.com`)

---

## Sprints — próximos 4 ciclos

> Cada sprint = 2 semanas. Tickets vivem no Notion (database "Sprints").

### Sprint atual — Foundation hardening
- 🟢 Rotação de credenciais (M0)
- 🟢 Limpeza de histórico Git (force-push aplicado)
- 🟢 Setup Sentry frontend + landing + backend
- 🟢 Billing MVP completo (AbacatePay + Stripe, contracts, migration, webhooks idempotentes, página `/billing`)
- 🟢 Migração Evolution Go → open-source v2.2.3 (rename completo, stack docker healthy)
- 🟢 Testes Vitest billing (HMAC providers + mappers — 13/13 passando)
- ⚪ RLS aplicado em prod (M0)
- ⚪ CI/CD verde end-to-end (M0)

### Sprint +1 — Billing MVP
- 🟢 AbacatePay: provider + checkout + webhook handlers
- 🟢 Stripe: provider + checkout + webhook handlers (HMAC com tolerância replay)
- 🟢 Página `/billing` (hook `useBilling`)
- 🟢 Webhook handler idempotente (`billing_events` UNIQUE provider+externalId)
- ⚪ Trust MRR → admin dashboard
- ⚪ Sincronizar planos (`prisma db seed`) com IDs reais AbacatePay/Stripe

### Sprint +2 — Onboarding & WhatsApp
- Wizard de onboarding
- HMAC obrigatório no webhook Evolution
- Multi-instância por tenant

### Sprint +3 — Beta fechado (M1)
- Convite para 10 clientes-piloto
- Coleta NPS automatizada
- Suporte L1 ativo

---

## Decisões pendentes (RFCs)

- [ ] Filas: BullMQ vs pg-boss
- [ ] Logs: Loki self-hosted vs CloudWatch
- [ ] APM enterprise: Dynatrace vs ficar só com Sentry+Grafana
- [ ] Suporte: Crisp vs self-hosted (Chatwoot)
- [ ] Stripe vs apenas AbacatePay para o mercado BR (manter Stripe só para internacional?)

---

## Como usar esse roadmap com o time

1. **PO** mantém o board no Notion espelhando essas seções (MCP `notion` configurado).
2. **Toda terça**: revisão dos status, repriorização, atualização desse arquivo via PR.
3. **Tickets** seguem o template: `Workstream / Marco / Critério de aceite / Owner`.
4. **Métricas semanais** no canal #evolua-roadmap: MRR, churn, error rate, p95.
