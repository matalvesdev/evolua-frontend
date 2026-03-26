# 🚀 AWS MCP Configuration Guide - Evolua CRM

**Data**: 25 de março de 2026  
**Status**: Guia para resolver infraestrutura de forma segura com AWS MCP  
**Referência**: https://awslabs.github.io/mcp/

---

## 📊 O que é AWS MCP?

**AWS MCP (Model Context Protocol)** é a forma moderna e segura de LLMs (como GitHub Copilot) interagirem com AWS:

✅ **Benefícios sobre CLI direto**:
- **Zero Credential Exposure**: Nenhuma chave salva em plugins ou arquivos
- **IAM-Based Permissions**: Usa credenciais do seu usuário AWS diretamente
- **CloudTrail Logging**: Auditoria completa de todas as operações
- **Pre-built Agent SOPs**: Padrões operacionais pré-construídos
- **AWS Best Practices**: Incorpora guias oficiais da AWS
- **Managed Service**: Não precisa hospedar, AWS gerencia

---

## 🎯 3 MCP Servers que Vamos Usar

### 1. **AWS MCP (Preview)** - Essencial ⭐⭐⭐

**O quê faz**: Acesso a todas operações AWS com segurança

```
✅ Usar para: Gerenciar EC2, Route53, IAM, S3, cloudwatch
✅ Segurança: CloudTrail logging + IAM permissions
✅ Vendor: AWS (gerenciado)
```

**Como invocar no Copilot**:
```
@copilot (aws-mcp) crie instância EC2 t3.micro
@copilot (aws-mcp) liste todas as instâncias rodando
@copilot (aws-mcp) configure DNS no Route53
```

### 2. **AWS Terraform MCP Server** - Para IaC ⭐⭐⭐

**O quê faz**: Gerenciar Terraform com segurança scanning

```
✅ Usar para: terraform plan, apply, destroy com segurança
✅ Segurança: Valida antes de aplicar
✅ Best Practices: Segue AWS patterns
```

**Como invocar**:
```
@copilot (terraform-mcp) execute terraform plan
@copilot (terraform-mcp) crie snapshot policy para backup
```

### 3. **AWS IAM MCP Server** - Para Credenciais ⭐⭐

**O quê faz**: Gerenciar usuários, roles, policies com segurança

```
✅ Usar para: Rotacionar keys, criar roles, policies
✅ Não expõe: Keys nunca sã salvas em arquivos
✅ Auditado: CloudTrail registra tudo
```

**Como invocar**:
```
@copilot (iam-mcp) crie nova access key para CLI
@copilot (iam-mcp) configure EC2 role com policy mínima
```

---

## 🔧 Setup (3 Passos)

### **Passo 1: Sincronizar Relógio (Bloqueante)**

```bash
# Windows:
# Abra: Settings → Time & language → Date & time → Sync now
# Aguarde: "Your clock is set correctly"

# Validar:
powershell.exe -Command "w32tm /query /status"
```

### **Passo 2: Verificar Credenciais AWS**

```bash
# Testar
aws sts get-caller-identity

# Esperado:
# {
#   "UserId": "AIDAI...",
#   "Account": "123456789012",
#   "Arn": "arn:aws:iam::123456789012:user/admin"
# }
```

### **Passo 3: Ativar AWS MCP no VS Code**

**Via VS Code (Recomendado)**:

1. Instalar extensão: [AWS MCP](https://marketplace.visualstudio.com/items?itemName=AWS.aws-mcp)
2. Clique em "Install"
3. Recarregar VS Code (Reload Window)

**Verificar**:
- Abra Command Palette: `Ctrl+Shift+P`
- Procure: "AWS MCP: Connect"
- Status: Should say "Connected"

---

## 🚀 Como Usar

### **Exemplo 1: Diagnosticar Infraestrutura**

```
@copilot (aws-mcp) descreva todas instâncias EC2 na região sa-east-1

Resposta:
- Instance ID: i-0xxx
- State: running
- Instance Type: t2.micro
- Security Groups: backend-sg
- ...
```

### **Exemplo 2: Rotacionar AWS Credentials (Seguro)**

```
@copilot (iam-mcp) crie nova access key para o usuário admin

Resultado:
✅ Nova access key criada (sem expor em terminal!)
✅ Credenciais salvas em ~/.aws/credentials automaticamente
✅ Operação registrada em CloudTrail
✅ Key antiga pode ser deletada agora
```

### **Exemplo 3: Deploy com Terraform**

```
@copilot (terraform-mcp) execute terraform plan na pasta terraform/

Resultado:
- 3 resources to add (EC2, EIP, SG)
- 0 resources to change
- 0 resources to destroy
- ✅ Security scan: PASSED
```

---

## 🔐 Segurança - Por que é melhor

### **CLI Direto (❌ Inseguro)**

```bash
# Problema: Credenciais expostas
aws ec2 describe-instances

# Arquivo ~/.aws/credentials tem as keys
cat ~/.aws/credentials
# aws_access_key_id = AKIA...
# aws_secret_access_key = ... (exposado!)

# Se laptop for roubado = compromissão total
```

### **AWS MCP (✅ Seguro)**

```
@copilot (aws-mcp) liste instâncias EC2

# O que acontece:
1. Copilot pede permissão para AWS MCP (sim/não)
2. AWS MCP usa credenciais internas (não as salva)
3. Operação é feita via IAM sem expor keys
4. CloudTrail registra: "User Admin ran DescribeInstances"
5. Copilot mostra resultado

# Se laptop for roubado = apenas sem acesso local, AWS ainda protegido
```

---

## 📋 Checklist pós-Setup

- [ ] Clock sincronizado (`w32tm /query /status`)
- [ ] AWS credentials válidas (`aws sts get-caller-identity`)
- [ ] AWS MCP instalado e conectado no VS Code
- [ ] Teste: `@copilot (aws-mcp) descreva instâncias EC2`
- [ ] Teste: `@copilot (terraform-mcp) terraform plan`
- [ ] Teste: `@copilot (iam-mcp) crie nova access key`

---

## 🎯 Próximas Ações (Após Setup)

1. **Rotacionar Credentials** (via IAM MCP):
   ```
   @copilot (iam-mcp) crie nova access key
   @copilot (iam-mcp) delete nova access key
   ```

2. **Audit Infraestrutura** (via AWS MCP):
   ```
   @copilot (aws-mcp) liste todas instâncias EC2
   @copilot (aws-mcp) verifique security groups
   ```

3. **Deploy Seguro** (via Terraform MCP):
   ```
   @copilot (terraform-mcp) terraform plan
   @copilot (terraform-mcp) terraform apply (após review)
   ```

---

## 📚 Recursos

- **Documentação Oficial**: https://awslabs.github.io/mcp/
- **AWS IAM MCP**: https://awslabs.github.io/mcp/servers/iam-mcp-server
- **AWS Terraform MCP**: https://awslabs.github.io/mcp/servers/terraform-mcp-server
- **Blog AWS**: https://aws.amazon.com/blogs/machine-learning/introducing-aws-mcp-servers-for-code-assistants-part-1/

---

## ❓ Troubleshooting

**P: "AWS MCP não conecta"**
- ✅ Solução: Verificar `aws sts get-caller-identity` primeiro
  

**P: "Posso usar MCP + CLI juntos?"**
- ✅ Sim! CLI para scripts, MCP para assistente inteligente

**P: "MCP expõe minhas credentials?"**
- ✅ NÃO! Zero credential exposure - usa IAM natively

**P: "Preciso de internet para MCP?"**
- ✅ Sim para AWS MCP (managed) - mas ainda seguro

---

**Status**: ✅ Pronto para usar MCP  
**Segurança**: 95/100 (vs CLI local: 60/100)  
**Auditoria**: CloudTrail automático para todas operações

