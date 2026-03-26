# 🚀 Post-Deploy Actions - Evolua CRM

**Data**: 25 de março de 2026  
**Status**: ✅ Infraestrutura criada | ⏳ DNS/SSL pendente

---

## ✅ Completo

```
EC2 Instance:       i-0fe65fd681f4e7baf (running)
Load IP:            18.228.183.188
API Domain:         api.useevolua.com
Frontend Domain:    useevolua.com
Nginx:              ✅ Rodando
PM2:                ✅ Configurado (quando deploy de código)
Firewall:           ✅ Ativado
Certbot:            ✅ Instalado
```

---

## ⏳ Pendente (15-30 min)

### 1️⃣ Atualizar Nameservers do Registrador

**Seu domínio**: `useevolua.com`

**Nameservers da AWS Route53** (copiar exatamente):

```
ns-1188.awsdns-20.org
ns-154.awsdns-19.com
ns-1997.awsdns-57.co.uk
ns-700.awsdns-23.net
```

**Como atualizar** (depende do registrador):
- **GoDaddy**: Domain Settings → Nameservers → Change
- **Namecheap**: Nameserver → Custom
- **RegistroBR**: DNS → Nameserver
- **Outro**: Procure por "DNS" ou "Nameserver"

⏱️ **Propagação**: 5-10 min (até 48h em casos extremos)

---

### 2️⃣ Validar DNS (after 10 min)

Execute na sua máquina local:

```bash
nslookup api.useevolua.com
```

✅ Esperado:
```
Name:    api.useevolua.com
Address: 18.228.183.188
```

---

### 3️⃣ Configurar SSL (após DNS validar)

SSH para EC2:

```bash
ssh -i ~/.ssh/evolua-key.pem ubuntu@18.228.183.188
```

Executar Certbot:

```bash
sudo certbot --nginx -d api.useevolua.com --agree-tos -n -m seu-email@dominio.com
```

✅ Esperado: `Congratulations! Your certificate has been obtained.`

---

### 4️⃣ Testar Health Check

```bash
curl https://api.useevolua.com/api/health
```

✅ Esperado:
```json
{"status": "ok", "timestamp": "2026-03-25T..."}
```

---

## 📋 Checklist Pré-Produção

- [ ] DNS nameservers atualizados no registrador
- [ ] DNS respondendo para api.useevolua.com
- [ ] SSL certificado instalado (certbot rodar com sucesso)
- [ ] Health check respondendo em /api/health
- [ ] Backend código deployado (git pull + npm install + pm2 restart)
- [ ] Frontend apontando para https://api.useevolua.com

---

## 🔐 Segurança - TODO

- [ ] Remover SSH 0.0.0.0/0 → restringir para seu IP
- [ ] Rotacionar chaves Supabase
- [ ] Remover terraform.tfvars do git
- [ ] Configurar CloudWatch alarms
- [ ] Backup automático EBS

---

## 📞 Comandos Úteis

**Ver logs em tempo real:**
```bash
ssh -i ~/.ssh/evolua-key.pem ubuntu@18.228.183.188
tail -f /var/log/user-data.log
tail -f /var/log/nginx/access.log
```

**Reiniciar Nginx:**
```bash
sudo systemctl restart nginx
```

**Renovar certificado manualmente:**
```bash
sudo certbot renew --dry-run
```

**Ver processos rodando:**
```bash
ps aux | grep -E "(nginx|pm2|node)"
```

---

## ⏭️ Próximas Ações (Ordem)

1. ✅ Atualizar nameservers registrador (15 min)
2. ⏳ Aguardar DNS propagação (5-10 min)
3. ⏳ Validar com `nslookup` (imediato)
4. ⏳ Rodar certbot SSL (2 min)
5. ⏳ Testar health check (imediato)
6. ⏳ Deploy código backend (5 min)
7. ⏳ Configurar frontend no Vercel (5 min)

**Total: 30-45 min até produção funcional**

---

## 🆘 Troubleshooting

### DNS não propaga
```bash
# Forçar refresh
sudo systemctl restart systemd-resolved

# Verificar resolução
dig api.useevolua.com @8.8.8.8
```

### Certbot error "NXDOMAIN"
- Aguardar DNS propagação
- Verificar Route53 records criados: `aws route53 list-resource-record-sets --hosted-zone-id Z07198801FOI7MV7LJJPN`

### Health check não responde
```bash
# Verificar Nginx config
sudo nginx -t

# Ver logs
sudo tail -f /var/log/nginx/error.log
```

### SSH Connection Timeout
- Verificar SG: `aws ec2 describe-security-groups --group-ids sg-02fb2b8c427146e1b`
- SSH está 0.0.0.0/0 temporário (alterar rápido!)

---

**Última atualização**: 25 de março de 2026 - 23:59 UTC
