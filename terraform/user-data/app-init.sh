#!/bin/bash
# User Data Script - Evolua CRM Application Setup
# Este script é executado automaticamente na primeira inicialização do EC2

set -e

# Variáveis (injetadas pelo Terraform)
SUPABASE_URL="${supabase_url}"
SUPABASE_ANON_KEY="${supabase_anon_key}"
APP_DOMAIN="${app_domain}"
GITHUB_REPO="${github_repo}"

# Log tudo
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "========================================="
echo "Evolua CRM - Setup Inicial"
echo "========================================="
echo "Iniciado em: $(date)"
echo ""

# Atualizar sistema
echo "📦 Atualizando sistema..."
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

# Instalar dependências básicas
echo "📦 Instalando dependências básicas..."
apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Instalar Node.js 20 LTS
echo "📦 Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verificar instalação
node --version
npm --version

# Instalar PM2 globalmente
echo "📦 Instalando PM2..."
npm install -g pm2

# Instalar Nginx
echo "📦 Instalando Nginx..."
apt-get install -y nginx

# Instalar Certbot para SSL
echo "📦 Instalando Certbot..."
apt-get install -y certbot python3-certbot-nginx

# Criar diretórios
echo "📁 Criando estrutura de diretórios..."
mkdir -p /home/ubuntu/evolua-crm
mkdir -p /home/ubuntu/logs
chown -R ubuntu:ubuntu /home/ubuntu

# Clonar repositório (como usuário ubuntu)
echo "📥 Clonando repositório do frontend..."
su - ubuntu -c "cd /home/ubuntu && git clone $GITHUB_REPO evolua-crm"

# Nota: O backend está em repositório separado
# Backend: https://github.com/matalvesdev/evolua-backend.git
# Frontend: https://github.com/matalvesdev/evolua-frontend.git

# Criar arquivo .env.production
echo "⚙️  Configurando variáveis de ambiente..."
cat > /home/ubuntu/evolua-crm/.env.production << EOF
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL=https://$APP_DOMAIN
NEXT_PUBLIC_API_URL=https://ms6r3rm76k.us-east-1.awsapprunner.com/api
EOF

chown ubuntu:ubuntu /home/ubuntu/evolua-crm/.env.production

# Instalar dependências e build (como usuário ubuntu)
echo "📦 Instalando dependências do projeto..."
su - ubuntu -c "cd /home/ubuntu/evolua-crm && npm ci --only=production"

echo "🔨 Building aplicação Next.js..."
su - ubuntu -c "cd /home/ubuntu/evolua-crm && npm run build"

# Criar ecosystem.config.js para PM2
echo "⚙️  Configurando PM2..."
cat > /home/ubuntu/evolua-crm/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'evolua-crm',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/home/ubuntu/evolua-crm',
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
EOF

chown ubuntu:ubuntu /home/ubuntu/evolua-crm/ecosystem.config.js

# Iniciar aplicação com PM2
echo "🚀 Iniciando aplicação..."
su - ubuntu -c "cd /home/ubuntu/evolua-crm && pm2 start ecosystem.config.js"
su - ubuntu -c "pm2 save"

# Configurar PM2 para iniciar no boot
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Configurar Nginx
echo "⚙️  Configurando Nginx..."
cat > /etc/nginx/sites-available/evolua-crm << 'NGINXCONF'
server {
    listen 80;
    server_name APP_DOMAIN_PLACEHOLDER;

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
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }

    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        proxy_pass http://localhost:3000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
}
NGINXCONF

# Substituir placeholder pelo domínio real
sed -i "s/APP_DOMAIN_PLACEHOLDER/$APP_DOMAIN/g" /etc/nginx/sites-available/evolua-crm

# Habilitar site
ln -sf /etc/nginx/sites-available/evolua-crm /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testar e reiniciar Nginx
nginx -t
systemctl restart nginx
systemctl enable nginx

# Criar script de deploy
echo "📝 Criando script de deploy..."
cat > /home/ubuntu/deploy.sh << 'DEPLOYSCRIPT'
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

cd /home/ubuntu/evolua-crm
echo "📥 Pulling latest code..."
git pull origin main

echo "📦 Installing dependencies..."
npm ci --only=production

echo "🔨 Building application..."
npm run build

echo "🔄 Restarting application..."
pm2 restart evolua-crm
pm2 save

echo "✅ Deployment completed successfully!"
DEPLOYSCRIPT

chmod +x /home/ubuntu/deploy.sh
chown ubuntu:ubuntu /home/ubuntu/deploy.sh

# Configurar firewall UFW (adicional ao Security Group)
echo "🔒 Configurando firewall..."
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw reload

# Configurar swap (importante para t2.micro com 1GB RAM)
echo "💾 Configurando swap..."
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Otimizações de sistema
echo "⚡ Aplicando otimizações..."
cat >> /etc/sysctl.conf << EOF
vm.swappiness=10
vm.vfs_cache_pressure=50
EOF
sysctl -p

# Criar arquivo de status
echo "✅ Setup completo em: $(date)" > /home/ubuntu/setup-complete.txt

echo ""
echo "========================================="
echo "✅ Setup Inicial Completo!"
echo "========================================="
echo "Finalizado em: $(date)"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure SSL: sudo certbot --nginx -d $APP_DOMAIN"
echo "2. Verifique aplicação: curl http://localhost:3000"
echo "3. Verifique PM2: pm2 status"
echo "4. Verifique Nginx: systemctl status nginx"
echo ""
echo "📊 Logs:"
echo "- User data: /var/log/user-data.log"
echo "- Cloud init: /var/log/cloud-init-output.log"
echo "- PM2: /home/ubuntu/logs/"
echo "- Nginx: /var/log/nginx/"
echo ""
