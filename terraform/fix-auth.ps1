# Script para Corrigir Autenticação AWS
# Execute este script para configurar as credenciais AWS

Write-Host "=========================================" -ForegroundColor Red
Write-Host "🔧 Corrigir Autenticação AWS" -ForegroundColor Red
Write-Host "=========================================" -ForegroundColor Red
Write-Host ""

# 1. Verificar AWS CLI
Write-Host "1️⃣  Verificando AWS CLI..." -ForegroundColor Yellow
try {
    $awsVersion = aws --version 2>&1
    Write-Host "   ✅ AWS CLI instalado: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ AWS CLI não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Instalando AWS CLI..." -ForegroundColor Yellow
    Write-Host "   Baixe e instale de: https://awscli.amazonaws.com/AWSCLIV2.msi" -ForegroundColor Cyan
    Write-Host ""
    $install = Read-Host "   Deseja abrir o link para download? (s/n)"
    if ($install -eq "s") {
        Start-Process "https://awscli.amazonaws.com/AWSCLIV2.msi"
    }
    Write-Host ""
    Write-Host "   Após instalar, feche e reabra o PowerShell e execute este script novamente." -ForegroundColor Yellow
    exit 1
}

# 2. Verificar credenciais atuais
Write-Host ""
Write-Host "2️⃣  Verificando credenciais AWS..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity 2>&1 | ConvertFrom-Json
    Write-Host "   ⚠️  Credenciais encontradas (podem estar inválidas)" -ForegroundColor Yellow
    Write-Host "   Account: $($identity.Account)" -ForegroundColor Gray
    Write-Host "   User: $($identity.Arn)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   ✅ Credenciais estão funcionando!" -ForegroundColor Green
    Write-Host ""
    $reconfigure = Read-Host "   Deseja reconfigurar mesmo assim? (s/n)"
    if ($reconfigure -ne "s") {
        Write-Host ""
        Write-Host "   Pulando reconfiguração..." -ForegroundColor Gray
        Write-Host ""
        Write-Host "🎉 Tudo pronto! Execute: terraform plan" -ForegroundColor Green
        exit 0
    }
} catch {
    Write-Host "   ❌ Credenciais não configuradas ou inválidas" -ForegroundColor Red
}

# 3. Instruções para revogar credenciais antigas
Write-Host ""
Write-Host "=========================================" -ForegroundColor Red
Write-Host "🚨 AÇÃO URGENTE NECESSÁRIA" -ForegroundColor Red
Write-Host "=========================================" -ForegroundColor Red
Write-Host ""
Write-Host "Você expôs credenciais AWS antigas publicamente!" -ForegroundColor Red
Write-Host "Access Key exposta: AKIAQ3EGUNNKRVXF3U5MN" -ForegroundColor Red
Write-Host ""
Write-Host "ANTES de continuar, você DEVE:" -ForegroundColor Yellow
Write-Host "1. Acessar: https://console.aws.amazon.com/iam/" -ForegroundColor Cyan
Write-Host "2. Ir em: Users → Seu usuário → Security credentials" -ForegroundColor Cyan
Write-Host "3. Encontrar a access key: AKIAQ3EGUNNKRVXF3U5MN" -ForegroundColor Cyan
Write-Host "4. Clicar em Actions → Deactivate" -ForegroundColor Cyan
Write-Host "5. Depois clicar em Delete" -ForegroundColor Cyan
Write-Host ""
$openIAM = Read-Host "Deseja abrir o console IAM agora? (s/n)"
if ($openIAM -eq "s") {
    Start-Process "https://console.aws.amazon.com/iam/"
    Write-Host ""
    Write-Host "Aguardando você revogar as credenciais antigas..." -ForegroundColor Yellow
    Read-Host "Pressione Enter quando terminar"
}

# 4. Instruções para criar novas credenciais
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🔑 Criar Novas Credenciais" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Agora você precisa criar NOVAS credenciais:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. No console IAM (já aberto)" -ForegroundColor Cyan
Write-Host "2. Clique em 'Create access key'" -ForegroundColor Cyan
Write-Host "3. Escolha 'Command Line Interface (CLI)'" -ForegroundColor Cyan
Write-Host "4. Marque 'I understand...'" -ForegroundColor Cyan
Write-Host "5. Clique em Next → Create access key" -ForegroundColor Cyan
Write-Host "6. COPIE as credenciais (só aparecem uma vez!)" -ForegroundColor Cyan
Write-Host ""
Read-Host "Pressione Enter quando tiver as novas credenciais"

# 5. Configurar AWS CLI
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "⚙️  Configurar AWS CLI" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Agora vamos configurar o AWS CLI com as NOVAS credenciais" -ForegroundColor Yellow
Write-Host ""

# Executar aws configure
aws configure

# 6. Verificar configuração
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ Verificando Configuração" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

try {
    $identity = aws sts get-caller-identity 2>&1 | ConvertFrom-Json
    Write-Host "✅ Credenciais configuradas com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Account: $($identity.Account)" -ForegroundColor Gray
    Write-Host "User: $($identity.Arn)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Erro ao verificar credenciais!" -ForegroundColor Red
    Write-Host "Verifique se você digitou corretamente." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Execute novamente: .\fix-auth.ps1" -ForegroundColor Yellow
    exit 1
}

# 7. Verificar região
Write-Host ""
$region = aws configure get region
if ($region -ne "sa-east-1") {
    Write-Host "⚠️  Região configurada: $region" -ForegroundColor Yellow
    Write-Host "   Recomendado para Brasil: sa-east-1" -ForegroundColor Yellow
    Write-Host ""
    $changeRegion = Read-Host "   Deseja mudar para sa-east-1? (s/n)"
    if ($changeRegion -eq "s") {
        aws configure set region sa-east-1
        Write-Host "   ✅ Região alterada para sa-east-1" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Região configurada: sa-east-1 (São Paulo)" -ForegroundColor Green
}

# 8. Testar acesso
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🧪 Testando Acesso AWS" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Testando acesso EC2..." -ForegroundColor Yellow
try {
    $regions = aws ec2 describe-regions --region sa-east-1 2>&1 | ConvertFrom-Json
    Write-Host "✅ Acesso EC2 funcionando!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao acessar EC2!" -ForegroundColor Red
    Write-Host "Verifique as permissões do usuário IAM." -ForegroundColor Yellow
}

# 9. Resumo
Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "🎉 Configuração Completa!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "1. terraform plan" -ForegroundColor Gray
Write-Host "2. terraform apply" -ForegroundColor Gray
Write-Host ""
Write-Host "Documentação:" -ForegroundColor Cyan
Write-Host "- FIX-AUTH-ERROR.md - Guia detalhado" -ForegroundColor Gray
Write-Host "- MIGRATION-GUIDE.md - Guia de migração" -ForegroundColor Gray
Write-Host ""
