# Skill: DevOps - Evolua CRM

## Descrição

Este skill contém conhecimento especializado sobre práticas DevOps, infraestrutura como código, containerização, CI/CD, automação de deploy e gerenciamento de ambientes cloud para o Evolua CRM. O objetivo é garantir entregas rápidas, confiáveis e seguras através de automação e monitoramento contínuo.

## Princípios DevOps

### 1. Cultura DevOps
- **Colaboração** - Dev e Ops trabalham juntos
- **Automação** - Automatizar processos repetitivos
- **Medição** - Métricas para tomada de decisão
- **Compartilhamento** - Conhecimento compartilhado entre times
- **Feedback rápido** - Ciclos curtos de feedback

### 2. Práticas Fundamentais
- **Continuous Integration (CI)** - Integração contínua de código
- **Continuous Delivery (CD)** - Entrega contínua em produção
- **Infrastructure as Code (IaC)** - Infraestrutura versionada
- **Monitoring & Logging** - Observabilidade completa
- **Incident Management** - Resposta rápida a incidentes

## Containerização

### Docker

#### Dockerfile para Frontend (Next.js)

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Dependências
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Builder
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose para Desenvolvimento Local

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend-evolua
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    volumes:
      - ./frontend-evolua:/app
      - /app/node_modules
    depends_on:
      - supabase
    networks:
      - evolua-network

  supabase:
    image: supabase/postgres:15
    ports:
      - "54322:5432"
    environment:
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=evolua
    volumes:
      - supabase-data:/var/lib/postgresql/data
    networks:
      - evolua-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - evolua-network

volumes:
  supabase-data:
  redis-data:

networks:
  evolua-network:
    driver: bridge
```

#### Boas Práticas Docker

1. **Multi-stage builds** - Reduzir tamanho da imagem
2. **Layer caching** - Otimizar tempo de build
3. **Non-root user** - Segurança
4. **.dockerignore** - Excluir arquivos desnecessários
5. **Health checks** - Verificar saúde do container

```dockerfile
# .dockerignore
node_modules
.next
.git
.env.local
*.log
```

## CI/CD Pipeline

### GitHub Actions

#### Workflow de Deploy

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  lint:
    name: Lint & Type Check
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

  test:
    name: Run Tests
    runs-on: ubuntu-latest
    needs: lint
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
      
      - name: Run unit tests
        working-directory: frontend-evolua
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend-evolua/coverage/lcov.info

  security:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      
      - name: Run npm audit
        working-directory: frontend-evolua
        run: npm audit --audit-level=high
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: [test, security]
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
      
      - name: Build application
        working-directory: frontend-evolua
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: frontend-evolua/.next

  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/staging'
    environment:
      name: staging
      url: https://staging.evolua.app
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to AWS Amplify (Staging)
        run: |
          echo "Deploying to staging..."
          # Amplify auto-deploy via webhook
      
      - name: Run smoke tests
        run: |
          npm run test:e2e:staging

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://app.evolua.com.br
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to AWS Amplify (Production)
        run: |
          echo "Deploying to production..."
          # Amplify auto-deploy via webhook
      
      - name: Run smoke tests
        run: |
          npm run test:e2e:production
      
      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Deployment to production completed!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}

  rollback:
    name: Rollback on Failure
    runs-on: ubuntu-latest
    needs: deploy-production
    if: failure()
    steps:
      - name: Rollback deployment
        run: |
          echo "Rolling back to previous version..."
          # Implementar lógica de rollback
```

#### Workflow de Preview (Pull Requests)

```yaml
# .github/workflows/preview.yml
name: Preview Deployment

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  preview:
    name: Deploy Preview
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy preview environment
        run: |
          echo "Deploying preview for PR #${{ github.event.pull_request.number }}"
          # Amplify cria preview automaticamente
      
      - name: Comment PR with preview URL
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🚀 Preview deployed: https://pr-${{ github.event.pull_request.number }}.evolua.app'
            })
```

## Infrastructure as Code (IaC)

### Terraform (Exemplo para AWS)

```hcl
# terraform/main.tf
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "evolua-terraform-state"
    key    = "production/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# Amplify App
resource "aws_amplify_app" "evolua_frontend" {
  name       = "evolua-crm"
  repository = "https://github.com/evolua/crm"
  
  build_spec = file("${path.module}/amplify.yml")
  
  environment_variables = {
    NEXT_PUBLIC_SUPABASE_URL      = var.supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY = var.supabase_anon_key
  }
  
  custom_rule {
    source = "/<*>"
    status = "404"
    target = "/index.html"
  }
}

# Amplify Branch (Production)
resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.evolua_frontend.id
  branch_name = "main"
  
  enable_auto_build = true
  stage             = "PRODUCTION"
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "amplify_logs" {
  name              = "/aws/amplify/evolua-crm"
  retention_in_days = 30
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "high_error_rate" {
  alarm_name          = "evolua-high-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "5xxError"
  namespace           = "AWS/Amplify"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "This metric monitors error rate"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}

# SNS Topic for Alerts
resource "aws_sns_topic" "alerts" {
  name = "evolua-alerts"
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}
```

### Variáveis Terraform

```hcl
# terraform/variables.tf
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "supabase_url" {
  description = "Supabase project URL"
  type        = string
  sensitive   = true
}

variable "supabase_anon_key" {
  description = "Supabase anonymous key"
  type        = string
  sensitive   = true
}

variable "alert_email" {
  description = "Email for alerts"
  type        = string
}
```

## Automação de Deploy

### Scripts de Deploy

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

ENVIRONMENT=$1

if [ -z "$ENVIRONMENT" ]; then
  echo "Usage: ./deploy.sh [staging|production]"
  exit 1
fi

echo "🚀 Deploying to $ENVIRONMENT..."

# 1. Verificar branch
if [ "$ENVIRONMENT" = "production" ]; then
  BRANCH="main"
else
  BRANCH="staging"
fi

CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
  echo "❌ Error: Must be on $BRANCH branch"
  exit 1
fi

# 2. Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Error: Uncommitted changes detected"
  exit 1
fi

# 3. Rodar testes
echo "🧪 Running tests..."
cd frontend-evolua
npm run test

# 4. Build
echo "🔨 Building application..."
npm run build

# 5. Deploy
echo "📦 Deploying..."
git push origin $BRANCH

# 6. Aguardar deploy
echo "⏳ Waiting for deployment..."
sleep 30

# 7. Smoke tests
echo "🔍 Running smoke tests..."
if [ "$ENVIRONMENT" = "production" ]; then
  npm run test:smoke -- --url=https://app.evolua.com.br
else
  npm run test:smoke -- --url=https://staging.evolua.app
fi

echo "✅ Deployment completed successfully!"
```

### Rollback Script

```bash
#!/bin/bash
# scripts/rollback.sh

set -e

ENVIRONMENT=$1

if [ -z "$ENVIRONMENT" ]; then
  echo "Usage: ./rollback.sh [staging|production]"
  exit 1
fi

echo "⏪ Rolling back $ENVIRONMENT..."

# 1. Obter último commit bom
LAST_GOOD_COMMIT=$(git log --format="%H" -n 2 | tail -1)

echo "Rolling back to commit: $LAST_GOOD_COMMIT"

# 2. Criar branch de rollback
git checkout -b rollback-$(date +%Y%m%d-%H%M%S) $LAST_GOOD_COMMIT

# 3. Force push
if [ "$ENVIRONMENT" = "production" ]; then
  git push origin HEAD:main --force
else
  git push origin HEAD:staging --force
fi

echo "✅ Rollback completed!"
```

## Monitoramento e Logging

### CloudWatch Logs

```typescript
// lib/logger.ts
import { CloudWatchLogsClient, PutLogEventsCommand } from '@aws-sdk/client-cloudwatch-logs';

const client = new CloudWatchLogsClient({ region: 'us-east-1' });

export async function logToCloudWatch(
  logGroupName: string,
  logStreamName: string,
  message: string,
  level: 'INFO' | 'WARN' | 'ERROR'
) {
  const command = new PutLogEventsCommand({
    logGroupName,
    logStreamName,
    logEvents: [
      {
        message: JSON.stringify({
          timestamp: new Date().toISOString(),
          level,
          message,
        }),
        timestamp: Date.now(),
      },
    ],
  });

  await client.send(command);
}
```

### Métricas Customizadas

```typescript
// lib/metrics.ts
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';

const client = new CloudWatchClient({ region: 'us-east-1' });

export async function trackMetric(
  metricName: string,
  value: number,
  unit: string = 'Count'
) {
  const command = new PutMetricDataCommand({
    Namespace: 'Evolua/CRM',
    MetricData: [
      {
        MetricName: metricName,
        Value: value,
        Unit: unit,
        Timestamp: new Date(),
      },
    ],
  });

  await client.send(command);
}

// Uso
await trackMetric('PatientCreated', 1);
await trackMetric('AppointmentScheduled', 1);
await trackMetric('ReportGenerated', 1);
```

## Gerenciamento de Ambientes

### Variáveis de Ambiente por Ambiente

```bash
# .env.development
NODE_ENV=development
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_API_URL=http://localhost:3000

# .env.staging
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://staging.supabase.co
NEXT_PUBLIC_API_URL=https://staging-api.evolua.app

# .env.production
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://prod.supabase.co
NEXT_PUBLIC_API_URL=https://api.evolua.com.br
```

### Configuração por Ambiente

```typescript
// config/environment.ts
const environments = {
  development: {
    apiUrl: 'http://localhost:3000',
    supabaseUrl: 'http://localhost:54321',
    logLevel: 'debug',
  },
  staging: {
    apiUrl: 'https://staging-api.evolua.app',
    supabaseUrl: 'https://staging.supabase.co',
    logLevel: 'info',
  },
  production: {
    apiUrl: 'https://api.evolua.com.br',
    supabaseUrl: 'https://prod.supabase.co',
    logLevel: 'error',
  },
};

export const config = environments[process.env.NODE_ENV || 'development'];
```

## Backup e Disaster Recovery

### Script de Backup Automatizado

```bash
#!/bin/bash
# scripts/backup.sh

set -e

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="backups/$TIMESTAMP"

echo "📦 Creating backup..."

# 1. Backup do banco de dados
echo "Backing up database..."
supabase db dump > "$BACKUP_DIR/database.sql"

# 2. Backup de arquivos do storage
echo "Backing up storage..."
aws s3 sync s3://evolua-storage "$BACKUP_DIR/storage"

# 3. Backup de configurações
echo "Backing up configurations..."
cp -r .env.production "$BACKUP_DIR/"
cp -r terraform/ "$BACKUP_DIR/terraform"

# 4. Comprimir backup
echo "Compressing backup..."
tar -czf "backup-$TIMESTAMP.tar.gz" "$BACKUP_DIR"

# 5. Upload para S3
echo "Uploading to S3..."
aws s3 cp "backup-$TIMESTAMP.tar.gz" s3://evolua-backups/

# 6. Limpar backups antigos (manter últimos 30 dias)
echo "Cleaning old backups..."
find backups/ -type f -mtime +30 -delete

echo "✅ Backup completed: backup-$TIMESTAMP.tar.gz"
```

### Cron Job para Backups

```bash
# crontab -e
# Backup diário às 3:00 AM
0 3 * * * /path/to/scripts/backup.sh >> /var/log/evolua-backup.log 2>&1
```

## Boas Práticas DevOps

### 1. Versionamento Semântico
```
MAJOR.MINOR.PATCH
1.0.0 → 1.0.1 (patch: bug fix)
1.0.1 → 1.1.0 (minor: new feature)
1.1.0 → 2.0.0 (major: breaking change)
```

### 2. Git Flow
- `main` - Produção
- `staging` - Pré-produção
- `develop` - Desenvolvimento
- `feature/*` - Features
- `hotfix/*` - Correções urgentes

### 3. Code Review
- Pelo menos 1 aprovação antes de merge
- Testes automatizados devem passar
- Sem conflitos de merge
- Documentação atualizada

### 4. Deployment Strategy
- **Blue-Green Deployment** - Dois ambientes idênticos
- **Canary Deployment** - Deploy gradual
- **Rolling Deployment** - Atualização incremental

### 5. Monitoring
- **Uptime** - Disponibilidade do sistema
- **Response Time** - Latência de APIs
- **Error Rate** - Taxa de erros
- **Resource Usage** - CPU, memória, disco

## Erros Comuns a Evitar

### ❌ Erros Frequentes

1. **Não testar antes de deploy**
   - Sempre rodar testes localmente
   - CI/CD deve bloquear deploy se testes falharem

2. **Deploy direto em produção**
   - Sempre passar por staging primeiro
   - Validar em ambiente similar a produção

3. **Não ter rollback plan**
   - Sempre ter estratégia de rollback
   - Testar rollback regularmente

4. **Secrets no código**
   - Nunca commitar secrets
   - Usar variáveis de ambiente
   - Usar secret managers (AWS Secrets Manager, Vault)

5. **Não monitorar após deploy**
   - Monitorar métricas após deploy
   - Configurar alertas para anomalias

6. **Builds não reproduzíveis**
   - Usar lock files (package-lock.json)
   - Fixar versões de dependências
   - Usar Docker para consistência

7. **Logs inadequados**
   - Logar informações relevantes
   - Não logar dados sensíveis
   - Estruturar logs (JSON)

8. **Não documentar mudanças**
   - Manter CHANGELOG.md atualizado
   - Documentar breaking changes
   - Comunicar mudanças ao time

## Checklist de Deploy

### Pré-Deploy
- [ ] Testes passando
- [ ] Code review aprovado
- [ ] Documentação atualizada
- [ ] CHANGELOG.md atualizado
- [ ] Variáveis de ambiente configuradas
- [ ] Backup realizado
- [ ] Stakeholders notificados

### Durante Deploy
- [ ] Monitorar logs
- [ ] Verificar métricas
- [ ] Smoke tests executados
- [ ] Health checks passando

### Pós-Deploy
- [ ] Validar funcionalidades críticas
- [ ] Verificar performance
- [ ] Monitorar error rate
- [ ] Confirmar com stakeholders
- [ ] Documentar issues encontrados

## Ferramentas Recomendadas

### CI/CD
- GitHub Actions
- GitLab CI
- CircleCI
- Jenkins

### Containerização
- Docker
- Docker Compose
- Kubernetes (para escala)

### IaC
- Terraform
- AWS CloudFormation
- Pulumi

### Monitoramento
- AWS CloudWatch
- Datadog
- New Relic
- Grafana + Prometheus

### Logging
- AWS CloudWatch Logs
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Splunk

### Alertas
- PagerDuty
- Opsgenie
- Slack integrations

## Recursos Adicionais

### Documentação
- [AWS Amplify Docs](https://docs.amplify.aws/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [GitHub Actions](https://docs.github.com/en/actions)

### Livros
- "The Phoenix Project" - Gene Kim
- "The DevOps Handbook" - Gene Kim
- "Site Reliability Engineering" - Google

### Cursos
- AWS Certified DevOps Engineer
- Docker Mastery
- Terraform Associate Certification
