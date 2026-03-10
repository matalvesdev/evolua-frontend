# 🚀 Quickstart - Deploy Evolua CRM com Terraform

## ⚡ Setup Rápido (5 minutos)

### 1. Pré-requisitos

```bash
# Instalar Terraform
brew install terraform  # macOS
# ou
sudo apt install terraform  # Linux

# Instalar AWS CLI
brew install awscli  # macOS
# ou
sudo apt install awscli  # Linux

# Configurar AWS
aws configure
```

### 2. Criar Chave SSH

```bash
# Via AWS CLI
aws ec2 create-key-pair \
  --key-name evolua-key \
  --query 'KeyMaterial' \
  --output text > evolua-key.pem

chmod 400 evolua-key.pem
```

### 3. Configurar Variáveis

```bash
cd terraform

# Copiar exemplo
cp terraform.tfvars.example terraform.tfvars

# Editar (substitua pelos seus valores)
nano terraform.tfvars
```

**Valores necessários:**
- `allowed_ssh_cidr`: Seu IP (obtenha em https://ifconfig.me)
- `supabase_url`: URL do seu projeto Supabase
- `supabase_anon_key`: Chave anônima do Supabase
- `github_repo`: URL do seu repositório
- `alert_email`: Seu email para alertas

### 4. Deploy!

```bash
# Usando Makefile (recomendado)
make setup    # Inicializar
make plan     # Ver o que será criado
make apply    # Criar infraestrutura

# Ou manualmente
terraform init
terraform plan
terraform apply
```

⏱️ **Tempo:** ~5 minutos

### 5. Configurar DNS

```bash
# Obter name servers
make output | grep route53_nameservers

# Configure no seu registrador de domínio:
# - useevolua.com
# - evolua.com (se tiver)
```

⏱️ **Propagação:** 1-48 horas (geralmente 1-2h)

### 6. Aguardar Setup

```bash
# Conectar ao servidor
make ssh

# Monitorar progresso
tail -f /var/log/cloud-init-output.log

# Aguardar mensagem: "✅ Setup Inicial Completo!"
```

⏱️ **Tempo:** ~10 minutos

### 7. Configurar SSL

```bash
# Ainda conectado via SSH
sudo certbot --nginx -d app.evolua.com
sudo certbot --nginx -d useevolua.com -d www.useevolua.com

# Responda:
# Email: seu@email.com
# Termos: A
# Redirect: 2
```

### 8. Testar!

```bash
# Verificar aplicação
curl https://app.evolua.com
curl https://useevolua.com

# Ou abra no navegador:
# https://app.evolua.com
# https://useevolua.com
```

## ✅ Pronto!

Sua infraestrutura está rodando! 🎉

## 📋 Comandos Úteis

```bash
# Ver informações
make info

# Conectar via SSH
make ssh

# Ver logs
make logs

# Ver status
make status

# Fazer deploy
make deploy

# Destruir tudo
make destroy
```

## 🐛 Problemas Comuns

### DNS não resolve

```bash
# Verificar propagação
dig app.evolua.com

# Aguardar mais tempo (pode levar até 48h)
```

### Não consigo conectar via SSH

```bash
# Verificar IP
make output | grep app_public_ip

# Verificar chave
ls -la evolua-key.pem

# Verificar permissões
chmod 400 evolua-key.pem

# Verificar Security Group
# Seu IP mudou? Atualize allowed_ssh_cidr em terraform.tfvars
```

### Aplicação não responde

```bash
# Conectar ao servidor
make ssh

# Verificar PM2
pm2 status
pm2 logs evolua-crm

# Verificar Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log

# Reiniciar
pm2 restart evolua-crm
sudo systemctl restart nginx
```

## 💰 Custos

### Primeiros 12 meses
- **Total: ~$0.50/mês** (apenas Route53)

### Após 12 meses
- EC2 t2.micro: $8.50/mês
- EBS 30GB: $2.40/mês
- Route53: $0.50/mês
- Data Transfer: $1-5/mês
- **Total: ~$13-17/mês**

## 🔄 Próximos Passos

1. ✅ Configurar GitHub Actions para deploy automático
2. ✅ Adicionar CloudFront CDN (opcional)
3. ✅ Configurar backups automáticos
4. ✅ Adicionar monitoring avançado
5. ✅ Implementar staging environment

## 📚 Documentação Completa

Ver [README.md](./README.md) para documentação detalhada.

## 🆘 Ajuda

Problemas? Verifique:
1. [README.md](./README.md) - Documentação completa
2. [Troubleshooting](./README.md#-troubleshooting)
3. Logs: `/var/log/cloud-init-output.log`

---

**Tempo total:** ~20-30 minutos (incluindo propagação DNS)
