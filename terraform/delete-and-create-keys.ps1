# Script para Deletar Todas as Access Keys e Criar Nova
# Execute este script e siga as instruções

Write-Host "=========================================" -ForegroundColor Red
Write-Host "🔑 Gerenciar Access Keys AWS" -ForegroundColor Red
Write-Host "=========================================" -ForegroundColor Red
Write-Host ""

Write-Host "Este script vai te guiar para:" -ForegroundColor Yellow
Write-Host "1. Deletar TODAS as access keys antigas" -ForegroundColor Yellow
Write-Host "2. Criar uma NOVA access key" -ForegroundColor Yellow
Write-Host "3. Configurar AWS CLI com a nova key" -ForegroundColor Yellow
Write-Host ""

Read-Host "Pressione Enter para começar"

# Passo 1: Abrir IAM Console
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "PASSO 1: Abrir IAM Console" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Abrindo console IAM da AWS..." -ForegroundColor Yellow
Start-Process "https://console.aws.amazon.com/iam/"
Write-Host ""
Write-Host "✅ Console aberto no navegador" -ForegroundColor Green
Write-Host ""
Read-Host "Pressione Enter quando o console carregar"

# Passo 2: Navegar até Security Credentials
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "PASSO 2: Navegar até Security Credentials" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "No console IAM que abriu:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Opção A - Se você está usando conta ROOT:" -ForegroundColor Cyan
Write-Host "  1. Clique no seu nome (canto superior direito)" -ForegroundColor Gray
Write-Host "  2. Clique em 'Security credentials'" -ForegroundColor Gray
Write-Host ""
Write-Host "Opção B - Se você tem usuário IAM:" -ForegroundColor Cyan
Write-Host "  1. No menu lateral, clique em 'Users'" -ForegroundColor Gray
Write-Host "  2. Clique no seu usuário (ex: admin)" -ForegroundColor Gray
Write-Host "  3. Clique na aba 'Security credentials'" -ForegroundColor Gray
Write-Host ""
Read-Host "Pressione Enter quando estiver na página Security credentials"

# Passo 3: Deletar Access Keys Antigas
Write-Host ""
Write-Host "=========================================" -ForegroundColor Red
Write-Host "PASSO 3: Deletar TODAS as Access Keys" -ForegroundColor Red
Write-Host "=========================================" -ForegroundColor Red
Write-Host ""
Write-Host "Na página Security credentials:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Role a página até a seção 'Access keys'" -ForegroundColor Cyan
Write-Host "2. Você verá uma lista de access keys" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para CADA access key na lista:" -ForegroundColor Yellow
Write-Host "  a. Clique em 'Actions' (ao lado da key)" -ForegroundColor Gray
Write-Host "  b. Clique em 'Deactivate'" -ForegroundColor Gray
Write-Host "  c. Confirme clicando em 'Deactivate' novamente" -ForegroundColor Gray
Write-Host "  d. Clique em 'Actions' novamente" -ForegroundColor Gray
Write-Host "  e. Clique em 'Delete'" -ForegroundColor Gray
Write-Host "  f. Confirme clicando em 'Delete' novamente" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Delete TODAS as access keys!" -ForegroundColor Red
Write-Host ""
Write-Host "Access keys conhecidas que você deve deletar:" -ForegroundColor Yellow
Write-Host "  - AKIAQ3EGUNNKRVXF3U5MN (exposta publicamente)" -ForegroundColor Red
Write-Host "  - AKIAQ3EGUNNKS2STUC5N (EC2 bloqueado)" -ForegroundColor Red
Write-Host "  - Qualquer outra que aparecer" -ForegroundColor Red
Write-Host ""
Read-Host "Pressione Enter quando TODAS as keys estiverem deletadas"

# Passo 4: Criar Nova Access Key
Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "PASSO 4: Criar Nova Access Key" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Ainda na página Security credentials:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Clique no botão 'Create access key'" -ForegroundColor Cyan
Write-Host "2. Selecione 'Command Line Interface (CLI)'" -ForegroundColor Cyan
Write-Host "3. Marque a caixa 'I understand the above recommendation...'" -ForegroundColor Cyan
Write-Host "4. Clique em 'Next'" -ForegroundColor Cyan
Write-Host "5. (Opcional) Descrição: 'Terraform CLI - Março 2026'" -ForegroundColor Cyan
Write-Host "6. Clique em 'Create access key'" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  ATENÇÃO: Na próxima tela você verá:" -ForegroundColor Red
Write-Host "  - Access key ID: AKIA..." -ForegroundColor Yellow
Write-Host "  - Secret access key: ..." -ForegroundColor Yellow
Write-Host ""
Write-Host "🚨 A SECRET KEY SÓ APARECE UMA VEZ!" -ForegroundColor Red
Write-Host ""
Read-Host "Pressione Enter quando a access key for criada e você estiver vendo as credenciais"

# Passo 5: Copiar Credenciais
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "PASSO 5: Copiar Credenciais" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Agora você precisa copiar as credenciais." -ForegroundColor Yellow
Write-Host ""
Write-Host "No console AWS:" -ForegroundColor Cyan
Write-Host "1. Clique em 'Show' ao lado de 'Secret access key'" -ForegroundColor Gray
Write-Host "2. Copie a 'Access key ID' (começa com AKIA...)" -ForegroundColor Gray
Write-Host "3. Copie a 'Secret access key' (string longa)" -ForegroundColor Gray
Write-Host ""
Write-Host "Dica: Use o botão de copiar ao lado de cada campo" -ForegroundColor Yellow
Write-Host ""
Read-Host "Pressione Enter quando tiver copiado AMBAS as credenciais"

# Passo 6: Configurar AWS CLI
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "PASSO 6: Configurar AWS CLI" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Agora vamos configurar o AWS CLI com as NOVAS credenciais." -ForegroundColor Yellow
Write-Host ""
Write-Host "Quando solicitado:" -ForegroundColor Cyan
Write-Host "  1. AWS Access Key ID: Cole a access key que você copiou" -ForegroundColor Gray
Write-Host "  2. AWS Secret Access Key: Cole a secret key que você copiou" -ForegroundColor Gray
Write-Host "  3. Default region name: Digite 'sa-east-1'" -ForegroundColor Gray
Write-Host "  4. Default output format: Digite 'json'" -ForegroundColor Gray
Write-Host ""
Read-Host "Pressione Enter para iniciar a configuração"

Write-Host ""
Write-Host "Executando: aws configure" -ForegroundColor Yellow
Write-Host ""

# Executar aws configure
aws configure

# Passo 7: Verificar Configuração
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "PASSO 7: Verificar Configuração" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Testando as novas credenciais..." -ForegroundColor Yellow
Write-Host ""

# Teste 1: Identity
Write-Host "Teste 1: Verificando identidade..." -NoNewline
try {
    $identity = aws sts get-caller-identity 2>&1 | ConvertFrom-Json
    Write-Host " ✅" -ForegroundColor Green
    Write-Host "  Account: $($identity.Account)" -ForegroundColor Gray
    Write-Host "  User: $($identity.Arn)" -ForegroundColor Gray
} catch {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "  Erro: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️  As credenciais não estão funcionando!" -ForegroundColor Red
    Write-Host "Verifique se você copiou corretamente." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Execute novamente: .\delete-and-create-keys.ps1" -ForegroundColor Cyan
    exit 1
}

Write-Host ""

# Teste 2: EC2 (o que estava falhando!)
Write-Host "Teste 2: Verificando acesso EC2 (era o problema)..." -NoNewline
try {
    $regions = aws ec2 describe-regions --region sa-east-1 2>&1 | ConvertFrom-Json
    Write-Host " ✅" -ForegroundColor Green
    Write-Host "  Regiões encontradas: $($regions.Regions.Count)" -ForegroundColor Gray
} catch {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "  Erro: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️  EC2 ainda está falhando!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possíveis causas:" -ForegroundColor Yellow
    Write-Host "1. Você não deletou todas as keys antigas" -ForegroundColor Gray
    Write-Host "2. A nova key não tem permissões EC2" -ForegroundColor Gray
    Write-Host "3. Você está usando conta root sem permissões" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Solução:" -ForegroundColor Cyan
    Write-Host "1. Volte ao console IAM" -ForegroundColor Gray
    Write-Host "2. Verifique se TODAS as keys antigas foram deletadas" -ForegroundColor Gray
    Write-Host "3. Verifique permissões do usuário (deve ter EC2FullAccess)" -ForegroundColor Gray
    exit 1
}

Write-Host ""

# Teste 3: Região
Write-Host "Teste 3: Verificando região..." -NoNewline
$region = aws configure get region
if ($region -eq "sa-east-1") {
    Write-Host " ✅" -ForegroundColor Green
    Write-Host "  Região: $region (São Paulo)" -ForegroundColor Gray
} else {
    Write-Host " ⚠️" -ForegroundColor Yellow
    Write-Host "  Região: $region (recomendado: sa-east-1)" -ForegroundColor Yellow
}

Write-Host ""

# Sucesso!
Write-Host "=========================================" -ForegroundColor Green
Write-Host "🎉 SUCESSO! Tudo Funcionando!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Todas as access keys antigas foram deletadas" -ForegroundColor Green
Write-Host "✅ Nova access key criada e configurada" -ForegroundColor Green
Write-Host "✅ AWS CLI funcionando corretamente" -ForegroundColor Green
Write-Host "✅ Acesso EC2 restaurado" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "1. terraform plan" -ForegroundColor Gray
Write-Host "2. terraform apply" -ForegroundColor Gray
Write-Host ""
Write-Host "Documentação:" -ForegroundColor Cyan
Write-Host "- MIGRATION-GUIDE.md - Guia de migração completo" -ForegroundColor Gray
Write-Host "- FIRST-DEPLOY.md - Primeiro deploy" -ForegroundColor Gray
Write-Host ""

# Mostrar credenciais configuradas (mascaradas)
Write-Host "Credenciais configuradas:" -ForegroundColor Cyan
aws configure list
Write-Host ""

Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
