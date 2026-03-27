# 🚀 Próximas Ações - Guia de Execução

**Status**: Terraform 100% criado ✅  
**Backend IP**: 18.228.183.188  
**Data**: 26 de março de 2026

---

## 📋 Sequência de Ações (20-45 min total)

### ✅ AÇÃO 1: Verificar EC2 Setup (SSH + Logs)
**Tempo**: 5 min | **Prioridade**: 🔴 ALTA

Conecte ao EC2 e verifique se o setup completou:

```bash
ssh -i evolua-key.pem ubuntu@18.228.183.188

# Dentro do servidor:
# 1. Verificar logs de setup
tail -f /var/log/user-data.log

# 2. Verificar serviços (Nginx, Node, PM2)
sudo systemctl status nginx
sudo systemctl status pm2

# 3. Verificar Node está rodando
pm2 list
pm2 logs

# 4. Exit SSH
exit
```

**Esperado**:
- [x] SSH conecta sem erro
- [x] Setup log mostra "Done" ou "Completed"
- [x] Nginx rodando (active)
- [x] PM2 rodando (1-2 processos)

**Se falhar**:
- Aguarde 2-3 min e tente novamente
- Verifique Security Group permite SSH (port 22)

---

### ✅ AÇÃO 2: Configurar Nameservers no Registrador
**Tempo**: 5 min | **Prioridade**: 🔴 ALTA

Você precisa fazer isso MANUALMENTE no seu registrador (GoDaddy, Namecheap, etc):

#### Para `useevolua.com.br`

1. Acesse seu painel de domínios
2. Procure por "Domain Settings" ou "Nameservers"
3. Mude para "Custom Nameservers"
4. Adicione estes 4:
   ```
   ns-1205.awsdns-22.org
   ns-1892.awsdns-44.co.uk
   ns-390.awsdns-48.com
   ns-850.awsdns-42.net
   ```
5. Clique Salvar

#### Para `useevolua.online`

1. Acesse seu painel de domínios
2. Procure por "Domain Settings" ou "Nameservers"
3. Mude para "Custom Nameservers"
4. Adicione estes 4:
   ```
   ns-1227.awsdns-25.org
   ns-1555.awsdns-02.co.uk
   ns-453.awsdns-56.com
   ns-938.awsdns-53.net
   ```
5. Clique Salvar

**Verificar propagação** (5-10 min depois):
```bash
# Linux/Mac
nslookup useevolua.com.br
nslookup useevolua.online

# Windows
nslookup useevolua.com.br
nslookup useevolua.online

# Esperado: Retorna IPs Route53
```

---

### ✅ AÇÃO 3: Adicionar Domínios no Vercel
**Tempo**: 5 min | **Prioridade**: 🟠 MÉDIA

1. Acesse https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá para **Settings** → **Domains**
4. Clique **Add Domain** e adicione os 4:

**Domínio 1**: `useevolua.com.br`
- Type: Vercel vai sugerir A record ou CNAME
- Se A: `76.76.21.21`
- Clique Add

**Domínio 2**: `www.useevolua.com.br`
- Type: CNAME
- Value: `cname.vercel-dns.com`
- Clique Add

**Domínio 3**: `useevolua.online`
- Type: A record
- Value: `76.76.21.21`
- Clique Add

**Domínio 4**: `www.useevolua.online`
- Type: CNAME
- Value: `cname.vercel-dns.com`
- Clique Add

**Status esperado**: "Pending" → "Verified" (após DNS propagar)

---

### ✅ AÇÃO 4: Aguardar DNS Propagar
**Tempo**: 5-30 min | **Prioridade**: ⏳ PASSIVA

O DNS pode levar até 30 minutos para propagar globalmente.

Verifique progresso:

```bash
# Verificar periodicamente:
nslookup useevolua.com.br
# Deve retornar: 76.76.21.21 (Vercel)

nslookup api.useevolua.com.br
# Deve retornar: 18.228.183.188 (EC2)

# Ou use online tool:
# https://dnschecker.org
# https://mxtoolbox.com
```

**Checklist**:
- [ ] useevolua.com.br resolve → 76.76.21.21
- [ ] www.useevolua.com.br resolve → CNAME
- [ ] useevolua.online resolve → 76.76.21.21
- [ ] api.useevolua.com.br resolve → 18.228.183.188
- [ ] api.useevolua.online resolve → 18.228.183.188

---

### ✅ AÇÃO 5: Configurar SSL/TLS no Backend
**Tempo**: 5 min | **Prioridade**: 🔴 ALTA

SSH no EC2 e configure certificados:

```bash
ssh -i evolua-key.pem ubuntu@18.228.183.188

# Configure SSL para ambos domínios
sudo certbot --nginx \
  -d api.useevolua.com.br \
  -d api.useevolua.online

# Responda às perguntas:
# - Email: seu@email.com
# - Agree to terms: Y
# - Share email: N (ou Y se quiser)

# Reinicie Nginx
sudo systemctl restart nginx

# Confirme SSL
curl https://api.useevolua.com.br/api/health
# Esperado: 200 OK

# Exit
exit
```

**Esperado**:
- [x] Certificado emitido por Let's Encrypt
- [x] Nginx redireciona HTTP → HTTPS
- [x] `curl https://api...` retorna 200

---

### ✅ AÇÃO 6: Configurar Environment Variables (Vercel)
**Tempo**: 2 min | **Prioridade**: 🟠 MÉDIA

1. No painel Vercel do projeto
2. Vá para **Settings** → **Environment Variables**
3. Adicione/Atualize:

```
NEXT_PUBLIC_SUPABASE_URL = https://diiaoaboykraaiavgdqs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGci...
NEXT_PUBLIC_API_URL = https://api.useevolua.com.br/api
NEXT_PUBLIC_APP_URL = https://useevolua.com.br
```

4. Clique **Save**

5. Trigger redeploy:
```bash
git commit --allow-empty -m "chore: env vars updated for new domains"
git push origin main
```

---

### ✅ AÇÃO 7: Validação Final
**Tempo**: 5 min | **Prioridade**: 🟢 BAIXA

Teste tudo:

```bash
# Frontend
curl -I https://useevolua.com.br
# Esperado: 200 ou 301

curl -I https://www.useevolua.com.br
# Esperado: 200

curl -I https://useevolua.online
# Esperado: 200 ou 301

# Backend
curl https://api.useevolua.com.br/api/health
# Esperado: 200 + JSON response

curl https://api.useevolua.online/api/health
# Esperado: 200 + JSON response
```

Ou execute script automatizado:
```bash
bash scripts/check-new-domains.sh
```

---

## 📊 Checklist Completo

```
FASE 1: EC2 Setup
  [ ] SSH conecta ao 18.228.183.188
  [ ] Logs mostram setup completo
  [ ] Nginx + PM2 rodando

FASE 2: DNS
  [ ] Nameservers configurados (.com.br)
  [ ] Nameservers configurados (.online)
  [ ] useevolua.com.br resolve (dig/nslookup)
  [ ] api.useevolua.com.br resolve

FASE 3: Vercel
  [ ] 4 domínios configurados em Vercel
  [ ] Status "Verified" para cada

FASE 4: SSL
  [ ] Certificado gerado para API (.com.br)
  [ ] Certificado gerado para API (.online)
  [ ] Nginx redireciona HTTP → HTTPS

FASE 5: Env Vars
  [ ] NEXT_PUBLIC_API_URL atualizado
  [ ] NEXT_PUBLIC_APP_URL atualizado
  [ ] Frontend redeploy bem-sucedido

FASE 6: Validação
  [ ] Frontend carrega (useevolua.com.br)
  [ ] Backend responde (api.useevolua.com.br/health)
  [ ] SSL válido (ambos domínios)
```

---

## ⏱️ Timeline Estimada

| Ação | Tempo | Status |
|------|-------|--------|
| EC2 SSH + Logs | 5 min | ⏳ |
| Nameservers | 5 min | ⏳ |
| DNS Propagação | 5-30 min | ⏳ |
| Vercel Config | 5 min | ⏳ |
| SSL Setup | 5 min | ⏳ |
| Env Vars | 2 min | ⏳ |
| Validação Final | 5 min | ⏳ |
| **TOTAL** | **32-57 min** | ⏳ |

---

## 🔔 Notas Importantes

1. **DNS pode levar até 30 min** - Não desista se não resolver imediatamente
2. **Salve o Elastic IP** - `18.228.183.188` para referência futura
3. **Guarde nameservers** em local seguro
4. **Backup de estado Terraform**:
   ```bash
   cp terraform/terraform.tfstate terraform/terraform.tfstate.backup-2026-03-26
   ```

---

## 📞 Se Algo Falhar

| Erro | Solução |
|------|---------|
| SSH Connection refused | Verificar Security Group permite port 22 |
| Nginx not found | Rodar user-data manualmente: `bash user-data/backend-init.sh` |
| DNS não propaga | Aguardar 30 min, verificar nameservers no registrador |
| Certbot erro | Verificar Nginx está rodando: `sudo systemctl start nginx` |
| Vercel 404 | Verificar domínio "Verified" no painel, aguardar 5 min |

---

**Próxima etapa**: Comece pela AÇÃO 1 (EC2 SSH) quando estiver pronto!

