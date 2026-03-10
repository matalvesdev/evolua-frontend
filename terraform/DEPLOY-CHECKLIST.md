# ✅ Checklist de Deploy - Evolua CRM

## 📋 Pré-requisitos

### 1. Ferramentas Instaladas
- [ ] Terraform instalado (`terraform version`)
- [ ] AWS CLI instalado (`aws --version`)
- [ ] AWS CLI configurado (`aws sts get-caller-identity`)
- [ ] Git instalado

### 2. Credenciais AWS
- [ ] Access Key ID configurada
- [ ] Secret Access Key configurada
- [ ] Região configurada (us-east-1)
- [ ] Permissões adequadas (EC2, Route53, CloudWatch, SNS)

### 3. Chave SSH
- [ ] Chave SSH criada na AWS (`evolua-key`)
- [ ] Arquivo `.pem` baixado e com permissões corretas (`chmod 400`)

### 4. Informações Necessárias
- [ ] Seu IP público (https://ifconfig.me)
- [ ] URL do Supabase
- [ ] Chave anônima do Supabase
- [ ] URL do repositório GitHub
- [ ] Email para alertas

## 🚀 Deploy

### Fase 1: Configuração (5 minutos)

- [ ] Navegar para o diretório terraform
  ```bash
  cd terraform
  ```

- [ ] Copiar arquivo de exemplo
  ```bash
  cp terraform.tfvars.example terraform.tfvars
  ```

- [ ] Editar `terraform.tfvars` com seus valores
  ```bash
  nano terraform.tfvars
  ```

- [ ] Verificar valores obrigatórios:
  - [ ] `allowed_ssh_cidr` (seu IP/32)
  - [ ] `supabase_url`
  - [ ] `supabase_anon_key`
  - [ ] `github_repo`
  - [ ] `alert_email`
  - [ ] `key_name` (nome da chave SSH)

### Fase 2: Inicialização (2 minutos)

- [ ] Inicializar Terraform
  ```bash
  terraform init
  ```

- [ ] Validar configuração
  ```bash
  terraform validate
  ```

- [ ] Verificar formatação
  ```bash
  terraform fmt -check
  ```

### Fase 3: Planejamento (3 minutos)

- [ ] Executar plan
  ```bash
  terraform plan
  ```

- [ ] Revisar recursos a serem criados:
  - [ ] 1 EC2 instance (t2.micro)
  - [ ] 1 Elastic IP
  - [ ] 2 Security Groups
  - [ ] 1 Route53 Hosted Zone
  - [ ] 4 Route53 Records (A records)
  - [ ] 2 CloudWatch Alarms
  - [ ] 1 SNS Topic
  - [ ] 1 SNS Subscription
  - [ ] 1 CloudWatch Dashboard

- [ ] Verificar custos estimados
  - [ ] Free tier: $0/mês (12 meses)
  - [ ] Route53: ~$0.50/mês
  - [ ] Após free tier: ~$12-15/mês

### Fase 4: Aplicação (5-10 minutos)

- [ ] Aplicar mudanças
  ```bash
  terraform apply
  ```

- [ ] Digitar `yes` quando solicitado

- [ ] Aguardar conclusão (5-10 minutos)

- [ ] Salvar outputs
  ```bash
  terraform output > outputs.txt
  ```

### Fase 5: Configuração DNS (1-48 horas)

- [ ] Copiar name servers
  ```bash
  terraform output route53_nameservers
  ```

- [ ] Acessar registrador de domínio (Registro.br, GoDaddy, etc)

- [ ] Configurar name servers:
  - [ ] ns-xxxx.awsdns-xx.org
  - [ ] ns-xxxx.awsdns-xx.com
  - [ ] ns-xxxx.awsdns-xx.net
  - [ ] ns-xxxx.awsdns-xx.co.uk

- [ ] Aguardar propagação DNS (verificar com `dig`)
  ```bash
  dig NS useevolua.com
  dig A app.evolua.com
  ```

### Fase 6: Setup do Servidor (10-15 minutos)

- [ ] Obter IP público
  ```bash
  terraform output app_public_ip
  ```

- [ ] Conectar via SSH
  ```bash
  ssh -i evolua-key.pem ubuntu@<IP_PUBLICO>
  ```

- [ ] Monitorar progresso do user-data
  ```bash
  tail -f /var/log/cloud-init-output.log
  ```

- [ ] Aguardar mensagem: "✅ Setup Inicial Completo!"

- [ ] Verificar arquivo de status
  ```bash
  cat /home/ubuntu/setup-complete.txt
  ```

### Fase 7: Configuração SSL (5 minutos)

- [ ] Aguardar DNS propagar (testar com `dig`)

- [ ] Configurar SSL para app.evolua.com
  ```bash
  sudo certbot --nginx -d app.evolua.com
  ```

- [ ] Configurar SSL para useevolua.com
  ```bash
  sudo certbot --nginx -d useevolua.com -d www.useevolua.com
  ```

- [ ] Responder perguntas do Certbot:
  - [ ] Email: seu@email.com
  - [ ] Termos: A (Agree)
  - [ ] Redirect HTTP to HTTPS: 2 (Yes)

### Fase 8: Verificação (5 minutos)

- [ ] Verificar PM2
  ```bash
  pm2 status
  ```

- [ ] Verificar logs da aplicação
  ```bash
  pm2 logs evolua-crm --lines 50
  ```

- [ ] Verificar Nginx
  ```bash
  sudo systemctl status nginx
  ```

- [ ] Testar aplicação localmente
  ```bash
  curl http://localhost:3000
  ```

- [ ] Testar aplicação externamente
  ```bash
  curl https://app.evolua.com
  curl https://useevolua.com
  ```

- [ ] Abrir no navegador:
  - [ ] https://app.evolua.com
  - [ ] https://useevolua.com

### Fase 9: Monitoramento (5 minutos)

- [ ] Confirmar inscrição SNS (verificar email)

- [ ] Acessar CloudWatch Dashboard
  ```bash
  terraform output cloudwatch_dashboard_url
  ```

- [ ] Verificar métricas:
  - [ ] CPU Utilization
  - [ ] Network In/Out
  - [ ] Status Checks

- [ ] Testar alarmes (opcional)

### Fase 10: Documentação (5 minutos)

- [ ] Documentar IPs e URLs
  - [ ] IP Público: _______________
  - [ ] App URL: https://app.evolua.com
  - [ ] Landing URL: https://useevolua.com

- [ ] Salvar credenciais em local seguro
  - [ ] Chave SSH: evolua-key.pem
  - [ ] Terraform state: terraform.tfstate

- [ ] Adicionar ao .gitignore:
  - [ ] terraform.tfvars
  - [ ] *.tfstate
  - [ ] *.tfstate.backup
  - [ ] .terraform/
  - [ ] *.pem

## 🔒 Segurança

### Pós-Deploy

- [ ] Verificar Security Groups
  ```bash
  aws ec2 describe-security-groups --group-ids <SG_ID>
  ```

- [ ] Confirmar SSH restrito ao seu IP

- [ ] Verificar SSL configurado (A+ no SSL Labs)
  - https://www.ssllabs.com/ssltest/

- [ ] Configurar renovação automática SSL
  ```bash
  sudo systemctl status certbot.timer
  ```

- [ ] Testar renovação SSL
  ```bash
  sudo certbot renew --dry-run
  ```

## 📊 Monitoramento Contínuo

### Diário
- [ ] Verificar uptime da aplicação
- [ ] Verificar logs de erro
- [ ] Verificar uso de recursos (CPU, RAM, Disk)

### Semanal
- [ ] Revisar alertas CloudWatch
- [ ] Verificar backups (se configurados)
- [ ] Atualizar dependências (npm outdated)

### Mensal
- [ ] Revisar custos AWS
- [ ] Atualizar sistema operacional
- [ ] Revisar logs de segurança
- [ ] Testar disaster recovery

## 🔄 Atualizações

### Deploy de Nova Versão

- [ ] Conectar ao servidor
  ```bash
  ssh -i evolua-key.pem ubuntu@<IP>
  ```

- [ ] Executar script de deploy
  ```bash
  /home/ubuntu/deploy.sh
  ```

- [ ] Verificar aplicação
  ```bash
  pm2 status
  curl https://app.evolua.com
  ```

### Atualizar Infraestrutura

- [ ] Modificar arquivos .tf

- [ ] Executar plan
  ```bash
  terraform plan
  ```

- [ ] Aplicar mudanças
  ```bash
  terraform apply
  ```

## 🆘 Troubleshooting

### Problema: Terraform apply falha

- [ ] Verificar credenciais AWS
  ```bash
  aws sts get-caller-identity
  ```

- [ ] Verificar permissões IAM

- [ ] Verificar quotas AWS (EC2, EIP)

- [ ] Verificar logs
  ```bash
  terraform show
  ```

### Problema: DNS não propaga

- [ ] Verificar name servers configurados
  ```bash
  dig NS useevolua.com
  ```

- [ ] Aguardar mais tempo (até 48h)

- [ ] Testar com DNS público
  ```bash
  dig @8.8.8.8 app.evolua.com
  ```

### Problema: Não consigo conectar via SSH

- [ ] Verificar IP público mudou
  ```bash
  terraform output app_public_ip
  ```

- [ ] Verificar permissões da chave
  ```bash
  chmod 400 evolua-key.pem
  ```

- [ ] Verificar Security Group permite seu IP

- [ ] Atualizar allowed_ssh_cidr se IP mudou

### Problema: Aplicação não responde

- [ ] Conectar ao servidor

- [ ] Verificar PM2
  ```bash
  pm2 status
  pm2 logs evolua-crm
  ```

- [ ] Verificar Nginx
  ```bash
  sudo systemctl status nginx
  sudo tail -f /var/log/nginx/error.log
  ```

- [ ] Verificar user-data completou
  ```bash
  tail -f /var/log/cloud-init-output.log
  ```

- [ ] Reiniciar serviços
  ```bash
  pm2 restart evolua-crm
  sudo systemctl restart nginx
  ```

### Problema: SSL não funciona

- [ ] Verificar DNS propagou
  ```bash
  dig A app.evolua.com
  ```

- [ ] Verificar certificados
  ```bash
  sudo certbot certificates
  ```

- [ ] Renovar manualmente
  ```bash
  sudo certbot renew
  ```

- [ ] Verificar Nginx
  ```bash
  sudo nginx -t
  sudo systemctl restart nginx
  ```

## 💰 Custos

### Monitoramento de Custos

- [ ] Configurar AWS Budget
  ```bash
  aws budgets create-budget --account-id <ID> --budget file://budget.json
  ```

- [ ] Configurar alertas de custo

- [ ] Revisar mensalmente

### Otimização

- [ ] Usar Reserved Instances após 12 meses
- [ ] Configurar CloudFront apenas se necessário
- [ ] Monitorar data transfer
- [ ] Desligar recursos não utilizados

## 📚 Recursos

- [ ] Documentação completa: `terraform/README.md`
- [ ] Guia rápido: `terraform/QUICKSTART.md`
- [ ] Especificação: `spec/infrastructure.md`
- [ ] Arquitetura: `spec/architecture-summary.md`

## ✅ Deploy Completo!

Parabéns! Sua infraestrutura está rodando. 🎉

**Próximos passos:**
1. Configurar GitHub Actions para deploy automático
2. Implementar backups automáticos
3. Configurar staging environment
4. Adicionar monitoring avançado
5. Implementar CDN (CloudFront) se necessário

---

**Data do Deploy:** _______________  
**Responsável:** _______________  
**Versão:** 1.0.0
