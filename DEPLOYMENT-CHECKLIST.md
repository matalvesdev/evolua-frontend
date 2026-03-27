# ☑️ Checklist - Próximas Ações

## 📋 Setup Pré-Requisitos

- [ ] Tenho chave SSH: `evolua-key.pem`
- [ ] Acesso ao registrador de domínios (GoDaddy/Namecheap)
- [ ] Acesso ao painel Vercel
- [ ] Terminal com SSH configurado

---

## 🔧 Ações Sequenciais

### ✅ Ação 1: EC2 SSH Verification

**⏱️ Tempo**: 5 minutos

**Comandos**:
```bash
ssh -i evolua-key.pem ubuntu@18.228.183.188
tail -f /var/log/user-data.log          # Espaço = próxima; q = sair
sudo systemctl status nginx             # Should be: active (running)
pm2 list                                # Should show NestJS app running
exit
```

**Checklist**:
- [ ] SSH conectou com sucesso
- [ ] Nginx está rodando:  ✅ active (running)
- [ ] PM2 está rodando: ✅ app rodando
- [ ] Sem erros grandes no user-data.log
- [ ] Pode sair do SSH

**Próximo**: Ação 2

---

### ✅ Ação 2: Configurar Nameservers nos Registradores

**⏱️ Tempo**: 5 minutos

#### Para `useevolua.com.br`:
1. Login no registrador (ex: GoDaddy)
2. Encontre a seção "DNS" ou "Nameservers"
3. Remova nameservers antigos (se houver)
4. Adicione estes 4 nameservers:
   - `ns-1205.awsdns-22.org`
   - `ns-1892.awsdns-44.co.uk`
   - `ns-390.awsdns-48.com`
   - `ns-850.awsdns-42.net`
5. Salve

**Checklist (com.br)**:
- [ ] Acessei o registrador
- [ ] Encontrei seção de DNS/Nameservers
- [ ] Adicionei 4 nameservers AWS
- [ ] Cliquei em "Salvar" / "Update"

#### Para `useevolua.online`:
1. Mesmo processo no registrador
2. **Atenção**: Use nameservers DIFERENTES:
   - `ns-1227.awsdns-25.org`
   - `ns-1555.awsdns-02.co.uk`
   - `ns-453.awsdns-56.com`
   - `ns-938.awsdns-53.net`
3. Salve

**Checklist (online)**:
- [ ] Acessei o registrador
- [ ] Encontrei seção de DNS/Nameservers
- [ ] Adicionei 4 nameservers AWS (diferentes do com.br!)
- [ ] Cliquei em "Salvar" / "Update"

**Próximo**: Ação 3 (pode fazer em paralelo com Ação 2)

---

### ✅ Ação 3: Adicionar Domínios no Vercel

**⏱️ Tempo**: 5 minutos

1. Abra https://vercel.com → Seu projeto
2. Vá para: **Settings** → **Domains**
3. Clique: **Add Domain**
4. Digite: `useevolua.com.br`
   - [ ] Usando Vercel Nameservers
   - Status: Checking...
5. Clique: **Add Domain**
6. Digite: `www.useevolua.com.br`
   - [ ] Adicionado
7. Clique: **Add Domain**
8. Digite: `useevolua.online`
   - [ ] Usando Vercel Nameservers
9. Clique: **Add Domain**
10. Digite: `www.useevolua.online`
    - [ ] Adicionado

**Status esperado** (vai melhorar ao longo do tempo):
```
[!] Invalid configuration - pending DNS propagation
[!] Your nameservers are not pointing to Vercel
[✓] Valid configuration (após ~15 min)
```

**Checklist**:
- [ ] 4 domínios adicionados no Vercel
- [ ] Todos em modo "Checking..." ou "Valid"
- [ ] Sem erros bloqueadores

**Próximo**: Ação 4 (esta é passiva)

---

### ⏳ Ação 4: Aguardar DNS Propagar

**⏱️ Tempo**: 5-30 minutos (DEPENDE - pode levar até 48h em casos raros)

**O que fazer durante esta espera**:
- Fazer coffee/café ☕
- Escrever código, estudar, trabalhar em outra coisa
- Monitorar de vez em quando

**Como verificar se já propagou**:

```bash
# Terminal (Mac/Linux) ou PowerShell
nslookup useevolua.com.br
nslookup api.useevolua.com.br
nslookup useevolua.online
nslookup api.useevolua.online
```

**Resultado esperado** (quando pronto):
```
Name:   useevolua.com.br
Address: 76.76.21.21          ← Vercel

Name:   api.useevolua.com.br
Address: 18.228.183.188       ← Seu EC2
```

**Alternativa**: Use https://dnschecker.org (visual, mais fácil)

**Checklist**:
- [ ] DNS usevolua.com.br → 76.76.21.21
- [ ] DNS api.useevolua.com.br → 18.228.183.188
- [ ] DNS useevolua.online → 76.76.21.21
- [ ] DNS api.useevolua.online → 18.228.183.188

**Próximo**: Ação 5 (pode começar assim que nameservers estiverem configurados)

---

### ✅ Ação 5: Instalar SSL/TLS com Certbot

**⏱️ Tempo**: 5 minutos

**IMPORTANTE**: Only after DNS is propagated!

```bash
# 1. SSH no servidor
ssh -i evolua-key.pem ubuntu@18.228.183.188

# 2. Instale certbot (provavelmente já instalado, mas confirme)
sudo apt-get install -y certbot python3-certbot-nginx

# 3. Gere certificados para AMBOS domínios
sudo certbot --nginx -d api.useevolua.com.br -d api.useevolua.online

# 4. Responda:
# Enter email: seu-email@gmail.com
# Agree? Y
# Share? N (ou Y, como preferir)

# 5. Reinicie nginx
sudo systemctl restart nginx

# 6. Saia
exit
```

**Checklist**:
- [ ] SSH conectou
- [ ] Certbot rodou com sucesso
- [ ] Respondeu as perguntas
- [ ] Nginx restarted
- [ ] Sem erros

**Validar**:
```bash
curl https://api.useevolua.com.br/api/health
# Deve retornar: {"status":"ok"} ou similar
```

**Próximo**: Ação 6

---

### ✅ Ação 6: Configurar Variáveis de Ambiente no Vercel

**⏱️ Tempo**: 2 minutos

1. Vercel Console → Seu projeto → **Settings** → **Environment Variables**
2. Clique: **Add**
   - Nome: `NEXT_PUBLIC_SUPABASE_URL`
   - Valor: `https://diiaoaboykraaiavgdqs.supabase.co`
   - [ ] Adicionado
3. Clique: **Add**
   - Nome: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Valor: [SUA_CHAVE_ANON] (veja CRITICAL-INFO.md)
   - [ ] Adicionado
4. Clique: **Add**
   - Nome: `NEXT_PUBLIC_API_URL`
   - Valor: `https://api.useevolua.com.br/api`
   - [ ] Adicionado
5. Clique: **Add**
   - Nome: `NEXT_PUBLIC_APP_URL`
   - Valor: `https://useevolua.com.br`
   - [ ] Adicionado

**Trigger Redeploy**:
```bash
cd frontend-evolua
git commit --allow-empty -m "chore: env vars updated"
git push origin main
```

**Checklist**:
- [ ] 4 env vars adicionadas
- [ ] Push para main feito
- [ ] Vercel está fazendo deploy (ver no console)

**Próximo**: Ação 7

---

### ✅ Ação 7: Testar Tudo 

**⏱️ Tempo**: 5 minutos

```bash
# Frontend HTTPS
curl -I https://useevolua.com.br
curl -I https://useevolua.online
# Esperado: HTTP/2 200

# Backend HTTPS
curl https://api.useevolua.com.br/api/health
curl https://api.useevolua.online/api/health
# Esperado: {"status":"ok"}

# Script automático (se tiver bash):
bash scripts/check-new-domains.sh
```

**Checklist**:
- [ ] Frontend com.br retorna 200
- [ ] Frontend online retorna 200
- [ ] API com.br retorna HTTP 200 + JSON
- [ ] API online retorna HTTP 200 + JSON
- [ ] SSL válido (sem warnings)
- [ ] Script check retorna ✅ em tudo

---

## 🎉 FIM!

Se todas as ações foram completadas com ✅:

**Parabéns! Seu deployment está 100% completo! 🚀**

### O que agora está rodando?

| Componente | URL | Status |
|-----------|-----|--------|
| Frontend com.br | https://useevolua.com.br | ✅ |
| Frontend online | https://useevolua.online | ✅ |
| API com.br | https://api.useevolua.com.br/api | ✅ |
| API online | https://api.useevolua.online/api | ✅ |
| SSL/TLS | Todos com certificado Certbot Let's Encrypt | ✅ |
| Database | Supabase PostgreSQL | ✅ |

---

## 📞 Troubleshooting Rápido

### "SSH não conecta"
```bash
# Verificar permissões da chave:
chmod 600 evolua-key.pem

# Verificar se segurança do grupo permite SSH:
# AWS Console → EC2 → Security Groups → evolua-crm-backend-sg
# Deve ter regra: SSH (22) Allow from your-ip
```

### "Nameservers não aparecem no Vercel"
```bash
# Pode levar 15-30 minutos
# Use: https://dnschecker.org para verificar
```

### "Certbot falha"
```bash
# Provavelmente DNS não propagou ainda
# Aguarde mais 10 minutos
nslookup api.useevolua.com.br  # Deve resolver para 18.228.183.188
```

### "Curl retorna erro de certificado"
```bash
# Seu PC talvez precise de update de certificados
# Ou certbot ainda está processando
# Aguarde 5 minutos
```

---

## 📚 Referências

- Full details: [NEXT-ACTIONS-GUIDE.md](NEXT-ACTIONS-GUIDE.md)
- Infrastructure data: [CRITICAL-INFO.md](CRITICAL-INFO.md)
- Terraform details: [TERRAFORM-READY-TO-APPLY.md](TERRAFORM-READY-TO-APPLY.md)

---

**Última atualização**: 26/03/2026  
**Status**: ✅ Terraform 100% criado, próximas ações manuais  
**Tempo estimado para completar**: 32-57 minutos
