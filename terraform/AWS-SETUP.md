# 🔐 Configuração AWS - Guia Completo

## ❌ Erro Atual

```
Error: AuthFailure: AWS was not able to validate the provided access credentials
```

Este erro significa que o Terraform não consegue se autenticar na AWS.

---

## ✅ Solução: Configurar Credenciais AWS

### Opção 1: AWS CLI (Recomendado)

#### 1. Instalar AWS CLI

**Windows:**
```powershell
# Baixar e instalar
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# Ou via Chocolatey
choco install awscli
```

**Verificar instalação:**
```powershell
aws --version
# Deve mostrar: aws-cli/2.x.x
```

#### 2. Obter Credenciais AWS

1. Acesse: https://console.aws.amazon.com/iam/
2. No menu lateral: **Users** → Seu usuário
3. Aba **Security credentials**
4. Clique em **Create access key**
5. Escolha **Command Line Interface (CLI)**
6. Marque "I understand..." e clique **Next**
7. (Opcional) Adicione descrição
8. Clique em **Create access key**
9. **IMPORTANTE:** Copie e salve:
   - Access key ID: `AKIAIOSFODNN7EXAMPLE`
   - Secret access key: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`

⚠️ **ATENÇÃO:** A secret key só é mostrada uma vez! Salve em local seguro.

#### 3. Configurar AWS CLI

```powershell
aws configure
```

Preencha:
```
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-east-1
Default output format [None]: json
```

#### 4. Verificar Configuração

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

✅ Se ver isso, está configurado corretamente!

---

### Opção 2: Variáveis de Ambiente

Se não quiser usar AWS CLI, pode configurar via variáveis de ambiente:

**Windows PowerShell:**
```powershell
$env:AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
$env:AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
$env:AWS_DEFAULT_REGION="us-east-1"
```

**Windows CMD:**
```cmd
set AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
set AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
set AWS_DEFAULT_REGION=us-east-1
```

⚠️ **Nota:** Essas variáveis são temporárias e serão perdidas ao fechar o terminal.

---

### Opção 3: Arquivo de Credenciais Manual

Crie o arquivo: `C:\Users\SEU_USUARIO\.aws\credentials`

```ini
[default]
aws_access_key_id = AKIAIOSFODNN7EXAMPLE
aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

E o arquivo: `C:\Users\SEU_USUARIO\.aws\config`

```ini
[default]
region = us-east-1
output = json
```

---

## 🌍 Escolher Região AWS

Para melhor disponibilidade e menor latência no Brasil, recomendo:

### Opção 1: São Paulo (Recomendado para Brasil)
```
Region: sa-east-1
Nome: South America (São Paulo)
```

**Vantagens:**
- ✅ Menor latência para usuários brasileiros
- ✅ Dados ficam no Brasil (LGPD)
- ✅ Melhor performance

**Desvantagens:**
- ⚠️ Custos ~10-20% mais altos que us-east-1
- ⚠️ Alguns serviços podem não estar disponíveis

### Opção 2: Norte da Virgínia (Mais barato)
```
Region: us-east-1
Nome: US East (N. Virginia)
```

**Vantagens:**
- ✅ Custos mais baixos
- ✅ Todos os serviços disponíveis
- ✅ Free tier mais generoso

**Desvantagens:**
- ⚠️ Maior latência (~150-200ms do Brasil)
- ⚠️ Dados fora do Brasil

### Comparação de Latência

| Região | Latência Média | Custo Relativo |
|--------|----------------|----------------|
| sa-east-1 (São Paulo) | 10-30ms | 100% + 10-20% |
| us-east-1 (N. Virginia) | 150-200ms | 100% |
| us-east-2 (Ohio) | 160-210ms | 100% |

### Recomendação

**Para produção no Brasil:** Use `sa-east-1`
**Para desenvolvimento/testes:** Use `us-east-1` (mais barato)

---

## 🔧 Configurar Região no Terraform

Edite `terraform/terraform.tfvars`:

```hcl
# Para São Paulo (Recomendado para Brasil)
aws_region = "sa-east-1"

# Ou para Norte da Virgínia (Mais barato)
aws_region = "us-east-1"
```

---

## ✅ Verificar Configuração Final

Depois de configurar, teste:

```powershell
# 1. Verificar credenciais
aws sts get-caller-identity

# 2. Verificar região
aws configure get region

# 3. Testar acesso EC2
aws ec2 describe-regions

# 4. Inicializar Terraform
cd terraform
terraform init

# 5. Validar configuração
terraform validate
```

Se todos os comandos funcionarem, você está pronto para fazer deploy!

---

## 🚀 Próximos Passos

Depois de configurar as credenciais:

1. ✅ Editar `terraform/terraform.tfvars`
2. ✅ Executar `terraform init`
3. ✅ Executar `terraform plan`
4. ✅ Executar `terraform apply`

---

## 🔒 Segurança

### ⚠️ NUNCA faça:
- ❌ Commitar credenciais no Git
- ❌ Compartilhar access keys
- ❌ Usar credenciais root
- ❌ Deixar credenciais em código

### ✅ SEMPRE faça:
- ✅ Use IAM users com permissões mínimas
- ✅ Rotacione credenciais regularmente
- ✅ Use MFA (Multi-Factor Authentication)
- ✅ Monitore uso com CloudTrail

---

## 🆘 Troubleshooting

### Erro: "aws: command not found"

**Solução:** AWS CLI não está instalado ou não está no PATH

```powershell
# Reinstalar AWS CLI
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# Fechar e reabrir terminal
```

### Erro: "The security token included in the request is invalid"

**Solução:** Credenciais inválidas ou expiradas

```powershell
# Reconfigurar
aws configure

# Verificar
aws sts get-caller-identity
```

### Erro: "You are not authorized to perform this operation"

**Solução:** Usuário IAM não tem permissões necessárias

Permissões mínimas necessárias:
- EC2: Full access
- Route53: Full access
- CloudWatch: Full access
- SNS: Full access

### Erro: "Region not found"

**Solução:** Região inválida ou não disponível

```powershell
# Listar regiões disponíveis
aws ec2 describe-regions --output table

# Configurar região válida
aws configure set region sa-east-1
```

---

## 📚 Recursos

- **AWS CLI Docs:** https://docs.aws.amazon.com/cli/
- **IAM Best Practices:** https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html
- **Regiões AWS:** https://aws.amazon.com/about-aws/global-infrastructure/regions_az/
- **Free Tier:** https://aws.amazon.com/free/

---

## 💡 Dicas

1. **Use perfis AWS** para múltiplos ambientes:
   ```powershell
   aws configure --profile production
   aws configure --profile development
   
   # Usar perfil específico
   $env:AWS_PROFILE="production"
   terraform apply
   ```

2. **Verifique custos** antes de aplicar:
   ```powershell
   terraform plan
   # Revise recursos que serão criados
   ```

3. **Use MFA** para maior segurança:
   - IAM → Users → Security credentials → Assign MFA device

4. **Monitore uso** com AWS Budgets:
   - https://console.aws.amazon.com/billing/home#/budgets

---

**Última atualização:** 09/03/2024  
**Versão:** 1.0.0
