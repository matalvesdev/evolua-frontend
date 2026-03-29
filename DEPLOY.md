# 🚀 Guia de Deploy - Evolua CRM

**Última atualização**: 28 de março de 2026  
**Versão**: 1.0  
**Responsável**: Frontend Dev + Backend Dev + DevOps

## 📍 Arquitetura de Deploy

```
┌──────────────────────────────────────────────────────────────────┐
│                    EVOLUA CRM - DEPLOY STRATEGY                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─ FRONTEND (Next.js 16) ──────┐                              │
│  │ Repository: frontend-evolua   │                              │
│  │ Platform: Vercel              │  ✅ Auto-deploy             │
│  │ Environments:                 │                              │
│  │ - main branch → prod          │                              │
│  │ - develop branch → staging    │                              │
│  │ URL: useevolua.com.br         │                              │
│  └───────────────────────────────┘                              │
│                                                                  │
│  ┌─ BACKEND (NestJS) ────────────┐                              │
│  │ Repository: backend-evolua    │                              │
│  │ Platform: AWS EC2 t2.micro    │  ⚠️ Manual deploy (Terraform)
│  │ IaC: Terraform                │                              │
│  │ Environment: production only   │                              │
│  │ URL: api.useevolua.com.br     │                              │
│  └───────────────────────────────┘                              │
│                                                                  │
│  ┌─ DATABASE (Supabase) ─────────┐                              │
│  │ Free tier PostgreSQL          │  ✅ Auto-migrations         │
│  │ Row-Level Security (RLS)      │                              │
│  │ Multi-tenant by clinic_id     │                              │
│  └───────────────────────────────┘                              │
│                                                                  │
│  ┌─ DOMAIN (Route53) ────────────┐                              │
│  │ useevolua.com.br              │    Terraform managed        │
│  │ useevolua.online              │                              │
│  └───────────────────────────────┘                              │
└──────────────────────────────────────────────────────────────────┘
```

## 🔄 Fluxo de Deploy por Tipo de Feature

### **FRONTEND ONLY (UI, Pages, Components)**

**Branch**: `feature/nome-da-feature` → `develop` → `main`

```bash
# 1. Criar branch de feature
git checkout -b feature/minha-feature

# 2. Desenvolver e commitar
git add .
git commit -m "feat: descrição clara"

# 3. Rodar testes e lint
npm run lint
npm run test

# 4. Push para remote
git push origin feature/minha-feature

# 5. Criar Pull Request em GitHub (develop)
# - Titulo: feat: descrição
# - Description: O que foi feito, por quê, testes executados
# - Code review obrigatório

# 6. Merge em develop
# ↓ Vercel auto-deploya para staging
# URL: http://localhost:3000 (ou preview URL do Vercel)

# 7. Testar em staging
# - Funcionalidade funciona?
# - CSS/responsividade OK?
# - Performance OK?

# 8. Merge develop em main (via PR)
# ↓ Vercel auto-deploya para produção
# URL: https://useevolua.com.br
```

**Checklist Frontend**:
- ✅ Componentes em PascalCase
- ✅ Arquivos em kebab-case  
- ✅ JSDoc para funções públicas
- ✅ TypeScript strict (sem `any`)
- ✅ React Query para server state
- ✅ Responsivo (mobile-first)
- ✅ Testes unitários se necessário
- ✅ Sem erros de ESLint

---

### **BACKEND ONLY (Controllers, Services, DB)**

**Branch**: `feature/nome-da-feature` → `develop` → `main`

```bash
# 1. Criar branch de feature
git checkout -b feature/novo-endpoint

# 2. Desenvolver (com migrations se necessário)
# - Criar DTO com class-validator
# - Service com lógica de negócio
# - Controller com endpoints
# - Prisma migration se mudar schema

# 3. Testar localmente
npm run start:dev
# Testar endpoints com Postman/Insomnia

# 4. Migrations do banco
npm run prisma:migrate

# 5. Rodar testes e lint
npm run test
npm run lint

# 6. Push para remote
git push origin feature/novo-endpoint

# 7. Criar Pull Request em GitHub (develop)
# Code review obrigatório

# 8. Merge em develop
# ⚠️ Backend NÃO auto-deploya no staging
# → Deploy manual via Terraform (optional para teste)

# 9. Merge main
# ⚠️ Backend NÃO auto-deploya
# → Coordenar deploy via Terraform + DevOps
```

**Checklist Backend**:
- ✅ DTOs com class-validator
- ✅ Service com lógica de negócio
- ✅ Controllers sem lógica complexa
- ✅ Prisma queries otimizadas (sem N+1)
- ✅ Tratamento de erro customizado
- ✅ Migrations reversíveis
- ✅ Testes unitários para services
- ✅ Documentação Swagger
- ✅ Sem erros de ESLint

---

### **FULL-STACK (Frontend + Backend)**

**Branch**: `feature/nome-da-feature` on both repos

```bash
# === BACKEND (começa antes) ===

# 1. backend-evolua/backend-evolua
git checkout -b feature/nova-integracao
# - Criar endpoints necessários
# - Migrations se precisar
npm run test && npm run lint
git push origin feature/nova-integracao
# → Criar PR, merge em develop

# === FRONTEND (paralelo) ===

# 2. frontend-evolua
git checkout -b feature/nova-integracao
# - Criar componentes
# - Conectar ao backend via lib/api/
# - React Query hooks
npm run lint && npm run test
git push origin feature/nova-integracao
# → Criar PR, merge em develop

# === SINCRONIZAÇÃO ===

# 3. Ambos em develop (staging)
# - Testar integração em develop.vercel.app
# - Checar se APIs conectam corretamente

# 4. Frontend merge main → prod auto-deploya
# 5. Backend merge main → ⚠️ Aguarda Terraform
```

**Importante**:
- Backend e Frontend devem estar sincronizados
- Versionar breaking changes claramente
- API versioning se necessário: `/api/v1/`, `/api/v2/`

---

### **DATABASE MIGRATIONS (Prisma)**

```bash
# 1. Fazer mudança no schema
# backend-evolua/backend-evolua/prisma/schema.prisma
schema {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model NewFeature {
  id        String   @id @default(cuid())
  clinicId  String
  data      String
  createdAt DateTime @default(now())
}

# 2. Gerar migration
npm run prisma:migrate dev --name add_new_feature_table

# 3. Review arquivo gerado
# prisma/migrations/[timestamp]_add_new_feature_table/migration.sql

# 4. Testar localmente
npm run prisma:studio  # GUI para verificar

# 5. Commit migration com schema.prisma
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add new feature table to schema"

# 6. Backend merge → develop
# 7. Deploy em prod:
# - Terraform apply (auto-executa migrations)
# OU
# - SSH em EC2 + npm run prisma:migrate deploy
```

**Rules**:
- ✅ Migrations sempre reversíveis
- ✅ Criar migrations incrementais (1 tabela por vez)
- ✅ Testar em dev antes de commitar
- ✅ Never `prisma push --skip-generate` em produção
- ✅ Include schema.prisma e migration files no Git

---

## 🚀 Deploy Checklist (Cada Release)

### **PRÉ-DEPLOY**

```bash
# 1. Frontend está pronto?
cd frontend-evolua
npm run build          # Build OK?
npm run test           # Testes passando?
npm run lint           # Sem erros?

# 2. Backend está pronto?
cd backend-evolua/backend-evolua
npm run build          # Build OK?
npm run test           # Testes passando?
npm run lint           # Sem erros?

# 3. Branches atualizadas?
git status             # Sem changes
git log --oneline -5   # Commits claros
```

### **FRONTEND DEPLOY**

```bash
# ✅ AUTOMÁTICO via Vercel

# Staging:
# - Push em develop
# - Vercel auto-deploya
# - Check em develop.vercel.app (ou preview URL)

# Produção:
# - Merge develop em main (via PR + review)
# - Vercel auto-deploya
# - Check em https://useevolua.com.br
```

### **BACKEND DEPLOY**

```bash
# ⚠️ SEMI-AUTOMÁTICO via Terraform

# 1. Garantir que main está atualizado
cd backend-evolua/backend-evolua
git checkout main
git pull origin main

# 2. Planejar mudança (opcional)
cd terraform
terraform plan

# 3. Aplicar mudanças
terraform apply              # Com confirmação
# OU
terraform apply -auto-approve  # Sem confirmação

# 4. Monitorar deploy
ssh -i evolua-key.pem ubuntu@<ELASTIC_IP>
tail -f /var/log/user-data.log

# 5. Verificar saúde
curl https://api.useevolua.com.br/api/health

# 6. Se erro, rollback
git revert HEAD
terraform apply -auto-approve
```

**Alternativa** (se apenas atualizando código):
```bash
# SSH em EC2
ssh -i evolua-key.pem ubuntu@<IP>

# Pull latest code
cd /home/ubuntu/backend-evolua
git pull origin main

# Rebuild + restart
npm ci
npm run build
pm2 restart backend-evolua

# Check status
pm2 status
curl http://localhost:8080/api/health
```

### **PÓS-DEPLOY**

```bash
# 1. Verificar URLs
Frontend: https://useevolua.com.br ✅
Backend:  https://api.useevolua.com.br/api/health ✅

# 2. Testar principais features
- Login funciona?
- Criar paciente funciona?
- Listar metas funciona?
- API está respondendo?

# 3. Checar logs
Frontend: Vercel dashboard
Backend:  SSH em EC2 → tail -f /var/log/user-data.log

# 4. Monitor alertas
- CPU/RAM EC2 normal?
- Database queries normal?
- Errors na aplicação?

# 5. Document release
- Quais features foram deployadas?
- Quais breaking changes?
- Rollback plan se necessário
```

---

## 📋 Workflows por Cenário

### **Novo Endpoint API**

```
1. Backend dev cria feature branch
2. Implementa controller + service + DTO
3. Cria migration se necessário
4. Testa em dev (npm run start:dev)
5. Merge em develop (code review)
6. Frontend dev começa implementação
7. Frontend conecta via lib/api/goals.ts
8. Ambos testam em staging
9. Backend + Frontend merge em main
10. Backend deployed via Terraform
11. Frontend auto-deploya via Vercel
```

### **Ajuste de UI (sem Backend)**

```
1. Frontend dev cria feature branch
2. Implementa componente/página
3. Testa localmente (npm run dev)
4. Lint + test (npm run lint && npm run test)
5. Push + PR em develop
6. Code review
7. Merge em develop → auto-deploy staging (Vercel)
8. Verificar em preview URL
9. Merge em main → auto-deploy prod (Vercel)
```

### **Correção de Bug**

```
1. Dev cria hotfix/bug-name a partir de main
2. Fixa o problema
3. Testa + lint + commits claros
4. PR direto em main (skip develop se urgente)
5. Code review rápido
6. Merge em main
7. Frontend: auto-deploy via Vercel segundos
8. Backend: Terraform apply quando pronto
```

### **Breaking Change**

```
1. Documentar breaking change claramente
2. Criar versão de API se necessário (/api/v2/)
3. Deprecation notice em v1
4. QA full regression test
5. Comunicar time sobre breaking change
6. Deploy versão new API
7. Clients migram gradualmente
8. Remove old version (later)
```

---

## 🛠️ Tools & Scripts

### **Makefile (Backend/Terraform)**

```bash
make help              # Mostra todos os comandos
make init              # terraform init
make plan              # terraform plan
make apply             # terraform apply
make apply-auto        # terraform apply -auto-approve
make destroy           # terraform destroy
make output            # terraform output
make output-json       # terraform output (JSON)
make ssh               # SSH em EC2 automaticamente
```

### **Package.json Scripts**

**Frontend** ([frontend-evolua/package.json](frontend-evolua/package.json)):
```bash
npm run dev            # Desenvolvimento local
npm run build          # Build Next.js
npm start              # Servir build
npm run lint           # Lint (ESLint)
npm run format         # Format (Prettier)
npm run test           # Testes Jest
```

**Backend** ([backend-evolua/backend-evolua/package.json](backend-evolua/backend-evolua/package.json)):
```bash
npm run start:dev      # Desenvolvimento (watch mode)
npm run build          # Build NestJS
npm start              # Produção
npm run start:prod     # Build + run
npm run lint           # Lint
npm run test           # Testes Jest
npm run prisma:migrate # Database migrations
npm run prisma:studio  # GUI Prisma
```

---

## 🔒 Variáveis de Ambiente

### **Frontend** ([.env.example](frontend-evolua/.env.example))

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# API
NEXT_PUBLIC_API_URL=https://api.useevolua.com.br/api

# App
NEXT_PUBLIC_APP_URL=https://useevolua.com.br
```

### **Backend** ([.env.example](backend-evolua/backend-evolua/.env.example))

```env
# Node
NODE_ENV=production
PORT=8080

# Supabase
SUPABASE_URL=https://...supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://user:pass@host/db  # Connection pooler
DIRECT_URL=postgresql://user:pass@host/db    # Direct (migrations)

# CORS
CORS_ORIGINS=https://useevolua.com.br

# Secrets
JWT_SECRET=...
API_KEY=...
```

---

## ⚠️ Cuidados Importantes

### **Never Commit**
- ❌ `.env` ou `.env.local` (use `.env.example`)
- ❌ Secrets ou API keys
- ❌ `node_modules` (already in .gitignore)
- ❌ Build artifacts (`dist/`, `.next/`)

### **DB Migrations**
- ❌ Nunca mudar migration arquivo
- ❌ Sempre reverter com `migration_revert`
- ✅ Sempre testar localmente primeiro
- ✅ Sempre incluir no commit

### **Secrets & Credentials**
- 🔒 Guardar em AWS Secrets Manager
- 🔒 Terraform variables (terraform.tfvars é local-only)
- 🔒 Vercel environment variables
- 🔒 Never push terraform.tfvars com secrets

### **Emergency Rollback**
```bash
# Frontend: Vercel tem rollback automático
# → Click "Revert to previous deployment"

# Backend: Git revert
git revert <commit-hash>
git push origin main
terraform apply -auto-approve
```

---

## 📊 Custo de Deploy

| Serviço | Custo | Notas |
|---|---|---|
| Vercel | $0 | Frontend (Hobby tier) |
| EC2 t2.micro | $0-8 | Backend (Free tier 12mo, depois ~$8) |
| Route53 | $1 | 2 hosted zones |
| Supabase | $0-25 | Database (starter tier) |
| **Total** | **~$1-2/mês** | Muito econômico |

---

## 📞 Contatos & Escalação

| Problema | Responsável | Ação |
|---|---|---|
| Frontend não deploya | Frontend Dev | Check Vercel dashboard |
| API não responde | Backend Dev | SSH em EC2, check logs |
| Database down | Backend Dev | Check Supabase dashboard |
| DNS not resolving | DevOps | Check Route53 records |
| EC2 crashed | DevOps | Check AWS console, terraform apply |
| Need secret? | DevOps | AWS Secrets Manager |

---

## ✨ Padrão Git Commit

```bash
# Formato
<type>(<scope>): <subject>

<body>

<footer>

# Exemplos

feat(goals): add create goal API endpoint
- Implemented POST /patient-goals endpoint
- Added class-validator DTO
- Tests passing

fix(buttons): fix primary button color in dark mode
- Changed from #purple-600 to #purple-700
- Tested in light and dark modes

docs: add deploy guide for team
- Step-by-step deploy instructions
- Checklists for each environment

# Scopes: goals, auth, patients, reports, etc
# Types: feat, fix, docs, style, refactor, test, chore, perf
```

---

## 🎯 Sumário

1. **Frontend**: Git push → Vercel auto-deploya
2. **Backend**: Git push → Terraform apply (manual)
3. **Database**: Prisma migrations com Schema
4. **DNS**: Route53 via Terraform
5. **Monitoring**: Vercel dashboard + EC2 SSH
6. **Emergency**: Rollback via Git revert + Terraform

**Deploy sempre em esta ordem**:
```
1. Feature branches com bom testing
2. Code review obrigatório
3. Merge em develop (staging)
4. Testar em staging
5. Frontend merge main (auto → prod)
6. Backend terraform apply (manual → prod)
7. Verify production
8. Document release
```

---

**Última revisão**: 28/03/2026  
**Próxima revisão**: Quando houver mudança de infraestrutura
