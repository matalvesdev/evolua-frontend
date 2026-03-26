# ✅ Infraestrutura Evolua CRM - Status Completo

**Data**: 25-26 de março de 2026  
**Hora**: 00:10 UTC

---

## 🎯 O Que Fiz Para Você

### 1️⃣ Infraestrutura AWS (PRONTO)
```
✅ EC2 Instance              i-0fe65fd681f4e7baf (t2.micro free tier)
✅ Public IP                 18.228.183.188
✅ Security Group            sg-02fb2b8c427146e1b (SSH, HTTP, HTTPS aberto)
✅ Elastic IP                eipalloc-0a68d3620256a32b2
✅ Route53 Zone              Z07198801FOI7MV7LJJPN
✅ DNS Records Criados        
   • useevolua.com → 76.76.21.21 (Vercel)
   • api.useevolua.com → 18.228.183.188 (EC2) ✅
   • www.useevolua.com → CNAME (Vercel)
✅ Nginx Rodando             Port 80/443
✅ Certbot Instalado         Pronto para SSL
✅ Firewall Ativado          UFW configured
✅ Auto-renovação Certificado Cron 12h
```

### 2️⃣ Monitor SSL Automático (ATIVADO)
```
✅ Script Criado: /usr/local/bin/setup-ssl-when-dns-ready.sh
✅ Serviço: setup-ssl.service (systemd)
✅ Comportamento: 
   • Monitora DNS a cada 10 segundos
   • Aguarda DNS propagar (máx 10 min)
   • Assim que DNS correto detectado → Executa Certbot
   • Status final: SSL instalado = HTTPS ativado
✅ Registrado: Systemd vai re-executar se EC2 reiniciar
```

### 3️⃣ Acesso SSH Configurado
```
✅ SSH Key: ~/.ssh/evolua-key.pem (400 permissions)
✅ Comando SSH: ssh -i ~/.ssh/evolua-key.pem ubuntu@18.228.183.188
⏳ Temporário: SSH aberto 0.0.0.0/0 (até você fechar)
```

---

## ⏳ O Que Você PRECISA Fazer

### 📋 Checklist Obrigatório (30 min)

#### [1] Atualizar Nameservers no Registrador
**URGENTE**: Sem isso, nada funciona globalmente

```
Seu registrador: ???
Novo nameservers (COPIAR EXATAMENTE):
  ns-1188.awsdns-20.org
  ns-154.awsdns-19.com
  ns-1997.awsdns-57.co.uk
  ns-700.awsdns-23.net
```

**Como:**
- GoDaddy → Domain Settings → Nameservers → Change to Custom
- Namecheap → Domain → Nameserver → Custom
- RegistroBR → DNS → Nameserver
- Outro → Procure por "DNS" ou "Nameserver"

⏱️ Propaga em 5-30 min

---

#### [2] Validar DNS (após 10 min)

Execute na sua máquina:
```bash
nslookup api.useevolua.com

# Esperado:
# Server: 8.8.8.8
# Name:   api.useevolua.com
# Address: 18.228.183.188
```

---

#### [3] Monitorar SSL (automático)

Quando DNS propagar, o monitor no EC2 vai:
1. Detectar DNS correto
2. Executar Certbot automaticamente
3. Instalar SSL Let's Encrypt
4. Testar HTTPS

```bash
# Ver progresso (opcional):
ssh -i ~/.ssh/evolua-key.pem ubuntu@18.228.183.188 \
  "sudo journalctl -u setup-ssl.service -f"
```

Esperado ver:
```
[...] ⏳ Aguardando DNS... (1/60)
[...] ✅ DNS detectado! IP correto.
[...] Configurando SSL com Certbot...
[...] ✅ SSL INSTALADO COM SUCESSO!
```

---

### 🔐 Segurança (FAZER HOJE)

#### [A] Restringir SSH (CRÍTICO)
Atualmente SSH está aberto `0.0.0.0/0` (possível risco)

```bash
# Descobrir seu IP público
curl -s https://checkip.amazonaws.com

# Exemplo: seu IP = 123.45.67.89
# Restringir no AWS Console → EC2 → Security Groups → sg-02fb2b8c427146e1b
# Inbound → SSH (22) → Mudar CIDR para 123.45.67.89/32
```

Ou via CLI:
```bash
MY_IP=$(curl -s https://checkip.amazonaws.com | tr -d '\n') && \
aws ec2 revoke-security-group-ingress \
  --group-id sg-02fb2b8c427146e1b \
  --protocol tcp --port 22 --cidr 0.0.0.0/0 \
  --region sa-east-1 && \
aws ec2 authorize-security-group-ingress \
  --group-id sg-02fb2b8c427146e1b \
  --protocol tcp --port 22 --cidr $MY_IP/32 \
  --region sa-east-1
```

#### [B] Remover terraform.tfvars do Git (CRÍTICO)
```bash
cd ~/Desktop/fono\ v2
git rm --cached terraform/terraform.tfvars
echo "terraform/terraform.tfvars" >> .git/info/exclude
git commit -m "security: remove cached secrets from git"
```

#### [C] Rotacionar Chaves Supabase (RECOMENDADO)
Supabase Dashboard → Settings → API → Regenerate

---

## 📊 Timeline Esperada

```
Agora (00:10):
  ✅ Infrastructure deployed
  ✅ Monitor DNS+SSL ativo

+5 min (00:15):
  ⏳ Atualizar nameservers no registrador

+10 min (00:20):
  ⏳ DNS propagando

+15 min (00:25):
  ⏳ Validar DNS com nslookup

+20 min (00:30):
  ⏳ Monitor detecta DNS → Executa Certbot
  ⏳ SSL sendo instalado

+23 min (00:33):
  ✅ HTTPS ATIVADO!
  ✅ https://api.useevolua.com respondendo

+30 min (00:40):
  ✅ Backend pronto para deploy de código
  ✅ Frontend pode ser configurado
```

---

## 🚀 Deploy Próximo (Backend Code)

Após DNS propagar e SSL ativo, para rodar backend:

```bash
# SSH para EC2
ssh -i ~/.ssh/evolua-key.pem ubuntu@18.228.183.188

# Clonar código
git clone https://github.com/seu-repo/backend-evolua.git /app/backend

# Setup
cd /app/backend
npm ci
npm run build

# Rodar com PM2
npm install -g pm2
pm2 start dist/main.js --name backend --max-memory-restart 400M

# Autostart
pm2 startup
pm2 save
```

---

## 📞 Comandos Úteis

### Ver logs do backend
```bash
ssh -i ~/.ssh/evolua-key.pem ubuntu@18.228.183.188 \
  "pm2 logs backend"
```

### Ver logs SSL
```bash
ssh -i ~/.ssh/evolua-key.pem ubuntu@18.228.183.188 \
  "sudo journalctl -u setup-ssl.service -f"
```

### Reiniciar Nginx
```bash
ssh -i ~/.ssh/evolua-key.pem ubuntu@18.228.183.188 \
  "sudo systemctl restart nginx"
```

### Testar HTTPS (após SSL ativado)
```bash
curl -I https://api.useevolua.com/api/health

# Esperado:
# HTTP/2 200 
# Strict-Transport-Security: max-age=31536000
```

---

## ❓ Troubleshooting

### DNS não propaga após 30 min
1. Verificar nameservers no registrador estão corretos
2. Testar: `dig useevolua.com @ns-1188.awsdns-20.org +short`
3. Limpar cache DNS local: `sudo systemctl restart systemd-resolved`

### SSL não ativa
1. Confirmar DNS resolvendo: `nslookup api.useevolua.com`
2. Ver logs: `sudo journalctl -u setup-ssl.service`
3. Tentar manualmente: `sudo certbot --nginx -d api.useevolua.com`

### SSH não conecta
1. Verificar SG: `aws ec2 describe-security-groups --group-ids sg-02fb2b8c427146e1b`
2. Confirmar seu IP está liberado (ou 0.0.0.0/0 se teste)
3. Teste EC2 status: `aws ec2 describe-instances --instance-ids i-0fe65fd681f4e7baf`

---

## 📋 Verificação Final

```bash
# 1. DNS Global (após propagar)
nslookup api.useevolua.com

# 2. SSL Certificate
curl -I https://api.useevolua.com

# 3. Health Check
curl https://api.useevolua.com/api/health

# 4. EC2 Status
aws ec2 describe-instances --instance-ids i-0fe65fd681f4e7baf \
  --query 'Reservations[0].Instances[0].[State.Name,PublicIpAddress]'
```

---

**Próximo passo**: Atualizar nameservers no registrador → Aguardar 10 min → Pronto! 🚀

Git commit de tudo: Feito ✅
