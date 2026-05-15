# Backups & Disaster Recovery — Evolua V2

> Stack: **Supabase Postgres** (sa-east-1) + **AWS S3** (sa-east-1) + **GitHub Actions** (scheduler).
> Sem novas dependências: tudo usa o que já está em produção.

## Camadas de proteção

| Camada | Tecnologia | Janela de recuperação | RPO | RTO |
|---|---|---|---|---|
| **1. PITR (point-in-time recovery)** | Supabase nativo (Pro plan) | últimos 7 dias | ~2 min | ~30 min |
| **2. Dump diário** | `pg_dump --format=custom` → S3 | 90 dias | 24h | ~1h (12h se >7d) |
| **3. Versioning S3** | Bucket com versioning | 30 dias após delete | — | ~10 min |

---

## 1. PITR no Supabase (verificar)

PITR só está ativo no plano **Pro ou superior**. Verificar:

1. Dashboard Supabase → Project `diiaoaboykraaiavgdqs` → **Database → Backups**
2. Se "Point in Time Recovery" estiver desabilitado → upgrade para Pro
3. Confirmar janela de retenção (default 7 dias, configurável até 28d)

**Não há código nosso aqui — é configuração no painel.**

---

## 2. Dump diário → S3

### Setup (uma vez)

```bash
# 1. Criar bucket + IAM user via Terraform
cd terraform
terraform apply -target=aws_s3_bucket.pg_backups \
                -target=aws_iam_user.pg_backup \
                -target=aws_iam_access_key.pg_backup \
                -target=aws_iam_user_policy.pg_backup

# 2. Capturar credenciais (são sensíveis — não commitar)
terraform output -raw pg_backup_aws_access_key_id
terraform output -raw pg_backup_aws_secret_access_key
terraform output -raw pg_backup_bucket
```

### Secrets no GitHub Actions

Settings → Secrets and variables → Actions → New repository secret:

| Secret | Valor |
|---|---|
| `PG_BACKUP_AWS_ACCESS_KEY_ID` | output do terraform |
| `PG_BACKUP_AWS_SECRET_ACCESS_KEY` | output do terraform |
| `PG_BACKUP_BUCKET` | `evolua-pg-backups-sa-east-1` |
| `PG_BACKUP_REGION` | `sa-east-1` |
| `DIRECT_URL` | mesmo da `deploy-migrations.yml` |

### Operação

- **Workflow**: `.github/workflows/pg-backup.yml`
- **Schedule**: cron `17 3 * * *` (03:17 UTC ≈ 00:17 BRT)
- **Manual**: Actions → "Postgres backup → S3" → Run workflow
- **Path no S3**: `s3://evolua-pg-backups-sa-east-1/daily/YYYY/MM/evolua-YYYYMMDDTHHMMSSZ.dump`
- **Lifecycle**: STANDARD (7d) → DEEP_ARCHIVE → expira em 90d
- **Retrieval**: dumps recentes (≤7d) instantâneos; >7d levam ~12h (Standard retrieval do DEEP_ARCHIVE). Pra DR rápido use **Supabase PITR** (camada 1).

---

## 3. Restore drill (mensal)

> Owner: tech lead. Frequência: 1ª terça do mês.

```bash
# 1. Baixar último dump
aws s3 cp s3://evolua-pg-backups-sa-east-1/daily/2026/05/evolua-20260514T031700Z.dump ./latest.dump

# 2. Verificar checksum
aws s3 cp s3://evolua-pg-backups-sa-east-1/daily/2026/05/evolua-20260514T031700Z.dump.sha256 ./
sha256sum -c evolua-20260514T031700Z.dump.sha256

# 3. Restaurar em Postgres local (NUNCA em prod!)
docker run -d --name pg-drill -e POSTGRES_PASSWORD=drill -p 5433:5432 postgres:16
pg_restore --no-owner --no-privileges --dbname=postgresql://postgres:drill@localhost:5433/postgres ./latest.dump

# 4. Validações smoke:
psql postgresql://postgres:drill@localhost:5433/postgres -c "
  SELECT 'clinics' AS t, count(*) FROM public.clinics
  UNION ALL SELECT 'users', count(*) FROM public.users
  UNION ALL SELECT 'patients', count(*) FROM public.patients
  UNION ALL SELECT 'appointments', count(*) FROM public.appointments;
"

# 5. Documentar resultado em docs/runbooks/restore-drill-YYYYMM.md
docker rm -f pg-drill
```

**Critério de sucesso**: restore < 1h, contagens batem com prod (±5%).

---

## 4. Runbook — incidente de perda de dados

### Cenário A: dado deletado por engano (últimos 7 dias)

1. **Pausar escrita** se possível (rate limit no Fastify ou desligar app)
2. Supabase Dashboard → Database → Backups → **Restore from PITR** → escolher timestamp ANTES do incidente
3. Supabase clona em projeto novo → migrar dados específicos via `pg_dump --table=...` + `pg_restore`
4. Reativar escrita

### Cenário B: corrupção / perda > 7 dias

1. Identificar dump diário mais próximo no S3
2. Spinning up Postgres temporário (RDS t3.micro ou docker)
3. `pg_restore` do dump
4. Cherry-pick dos registros via `pg_dump --table` ou `COPY`
5. Aplicar no Supabase prod via SQL editor

### Cenário C: catástrofe total (projeto Supabase morto)

1. Criar novo projeto Supabase
2. `pg_restore` do dump mais recente do S3
3. Atualizar `DATABASE_URL` / `DIRECT_URL` em todos os ambientes (GitHub secrets, EC2 user-data, Vercel)
4. `prisma migrate deploy` (idempotente, vai reportar tudo aplicado)
5. Validar com smoke tests

---

## 5. Custos esperados

> **Meta: ficar 100% no AWS Free Tier.**

Free Tier (12 meses, contas novas):
- S3: 5GB STANDARD + 20k GET + 2k PUT/mês — usamos ~0.4GB e ~60 PUT/mês ✅
- DynamoDB: 25GB + 25 RCU/WCU **forever** — locks tfstate <1KB ✅
- GitHub Actions: 2000 min/mês (privado) — pg-backup ~3 min/dia = 90 min/mês ✅

Após Free Tier expirar:
- S3 STANDARD (≤7d, ~350MB): ~$0.008/mês
- S3 DEEP_ARCHIVE (8–90d, ~4GB): ~$0.004/mês
- DynamoDB: continua grátis (forever tier)
- Requests S3: ~60 PUT/mês = $0.0003

**Total estimado: < $0.05/mês após free tier expirar.**

> Camada primária de DR é **Supabase PITR** (já incluso no plano). Os dumps S3 são apenas seguro de longo prazo / portabilidade.
