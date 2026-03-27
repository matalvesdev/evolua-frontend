# 🚀 Guia de Deploy: Vercel + Domínio useevolua.com

**Data**: 26 de março de 2026  
**Status**: ✅ Frontend validado localmente  
**Objetivo**: Deploy do landing page na Vercel com domínio customizado

---

## ✅ Pré-requisitos Confirmados

- [x] Build local passou (`npm run build`)
- [x] Projeto Next.js 14 compilado
- [x] Route53 zona criada para `useevolua.com`
- [x] Elastic IP allocado para backend API

---

## 📝 Passo 1: Importar Projeto no Vercel

### 1.1 Acessar Vercel Console
1. Acesse https://vercel.com/dashboard
2. Clique em **New Project**
3. Selecione **Import Git Repository**
4. Cole a URL: `https://github.com/matalvesdev/evolua-landingpage`
5. Clique em **Import**

### 1.2 Configurar Build Settings
Na página de configuração do projeto:

**Framework Preset**: Next.js (deve ser detectado automaticamente)

**Build Command**:
```
npm run build
```

**Output Directory**: `.next` (padrão Next.js)

**Install Command**:
```
npm ci --legacy-peer-deps
```

---

## 🔐 Passo 2: Variáveis de Ambiente

No painel Vercel, vá para **Settings** → **Environment Variables** e adicione:

```
NEXT_PUBLIC_SUPABASE_URL=https://[SEU-PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_API_URL=https://api.useevolua.com/api
NEXT_PUBLIC_APP_URL=https://useevolua.com
```

> **Nota**: Se o landing page não usa Supabase, remova essas variáveis. A mínima essencial é apenas se houver chamadas de API.

---

## 🌐 Passo 3: Configurar Domínio no Vercel

### 3.1 Adicionar Domínio
1. No painel do projeto, vá para **Settings** → **Domains**
2. Clique em **Add Domain**
3. Digite: `useevolua.com`
4. Clique em **Add**

### 3.2 Configurar DNS no Route53

Vercel exibirá a seguinte mensagem:
```
CNAME Status: CNAME not found. Add the CNAME record below to your DNS provider:

Name: useevolua.com
Type: A
Value: 76.76.21.21
```

No AWS Route53:
1. Acesse https://console.aws.amazon.com/route53
2. Selecione hosted zone `useevolua.com`
3. Clique em **Create Record**
4. Defina:
   - Name: `useevolua.com` (deixe vazio para root)
   - Type: `A`
   - Value: `76.76.21.21`
   - TTL: `300`
5. Clique em **Create Records**

### 3.3 Adicionar www.useevolua.com
Repita o processo adicionando:
1. Clique em **Add Domain** novamente
2. Digite: `www.useevolua.com`
3. Vercel informará a configuração CNAME:
   ```
   Name: www.useevolua.com
   Type: CNAME
   Value: cname.vercel-dns.com
   ```
4. No Route53, crie outro registro:
   - Name: `www.useevolua.com`
   - Type: `CNAME`
   - Value: `cname.vercel-dns.com`

---

## ✅ Passo 4: Confirmar SSL/TLS

1. Aguarde 5-10 minutos para DNS propagar
2. No painel Vercel, verifique **Domains**:
   - `useevolua.com` → Status: ✅ **Verified**
   - `www.useevolua.com` → Status: ✅ **Verified**
3. Clique em um dos domínios para confirmar **SSL Certificate: Valid**

---

## 🔄 Passo 5: Conectar GitHub para Auto-Deploy

1. No painel do projeto, vá para **Settings** → **Git**
2. Verifique **Connected GitHub Repository**: `matalvesdev/evolua-landingpage`
3. Configure **Production Branch**: `main`
4. Configure **Preview Deployments**: Qualquer push para qualquer branch

---

## 🧪 Passo 6: Testar Deploy

### 6.1 Trigger Primeiro Deploy
1. Faça um push fictício:
   ```bash
   cd quick-check-landing
   git commit --allow-empty -m "trigger vercel deploy"
   git push origin main
   ```

2. Acesse painel Vercel e aguarde a barra verde de build

### 6.2 Validar URLs
Abra em um navegador:
- `https://useevolua.com` → deve exibir o landing page
- `https://www.useevolua.com` → deve redirecionar para root
- `https://useevolua.com/` → deve carregar com sucesso

Se receber **404**, aguarde mais 5-10 minutos para DNS propagar.

### 6.3 Testar Performance (opcional)
Acesse Vercel Analytics:
- **Deployments**: verifique build time
- **Real User Monitoring**: verifique Core Web Vitals

---

## 🐛 Troubleshooting

### ❌ "Domain not found" ou "502 Bad Gateway"
**Causa**: DNS não propagou  
**Solução**:
1. Aguarde 5-10 minutos
2. Execute: `nslookup useevolua.com`
3. Verifique se retorna `76.76.21.21`

### ❌ Build falha no Vercel
**Causa**: Mismatch de node version ou dependências  
**Solução**:
1. Verifique Node version: `node --version` (deve ser 18+)
2. Limpe cache Vercel: Settings → **Build Cache** → **Purge**
3. Redeploy

### ❌ SSL Certificate erro
**Causa**: Domínio não validado  
**Solução**:
1. Aguarde DNS propagar
2. Clique **Refresh** no painel de domínios
3. Se persistir, remova e re-adicione domínio

---

## 📊 Passo 7: Monitoramento

No painel Vercel:
- **Deployments**: verifique status de cada deploy
- **Analytics**: veja tráfego e Core Web Vitals
- **Edge Logs**: debug de requisições
- **Firewall**: configure regras DDOS/bot

---

## 🎯 Checklist Final

- [ ] Repositório importado no Vercel
- [ ] Build Command: `npm run build`
- [ ] Install Command: `npm ci --legacy-peer-deps`
- [ ] Environment variables configuradas (se necessário)
- [ ] Domínio `useevolua.com` adicionado e verificado
- [ ] Domínio `www.useevolua.com` adicionado e verificado (CNAME)
- [ ] DNS propagado (5-10 min)
- [ ] SSL válido em ambos domínios
- [ ] GitHub auto-deploy conectado
- [ ] Primeiro deploy bem-sucedido
- [ ] URL `https://useevolua.com` acessível ✅

---

## 🔗 Referências

- Vercel Docs: https://vercel.com/docs
- Next.js Deploy: https://nextjs.org/docs/deployment
- Route53 Setup: https://docs.aws.amazon.com/route53/
- GitHub Auto-Deploy: https://vercel.com/docs/concepts/git

---

**Próximo passo**: Após confirmação do deploy Vercel, testar backend API em `api.useevolua.com`
