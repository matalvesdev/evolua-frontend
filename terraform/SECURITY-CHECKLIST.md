# 🔐 Segurança da Infraestrutura - Checklist DevOps

**Status**: ⚠️ **CRÍTICO** - 6 problemas de segurança identificados
**Última Auditoria**: 25 de março de 2026

---

## 🚨 Problemas Críticos de Segurança

### 1. ❌ AWS Credentials Revogadas

**Severidade**: 🔴 CRÍTICA

**Problema**:
- Access key `AKIAQ3EGUNNKS2STUC5N` tem EC2 access bloqueado
- Terraform apply vai falhar com `AuthFailure`

**Solução Rápida (5 min)**:
```bash
# 1. Acessar IAM Console
https://console.aws.amazon.com/iam/

# 2. Users → Deletar TODAS as old keys
# Seguir: CRITICAL-FIX-NOW.md

# 3. Gerar nova access key
aws iam create-access-key --user-name admin

# 4. Configurar localmente
aws configure  # usar as novas credenciais

# 5. Verificar acesso
aws ec2 describe-instances
```

**Prevention**: Rotacionar keys a cada 90 dias

---

### 2. ❌ SECRETS EM PLAINTEXT (SECURITY BREACH!)

**Severidade**: 🔴 CRÍTICA - Violação LGPD/GDPR

**Problema**:
```
Arquivo: terraform/terraform.tfvars
❌ supabase_service_role_key      (Admin da BD!)
❌ database_url com senha          (Acesso total à BD)
❌ supabase_anon_key               (Acesso de leitura)
```

**Impacto Imediato**:
- Qualquer pessoa com acesso ao repo controla seu banco de dados
- VIOLAÇÃO DE SIGILO DE DADOS DE PACIENTES
- Não conformidade com LGPD (Lei Geral de Proteção de Dados)

**Solução - Opção A: Git Ignore Local (IMEDIATO)**:
```bash
# 1. Criar .gitignore local
echo "terraform/terraform.tfvars" >> .git/info/exclude

# 2. Remover arquivo do git
git rm --cached terraform/terraform.tfvars

# 3. Commit
git commit -m "security: remove secrets from version control"

# 4. ROTACIONAR TODAS as chaves no Supabase
# Dashboard Supabase → Settings → API → Regenerate
```

**Solução - Opção B: AWS Secrets Manager (RECOMENDADO)**:
```bash
# Armazenar secrets em AWS
aws secretsmanager create-secret \
  --name evolua/supabase/keys \
  --secret-string '{
    "supabase_url":"https://...",
    "supabase_anon_key":"...",
    "supabase_service_role_key":"...",
    "database_url":"postgresql://..."
  }'

# Terraform vai ler de Secrets Manager
data "aws_secretsmanager_secret_version" "supabase" {
  secret_id = aws_secretsmanager_secret.supabase.id
}
```

**Solução - Opção C: Terraform Cloud (ENTERPRISE)**:
```bash
# Usar variáveis sensíveis no Terraform Cloud
# Automaticamente encrypted em repouso
# Acesso auditado
```

**⚡ AÇÃO IMEDIATA** (próximos 30 minutos!):
```bash
# 1. Remover secrets do git
git rm --cached terraform/terraform.tfvars

# 2. Criar .gitignore
echo "terraform/terraform.tfvars" >> .git/info/exclude

# 3. Rotacionar chaves no Supabase
# Dashboard → Settings → API → Regenerate keys

# 4. Commit
git commit -m "security: exclude terraform.tfvars (secrets)"

# 5. Verificar
git log --oneline | head -5  # Ver que arquivo foi removido
```

---

### 3. ❌ GitHub Repo URL Pode Não Existir

**Severidade**: 🔴 CRÍTICA - Deploy vai falhar

**Problema**:
```
user-data/backend-init.sh linha 66:
git clone https://github.com/matalvesdev/evolua-backend.git
```

**Solução**:
```bash
# 1. Validar que repo existe e é acessível
git clone https://github.com/SEU_USERNAME/evolua-backend.git /tmp/test
rm -rf /tmp/test

# 2. Se privado, usar SSH key
# Adicionar key publica ao GitHub
# Usar SSH em user-data:
git clone git@github.com:SEU_USERNAME/evolua-backend.git
```

---

### 4. ❌ NGINX SEM SSL/TLS

**Severidade**: 🔴 ALTA - Dados em plaintext

**Problema**:
```
Dados de pacientes transmitidos em HTTP (plaintext!)
- Nomes, CPF, conversas, áudios
- Qualquer person no middle da rede consegue interceptar
```

**Status**: ✅ IMPLEMENTADO EM backend-init.sh
- Certbot automático with Let's Encrypt
- Auto-renovacao a cada 12 horas
- Redirect HTTP → HTTPS

**Validar**:
```bash
ssh -i terraform/evolua-key.pem ubuntu@<IP>
curl https://api.useevolua.com/api/health
# Deve responder com 200
```

---

### 5. ❌ SEM BACKUP/DISASTER RECOVERY

**Severidade**: 🔴 MÉDIA - Perda de dados

**Problema**:
```
EC2 root volume: "delete_on_termination: true"
Se terraform destroy ou erro acidental → PERDE TUDO
```

**Solução - EBS Snapshots Automáticos**:
```bash
# Criar snapshot diário via Lambda + CloudWatch

# terraform/snapshots.tf
resource "aws_ebs_volume_attachment" "backend_volume" {
  device_name             = "/dev/sda1"
  volume_id               = aws_ebs_volume.backend.id
  instance_id             = aws_instance.backend.id
  stop_instance_before_detaching = true
}

resource "aws_dlm_lifecycle_policy" "backend_snapshots" {
  execution_role_arn = aws_iam_role.dlm_role.arn
  state               = "ENABLED"

  policy_details {
    resource_types = ["INSTANCE"]

    schedule {
      name = "Daily snapshot"
      create_rule {
        interval      = 24
        interval_unit = "HOURS"
      }
      retain_rule {
        count = 7  # Manter 7 dias
      }
    }
  }
}
```

---

### 6. ❌ SEM HEALTH MONITORING

**Severidade**: 🟡 MÉDIA - Downtime silencioso

**Problema**:
```
Se backend cai, ninguém sabe até cliente relatar
Health check só local (não monitora alertas)
```

**Solução - CloudWatch Alarms**:
```bash
# terraform/monitoring.tf
resource "aws_cloudwatch_metric_alarm" "backend_health_check" {
  alarm_name          = "evolua-backend-health"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "HealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = "60"
  statistic           = "Average"
  threshold           = "1"
  alarm_description   = "Backend na saúde crítica"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}
```

---

## ✅ Checklist de Segurança (Antes de Prod)

- [ ] **Credentials**: AWS keys rotacionadas há menos de 90 dias
- [ ] **Secrets**: Nenhuma chave em git history
  ```bash
  git log -p | grep -i "api_key\|secret\|password" | wc -l
  # Deve retornar 0
  ```
- [ ] **SSL/TLS**: HTTPS ativo  
  ```bash
  curl -I https://api.useevolua.com  # Deve ser 200+
  ```
- [ ] **Firewall**: Security Group restrito
  - SSH: Apenas seu IP
  - HTTP/HTTPS: Mundo (0.0.0.0/0)
- [ ] **Backup**: EBS snapshots automáticos configurados
- [ ] **Monitoring**: CloudWatch alarms para health check
- [ ] **IAM**: EC2 role com policy minimalista (least privilege)
- [ ] **Database**: Row-Level Security (RLS) ativo no Supabase
- [ ] **Audit**: CloudTrail logging habilitado para EC2 + IAM

---

## 🔄 Rotinas Mensais

```bash
# 1. Validar segurança de secrets
git log --pretty=format: --name-only | sort -u | xargs grep -l "KEY\|SECRET\|PASSWORD"

# 2. Rotacionar AWS keys
aws iam list-access-keys
# Se > 90 dias, deletar e criar nova

# 3. Verificar snapshots
aws ec2 describe-snapshots --query 'Snapshots[*].[SnapshotId,StartTime,VolumeSize]'

# 4. Revisar CloudTrail logs
aws cloudtrail lookup-events --max-results 50

# 5. Validar certificados SSL
echo | openssl s_client -servername api.useevolua.com -connect api.useevolua.com:443 | grep -A 2 "Not After"
```

---

## 📞 Contatos de Emergência

- **AWS Support**: https://console.aws.amazon.com/support
- **Supabase Security**: security@supabase.com
- **Let's Encrypt Revoke**: https://revoke.letsencrypt.org

---

## 📚 Referências

- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)
- [LGPD - Lei Geral de Proteção de Dados](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)
- [Terraform Security](https://www.terraform.io/language/state/sensitive-data)
- [Let's Encrypt Auto-Renewal](https://certbot.eff.org/docs/using.html)

