# 📐 Notas de Arquitetura - Evolua CRM

## 🏗️ Estrutura de Repositórios

O projeto Evolua CRM está dividido em dois repositórios separados:

### 1. Frontend (Next.js)
**Repositório:** https://github.com/matalvesdev/evolua-frontend.git

**Tecnologias:**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui

**Deploy:**
- AWS EC2 (t2.micro)
- Nginx como reverse proxy
- PM2 como process manager
- SSL via Let's Encrypt

**Domínios:**
- `app.evolua.com` - Aplicação principal
- `useevolua.com` - Landing page

### 2. Backend (API)
**Repositório:** https://github.com/matalvesdev/evolua-backend.git

**Tecnologias:**
- Node.js / Express (presumido)
- APIs REST

**Deploy Atual:**
- AWS App Runner
- URL: https://ms6r3rm76k.us-east-1.awsapprunner.com/api

**Nota:** O backend já está deployado e funcionando. Esta migração foca apenas no frontend.

---

## 🔄 Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                      USUÁRIOS                                │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              AWS EC2 (Frontend - Nova Infra)                 │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Next.js 16                                        │     │
│  │  - app.evolua.com                                  │     │
│  │  - useevolua.com                                   │     │
│  └────────────────────────────────────────────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ├─────────────────┐
                         │                 │
                         ▼                 ▼
┌──────────────────────────────┐  ┌──────────────────────────┐
│  AWS App Runner (Backend)    │  │  Supabase                │
│  - API REST                  │  │  - PostgreSQL            │
│  - ms6r3rm76k...awsapprunner │  │  - Auth                  │
│  - Já deployado              │  │  - Storage               │
└──────────────────────────────┘  └──────────────────────────┘
```

---

## 🌐 URLs e Endpoints

### Frontend (Nova Infraestrutura)
- **App:** https://app.evolua.com
- **Landing:** https://useevolua.com
- **Servidor:** EC2 t2.micro (sa-east-1)

### Backend (Infraestrutura Existente)
- **API:** https://ms6r3rm76k.us-east-1.awsapprunner.com/api
- **Servidor:** AWS App Runner (us-east-1)

### Supabase (Produção)
- **URL:** https://diiaoaboykraaiavgdqs.supabase.co
- **Região:** Não especificada (provavelmente us-east-1)

---

## 🔐 Variáveis de Ambiente

### Frontend (.env.production)
```env
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://diiaoaboykraaiavgdqs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=https://app.evolua.com
NEXT_PUBLIC_API_URL=https://ms6r3rm76k.us-east-1.awsapprunner.com/api
```

**Nota:** O frontend se comunica com:
1. **Supabase** - Para auth, storage e banco de dados
2. **Backend API** - Para lógica de negócio adicional

---

## 📊 Comparação: Antes vs Depois

### Antes (Infraestrutura Antiga)
- **Frontend:** AWS Amplify (presumido)
- **Backend:** AWS App Runner
- **Custo:** Desconhecido
- **IaC:** Não

### Depois (Nova Infraestrutura)
- **Frontend:** AWS EC2 (Terraform)
- **Backend:** AWS App Runner (mantido)
- **Custo:** ~$0.50/mês (12 meses), depois ~$15-20/mês
- **IaC:** ✅ Terraform

---

## 🚀 Deploy Strategy

### Frontend (Esta Migração)
1. Provisionar EC2 com Terraform
2. Clonar repositório do frontend
3. Build Next.js
4. Iniciar com PM2
5. Configurar Nginx
6. Configurar SSL
7. Atualizar DNS

### Backend (Não Afetado)
- Mantém infraestrutura atual
- Nenhuma mudança necessária
- Continua funcionando normalmente

---

## 🔄 CI/CD (Futuro)

### Frontend
```yaml
# .github/workflows/deploy-frontend.yml
on:
  push:
    branches: [main]
    paths:
      - '**'

jobs:
  deploy:
    - SSH to EC2
    - Pull latest code
    - npm ci && npm run build
    - pm2 restart evolua-crm
```

### Backend
- Mantém CI/CD existente do App Runner
- Nenhuma mudança necessária

---

## 📈 Escalabilidade

### Frontend (EC2)
**Vertical Scaling:**
- t2.micro → t3.small (2GB RAM)
- t3.small → t3.medium (4GB RAM)

**Horizontal Scaling (Futuro):**
- Adicionar Load Balancer (ALB)
- Múltiplas instâncias EC2
- Auto Scaling Group

### Backend (App Runner)
- Já tem auto-scaling configurado
- Gerenciado pela AWS

---

## 💰 Custos Detalhados

### Frontend (Nova Infra)
| Recurso | Free Tier | Após Free Tier |
|---------|-----------|----------------|
| EC2 t2.micro | $0 (12 meses) | $10/mês |
| EBS 30GB | $0 (12 meses) | $3/mês |
| Data Transfer | $0 (15GB) | $1-5/mês |
| Route53 | $0.50/mês | $0.50/mês |
| **Total** | **$0.50/mês** | **$15-20/mês** |

### Backend (Mantido)
- Custo atual mantido
- Sem mudanças

### Supabase
- Free tier atual
- Sem mudanças

---

## 🔒 Segurança

### Frontend
- ✅ HTTPS obrigatório (Let's Encrypt)
- ✅ SSH restrito ao IP do admin
- ✅ Security Groups configurados
- ✅ Firewall UFW
- ✅ Variáveis de ambiente protegidas

### Backend
- Mantém configuração atual
- Já tem HTTPS configurado

### Supabase
- ✅ Row Level Security (RLS)
- ✅ JWT tokens
- ✅ Encrypted at rest

---

## 📝 Notas Importantes

### 1. Repositórios Separados
- Frontend e backend são independentes
- Cada um tem seu próprio ciclo de deploy
- Comunicação via API REST

### 2. Backend Não Afetado
- Esta migração NÃO altera o backend
- Backend continua no App Runner
- URL da API permanece a mesma

### 3. Supabase Compartilhado
- Frontend e backend usam mesmo Supabase
- Credenciais compartilhadas
- Banco de dados único

### 4. DNS
- `app.evolua.com` → Frontend (EC2)
- `useevolua.com` → Frontend (EC2)
- API backend mantém URL atual

---

## 🎯 Próximos Passos (Pós-Migração)

### Curto Prazo
1. ✅ Migrar frontend para EC2
2. ✅ Configurar DNS
3. ✅ Configurar SSL
4. ✅ Testar integração com backend

### Médio Prazo
1. Implementar CI/CD para frontend
2. Configurar staging environment
3. Adicionar monitoring avançado
4. Implementar backups automáticos

### Longo Prazo
1. Considerar migrar backend para EC2 também
2. Implementar Load Balancer
3. Adicionar Auto Scaling
4. Implementar CDN (CloudFront)

---

## 🆘 Troubleshooting

### Frontend não conecta ao Backend

**Sintoma:** Erros de CORS ou timeout

**Solução:**
1. Verificar `NEXT_PUBLIC_API_URL` no .env.production
2. Verificar se backend está rodando
3. Verificar CORS no backend

### Frontend não conecta ao Supabase

**Sintoma:** Erros de autenticação

**Solução:**
1. Verificar `NEXT_PUBLIC_SUPABASE_URL`
2. Verificar `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Verificar RLS policies no Supabase

---

**Última atualização:** 09/03/2024  
**Versão:** 1.0.0
