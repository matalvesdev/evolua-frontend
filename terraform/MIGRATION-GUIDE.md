# 🔄 Guia de Migração de Infraestrutura

## 📋 Visão Geral

Este guia vai te ajudar a migrar a infraestrutura do Evolua CRM para AWS usando Terraform.

**Tempo estimado:** 1-2 horas  
**Downtime:** ~10-15 minutos (durante troca de DNS)

---

## ⚠️ Antes de Começar

### Checklist Pré-Migração

- [ ] Backup completo do banco de dados Supabase
- [ ] Backup de arquivos do Supabase Storage
- [ ] Lista de variáveis de ambiente atuais
- [ ] Acesso ao registrador de domínio
- [ ] Credenciais AWS configuradas
- [ ] Terraform instalado
- [ ] Comunicação com usuários sobre manutenção

---

## 🚀 Passo a Passo da Migração

### Fase 1: Preparação (30 minutos)

#### 1.1 Configurar AWS CLI

Siga o guia: [`AWS-SETUP.md`](AWS-SETUP.md)

```powershell
# Instalar AWS CLI
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# Configurar credenciais
aws configure

# Verificar
aws sts get-caller-identity
```

#### 1.2 Criar Chave SSH

```powershell
# Criar chave
aws ec2 create-key-pair `
  --key-name evolua-key `
  --query 'KeyMaterial' `
  --output text > evolua-key.pem

# Verificar
Get-Content evolua-key.pem
```

#### 1.3 Obter Informações Necessárias

```powershell
# Seu IP público
curl https://ifconfig.me
# Anote: _______________

# Credenciais Supabase
# URL: https://app.supabase.com/ → Settings → API
# Anote URL: _______________
# Anote anon key: _______________
```

#### 1.4 Configurar terraform.tfvars

```powershell
cd terraform
cp terraform.tfvars.example terraform.tfvars
notepad terraform.tfvars
```

Preencha TODOS os valores:
- `aws_region` = "sa-east-1" (recomendado para Brasil)
- `allowed_ssh_cidr` = "SEU_IP/32"
- `supabase_url` = "https://xxx.supabase.co"
- `supabase_anon_key` = "eyJhbGc..."
- `github_repo` = "https://github.com/seu-usuario/evolua-crm.git"
- `alert_email` = "seu@email.com"
- `key_name` = "evolua-key"

---

### Fase 2: Provisionar Infraestrutura (15 minutos)

#### 2.1 Inicializar Terraform

```powershell
terraform init
```

**Output esperado:**
```
Terraform has been successfully initialized!
```

#### 2.2 Validar Configuração

```powershell
terraform validate
```

**Output esperado:**
```
Success! The configuration is valid.
```

#### 2.3 Planejar Mudanças

```powershell
terraform plan
```

**Revise cuidadosamente:**
- 13 recursos serão criados
- Nenhum recurso será destruído
- Custos estimados

#### 2.4 Aplicar Infraestrutura

```powershell
terraform apply
```

Digite `yes` quando solicitado.

**Tempo:** ~5-10 minutos

#### 2.5 Salvar Outputs

```powershell
terraform output > outputs.txt
notepad outputs.txt
```

Anote:
- IP público: _______________
- Name servers: _______________

---

### Fase 3: Aguardar Setup Automático (15 minutos)

#### 3.1 Conectar ao Servidor

```powershell
ssh -i evolua-key.pem ubuntu@<IP_PUBLICO>
```

Se houver erro de permissão no Windows:
```powershell
icacls evolua-key.pem /inheritance:r
icacls evolua-key.pem /grant:r "$($env:USERNAME):(R)"
```

#### 3.2 Monitorar Progresso

```bash
tail -f /var/log/cloud-init-output.log
```

**Aguarde ver:**
```
✅ Setup Inicial Completo!
```

**Tempo:** ~10-15 minutos

#### 3.3 Verificar Serviços

```bash
# Verificar PM2
pm2 status
# Deve mostrar: evolua-crm | online

# Verificar Nginx
sudo systemctl status nginx
# Deve mostrar: active (running)

# Testar aplicação
curl http://localhost:3000
# Deve retornar HTML
```

---

### Fase 4: Configurar DNS (Propagação: 1-48h)

#### 4.1 Obter Name Servers

```powershell
terraform output route53_nameservers
```

Copie os 4 name servers:
```
ns-1234.awsdns-12.org
ns-5678.awsdns-34.com
ns-9012.awsdns-56.net
ns-3456.awsdns-78.co.uk
```

#### 4.2 Atualizar Registrador de Domínio

**Registro.br:**
1. Acesse: https://registro.br/
2. Login → Domínios → useevolua.com
3. DNS → Alterar Servidores DNS
4. Selecione "Usar servidores DNS externos"
5. Cole os 4 name servers
6. Salvar

**Outros registradores:**
- Procure por "Nameservers" ou "DNS Servers"
- Substitua pelos name servers da AWS

#### 4.3 Verificar Propagação

```powershell
# Verificar name servers
nslookup -type=NS useevolua.com

# Verificar A record
nslookup app.evolua.com

# Forçar DNS público
nslookup app.evolua.com 8.8.8.8
```

**Tempo de propagação:**
- Mínimo: 5 minutos
- Típico: 1-2 horas
- Máximo: 48 horas

⏰ **Aguarde o DNS propagar antes de continuar!**

---

### Fase 5: Configurar SSL (5 minutos)

⚠️ **IMPORTANTE:** Só faça isso APÓS o DNS propagar!

#### 5.1 Conectar ao Servidor

```powershell
ssh -i evolua-key.pem ubuntu@<IP_PUBLICO>
```

#### 5.2 Configurar SSL para app.evolua.com

```bash
sudo certbot --nginx -d app.evolua.com
```

**Responda:**
- Email: seu@email.com
- Termos: A (Agree)
- Compartilhar email: N (No)
- Redirect HTTP to HTTPS: 2 (Yes)

**Output esperado:**
```
Successfully received certificate.
Congratulations! You have successfully enabled HTTPS on https://app.evolua.com
```

#### 5.3 Configurar SSL para useevolua.com

```bash
sudo certbot --nginx -d useevolua.com -d www.useevolua.com
```

Responda as mesmas perguntas.

#### 5.4 Verificar Renovação Automática

```bash
sudo systemctl status certbot.timer
# Deve mostrar: active (waiting)

sudo certbot renew --dry-run
# Deve mostrar: Congratulations, all simulated renewals succeeded
```

---

### Fase 6: Testes Finais (10 minutos)

#### 6.1 Testar Aplicação

```powershell
# Testar app
curl https://app.evolua.com

# Testar landing
curl https://useevolua.com

# Testar redirect HTTP → HTTPS
curl -I http://app.evolua.com
# Deve retornar: 301 Moved Permanently
```

#### 6.2 Testar no Navegador

Abra:
- https://app.evolua.com
- https://useevolua.com
- https://www.useevolua.com

**Verifique:**
- [ ] Página carrega
- [ ] Cadeado verde (SSL válido)
- [ ] Login funciona
- [ ] CRUD de pacientes funciona
- [ ] Upload de arquivos funciona
- [ ] Todas as funcionalidades principais

#### 6.3 Verificar SSL

Acesse: https://www.ssllabs.com/ssltest/

Digite: `app.evolua.com`

**Resultado esperado:** A ou A+

#### 6.4 Verificar Monitoramento

```powershell
# Obter URL do dashboard
terraform output cloudwatch_dashboard_url
```

Abra no navegador e verifique:
- [ ] CPU Utilization
- [ ] Network In/Out
- [ ] Status Checks

#### 6.5 Confirmar Email SNS

1. Verifique seu email
2. Procure por "AWS Notification - Subscription Confirmation"
3. Clique em "Confirm subscription"

---

### Fase 7: Atualizar Variáveis de Ambiente (5 minutos)

Se você tinha variáveis de ambiente adicionais na infraestrutura antiga:

#### 7.1 Conectar ao Servidor

```powershell
ssh -i evolua-key.pem ubuntu@<IP_PUBLICO>
```

#### 7.2 Editar .env.production

```bash
cd /home/ubuntu/evolua-crm/frontend-evolua
nano .env.production
```

Adicione variáveis adicionais se necessário:
```env
NEXT_PUBLIC_OPENAI_API_KEY=sk-xxx
NEXT_PUBLIC_WHATSAPP_API_KEY=xxx
# etc...
```

#### 7.3 Reiniciar Aplicação

```bash
pm2 restart evolua-crm
pm2 save
```

---

## ✅ Checklist de Conclusão

### Infraestrutura
- [ ] EC2 rodando
- [ ] Elastic IP associado
- [ ] Security Groups configurados
- [ ] Route53 DNS configurado
- [ ] CloudWatch monitorando
- [ ] SNS alertas configurados

### Aplicação
- [ ] Next.js rodando com PM2
- [ ] Nginx configurado
- [ ] SSL configurado (Let's Encrypt)
- [ ] Todas as funcionalidades testadas
- [ ] Variáveis de ambiente configuradas

### DNS
- [ ] Name servers atualizados
- [ ] DNS propagado
- [ ] app.evolua.com resolvendo
- [ ] useevolua.com resolvendo
- [ ] www.useevolua.com resolvendo

### Monitoramento
- [ ] CloudWatch Dashboard acessível
- [ ] Alarmes configurados
- [ ] Email SNS confirmado
- [ ] Logs funcionando

### Segurança
- [ ] SSH restrito ao seu IP
- [ ] HTTPS obrigatório
- [ ] Firewall configurado
- [ ] SSL A+ rating

---

## 🔄 Rollback (Se Necessário)

Se algo der errado e você precisar voltar:

### Opção 1: Manter Infraestrutura Antiga

1. Não atualize os name servers
2. Mantenha infraestrutura antiga rodando
3. Investigue e corrija problemas
4. Tente novamente quando estiver pronto

### Opção 2: Destruir Nova Infraestrutura

```powershell
cd terraform
terraform destroy
```

Digite `yes` quando solicitado.

**Isso vai deletar:**
- EC2 instance
- Elastic IP
- Security Groups
- Route53 Hosted Zone
- CloudWatch resources
- SNS topic

⚠️ **CUIDADO:** Isso é irreversível!

---

## 📊 Comparação: Antes vs Depois

### Antes (Infraestrutura Antiga)

| Aspecto | Status |
|---------|--------|
| Plataforma | ? |
| Custo | ? |
| Escalabilidade | ? |
| Monitoramento | ? |
| IaC | ❌ |

### Depois (Nova Infraestrutura)

| Aspecto | Status |
|---------|--------|
| Plataforma | AWS EC2 |
| Custo | ~$0.50/mês (12 meses) |
| Escalabilidade | ✅ Fácil upgrade |
| Monitoramento | ✅ CloudWatch |
| IaC | ✅ Terraform |

---

## 🆘 Problemas Comuns

### DNS não propaga

**Sintoma:** `nslookup app.evolua.com` não retorna IP

**Solução:**
1. Verificar name servers no registrador
2. Aguardar mais tempo (até 48h)
3. Limpar cache DNS: `ipconfig /flushdns`

### SSL falha

**Sintoma:** `certbot` retorna erro

**Solução:**
1. Verificar DNS propagou: `nslookup app.evolua.com`
2. Verificar porta 80 aberta: `sudo netstat -tulpn | grep :80`
3. Aguardar DNS propagar completamente

### Aplicação não responde

**Sintoma:** `curl https://app.evolua.com` retorna erro

**Solução:**
```bash
# Conectar ao servidor
ssh -i evolua-key.pem ubuntu@<IP>

# Verificar PM2
pm2 status
pm2 logs evolua-crm

# Verificar Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log

# Reiniciar
pm2 restart evolua-crm
sudo systemctl restart nginx
```

---

## 📞 Suporte

### Documentação
- [`AWS-SETUP.md`](AWS-SETUP.md) - Configuração AWS
- [`FIRST-DEPLOY.md`](FIRST-DEPLOY.md) - Primeiro deploy
- [`README.md`](README.md) - Documentação completa

### Logs
- User data: `/var/log/cloud-init-output.log`
- PM2: `pm2 logs evolua-crm`
- Nginx: `/var/log/nginx/error.log`
- CloudWatch: Dashboard + Alarms

---

## 🎉 Migração Completa!

Parabéns! Sua infraestrutura foi migrada com sucesso para AWS! 🚀

**Próximos passos:**
1. Monitorar aplicação por 24-48h
2. Configurar backups automáticos
3. Implementar CI/CD com GitHub Actions
4. Considerar staging environment

---

**Última atualização:** 09/03/2024  
**Versão:** 1.0.0
