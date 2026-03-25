# 🚀 DevOps / Infrastructure Specialist Agent

**Role**: Especialista em deploy, CI/CD, infraestrutura, monitoring  
**Focus**: Docker, AWS, Terraform, monitoring, segurança

## Quando Usar Este Agent

Peça ajuda para:
- 🐳 **Docker**: Multi-stage builds, otimizações, security
- ☁️ **AWS**: EC2, Amplify, Route53, S3, IAM, CloudWatch
- 🏗️ **Terraform**: Infrastructure as Code, state management
- 🔄 **CI/CD**: GitHub Actions, deploy pipelines, rollback
- 📊 **Monitoring**: CloudWatch, logs, alertas, health checks
- 🔐 **Security**: Credentials, secrets, SSL/TLS, firewalls
- 📦 **Backup**: Snapshots, disaster recovery, high availability

## 🏗️ Infraestrutura do Projeto Evolua

### Arquitetura Atual
```
┌─────────────────────────────────────────────────────────────┐
│                       EVOLUA CRM                            │
│                   (Minimal Cost Setup)                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Cliente (Browser)                                           │
└────────┬────────────────────────────────────────────────────┘
         │
         ├─ useevolua.com          → Vercel Frontend (Next.js)
         └─ api.useevolua.com      → AWS EC2 Backend (NestJS)
                   ↓
         ┌─────────────────────────────────────────────────────┐
         │ AWS Route53 (DNS)                                   │
         │ - Root (A record): 76.76.21.21 (Vercel)            │
         │ - api (A record): Elastic IP (EC2)                 │
         └─────────────────────────────────────────────────────┘
                   │
         ┌─────────┴────────────┐
         │                      │
    ┌────▼──────┐          ┌───▼──────────┐
    │  Vercel   │          │ AWS EC2 ✓    │
    │ Frontend  │          │ Free Tier    │
    │ Next.js   │          │ t2.micro     │
    └───────────┘          │              │
                          │ Backend      │
                          │ NestJS 19    │
                          │ PM2          │
                          │ Nginx        │
                          │ Node 22      │
                          └───┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │ Supabase (BD)      │
                    │ PostgreSQL 15      │
                    │ RLS Enabled        │
                    └────────────────────┘
```

### Custos Mensais

| Componente | Custo | Notas |
|-----------|-------|-------|
| EC2 t2.micro | $0 | Free tier (12 meses) |
| Elastic IP | $0 | Grátis enquanto associado |
| Route53 | $0.50 | Hosted zone |
| Supabase | $0-25 | Starter plan com usage |
| Vercel | $0 | Hobby plan (frontend) |
| **Total** | **~$1/mês** | ✅ Muito barato |

---

## 📁 Arquivos DevOps

### Terraform (Infrastructure as Code)
```
terraform/
├── main.tf                 # Configuração do provider AWS
├── variables.tf            # Variáveis (input)
├── outputs.tf              # Outputs (IP, URLs, etc)
├── ec2.tf                  # EC2 com Elastic IP
├── vpc.tf                  # VPC padrão + Security Group
├── route53.tf              # DNS (useevolua.com)
├── terraform.tfvars.example # Template (NUNCA commitar .tfvars!)
├── terraform.tfvars        # ⚠️ SECRETS (git ignored)
├── user-data/
│   ├── backend-init.sh     # Setup automático EC2 (Node, PM2, Nginx, SSL)
│   └── app-init.sh         # (Não usado atualmente)
└── evolua-key.pem          # SSH key privada (⚠️ NUNCA commitar)
```

### Docker
```
backend-evolua/
├── Dockerfile              # Multi-stage build
│   ├── Stage 1: Builder    # npm ci, prisma generate, npm build
│   └── Stage 2: Runner     # Apenas binários + node_modules
├── HEALTHCHECK             # wget /api/health (port 8080)
└── deploy.sh               # Deploy manual (SSH) ou CI/CD
```

### Deploy Scripts
```
backend-evolua/
└── deploy.sh               # Manual: ssh → git pull → npm ci → build → pm2 restart
```

---

## 🚀 Como Fazer Deploy

### Opção A: Deploy Manual (Dev/Staging)

```bash
# 1. Obter IP do EC2
cd terraform
terraform output backend_public_ip
# Resultado: 54.123.45.67

# 2. Fazer deploy do código
cd ../backend-evolua
./deploy.sh 54.123.45.67

# Ou com variável de ambiente
export EVOLUA_KEY_PATH=~/keys/evolua-key.pem
./deploy.sh 54.123.45.67
```

### Opção B: Deploy via CI/CD (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy Backend
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to EC2
        env:
          EC2_IP: ${{ secrets.EC2_IP }}
          SSH_KEY: ${{ secrets.SSH_KEY }}
        run: |
          echo "$SSH_KEY" > key.pem
          chmod 600 key.pem
          ./backend-evolua/deploy.sh $EC2_IP
```

### Opção C: Docker Build + ECR

```bash
# Build e push para AWS ECR
aws ecr get-login-password --region sa-east-1 | \
  docker login --username AWS --password-stdin $ECR_URL

docker build -t backend-evolua:latest backend-evolua/backend-evolua/
docker tag backend-evolua:latest $ECR_URL/backend-evolua:latest
docker push $ECR_URL/backend-evolua:latest

# Deploy com docker run na EC2
ssh -i evolua-key.pem ubuntu@IP
docker pull $ECR_URL/backend-evolua:latest
docker run -d -p 8080:8080 --env-file .env $ECR_URL/backend-evolua:latest
```

---

## 🔐 Segurança (CRÍTICO!)

### ⚠️ Problemas Identificados (25/03/2026)

| # | Problema | Severidade | Status |
|---|----------|-----------|--------|
| 1 | AWS Credentials Revoked | 🔴 CRÍTICA | ✅ Documentado |
| 2 | Secrets em plaintext | 🔴 CRÍTICA | ⚠️ Precisa ação |
| 3 | GitHub repo pode falhar | 🔴 CRÍTICA | ✅ Melhorado |
| 4 | HTTP sem HTTPS | 🟠 ALTA | ✅ Implementado |
| 5 | Sem backup | 🟡 MÉDIA | ⚠️ Pendente |
| 6 | Sem monitoring | 🟡 MÉDIA | ⚠️ Pendente |

**Ler**: [terraform/SECURITY-CHECKLIST.md](../../terraform/SECURITY-CHECKLIST.md)

### Quick Security Checklist

```bash
# 1. Verify SSL/TLS
curl -I https://api.useevolua.com/api/health

# 2. Check no secrets in git
git log -p | grep -i "secret\|key\|password" | wc -l
# Deve retornar: 0

# 3. Validate AWS credentials
aws sts get-caller-identity

# 4. Check Security Group
aws ec2 describe-security-groups --query 'SecurityGroups[*].[GroupId,IpPermissions]'
```

---

## 📊 Monitoramento

### Health Checks

| Endpoint | Esperado | Verbo | Intervalo |
|----------|----------|-------|-----------|
| `/api/health` | 200 OK | GET | 30s (Docker) |
| Nginx | 200 OK | HEAD | 60s (externa) |
| Database | connected | Prisma | On startup |

```bash
# Tester health checks
curl https://api.useevolua.com/api/health
# Deve retornar: { "status": "ok" }
```

### Logs

```bash
# Frontend (Vercel)
# Dashboard → Analytics → Logs

# Backend (EC2)
ssh -i terraform/evolua-key.pem ubuntu@IP
pm2 logs evolua-backend
tail -f /home/ubuntu/logs/backend-*.log
tail -f /var/log/nginx/access.log
tail -f /var/log/user-data.log  # Setup log
```

### CloudWatch Alarms (TODO)

```bash
# Ver alarms
aws cloudwatch describe-alarms --region sa-east-1

# Criar alarm de health check
aws cloudwatch put-metric-alarm \
  --alarm-name evolua-backend-health \
  --alarm-description "Backend health check" \
  --metric-name HealthCheckStatus \
  --namespace AWS/Route53 \
  --statistic Minimum \
  --period 60 \
  --threshold 1 \
  --comparison-operator LessThanThreshold
```

---

## 🔄 Procedimentos Comuns

### Reiniciar Backend

```bash
# SSH
ssh -i terraform/evolua-key.pem ubuntu@IP

# Via PM2
pm2 restart evolua-backend
pm2 logs evolua-backend

# Ou reiniciar manualmente
cd /home/ubuntu/evolua-backend
npm run build
pm2 restart evolua-backend
```

### Escalar para t3.small (2 vCPU, 2GB RAM)

```bash
# terraform/terraform.tfvars
instance_type = "t3.small"  # Mudou de t2.micro

# Deploy
cd terraform
terraform plan
terraform apply
```

### Backup EBS Volume

```bash
# Manual
VOLUME_ID=$(aws ec2 describe-instances \
  --instance-ids i-xxxxx \
  --query 'Reservations[0].Instances[0].BlockDeviceMappings[0].Ebs.VolumeId' \
  --output text)

aws ec2 create-snapshot \
  --volume-id $VOLUME_ID \
  --description "Backup manual $(date)"
```

### Rollback Último Deploy

```bash
# Se deployment quebrou, fazer revert
m -i terraform/evolua-key.pem ubuntu@IP
cd /home/ubuntu/evolua-backend
git revert HEAD --no-edit
npm ci && npm run build
pm2 restart evolua-backend
```

---

## Instruções para Invocar

```bash
@copilot (devops) [pergunta sobre infraestrutura]

Exemplos:
@copilot (devops) configure HTTPS/SSL para api.useevolua.com
@copilot (devops) setup CloudWatch alarms para health checks
@copilot (devops) create backup strategy para EBS
@copilot (devops) optimize Dockerfile para t2.micro
@copilot (devops) setup GitHub Actions para auto-deploy
```

---

## 📚 Referências

- **AWS EC2**: https://docs.aws.amazon.com/ec2
- **Terraform AWS**: https://registry.terraform.io/providers/hashicorp/aws/latest/docs
- **NestJS Deploy**: https://docs.nestjs.com/deployment
- **PM2**: https://pm2.keymetrics.io/docs/usage/quick-start
- **Nginx**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/

---

## ✅ Quando Pronto para Produção

- [x] Dockerfile otimizado (multi-stage)
- [x] Health check implementado
- [x] Elastic IP configurado
- [x] Route53 DNS ativo
- [x] HTTPS/SSL com auto-renovacao
- [ ] CloudWatch alarms configurados
- [ ] EBS snapshots automáticos
- [ ] GitHub Actions CI/CD
- [ ] Monitoramento centralizado
- [ ] Procedimento de rollback testado

---

**Última Auditoria**: 25 de março de 2026  
**Próxima Auditoria**: 25 de junho de 2026  
**Status Score**: 65/100 (Melhorando)

