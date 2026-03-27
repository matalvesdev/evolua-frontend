# 🔑 Recuperação da Chave SSH - Guia Rápido

**Status**: Chave evolua-key.pem encontrada mas vazia (0 bytes)  
**Problema**: Não pode fazer SSH sem chave válida  
**Solução**: Recriar key pair no AWS

---

## ⚡ Opção 1: Recriar Key Pair (RECOMENDADO - 5 min)

### Passo 1: Deletar key pair antigo

```bash
# Via AWS CLI:
aws ec2 delete-key-pair --key-name evolua-key --region sa-east-1
```

### Passo 2: Criar novo key pair

```bash
# Via AWS CLI - IMPORTANTE: Redirecionar para arquivo!
aws ec2 create-key-pair --key-name evolua-key --region sa-east-1 --query 'KeyMaterial' --output text > evolua-key.pem

# Confirme que criou com conteúdo:
ls -lah evolua-key.pem
# Deve ter > 0 bytes, não 0!

# Dar permissões corretas (IMPORTANTE):
chmod 600 evolua-key.pem
```

### Passo 3: Recriar EC2 instance com nova chave

```bash
cd terraform

# Atualizar reference à nova chave no código:
# - Seu arquivo `main.tf` ou espec.tf deve referenciar "evolua-key"
# - Já está correto se for: aws_key_pair "deployer"

# Reaplica terraform:
terraform plan
terraform apply -auto-approve
```

---

## ⚡ Opção 2: Download Manual (AWS Console - 3 min)

1. Acesse: https://console.aws.amazon.com/ec2/
2. Vá para: **Key Pairs** (na esquerda, Network & Security → Key Pairs)
3. Procure: **evolua-key**
4. Se existir: **Delete** e recrie (AWS não mostra chaves antigas)
5. **Create key pair**:
   - Name: `evolua-key`
   - Type: RSA
   - Private key file format: .pem
   - **Download** → salve em `terraform/evolua-key.pem`
6. Permissões:
   ```bash
   chmod 600 evolua-key.pem
   ```

---

## ✅ Verificar Senha/Key

Após criar:

```bash
# Deve ter conteúdo (não 0 bytes):
ls -lah evolua-key.pem
# Esperado: -rw------- (600) 1800+ bytes

# Deve começar com:
head -1 evolua-key.pem
# Esperado: -----BEGIN RSA PRIVATE KEY-----

# Confirme permissões:
ls -l evolua-key.pem
# Esperado: -rw------- 1 user user
```

---

## 🚀 Depois, Fazer SSH

Quando a chave estiver pronta:

```bash
# De dentro de terraform/ folder:
ssh -i evolua-key.pem ubuntu@18.228.183.188

# Aceitar prompt do ECDSA:
# "Are you sure you want to continue connecting (yes/no)?" → yes

# Pronto! Você está no EC2!
```

---

## 🆘 Se a Chave Ainda Não Funcionar

```bash
# 1. Verificar formato ECDSA vs RSA:
ssh-keygen -l -f evolua-key.pem
# Esperado: RSA 2048 (ou 3072)

# 2. Tentar com verbose para debug:
ssh -vvv -i evolua-key.pem ubuntu@18.228.183.188
# Procure por "Authentication succeeded" ou erro específico

# 3. Se disser "Permission denied (publickey)" = key pair mismatch
#    → Certifique que a EC2 instance foi criada COM essa key pair
#    → Caso contrário, terminate instance e recrie
```

---

## 📋 Checklist

- [ ] Chave `evolua-key.pem` criada/baixada
- [ ] Tamanho > 0 bytes: `ls -lah evolua-key.pem`
- [ ] Conteúdo valida: `head -1` começa com `-----BEGIN RSA PRIVATE KEY-----`
- [ ] Permissões corretas: `chmod 600 evolua-key.pem`
- [ ] SSH testa com sucesso: `ssh -i evolua-key.pem ubuntu@18.228.183.188`

---

**Próximo**: Quando chave estiver OK, execute [AÇÃO 1: SSH EC2 Verification](DEPLOYMENT-CHECKLIST.md#ação-1-ec2-ssh-verification)
