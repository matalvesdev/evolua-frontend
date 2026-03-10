# Referência Rápida - Evolua CRM

## 🚀 Comandos Essenciais

### SSH
```bash
# Conectar ao servidor
ssh -i evolua-key.pem ubuntu@SEU_ELASTIC_IP

# Copiar arquivo para servidor
scp -i evolua-key.pem arquivo.txt ubuntu@SEU_ELASTIC_IP:/home/ubuntu/

# Copiar arquivo do servidor
scp -i evolua-key.pem ubuntu@SEU_ELASTIC_IP:/home/ubuntu/arquivo.txt ./
```

### PM2
```bash
# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs evolua-crm

# Ver logs (últimas 100 linhas)
pm2 logs evolua-crm --lines 100

# Reiniciar aplicação
pm2 restart evolua-crm

# Parar aplicação
pm2 stop evolua-crm

# Iniciar aplicação
pm2 start evolua-crm

# Deletar do PM2
pm2 delete evolua-crm

# Monitorar recursos
pm2 monit

# Salvar configuração
pm2 save

# Limpar logs
pm2 flush
```

### Nginx
```bash
# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

# Recarregar configuração (sem downtime)
sudo systemctl reload nginx

# Ver status
sudo systemctl status nginx

# Parar Nginx
sudo systemctl stop nginx

# Iniciar Nginx
sudo systemctl start nginx

# Ver logs de erro
sudo tail -f /var/log/nginx/error.log

# Ver logs de acesso
sudo tail -f /var/log/nginx/access.log
```

### SSL (Certbot)
```bash
# Obter certificado
sudo certbot --nginx -d app.evolua.com.br

# Renovar certificado
sudo certbot renew

# Testar renovação (dry-run)
sudo certbot renew --dry-run

# Listar certificados
sudo certbot certificates

# Revogar certificado
sudo certbot revoke --cert-path /etc/letsencrypt/live/app.evolua.com.br/cert.pem
```

### Deploy
```bash
# Deploy manual
cd /home/ubuntu/evolua-crm
git pull origin main
cd frontend-evolua
npm ci --only=production
npm run build
pm2 restart evolua-crm

# Deploy com script
/home/ubuntu/deploy.sh
```

### Git
```bash
# Ver status
git status

# Ver branches
git branch -a

# Trocar de branch
git checkout main

# Pull latest
git pull origin main

# Ver commits
git log --oneline -10

# Ver diferenças
git diff
```

### Sistema
```bash
# Ver uso de CPU e memória
htop

# Ver uso de disco
df -h

# Ver uso de memória
free -h

# Ver processos Node.js
ps aux | grep node

# Matar processo por porta
sudo kill -9 $(sudo lsof -t -i:3000)

# Ver portas em uso
sudo netstat -tulpn

# Reiniciar servidor
sudo reboot

# Ver uptime
uptime

# Ver informações do sistema
uname -a
```

## 📁 Estrutura de Diretórios

```
/home/ubuntu/
├── evolua-crm/                 # Repositório Git
│   └── frontend-evolua/        # Aplicação Next.js
│       ├── .next/              # Build do Next.js
│       ├── node_modules/       # Dependências
│       ├── src/                # Código fonte
│       ├── .env.production     # Variáveis de ambiente
│       └── ecosystem.config.js # Configuração PM2
├── logs/                       # Logs da aplicação
│   ├── err.log                 # Erros
│   └── out.log                 # Output
└── deploy.sh                   # Script de deploy

/etc/nginx/
├── nginx.conf                  # Configuração principal
├── sites-available/
│   └── evolua-crm              # Configuração do site
└── sites-enabled/
    └── evolua-crm              # Link simbólico

/etc/letsencrypt/
└── live/
    └── app.evolua.com.br/      # Certificados SSL
        ├── fullchain.pem
        └── privkey.pem
```

## 🔧 Arquivos de Configuração

### ecosystem.config.js (PM2)
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
    max_memory_restart: '800M',
  }]
};
```

### .env.production
```env
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_APP_URL=https://app.evolua.com.br
```

### /etc/nginx/sites-available/evolua-crm
```nginx
server {
    listen 80;
    server_name app.evolua.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.evolua.com.br;

    ssl_certificate /etc/letsencrypt/live/app.evolua.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.evolua.com.br/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🐛 Troubleshooting Rápido

### Aplicação não responde
```bash
pm2 restart evolua-crm
sudo systemctl restart nginx
```

### Erro 502 Bad Gateway
```bash
pm2 status                      # Verificar se app está rodando
pm2 logs evolua-crm --lines 50  # Ver erros
curl http://localhost:3000      # Testar localmente
```

### SSL não funciona
```bash
sudo certbot renew --force-renewal
sudo systemctl restart nginx
```

### Memória cheia
```bash
free -h                         # Ver uso de memória
pm2 restart evolua-crm          # Reiniciar app
sudo systemctl restart nginx    # Reiniciar nginx
```

### Disco cheio
```bash
df -h                           # Ver uso de disco
pm2 flush                       # Limpar logs PM2
sudo journalctl --vacuum-time=7d # Limpar logs sistema
```

## 📊 Monitoramento

### Verificar Saúde do Sistema
```bash
# CPU e memória
htop

# Disco
df -h

# Processos
pm2 status

# Nginx
sudo systemctl status nginx

# Logs da aplicação
pm2 logs evolua-crm --lines 20

# Logs do Nginx
sudo tail -20 /var/log/nginx/error.log
```

### Métricas Importantes
```bash
# Uptime do servidor
uptime

# Uso de memória
free -h

# Uso de disco
df -h /

# Conexões ativas
sudo netstat -an | grep :443 | wc -l

# Processos Node.js
ps aux | grep node | wc -l
```

## 🔐 Segurança

### Verificar Security Group
```bash
# Via AWS CLI
aws ec2 describe-security-groups --group-ids sg-xxxxxxxxx
```

### Verificar Portas Abertas
```bash
sudo netstat -tulpn | grep LISTEN
```

### Verificar Certificado SSL
```bash
sudo certbot certificates
openssl s_client -connect app.evolua.com.br:443 -servername app.evolua.com.br
```

### Atualizar Sistema
```bash
sudo apt update
sudo apt upgrade -y
sudo reboot
```

## 📦 Backup

### Criar Backup Manual
```bash
# Backup do código
cd /home/ubuntu
tar -czf evolua-backup-$(date +%Y%m%d).tar.gz evolua-crm/

# Backup do banco (via Supabase CLI)
supabase db dump > backup-$(date +%Y%m%d).sql

# Copiar backup para local
scp -i evolua-key.pem ubuntu@SEU_IP:/home/ubuntu/evolua-backup-*.tar.gz ./
```

### Restaurar Backup
```bash
# Restaurar código
cd /home/ubuntu
tar -xzf evolua-backup-20240309.tar.gz

# Restaurar banco
psql -h db.xxx.supabase.co -U postgres -d postgres < backup-20240309.sql
```

## 🚨 Emergência

### Aplicação Travada
```bash
pm2 delete evolua-crm
pm2 start ecosystem.config.js
```

### Servidor Não Responde
```bash
# Via AWS Console:
# EC2 → Instances → Selecionar instância → Instance State → Reboot
```

### Rollback de Deploy
```bash
cd /home/ubuntu/evolua-crm
git log --oneline -5              # Ver últimos commits
git reset --hard COMMIT_HASH      # Voltar para commit anterior
cd frontend-evolua
npm ci --only=production
npm run build
pm2 restart evolua-crm
```

## 📞 Contatos Úteis

- **AWS Support:** https://console.aws.amazon.com/support/
- **Supabase Support:** https://supabase.com/support
- **Let's Encrypt:** https://letsencrypt.org/docs/

## 🔗 Links Rápidos

- **AWS Console:** https://console.aws.amazon.com/
- **Supabase Dashboard:** https://app.supabase.com/
- **GitHub Repo:** https://github.com/seu-usuario/evolua-crm
- **Aplicação:** https://app.evolua.com.br

## 📝 Notas

- Sempre testar em staging antes de produção
- Fazer backup antes de mudanças grandes
- Monitorar logs após deploy
- Documentar mudanças importantes
- Manter dependências atualizadas

---

**Última atualização:** 2024-03-09
