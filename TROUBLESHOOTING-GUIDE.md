# 🔧 Troubleshooting - Deploy Dual Domain

## 🎯 Diagnóstico Rápido

### Teste de Conectividade Básico

```bash
# 1. Pode fazer ping?
ping 18.228.183.188
# Esperado: TTL respostas. Se "Request timed out", tem problema de rede

# 2. Port aberto?
telnet 18.228.183.188 22
# Esperado: Connected to 18.228.183.188 (se conectar = OK)

# 3. DNS resolve?
nslookup api.useevolua.com.br
# Esperado: Address: 18.228.183.188
```

---

## ⚠️ Problemas Comuns & Soluções

### ❌ Problema: SSH Connection Refused

**Sintoma**:
```
ssh: connect to host 18.228.183.188 port 22 refused
```

**Causas e Soluções**:

1. **Segurança do Grupo não permite SSH** (MAIS COMUM)
   ```bash
   # 1. Verifique no AWS Console:
   # EC2 → Instances → i-0fe65fd681f4e7baf
   # → Security groups → evolua-crm-backend-sg
   # → Inbound rules
   
   # Deve ter:
   # Type: SSH | Protocol: TCP | Port: 22 | Source: [seu-IP/32]
   # Ex: 201.13.9.94/32
   
   # 2. Se não estiver, adicione:
   # → Edit inbound rules → Add rule
   # → Type: SSH | Source: [seu-IP/32]
   # → Save
   
   # 3. Aguarde 30 segundos e tente SSH novamente
   ```

2. **Chave SSH com permissões erradas**
   ```bash
   # Windows (PowerShell):
   chmod 600 evolua-key.pem
   # ou
   # AWS Console → EC2 → Key Pairs → evolua-key → Download novamente
   
   # Mac/Linux:
   chmod 600 evolua-key.pem
   ```

3. **Usuário errado**
   ```bash
   # Ubuntu AMI usa: ubuntu
   ssh -i evolua-key.pem ubuntu@18.228.183.188
   
   # NÃO use: ec2-user, root, admin
   ```

4. **EC2 ainda inicializando**
   ```bash
   # User-data roda em background, pode levar 3-5 min
   # Aguarde 5 minutos e tente novamente
   ```

---

### ❌ Problema: "Authentication failed" após SSH

**Sintoma**:
```
Permission denied (publickey,gssapi-keyex,gssapi-with-mic)
```

**Solução**:
```bash
# 1. Confirme chave é AWS, não local
ls -l evolua-key.pem
# Deve ter: -rw------- (600 permissions)
# Se tiver: -rw-r--r--, rode: chmod 600 evolua-key.pem

# 2. Se ainda falhar, regere chave no AWS:
# AWS Console → EC2 → Key Pairs → evolua-key
# → Delete e recriar
# → Download novo .pem
# → chmod 600 novo.pem
# → ssh -i novo.pem ubuntu@18.228.183.188
```

---

### ❌ Problema: "Nameservers não aparecem no Vercel"

**Sintoma**:
```
[!] Invalid configuration - pending DNS propagation
[!] Your nameservers are not pointing to Vercel
```

**Causas e Soluções**:

1. **Nameservers nos registradores ainda não foram salvos**
   ```bash
   # Verifique no registrador (GoDaddy/Namecheap):
   # 1. Você CLICOU em "Save"/"Update" após adicionar?
   # 2. Passou 5+ minutos?
   
   # Use ferramenta online para conferir:
   # https://whois.net/ → ou → https://dnschecker.org/
   ```

2. **Propagação ainda em progresso**
   ```bash
   # Pode levar até 30 minutos
   # Monitore com:
   nslookup useevolua.com.br
   # Quando retornar IP = pronto
   
   # Se ainda não resolveu após 30 min:
   # Verifique se registrador salvou corretamente
   ```

3. **Nameservers errados adicionados**
   ```bash
   # Cada domínio tem SEUS próprios nameservers!
   
   # com.br DEVE ter:
   # ns-1205.awsdns-22.org
   # ns-1892.awsdns-44.co.uk
   # ns-390.awsdns-48.com
   # ns-850.awsdns-42.net
   
   # online DEVE ter (DIFERENTES):
   # ns-1227.awsdns-25.org
   # ns-1555.awsdns-02.co.uk
   # ns-453.awsdns-56.com
   # ns-938.awsdns-53.net
   
   # Se copiou errado, corrija no registrador
   ```

---

### ❌ Problema: "API unreachable" / curl timeout

**Sintoma**:
```
curl: (7) Failed to connect to api.useevolua.com.br port 443
curl: (7) Connection timed out
```

**Causas (em ordem de probabilidade)**:

1. **DNS ainda não propagou**
   ```bash
   nslookup api.useevolua.com.br
   # Se não resolver ou está lento = cause
   # Aguarde mais 10 minutos e tente
   ```

2. **Nginx não está rodando no EC2**
   ```bash
   ssh -i evolua-key.pem ubuntu@18.228.183.188
   sudo systemctl status nginx
   
   # Se inativo:
   sudo systemctl start nginx
   sudo systemctl status nginx
   # Deve estar: active (running)
   ```

3. **Certbot não gerou certificado ainda**
   ```bash
   # Se tentar antes do certbot rodar:
   ssh -i evolua-key.pem ubuntu@18.228.183.188
   sudo certbot --nginx -d api.useevolua.com.br -d api.useevolua.online
   # (Certbot precisa que DNS já esteja propagado)
   ```

4. **Security group bloqueando porta 443**
   ```bash
   # AWS Console → Security Groups → evolua-crm-backend-sg
   # Deve ter inbound rule:
   # Type: HTTPS | Port: 443 | Source: 0.0.0.0/0
   
   # Se não tiver:
   # → Edit inbound rules → Add rule
   # → Type: HTTPS → Save
   ```

---

### ❌ Problema: "Certbot fails - domain validation failed"

**Sintoma**:
```
ERROR: Cert issuance/renewal failed:
...
challenge failed: acme-v02.api.letsencrypt.org...
```

**Causa**: DNS não propagou ou não resolve para seu IP

**Solução**:
```bash
# 1. Confirme DNS está propagado:
nslookup api.useevolua.com.br
# Deve retornar: 18.228.183.188

# 2. Se não resolver, aguarde 10+ minutos

# 3. Se resolvendo, reinicie nginx e tente certbot novamente:
ssh -i evolua-key.pem ubuntu@18.228.183.188
sudo systemctl restart nginx
sudo certbot --nginx -d api.useevolua.com.br -d api.useevolua.online

# 4. Se ainda falhar, force renewal:
sudo certbot renew --force-renewal

# 5. Logs detalhados:
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

---

### ❌ Problema: "SSL certificate not trusted"

**Sintoma**:
```
curl: (60) SSL certificate problem: self signed certificate
# ou
# Browser Warning: "Your connection is not private"
```

**Causas e Soluções**:

1. **Certbot não foi rodado ou falhou**
   ```bash
   ssh -i evolua-key.pem ubuntu@18.228.183.188
   sudo certbot --nginx -d api.useevolua.com.br -d api.useevolua.online
   sudo systemctl restart nginx
   curl https://api.useevolua.com.br/api/health
   # Deve funcionar agora
   ```

2. **Certificado expirou** (improvável em novo deploy)
   ```bash
   # Certbot renova automaticamente com cron
   # Mas pode forçar:
   sudo certbot renew
   ```

3. **Seu PC tem certificados antigos em cache**
   ```bash
   # Limpe cache:
   # Chrome: Settings → Privacy → Clear browsing data → Cached images/files
   # Firefox: Preferences → Privacy → Cookies/Site Data → Clear All
   # Safari: Develop → Empty Web Storage
   ```

---

### ❌ Problema: "Frontend returns 502 Bad Gateway"

**Sintoma**:
```
https://useevolua.com.br returns:
502 Bad Gateway (nginx)
```

**Causas e Soluções**:

1. **Backend (API) está down**
   ```bash
   # Verifique saúde:
   curl https://api.useevolua.com.br/api/health
   
   # Se falhar = backend problem (ver próxima seção)
   # Se OK = haverá problema na config frontend/vercel
   ```

2. **Env vars incorretas no Vercel**
   ```bash
   # Vercel → Settings → Environment Variables
   # Confirme:
   # NEXT_PUBLIC_API_URL = https://api.useevolua.com.br/api
   # NEXT_PUBLIC_SUPABASE_URL = https://diiaoaboykraaiavgdqs.supabase.co
   
   # Se mudou, trigger redeploy:
   git commit --allow-empty -m "chore: redeployment"
   git push origin main
   ```

3. **Vercel deployment falhou**
   ```bash
   # Vercel Console → Deployments
   # Veja se último deployment tem status "Error"
   # Se sim, verifique logs
   ```

---

### ❌ Problema: "Backend API returns 500 error"

**Sintoma**:
```
curl https://api.useevolua.com.br/api/health
{"statusCode":500,"message":"Internal server error"}
```

**Diagnóstico**:
```bash
ssh -i evolua-key.pem ubuntu@18.228.183.188

# 1. Nginx está servindo?
sudo systemctl status nginx
# Esperado: active (running)

# 2. PM2 app está rodando?
pm2 list
# Esperado: 1 app em status "online"

# 3. Logs da app:
pm2 logs
# Procure por erros (stack traces)

# 4. Verifique env vars do backend:
cat /home/ubuntu/.env
# Deve ter: DATABASE_URL, JWT_SECRET, etc

# 5. Se tiver erro de database:
# → Verifique Supabase connection string
# → Verifique se Supabase está online
```

---

### ❌ Problema: "Domain/Subdomain keeps showing as unverified"

**Sintoma**:
```
Vercel: "Checking..." para useevolua.com.br após 30+ min
```

**Causas (checklist)**:

- [ ] Nameservers foram salvos no registrador? (GoDaddy/Namecheap)
- [ ] Você clicou em "Update"/"Save" após adicionar nameservers?
- [ ] Passou 15+ minutos? (Às vezes demora)
- [ ] Nameservers estão corretos (não misturou com.br com online)?
- [ ] Verá indica domínio para Vercel Nameservers ou outro?

**Testador externo**:
```bash
# Use: https://dnschecker.org/
# Procure por NS records
# Deve retornar os 4 nameservers AWS que você adicionou
```

---

## 📊 Teste Completo de Diagnóstico

```bash
#!/bin/bash
# Copie e rode isto em terminal (Mac/Linux) ou PowerShell (Windows)

echo "=== Evolua Dual Domain Diagnostic ==="

# DNS
echo -e "\n1. DNS Resolution:"
nslookup useevolua.com.br | grep "Address:"
nslookup api.useevolua.com.br | grep "Address:"
nslookup useevolua.online | grep "Address:"
nslookup api.useevolua.online | grep "Address:"

# Conectividade
echo -e "\n2. Connectivity to Backend:"
curl -I https://api.useevolua.com.br
curl -I https://api.useevolua.online

# Frontend
echo -e "\n3. Frontend URLs:"
curl -I https://useevolua.com.br
curl -I https://useevolua.online

# API Health
echo -e "\n4. API Health:"
curl https://api.useevolua.com.br/api/health
curl https://api.useevolua.online/api/health

echo -e "\n=== Done ==="
```

---

## 🆘 "Ainda não funciona!"

Se nenhuma solução acima resolveu:

1. **Tire print/screenshot** do:
   - Comando e erro exato
   - Vercel console (Deployments + Settings)
   - AWS Console (EC2 Instance + Security Groups)
   - Resultado de `nslookup`

2. **SSH e rode**:
   ```bash
   ssh -i evolua-key.pem ubuntu@18.228.183.188
   
   # Coletar info:
   echo "=== User Data Log ===" && tail -50 /var/log/user-data.log
   echo "=== Nginx Status ===" && sudo systemctl status nginx
   echo "=== PM2 List ===" && pm2 list
   echo "=== PM2 Logs ===" && pm2 logs --lines 20
   echo "=== Nginx Error ===" && sudo tail -20 /var/log/nginx/error.log
   
   exit
   ```

3. **Reúna os dados** e documente o problema de forma clara

---

## ✅ Tudo Funciona?

Se conseguiu passar por todo troubleshooting e:
- ✅ Frontend responde (HTTPS 200)
- ✅ API responde (HTTPS 200 + JSON health)
- ✅ DNS resolvendo corretamente
- ✅ SSL certificados válidos

**Parabéns! 🎉 Sistema 100% operacional!**

---

**Última atualização**: 26/03/2026  
**Aplicável para**: Dual domain, HTTPS, Vercel + EC2 + Route53
