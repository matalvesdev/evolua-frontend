# 🎯 Próximas Ações - Versão Rápida

**Terraform Status**: ✅ 100% CRIADO  
**Backend IP**: 18.228.183.188  
**Data**: 26/03/2026

---

## 🚀 7 Ações em Ordem

### 1️⃣ SSH EC2 + Verificar Setup (5 min)

```bash
ssh -i evolua-key.pem ubuntu@18.228.183.188

# Dentro:
tail -f /var/log/user-data.log
sudo systemctl status nginx pm2
pm2 list
exit
```

✅ **Esperado**: Nginx + PM2 rodando, sem erros

---

### 2️⃣ Configurar Nameservers 

**useevolua.com.br** no seu registrador (GoDaddy/Namecheap):
```
ns-1205.awsdns-22.org
ns-1892.awsdns-44.co.uk
ns-390.awsdns-48.com
ns-850.awsdns-42.net
```

**useevolua.online** no seu registrador:
```
ns-1227.awsdns-25.org
ns-1555.awsdns-02.co.uk
ns-453.awsdns-56.com
ns-938.awsdns-53.net
```

⏳ **Aguarde**: 5-30 min para propagar

---

### 3️⃣ Adicionar Domínios Vercel

Vercel Dashboard → Settings → Domains → Add Domain

- [ ] useevolua.com.br
- [ ] www.useevolua.com.br
- [ ] useevolua.online
- [ ] www.useevolua.online

✅ **Status esperado**: "Verified" (após DNS)

---

### 4️⃣ Aguardar DNS Propagar

```bash
# Verificar periodicamente:
nslookup useevolua.com.br
nslookup api.useevolua.com.br

# Deve retornar IPs corretos
```

⏳ **Tempo**: 5-30 min (paciência!)

---

### 5️⃣ Configurar SSL/TLS

```bash
ssh -i evolua-key.pem ubuntu@18.228.183.188

# Configure SSL (ambos domínios):
sudo certbot --nginx -d api.useevolua.com.br -d api.useevolua.online

# Responda é ao acordo
# Restart:
sudo systemctl restart nginx

# Teste:
curl https://api.useevolua.com.br/api/health

exit
```

✅ **Esperado**: Certificado emitido, 200 OK

---

### 6️⃣ Env Vars Vercel

Vercel Dashboard → Settings → Environment Variables

Adicionar:
```
NEXT_PUBLIC_SUPABASE_URL=https://diiaoaboykraaiavgdqs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_API_URL=https://api.useevolua.com.br/api
NEXT_PUBLIC_APP_URL=https://useevolua.com.br
```

Trigger redeploy:
```bash
git commit --allow-empty -m "chore: env updated"
git push origin main
```

---

### 7️⃣ Testar Tudo

```bash
# Frontend
curl -I https://useevolua.com.br
curl -I https://useevolua.online

# Backend
curl https://api.useevolua.com.br/api/health
curl https://api.useevolua.online/api/health

# Script completo:
bash scripts/check-new-domains.sh
```

✅ **Esperado**: 200 OK em tudo

---

## 📊 Resumo

| Ação | Tempo | Manual/Auto |
|------|-------|-----------|
| EC2 SSH | 5 min | Manual |
| Nameservers | 5 min | Manual |
| DNS Propag | 5-30 min | Automático ⏳ |
| Vercel | 5 min | Manual |
| SSL | 5 min | Manual |
| Env Vars | 2 min | Manual |
| Testes | 5 min | Manual/Auto |
| **Total** | **32-57 min** | |

---

## 🎯 Começar Agora?

Abra:
- 📖 **[NEXT-ACTIONS-GUIDE.md](NEXT-ACTIONS-GUIDE.md)** - Guia completo
- 📌 **[CRITICAL-INFO.md](CRITICAL-INFO.md)** - Dados de referência
- 📋 **[TERRAFORM-READY-TO-APPLY.md](TERRAFORM-READY-TO-APPLY.md)** - Referência técnica

---

**Status**: ✅ Tudo pronto. Você é o próximo passo!

