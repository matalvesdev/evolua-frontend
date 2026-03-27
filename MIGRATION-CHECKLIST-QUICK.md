# ✅ Checklist Rápido: Migração de Domínios

**Status**: Você tem deploy Vercel + EC2 backend → Migrar para novos domínios  
**Tempo**: 45-60 min total (incluindo DNS propagação)

---

## 📋 Passo-a-Passo

### **1️⃣ VERCEL - Adicionar Domínios** (5 min)

Na console Vercel (`https://vercel.com/dashboard`):

1. Selecione seu projeto
2. Vá para **Settings** → **Domains**
3. Clique **Add Domain** 4 vezes:
   - [ ] `useevolua.com.br`
   - [ ] `www.useevolua.com.br`
   - [ ] `useevolua.online`
   - [ ] `www.useevolua.online`

5. Copie a configuração DNS para cada (**A record para root, CNAME para www**)

---

### **2️⃣ VERCEL - Remover Domínio Antigo** (2 min)

Se tinha `useevolua.com`:
1. Vá para **Settings** → **Domains**
2. Clique no domínio antigo
3. Clique **Remove Domain**
4. Confirme

---

### **3️⃣ REGISTRADOR - Atualizar Nameservers** (5 min + propagação)

**Em GoDaddy / Namecheap / etc:**

1. Acesse **Domain Settings**
2. Vá para **Nameservers**
3. Adicione os nameservers da Route53 (você verá ao criar zone):
   ```
   ns-XXX.awsdns-XX.com
   ns-XXX.awsdns-XX.com
   ns-XXX.awsdns-XX.com
   ns-XXX.awsdns-XX.com
   ```

> **Nota**: Se registrou domínio em outro lugar, fazer parse dos nameservers aqui

---

### **4️⃣ AWS - Criar Hosted Zones** (10 min)

AWS Console → Route53 → **Hosted Zones**:

**Para `useevolua.com.br`:**
- [ ] Clique **Create Hosted Zone**
- [ ] Domain: `useevolua.com.br`
- [ ] Tipo: Public
- [ ] Clique **Create**

**Para `useevolua.online`:**
- [ ] Clique **Create Hosted Zone**
- [ ] Domain: `useevolua.online`
- [ ] Tipo: Public
- [ ] Clique **Create**

---

### **5️⃣ AWS - Criar DNS Records** (10 min)

**Em cada hosted zone, criar:**

| Domínio | Name | Type | Value |
|---------|------|------|-------|
| useevolua.com.br | (deixar vazio = root) | A | 76.76.21.21 |
| useevolua.com.br | www | CNAME | cname.vercel-dns.com |
| useevolua.com.br | api | A | `<ELASTIC-IP>` |
| useevolua.online | (root) | A | 76.76.21.21 |
| useevolua.online | www | CNAME | cname.vercel-dns.com |
| useevolua.online | api | A | `<ELASTIC-IP>` |

**Como obter Elastic IP:**
```bash
cd terraform
terraform output backend_public_ip
```

---

### **6️⃣ TERRAFORM - Aplicar Mudanças** (5 min)

```bash
cd terraform

# Review
terraform plan

# Aplicar (isso criará os registros automaticamente)
terraform apply
```

> Nota: Já atualizei `terraform/route53.tf` com novos domínios

---

### **7️⃣ AGUARDAR DNS PROPAGAÇÃO** (5-30 min)

Execute em seu terminal:
```bash
# Verificar propagação
bash scripts/check-new-domains.sh

# Ou manual:
dig useevolua.com.br +short
dig api.useevolua.com.br +short
dig useevolua.online +short
dig api.useevolua.online +short
```

**Esperado**: Todos retornam os IPs corretos

---

### **8️⃣ EC2 - Certificados SSL** (5 min)

SSH no servidor EC2:
```bash
ssh -i evolua-key.pem ubuntu@<ELASTIC_IP>

# Gerar certificados para TODOS os domínios
sudo certbot --nginx \
  -d api.useevolua.com.br \
  -d api.useevolua.online

# Responda com seu email
# Confirme aceitar terms

# Restart Nginx
sudo systemctl restart nginx
```

---

### **9️⃣ VERCEL - Env Vars** (2 min)

Se o frontend chama API, atualizar:

**Settings** → **Environment Variables**:
```
NEXT_PUBLIC_API_URL=https://api.useevolua.com.br/api
NEXT_PUBLIC_APP_URL=https://useevolua.com.br
```

Trigger redeploy:
```bash
git commit --allow-empty -m "chore: domain migration"
git push origin main
```

---

### **🔟 VALIDAÇÃO FINAL** (5 min)

Testar tudo:

```bash
# Frontend
curl -I https://useevolua.com.br
curl -I https://www.useevolua.com.br
curl -I https://useevolua.online
curl -I https://www.useevolua.online

# API
curl https://api.useevolua.com.br/api/health
curl https://api.useevolua.online/api/health
```

**Esperado**: Tudo **200 OK**

---

## ✅ Checklist Final

- [ ] 4 domínios adicionados em Vercel
- [ ] Domínio antigo removido de Vercel
- [ ] Nameservers atualizados no registrador
- [ ] 2 hosted zones criadas em Route53
- [ ] 6 DNS records criados (3 por domínio)
- [ ] Terraform apply executado
- [ ] DNS propagado (verificado com `dig`)
- [ ] SSL certificados instalados (certbot)
- [ ] Nginx restarted
- [ ] Env vars atualizadas
- [ ] Frontend redeploy bem-sucedido
- [ ] Todas as URLs retornam 200

---

## 🎯 Resultado Esperado

| URL | Status |
|-----|--------|
| https://useevolua.com.br | ✅ Landing Page |
| https://www.useevolua.com.br | ✅ Landing Page |
| https://useevolua.online | ✅ Landing Page |
| https://www.useevolua.online | ✅ Landing Page |
| https://api.useevolua.com.br/api/health | ✅ 200 OK |
| https://api.useevolua.online/api/health | ✅ 200 OK |

---

## 📞 Se algo falhar

| Erro | Solução |
|------|---------|
| DNS não resolve | Aguarde 30 min, exec `ipconfig /flushdns` |
| Vercel 404 | Confirmar domínio "Verified" no painel |
| Backend 502 | `ssh ec2 → sudo tail /var/log/nginx/error.log` |
| SSL erro | Aguardar DNS propagar, então rerun certbot |

---

**Tempo Total: ~45-60 minutos**  
**Próxima Ação**: Começar do Passo 1 (Vercel)

