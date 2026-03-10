# Resumo da Arquitetura - Evolua CRM

## 🏗️ Arquitetura Atual

### Stack Tecnológico

```
┌─────────────────────────────────────────┐
│           FRONTEND + BACKEND            │
│                                         │
│  AWS EC2 (t2.micro - Free Tier)        │
│  ├── Next.js 16 (SSR + SSG + ISR)      │
│  ├── React 19                           │
│  ├── TypeScript                         │
│  ├── PM2 (Process Manager)              │
│  └── Nginx (Reverse Proxy + SSL)       │
│                                         │
│  Specs: 1 vCPU, 1GB RAM, 30GB SSD      │
│  Custo: $0/mês (12 meses free tier)    │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         DATABASE + AUTH + STORAGE       │
│                                         │
│  Supabase (Free Tier)                  │
│  ├── PostgreSQL (500MB)                 │
│  ├── Authentication (50K MAU)           │
│  ├── Storage (1GB)                      │
│  ├── Row Level Security (RLS)           │
│  └── Real-time Subscriptions            │
│                                         │
│  Custo: $0/mês (free tier)             │
└─────────────────────────────────────────┘
```

## 💰 Custos

### Primeiros 12 Meses
- **Total: $0/mês** (100% free tier)

### Após 12 Meses
- **EC2 t2.micro:** $8.50/mês
- **EBS 30GB:** $2.40/mês
- **Data Transfer:** $1-5/mês
- **Supabase:** $0-25/mês (free tier ou Pro)
- **Total: $12-41/mês**

## 🚀 Vantagens da Arquitetura

### 1. Custo Zero Inicial
- 12 meses de free tier AWS
- Supabase free tier permanente
- SSL gratuito (Let's Encrypt)
- Sem custos de CDN inicialmente

### 2. Performance Otimizada
- SSR (Server-Side Rendering) sem cold start
- Servidor sempre disponível
- Latência consistente
- WebSockets suportados nativamente

### 3. Simplicidade
- Deploy tradicional (Git + PM2)
- Fácil de debugar
- Logs centralizados
- SSH direto para troubleshooting

### 4. Escalabilidade
- Fácil upgrade de instância (t2.micro → t3.small)
- Pode adicionar CloudFront depois
- Pode adicionar Load Balancer depois
- Pode migrar para Auto Scaling Group

## 📊 Comparação com Alternativas

| Aspecto | EC2 + Supabase | Amplify + Lambda | Vercel + Supabase |
|---------|----------------|------------------|-------------------|
| **Custo (12 meses)** | $0 | $15-50/mês | $20-100/mês |
| **SSR Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Cold Start** | Não | Sim (Lambda) | Não |
| **Simplicidade** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Controle** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **WebSockets** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |

## 🔧 Componentes Principais

### 1. AWS EC2
- **Função:** Hospedar Next.js com SSR
- **Tipo:** t2.micro (1 vCPU, 1GB RAM)
- **OS:** Ubuntu Server 22.04 LTS
- **Free Tier:** 750 horas/mês por 12 meses

### 2. Nginx
- **Função:** Reverse proxy e SSL termination
- **Features:** Gzip, cache, SSL/TLS
- **Certificado:** Let's Encrypt (gratuito)

### 3. PM2
- **Função:** Process manager para Node.js
- **Features:** Auto-restart, clustering, logs
- **Instâncias:** 1 (suficiente para t2.micro)

### 4. Supabase
- **PostgreSQL:** Banco de dados principal
- **Auth:** JWT, OAuth (Google)
- **Storage:** Documentos, áudios, imagens
- **RLS:** Segurança em nível de linha

### 5. Elastic IP
- **Função:** IP fixo para o EC2
- **Custo:** Gratuito (enquanto instância roda)
- **Benefício:** DNS não muda ao reiniciar

## 📦 Fluxo de Deploy

```
1. Developer push to GitHub (main branch)
        ↓
2. GitHub Actions triggered
        ↓
3. SSH to EC2
        ↓
4. Pull latest code
        ↓
5. npm ci --only=production
        ↓
6. npm run build
        ↓
7. pm2 restart evolua-crm
        ↓
8. Deploy complete! ✅
```

## 🔒 Segurança

### Implementado
- ✅ HTTPS/SSL (Let's Encrypt)
- ✅ Security Group (firewall AWS)
- ✅ SSH apenas do seu IP
- ✅ Row Level Security (Supabase)
- ✅ JWT Authentication
- ✅ Variáveis de ambiente seguras

### Próximos Passos
- [ ] WAF (Web Application Firewall)
- [ ] AWS Shield (DDoS protection)
- [ ] Secrets Manager
- [ ] VPC com subnets privadas
- [ ] Backup automático

## 📈 Plano de Crescimento

### Fase 1: MVP (0-100 usuários)
- **Atual:** EC2 t2.micro + Supabase free
- **Custo:** $0/mês (12 meses)
- **Performance:** Suficiente

### Fase 2: Crescimento (100-1000 usuários)
- **Upgrade:** EC2 t3.small (2 vCPU, 2GB RAM)
- **Adicionar:** CloudFront CDN
- **Supabase:** Upgrade para Pro ($25/mês)
- **Custo:** ~$50/mês

### Fase 3: Escala (1000-10000 usuários)
- **Upgrade:** EC2 t3.medium (2 vCPU, 4GB RAM)
- **Adicionar:** Application Load Balancer
- **Adicionar:** Auto Scaling (2-4 instâncias)
- **Adicionar:** ElastiCache Redis
- **Custo:** ~$150-200/mês

### Fase 4: Enterprise (10000+ usuários)
- **Migrar:** RDS PostgreSQL (multi-AZ)
- **Adicionar:** CloudFront + WAF
- **Adicionar:** Multi-region deployment
- **Adicionar:** Dedicated support
- **Custo:** $500-1000/mês

## 🎯 Decisões Arquiteturais

### Por que EC2 ao invés de Lambda?
1. **SSR Performance:** Next.js SSR funciona melhor em servidor persistente
2. **Sem Cold Start:** Servidor sempre quente
3. **WebSockets:** Suporte nativo para real-time
4. **Custo Previsível:** Sem surpresas com picos de tráfego
5. **Simplicidade:** Deploy tradicional, fácil de debugar

### Por que Supabase ao invés de RDS?
1. **Free Tier Generoso:** 500MB + Auth + Storage grátis
2. **Auth Integrado:** JWT, OAuth já configurado
3. **Storage Integrado:** S3-compatible storage incluído
4. **RLS Nativo:** Segurança em nível de linha
5. **Real-time:** WebSockets para updates em tempo real

### Por que Nginx ao invés de ALB?
1. **Custo:** Nginx é gratuito, ALB custa ~$16/mês
2. **Simplicidade:** Configuração mais simples
3. **Performance:** Suficiente para começar
4. **SSL Gratuito:** Let's Encrypt integrado
5. **Upgrade Path:** Pode adicionar ALB depois

## 📚 Documentação Relacionada

- [Guia Completo de Setup EC2](./ec2-setup-guide.md)
- [Especificação de Infraestrutura](./infrastructure.md)
- [Especificação de Backend](./backend.md)
- [Especificação de Frontend](./frontend.md)
- [Especificação de APIs](./api.md)

## 🔗 Links Úteis

- [AWS EC2 Free Tier](https://aws.amazon.com/free/)
- [Supabase Pricing](https://supabase.com/pricing)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

## ✅ Checklist de Implementação

### Setup Inicial
- [ ] Criar conta AWS
- [ ] Criar instância EC2 t2.micro
- [ ] Alocar Elastic IP
- [ ] Configurar Security Group
- [ ] Configurar DNS (A record)
- [ ] Conectar via SSH

### Instalação de Software
- [ ] Instalar Node.js 20
- [ ] Instalar PM2
- [ ] Instalar Nginx
- [ ] Instalar Certbot
- [ ] Instalar Git

### Deploy da Aplicação
- [ ] Clonar repositório
- [ ] Configurar .env.production
- [ ] npm ci --only=production
- [ ] npm run build
- [ ] Configurar PM2
- [ ] Iniciar aplicação

### Configuração de Servidor
- [ ] Configurar Nginx
- [ ] Obter certificado SSL
- [ ] Testar HTTPS
- [ ] Configurar renovação automática SSL

### Automação
- [ ] Criar script de deploy
- [ ] Configurar GitHub Actions (opcional)
- [ ] Testar deploy automático

### Monitoramento
- [ ] Configurar CloudWatch (opcional)
- [ ] Configurar alarmes (opcional)
- [ ] Configurar backups

## 🎉 Resultado Final

Após seguir todos os passos, você terá:

✅ Aplicação Next.js rodando em produção  
✅ HTTPS configurado (cadeado verde)  
✅ Deploy automático via Git  
✅ Custo zero por 12 meses  
✅ Performance otimizada para SSR  
✅ Fácil de escalar conforme crescimento  

**URL de Produção:** `https://app.evolua.com.br`

---

**Última atualização:** 2024-03-09  
**Versão da Arquitetura:** 2.0 (EC2 + Supabase)
