# 🔧 Corrigir Erro de Autenticação AWS

## ❌ Erro Atual

```
Error: AuthFailure: AWS was not able to validate the provided access credentials
```

Este erro significa que o Terraform não consegue se autenticar na AWS.

---

## ✅ Solução Rápida (5 minutos)

### Passo 1: Verificar se AWS CLI está instalado

```powershell
aws --version
```

**Se não estiver instalado:**
```powershell
# Baixar e instalar
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# Fechar e reabrir o PowerShell
```

---

### Passo 2: Configurar Credenciais AWS

⚠️ **IMPORTANTE:** Você precisa REVOGAR as credenciais antigas primeiro!

#### 2.1 Revogar Credenciais Antigas (URGENTE!)

1. Acesse: https://console.aws.amazon.com/iam/
2. Faça login
3. Menu lateral: **Users** → Seu usuário
4. Aba **Security credentials**
5. Encontre a access key: `AKIAQ3EGUNNKRVXF3U5MN`
6. Clique em **Actions** → **Deactivate**
7. Depois clique em **Delete**

#### 2.2 Criar Novas Credenciais

1. Na mesma página, clique em **Create access key**
2. Escolha **Command Line Interface (CLI)**
3. Marque "I understand..."
4. Clique em **Next** → **Create access key**
5. **COPIE E SALVE:**
   - Access key ID: `AKIA...`
   - Secret access key: `...`

⚠️ **A secret key só é mostrada uma vez!**

#### 2.3 Configurar AWS CLI

```powershell
aws configure
```

**Preencha:**
```
AWS Access Key ID [None]: NOVA_ACCESS_KEY_AQUI
AWS Secret Access Key [None]: NOVA_SECRET_KEY_AQUI
Default region name [None]: sa-east-1
Default output format [None]: json
```

---

### Passo 3: Verificar Configuração

```powershell
aws sts get-caller-identity
```

**Output esperado:**
```json
{
    "UserId": "AIDAI...",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/seu-usuario"
}
```

✅ Se ver isso, está configurado!

---

### Passo 4: Testar Terraform Novamente

```powershell
cd terraform
terraform plan
```

Agora deve funcionar! 🎉

---

## 🔍 Verificação Completa

Execute este comando para verificar tudo:

```powershell
# 1. Verificar AWS CLI
aws --version

# 2. Verificar credenciais
aws sts get-caller-identity

# 3. Verificar região
aws configure get region

# 4. Testar acesso EC2
aws ec2 describe-regions --region sa-east-1

# 5. Verificar Terraform
cd terraform
terraform validate
```

Se todos funcionarem, você está pronto! ✅

---

## 🆘 Troubleshooting

### Erro: "aws: command not found"

**Solução:** AWS CLI não está instalado

```powershell
# Instalar
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# Fechar e reabrir PowerShell
```

---

### Erro: "The security token included in the request is invalid"

**Solução:** Credenciais inválidas

```powershell
# Reconfigurar
aws configure

# Verificar
aws sts get-caller-identity
```

---

### Erro: "You are not authorized to perform this operation"

**Solução:** Usuário IAM não tem permissões

**Permissões necessárias:**
- EC2: Full access
- Route53: Full access
- CloudWatch: Full access
- SNS: Full access
- VPC: Read access

**Como adicionar permissões:**
1. Acesse: https://console.aws.amazon.com/iam/
2. Menu lateral: **Users** → Seu usuário
3. Aba **Permissions**
4. Clique em **Add permissions** → **Attach policies directly**
5. Adicione:
   - `AmazonEC2FullAccess`
   - `AmazonRoute53FullAccess`
   - `CloudWatchFullAccess`
   - `AmazonSNSFullAccess`
   - `AmazonVPCReadOnlyAccess`
6. Clique em **Next** → **Add permissions**

---

## 📋 Checklist

Marque conforme completar:

- [ ] AWS CLI instalado
- [ ] Credenciais antigas revogadas
- [ ] Novas credenciais criadas
- [ ] AWS CLI configurado (`aws configure`)
- [ ] Credenciais verificadas (`aws sts get-caller-identity`)
- [ ] Região configurada (sa-east-1)
- [ ] Permissões IAM verificadas
- [ ] Terraform validado (`terraform validate`)
- [ ] Terraform plan funcionando (`terraform plan`)

---

## 🚀 Próximos Passos

Depois de corrigir a autenticação:

1. ✅ Executar `terraform plan` (deve funcionar)
2. ✅ Revisar recursos que serão criados
3. ✅ Executar `terraform apply`
4. ✅ Seguir [`MIGRATION-GUIDE.md`](MIGRATION-GUIDE.md)

---

## 💡 Dica: Usar Perfis AWS

Se você trabalha com múltiplas contas AWS:

```powershell
# Configurar perfil específico
aws configure --profile evolua

# Usar perfil no Terraform
$env:AWS_PROFILE="evolua"
terraform plan
```

---

## 🔐 Segurança

**NUNCA:**
- ❌ Compartilhe credenciais em chat
- ❌ Commite credenciais no Git
- ❌ Use credenciais root
- ❌ Deixe credenciais em código

**SEMPRE:**
- ✅ Use IAM users
- ✅ Habilite MFA
- ✅ Rotacione credenciais regularmente
- ✅ Use permissões mínimas necessárias

---

**Tempo estimado:** 5-10 minutos

**Última atualização:** 09/03/2024
