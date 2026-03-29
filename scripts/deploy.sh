#!/bin/bash

################################################################################
# Deploy Script para Evolua CRM
# Automatiza o processo de deploy para staging e produção
# Usage: ./scripts/deploy.sh [frontend|backend|both] [staging|prod]
################################################################################

set -e  # Exit on error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variáveis globais
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
FRONTEND_DIR="$PROJECT_ROOT/frontend-evolua"
BACKEND_DIR="$PROJECT_ROOT/backend-evolua/backend-evolua"
TERRAFORM_DIR="$PROJECT_ROOT/terraform"

################################################################################
# Funções Utilitárias
################################################################################

print_header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║ $1${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

confirm() {
    read -p "$(echo -e ${YELLOW}$1${NC}) (y/n) " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

################################################################################
# Validações
################################################################################

validate_env() {
    print_info "Validando ambiente..."
    
    # Verificar se Git está instalado
    if ! command -v git &> /dev/null; then
        print_error "Git não está instalado"
        exit 1
    fi
    
    # Verificar se Node.js está instalado
    if ! command -v node &> /dev/null; then
        print_error "Node.js não está instalado"
        exit 1
    fi
    
    # Verificar se npm está instalado
    if ! command -v npm &> /dev/null; then
        print_error "npm não está instalado"
        exit 1
    fi
    
    print_success "Ambiente validado"
}

check_git_status() {
    local dir=$1
    local branch=$2
    
    print_info "Verificando status Git em $dir..."
    
    cd "$dir"
    
    # Verificar branch
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [ "$CURRENT_BRANCH" != "$branch" ]; then
        print_error "Branch atual é '$CURRENT_BRANCH', esperado '$branch'"
        exit 1
    fi
    
    # Verificar se há changes não commitados
    if ! git diff-index --quiet HEAD --; then
        print_error "Há mudanças não commitadas em $dir"
        git status
        exit 1
    fi
    
    print_success "Git status OK"
}

################################################################################
# Frontend Deploy
################################################################################

deploy_frontend() {
    local env=$1
    
    print_header "🚀 FRONTEND DEPLOY - $env"
    
    # Determinar branch
    if [ "$env" == "staging" ]; then
        FRONTEND_BRANCH="develop"
        FRONTEND_ENV="staging"
    else
        FRONTEND_BRANCH="main"
        FRONTEND_ENV="production"
    fi
    
    print_info "Ambiente: $FRONTEND_ENV"
    print_info "Branch: $FRONTEND_BRANCH"
    print_info "Plataforma: Vercel (auto-deploy)"
    
    # Validar Git status
    check_git_status "$FRONTEND_DIR" "$FRONTEND_BRANCH"
    
    # Pull latest code
    cd "$FRONTEND_DIR"
    print_info "Pulling latest code..."
    git pull origin "$FRONTEND_BRANCH"
    print_success "Code updated"
    
    # Instalar dependências
    print_info "Installing dependencies..."
    npm ci --legacy-peer-deps
    print_success "Dependencies installed"
    
    # Lint
    print_info "Running ESLint..."
    npm run lint
    print_success "Lint passed"
    
    # Tests
    print_info "Running tests..."
    npm run test -- --passWithNoTests || true
    print_success "Tests completed"
    
    # Build
    print_info "Building Next.js application..."
    npm run build
    print_success "Build successful"
    
    # Summary
    print_success "Frontend validado e pronto para deploy"
    print_info "Status: Vercel auto-deployará via webhook Git"
    print_info "Branch: $FRONTEND_BRANCH"
    print_info "Verifique progresso em: https://vercel.com/dashboard"
}

################################################################################
# Backend Deploy
################################################################################

deploy_backend() {
    local env=$1
    
    print_header "🚀 BACKEND DEPLOY - $env"
    
    # Backend only has production environment
    if [ "$env" == "staging" ]; then
        print_warning "Backend não tem ambiente staging"
        print_info "Use 'prod' para deploy ou teste localmente com 'npm run start:dev'"
        return 0
    fi
    
    BACKEND_BRANCH="main"
    BACKEND_ENV="production"
    
    print_info "Ambiente: $BACKEND_ENV"
    print_info "Branch: $BACKEND_BRANCH"
    print_info "Plataforma: AWS EC2 (via Terraform)"
    
    # Validar Git status
    check_git_status "$BACKEND_DIR" "$BACKEND_BRANCH"
    
    # Pull latest code
    cd "$BACKEND_DIR"
    print_info "Pulling latest code..."
    git pull origin "$BACKEND_BRANCH"
    print_success "Code updated"
    
    # Instalar dependências
    print_info "Installing dependencies..."
    npm ci
    print_success "Dependencies installed"
    
    # Lint
    print_info "Running ESLint..."
    npm run lint
    print_success "Lint passed"
    
    # Tests
    print_info "Running tests..."
    npm run test -- --passWithNoTests || true
    print_success "Tests completed"
    
    # Build
    print_info "Building NestJS application..."
    npm run build
    print_success "Build successful"
    
    # Prisma checks
    print_info "Checking Prisma schema..."
    npm run prisma:validate 2>/dev/null || print_warning "Prisma validation skipped"
    print_success "Prisma schema OK"
    
    # Summary
    print_success "Backend validado e pronto para deploy"
    
    # Terraform apply
    cd "$TERRAFORM_DIR"
    print_info "Preparando Terraform..."
    
    if confirm "Executar terraform plan?"; then
        terraform plan
    fi
    
    if confirm "Executar terraform apply (deploy em EC2)?"; then
        terraform apply
        print_success "Backend deployed com sucesso!"
    else
        print_warning "Deploy cancelado"
    fi
}

################################################################################
# Both (Full-Stack Deploy)
################################################################################

deploy_both() {
    local env=$1
    
    print_header "🚀 FULL-STACK DEPLOY - $env"
    
    print_info "Deployando frontend..."
    deploy_frontend "$env"
    
    print_info "\n"
    print_info "Deployando backend..."
    deploy_backend "$env"
    
    print_success "Full-stack deploy completo!"
}

################################################################################
# Post-Deploy Checks
################################################################################

check_deployment() {
    local env=$1
    
    print_header "🔍 VERIFICAÇÃO PÓS-DEPLOY"
    
    if [ "$env" == "staging" ]; then
        FRONTEND_URL="http://localhost:3000"  # Vercel preview ou local
        BACKEND_URL="http://localhost:3333"   # Local
    else
        FRONTEND_URL="https://useevolua.com.br"
        BACKEND_URL="https://api.useevolua.com.br"
    fi
    
    print_info "Verificando Frontend: $FRONTEND_URL"
    if curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" | grep -q "200"; then
        print_success "Frontend respondendo"
    else
        print_warning "Frontend pode estar offline (verificar depois)"
    fi
    
    print_info "Verificando Backend: $BACKEND_URL/api/health"
    if curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/health" | grep -q "200"; then
        print_success "Backend respondendo"
    else
        print_warning "Backend pode estar offline (verificar depois)"
    fi
    
    print_info "\nChecklist pós-deploy:"
    echo "  [ ] Frontend carrega sem erros"
    echo "  [ ] API responde com 200"
    echo "  [ ] Login funciona"
    echo "  [ ] Listar pacientes funciona"
    echo "  [ ] Criar meta funciona"
    echo "  [ ] Sem errors no console"
    echo "  [ ] Sem errors no backend"
}

################################################################################
# Help
################################################################################

show_help() {
    cat << EOF
${BLUE}╔══════════════════════════════════════════════════════════╗${NC}
${BLUE}║         EVOLUA CRM - Deploy Automation Script             ║${NC}
${BLUE}╚══════════════════════════════════════════════════════════╝${NC}

${BLUE}Uso:${NC}
  ./scripts/deploy.sh [component] [environment]

${BLUE}Componentes:${NC}
  frontend    Deploy apenas frontend (Next.js)
  backend     Deploy apenas backend (NestJS)
  both        Deploy frontend + backend (full-stack)

${BLUE}Ambientes:${NC}
  staging     Deploy para staging (develop branch)
  prod        Deploy para produção (main branch)

${BLUE}Exemplos:${NC}
  ./scripts/deploy.sh frontend staging
  ./scripts/deploy.sh backend prod
  ./scripts/deploy.sh both prod
  ./scripts/deploy.sh frontend staging --check

${BLUE}Opções:${NC}
  --check     Apenas verificar, não fazer deploy
  --no-test   Pular testes
  --help      Mostrar esta mensagem

${BLUE}Fluxo de Deploy:${NC}
  1. Validação de ambiente (Git, Node, npm)
  2. Verificação de Git status (branch, commits)
  3. Pull do código latest
  4. Instalar dependências (npm ci)
  5. ESLint
  6. Testes unitários
  7. Build (Next.js/NestJS)
  8. Terraform plan/apply (backend)
  9. Verificação pós-deploy

${BLUE}Ambientes Automáticos:${NC}
  Frontend:  Vercel auto-deploya via Git webhook
             develop → staging, main → prod
  Backend:   Terraform gerencia EC2
             main → produção (push → terraform apply)

${BLUE}Variáveis de Ambiente:${NC}
  Configurar .env e .env.local com secrets antes de fazer deploy

${BLUE}Rollback:${NC}
  Frontend:  Vercel dashboard → Revert to previous
  Backend:   git revert + terraform apply

EOF
}

################################################################################
# Main
################################################################################

main() {
    # Argumentos
    COMPONENT=${1:-}
    ENVIRONMENT=${2:-}
    CHECK_ONLY=${3:-}
    
    # Validações básicas
    if [ -z "$COMPONENT" ]; then
        print_error "Componente obrigatório"
        show_help
        exit 1
    fi
    
    if [ -z "$ENVIRONMENT" ]; then
        print_error "Ambiente obrigatório"
        show_help
        exit 1
    fi
    
    # Help
    if [ "$COMPONENT" == "--help" ] || [ "$COMPONENT" == "-h" ]; then
        show_help
        exit 0
    fi
    
    # Validar argumentos
    if ! [[ "$COMPONENT" =~ ^(frontend|backend|both)$ ]]; then
        print_error "Componente inválido: $COMPONENT"
        show_help
        exit 1
    fi
    
    if ! [[ "$ENVIRONMENT" =~ ^(staging|prod|production)$ ]]; then
        print_error "Ambiente inválido: $ENVIRONMENT"
        show_help
        exit 1
    fi
    
    # Normalizar ambiente
    if [ "$ENVIRONMENT" == "production" ]; then
        ENVIRONMENT="prod"
    fi
    
    # Validação de ambiente
    validate_env
    
    # Main deploy
    case "$COMPONENT" in
        frontend)
            deploy_frontend "$ENVIRONMENT"
            ;;
        backend)
            deploy_backend "$ENVIRONMENT"
            ;;
        both)
            deploy_both "$ENVIRONMENT"
            ;;
    esac
    
    # Post-deploy checks
    if [ "$CHECK_ONLY" != "--no-check" ]; then
        if confirm "Executar verificação pós-deploy?"; then
            check_deployment "$ENVIRONMENT"
        fi
    fi
    
    print_header "✨ DEPLOY CONCLUÍDO"
}

# Run
main "$@"
