# ⚠️ DEPLOYMENT STANDARDS - Crítico para todo Dev

**Este arquivo define o padrão OBRIGATÓRIO para todos os deploys**

---

## 🎯 Objetivo

Garantir que **TODA feature seja deployada para os repositórios CORRETOS**:
- ✅ Frontend → Vercel (automático via git push)
- ✅ Backend → AWS EC2 (manual via Terraform)
- ✅ Database → Supabase (automático via Prisma)

---

## 📋 WORKFLOW FRONTAL (Deve Ser Seguido 100%)

```
┌─ Criar Feature Branch ────────────┐
│ git checkout -b feature/nome      │
└──────────────────────────────────┘
                ↓
┌─ Desenvolver Feature ─────────────┐
│ - Componente/hook/página          │
│ - TypeScript strict               │
│ - Testes unitários                │
│ - JSDoc para públicos              │
└──────────────────────────────────┘
                ↓
┌─ Testes Locais ───────────────────┐
│ npm run lint                       │
│ npm run test                       │
│ npm run build                      │
│ npm run dev (manual testing)       │
└──────────────────────────────────┘
                ↓
┌─ Git Workflow ────────────────────┐
│ git add .                          │
│ git commit -m "feat: descrição"   │
│ git push origin feature/nome       │
└──────────────────────────────────┘
                ↓
┌─ Pull Request + Review ───────────┐
│ GitHub: Criar PR em develop       │
│ Descrever mudanças                 │
│ Code review (1-2 pessoas)         │
│ Resolver discussões                │
└──────────────────────────────────┘
                ↓
┌─ STAGING DEPLOY ──────────────────┐
│ git merge feature → develop        │
│ git push origin develop            │
│ ⬇️ Vercel auto-deploya             │
│ URL: develop.vercel-app.com        │
│ ⬇️ TESTAR EM STAGING               │
└──────────────────────────────────┘
                ↓
        ✅ Aprova?
                ↓
┌─ PRODUCTION DEPLOY ───────────────┐
│ git merge develop → main           │
│ git push origin main               │
│ ⬇️ Vercel auto-deploya             │
│ URL: https://useevolua.com.br      │
│ ⬇️ VERIFICAR PRODUÇÃO              │
└──────────────────────────────────┘
                ↓
        ✅ Tudo OK!
```

---

## 🔑 REGRAS OBRIGATÓRIAS

### 1️⃣ Frontend Deploy

```bash
✅ CORRETO:
  Branch: develop → staging.vercel.com (Vercel)
  Branch: main → useevolua.com.br (Vercel)
  
❌ ERRADO:
  Deploy via SSH/FTP
  Deploy manual em outro servidor
  Deploy direto de branches que não main/develop
```

**Como garantir**:
- Verificar in Vercel dashboard which branches trigger deploys
- Sempre fazer PR antes de merge
- Code review obrigatório

### 2️⃣ Backend Deploy

```bash
✅ CORRETO:
  terraform apply (EC2 t2.micro em produção)
  Código em main branch
  Deployar via Terraform APENAS
  
❌ ERRADO:
  SSH + npm install + npm run start
  Deploy por upload FTP
  Deploy de branches que não main
  Direct npm run build sem Terraform
```

**Como garantir**:
- backend-evolua/backend-evolua código em Git
- Terraform manage infraestrutura (terraform apply)
- user-data.sh auto-setup no primeiro boot
- PM2 manage processo para auto-restart

### 3️⃣ Database Deploy

```bash
✅ CORRETO:
  Prisma migrations em Git
  npm run prisma:migrate deploy em prod (via Terraform)
  Schema versionado em Git
  
❌ ERRADO:
  SQL scripts aleatórios
  Direct database modifications
  Migrations não reversíveis
  Sem versionamento de schema
```

**Como garantir**:
- Sempre: npm run prisma:migrate dev --name descriptie
- Commit: schema.prisma + migration files
- Deploy: Terraform auto-executa migrations

---

## 🚫 NÃO FAZER ISSO

| ❌ ERRADO | ✅ CORRETO |
|----------|-----------|
| Fazer deploy manual via FTP | Git push → Vercel/Terraform |
| SSH em servidor e git pull | Terraform gerencia tudo |
| Alterar database manualmente | Prisma schema + migrations |
| Commit de .env ou secrets | .env.example versionado |
| Deploy direto de feature branch | Merge em develop/main primeiro |
| npm run build manual em prod | Terraform roda build automaticamente |
| Múltiplos deploys paralelos | 1 por vez (esperar completar) |
| Sem testes antes de deploy | Testes locais obrigatórios |

---

## ✅ DEPLOY CHECKLIST (OBRIGATÓRIO)

Antes de fazer **qualquer deploy**:

```bash
□ Código está em Git (não local)
□ npm run lint (sem erros)
□ npm run test (testes passando)
□ npm run build (build sucesso)
□ Alterações são apenas deste feature (git diff mainbranch)
□ Code review aprovado
□ Database migrations reversíveis
□ Secrets em .env (não em código)
□ Feature testada em staging (develop)
□ Ready para produção (main)?
□ Rollback plan preparado
□ Equipe notificada
```

---

## 🚀 Comandos Automáticos

**Use o script**: `./scripts/deploy.sh`

```bash
# Frontend staging
./scripts/deploy.sh frontend staging

# Backend produção
./scripts/deploy.sh backend prod

# Full-stack produção
./scripts/deploy.sh both prod

# Help
./scripts/deploy.sh --help
```

---

## ⏰ Deploy Windows

| Componente | When | How | Time |
|-----------|------|-----|------|
| Frontend | Anytime | Git push | ~5 min |
| Backend | Off-peak | terraform apply | ~10 min |
| Both | Weekdays 9-17h | Script + manual | ~15 min |
| Rollback | Emergency | Git revert | ~5 min |

Evite deploy de backend em noites/feriados se possível.

---

## 📞 Escalação

Se problema durante deploy:

1. **Frontend issue**: Log em Vercel dashboard
2. **Backend issue**: SSH em EC2, check `pm2 logs`
3. **Database issue**: Check Supabase dashboard
4. **Terraform issue**: terraform plan, check AWS console
5. **Critical**: Rollback via git revert + terraform apply

---

## 📚 Documentação Relacionada

- [DEPLOY.md](../DEPLOY.md) — Guia completo
- [DEPLOY-CHECKLIST.md](../DEPLOY-CHECKLIST.md) — Checklist por feature
- [DEPLOY-QUICK-REF.md](./DEPLOY-QUICK-REF.md) — Referência rápida
- [scripts/deploy.sh](../scripts/deploy.sh) — Script automático

---

## 🔐 Confidencial

Nunca commit:
- .env (use .env.example)
- terraform.tfvars (local-only)
- AWS keys (use IAM roles)
- Database passwords (use Supabase credentials)
- API secrets

---

**Status**: ✅ OBRIGATÓRIO PARA TODO DEPLOY

**Last Updated**: 28/03/2026

**Enforcement**: Code review + GitHub branch protection
