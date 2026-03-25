#!/bin/bash
# Backend NestJS - Setup no EC2 t2.micro (free tier)
# Instala: Node.js 22, PM2, Nginx, Certbot
# Clona e sobe o backend evolua

set -e
exec > >(tee /var/log/user-data.log) 2>&1

echo "=== Evolua CRM - Backend Setup ==="
echo "Iniciado: $(date)"

# Variaveis injetadas pelo Terraform
SUPABASE_URL="${supabase_url}"
SUPABASE_ANON_KEY="${supabase_anon_key}"
SUPABASE_SERVICE_ROLE_KEY="${supabase_service_role_key}"
DATABASE_URL="${database_url}"
CORS_ORIGINS="${cors_origins}"
FRONTEND_URL="${frontend_url}"
BACKEND_DOMAIN="${backend_domain}"

# Atualizar sistema
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

# Dependencias basicas
apt-get install -y curl wget git build-essential ca-certificates gnupg

# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs
echo "Node: $(node --version) | npm: $(npm --version)"

# PM2
npm install -g pm2

# Nginx + Certbot
apt-get install -y nginx certbot python3-certbot-nginx

# Swap 2GB (essencial para t2.micro com 1GB RAM no build)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Otimizacoes para pouca RAM
cat >> /etc/sysctl.conf << 'EOF'
vm.swappiness=10
vm.vfs_cache_pressure=50
EOF
sysctl -p

# Criar diretorios
mkdir -p /home/ubuntu/evolua-backend /home/ubuntu/logs
chown -R ubuntu:ubuntu /home/ubuntu

# Clonar backend
echo "Clonando backend..."
su - ubuntu -c "git clone --depth=1 https://github.com/matalvesdev/evolua-backend.git /home/ubuntu/evolua-backend 2>/dev/null || echo '⚠️ GitHub repo nao encontrado - aguardando push'"

# Se o repo nao existir ainda, criar estrutura minima para o NestJS subir
if [ ! -f /home/ubuntu/evolua-backend/package.json ]; then
  echo "⚠️  Repositorio nao encontrado - aguardando deploy manual via ./deploy.sh"
  echo "App sera inicializado apos receber codigo"
fi

# Arquivo .env de producao
cat > /home/ubuntu/evolua-backend/.env << EOF
NODE_ENV=production
PORT=8080

SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

DATABASE_URL=$DATABASE_URL

CORS_ORIGINS=$CORS_ORIGINS
FRONTEND_URL=$FRONTEND_URL
EOF

chown ubuntu:ubuntu /home/ubuntu/evolua-backend/.env
chmod 600 /home/ubuntu/evolua-backend/.env

# Build e start (se package.json existir)
if [ -f /home/ubuntu/evolua-backend/package.json ]; then
  echo "Instalando dependencias..."
  su - ubuntu -c "cd /home/ubuntu/evolua-backend && npm ci"
  su - ubuntu -c "cd /home/ubuntu/evolua-backend && npx prisma generate"
  su - ubuntu -c "cd /home/ubuntu/evolua-backend && npm run build"

  # PM2 ecosystem
  cat > /home/ubuntu/evolua-backend/ecosystem.config.js << 'PMCONF'
module.exports = {
  apps: [{
    name: 'evolua-backend',
    script: 'dist/main.js',
    cwd: '/home/ubuntu/evolua-backend',
    instances: 1,
    env: {
      NODE_ENV: 'production',
      PORT: 8080,
    },
    error_file: '/home/ubuntu/logs/backend-err.log',
    out_file: '/home/ubuntu/logs/backend-out.log',
    autorestart: true,
    max_memory_restart: '400M',
  }]
};
PMCONF

  su - ubuntu -c "cd /home/ubuntu/evolua-backend && pm2 start ecosystem.config.js"
  su - ubuntu -c "pm2 save"
  env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
fi

# Nginx - proxy reverso para o NestJS na porta 8080
# Configuracao TEMPORARIA (HTTP) - Certbot vai converter para HTTPS+SSL
cat > /etc/nginx/sites-available/evolua-backend << NGINXCONF
server {
    listen 80;
    server_name $BACKEND_DOMAIN;

    # Permitir renovacao de certificado Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Health check sem log (importante para monitoramento)
    location /api/health {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        access_log off;
    }

    # Redirecionar todo tráfico HTTP para HTTPS (apos Certbot)
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }
}
NGINXCONF

ln -sf /etc/nginx/sites-available/evolua-backend /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx && systemctl enable nginx

# Criar diretorio para certificado
mkdir -p /var/www/certbot

# ====================================================
# SSL/TLS Setup via Certbot + Let's Encrypt
# ====================================================
echo "Configurando SSL/TLS..."

# Aguardar que health check esteja respondendo (máximo 30s)
HEALTH_MAX_WAIT=30
HEALTH_COUNT=0
until curl -f http://localhost:8080/api/health 2>/dev/null || [ $HEALTH_COUNT -ge $HEALTH_MAX_WAIT ]; do
  echo "Aguardando health check responder... ($HEALTH_COUNT/$HEALTH_MAX_WAIT)"
  sleep 1
  HEALTH_COUNT=$((HEALTH_COUNT + 1))
done

if [ $HEALTH_COUNT -lt $HEALTH_MAX_WAIT ]; then
  echo "✅ Health check respondendo - configurando SSL"
  
  # Non-interactive Certbot setup
  certbot certonly --webroot \
    -w /var/www/certbot \
    -d "$BACKEND_DOMAIN" \
    --email admin@useevolua.com \
    --non-interactive \
    --agree-tos \
    --preferred-challenges http \
    2>&1 | tee /var/log/certbot-setup.log || echo "⚠️ Certbot falhou (normal se ja tiver cert)"
    
  # Se obteve certificado, criar configuracao HTTPS
  if [ -f "/etc/letsencrypt/live/$BACKEND_DOMAIN/fullchain.pem" ]; then
    echo "Ativando HTTPS..."
    cat > /etc/nginx/sites-available/evolua-backend-https << NGINXHTTPS
# HTTPS com redirecionamento automatico
server {
    listen 80;
    server_name $BACKEND_DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Redirecionar HTTP para HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name $BACKEND_DOMAIN;

    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/$BACKEND_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$BACKEND_DOMAIN/privkey.pem;

    # Segurança SSL/TLS
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Health check
    location /api/health {
        proxy_pass http://localhost:8080;
        access_log off;
    }

    # Proxy para backend
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }
}
NGINXHTTPS

    # Ativar config HTTPS e desativar HTTP
    ln -sf /etc/nginx/sites-available/evolua-backend-https /etc/nginx/sites-enabled/evolua-backend-https
    rm -f /etc/nginx/sites-enabled/evolua-backend
    
    nginx -t && systemctl restart nginx
    echo "✅ HTTPS ativado para $BACKEND_DOMAIN"
  else
    echo "⚠️ Certificado nao obtido - Nginx funcionando em HTTP (inseguro!)"
  fi
else
  echo "⚠️ Health check nao respondeu - SSL nao configurado (retentar apos deploy)"
fi

# Agendar renovacao de certificado
# Cron job: renewall a cada 12 horas
if ! crontab -u ubuntu -l 2>/dev/null | grep -q "certbot renew"; then
  (crontab -u ubuntu -l 2>/dev/null; echo "0 */12 * * * certbot renew --quiet && systemctl reload nginx") | crontab -u ubuntu -
  echo "✅ Auto-renovacao de certificados agendada"
fi

# Script de deploy para atualizacoes futuras
cat > /home/ubuntu/deploy.sh << 'DEPLOY'
#!/bin/bash
set -e
cd /home/ubuntu/evolua-backend
echo "Pulling..."
git pull origin main
echo "Installing..."
npm ci
npx prisma generate
echo "Building..."
npm run build
echo "Restarting..."
pm2 restart evolua-backend
pm2 save
echo "Deploy concluido!"
DEPLOY

chmod +x /home/ubuntu/deploy.sh
chown ubuntu:ubuntu /home/ubuntu/deploy.sh

# Firewall
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw reload

echo "=== Setup concluido: $(date) ==="
echo "Proximo passo: sudo certbot --nginx -d $BACKEND_DOMAIN"
