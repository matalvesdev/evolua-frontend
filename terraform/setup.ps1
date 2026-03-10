# Setup Script - Evolua CRM Terraform
# Este script ajuda a configurar o ambiente para deploy

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Evolua CRM - Setup de Infraestrutura" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está no diretório correto
if (-not (Test-Path "main.tf")) {
    Write-Host "❌ Erro: Execute este script no diretório terraform/" -ForegroundColor Red
    Write-Host "   cd terraform" -ForegroundColor Yellow
    Write-Host "   .\setup.ps1" -ForegroundColor Yellow
    exit 1
}

# 1. Verificar AWS CLI
Write-Host "1️⃣  Verificando AWS CLI..." -ForegroundColor Yellow
try {
    $awsVersion = aws --version 2>&1
    Write-Host "   ✅ AWS CLI instalado: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ AWS CLI não encontrado!" -ForegroundColor Red
    Write-Host "   Instale com: msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi" -ForegroundColor Yellow
    exit 1
}

# 2. Verificar Terraform
Write-Host ""
Write-Host "2️⃣  Verificando Terraform..." -ForegroundColor Yellow
try {
    $tfVersion = terraform version 2>&1 | Select-String "Terraform v"
    Write-Host "   ✅ Terraform instalado: $tfVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Terraform não encontrado!" -ForegroundColor Red
    Write-Host "   Instale com: choco install terraform" -ForegroundColor Yellow
    exit 1
}

# 3. Verificar credenciais AWS
Write-Host ""
Write-Host "3️⃣  Verificando credenciais AWS..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity 2>&1 | ConvertFrom-Json
    Write-Host "   ✅ Credenciais configuradas" -ForegroundColor Green
    Write-Host "   Account: $($identity.Account)" -ForegroundColor Gray
    Write-Host "   User: $($identity.Arn)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Credenciais AWS não configuradas!" -ForegroundColor Red
    Write-Host "   Configure com: aws configure" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   🚨 IMPORTANTE: Se você expôs credenciais antigas," -ForegroundColor Red
    Write-Host "   leia: SECURITY-URGENT.md" -ForegroundColor Red
    exit 1
}

# 4. Verificar região
Write-Host ""
Write-Host "4️⃣  Verificando região AWS..." -ForegroundColor Yellow
$region = aws configure get region
if ($region) {
    Write-Host "   ✅ Região configurada: $region" -ForegroundColor Green
    if ($region -eq "sa-east-1") {
        Write-Host "   ✅ Ótima escolha! Menor latência para Brasil" -ForegroundColor Green
    } elseif ($region -eq "us-east-1") {
        Write-Host "   ⚠️  Região US - maior latência para Brasil" -ForegroundColor Yellow
        Write-Host "   Considere usar sa-east-1 para produção" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  Região não configurada" -ForegroundColor Yellow
    Write-Host "   Configure com: aws configure set region sa-east-1" -ForegroundColor Yellow
}

# 5. Verificar chave SSH
Write-Host ""
Write-Host "5️⃣  Verificando chave SSH..." -ForegroundColor Yellow
try {
    $keys = aws ec2 describe-key-pairs --key-names evolua-key 2>&1 | ConvertFrom-Json
    Write-Host "   ✅ Chave SSH 'evolua-key' existe na AWS" -ForegroundColor Green
    
    if (Test-Path "evolua-key.pem") {
        Write-Host "   ✅ Arquivo evolua-key.pem encontrado localmente" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Arquivo evolua-key.pem não encontrado localmente" -ForegroundColor Yellow
        Write-Host "   Você precisará dele para conectar ao servidor" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Chave SSH 'evolua-key' não existe na AWS" -ForegroundColor Red
    Write-Host ""
    $create = Read-Host "   Deseja criar agora? (s/n)"
    if ($create -eq "s") {
        Write-Host "   Criando chave SSH..." -ForegroundColor Yellow
        aws ec2 create-key-pair --key-name evolua-key --query 'KeyMaterial' --output text > evolua-key.pem
        if ($?) {
            Write-Host "   ✅ Chave criada: evolua-key.pem" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Erro ao criar chave" -ForegroundColor Red
        }
    }
}

# 6. Verificar terraform.tfvars
Write-Host ""
Write-Host "6️⃣  Verificando terraform.tfvars..." -ForegroundColor Yellow
if (Test-Path "terraform.tfvars") {
    Write-Host "   ✅ Arquivo terraform.tfvars existe" -ForegroundColor Green
    
    # Verificar se está preenchido
    $content = Get-Content "terraform.tfvars" -Raw
    if ($content -match "PREENCHER_AQUI") {
        Write-Host "   ⚠️  Arquivo contém valores não preenchidos!" -ForegroundColor Yellow
        Write-Host "   Edite: terraform.tfvars" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   Valores necessários:" -ForegroundColor Yellow
        Write-Host "   - supabase_url" -ForegroundColor Gray
        Write-Host "   - supabase_anon_key" -ForegroundColor Gray
        Write-Host "   - alert_email" -ForegroundColor Gray
    } else {
        Write-Host "   ✅ Arquivo parece estar preenchido" -ForegroundColor Green
    }
} else {
    Write-Host "   ❌ Arquivo terraform.tfvars não existe!" -ForegroundColor Red
    Write-Host "   Copie o exemplo: cp terraform.tfvars.example terraform.tfvars" -ForegroundColor Yellow
    Write-Host "   Depois edite com seus valores" -ForegroundColor Yellow
}

# 7. Obter IP público
Write-Host ""
Write-Host "7️⃣  Obtendo seu IP público..." -ForegroundColor Yellow
try {
    $ip = (Invoke-WebRequest -Uri "https://api.ipify.org").Content
    Write-Host "   ✅ Seu IP: $ip" -ForegroundColor Green
    Write-Host "   Use no terraform.tfvars: $ip/32" -ForegroundColor Gray
} catch {
    Write-Host "   ⚠️  Não foi possível obter IP automaticamente" -ForegroundColor Yellow
    Write-Host "   Obtenha manualmente em: https://ifconfig.me" -ForegroundColor Yellow
}

# Resumo
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Resumo do Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

if (-not (Test-Path "terraform.tfvars")) {
    Write-Host "❌ Criar terraform.tfvars" -ForegroundColor Red
    $allGood = $false
} else {
    $content = Get-Content "terraform.tfvars" -Raw
    if ($content -match "PREENCHER_AQUI") {
        Write-Host "⚠️  Preencher terraform.tfvars" -ForegroundColor Yellow
        $allGood = $false
    } else {
        Write-Host "✅ terraform.tfvars configurado" -ForegroundColor Green
    }
}

if (-not (Test-Path "evolua-key.pem")) {
    Write-Host "⚠️  Chave SSH local não encontrada" -ForegroundColor Yellow
} else {
    Write-Host "✅ Chave SSH disponível" -ForegroundColor Green
}

Write-Host ""
if ($allGood) {
    Write-Host "🎉 Tudo pronto para deploy!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos passos:" -ForegroundColor Cyan
    Write-Host "1. terraform init" -ForegroundColor Gray
    Write-Host "2. terraform plan" -ForegroundColor Gray
    Write-Host "3. terraform apply" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Complete os itens acima antes de continuar" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Documentação:" -ForegroundColor Cyan
    Write-Host "- AWS-SETUP.md - Configuração AWS" -ForegroundColor Gray
    Write-Host "- MIGRATION-GUIDE.md - Guia de migração" -ForegroundColor Gray
    Write-Host "- SECURITY-URGENT.md - Segurança (LEIA PRIMEIRO!)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
