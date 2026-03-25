# Setup Completo - Credenciais e Deploy

## Passo 1: Criar credenciais AWS no IAM

1. Acesse: https://console.aws.amazon.com/iam/
2. Menu lateral → **Users** → clique no seu usuário
3. Aba **Security credentials**
4. Seção **Access keys** → **Create access key**
5. Selecione **Command Line Interface (CLI)**
6. Copie o **Access Key ID** e **Secret Access Key**

---

## Passo 2: Sincronizar o relógio do Windows (necessário para AWS CLI)

Abra o **PowerShell como Administrador** e execute:

```powershell
net stop w32tm
w32tm /unregister
w32tm /register
net start w32tm
w32tm /resync /force
w32tm /query /status
```

O campo "Indicador de Salto" deve mostrar `0(sem aviso)`.

---

## Passo 3: Configurar AWS CLI

No terminal (qualquer pasta):

```bash
aws configure
```

Preencha:
- AWS Access Key ID: `<sua nova access key>`
- AWS Secret Access Key: `<sua nova secret key>`
- Default region name: `sa-east-1`
- Default output format: `json`

Teste:
```bash
aws sts get-caller-identity
```

Deve retornar seu Account ID sem erros.

---

## Passo 4: Criar chave SSH para o EC2

```bash
aws ec2 create-key-pair \
  --key-name evolua-key \
  --region sa-east-1 \
  --query 'KeyMaterial' \
  --output text > terraform/evolua-key.pem

chmod 400 terraform/evolua-key.pem
```

No Windows (PowerShell):
```powershell
aws ec2 create-key-pair `
  --key-name evolua-key `
  --region sa-east-1 `
  --query 'KeyMaterial' `
  --output text | Out-File -FilePath terraform/evolua-key.pem -Encoding ascii
```

---

## Passo 5: Preencher variáveis sensíveis

Edite `terraform/terraform.tfvars` e preencha os campos vazios:

### supabase_service_role_key
- Acesse: https://supabase.com/dashboard/project/diiaoaboykraaiavgdqs/settings/api
- Copie o valor de **service_role** (secret)

### database_url
- Acesse: https://supabase.com/dashboard/project/diiaoaboykraaiavgdqs/settings/database
- Seção **Connection string** → aba **URI** → selecione **Transaction pooler** (porta 6543)
- Formato: `postgresql://postgres.xxx:SENHA@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`

### allowed_ssh_cidr
- Descubra seu IP atual: https://meuip.com.br
- Coloque no formato: `SEU_IP/32`

---

## Passo 6: Verificar se a chave SSH já existe na AWS

```bash
aws ec2 describe-key-pairs --key-names evolua-key --region sa-east-1 2>&1
```

Se retornar erro "does not exist", a chave foi criada no Passo 4.
Se já existir, use a chave `.pem` que você já tem.

---

## Passo 7: Executar o Terraform

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

O `apply` vai criar:
- EC2 t2.micro (backend NestJS)
- Elastic IP
- Security Group
- Route53 Hosted Zone + DNS records

---

## Passo 8: Configurar nameservers do domínio

Após o `terraform apply`, copie os nameservers do output `route53_nameservers`.

Acesse o painel onde o domínio `useevolua.com` foi registrado (GoDaddy, Registro.br, etc.)
e configure os 4 nameservers da AWS.

Exemplo de nameservers (os seus serão diferentes):
```
ns-123.awsdns-45.com
ns-678.awsdns-90.net
ns-111.awsdns-22.org
ns-444.awsdns-55.co.uk
```

---

## Passo 9: Configurar SSL no backend

Após o DNS propagar (~5-30 minutos):

```bash
ssh -i terraform/evolua-key.pem ubuntu@<IP_DO_OUTPUT>
sudo certbot --nginx -d api.useevolua.com --non-interactive --agree-tos -m seu@email.com
```

---

## Passo 10: Configurar Vercel (frontend)

1. Acesse https://vercel.com e faça login
2. **Add New Project** → importe o repositório do frontend
3. Configure as variáveis de ambiente:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://diiaoaboykraaiavgdqs.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
   NEXT_PUBLIC_API_URL=https://api.useevolua.com/api
   NEXT_PUBLIC_APP_URL=https://useevolua.com
   ```
4. Após o deploy, vá em **Settings → Domains**
5. Adicione `useevolua.com` e `www.useevolua.com`
6. O DNS já está configurado no Route53 apontando para o Vercel

---

## Resumo dos custos após o setup

| Recurso | Custo |
|---|---|
| EC2 t2.micro (free tier 12 meses) | $0 |
| Elastic IP (associado ao EC2) | $0 |
| Route53 Hosted Zone | $0.50/mês |
| Vercel (free tier) | $0 |
| Supabase (free tier) | $0 |
| **Total** | **$0.50/mês** |
