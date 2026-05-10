# Pre-Deploy Checklist — Evolua V2

Lista mínima de verificações **antes de promover qualquer ambiente para produção**.
Ordem importa — não pular itens.

---

## 1. Rotação de credenciais (CRÍTICO)

O arquivo `.env` da raiz contém credenciais reais usadas em desenvolvimento.
**Nenhuma destas chaves deve ir para produção sem rotação.**

> **Runbook executável com comandos prontos:** [`CREDENTIAL-ROTATION.md`](./CREDENTIAL-ROTATION.md)

### Supabase

1. Acessar https://supabase.com/dashboard/project/diiaoaboykraaiavgdqs/settings/api
2. Em **Project API keys**, clicar em **Reset** para `service_role`.
3. Copiar a nova chave para o secret manager do ambiente alvo (Vercel/Fly/Railway/AWS SM).
4. **Atualizar `.env` local** apenas se o dev compartilhar projeto Supabase com prod.
   Recomendado: criar projeto Supabase separado para produção.
5. Em **Database → Connection string**, resetar a senha do role `postgres`.
   Atualizar `DATABASE_URL` em todos os deploys.

### HuggingFace

1. https://huggingface.co/settings/tokens — revogar token atual.
2. Criar novo token com escopo mínimo (`read` se apenas inferência; `write` se ingest).
3. Atualizar `HF_TOKEN` no secret manager.

### JWT internos (`x-internal-token`, HMAC webhook)

1. Gerar via `openssl rand -hex 32` (uma para cada serviço).
2. Variáveis: `INTERNAL_API_TOKEN`, `WHATSAPP_WEBHOOK_HMAC_SECRET`, `EVOLUTION_API_KEY`.
3. Sincronizar o **mesmo valor** entre `apps/api` e o microserviço correspondente.

### Validação

```bash
# Confirmar que .env de produção não tem nenhum dos valores listados em .env raiz local
diff <(grep -oE '^[A-Z_]+=.*' .env | sort) <(grep -oE '^[A-Z_]+=.*' .env.production | sort)
# Saída esperada: nomes iguais, valores 100% diferentes
```

---

## 2. Banco de dados

- [ ] Migration de RLS aplicada: `prisma/migrations/20260509000000_enable_row_level_security/`
- [ ] `npx prisma migrate deploy` executado no banco prod
- [ ] Confirmar `service_role` tem `BYPASSRLS` (Supabase default) — `\du` no psql
- [ ] Confirmar que o connection string usa `service_role` ou role com `BYPASSRLS`
      (RLS ativa BLOQUEIA queries do backend caso contrário)
- [ ] Backup automático do Supabase habilitado (Settings → Database → PITR)

---

## 3. Variáveis de ambiente — checklist mínimo

### `apps/api`
- `NODE_ENV=production`
- `DATABASE_URL` (Supabase pooler, com `?pgbouncer=true&connection_limit=1`)
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET`
- `INTERNAL_API_TOKEN`
- `FRONTEND_URL` (origin canônico — usado em CORS e portal links)
- `LOG_LEVEL=info`

### `apps/services/whatsapp` (Go)
- `EVOLUTION_BASE_URL`, `EVOLUTION_API_KEY`
- `WHATSAPP_WEBHOOK_HMAC_SECRET` (igual ao do api)
- `INTERNAL_API_TOKEN` (igual ao do api)

### `apps/ai` (Python)
- `HF_TOKEN`
- `INTERNAL_API_TOKEN`
- `DATABASE_URL` (mesma do api — pgvector)

---

## 4. Segurança HTTP

- [ ] `apps/api` — Helmet CSP **ativo em prod** (`app.ts:46`); confirme `NODE_ENV=production`.
- [ ] HSTS habilitado (1 ano + includeSubDomains + preload).
- [ ] CORS — `origin` restrito a `FRONTEND_URL`; sem wildcard em prod.
- [ ] Rate limit Fastify ativo (já em rotas públicas do patient-portal).
- [ ] Frontend (Vercel/Netlify): replicar headers de `vite.config.ts:10` em `vercel.json`/`_headers`.

---

## 5. Build & smoke tests

```bash
# Backend
pnpm -F @evolua/contracts build
npx prisma generate
npx tsc --noEmit -p apps/api/tsconfig.json

# Frontend
pnpm -F frontend-core build
pnpm -F landing-core build

# Go
cd apps/services/whatsapp && go build ./...

# Python
cd apps/ai && uv sync --frozen && python -c "import app"
```

Smoke após deploy:

```bash
curl -fsS https://api.evolua.app/health
curl -fsS https://api.evolua.app/docs   # Swagger acessível
curl -fsS -H "x-internal-token: $TOKEN" https://api.evolua.app/internal/health
```

---

## 6. Auditoria & LGPD

- [ ] `audit_logs` populando — verificar com query:
      `SELECT action, resource, count(*) FROM audit_logs WHERE created_at > now() - interval '1 hour' GROUP BY 1,2;`
- [ ] `consent_records` registrando antes de qualquer operação com PII de paciente.
- [ ] DPO (encarregado) cadastrado e contato publicado em `/privacidade`.
- [ ] Política de retenção definida (default sugerido: prontuário 20 anos CFP, audit 5 anos).

---

## 7. Observabilidade

- [ ] Logs estruturados (pino) coletados em destino externo (Better Stack, Axiom, CloudWatch).
- [ ] Alertas configurados:
  - 5xx > 1% em 5 min
  - p95 latência > 1s
  - falhas de auth > 50/min (brute-force)
  - falha de webhook WhatsApp > 5/min
- [ ] Sentry (ou equivalente) ativo no frontend.

---

## 8. Rollback

- [ ] Snapshot do banco pré-deploy (Supabase: Database → Backups → Create now).
- [ ] Tag de release no git: `git tag -a v0.x.0 -m "..."`.
- [ ] Comando de rollback documentado (`vercel rollback`, `fly releases rollback`, etc).

---

## 9. Itens da auditoria de segurança

Status atual (ver `docs/audit/` para detalhes):

| # | Item                              | Status |
|---|-----------------------------------|--------|
| 1 | Sem secrets versionados           | ✅      |
| 2 | Rotação de credenciais            | ⚠️ Manual — este doc |
| 3 | RLS Supabase                      | ✅ Migration aplicada |
| 4 | Audit log LGPD                    | ✅ Aplicado em rotas críticas |
| 5 | Validação Zod end-to-end          | ✅      |
| 6 | Rate limit                        | ✅      |
| 7 | CORS restrito                     | ✅      |
| 8 | Helmet/CSP                        | ✅ Prod-only |
| 9 | HMAC webhooks                     | ✅      |
| 10| Stripe (fora de escopo MVP)       | ⏭️      |

---

**Última atualização:** 2026-05-09
