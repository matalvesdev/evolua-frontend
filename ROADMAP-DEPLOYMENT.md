# 🚀 Roadmap: Deploy Frontend + Backend + Infraestrutura

**Status**: 26 de março de 2026 - Fase de Deploy  
**Objetivo**: Fazer `useevolua.com` servir frontend via Vercel + `api.useevolua.com` servir backend NestJS via EC2

---

## 📋 Checklist Sequencial

### ✅ Completado

- [x] **Infraestrutura Planned**
  - [x] Terraform + Route53 configurado
  - [x] EC2 t2.micro free tier alocado
  - [x] Supabase PostgreSQL pronto
  - [x] Elastic IP allocado
  
- [x] **Frontend Validado**
  - [x] Repo `evolua-landingpage` clonado e buildado localmente
  - [x] `npm run build` passou ✅
  - [x] Sem erros de compilação

---

## 🔄 Em Progresso (Próximos Passos)

### **PASSO 1** - Vercel Import & Deploy
**Tempo estimado**: 10-15 minutos

- [ ] Acesse https://vercel.com/dashboard
- [ ] **New Project** → Import Git Repository
- [ ] Cole URL: `https://github.com/matalvesdev/evolua-landingpage`
- [ ] Configure:
  - Build: `npm run build`
  - Install: `npm ci --legacy-peer-deps`
  - Output: `.next` (padrão)
- [ ] Aguarde build verde ✅

🔗 **Referência completa**: [VERCEL-DEPLOY-GUIDE.md](VERCEL-DEPLOY-GUIDE.md)

---

### **PASSO 2** - Adicionar Domínios @ Vercel
**Tempo estimado**: 5 minutos

No painel Vercel, Settings → Domains:

- [ ] Add domain: `useevolua.com`
  - Vercel dirá: "Add A record 76.76.21.21 to Route53"
- [ ] Add domain: `www.useevolua.com`
  - Vercel dirá: "Add CNAME record cname.vercel-dns.com to Route53"

---

### **PASSO 3** - Configurar DNS no Route53
**Tempo estimado**: 5 minutos

AWS Console → Route53 → Hosted zone `useevolua.com`:

Records a criar:

| Name | Type | Value | TTL |
|------|------|-------|-----|
| useevolua.com (root) | A | 76.76.21.21 | 300 |
| www.useevolua.com | CNAME | cname.vercel-dns.com | 300 |
| api.useevolua.com | A | `<Elastic-IP>` | 300 |

> **Como obter Elastic IP**: `cd terraform && terraform output backend_public_ip`

- [ ] Record 1 criado (root A record)
- [ ] Record 2 criado (www CNAME)
- [ ] Record 3 criado (api A record)

---

### **PASSO 4** - Aguardar DNS Propagação
**Tempo estimado**: 5-10 minutos

Valide propagação:

```bash
# Execute no terminal
dig useevolua.com +short
# Esperado: 76.76.21.21

dig www.useevolua.com +short
# Esperado: cname.vercel-dns.com

dig api.useevolua.com +short
# Esperado: <seu-elastic-ip>
```

- [ ] DNS propagado (todos os `dig` retornam valores esperados)

---

### **PASSO 5** - Validar Frontend URL
**Tempo estimado**: 2 minutos

Abra em um navegador:

- [ ] https://useevolua.com → deve exibir landing page
- [ ] https://www.useevolua.com → deve redirecionar / funcionar
- [ ] Verifique SSL válido (fecha verde no navegador)

Se receber **DNS_PROBE_FINISHED_BAD_CONFIG**:
- Aguarde 5 mins mais
- Limpe cache DNS: `ipconfig /flushdns` (Windows)

---

### **PASSO 6** - Backend Health Check
**Tempo estimado**: 5 minutos (se backend estiver online)

Valide backend API:

```bash
# No seu computador/servidor qualquer com curl
curl -I https://api.useevolua.com/api/health

# Esperado: 200 OK
```

Se retornar **502 Bad Gateway**:
- SSH para EC2: `ssh -i evolua-key.pem ubuntu@<elastic-ip>`
- Verifique status: `sudo systemctl status nginx pm2`
- Logs: `sudo tail -n 200 /var/log/nginx/error.log`

- [ ] Backend respondendo com 200
- [ ] SSL válido em api.useevolua.com

---

### **PASSO 7** - Teste Integração Completa
**Tempo estimado**: 5 minutos

Executar script automatizado de health check:

```bash
bash scripts/infrastructure-check.sh
```

Checklist do output:

- [ ] DNS ✓
- [ ] Frontend HTTPS ✓
- [ ] Frontend SSL ✓
- [ ] Backend HTTPS ✓
- [ ] Backend SSL ✓
- [ ] API Health 200 ✓

---

## 🎯 Resultado Esperado

Após completar todos os passos:

| URL | Esperado | Atual |
|-----|----------|-------|
| https://useevolua.com | 200 + Landing Page | ⏳ |
| https://www.useevolua.com | 301/200 + Land. Page | ⏳ |
| https://api.useevolua.com/api/health | 200 + JSON | ⏳ |
| DNS useevolua.com | 76.76.21.21 | ⏳ |
| DNS api.useevolua.com | Elastic-IP | ⏳ |

---

## 🚨 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| **502 Bad Gateway** no Vercel | Aguarde 5 mins, limpe cache Vercel (Settings → Build Cache → Purge) |
| **DNS não resolve** | Aguarde 10 mins, execute `ipconfig /flushdns` |
| **SSL erro** | Aguarde DNS propagar, RemoveAdd domínio no Vercel |
| **Backend 502** | SSH → `sudo tail /var/log/nginx/error.log` → checar PM2/Node |
| **Conexão recusada** | Elastic IP + Security Group + Nginx firewall |

---

## 📊 Performance Monitoring

Après deploy, monitorar:

**Vercel Analytics**:
- https://vercel.com/dashboard → projeto → Analytics
- Verificar Core Web Vitals (LCP, FID, CLS)

**Backend Monitoring**:
- AWS CloudWatch (se configurado)
- PM2 Plus (opcional, `pm2 plus`)

---

## 📞 Próximas Fases (após deploy)

1. **SEO Optimization**
   - Add sitemap.xml, robots.txt
   - Structured data (JSON-LD)
   - Lighthouse score 90+

2. **Email Configuration**
   - SparkPost / SendGrid
   - Email templates (resend.com)
   - Notification pipeline

3. **CI/CD Refinement**
   - GitHub Actions → Auto-test + Auto-deploy
   - Staging environment
   - Rollback strategy

4. **Monitoring & Alerts**
   - Sentry (error tracking)
   - UptimeRobot (status page)
   - CloudWatch alarms

5. **Supabase Sync**
   - RLS policies
   - Auth setup
   - Row-level auth integration

---

## 📝 Documentação Gerada

Foram criados os seguintes arquivos neste workspace:

```
fono v2/
├── VERCEL-DEPLOY-GUIDE.md           ← Step-by-step Vercel setup
├── scripts/
│   └── infrastructure-check.sh       ← Automated health check
└── ROADMAP-DEPLOYMENT.md            ← Este arquivo (visão geral)
```

---

## ✨ Status Final

**Próxima ação**: Seguir PASSO 1 deste Roadmap (Vercel Import)

**Tempo total estimado**: **45-60 minutos** (incluindo propagação DNS)

**Suporte**: Se algum passo falhar, compartilhe error logs / screenshots

---

**Last Updated**: 26/03/2026  
**Next Review**: Após deploy bem-sucedido
