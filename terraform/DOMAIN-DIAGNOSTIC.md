# 🔍 Diagnóstico de Domínios - 25 de março de 2026

## ✅ DNS Route53 (AWS) - CORRETO

```
Zona Hospedada:     Z07198801FOI7MV7LJJPN
Registros criados:

┌─────────────────────┬────────────────┐
│ Domínio             │ IP              │
├─────────────────────┼─────────────────┤
│ useevolua.com       │ 76.76.21.21     │ ← Vercel (frontend)
│ api.useevolua.com   │ 18.228.183.188  │ ← EC2 (backend) ✅
│ www.useevolua.com   │ CNAME → Vercel  │
└─────────────────────┴─────────────────┘

Nameservers AWS (Route53):
  • ns-1188.awsdns-20.org
  • ns-154.awsdns-19.com
  • ns-1997.awsdns-57.co.uk
  • ns-700.awsdns-23.net
```

---

## ❌ Registrador - PENDENTE

**Status**: Nameservers antigos apontam para registrador anterior  
**Ação Necessária**: Atualizar nameservers para Route53

### 🔧 Como Fazer

**Passo 1:** Acessar painel do registrador
- GoDaddy: https://www.godaddy.com
- Namecheap: https://www.namecheap.com
- RegistroBR: https://registro.br
- Outro: Procure por "Nameserver" ou "DNS"

**Passo 2:** Localize configuração de Nameservers
- Domain Settings → DNS
- Name Servers → Custom DNS
- DNS Configuration

**Passo 3:** Copie EXATAMENTE estes 4:
```
ns-1188.awsdns-20.org
ns-154.awsdns-19.com
ns-1997.awsdns-57.co.uk
ns-700.awsdns-23.net
```

**Passo 4:** Salve e aguarde propagação (5-30 min)

---

## ⏱️ Timeline de Propagação

```
0-5 min    : Alguns resolvers já veem o novo DNS
5-10 min   : Maioria propaga
10-30 min  : Propagação global
30-48 h    : Garantido em todo mundo
```

**Para testar durante propagação:**
```bash
# Teste direto no nameserver AWS
dig useevolua.com @ns-1188.awsdns-20.org
dig api.useevolua.com @ns-1188.awsdns-20.org
```

---

## ✅ Após Atualizar Nameservers

### Validar DNS
```bash
# Esperar 10 min, depois:
nslookup useevolua.com
nslookup api.useevolua.com

# Esperado:
# useevolua.com:     76.76.21.21
# api.useevolua.com: 18.228.183.188
```

### Testar HTTPS
```bash
# Frontend (Vercel)
curl -I https://useevolua.com

# Backend (EC2)
curl -I https://api.useevolua.com/api/health
```

---

## 📋 Status Atual (25 Mar 2026 - 00:10 UTC)

| Item | Status | Detalhes |
|------|--------|----------|
| AWS Route53 | ✅ Criado | Registros corretos |
| EC2 Backend | ✅ Running | IP: 18.228.183.188 |
| Nameservers | ⏳ Pendente | Registrador não atualizado |
| DNS Global | ⏳ Não prop. | Aguarda nameservers |
| SSL Certbot | ⏳ Aguarda DNS | Vai funcionar após DNS |

---

## 🚀 Próximos Passos (Ordem)

1. **[ ]** Atualizar nameservers no registrador (5 min)
2. **[ ]** Aguardar propagação DNS (5-30 min)
3. **[ ]** Validar DNS com `nslookup` (imediato)
4. **[ ]** Rodar certbot no EC2 para SSL (2 min)
5. **[ ]** Testar `/api/health` (imediato)

---

## 🆘 Se DNS Não Propagar

### Checker Online
- https://dnschecker.org - ver propagação global
- https://mxtoolbox.com - debug nameservers
- https://www.whatsmydns.net - propagação visual

### Debug Manual
```bash
# Ver nameservers do domínio
dig useevolua.com NS

# Forçar refresh local
sudo systemctl restart systemd-resolved

# Query específico
dig useevolua.com @1.1.1.1       # Cloudflare
dig useevolua.com @8.8.8.8       # Google
dig useevolua.com @ns-1188...    # AWS NS
```

---

**Gerado**: 25 de março de 2026
