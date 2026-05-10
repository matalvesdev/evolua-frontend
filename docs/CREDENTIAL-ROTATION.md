# Credential Rotation Runbook — Evolua V2

Runbook executável para rotacionar **todas** as credenciais do projeto antes de
promover qualquer ambiente para produção, e depois em cadência periódica
(sugerido: a cada 90 dias, ou imediatamente após qualquer suspeita de vazamento).

> Este documento complementa `PRE-DEPLOY-CHECKLIST.md` §1.
> Aqui ficam os comandos prontos; lá fica o porquê.

---

## 0. Pré-requisitos

- [ ] Acesso de **owner** ao projeto Supabase `diiaoaboykraaiavgdqs`.
- [ ] Acesso ao secret manager do ambiente alvo (Vercel / Fly / Railway / AWS SM / etc).
- [ ] Acesso ao painel HuggingFace do owner do token atual.
- [ ] `psql`, `openssl` e `curl` disponíveis localmente.
- [ ] Backup recente do banco (`Supabase → Database → Backups → Create now`).

> **Janela de manutenção recomendada:** 15 min. A rotação do `service_role` e da
> senha do `postgres` derruba conexões ativas — agende fora de pico.

---

## 1. Inventário das credenciais ativas

| Variável                       | Onde vive                       | Quem usa                              |
|--------------------------------|----------------------------------|----------------------------------------|
| `SUPABASE_SERVICE_ROLE_KEY`    | `.env`, prod secret manager     | `apps/api` (BYPASSRLS, admin)         |
| `SUPABASE_ANON_KEY`            | `.env`, frontend bundle, landing| `frontend-core`, `landing-core`       |
| `SUPABASE_JWT_SECRET`          | `.env`, prod secret manager     | `apps/api` (verifica JWT do client)   |
| `DATABASE_URL` / `DIRECT_URL`  | `.env`, prod secret manager     | `apps/api`, `apps/ai`, prisma migrate |
| `HUGGINGFACE_API_KEY`          | `.env`, prod secret manager     | `apps/ai`                             |
| `INTERNAL_API_TOKEN`           | gerado localmente                | `apps/api` ↔ microserviços            |
| `WHATSAPP_WEBHOOK_HMAC_SECRET` | gerado localmente                | `apps/api` ↔ Evolution                |
| `EVOLUTION_API_KEY`            | secret manager                   | `apps/services/whatsapp`              |

---

## 2. Rotação Supabase (`service_role` + DB password)

### 2.1 — Resetar `service_role`

1. Abrir https://supabase.com/dashboard/project/diiaoaboykraaiavgdqs/settings/api
2. **Project API keys → service_role → Reset**
3. Copiar o novo valor para o secret manager **antes** de fechar o modal:

   ```bash
   # Vercel (exemplo)
   vercel env rm  SUPABASE_SERVICE_ROLE_KEY production
   vercel env add SUPABASE_SERVICE_ROLE_KEY production
   # cole o valor novo, ENTER

   # Fly.io
   fly secrets set SUPABASE_SERVICE_ROLE_KEY="<novo>" -a evolua-api
   ```

4. **Atualizar `.env` local** apenas se o ambiente compartilha projeto Supabase
   com prod. Recomendado separar projetos (dev/staging/prod).

### 2.2 — Resetar senha do role `postgres`

1. **Database → Settings → Database password → Generate new password**.
2. Copiar a senha gerada e construir as duas connection strings:

   ```bash
   # Pooler (transaction mode) — para apps/api e apps/ai em runtime
   DATABASE_URL="postgresql://postgres.diiaoaboykraaiavgdqs:<NOVA_SENHA>@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

   # Direct (session mode) — apenas para `prisma migrate`
   DIRECT_URL="postgresql://postgres.diiaoaboykraaiavgdqs:<NOVA_SENHA>@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
   ```

3. Atualizar `DATABASE_URL` e `DIRECT_URL` em **todos** os deploys
   (api, ai, jobs, CI). Se um único serviço ficar com a senha antiga, ele cai.

### 2.3 — Verificação

```bash
# Conectividade básica (substitua $URL pela nova DATABASE_URL)
psql "$DATABASE_URL" -c "select current_user, current_database(), now();"

# Confirmar que service_role tem BYPASSRLS (esperado: 't')
psql "$DIRECT_URL" -c "\du+ service_role"

# Smoke da API (substitua $API_URL)
curl -fsS "$API_URL/healthz/deep" | jq
```

---

## 3. Rotação HuggingFace

```bash
# 1. Revogar token atual:
#    https://huggingface.co/settings/tokens → Revoke

# 2. Criar token novo com escopo MÍNIMO:
#    - "read"  → se apps/ai apenas faz inferência
#    - "write" → apenas se faz upload de modelo/dataset
#    Marcar "Fine-grained" e restringir aos modelos usados.

# 3. Distribuir
fly secrets set HUGGINGFACE_API_KEY="hf_..." -a evolua-ai

# 4. Smoke
curl -fsS https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2 \
  -H "Authorization: Bearer $HF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"inputs":"ping"}'
```

---

## 4. Tokens internos (gerados localmente)

Cada um deve ser **idêntico** entre o `apps/api` e o serviço que dialoga com ele.

```bash
# Gerar 3 segredos hex de 256 bits
INTERNAL_API_TOKEN=$(openssl rand -hex 32)
WHATSAPP_WEBHOOK_HMAC_SECRET=$(openssl rand -hex 32)
EVOLUTION_API_KEY=$(openssl rand -hex 32)

echo "INTERNAL_API_TOKEN=$INTERNAL_API_TOKEN"
echo "WHATSAPP_WEBHOOK_HMAC_SECRET=$WHATSAPP_WEBHOOK_HMAC_SECRET"
echo "EVOLUTION_API_KEY=$EVOLUTION_API_KEY"
```

Distribuição:

| Variável                       | apps/api | apps/ai | services/whatsapp | Evolution |
|--------------------------------|:--------:|:-------:|:-----------------:|:---------:|
| `INTERNAL_API_TOKEN`           |    ✅     |   ✅    |        ✅          |     —     |
| `WHATSAPP_WEBHOOK_HMAC_SECRET` |    ✅     |   —     |        ✅          |     ✅     |
| `EVOLUTION_API_KEY`            |    —     |   —     |        ✅          |     ✅     |

> **Atenção:** rotacionar HMAC do webhook quebra o canal WhatsApp por alguns
> segundos até o Evolution receber a nova chave. Ordem segura:
> 1. Atualizar Evolution primeiro.
> 2. Atualizar `services/whatsapp` em seguida.
> 3. Por último, `apps/api` (consumidor do header).

---

## 5. Validação cross-service

```bash
# 1. /healthz/deep deve voltar 200 com status "ok" em todos os checks
curl -fsS "$API_URL/healthz/deep" | jq '.checks'

# 2. /metrics deve responder texto Prometheus
curl -fsS "$API_URL/metrics" | head -5

# 3. Token interno funciona
curl -fsS "$API_URL/internal/health" -H "x-internal-token: $INTERNAL_API_TOKEN"
# 401 com token errado:
curl -i  "$API_URL/internal/health" -H "x-internal-token: wrong" 2>&1 | head -1

# 4. Auth Supabase com nova service_role key
curl -fsS "$SUPABASE_URL/rest/v1/" -H "apikey: $SUPABASE_SERVICE_ROLE_KEY"

# 5. Worker WhatsApp aceita webhook assinado (assinatura HMAC SHA-256 do body)
BODY='{"event":"test"}'
SIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$WHATSAPP_WEBHOOK_HMAC_SECRET" -hex | awk '{print $2}')
curl -fsS "$WHATSAPP_URL/webhook" \
  -H "Content-Type: application/json" \
  -H "x-evolua-signature: sha256=$SIG" \
  -d "$BODY"
```

---

## 6. Limpeza

- [ ] **Revogar** tokens antigos onde for possível (HuggingFace permite; Supabase
      reset já invalida automaticamente).
- [ ] Confirmar que `.env` local **não** contém credenciais de produção
      (apenas dev/staging com projeto Supabase separado).
- [ ] `gitleaks detect --source . -v` no repo — não deve haver matches novos.
- [ ] Documentar a rotação em `docs/audit/rotations.log` (data, operador, motivo).

---

## 7. Em caso de vazamento (incident response)

1. **Imediatamente:** rotacionar **tudo** desta lista (não só a credencial suspeita).
2. **Forçar logout** de todas as sessões Supabase:

   ```sql
   -- Como service_role (após reset). Invalida todos os refresh tokens.
   delete from auth.refresh_tokens;
   ```

3. **Auditoria:** queries no `audit_logs` para detectar acessos suspeitos:

   ```sql
   select action, resource, count(*), max(created_at)
   from audit_logs
   where created_at > now() - interval '24 hours'
   group by 1, 2
   order by count(*) desc;
   ```

4. **Comunicar** o DPO/encarregado em até 24h (LGPD art. 48 — a ANPD em até
   72h se houver risco a titulares).

---

**Última atualização:** 2026-05-09
**Cadência sugerida:** a cada 90 dias ou após incidente.
