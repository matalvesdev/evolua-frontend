# 🎯 Progresso de Deployment - Ações 1-7

**Data**: 27 de Março de 2026  
**Status Geral**: ✅ **AÇÃO 1 COMPLETA** | ⏳ AÇÕES 2-7 PENDENTES

---

## ✅ AÇÃO 1: SSH EC2 + Verificar Setup (5 min)

**Status**: ✅ **COMPLETO**  
**Tempo Real**: ~20 min (incluindo SSH key recovery)

### O que foi feito:

1. ✅ **Recuperou chave SSH vazia**
   - Chave `evolua-key.pem` estava com 0 bytes
   - Deletou key pair antigo do AWS
   - Criou novo key pair via AWS CLI
   - Chave agora tem 1.7KB de conteúdo

2. ✅ **Ajustou Security Group**
   - IP mudou: `201.13.9.94` → `177.138.57.230`
   - Adicionou regra SSH para novo IP
   - GroupId: `sg-02fb2b8c427146e1b`

3. ✅ **Conectou SSH com sucesso**
   - EC2 IP: `18.228.183.188`
   - Usuário: `ubuntu`
   - Chave: `terraform/evolua-key.pem`
   - Conexão: ✅ Active

4. ✅ **Verificou serviços**
   - **Nginx**: ✅ `active (running)` - rodando por 23 minutos
   - **PM2**: ✅ Iniciado (pausa normal pós-boot)
   - **User-data**: ✅ Completado com sucesso
   - **Firewall**: ✅ Ativo

### Logs da Inicialização:

```
✅ Setup concluído: Fri Mar 27 00:23:57 UTC 2026
⚠️ Health check não respondeu (esperado - SSL não configurado ainda)
✅ Auto-renovação de certificados agendada
✅ Firewall ativo e configurado
```

### Próximo Passo:
```bash
# Quando DNS estiver propagado, rodar:
sudo certbot --nginx -d api.useevolua.com.br -d api.useevolua.online
```

---

## ⏳ AÇÃO 2: Configurar Nameservers (MANUAL)

**Status**: ⏳ **AGUARDANDO AÇÃO DO USUÁRIO**  
**Tempo Estimado**: 5 minutos

### Instruções:

#### Para `useevolua.com.br`:
1. Acesse seu registrador (GoDaddy, Namecheap, etc)
2. Vá para: **DNS** ou **Nameservers**
3. Adicione estes 4 nameservers:
   ```
   ns-1205.awsdns-22.org
   ns-1892.awsdns-44.co.uk
   ns-390.awsdns-48.com
   ns-850.awsdns-42.net
   ```
4. Salve

#### Para `useevolua.online`:
1. Mesmo processo
2. **Atenção**: Adicione estes 4 nameservers (DIFERENTES):
   ```
   ns-1227.awsdns-25.org
   ns-1555.awsdns-02.co.uk
   ns-453.awsdns-56.com
   ns-938.awsdns-53.net
   ```
3. Salve

### Verificação:
```bash
nslookup useevolua.com.br
nslookup useevolua.online
# Deve resolver quando DNS propagar
```

---

## ⏳ AÇÃO 3: Adicionar Domínios Vercel (MANUAL)

**Status**: ⏳ **AGUARDANDO AÇÃO DO USUÁRIO**  
**Tempo Estimado**: 5 minutos

### Instruções:

1. Acesse: https://vercel.com → Seu Project
2. **Settings** → **Domains**
3. Clique **Add Domain** (4 vezes):
   - [ ] `useevolua.com.br`
   - [ ] `www.useevolua.com.br`
   - [ ] `useevolua.online`
   - [ ] `www.useevolua.online`

### Status Esperado:
```
[~] Checking... (enquanto DNS não propagar)
[✓] Valid Configuration (após DNS propagar ~15 min)
```

---

## ⏳ AÇÃO 4: Aguardar DNS Propagar (PASSIVO)

**Status**: ⏳ **EM PROGRESSO** (estimado 5-30 minutos)  
**Tempo Estimado**: 5-30 minutos

### Checklist DNS:

Monitore com este comando a cada 5 minutos:

```bash
nslookup useevolua.com.br
nslookup api.useevolua.com.br
nslookup useevolua.online
nslookup api.useevolua.online
```

### Resultados Esperados:

```
name: useevolua.com.br
Address: 76.76.21.21        ← Vercel

name: api.useevolua.com.br
Address: 18.228.183.188     ← Seu EC2

name: useevolua.online
Address: 76.76.21.21        ← Vercel

name: api.useevolua.online
Address: 18.228.183.188     ← Seu EC2
```

### Alternativa Visual:
- Use: https://dnschecker.org/
- Procure por `A` records
- Devem mostrar IPs acima

---

## ⏳ AÇÃO 5: Instalar SSL/TLS (PRONTA - bloqueada por DNS)

**Status**: ⏳ **PRONTA PARA EXECUTAR** (após DNS propagar)  
**Tempo Estimado**: 5 minutos

### Pré-requisitos:
- [ ] AÇÃO 2: Nameservers configurados
- [ ] AÇÃO 4: DNS propagado completamente

### Comando:

```bash
# SSH para EC2
ssh -i terraform/evolua-key.pem ubuntu@18.228.183.188

# Dentro do EC2:
sudo certbot --nginx -d api.useevolua.com.br -d api.useevolua.online

# Responda:
# Email: seu-email@gmail.com
# Agree Terms? Y
# Share email? N (ou Y)

# Restart nginx
sudo systemctl restart nginx

# Sair
exit
```

### Validação:
```bash
curl https://api.useevolua.com.br/api/health
# Esperado: 200 OK + JSON response
```

---

## ⏳ AÇÃO 6: Configurar Env Vars Vercel (MANUAL)

**Status**: ⏳ **AGUARDANDO AÇÃO DO USUÁRIO**  
**Tempo Estimado**: 2 minutos

### Instruções:

1. Vercel Dashboard → Seu Project
2. **Settings** → **Environment Variables**
3. Clique **Add** (4 vezes):

```
NEXT_PUBLIC_SUPABASE_URL = https://diiaoaboykraaiavgdqs.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGci... (seuvalor)

NEXT_PUBLIC_API_URL = https://api.useevolua.com.br/api

NEXT_PUBLIC_APP_URL = https://useevolua.com.br
```

### Trigger Redeploy:

```bash
cd frontend-evolua

git commit --allow-empty -m "chore: env vars updated"
git push origin main
```

---

## ⏳ AÇÃO 7: Testar Tudo (FINAL)

**Status**: ⏳ **AGUARDANDO AÇÕES ANTERIORES**  
**Tempo Estimado**: 5 minutos

### Testes Manuais:

```bash
# Frontend com.br
curl -I https://useevolua.com.br
# Esperado: HTTP/2 200

# Frontend online
curl -I https://useevolua.online
# Esperado: HTTP/2 200

# API com.br
curl https://api.useevolua.com.br/api/health
# Esperado: 200 + JSON

# API online
curl https://api.useevolua.online/api/health
# Esperado: 200 + JSON
```

### Teste Automático:

```bash
# Executar script de verificação:
bash scripts/check-new-domains.sh

# Esperado: ✅ em tudo
```

---

## 📊 Progresso Total

```
Ação 1: SSH EC2               ████████████████████ 100% ✅
Ação 2: Nameservers          ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Ação 3: Vercel Domains       ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Ação 4: DNS Propagate        ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Ação 5: SSL/TLS              ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Ação 6: Env Vars             ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Ação 7: Testes               ░░░░░░░░░░░░░░░░░░░░   0% ⏳

TOTAL: ███░░░░░░░░░░░░░░░░░░ 14% (1/7 completa)
```

---

## 🎯 Resumo - Próximos Passos

### Agora (MANUAL):
- [ ] **AÇÃO 2**: Configure nameservers nos registradores (5 min)
- [ ] **AÇÃO 3**: Adicione domínios no Vercel (5 min)

### Esparar (PASSIVO):
- [ ] **AÇÃO 4**: Aguarde DNS propagar (5-30 min)

### Depois (MANUAL):
- [ ] **AÇÃO 5**: SSL/TLS via Certbot (5 min)
- [ ] **AÇÃO 6**: Env vars Vercel (2 min)

### Final (TESTE):
- [ ] **AÇÃO 7**: Validar tudo (5 min)

---

## 📞 Informações de Referência

```
EC2 SSH:      ssh -i terraform/evolua-key.pem ubuntu@18.228.183.188
EC2 IP:       18.228.183.188
EC2 Status:   ✅ Nginx rodando, PM2 ativo, Firewall on

Nameservers com.br:
  • ns-1205.awsdns-22.org
  • ns-1892.awsdns-44.co.uk
  • ns-390.awsdns-48.com
  • ns-850.awsdns-42.net

Nameservers online:
  • ns-1227.awsdns-25.org
  • ns-1555.awsdns-02.co.uk
  • ns-453.awsdns-56.com
  • ns-938.awsdns-53.net

Vercel Domains: useevolua.com.br, www.*, useevolua.online, www.*
```

---

**Última Atualização**: 27 de Março de 2026 - 00:52 UTC  
**Tempo Total Gasto**: ~20 minutos (SSH key recovery)  
**Tempo para Completar Restante**: ~32 minutos (com DNS wait de 5-30 min)
