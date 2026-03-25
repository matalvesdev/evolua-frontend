# Infraestrutura Evolua CRM - Custo Mínimo

## Arquitetura

| Serviço | Plataforma | Custo |
|---|---|---|
| Frontend Next.js | Vercel (free tier) | $0 |
| Backend NestJS | EC2 t2.micro (free tier) | $0* |
| Banco de dados | Supabase (free tier) | $0 |
| DNS | Route53 | $0.50/mês |
| SSL | Let's Encrypt (Certbot) | $0 |

*Free tier: 750h/mês por 12 meses. Após isso: ~$8/mês.

**Custo total: $0.50/mês** (apenas Route53)

---

## Pré-requisitos

```bash
# AWS CLI configurado
aws configure

# Terraform instalado
terraform --version

# Chave SSH criada
aws ec2 create-key-pair \
  --key-name evolua-key \
  --region sa-east-1 \
  --query 'KeyMaterial' \
  --output text > evolua-key.pem
chmod 400 evolua-key.pem
```

---

## Deploy

### 1. Preencher variáveis

Edite `terraform.tfvars` e preencha:
- `supabase_service_role_key` — painel Supabase > Settings > API
- `database_url` — painel Supabase > Settings > Database > Connection string (pooler, porta 6543)
- `allowed_ssh_cidr` — seu IP atual + `/32`

### 2. Aplicar infraestrutura

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

### 3. Configurar DNS

Após o `apply`, copie os name servers exibidos no output `route53_nameservers` e configure no registrador do domínio `useevolua.com`.

### 4. Aguardar setup do EC2

```bash
ssh -i evolua-key.pem ubuntu@<IP_DO_OUTPUT>
tail -f /var/log/user-data.log
```

### 5. Configurar SSL

```bash
sudo certbot --nginx -d api.useevolua.com
```

### 6. Configurar Vercel

1. Acesse https://vercel.com e importe o repositório do frontend
2. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL=https://api.useevolua.com/api`
   - `NEXT_PUBLIC_APP_URL=https://useevolua.com`
3. Adicione o domínio `useevolua.com` no painel do Vercel

---

## Atualizar o backend

```bash
ssh -i evolua-key.pem ubuntu@<IP_EC2>
./deploy.sh
```

---

## O que foi removido (economia)

| Recurso removido | Economia |
|---|---|
| AWS App Runner | ~$5-25/mês |
| CloudWatch Alarms + SNS | ~$1-3/mês |
| CloudWatch Dashboard | ~$3/mês |
| AWS Amplify (frontend) | ~$0-15/mês |
| Elastic IP extra (landing) | $3.65/mês se desassociado |

---

## Histórico de Evolução do Plano Terapêutico

As migrations do banco de dados para esta feature estão em:
```
fono v2 - back/backend-evolua/prisma/migrations/
```

Para aplicar em produção:
```bash
ssh -i evolua-key.pem ubuntu@<IP_EC2>
cd /home/ubuntu/evolua-backend
npx prisma migrate deploy
```
