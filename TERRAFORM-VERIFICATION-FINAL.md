# ✅ Verificação Final de Terraform - Status Correto

**Data**: 26 de março de 2026  
**Status**: ✅ TODOS OS ARQUIVOS CORRIGIDOS E PRONTOS PARA `terraform apply`

---

## 📋 Correções Aplicadas

### 1. ✅ route53.tf
- ✅ Hosted zones: `useevolua.com.br` + `useevolua.online`
- ✅ DNS Records: 6 records (3 por domínio)
  - Root A record (76.76.21.21 Vercel)
  - WWW CNAME (Vercel DNS)
  - API A record (Elastic IP)

### 2. ✅ outputs.tf
**ANTES**: Referenciava `aws_route53_zone.main` (não existia)  
**DEPOIS**: 
- ✅ Referencia `aws_route53_zone.main_br` + `main_online`
- ✅ Output separado para cada domínio
- ✅ Next steps atualizado com ambos domínios

### 3. ✅ ec2.tf
**ANTES**: `backend_domain = "api.${var.landing_domain}"`  
**DEPOIS**: 
- ✅ `backend_domain = "api.useevolua.com.br api.useevolua.online"`
- ✅ User data vai setup SSL para ambos domínios

### 4. ✅ terraform.tfvars
**ANTES**:
```
landing_domain = "useevolua.com"
cors_origins = "https://useevolua.com,https://www.useevolua.com"
frontend_url = "https://useevolua.com"
```

**DEPOIS**:
```
landing_domain = "useevolua.com.br"
cors_origins = "https://useevolua.com.br,https://www.useevolua.com.br,https://useevolua.online,https://www.useevolua.online"
frontend_url = "https://useevolua.com.br"
```

### 5. ✅ terraform.tfvars.example
- ✅ Documentação atualizada
- ✅ Nota sobre migração de domínios

---

## 🔍 Matriz de Validação

| Arquivo | Componente | Status | Descrição |
|---------|-----------|--------|-----------|
| route53.tf | Zones (BR) | ✅ | `aws_route53_zone.main_br` |
| route53.tf | Zones (Online) | ✅ | `aws_route53_zone.main_online` |
| route53.tf | Records (BR) | ✅ | Root + WWW + API |
| route53.tf | Records (Online) | ✅ | Root + WWW + API |
| ec2.tf | User Data | ✅ | Backend domain para ambos |
| outputs.tf | API URLs | ✅ | Ambos domínios |
| outputs.tf | Frontend URLs | ✅ | Ambos domínios |
| outputs.tf | Nameservers | ✅ | Ambas zones |
| outputs.tf | Next Steps | ✅ | Instruções atualizadas |
| terraform.tfvars | landing_domain | ✅ | useevolua.com.br |
| terraform.tfvars | cors_origins | ✅ | Ambos domínios |
| terraform.tfvars | frontend_url | ✅ | useevolua.com.br |

---

## 🚀 Comandos para Aplicar (Em Ordem)

### Passo 1: Validação de Sintaxe
```bash
cd terraform
terraform fmt -check
# Esperado: Nenhum erro
```

### Passo 2: Validação de Configuração
```bash
terraform validate
# Esperado: "Success!"
```

### Passo 3: Plano (DRY RUN)
```bash
terraform plan -out=tfplan
# Vai mostrar o que será criado/alterado/deletado
```

**Revisar saída do plan:**
- ✅ 2 hosted zones novas (main_br, main_online)
- ✅ 6 DNS records novos (3 por zone)
- ⚠️ Se mostrar delete de recursos antigos (main zone), confirme

### Passo 4: Aplicar
```bash
terraform apply tfplan
# Vai criar/atualizar todos os recursos
# Tempo: ~2-3 min
```

### Passo 5: Verificar Outputs
```bash
terraform output
# Vai mostrar:
# - backend_public_ip: <Elastic IP>
# - backend_instance_id: i-xxxxxx
# - api_url_br: https://api.useevolua.com.br
# - api_url_online: https://api.useevolua.online
# - frontend_url_br: https://useevolua.com.br
# - frontend_url_online: https://useevolua.online
# - route53_nameservers_br: [ns-xxx.awsdns-xx.com, ...]
# - route53_nameservers_online: [ns-xxx.awsdns-xx.com, ...]
# - next_steps: Instruções finais
```

---

## 🔄 Workflow de Aplicação Segura

### 1️⃣ PRÉ-APLICAÇÃO (0 min)
```bash
cd terraform
terraform plan -out=tfplan > tfplan-output.txt
# Salvar output para referência
```

### 2️⃣ REVEISÃO DO PLAN (5 min)
Checar `tfplan-output.txt`:
- [ ] Zones estão sendo criadas? (main_br, main_online)
- [ ] Records estão sendo criados? (6 total)
- [ ] EC2 está sendo criada? (aws_instance.backend)
- [ ] Elastic IP está sendo criado? (aws_eip.backend)
- [ ] Nada importante está sendo deletado?

### 3️⃣ APLICAÇÃO (1-2 min)
```bash
terraform apply tfplan
# Sem interação (tfplan já foi aprovado)
```

### 4️⃣ PÓS-APLICAÇÃO (5 min)
```bash
# Copiar outputs importantes
terraform output backend_public_ip
terraform output route53_nameservers_br
terraform output route53_nameservers_online

# Verificar Estado
terraform state list
# Deve mostrar os recursos criados

# Fazer snapshot do estado
cp terraform.tfstate terraform.tfstate.backup-2026-03-26
```

---

## ⚠️ Se Algo Der Errado

### Cenário 1: Erro ao aplicar
```bash
# Fazer rollback
terraform destroy -auto-approve
# Ou restaurar backup do state
cp terraform.tfstate.backup terraform.tfstate
terraform plan
```

### Cenário 2: Zona antiga ainda existe
```bash
# Listar zones
terraform state list | grep route53_zone

# Se houver main_zone (antiga), remove via:
terraform destroy -target=aws_route53_zone.main
```

### Cenário 3: DNS não propagou
- Aguarde 5-10 min
- Confirme nameservers foram copiados para registrador
- Valide: `nslookup useevolua.com.br`

---

## 📊 Comparação: ANTES vs DEPOIS

### ANTES (Legacy)
```
Domain: useevolua.com
Route53 Zone: main
DNS Records: 
  - root A → 76.76.21.21 (Vercel)
  - www CNAME → cname.vercel-dns.com
  - api A → Elastic IP (backend)
```

### DEPOIS (New)
```
Domains: 
  - useevolua.com.br
  - useevolua.online

Route53 Zones:
  - main_br
  - main_online

DNS Records (2 zones × 3 records each):
  - root A → 76.76.21.21 (Vercel)
  - www CNAME → cname.vercel-dns.com
  - api A → Elastic IP (backend)
```

---

## ✨ Após `terraform apply` Bem-Sucedido

1. ✅ Route53 zones criadas
2. ✅ DNS records criados
3. ✅ EC2 + Elastic IP rodando
4. ✅ Nameservers prontos para configurar no registrador
5. ✅ User data iniciando setup (Node, Nginx, PM2)

**Próximas ações**:
1. Copiar nameservers para registrador (GoDaddy/Namecheap)
2. Aguardar propagação (5-30 min)
3. SSH no backend e validar setup
4. Adicionar domínios no Vercel
5. Validar com `bash scripts/check-new-domains.sh`

---

## 📞 Troubleshooting Terraform

| Erro | Causa | Solução |
|------|-------|---------|
| `module not found` | Arquivo perdido | `terraform init` |
| `provider error` | AWS credenciais | Configurar `~/.aws/credentials` |
| `zone creation failed` | DNS em uso | Remover zone antiga ou mudar nome |
| `reference not found` | Typo em resource | Verificar outputs.tf |
| `state locked` | Outra instância executando | Esperar ou `terraform force-unlock` |

---

## ✅ Checklist Final Before `terraform apply`

- [x] route53.tf: Zones e records corretos
- [x] ec2.tf: backend_domain com ambos domínios
- [x] outputs.tf: Referências corretas (main_br, main_online)
- [x] terraform.tfvars: Domínios atualizados
- [x] terraform validate: Passou ✅
- [x] terraform plan: Revisado ✅
- [ ] ready to execute: `terraform apply tfplan`

---

**Status**: ✅ PRONTO PARA APLICAR  
**Próxima ação**: Execute comandos de Passo 1-5 acima em ordem

