# 📌 Dados Críticos - Referência Rápida

**Gerado**: 26 de março de 2026  
**Status**: Terraform Aplicado ✅ | Próximas Ações: Manual

---

## 🖥️ EC2 Backend

```
Instance ID:        i-0fe65fd681f4e7baf
Instance Type:      t2.micro
Region:             sa-east-1
Public IP (Elastic): 18.228.183.188
SSH User:           ubuntu
SSH Key:            evolua-key.pem

SSH Command:
ssh -i evolua-key.pem ubuntu@18.228.183.188
```

---

## 🌐 Domínios

### Frontend (Vercel)
```
• useevolua.com.br
• www.useevolua.com.br
• useevolua.online
• www.useevolua.online

Vercel IP: 76.76.21.21
```

### Backend (EC2)
```
• api.useevolua.com.br → 18.228.183.188
• api.useevolua.online → 18.228.183.188
```

---

## 🔗 DNS Nameservers

### Route53 Zone (.com.br)
```
Zone ID:    Z0228083BM36IMHQRK40
Nameservers:
  1. ns-1205.awsdns-22.org
  2. ns-1892.awsdns-44.co.uk
  3. ns-390.awsdns-48.com
  4. ns-850.awsdns-42.net
```

**Configure no registrador de `useevolua.com.br`**

### Route53 Zone (.online)
```
Zone ID:    Z03966232HNFZ2ERFGJM1
Nameservers:
  1. ns-1227.awsdns-25.org
  2. ns-1555.awsdns-02.co.uk
  3. ns-453.awsdns-56.com
  4. ns-938.awsdns-53.net
```

**Configure no registrador de `useevolua.online`**

---

## 🔐 Banco de Dados (Supabase)

```
Project URL:              https://diiaoaboykraaiavgdqs.supabase.co
Anon Key:                 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpaWFvYWJveWtyYWFpYXZnZHFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NDA0NDksImV4cCI6MjA4MzExNjQ0OX0.SKttNSYTTB-kiTnGGuILyYW_dqeu1HJ9dHLm27XxXVI
Service Role Key:         eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpaWFvYWJveWtyYWFpYXZnZHFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU0MDQ0OSwiZXhwIjoyMDgzMTE2NDQ5fQ._AzUxcmPYFbasN3i9lkWUr20k2637_ICYmJc9rdO6wc
Database URL (Connection): postgresql://postgres.diiaoaboykraaiavgdqs:Fm13102330041994!@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

## 💻 Vercel Frontend

```
Project URL:              https://vercel.com/dashboard
Domains a configurar:     useevolua.com.br, www.useevolua.com.br
                          useevolua.online, www.useevolua.online

Environment Variables (adicionar):
  NEXT_PUBLIC_SUPABASE_URL=https://diiaoaboykraaiavgdqs.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
  NEXT_PUBLIC_API_URL=https://api.useevolua.com.br/api
  NEXT_PUBLIC_APP_URL=https://useevolua.com.br
```

---

## 🔑 AWS Credentials

```
Region:       sa-east-1
Terraform:    ~/terraform/terraform.tfvars
Key Pair:     evolua-key.pem (guarde em local seguro)
Security Group: evolua-crm-backend-sg
```

---

## 🔍 URLs de Teste

```
Frontend:
  https://useevolua.com.br
  https://useevolua.online
  https://api.useevolua.com.br/api/health
  https://api.useevolua.online/api/health

DNS Check:
  nslookup useevolua.com.br
  nslookup api.useevolua.com.br
  nslookup useevolua.online
  nslookup api.useevolua.online
```

---

## 📂 Arquivo Local

```
Pasta raiz:           c:\Users\Mateus Alves Bassane\Desktop\fono v2
Terraform:            terraform/
Scripts:              scripts/
  - check-new-domains.sh
  - infrastructure-check.sh
Documentação:         NEXT-ACTIONS-GUIDE.md
```

---

## ✅ Checklist Rápido Before You Start

```
[ ] Tenho SSH key (evolua-key.pem)?
[ ] Acesso ao registrador (GoDaddy/Namecheap)?
[ ] Acesso ao Vercel dashboard?
[ ] Acesso ao Supabase console?
[ ] Acesso ao AWS Console?
[ ] Terminal com internet (para SSH)?
```

---

## 🚨 Important: GUARDE ISSO!

Se perder as informações acima:

```bash
# Recuperar do Terraform
cd terraform
terraform output

# Ou do estado
terraform state show aws_instance.backend
terraform state show aws_eip.backend
terraform state show aws_route53_zone.main_br
terraform state show aws_route53_zone.main_online
```

---

**Última atualização**: 26/03/2026 23:45 UTC  
**Próxima ação**: Abra [NEXT-ACTIONS-GUIDE.md](NEXT-ACTIONS-GUIDE.md) e comece pela AÇÃO 1

