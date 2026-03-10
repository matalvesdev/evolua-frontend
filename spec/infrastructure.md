# Especificação de Infraestrutura - Evolua CRM

## Visão Geral

A infraestrutura do Evolua CRM é baseada em uma arquitetura cloud-native utilizando **AWS EC2 (free tier)** para hospedagem do frontend Next.js com SSR e backend APIs, combinado com **Supabase** para autenticação, storage e banco de dados PostgreSQL. Esta arquitetura oferece melhor performance para SSR, custo zero nos primeiros 12 meses (free tier), e simplicidade no desenvolvimento e deploy.

## Arquitetura de Cloud

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                         USUÁRIOS                             │
│                    (Terapeutas/Pacientes)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    AWS FREE TIER                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  CloudFront (CDN) - OPCIONAL                         │   │
│  │  - Cache de assets estáticos                         │   │
│  │  - SSL/TLS gratuito                                  │   │
│  │  - 1TB transferência/mês                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                         │                                    │
│                         ▼                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Application Load Balancer (ALB) - OPCIONAL          │   │
│  │  - Balanceamento de carga                            │   │
│  │  - Health checks                                     │   │
│  │  - SSL termination                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                         │                                    │
│                         ▼                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  EC2 Instance (t2.micro / t3.micro)                  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Next.js 16 (SSR + SSG + ISR)                  │  │   │
│  │  │  - Frontend React                              │  │   │
│  │  │  - Server-Side Rendering                       │  │   │
│  │  │  - API Routes                                  │  │   │
│  │  │  - Static Generation                           │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Node.js 20 + PM2                              │  │   │
│  │  │  - Process manager                             │  │   │
│  │  │  - Auto-restart                                │  │   │
│  │  │  - Load balancing                              │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Nginx (Reverse Proxy)                         │  │   │
│  │  │  - SSL/TLS termination                         │  │   │
│  │  │  - Static file serving                         │  │   │
│  │  │  - Gzip compression                            │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                                                        │   │
│  │  Specs: 1 vCPU, 1GB RAM, 30GB SSD                    │   │
│  │  Free Tier: 750 horas/mês (12 meses)                 │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ API Calls
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database (Managed)                       │   │
│  │  - Row Level Security (RLS)                          │   │
│  │  - Real-time Subscriptions                           │   │
│  │  - Automatic Backups                                 │   │
│  │  - 500MB storage (free tier)                         │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Authentication Service                              │   │
│  │  - JWT Tokens                                        │   │
│  │  - OAuth Providers (Google)                          │   │
│  │  - Session Management                                │   │
│  │  - 50.000 MAU (free tier)                            │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Storage (S3-compatible)                             │   │
│  │  - Patient Documents                                 │   │
│  │  - Audio Recordings                                  │   │
│  │  - Profile Images                                    │   │
│  │  - 1GB storage (free tier)                           │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Cache (opcional)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  UPSTASH REDIS (Opcional)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Redis Serverless                                    │   │
│  │  - Session Cache                                     │   │
│  │  - Rate Limiting                                     │   │
│  │  - 10.000 commands/dia (free tier)                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Componentes de Infraestrutura

## Componentes de Infraestrutura

### 1. AWS EC2 (Aplicação Principal)

**Responsabilidades:**
- Hospedagem do Next.js 16 com SSR
- Servir frontend React
- API Routes do Next.js
- Server-Side Rendering
- Static Generation (SSG)
- Incremental Static Regeneration (ISR)

**Especificações da Instância:**

#### Free Tier (12 meses)
- **Tipo:** t2.micro ou t3.micro
- **vCPU:** 1 core
- **RAM:** 1GB
- **Storage:** 30GB SSD (EBS)
- **Horas:** 750 horas/mês (24/7)
- **Transferência:** 15GB/mês de saída

#### Após Free Tier
- **Custo:** ~$8-10/mês (t2.micro)
- **Upgrade:** t3.small ($15/mês) para melhor performance

**Sistema Operacional:**
- Ubuntu Server 22.04 LTS (recomendado)
- Amazon Linux 2023 (alternativa)

**Stack de Software:**

```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 (Process Manager)
sudo npm install -g pm2

# Nginx (Reverse Proxy)
sudo apt-get install -y nginx

# Certbot (SSL gratuito via Let's Encrypt)
sudo apt-get install -y certbot python3-certbot-nginx
```

**Configuração do Nginx:**

```nginx
# /etc/nginx/sites-available/evolua-crm
server {
    listen 80;
    server_name app.evolua.com.br;

    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.evolua.com.br;

    # Certificados SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/app.evolua.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.evolua.com.br/privkey.pem;

    # Configurações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;

    # Proxy para Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache para assets estáticos
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }

    # Cache para imagens
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        proxy_pass http://localhost:3000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

**Configuração do PM2:**

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'evolua-crm',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/home/ubuntu/evolua-crm/frontend-evolua',
    instances: 1, // 1 instância para t2.micro (1GB RAM)
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    error_file: '/home/ubuntu/logs/err.log',
    out_file: '/home/ubuntu/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '800M', // Restart se usar mais de 800MB
  }]
};
```

**Script de Deploy:**

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Deploying Evolua CRM..."

# 1. Pull latest code
cd /home/ubuntu/evolua-crm
git pull origin main

# 2. Install dependencies
cd frontend-evolua
npm ci --only=production

# 3. Build Next.js
npm run build

# 4. Restart PM2
pm2 restart evolua-crm

# 5. Save PM2 configuration
pm2 save

echo "✅ Deploy completed successfully!"
```

**Security Groups (Firewall):**

```yaml
Inbound Rules:
  - Type: HTTP
    Protocol: TCP
    Port: 80
    Source: 0.0.0.0/0 (Anywhere)
  
  - Type: HTTPS
    Protocol: TCP
    Port: 443
    Source: 0.0.0.0/0 (Anywhere)
  
  - Type: SSH
    Protocol: TCP
    Port: 22
    Source: SEU_IP/32 (Seu IP apenas)

Outbound Rules:
  - Type: All traffic
    Protocol: All
    Port: All
    Destination: 0.0.0.0/0
```

**Elastic IP (Recomendado):**
- IP fixo para o EC2
- Gratuito enquanto a instância estiver rodando
- Evita mudança de IP ao reiniciar

**Benefícios:**
- Servidor sempre disponível (sem cold start)
- SSR funciona perfeitamente
- WebSockets suportados
- Custo zero por 12 meses
- Fácil de debugar e monitorar
- Deploy simples com Git + PM2

### 2. Supabase (Database, Auth, Storage)

**Responsabilidades:**
- Banco de dados PostgreSQL gerenciado
- Autenticação e autorização
- Storage de arquivos
- Real-time subscriptions
- APIs REST automáticas (PostgREST)

#### 2.1 PostgreSQL Database

**Características:**
- **Versão:** PostgreSQL 15+
- **Replicação:** Multi-region replication
- **Backups:** Automáticos diários + point-in-time recovery
- **Escalabilidade:** Vertical scaling automático
- **Segurança:** Row Level Security (RLS) habilitado

**Schemas Principais:**
```sql
-- Schemas do banco
public          -- Tabelas principais
auth            -- Autenticação (gerenciado pelo Supabase)
storage         -- Metadados de arquivos
extensions      -- Extensões PostgreSQL (pgcrypto, uuid-ossp)
```

**Extensões Habilitadas:**
- `uuid-ossp` - Geração de UUIDs
- `pgcrypto` - Criptografia
- `pg_stat_statements` - Análise de performance
- `pg_trgm` - Busca fuzzy

#### 2.2 Authentication Service

**Provedores Suportados:**
- Email/Password (nativo)
- Google OAuth
- Magic Links (email)
- Phone (SMS) - futuro

**Configuração de Sessão:**
- **JWT Expiration:** 1 hora
- **Refresh Token:** 30 dias
- **Session Storage:** Cookies HTTP-only
- **PKCE Flow:** Habilitado para segurança adicional

**Políticas de Senha:**
- Mínimo 8 caracteres
- Pelo menos 1 letra maiúscula
- Pelo menos 1 número
- Pelo menos 1 caractere especial

#### 2.3 Storage (S3-compatible)

**Buckets:**
```
storage/
├── avatars/              # Fotos de perfil (público)
├── patient-documents/    # Documentos de pacientes (privado)
├── audio-recordings/     # Gravações de áudio (privado)
└── reports/              # Relatórios gerados (privado)
```

**Políticas de Acesso:**
- **Avatars:** Leitura pública, escrita autenticada
- **Patient Documents:** Acesso restrito ao terapeuta responsável
- **Audio Recordings:** Acesso restrito ao terapeuta responsável
- **Reports:** Acesso restrito ao terapeuta responsável

**Limites:**
- Tamanho máximo por arquivo: 50MB
- Tipos permitidos: PDF, DOCX, JPG, PNG, MP3, WAV
- Quota por usuário: 5GB

**Nota:** As APIs customizadas agora são implementadas como Next.js API Routes rodando no EC2, eliminando a necessidade de Lambda Functions separadas.

### 3. Upstash Redis (Cache - Opcional)

**Responsabilidades:**
- Cache de sessões
- Rate limiting de APIs
- Cache de queries frequentes
- Armazenamento temporário

**Configuração:**
```typescript
// Rate limiting config
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 req/10s
  analytics: true,
});
```

**Estratégias de Cache:**
- **Session Cache:** TTL 1 hora
- **Query Cache:** TTL 5 minutos
- **Rate Limit:** Sliding window 10 req/10s
- **Temporary Data:** TTL 24 horas

**Benefícios:**
- Serverless (pay-per-request)
- Latência ultra-baixa (<1ms)
- Global replication
- Sem gerenciamento de infraestrutura

### 4. CloudFront CDN (Opcional - Para Otimização)

**Responsabilidades:**
- Rastreamento de eventos de usuário
- Métricas de performance
- Análise de comportamento
- Dashboards de analytics

**Eventos Rastreados:**
- Page views
- User actions (clicks, form submissions)
- Errors e exceptions
- Performance metrics (LCP, FID, CLS)
- Custom events (patient created, appointment scheduled)

**Integração:**
```tsx
import { HimetricaProvider } from '@/components/analytics/himetrica-provider';

<HimetricaProvider apiKey={process.env.NEXT_PUBLIC_HIMETRICA_API_KEY}>
  <App />
</HimetricaProvider>
```

### 4. CloudFront CDN (Opcional - Para Otimização)

**Responsabilidades:**
- Cache de assets estáticos
- Distribuição global de conteúdo
- Redução de latência
- Proteção DDoS

**Quando Usar:**
- Tráfego internacional significativo
- Necessidade de latência ultra-baixa
- Proteção adicional contra ataques

**Free Tier:**
- 1TB de transferência/mês
- 10M requisições HTTP/mês
- 2M requisições HTTPS/mês

**Configuração:**
```bash
# Criar distribuição apontando para EC2
aws cloudfront create-distribution \
  --origin-domain-name ec2-xx-xx-xx-xx.compute.amazonaws.com \
  --default-cache-behavior "ViewerProtocolPolicy=redirect-to-https"
```

**Nota:** CloudFront é opcional. Para começar, o Nginx no EC2 é suficiente.

## Ambientes

### Development (Local)

**Configuração:**
```env
# .env.development
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=local-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Serviços Locais:**
- Next.js Dev Server: `http://localhost:3000`
- Supabase Local: `http://localhost:54321`
- Supabase Studio: `http://localhost:54323`

**Comandos:**
```bash
# Iniciar Supabase local
supabase start

# Iniciar frontend
cd frontend-evolua
npm run dev

# Rodar migrações
supabase db reset
```

### Staging (Pré-Produção)

**URL:** `https://staging.evolua.app`

**Configuração:**
- Branch: `staging`
- EC2: Instância t2.micro dedicada
- Elastic IP: IP fixo dedicado
- Supabase Project: `evolua-staging`
- Redis: Instância dedicada staging (opcional)

**Propósito:**
- Testes de integração
- Validação de features
- Testes de performance
- Testes de segurança

### Production (Produção)

**URL:** `https://app.evolua.com.br`

**Configuração:**
- Branch: `main`
- EC2: Instância t2.micro (upgrade para t3.small se necessário)
- Elastic IP: IP fixo dedicado
- Supabase Project: `evolua-production`
- Redis: Instância dedicada production (opcional)
- CloudFront: Opcional para otimização
- Monitoring: CloudWatch habilitado
- Backups: Snapshots automáticos do EBS

**SLA:**
- Uptime: 99.5% (single instance)
- Response Time: <500ms (p95)
- Error Rate: <1%

## CI/CD Pipeline

### Workflow de Deploy

```
┌─────────────┐
│  Git Push   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  GitHub Actions     │
│  - Lint             │
│  - Type Check       │
│  - Unit Tests       │
│  - Build            │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  SSH to EC2         │
│  - Pull code        │
│  - Install deps     │
│  - Build Next.js    │
│  - Restart PM2      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Supabase           │
│  - Run Migrations   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Smoke Tests        │
│  - Health Check     │
│  - Critical Paths   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Notification       │
│  - Slack/Email      │
└─────────────────────┘
```

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: frontend-evolua/package-lock.json
      
      - name: Install dependencies
        working-directory: frontend-evolua
        run: npm ci
      
      - name: Run ESLint
        working-directory: frontend-evolua
        run: npm run lint
      
      - name: Type check
        working-directory: frontend-evolua
        run: npx tsc --noEmit
      
      - name: Run tests
        working-directory: frontend-evolua
        run: npm test -- --coverage

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /home/ubuntu/evolua-crm
            git pull origin main
            cd frontend-evolua
            npm ci --only=production
            npm run build
            pm2 restart evolua-crm
            pm2 save
      
      - name: Run Supabase Migrations
        run: |
          npx supabase db push --db-url ${{ secrets.SUPABASE_DB_URL }}
      
      - name: Health Check
        run: |
          sleep 10
          curl -f https://app.evolua.com.br/api/health || exit 1
      
      - name: Notify Slack
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Deploy to production ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Verificações Pré-Deploy

**Obrigatórias:**
- ✅ ESLint sem erros
- ✅ TypeScript compilation sem erros
- ✅ Testes unitários passando
- ✅ Build bem-sucedido
- ✅ Sem vulnerabilidades críticas (npm audit)

**Recomendadas:**
- ⚠️ Cobertura de testes >80%
- ⚠️ Performance budget respeitado
- ⚠️ Lighthouse score >90

## Gerenciamento de Segredos

### Variáveis de Ambiente

**Públicas (NEXT_PUBLIC_*):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_API_URL=https://api.evolua.com.br
NEXT_PUBLIC_APP_URL=https://app.evolua.com.br
NEXT_PUBLIC_HIMETRICA_API_KEY=hm_xxx
```

**Privadas (Server-side only):**
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
DATABASE_URL=postgresql://...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=xxx
WHATSAPP_API_KEY=xxx
OPENAI_API_KEY=sk-xxx
```

### Armazenamento de Segredos

**AWS Amplify:**
- Variáveis de ambiente configuradas no console
- Criptografadas em repouso
- Injetadas em build time

**Supabase:**
- Secrets gerenciados via Supabase CLI
- Acessíveis apenas em Edge Functions
- Rotação manual de secrets

**GitHub:**
- Secrets armazenados em GitHub Secrets
- Usados em GitHub Actions
- Nunca expostos em logs

## Logging e Monitoramento

### Logs

**Frontend (Amplify):**
- CloudWatch Logs
- Retention: 30 dias
- Níveis: ERROR, WARN, INFO

**Backend (Supabase):**
- Supabase Logs
- Retention: 7 dias (free tier), 90 dias (pro)
- Tipos: Database, Auth, Storage, Functions

**Estrutura de Log:**
```json
{
  "timestamp": "2024-03-09T10:30:00Z",
  "level": "ERROR",
  "service": "frontend",
  "message": "Failed to fetch patients",
  "userId": "uuid",
  "error": {
    "name": "SupabaseError",
    "message": "Connection timeout",
    "stack": "..."
  },
  "context": {
    "route": "/dashboard/pacientes",
    "userAgent": "Mozilla/5.0..."
  }
}
```

### Monitoramento

**Métricas Monitoradas:**
- **Uptime** - Disponibilidade do sistema
- **Response Time** - Latência de APIs
- **Error Rate** - Taxa de erros
- **Database Performance** - Query time, connections
- **CDN Performance** - Cache hit rate, bandwidth
- **User Metrics** - Active users, sessions

**Ferramentas:**
- **AWS CloudWatch** - Métricas de infraestrutura
- **Supabase Dashboard** - Métricas de banco e APIs
- **Himetrica** - Métricas de usuário e performance
- **Uptime Robot** - Monitoramento de uptime

**Alertas:**
- Uptime <99% → Slack + Email
- Error rate >1% → Slack
- Response time >500ms (p95) → Slack
- Database connections >80% → Email

## Backup e Disaster Recovery

### Estratégia de Backup

**Database (Supabase):**
- **Backups Automáticos:** Diários às 3:00 AM UTC
- **Retention:** 7 dias (free), 30 dias (pro)
- **Point-in-Time Recovery:** Últimas 24 horas
- **Backup Manual:** Disponível via CLI

**Storage (Supabase):**
- **Replicação:** Multi-region automática
- **Versioning:** Habilitado para documentos críticos
- **Soft Delete:** 30 dias antes de exclusão permanente

**Código:**
- **Git Repository:** GitHub (backup automático)
- **Branches Protegidas:** main, staging
- **Tags de Release:** Versionamento semântico

### Disaster Recovery Plan

**RTO (Recovery Time Objective):** 4 horas
**RPO (Recovery Point Objective):** 24 horas

**Procedimento de Recuperação:**

1. **Identificar o Problema**
   - Verificar status dos serviços
   - Analisar logs e métricas
   - Determinar escopo do incidente

2. **Isolar o Problema**
   - Rollback para versão anterior (se deploy recente)
   - Desabilitar feature problemática (feature flags)
   - Redirecionar tráfego (se necessário)

3. **Restaurar Serviços**
   - Restaurar backup de banco (se necessário)
   - Redeployar aplicação
   - Validar funcionalidades críticas

4. **Comunicação**
   - Notificar stakeholders
   - Atualizar status page
   - Documentar incidente

5. **Post-Mortem**
   - Análise de causa raiz
   - Ações corretivas
   - Atualizar runbooks

## Escalabilidade

### Estratégias de Escala

**Frontend (Amplify):**
- **Horizontal:** CDN global com edge locations
- **Vertical:** Não aplicável (serverless)
- **Auto-scaling:** Automático baseado em tráfego

**Database (Supabase):**
- **Vertical:** Upgrade de plano (CPU, RAM, Storage)
- **Read Replicas:** Para queries de leitura pesadas
- **Connection Pooling:** PgBouncer integrado
- **Indexes:** Otimização de queries

**Cache (Upstash Redis):**
- **Horizontal:** Replicação global automática
- **Vertical:** Não aplicável (serverless)
- **Auto-scaling:** Automático baseado em uso

### Limites Atuais

**Amplify:**
- Requests: Ilimitado
- Bandwidth: 15GB/mês (free), ilimitado (paid)
- Build minutes: 1000/mês (free)

**Supabase (Pro Plan):**
- Database: 8GB RAM, 2 CPU cores
- Storage: 100GB
- Bandwidth: 250GB/mês
- Edge Functions: 2M invocations/mês

**Upstash Redis:**
- Commands: 10K/dia (free), ilimitado (paid)
- Storage: 256MB (free), ilimitado (paid)
- Bandwidth: Ilimitado

### Plano de Crescimento

**0-1K usuários:** Plano atual (Free/Pro)
**1K-10K usuários:** Upgrade Supabase para Team Plan
**10K-100K usuários:** Considerar database dedicado
**100K+ usuários:** Migrar para arquitetura multi-tenant otimizada

## Custos Estimados

### Breakdown Mensal

#### Primeiros 12 Meses (Free Tier)

| Serviço | Plano | Custo Mensal |
|---------|-------|--------------|
| AWS EC2 (t2.micro) | Free Tier | $0 |
| AWS EBS (30GB) | Free Tier | $0 |
| AWS Data Transfer | Free Tier (15GB) | $0 |
| Elastic IP | Gratuito (instância rodando) | $0 |
| Supabase | Free | $0 |
| Upstash Redis | Free (opcional) | $0 |
| Let's Encrypt SSL | Gratuito | $0 |
| **Total (12 meses)** | | **$0/mês** |

#### Após Free Tier (Mês 13+)

| Serviço | Plano | Custo Mensal |
|---------|-------|--------------|
| AWS EC2 (t2.micro) | On-Demand | $8.50 |
| AWS EBS (30GB) | gp3 | $2.40 |
| AWS Data Transfer | Pay-as-you-go | $1-5 |
| Elastic IP | Gratuito | $0 |
| Supabase | Free/Pro | $0-25 |
| Upstash Redis | Free (opcional) | $0 |
| CloudFront | Opcional | $0-10 |
| **Total** | | **$12-51/mês** |

#### Opções de Upgrade

| Instância | vCPU | RAM | Custo/mês | Quando Usar |
|-----------|------|-----|-----------|-------------|
| t2.micro | 1 | 1GB | $8.50 | Início, baixo tráfego |
| t3.small | 2 | 2GB | $15 | Tráfego moderado |
| t3.medium | 2 | 4GB | $30 | Alto tráfego |

### Otimização de Custos

**Estratégias:**
1. **Reserved Instances** - 30-40% desconto com compromisso de 1 ano
2. **Savings Plans** - Flexibilidade com desconto
3. **Spot Instances** - Não recomendado para produção
4. **CloudFront** - Adicionar apenas quando necessário
5. **Monitoring** - Usar CloudWatch free tier (5GB logs)
6. **Backups** - Snapshots EBS apenas quando necessário ($0.05/GB/mês)

## Segurança de Infraestrutura

### Proteções Implementadas

**Network Security:**
- HTTPS obrigatório (TLS 1.3)
- HSTS habilitado
- CORS configurado
- Rate limiting (Upstash)

**Database Security:**
- Row Level Security (RLS) habilitado
- Prepared statements (SQL injection prevention)
- Encrypted at rest
- Encrypted in transit

**Authentication:**
- JWT tokens com expiração
- Refresh token rotation
- Session management seguro
- OAuth 2.0 / OIDC

**Compliance:**
- LGPD compliance (dados no Brasil)
- GDPR ready
- HIPAA considerations (dados de saúde)

## Próximos Passos

### Melhorias Planejadas

1. **Auto Scaling**
   - Implementar Auto Scaling Group
   - Load Balancer (ALB)
   - Múltiplas instâncias EC2

2. **High Availability**
   - Multi-AZ deployment
   - RDS para banco (migrar de Supabase se necessário)
   - ElastiCache Redis

3. **Monitoring Avançado**
   - CloudWatch Dashboards
   - CloudWatch Alarms
   - Application Performance Monitoring (APM)

4. **CI/CD Avançado**
   - Blue-Green Deployment
   - Canary Deployment
   - Automated Rollback

5. **CDN Optimization**
   - Implementar CloudFront
   - Edge caching
   - Image optimization com CloudFront

6. **Database Optimization**
   - Read replicas (se migrar para RDS)
   - Connection pooling
   - Query optimization

7. **Security Enhancements**
   - WAF (Web Application Firewall)
   - AWS Shield (DDoS protection)
   - AWS Secrets Manager
   - VPC com subnets privadas

8. **Backup Strategy**
   - Automated EBS snapshots
   - Cross-region backup
   - Disaster recovery plan

## Guia de Setup Inicial

### 1. Criar Instância EC2

```bash
# Via AWS CLI
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t2.micro \
  --key-name evolua-key \
  --security-group-ids sg-xxxxxxxxx \
  --subnet-id subnet-xxxxxxxxx \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=evolua-crm-prod}]'
```

### 2. Configurar Security Group

```bash
# Permitir HTTP
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

# Permitir HTTPS
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

# Permitir SSH (apenas seu IP)
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp \
  --port 22 \
  --cidr SEU_IP/32
```

### 3. Alocar Elastic IP

```bash
# Alocar IP
aws ec2 allocate-address --domain vpc

# Associar ao EC2
aws ec2 associate-address \
  --instance-id i-xxxxxxxxx \
  --allocation-id eipalloc-xxxxxxxxx
```

### 4. Conectar via SSH

```bash
ssh -i evolua-key.pem ubuntu@SEU_ELASTIC_IP
```

### 5. Instalar Dependências

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar Nginx
sudo apt-get install -y nginx

# Instalar Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Instalar Git
sudo apt-get install -y git
```

### 6. Clonar Repositório

```bash
cd /home/ubuntu
git clone https://github.com/seu-usuario/evolua-crm.git
cd evolua-crm/frontend-evolua
npm install
```

### 7. Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env.production
cat > .env.production << EOF
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_APP_URL=https://app.evolua.com.br
EOF
```

### 8. Build e Iniciar Aplicação

```bash
# Build Next.js
npm run build

# Iniciar com PM2
pm2 start npm --name "evolua-crm" -- start
pm2 save
pm2 startup
```

### 9. Configurar Nginx

```bash
# Criar configuração
sudo nano /etc/nginx/sites-available/evolua-crm

# Habilitar site
sudo ln -s /etc/nginx/sites-available/evolua-crm /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 10. Configurar SSL

```bash
# Obter certificado Let's Encrypt
sudo certbot --nginx -d app.evolua.com.br

# Renovação automática já está configurada
```

### 11. Configurar DNS

No seu provedor de DNS (ex: Cloudflare, Route53):
```
Type: A
Name: app
Value: SEU_ELASTIC_IP
TTL: 300
```

### 12. Verificar Deploy

```bash
# Verificar PM2
pm2 status

# Verificar logs
pm2 logs evolua-crm

# Verificar Nginx
sudo systemctl status nginx

# Testar aplicação
curl https://app.evolua.com.br
```

## Troubleshooting

### Aplicação não inicia
```bash
# Verificar logs do PM2
pm2 logs evolua-crm --lines 100

# Verificar porta 3000
sudo netstat -tulpn | grep 3000

# Reiniciar aplicação
pm2 restart evolua-crm
```

### Nginx retorna 502
```bash
# Verificar se Next.js está rodando
pm2 status

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/error.log

# Testar conexão local
curl http://localhost:3000
```

### SSL não funciona
```bash
# Verificar certificados
sudo certbot certificates

# Renovar manualmente
sudo certbot renew

# Verificar configuração Nginx
sudo nginx -t
```

### Memória insuficiente
```bash
# Verificar uso de memória
free -h

# Adicionar swap (temporário)
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Reduzir instâncias PM2
pm2 scale evolua-crm 1
```
