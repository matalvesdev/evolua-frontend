# 🚀 Resumo: Migração de Domínios - Status Atual

**Data**: 26 de março de 2026  
**Status**: ✅ Preparação Completa - Pronto para Execução  
**Objetivo**: Migrar de `useevolua.com` → `useevolua.com.br` + `useevolua.online`

---

## 📊 O que já temos

✅ **Frontend**:
- Deploy ativo na Vercel
- Build local validado (`npm run build` ✓)
- Ready para adicionar novos domínios

✅ **Backend**:
- EC2 t2.micro rodando (free tier)
- Elastic IP alocado
- Nginx + PM2 + Node.js configurado
- Supabase PostgreSQL conectado

✅ **Infraestrutura**:
- Terraform IaC pronto
- Route53 configurado (mas com domínio antigo)
- Security Groups em pé

---

## 📝 Arquivos de Guia Criados

| Arquivo | Propósito |
|---------|-----------|
| **DOMAIN-MIGRATION-GUIDE.md** | Guia completo com todos os detalhes técnicos |
| **MIGRATION-CHECKLIST-QUICK.md** | Checklist passo-a-passo para executar rapidinho | 
| **terraform/route53.tf** | ✅ Já atualizado com novos domínios |
| **scripts/check-new-domains.sh** | Script de validação automatizado |

---

## 🔄 Estrutura Nova (após migração)

```
useevolua.com.br ──┐
useevolua.online ──┤──→ Vercel (Frontend Landing Page)
www.* ─────────────┘     76.76.21.21

api.useevolua.com.br ──┐
api.useevolua.online ──┤──→ EC2 (Backend NestJS)
                       │   <Elastic-IP>
                       └──→ Nginx + PM2
```

---

## ⏱️ Timeline de Implementação

| Fase | Tempo | Status |
|------|-------|--------|
| 1. Vercel (add domínios) | 5 min | ⏳ Pendente |
| 2. Registrador (nameservers) | 5 min | ⏳ Pendente |
| 3. AWS Route53 (zones) | 10 min | ⏳ Pendente |
| 4. AWS Route53 (records) | 10 min | ⏳ Pendente |
| 5. Terraform apply | 5 min | ⏳ Pendente |
| 6. DNS propagação | 5-30 min | ⏳ Pendente |
| 7. EC2 SSL (certbot) | 5 min | ⏳ Pendente |
| 8. Env vars + redeploy | 2 min | ⏳ Pendente |
| 9. Validação final | 5 min | ⏳ Pendente |
| **Total** | **45-60 min** | ⏳ Pronto |

---

## 🎯 Próximas 3 Ações

### 1️⃣ Ler MIGRATION-CHECKLIST-QUICK.md
Tem o passo-a-passo direto, sem muitos detalhes técnicos

### 2️⃣ Executar Passos 1-4 (Vercel + Registrador + Route53)
- Adicionar 4 domínios em Vercel
- Atualizar nameservers no registrador
- Criar 2 hosted zones em Route53
- Criar 6 DNS records

### 3️⃣ Executar Terraform
```bash
cd terraform
terraform plan
terraform apply
```

### 4️⃣ Aguardar + Validar
```bash
bash scripts/check-new-domains.sh
# Deve retornar todos ✓ GREEN
```

---

## 🔍 Se precisar de mais detalhes

- **Técnico completo**: leia `DOMAIN-MIGRATION-GUIDE.md`
- **Passo-a-passo simple**: leia `MIGRATION-CHECKLIST-QUICK.md`
- **Troubleshooting**: seção "Se algo falhar" no checklist

---

## 📞 Suporte

Se alguma etapa não funcionar, compartilhe:
1. Qual etapa falhou?
2. Qual erro apareceu? (screenshot / output)
3. Output do health check:
   ```bash
   bash scripts/check-new-domains.sh
   ```

---

## ✨ Depois da Migração

- [ ] Monitorar tráfego em Vercel Analytics (2-3 dias)
- [ ] Monitorar backend em AWS CloudWatch
- [ ] Remover domínio antigo (após 2-4 semanas de 301 redirects)
- [ ] Atualizar documentos (SEO, redes sociais, etc)

---

**Status Final**: ✅ Tudo pronto para começar! Você pode iniciar os passos quando quiser.

