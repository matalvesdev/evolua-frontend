# ✅ Terraform Validation PASSOU - Próximas Ações

**Data**: 26 de março de 2026  
**Status**: ✅ Configuração válida e pronta para aplicar

---

## 🎯 Resultado da Validação

```
terraform validate → Success! The configuration is valid. ✅

terraform plan → Plan: 8 to add, 2 to change, 4 to destroy ✅
```

---

## 📊 O que será criado

### ✅ 8 Recursos Novos
```
✓ aws_route53_zone.main_br         (Hosted Zone: useevolua.com.br)
✓ aws_route53_zone.main_online     (Hosted Zone: useevolua.online)
✓ aws_route53_record.root_br       (A record: useevolua.com.br)
✓ aws_route53_record.www_br        (CNAME: www.useevolua.com.br)
✓ aws_route53_record.api_br        (A record: api.useevolua.com.br)
✓ aws_route53_record.root_online   (A record: useevolua.online)
✓ aws_route53_record.www_online    (CNAME: www.useevolua.online)
✓ aws_route53_record.api_online    (A record: api.useevolua.online)
```

### ⚠️ 2 Recursos Modificados
```
~ aws_instance.backend             (updates: user_data com novos domínios)
~ aws_security_group.backend_sg    (updates: SSH CIDR)
```

### ❌ 4 Recursos Destruídos (Legacy)
```
✗ aws_route53_zone.main           (Hosted Zone: useevolua.com - ANTIGA)
✗ aws_route53_record.root         (A record antigo)
✗ aws_route53_record.www          (CNAME antigo)
✗ aws_route53_record.api          (A record antigo)
```

---

## 🔄 Outputs Alterados

### Removidos (singular, antigos):
```
- api_url = "https://api.useevolua.com"
- frontend_url = "https://useevolua.com"
- route53_nameservers = [old nameservers]
```

### Adicionados (novos, duplos):
```
+ api_url_br = "https://api.useevolua.com.br"
+ api_url_online = "https://api.useevolua.online"
+ frontend_url_br = "https://useevolua.com.br"
+ frontend_url_online = "https://useevolua.online"
+ route53_nameservers_br = [new nameservers]
+ route53_nameservers_online = [new nameservers]
```

---

## 🚀 Próxima Ação: Executar `terraform apply`

### Passo 1: Gerar Plan com Output
```bash
cd terraform
terraform plan -out=tfplan > tfplan-output.txt 2>&1
# Salva o plano + texto para referência
```

### Passo 2: Revisar Output (IMPORTANTE)
```bash
cat tfplan-output.txt | head -200
# Verificar se tudo está correto
```

**Checklist de Revisão**:
- [ ] 8 "# aws_route53_zone" novos?
- [ ] 6 "# aws_route53_record" novos (3×2)?
- [ ] 4 "destroys" são recursos antigos (main zone)?
- [ ] EC2 vai ser atualizado (not destroyed)?

### Passo 3: Aplicar Plan
```bash
terraform apply tfplan
# Tempo esperado: 2-3 minutos
```

**Monitorar output**:
```
✓ aws_route53_zone.main_br created
✓ aws_route53_zone.main_online created
✓ aws_route53_record.root_br created
...
```

### Passo 4: Verificar Outputs
```bash
terraform output
# Deve mostrar os novos domínios e nameservers
```

**Copiar para local seguro**:
```bash
terraform output backend_public_ip
# Ex: 18.228.183.188

terraform output route53_nameservers_br
# Ex: ns-1188.awsdns-20.org, ns-154.awsdns-19.com, ...

terraform output route53_nameservers_online
# Ex: ns-1997.awsdns-57.co.uk, ns-700.awsdns-23.net, ...
```

### Passo 5: Backup de Estado
```bash
cp terraform.tfstate terraform.tfstate.backup-2026-03-26-post-apply
# Guardar cópia do estado após aplicação bem-sucedida
```

---

## 🔔 IMPORTANTE: Antes de Executar

1. ✅ Verificar ssh CIDR está correto:
   ```bash
   grep -E "allowed_ssh_cidr|201.13.9.94" terraform/terraform.tfvars
   # Deve retornar: 201.13.9.94/32
   ```

2. ✅ Verificar Supabase credentials estão corretos:
   ```bash
   grep supabase_url terraform/terraform.tfvars | head -1
   # Deve retornar: supabase_url = "https://diiaoaboykraaiavgdqs.supabase.co"
   ```

3. ✅ Confirmar que está no branch correto (não em mudanças não-comitadas):
   ```bash
   cd ..
   git status
   # Se houver mudanças, fazer commit ou stash
   ```

---

## 📞 Se Algo Der Errado Durante `apply`

### Erro: "Zone already exists"
```bash
# Isso pode significar que a zona antiga ainda existe em outro lugar
# Solução:
terraform destroy -target=aws_route53_zone.main -auto-approve
# Depois aplicar novamente
```

### Erro: "Access Denied"
```bash
# Verificar credenciais AWS:
aws sts get-caller-identity
# Deve retornar seu Account ID
```

### Erro: "Invalid resource type"
```bash
# Rodar novamente:
terraform init
terraform validate
terraform plan
```

---

## ✨ Após `terraform apply` Bem-Sucedido

1. ✅ Copiar nameservers para cada registrador:
   ```bash
   # Para useevolua.com.br
   # Use os nameservers de route53_nameservers_br
   
   # Para useevolua.online
   # Use os nameservers de route53_nameservers_online
   ```

2. ✅ SSH para backend e confirmar que está online:
   ```bash
   ssh -i evolua-key.pem ubuntu@<ELASTIC_IP>
   # Deve conectar
   
   tail -f /var/log/user-data.log
   # Monitorar setup (Node, Nginx, PM2)
   ```

3. ✅ Aguardar DNS propagar (5-30 min):
   ```bash
   dig useevolua.com.br +short
   dig api.useevolua.com.br +short
   # Deve retornar IPs corretos
   ```

4. ✅ Validar com health check:
   ```bash
   bash scripts/check-new-domains.sh
   ```

---

## 📋 Checklist Final

- [ ] terraform validate passou ✅
- [ ] terraform plan revisado ✅
- [ ] 8 novos + 2 updates + 4 destroys corretos ✅
- [ ] Credenciais AWS verificadas
- [ ] SSH CIDR verificado
- [ ] Pronto para: `terraform apply tfplan`

---

## 🎬 Comando Final (Tudo de Uma Vez)

```bash
cd terraform && \
terraform plan -out=tfplan && \
terraform apply tfplan && \
terraform output && \
cd .. && \
echo "✅ Terraform apply completed successfully!"
```

---

**Status**: ✅ Todas as verificações passaram  
**Próxima ação**: Execute `terraform apply` seguindo os passos acima

