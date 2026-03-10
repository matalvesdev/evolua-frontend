# Terraform - Evolua CRM Infrastructure

---

## 🚨 ATENÇÃO: ERRO DE AUTENTICAÇÃO DETECTADO

**Se você está vendo erro `AuthFailure: AWS was not able to validate the provided access credentials`:**

➡️ **LEIA PRIMEIRO:** [`CRITICAL-FIX-NOW.md`](CRITICAL-FIX-NOW.md)

**Resumo rápido:**
1. Suas credenciais AWS têm acesso EC2 bloqueado
2. Você precisa criar novas credenciais
3. Siga o guia passo-a-passo (5 minutos)

**Depois de corrigir, execute:**
```powershell
.\verify-fix.ps1
```

---

## 📋 Visão Geral

Este diretório contém a configuração Terraform para provisionar toda a infraestrutura do Evolua CRM na AWS, incluindo:

- ✅ EC2 instance (t2.micro - Free Tier)
- ✅ Elastic IP
- ✅ Security Groups
- ✅ Route53 DNS (useevolua.com e app.evolua.com)
- ✅ CloudWatch Monitoring
- ✅ SNS Alerts
- ✅ Automated setup via user-data

## 🚀 Pré-requisitos

### 1. Instalar Terraform

```bash
# macOS
brew install terraform

# Linux
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# Windows
choco install terraform

# Verificar instalação
terraform version
```

### 2. Configurar AWS CLI

```bash
# Instalar AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configurar credenciais
aws configure
# AWS Access Key ID: [sua access key]
# AWS Secret Access Key: [sua secret key]
# Default region: us-east-1
# Default output format: json

# Verificar
aws sts get-caller-identity
```

### 3. Criar Chave SSH na AWS

```bash
# Via AWS CLI
aws ec2 create-key-pair \
  --key-name evolua-key \
  --query 'KeyMaterial' \
  --output text > evolua-key.pem

chmod 400 evolua-key.pem

# Ou via Console AWS:
# EC2 → Key Pairs → Create Key Pair → Nome: evolua-key
```

### 4. Obter Seu IP Público

```bash
# Linux/macOS
curl https://ifconfig.me

# Ou visite: https://whatismyip.com
# Anote seu IP no formato: 123.456.789.0/32
```

## ⚙️ Configuração

### 1. Copiar Arquivo de Variáveis

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

### 2. Editar terraform.tfvars

```bash
nano terraform.tfvars
```

Preencha com seus valores:

```hcl
# AWS Configuration
aws_region = "us-east-1"
environment = "production"

# Domínios
landing_domain = "useevolua.com"
app_domain     = "app.evolua.com"

# EC2
instance_type = "t2.micro"
key_name      = "evolua-key"
allowed_ssh_cidr = "SEU_IP/32"  # ← Seu IP aqui!

# Supabase
supabase_url      = "https://xxx.supabase.co"
supabase_anon_key = "eyJhbGc..."

# GitHub
github_repo = "https://github.com/seu-usuario/evolua-crm.git"

# Monitoring
alert_email = "seu@email.com"
```

## 🚀 Deploy

### 1. Inicializar Terraform

```bash
terraform init
```

Isso vai:
- Baixar providers necessários (AWS)
- Configurar backend
- Preparar workspace

### 2. Validar Configuração

```bash
terraform validate
```

### 3. Planejar Mudanças

```bash
terraform plan
```

Revise o output. Deve mostrar:
- 1 EC2 instance
- 1 Elastic IP
- 2 Security Groups
- 1 Route53 Hosted Zone
- 4 Route53 Records
- 2 CloudWatch Alarms
- 1 SNS Topic
- 1 CloudWatch Dashboard

### 4. Aplicar Mudanças

```bash
terraform apply
```

Digite `yes` quando solicitado.

⏱️ **Tempo estimado:** 5-10 minutos

### 5. Salvar Outputs

```bash
terraform output > outputs.txt
```

## 📋 Pós-Deploy

### 1. Configurar Name Servers

Copie os name servers do output:

```bash
terraform output route53_nameservers
```

Configure no seu registrador de domínio (ex: Registro.br, GoDaddy):

```
ns-1234.awsdns-12.org
ns-5678.awsdns-34.com
ns-9012.awsdns-56.net
ns-3456.awsdns-78.co.uk
```

⏱️ **Propagação DNS:** 5 minutos a 48 horas (geralmente 1-2 horas)

### 2. Conectar ao Servidor

```bash
# Obter comando SSH
terraform output ssh_command

# Conectar
ssh -i evolua-key.pem ubuntu@SEU_ELASTIC_IP
```

### 3. Aguardar Setup Completar

```bash
# Monitorar progresso
tail -f /var/log/cloud-init-output.log

# Verificar se completou
cat /home/ubuntu/setup-complete.txt
```

⏱️ **Tempo estimado:** 5-10 minutos

### 4. Configurar SSL

```bash
# Para app.evolua.com
sudo certbot --nginx -d app.evolua.com

# Para useevolua.com
sudo certbot --nginx -d useevolua.com -d www.useevolua.com

# Responda as perguntas:
# Email: seu@email.com
# Termos: A (Agree)
# Redirect HTTP to HTTPS: 2 (Yes)
```

### 5. Verificar Aplicação

```bash
# Verificar PM2
pm2 status

# Verificar Nginx
sudo systemctl status nginx

# Testar localmente
curl http://localhost:3000

# Testar externamente
curl https://app.evolua.com
```

### 6. Confirmar Email SNS

Verifique seu email e confirme a inscrição no SNS para receber alertas.

## 📊 Monitoramento

### CloudWatch Dashboard

```bash
# Obter URL do dashboard
terraform output cloudwatch_dashboard_url
```

Ou acesse: AWS Console → CloudWatch → Dashboards → evolua-crm-dashboard

### Logs

```bash
# Logs da aplicação (PM2)
pm2 logs evolua-crm

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs do sistema
sudo journalctl -u nginx -f
```

### Alarmes

Você receberá emails quando:
- CPU > 80% por 10 minutos
- Status check falhar

## 🔄 Atualizações

### Modificar Infraestrutura

1. Edite os arquivos `.tf`
2. Execute:

```bash
terraform plan
terraform apply
```

### Atualizar Aplicação

```bash
# SSH no servidor
ssh -i evolua-key.pem ubuntu@SEU_IP

# Executar deploy
/home/ubuntu/deploy.sh
```

## 🗑️ Destruir Infraestrutura

⚠️ **CUIDADO:** Isso vai deletar TUDO!

```bash
terraform destroy
```

Digite `yes` quando solicitado.

## 📁 Estrutura de Arquivos

```
terraform/
├── main.tf                    # Configuração principal
├── variables.tf               # Definição de variáveis
├── terraform.tfvars          # Valores das variáveis (não commitar!)
├── terraform.tfvars.example  # Exemplo de variáveis
├── vpc.tf                    # VPC e Security Groups
├── ec2.tf                    # Instâncias EC2
├── route53.tf                # DNS
├── cloudwatch.tf             # Monitoramento
├── outputs.tf                # Outputs
├── user-data/
│   └── app-init.sh           # Script de inicialização
└── README.md                 # Este arquivo
```

## 🔒 Segurança

### Arquivos Sensíveis

**NUNCA commite:**
- `terraform.tfvars` (contém secrets)
- `*.tfstate` (contém IPs e IDs)
- `*.tfstate.backup`
- `.terraform/`
- `*.pem` (chaves SSH)

Adicione ao `.gitignore`:

```gitignore
# Terraform
*.tfvars
*.tfstate
*.tfstate.backup
.terraform/
.terraform.lock.hcl

# SSH Keys
*.pem
*.key
```

### Backend Remoto (Recomendado)

Para produção, use S3 backend:

1. Criar bucket S3:

```bash
aws s3 mb s3://evolua-terraform-state --region us-east-1
aws s3api put-bucket-versioning \
  --bucket evolua-terraform-state \
  --versioning-configuration Status=Enabled
```

2. Descomentar em `main.tf`:

```hcl
backend "s3" {
  bucket = "evolua-terraform-state"
  key    = "production/terraform.tfstate"
  region = "us-east-1"
  encrypt = true
}
```

3. Migrar state:

```bash
terraform init -migrate-state
```

## 🐛 Troubleshooting

### Erro: "InvalidKeyPair.NotFound"

```bash
# Verificar se chave existe
aws ec2 describe-key-pairs --key-names evolua-key

# Se não existir, criar
aws ec2 create-key-pair --key-name evolua-key \
  --query 'KeyMaterial' --output text > evolua-key.pem
chmod 400 evolua-key.pem
```

### Erro: "UnauthorizedOperation"

```bash
# Verificar credenciais AWS
aws sts get-caller-identity

# Reconfigurar se necessário
aws configure
```

### Erro: "InvalidParameterValue: Invalid availability zone"

Mude a região em `terraform.tfvars`:

```hcl
aws_region = "us-east-1"  # ou outra região
```

### DNS não propaga

```bash
# Verificar name servers
dig NS useevolua.com

# Verificar A record
dig A app.evolua.com

# Forçar DNS público
dig @8.8.8.8 app.evolua.com
```

### EC2 não responde

```bash
# Verificar status
aws ec2 describe-instance-status --instance-ids i-xxxxx

# Ver logs de inicialização
aws ec2 get-console-output --instance-id i-xxxxx
```

## 📚 Recursos

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Free Tier](https://aws.amazon.com/free/)
- [Route53 Documentation](https://docs.aws.amazon.com/route53/)
- [EC2 User Data](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html)

## 💡 Dicas

1. **Sempre execute `terraform plan` antes de `apply`**
2. **Use workspaces para múltiplos ambientes**
3. **Mantenha state file seguro (use S3 backend)**
4. **Documente mudanças importantes**
5. **Teste em staging antes de produção**

## 🆘 Suporte

Se encontrar problemas:

1. Verifique logs: `/var/log/cloud-init-output.log`
2. Verifique outputs: `terraform output`
3. Verifique AWS Console
4. Consulte documentação Terraform

---

**Última atualização:** 2024-03-09  
**Versão:** 1.0.0
