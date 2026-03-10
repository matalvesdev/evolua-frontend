# 🚀 Primeiro Deploy - Guia Passo a Passo

Este guia vai te levar do zero até a aplicação rodando em produção.

**Tempo estimado:** 30-60 minutos (incluindo propagação DNS)

---

## ⚡ Início Rápido (TL;DR)

```bash
# 1. Configurar
cd terraform
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars  # Preencher valores

# 2. Deploy
terraform init
terraform apply

# 3. Configurar DNS (no registrador)
# Copiar name servers do output

# 4. Aguardar e configurar SSL
ssh -i evolua-key.pem ubuntu@<IP>
tail -f /var/log/cloud-init-output.log  # Aguardar
sudo certbot --nginx -d app.evolua.com
sudo certbot --nginx -d useevolua.com -d www.useevolua.com

# 5. Testar
curl https://app.evolua.com
```

---

## 📋 Pré-requisitos Detalhados

### 1. Instalar Ferramentas

#### Terraform

**macOS:**
```bash
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
```

**Linux (Ubuntu/Debian):**
```bash
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform
```

**Windows:**
```powershell
choco install terraform
```

**Verificar:**
```bash
terraform version
# Deve mostrar: Terraform v1.x.x
```

#### AWS CLI

**macOS:**
```bash
brew install awscli
```

**Linux:**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

**Windows:**
```powershell
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi
```

**Verificar:**
```bash
aws --version
# Deve mostrar: aws-cli/2.x.x
```

### 2. Configurar AWS CLI

```bash
aws configure
```

Você precisará fornecer:

```
AWS Access Key ID: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name: us-east-1
Default output format: json
```

**Como obter as credenciais:**

1. Acesse: https://console.aws.amazon.com/iam/
2. Clique em "Users" → Seu usuário
3. Aba "Security credentials"
4. Clique em "Create access key"
5. Escolha "CLI" como use case
6. Copie Access Key ID e Secret Access Key

**Verificar configuração:**
```bash
aws sts get-caller-identity
```

Deve retornar:
```json
{
    "UserId": "AIDAI...",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/seu-usuario"
}
```

### 3. Criar Chave SSH na AWS

**Opção A: Via AWS CLI (Recomendado)**

```bash
# Criar chave
aws ec2 create-key-pair \
  --key-name evolua-key \
  --query 'KeyMaterial' \
  --output text > evolua-key.pem

# Definir permissões corretas
chmod 400 evolua-key.pem

# Verificar
ls -la evolua-key.pem
# Deve mostrar: -r-------- 1 user user 1704 ... evolua-key.pem
```

**Opção B: Via Console AWS**

1. Acesse: https://console.aws.amazon.com/ec2/
2. No menu lateral: "Network & Security" → "Key Pairs"
3. Clique em "Create key pair"
4. Nome: `evolua-key`
5. Tipo: RSA
6. Formato: .pem
7. Clique em "Create key pair"
8. Salve o arquivo `evolua-key.pem`
9. Execute: `chmod 400 evolua-key.pem`

### 4. Obter Seu IP Público

```bash
# Linux/macOS
curl https://ifconfig.me

# Ou
curl https://api.ipify.org

# Windows PowerShell
(Invoke-WebRequest -Uri "https://api.ipify.org").Content
```

Anote o IP no formato: `123.456.789.012/32`

**Importante:** O `/32` no final significa "apenas este IP específico"

### 5. Obter Credenciais do Supabase

1. Acesse: https://app.supabase.com/
2. Selecione seu projeto (ou crie um novo)
3. Vá em "Settings" → "API"
4. Copie:
   - **Project URL:** `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 6. Preparar Repositório GitHub

Certifique-se de que seu código está no GitHub:

```bash
# Se ainda não está no GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/evolua-crm.git
git push -u origin main
```

Anote a URL: `https://github.com/seu-usuario/evolua-crm.git`

---

## 🔧 Configuração

### 1. Navegar para o Diretório Terraform

```bash
cd terraform
```

### 2. Copiar Arquivo de Exemplo

```bash
cp terraform.tfvars.example terraform.tfvars
```

### 3. Editar Configurações

```bash
# Linux/macOS
nano terraform.tfvars

# Ou use seu editor preferido
code terraform.tfvars
vim terraform.tfvars
```

### 4. Preencher Valores

Edite o arquivo `terraform.tfvars` com seus valores:

```hcl
# AWS Configuration
aws_region = "us-east-1"
environment = "production"

# Domínios
landing_domain = "useevolua.com"
app_domain     = "app.evolua.com"

# EC2 Configuration
instance_type = "t2.micro"
key_name      = "evolua-key"
allowed_ssh_cidr = "123.456.789.012/32"  # ← SEU IP AQUI!

# Supabase Configuration
supabase_url      = "https://xxxxxxxxxxxxx.supabase.co"
supabase_anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# GitHub Repository
github_repo = "https://github.com/seu-usuario/evolua-crm.git"

# Monitoring
alert_email = "seu@email.com"
```

**Checklist de valores:**
- [ ] `allowed_ssh_cidr` - Seu IP público + `/32`
- [ ] `supabase_url` - URL do projeto Supabase
- [ ] `supabase_anon_key` - Chave anônima do Supabase
- [ ] `github_repo` - URL do seu repositório
- [ ] `alert_email` - Seu email para alertas
- [ ] `key_name` - Nome da chave SSH (evolua-key)

### 5. Salvar e Fechar

```bash
# No nano: Ctrl+X, depois Y, depois Enter
# No vim: Esc, depois :wq, depois Enter
```

---

## 🚀 Deploy da Infraestrutura

### 1. Inicializar Terraform

```bash
terraform init
```

**O que acontece:**
- Download do provider AWS
- Configuração do backend
- Preparação do workspace

**Output esperado:**
```
Initializing the backend...
Initializing provider plugins...
- Finding hashicorp/aws versions matching "~> 5.0"...
- Installing hashicorp/aws v5.x.x...
Terraform has been successfully initialized!
```

### 2. Validar Configuração

```bash
terraform validate
```

**Output esperado:**
```
Success! The configuration is valid.
```

**Se houver erro:**
- Verifique sintaxe do `terraform.tfvars`
- Verifique se todos os valores estão preenchidos
- Verifique se as aspas estão corretas

### 3. Planejar Mudanças

```bash
terraform plan
```

**O que acontece:**
- Terraform analisa a configuração
- Compara com o estado atual (vazio)
- Mostra o que será criado

**Output esperado:**
```
Plan: 13 to add, 0 to change, 0 to destroy.
```

**Recursos que serão criados:**
- 1 EC2 instance (t2.micro)
- 1 Elastic IP
- 2 Security Groups
- 1 Route53 Hosted Zone
- 4 Route53 Records
- 2 CloudWatch Alarms
- 1 SNS Topic
- 1 SNS Subscription
- 1 CloudWatch Dashboard

**Revise cuidadosamente!**

### 4. Aplicar Mudanças

```bash
terraform apply
```

**O que acontece:**
- Terraform mostra o plano novamente
- Pede confirmação
- Cria todos os recursos

**Você verá:**
```
Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value:
```

**Digite:** `yes` e pressione Enter

**Tempo estimado:** 5-10 minutos

**Output esperado:**
```
Apply complete! Resources: 13 added, 0 changed, 0 destroyed.

Outputs:

app_domain = "app.evolua.com"
app_instance_id = "i-0123456789abcdef0"
app_public_ip = "54.123.45.67"
...
```

### 5. Salvar Outputs

```bash
terraform output > outputs.txt
cat outputs.txt
```

**Importante:** Guarde este arquivo! Contém informações essenciais.

---

## 🌐 Configurar DNS

### 1. Obter Name Servers

```bash
terraform output route53_nameservers
```

**Output:**
```
[
  "ns-1234.awsdns-12.org",
  "ns-5678.awsdns-34.com",
  "ns-9012.awsdns-56.net",
  "ns-3456.awsdns-78.co.uk",
]
```

### 2. Configurar no Registrador de Domínio

#### Registro.br

1. Acesse: https://registro.br/
2. Login com seu CPF/CNPJ
3. Clique no domínio `useevolua.com`
4. Vá em "DNS" → "Alterar Servidores DNS"
5. Selecione "Usar servidores DNS externos"
6. Cole os 4 name servers (um por linha)
7. Clique em "Salvar"

#### GoDaddy

1. Acesse: https://www.godaddy.com/
2. Login na sua conta
3. "My Products" → Domínios
4. Clique em "DNS" ao lado do domínio
5. Role até "Nameservers"
6. Clique em "Change"
7. Selecione "Custom"
8. Cole os 4 name servers
9. Clique em "Save"

#### Cloudflare (se estiver usando)

**Atenção:** Se usar Cloudflare, você precisa:
1. Desabilitar o proxy (nuvem laranja → cinza)
2. Ou configurar os A records manualmente

### 3. Verificar Propagação

```bash
# Verificar name servers
dig NS useevolua.com

# Verificar A record
dig A app.evolua.com

# Forçar DNS público do Google
dig @8.8.8.8 app.evolua.com
```

**Tempo de propagação:**
- Mínimo: 5 minutos
- Típico: 1-2 horas
- Máximo: 48 horas

**Enquanto aguarda, continue com os próximos passos!**

---

## 🖥️ Configurar Servidor

### 1. Obter IP Público

```bash
terraform output app_public_ip
```

Anote o IP: `54.123.45.67`

### 2. Conectar via SSH

```bash
ssh -i evolua-key.pem ubuntu@54.123.45.67
```

**Se houver erro "Permission denied":**
```bash
chmod 400 evolua-key.pem
ssh -i evolua-key.pem ubuntu@54.123.45.67
```

**Se houver erro "Connection refused":**
- Aguarde 1-2 minutos (instância ainda está iniciando)
- Verifique se o IP está correto
- Verifique se `allowed_ssh_cidr` está correto

**Primeira conexão:**
```
The authenticity of host '54.123.45.67' can't be established.
ECDSA key fingerprint is SHA256:...
Are you sure you want to continue connecting (yes/no)?
```

Digite: `yes`

### 3. Monitorar Setup Automático

```bash
tail -f /var/log/cloud-init-output.log
```

**O que está acontecendo:**
- Instalação do Node.js 20
- Instalação do PM2
- Instalação do Nginx
- Instalação do Certbot
- Clone do repositório
- Instalação de dependências
- Build da aplicação Next.js
- Configuração do PM2
- Configuração do Nginx
- Configuração do firewall
- Configuração do swap

**Tempo estimado:** 10-15 minutos

**Você verá:**
```
📦 Atualizando sistema...
📦 Instalando dependências básicas...
📦 Instalando Node.js 20...
📦 Instalando PM2...
📦 Instalando Nginx...
📦 Instalando Certbot...
📁 Criando estrutura de diretórios...
📥 Clonando repositório...
⚙️  Configurando variáveis de ambiente...
📦 Instalando dependências do projeto...
🔨 Building aplicação Next.js...
⚙️  Configurando PM2...
🚀 Iniciando aplicação...
⚙️  Configurando Nginx...
📝 Criando script de deploy...
🔒 Configurando firewall...
💾 Configurando swap...
⚡ Aplicando otimizações...
✅ Setup Inicial Completo!
```

**Quando ver "✅ Setup Inicial Completo!":**
- Pressione `Ctrl+C` para sair do tail
- Continue para o próximo passo

### 4. Verificar Status

```bash
# Verificar PM2
pm2 status

# Deve mostrar:
# ┌─────┬──────────────┬─────────┬─────────┬─────────┐
# │ id  │ name         │ status  │ restart │ uptime  │
# ├─────┼──────────────┼─────────┼─────────┼─────────┤
# │ 0   │ evolua-crm   │ online  │ 0       │ 5m      │
# └─────┴──────────────┴─────────┴─────────┴─────────┘

# Verificar Nginx
sudo systemctl status nginx

# Deve mostrar:
# ● nginx.service - A high performance web server
#    Active: active (running)

# Testar aplicação localmente
curl http://localhost:3000

# Deve retornar HTML da aplicação
```

**Se PM2 não estiver online:**
```bash
pm2 logs evolua-crm --lines 50
# Verificar erros nos logs
```

**Se Nginx não estiver rodando:**
```bash
sudo systemctl start nginx
sudo systemctl status nginx
```

---

## 🔒 Configurar SSL

**Importante:** Aguarde o DNS propagar antes deste passo!

### 1. Verificar DNS

```bash
# Sair do servidor (se ainda estiver conectado)
exit

# No seu computador local
dig A app.evolua.com

# Deve retornar o IP do seu EC2
# Se não retornar, aguarde mais tempo
```

### 2. Conectar ao Servidor Novamente

```bash
ssh -i evolua-key.pem ubuntu@<IP>
```

### 3. Configurar SSL para app.evolua.com

```bash
sudo certbot --nginx -d app.evolua.com
```

**Perguntas do Certbot:**

```
Enter email address (used for urgent renewal and security notices):
```
Digite: `seu@email.com`

```
Please read the Terms of Service at https://letsencrypt.org/documents/LE-SA-v1.3-September-21-2022.pdf
(A)gree/(C)ancel:
```
Digite: `A`

```
Would you be willing to share your email address with the Electronic Frontier Foundation?
(Y)es/(N)o:
```
Digite: `N` (ou `Y` se quiser)

```
Please choose whether or not to redirect HTTP traffic to HTTPS:
1: No redirect
2: Redirect
Select the appropriate number [1-2]:
```
Digite: `2` (Redirect)

**Output esperado:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/app.evolua.com/fullchain.pem
Key is saved at: /etc/letsencrypt/live/app.evolua.com/privkey.pem
Congratulations! You have successfully enabled HTTPS on https://app.evolua.com
```

### 4. Configurar SSL para useevolua.com

```bash
sudo certbot --nginx -d useevolua.com -d www.useevolua.com
```

Responda as mesmas perguntas (email já estará preenchido).

**Output esperado:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/useevolua.com/fullchain.pem
Congratulations! You have successfully enabled HTTPS on https://useevolua.com and https://www.useevolua.com
```

### 5. Verificar Renovação Automática

```bash
sudo systemctl status certbot.timer

# Deve mostrar:
# ● certbot.timer - Run certbot twice daily
#    Active: active (waiting)

# Testar renovação (dry-run)
sudo certbot renew --dry-run

# Deve mostrar:
# Congratulations, all simulated renewals succeeded
```

---

## ✅ Verificar Aplicação

### 1. Testar Localmente (no servidor)

```bash
curl http://localhost:3000
# Deve retornar HTML

curl https://app.evolua.com
# Deve retornar HTML
```

### 2. Sair do Servidor

```bash
exit
```

### 3. Testar Externamente (no seu computador)

```bash
# Testar app
curl https://app.evolua.com

# Testar landing
curl https://useevolua.com

# Verificar redirect HTTP → HTTPS
curl -I http://app.evolua.com
# Deve retornar: HTTP/1.1 301 Moved Permanently
# Location: https://app.evolua.com/
```

### 4. Testar no Navegador

Abra no navegador:
- https://app.evolua.com
- https://useevolua.com
- https://www.useevolua.com

**Verifique:**
- [ ] Página carrega corretamente
- [ ] Cadeado verde (SSL válido)
- [ ] Sem erros no console
- [ ] Imagens carregam
- [ ] Links funcionam

### 5. Verificar SSL

Acesse: https://www.ssllabs.com/ssltest/

Digite: `app.evolua.com`

**Resultado esperado:** A ou A+

---

## 📊 Configurar Monitoramento

### 1. Confirmar Inscrição SNS

1. Verifique seu email (`alert_email` do terraform.tfvars)
2. Procure por email da AWS SNS
3. Assunto: "AWS Notification - Subscription Confirmation"
4. Clique no link "Confirm subscription"

**Se não recebeu:**
```bash
# Reenviar confirmação
aws sns subscribe \
  --topic-arn $(terraform output -raw sns_topic_arn) \
  --protocol email \
  --notification-endpoint seu@email.com
```

### 2. Acessar CloudWatch Dashboard

```bash
terraform output cloudwatch_dashboard_url
```

Copie a URL e abra no navegador.

**Você verá:**
- CPU Utilization
- Network In/Out
- Status Checks

### 3. Verificar Alarmes

No CloudWatch:
1. Menu lateral: "Alarms" → "All alarms"
2. Você deve ver 2 alarmes:
   - `evolua-crm-high-cpu`
   - `evolua-crm-status-check-failed`
3. Status deve ser: "OK" (verde)

---

## 🎉 Deploy Completo!

Parabéns! Sua aplicação está rodando em produção! 🚀

### Resumo do que foi criado:

✅ **Infraestrutura AWS**
- EC2 instance (t2.micro)
- Elastic IP
- Security Groups
- Route53 DNS

✅ **Aplicação**
- Next.js rodando com PM2
- Nginx como reverse proxy
- SSL configurado (Let's Encrypt)

✅ **Monitoramento**
- CloudWatch Dashboard
- CloudWatch Alarms
- SNS Notifications

✅ **Segurança**
- HTTPS obrigatório
- SSH restrito ao seu IP
- Firewall configurado

### URLs da sua aplicação:

- **App:** https://app.evolua.com
- **Landing:** https://useevolua.com
- **Dashboard:** [CloudWatch URL]

### Custos:

- **Primeiros 12 meses:** ~$0.50/mês (apenas Route53)
- **Após 12 meses:** ~$12-17/mês

---

## 📝 Próximos Passos

### Imediato

1. **Testar todas as funcionalidades**
   - Login/Logout
   - CRUD de pacientes
   - Upload de arquivos
   - Todas as páginas

2. **Configurar GitHub Actions** (opcional)
   - Deploy automático no push
   - Ver: `.github/workflows/deploy.yml`

3. **Configurar backups** (recomendado)
   - EBS snapshots automáticos
   - Backup do banco Supabase

### Curto Prazo

1. **Monitorar performance**
   - Verificar CloudWatch diariamente
   - Ajustar recursos se necessário

2. **Otimizar custos**
   - Revisar uso de recursos
   - Considerar Reserved Instances após 12 meses

3. **Implementar staging**
   - Ambiente de testes
   - Duplicar infraestrutura

### Longo Prazo

1. **Escalar se necessário**
   - Upgrade para t3.small
   - Adicionar Load Balancer
   - Implementar Auto Scaling

2. **Adicionar CDN**
   - CloudFront para assets
   - Melhorar performance global

3. **Disaster Recovery**
   - Plano de recuperação
   - Backups cross-region

---

## 🆘 Problemas Comuns

### DNS não propaga

**Sintoma:** `dig app.evolua.com` não retorna o IP

**Solução:**
1. Verificar name servers configurados no registrador
2. Aguardar mais tempo (até 48h)
3. Testar com DNS público: `dig @8.8.8.8 app.evolua.com`

### Não consigo conectar via SSH

**Sintoma:** `Connection refused` ou `Permission denied`

**Solução:**
```bash
# Verificar permissões da chave
chmod 400 evolua-key.pem

# Verificar IP público
terraform output app_public_ip

# Verificar seu IP não mudou
curl https://ifconfig.me

# Se mudou, atualizar terraform.tfvars e aplicar
terraform apply
```

### Certbot falha

**Sintoma:** `Failed to obtain certificate`

**Solução:**
1. Verificar DNS propagou: `dig A app.evolua.com`
2. Verificar porta 80 aberta: `sudo netstat -tulpn | grep :80`
3. Verificar Nginx rodando: `sudo systemctl status nginx`
4. Tentar novamente após DNS propagar

### Aplicação não responde

**Sintoma:** `curl https://app.evolua.com` retorna erro

**Solução:**
```bash
# Conectar ao servidor
ssh -i evolua-key.pem ubuntu@<IP>

# Verificar PM2
pm2 status
pm2 logs evolua-crm

# Verificar Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log

# Reiniciar se necessário
pm2 restart evolua-crm
sudo systemctl restart nginx
```

### Memória insuficiente

**Sintoma:** PM2 reiniciando constantemente

**Solução:**
```bash
# Verificar memória
free -h

# Swap já está configurado (2GB)
# Se ainda insuficiente, considerar upgrade para t3.small
```

---

## 📚 Documentação Adicional

- **README.md** - Documentação completa
- **QUICKSTART.md** - Guia rápido
- **DEPLOY-CHECKLIST.md** - Checklist detalhado
- **IMPLEMENTATION-SUMMARY.md** - Resumo da implementação

---

## 🎓 Comandos Úteis

```bash
# Conectar ao servidor
ssh -i evolua-key.pem ubuntu@$(terraform output -raw app_public_ip)

# Ver logs da aplicação
ssh -i evolua-key.pem ubuntu@<IP> "pm2 logs evolua-crm --lines 100"

# Fazer deploy de nova versão
ssh -i evolua-key.pem ubuntu@<IP> "/home/ubuntu/deploy.sh"

# Ver status dos serviços
ssh -i evolua-key.pem ubuntu@<IP> "pm2 status && sudo systemctl status nginx"

# Ver outputs do Terraform
terraform output

# Destruir tudo (CUIDADO!)
terraform destroy
```

---

**Implementado com sucesso!** 🎉

Se tiver problemas, consulte:
1. Este guia
2. `terraform/README.md`
3. Logs do servidor: `/var/log/cloud-init-output.log`
4. CloudWatch Dashboard

**Boa sorte com seu projeto!** 🚀
