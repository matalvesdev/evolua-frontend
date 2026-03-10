# Guia Completo de Setup EC2 - Evolua CRM

## Visão Geral

Este guia detalha o processo completo de configuração de uma instância EC2 na AWS para hospedar o Evolua CRM com Next.js 16, incluindo Nginx, PM2, SSL gratuito e deploy automatizado.

## Pré-requisitos

- Conta AWS (free tier disponível)
- Domínio registrado (ex: evolua.com.br)
- Chave SSH gerada
- Git instalado localmente
- AWS CLI instalado (opcional)

## Parte 1: Criar e Configurar EC2

### 1.1 Criar Instância EC2

**Via Console AWS:**

1. Acesse EC2 Dashboard
2. Clique em "Launch Instance"
3. Configure:
   - **Name:** evolua-crm-production
   - **AMI:** Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance type:** t2.micro (Free tier eligible)
   - **Key pair:** Criar nova ou usar existente
   - **Network:** Default VPC
   - **Storage:** 30 GB gp3 (Free tier: 30GB)

4. Configure Security Group:
   - **SSH (22):** Seu IP apenas
   - **HTTP (80):** 0.0.0.0/0
   - **HTTPS (443):** 0.0.0.0/0

5. Launch Instance

### 1.2 Alocar Elastic IP

1. No menu EC2, vá em "Elastic IPs"
2. Clique em "Allocate Elastic IP address"
3. Clique em "Allocate"
4. Selecione o IP alocado
5. Actions → Associate Elastic IP address
6. Selecione sua instância EC2
7. Clique em "Associate"

**Anote o Elastic IP - você vai precisar dele!**

### 1.3 Configurar DNS

No seu provedor de DNS (Cloudflare, Route53, etc):

```
Type: A
Name: app (ou @)
Value: SEU_ELASTIC_IP
TTL: 300 (5 minutos)
Proxy: Desabilitado (se Cloudflare)
```

Aguarde propagação DNS (pode levar até 24h, geralmente 5-10 min).

## Parte 2: Conectar e Configurar Servidor

### 2.1 Conectar via SSH

```bash
# Dar permissão à chave
chmod 400 evolua-key.pem

# Conectar
ssh -i evolua-key.pem ubuntu@SEU_ELASTIC_IP
```

### 2.2 Atualizar Sistema

```bash
sudo apt update
sudo apt upgrade -y
sudo reboot
```

Aguarde 1 minuto e reconecte via SSH.

### 2.3 Instalar Node.js 20 LTS

```bash
# Adicionar repositório NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt-get install -y nodejs

# Verificar instalação
node --version  # Deve mostrar v20.x.x
npm --version   # Deve mostrar 10.x.x
```

### 2.4 Instalar PM2

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Verificar instalação
pm2 --version
```

### 2.5 Instalar Nginx

```bash
# Instalar Nginx
sudo apt-get install -y nginx

# Iniciar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verificar status
sudo systemctl status nginx
```

Teste: Acesse `http://SEU_ELASTIC_IP` no navegador. Deve mostrar a página padrão do Nginx.

### 2.6 Instalar Certbot (SSL Gratuito)

```bash
# Instalar Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Verificar instalação
certbot --version
```

### 2.7 Instalar Git

```bash
sudo apt-get install -y git

# Configurar Git
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

## Parte 3: Deploy da Aplicação

### 3.1 Clonar Repositório

```bash
# Ir para home
cd /home/ubuntu

# Clonar repositório (substitua pela sua URL)
git clone https://github.com/seu-usuario/evolua-crm.git

# Entrar no diretório
cd evolua-crm/frontend-evolua
```

### 3.2 Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env.production
nano .env.production
```

Cole o seguinte conteúdo (substitua pelos seus valores):

```env
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_APP_URL=https://app.evolua.com.br
```

Salve com `Ctrl+O`, Enter, `Ctrl+X`.

### 3.3 Instalar Dependências e Build

```bash
# Instalar dependências (apenas produção)
npm ci --only=production

# Build Next.js
npm run build
```

Aguarde o build completar (pode levar 2-5 minutos).

### 3.4 Configurar PM2

```bash
# Criar arquivo de configuração PM2
nano ecosystem.config.js
```

Cole o seguinte conteúdo:

```javascript
module.exports = {
  apps: [{
    name: 'evolua-crm',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/home/ubuntu/evolua-crm/frontend-evolua',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    error_file: '/home/ubuntu/logs/err.log',
    out_file: '/home/ubuntu/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '800M',
  }]
};
```

Salve e saia.

```bash
# Criar diretório de logs
mkdir -p /home/ubuntu/logs

# Iniciar aplicação com PM2
pm2 start ecosystem.config.js

# Verificar status
pm2 status

# Ver logs
pm2 logs evolua-crm --lines 50

# Salvar configuração PM2
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup
# Copie e execute o comando que aparecer
```

Teste: `curl http://localhost:3000` - Deve retornar HTML do Next.js.

## Parte 4: Configurar Nginx

### 4.1 Criar Configuração do Site

```bash
# Criar arquivo de configuração
sudo nano /etc/nginx/sites-available/evolua-crm
```

Cole o seguinte conteúdo (substitua `app.evolua.com.br` pelo seu domínio):

```nginx
server {
    listen 80;
    server_name app.evolua.com.br;

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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
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

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
}
```

Salve e saia.

### 4.2 Habilitar Site

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/evolua-crm /etc/nginx/sites-enabled/

# Remover site padrão
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Se OK, reiniciar Nginx
sudo systemctl restart nginx
```

Teste: Acesse `http://app.evolua.com.br` no navegador. Deve mostrar sua aplicação!

## Parte 5: Configurar SSL (HTTPS)

### 5.1 Obter Certificado Let's Encrypt

```bash
# Obter certificado (substitua pelo seu domínio)
sudo certbot --nginx -d app.evolua.com.br

# Responda as perguntas:
# Email: seu@email.com
# Termos: A (Agree)
# Compartilhar email: N (No)
# Redirect HTTP to HTTPS: 2 (Yes)
```

O Certbot vai:
1. Obter certificado SSL gratuito
2. Configurar Nginx automaticamente
3. Configurar renovação automática

### 5.2 Verificar SSL

Teste: Acesse `https://app.evolua.com.br` no navegador. Deve mostrar cadeado verde!

### 5.3 Testar Renovação Automática

```bash
# Testar renovação (dry-run)
sudo certbot renew --dry-run
```

Se tudo OK, o certificado será renovado automaticamente a cada 60 dias.

## Parte 6: Configurar Deploy Automático

### 6.1 Criar Script de Deploy

```bash
# Criar script
nano /home/ubuntu/deploy.sh
```

Cole o seguinte conteúdo:

```bash
#!/bin/bash

set -e

echo "🚀 Starting deployment..."

# 1. Pull latest code
cd /home/ubuntu/evolua-crm
echo "📥 Pulling latest code..."
git pull origin main

# 2. Install dependencies
cd frontend-evolua
echo "📦 Installing dependencies..."
npm ci --only=production

# 3. Build Next.js
echo "🔨 Building application..."
npm run build

# 4. Restart PM2
echo "🔄 Restarting application..."
pm2 restart evolua-crm

# 5. Save PM2 configuration
pm2 save

echo "✅ Deployment completed successfully!"
echo "🌐 Application running at: https://app.evolua.com.br"
```

Salve e dê permissão de execução:

```bash
chmod +x /home/ubuntu/deploy.sh
```

### 6.2 Testar Deploy

```bash
# Executar deploy
/home/ubuntu/deploy.sh
```

### 6.3 Configurar GitHub Actions (Opcional)

No seu repositório GitHub, crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to EC2

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: /home/ubuntu/deploy.sh
```

Configure os secrets no GitHub:
- `EC2_HOST`: Seu Elastic IP
- `EC2_SSH_KEY`: Conteúdo da sua chave privada (.pem)

## Parte 7: Monitoramento e Manutenção

### 7.1 Comandos Úteis PM2

```bash
# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs evolua-crm

# Ver logs das últimas 100 linhas
pm2 logs evolua-crm --lines 100

# Reiniciar aplicação
pm2 restart evolua-crm

# Parar aplicação
pm2 stop evolua-crm

# Deletar aplicação do PM2
pm2 delete evolua-crm

# Ver uso de recursos
pm2 monit
```

### 7.2 Comandos Úteis Nginx

```bash
# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

# Ver status
sudo systemctl status nginx

# Ver logs de erro
sudo tail -f /var/log/nginx/error.log

# Ver logs de acesso
sudo tail -f /var/log/nginx/access.log
```

### 7.3 Monitorar Recursos do Servidor

```bash
# Ver uso de CPU e memória
htop

# Ver uso de disco
df -h

# Ver uso de memória
free -h

# Ver processos
ps aux | grep node
```

### 7.4 Backup

```bash
# Criar snapshot do EBS via AWS CLI
aws ec2 create-snapshot \
  --volume-id vol-xxxxxxxxx \
  --description "Backup Evolua CRM $(date +%Y-%m-%d)"

# Ou via Console AWS:
# EC2 → Volumes → Selecionar volume → Actions → Create Snapshot
```

## Troubleshooting

### Problema: Aplicação não inicia

```bash
# Verificar logs do PM2
pm2 logs evolua-crm --lines 100

# Verificar se a porta 3000 está em uso
sudo netstat -tulpn | grep 3000

# Matar processo na porta 3000 (se necessário)
sudo kill -9 $(sudo lsof -t -i:3000)

# Reiniciar aplicação
pm2 restart evolua-crm
```

### Problema: Nginx retorna 502 Bad Gateway

```bash
# Verificar se Next.js está rodando
pm2 status

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/error.log

# Testar conexão local
curl http://localhost:3000

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Problema: SSL não funciona

```bash
# Verificar certificados
sudo certbot certificates

# Renovar manualmente
sudo certbot renew --force-renewal

# Verificar configuração Nginx
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Problema: Memória insuficiente (t2.micro tem apenas 1GB)

```bash
# Verificar uso de memória
free -h

# Adicionar swap temporário (1GB)
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Tornar swap permanente
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Reduzir instâncias PM2 (se necessário)
pm2 scale evolua-crm 1
```

### Problema: Disco cheio

```bash
# Ver uso de disco
df -h

# Limpar logs antigos do PM2
pm2 flush

# Limpar cache do npm
npm cache clean --force

# Limpar logs do sistema
sudo journalctl --vacuum-time=7d
```

## Checklist de Segurança

- [ ] Security Group permite apenas SSH do seu IP
- [ ] Chave SSH tem permissão 400
- [ ] Firewall UFW configurado (opcional)
- [ ] SSL/HTTPS habilitado
- [ ] Variáveis de ambiente não commitadas no Git
- [ ] Backups automáticos configurados
- [ ] Monitoramento de recursos habilitado
- [ ] Logs sendo rotacionados
- [ ] PM2 configurado para restart automático
- [ ] Nginx configurado com timeouts adequados

## Próximos Passos

1. **Configurar CloudWatch** - Monitoramento de métricas
2. **Configurar Alarmes** - Alertas de CPU/memória alta
3. **Implementar CI/CD** - Deploy automático via GitHub Actions
4. **Adicionar CloudFront** - CDN para melhor performance
5. **Configurar Auto Scaling** - Escalar automaticamente com tráfego
6. **Implementar Load Balancer** - Alta disponibilidade

## Recursos Adicionais

- [Documentação AWS EC2](https://docs.aws.amazon.com/ec2/)
- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação PM2](https://pm2.keymetrics.io/docs/)
- [Documentação Nginx](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
