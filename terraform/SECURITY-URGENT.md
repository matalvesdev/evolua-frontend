# 🚨 ALERTA DE SEGURANÇA - AÇÃO URGENTE NECESSÁRIA

## ⚠️ CREDENCIAIS AWS EXPOSTAS

Você expôs suas credenciais AWS publicamente. Isso é **EXTREMAMENTE PERIGOSO** e pode resultar em:

- 💰 Cobranças inesperadas (mineração de Bitcoin, etc)
- 🔓 Acesso não autorizado aos seus recursos
- 📊 Roubo de dados
- 🗑️ Exclusão de recursos

---

## 🚨 AÇÃO IMEDIATA (FAÇA AGORA!)

### 1. Revogar Credenciais Antigas

**Access Key exposta:** `AKIAQ3EGUNNKRVXF3U5MN`

#### Opção A: Via Console AWS (Recomendado)

1. Acesse: https://console.aws.amazon.com/iam/
2. Faça login
3. Menu lateral: **Users** → Clique no seu usuário
4. Aba **Security credentials**
5. Encontre a access key: `AKIAQ3EGUNNKRVXF3U5MN`
6. Clique em **Actions** → **Deactivate** (desativar AGORA)
7. Depois clique em **Delete** (deletar permanentemente)

#### Opção B: Via AWS CLI

```powershell
# Desativar
aws iam update-access-key `
  --access-key-id AKIAQ3EGUNNKRVXF3U5MN `
  --status Inactive

# Deletar
aws iam delete-access-key `
  --access-key-id AKIAQ3EGUNNKRVXF3U5MN
```

---

### 2. Verificar Atividade Suspeita

#### 2.1 Verificar Recursos Criados

```powershell
# Listar instâncias EC2 em TODAS as regiões
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,State.Name,InstanceType]' --output table --region us-east-1
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,State.Name,InstanceType]' --output table --region us-west-1
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,State.Name,InstanceType]' --output table --region eu-west-1
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,State.Name,InstanceType]' --output table --region ap-southeast-1

# Listar buckets S3
aws s3 ls

# Listar funções Lambda
aws lambda list-functions --query 'Functions[*].[FunctionName,Runtime]' --output table
```

#### 2.2 Verificar CloudTrail (Logs de Atividade)

```powershell
# Ver eventos recentes
aws cloudtrail lookup-events `
  --lookup-attributes AttributeKey=Username,AttributeValue=SEU_USUARIO `
  --max-results 50 `
  --output table
```

#### 2.3 Verificar Custos

1. Acesse: https://console.aws.amazon.com/billing/
2. Vá em **Bills** → Mês atual
3. Verifique se há cobranças inesperadas

---

### 3. Criar Novas Credenciais (Seguras)

#### 3.1 Criar Nova Access Key

1. Acesse: https://console.aws.amazon.com/iam/
2. Menu lateral: **Users** → Seu usuário
3. Aba **Security credentials**
4. Clique em **Create access key**
5. Escolha **Command Line Interface (CLI)**
6. Marque "I understand..."
7. Clique em **Next** → **Create access key**
8. **COPIE E SALVE EM LOCAL SEGURO:**
   - Access key ID: `AKIA...`
   - Secret access key: `...`

⚠️ **NUNCA compartilhe essas credenciais novamente!**

#### 3.2 Configurar AWS CLI com Novas Credenciais

```powershell
aws configure
```

Preencha com as NOVAS credenciais:
```
AWS Access Key ID [None]: NOVA_ACCESS_KEY_AQUI
AWS Secret Access Key [None]: NOVA_SECRET_KEY_AQUI
Default region name [None]: sa-east-1
Default output format [None]: json
```

#### 3.3 Verificar Nova Configuração

```powershell
aws sts get-caller-identity
```

Deve retornar suas informações de conta.

---

### 4. Habilitar MFA (Multi-Factor Authentication)

Para maior segurança:

1. Acesse: https://console.aws.amazon.com/iam/
2. Menu lateral: **Users** → Seu usuário
3. Aba **Security credentials**
4. Seção **Multi-factor authentication (MFA)**
5. Clique em **Assign MFA device**
6. Escolha **Authenticator app**
7. Use Google Authenticator ou Authy
8. Escaneie QR code
9. Digite dois códigos consecutivos
10. Clique em **Add MFA**

---

### 5. Configurar AWS Budgets (Alertas de Custo)

Para evitar surpresas:

1. Acesse: https://console.aws.amazon.com/billing/home#/budgets
2. Clique em **Create budget**
3. Escolha **Cost budget**
4. Configure:
   - Budget name: "Alerta Mensal"
   - Period: Monthly
   - Budget amount: $10 (ou valor desejado)
5. Configure alertas:
   - Alert 1: 50% do budget
   - Alert 2: 80% do budget
   - Alert 3: 100% do budget
6. Adicione seu email
7. Clique em **Create budget**

---

## 🔒 Boas Práticas de Segurança

### ✅ SEMPRE Faça:

1. **Use MFA** em todas as contas AWS
2. **Rotacione credenciais** a cada 90 dias
3. **Use IAM roles** ao invés de access keys quando possível
4. **Monitore custos** com AWS Budgets
5. **Revise CloudTrail** regularmente
6. **Use AWS Secrets Manager** para secrets
7. **Habilite CloudTrail** em todas as regiões
8. **Configure alertas** de segurança

### ❌ NUNCA Faça:

1. **Compartilhe credenciais** em chat, email, ou código
2. **Commite credenciais** no Git
3. **Use credenciais root** para operações diárias
4. **Deixe access keys** em código-fonte
5. **Ignore alertas** de segurança
6. **Use mesma senha** em múltiplas contas
7. **Desabilite MFA** depois de configurar

---

## 📋 Checklist de Segurança

Marque conforme completar:

- [ ] Revogou credenciais antigas (AKIAQ3EGUNNKRVXF3U5MN)
- [ ] Verificou atividade suspeita em CloudTrail
- [ ] Verificou recursos criados (EC2, S3, Lambda)
- [ ] Verificou custos no Billing
- [ ] Criou novas credenciais AWS
- [ ] Configurou AWS CLI com novas credenciais
- [ ] Habilitou MFA na conta
- [ ] Configurou AWS Budgets
- [ ] Atualizou terraform.tfvars com novas credenciais
- [ ] Deletou mensagens com credenciais antigas

---

## 🆘 Se Detectar Atividade Suspeita

### Recursos Não Autorizados

Se encontrar recursos que você não criou:

```powershell
# Parar instâncias EC2 suspeitas
aws ec2 stop-instances --instance-ids i-xxxxx

# Deletar buckets S3 suspeitos
aws s3 rb s3://bucket-suspeito --force

# Deletar funções Lambda suspeitas
aws lambda delete-function --function-name funcao-suspeita
```

### Cobranças Inesperadas

1. Acesse: https://console.aws.amazon.com/billing/
2. Vá em **Bills** → Detalhes
3. Identifique serviços com cobranças altas
4. Pare/delete recursos imediatamente
5. Abra ticket de suporte AWS explicando a situação

### Contatar AWS Support

Se houver cobranças fraudulentas:

1. Acesse: https://console.aws.amazon.com/support/
2. Clique em **Create case**
3. Escolha **Account and billing support**
4. Explique a situação:
   - Credenciais foram expostas
   - Data/hora da exposição
   - Recursos não autorizados criados
   - Solicite revisão de cobranças

---

## 📚 Recursos Adicionais

- **AWS Security Best Practices:** https://aws.amazon.com/security/best-practices/
- **IAM Best Practices:** https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html
- **CloudTrail:** https://docs.aws.amazon.com/cloudtrail/
- **AWS Budgets:** https://aws.amazon.com/aws-cost-management/aws-budgets/

---

## ✅ Após Resolver

Depois de completar todos os passos acima:

1. Continue com a migração normalmente
2. Use as NOVAS credenciais
3. Monitore custos diariamente por 1 semana
4. Configure alertas de segurança
5. Documente o incidente para aprendizado

---

## 🎓 Lição Aprendida

**NUNCA compartilhe credenciais em:**
- ❌ Chat (Slack, Discord, WhatsApp)
- ❌ Email
- ❌ Código-fonte
- ❌ Screenshots
- ❌ Documentação pública
- ❌ Issues do GitHub
- ❌ Pull Requests

**Use sempre:**
- ✅ AWS Secrets Manager
- ✅ Variáveis de ambiente
- ✅ IAM Roles
- ✅ Terraform variables (não commitadas)
- ✅ .env files (no .gitignore)

---

**AÇÃO URGENTE:** Complete os passos acima AGORA antes de continuar com a migração!

---

**Última atualização:** 09/03/2024  
**Prioridade:** 🚨 CRÍTICA
