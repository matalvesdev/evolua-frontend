# 🚀 Deploy Strategy - Quick Reference

**TL;DR - Sempre que finalizar uma feature:**

```bash
# Frontend: Só fazer commit e push
git commit -m "feat: descrição"
git push origin feature/nome
# → Criar PR, merge develop, depois main
# → Vercel auto-deploya

# Backend: Commit + Terraform
git commit -m "feat: descrição"
git push origin feature/nome
# → Criar PR, merge develop, depois main
# → cd terraform && terraform apply

# Full-Stack:
./scripts/deploy.sh both prod
```

---

## 📍 Arquitetura

| Camada | Tecnologia | Deploy | Status |
|--------|-----------|--------|--------|
| **Frontend** | Vercel + Next.js 16 | `git push main` → ✅ Auto | **Automático** |
| **Backend** | AWS EC2 t2.micro | `terraform apply` → ⚠️ Manual | **Manual** |
| **Database** | Supabase PostgreSQL | `prisma migrate` | **Auto** |
| **DNS** | Route53 | Via Terraform | **Automático** |

---

## 🔄 Fluxo Padrão (Feature)

```
1. Create branch: git checkout -b feature/nome
2. Develop: code, test, commit
3. Test locally: npm run lint, npm run test, npm run dev/start:dev
4. Push: git push origin feature/nome
5. PR: GitHub → describe changes
6. Code Review: ✅ Approved
7. Merge develop: Auto-deploy staging
8. Test staging: useevolua.dev ou localhost
9. Merge main: Auto-deploy production
10. Verify prod: useevolua.com.br é válido?
```

---

## 🎯 Por Tipo de Mudança

### **UI/Component Only** (Frontend)
```bash
git checkout -b feature/novo-botao
# editar components/
npm run lint && npm run test
git push origin feature/novo-botao
# → PR → Review → Merge develop (staging test)
# → Merge main (prod deploy auto)
✅ Feito!
```

### **API Endpoint Only** (Backend)
```bash
git checkout -b feature/novo-endpoint
# editar src/controllers/ + src/services/
npm run lint && npm run test
git push origin feature/novo-endpoint
# → PR → Review → Merge develop
# → Merge main
# → terraform apply (⚠️ MANUAL)
✅ Feito!
```

### **Full-Stack** (Frontend + Backend)
```bash
# BACKEND FIRST
git checkout -b feature/nova-meta
# backend-evolua/ - implementar endpoints
npm run lint && npm run test
git push
# → Merge develop (test sem frontend)

# FRONTEND
git checkout -b feature/nova-meta  (same name)
# frontend-evolua/ - implementar UI
npm run lint && npm run test
git push
# → Merge develop (test com backend em dev)

# BOTH METRGED
# → Merge main
# → terraform apply (backend)
# → Vercel auto-deploya (frontend)
✅ Feito!
```

### **Database Migration** (Schema Change)
```bash
# BACKEND
git checkout -b feature/novo-campo
# prisma/schema.prisma - adicionar campo
npm run prisma:migrate dev --name add_novo_campo
npm run lint && npm run test
git push
# → Merge develop + main
# → terraform apply (auto-executa migration)
✅ Feito!
```

### **Emergency Hotfix** (Production Bug)
```bash
git checkout -b hotfix/bug-critico (from main)
# fix the bug
npm run lint && npm run test && npm run build
git push
# → PR + fast-track review
# → Merge main
# → FRONTEND: Auto-deploy via Vercel (segundos)
# → BACKEND: terraform apply (manual)
✅ Crítico resolvido!
```

---

## 📋 Checklists

### **Before Pushing Code**
- [ ] npm run lint (sem erros)
- [ ] npm run test (testes passando)
- [ ] npm run build (build sucesso)
- [ ] git status (sem files não-tracked)
- [ ] commit messages claros

### **Before Merging PR**
- [ ] Code review OK
- [ ] CI checks passando (GitHub Actions)
- [ ] No conflicts
- [ ] Commit history limpo

### **Before Production Deploy**
- [ ] Testar em staging
- [ ] Database migrations OK
- [ ] Secrets/env vars configurados
- [ ] Performance OK
- [ ] Rollback plan ready

### **After Production Deploy**
- [ ] Frontend: https://useevolua.com.br 200 OK?
- [ ] Backend: https://api.useevolua.com.br/api/health 200 OK?
- [ ] Main features funcionando?
- [ ] Logs sem errors?
- [ ] Monitor alertas?

---

## 🚀 Deploy Commands

### **Script Automático** (Recomendado)
```bash
./scripts/deploy.sh frontend staging
./scripts/deploy.sh backend prod
./scripts/deploy.sh both prod
```

### **Manual Frontend (Vercel)**
```bash
cd frontend-evolua
git checkout develop/main
git pull origin develop/main
npm ci && npm run lint && npm run test && npm run build
git push origin develop/main
# Vercel auto-deploya via webhook
```

### **Manual Backend (EC2)**
```bash
cd backend-evolua/backend-evolua
git checkout main
git pull origin main
npm ci && npm run lint && npm run test && npm run build
git push origin main

cd ../../../terraform
terraform plan
terraform apply -auto-approve
```

---

## ⚠️ Cuidados

```bash
❌ Nunca: Push .env ou secrets
❌ Nunca: Direct SSH upload do código
❌ Nunca: npm run prisma:push em prod
✅ Sempre: Use git para versionamento
✅ Sempre: Test em dev primeiro
✅ Sempre: Code review antes de merge
```

---

## 🆘 Troubleshooting

| Problema | Solução |
|----------|---------|
| Backend não responde | SSH em EC2, check `pm2 logs` |
| Frontend branco | Check Vercel logs, verificar `.env` |
| DB migration falhou | `npm run prisma:studio`, analyze schema |
| DNS não resolve | Route53 records corretos? TTL expirou? |
| Terraform error | `terraform plan`, check AWS credentials |
| Need rollback? | Git revert + terraform apply |

---

## 📞 Contacts

- **Frontend Issues**: Frontend Dev
- **Backend Issues**: Backend Dev  
- **Infrastructure**: DevOps / Terraform
- **Database**: Backend Dev (Prisma)
- **DNS/Domains**: DevOps (Route53)

---

## ✨ Key Repositories

| Repo | Branch | Environment | Deploy |
|------|--------|-------------|--------|
| frontend-evolua | develop | Staging | Vercel ✅ |
| frontend-evolua | main | Production | Vercel ✅ |
| backend-evolua | develop | Dev Local | - |
| backend-evolua | main | Production | Terraform ⚠️ |

---

**Last Updated**: 28/03/2026
