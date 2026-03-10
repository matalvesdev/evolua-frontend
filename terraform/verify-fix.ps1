# Verify AWS Credentials Fix
# Run this AFTER creating new credentials

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🔍 Verificando Credenciais AWS" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true

# Test 1: AWS CLI installed
Write-Host "1️⃣  AWS CLI..." -NoNewline
try {
    $version = aws --version 2>&1
    Write-Host " ✅" -ForegroundColor Green
    Write-Host "   $version" -ForegroundColor Gray
} catch {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "   AWS CLI não instalado!" -ForegroundColor Red
    $allPassed = $false
}

Write-Host ""

# Test 2: STS (Identity)
Write-Host "2️⃣  STS (Identity)..." -NoNewline
try {
    $identity = aws sts get-caller-identity 2>&1 | ConvertFrom-Json
    Write-Host " ✅" -ForegroundColor Green
    Write-Host "   Account: $($identity.Account)" -ForegroundColor Gray
    Write-Host "   User: $($identity.Arn)" -ForegroundColor Gray
} catch {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "   Erro: $_" -ForegroundColor Red
    $allPassed = $false
}

Write-Host ""

# Test 3: EC2 (This was failing!)
Write-Host "3️⃣  EC2 (era o problema)..." -NoNewline
try {
    $regions = aws ec2 describe-regions --region sa-east-1 2>&1 | ConvertFrom-Json
    Write-Host " ✅" -ForegroundColor Green
    Write-Host "   Regiões encontradas: $($regions.Regions.Count)" -ForegroundColor Gray
} catch {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "   Erro: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "   ⚠️  EC2 ainda está falhando!" -ForegroundColor Yellow
    Write-Host "   Você criou novas credenciais?" -ForegroundColor Yellow
    Write-Host "   Execute: aws configure" -ForegroundColor Cyan
    $allPassed = $false
}

Write-Host ""

# Test 4: S3
Write-Host "4️⃣  S3..." -NoNewline
try {
    aws s3 ls 2>&1 | Out-Null
    Write-Host " ✅" -ForegroundColor Green
} catch {
    Write-Host " ❌" -ForegroundColor Red
    $allPassed = $false
}

Write-Host ""

# Test 5: IAM
Write-Host "5️⃣  IAM..." -NoNewline
try {
    $users = aws iam list-users 2>&1 | ConvertFrom-Json
    Write-Host " ✅" -ForegroundColor Green
    Write-Host "   Usuários: $($users.Users.Count)" -ForegroundColor Gray
} catch {
    Write-Host " ❌" -ForegroundColor Red
    $allPassed = $false
}

Write-Host ""

# Test 6: Region
Write-Host "6️⃣  Região..." -NoNewline
$region = aws configure get region
if ($region -eq "sa-east-1") {
    Write-Host " ✅" -ForegroundColor Green
    Write-Host "   Região: $region (São Paulo)" -ForegroundColor Gray
} else {
    Write-Host " ⚠️" -ForegroundColor Yellow
    Write-Host "   Região: $region (recomendado: sa-east-1)" -ForegroundColor Yellow
}

Write-Host ""

# Test 7: Terraform
Write-Host "7️⃣  Terraform..." -NoNewline
try {
    $tfVersion = terraform version 2>&1 | Select-Object -First 1
    Write-Host " ✅" -ForegroundColor Green
    Write-Host "   $tfVersion" -ForegroundColor Gray
} catch {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "   Terraform não instalado!" -ForegroundColor Red
    $allPassed = $false
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan

# Summary
if ($allPassed) {
    Write-Host "🎉 TUDO FUNCIONANDO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos passos:" -ForegroundColor Cyan
    Write-Host "1. cd terraform" -ForegroundColor Gray
    Write-Host "2. terraform plan" -ForegroundColor Gray
    Write-Host "3. terraform apply" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Documentação:" -ForegroundColor Cyan
    Write-Host "- MIGRATION-GUIDE.md" -ForegroundColor Gray
    Write-Host "- FIRST-DEPLOY.md" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "❌ ALGUNS TESTES FALHARAM" -ForegroundColor Red
    Write-Host ""
    Write-Host "Siga as instruções em:" -ForegroundColor Yellow
    Write-Host "- CRITICAL-FIX-NOW.md" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Resumo:" -ForegroundColor Yellow
    Write-Host "1. Deletar access keys antigas" -ForegroundColor Gray
    Write-Host "2. Criar nova access key" -ForegroundColor Gray
    Write-Host "3. Executar: aws configure" -ForegroundColor Gray
    Write-Host "4. Executar este script novamente" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Show current credentials (masked)
Write-Host "Credenciais atuais:" -ForegroundColor Cyan
aws configure list

Write-Host ""
