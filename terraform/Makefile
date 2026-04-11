# Makefile para Terraform - Evolua CRM

.PHONY: help init plan apply destroy output ssh logs clean

# Variáveis
TERRAFORM := terraform
SSH_KEY := evolua-key.pem

help: ## Mostrar esta ajuda
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

init: ## Inicializar Terraform
	@echo "🔧 Inicializando Terraform..."
	$(TERRAFORM) init

validate: ## Validar configuração
	@echo "✅ Validando configuração..."
	$(TERRAFORM) validate

plan: ## Planejar mudanças
	@echo "📋 Planejando mudanças..."
	$(TERRAFORM) plan

apply: ## Aplicar mudanças
	@echo "🚀 Aplicando mudanças..."
	$(TERRAFORM) apply

apply-auto: ## Aplicar mudanças automaticamente (sem confirmação)
	@echo "🚀 Aplicando mudanças automaticamente..."
	$(TERRAFORM) apply -auto-approve

destroy: ## Destruir infraestrutura
	@echo "🗑️  Destruindo infraestrutura..."
	$(TERRAFORM) destroy

destroy-auto: ## Destruir infraestrutura automaticamente (sem confirmação)
	@echo "🗑️  Destruindo infraestrutura automaticamente..."
	$(TERRAFORM) destroy -auto-approve

output: ## Mostrar outputs
	@echo "📊 Outputs:"
	@$(TERRAFORM) output

output-json: ## Mostrar outputs em JSON
	@$(TERRAFORM) output -json

ssh: ## Conectar via SSH ao servidor
	@echo "🔐 Conectando ao servidor..."
	@IP=$$($(TERRAFORM) output -raw app_public_ip 2>/dev/null); \
	if [ -z "$$IP" ]; then \
		echo "❌ Erro: IP não encontrado. Execute 'make apply' primeiro."; \
		exit 1; \
	fi; \
	if [ ! -f "$(SSH_KEY)" ]; then \
		echo "❌ Erro: Chave SSH '$(SSH_KEY)' não encontrada."; \
		exit 1; \
	fi; \
	ssh -i $(SSH_KEY) ubuntu@$$IP

logs: ## Ver logs do servidor
	@echo "📋 Logs do servidor..."
	@IP=$$($(TERRAFORM) output -raw app_public_ip 2>/dev/null); \
	if [ -z "$$IP" ]; then \
		echo "❌ Erro: IP não encontrado."; \
		exit 1; \
	fi; \
	ssh -i $(SSH_KEY) ubuntu@$$IP "tail -f /var/log/cloud-init-output.log"

status: ## Ver status da aplicação
	@echo "📊 Status da aplicação..."
	@IP=$$($(TERRAFORM) output -raw app_public_ip 2>/dev/null); \
	if [ -z "$$IP" ]; then \
		echo "❌ Erro: IP não encontrado."; \
		exit 1; \
	fi; \
	ssh -i $(SSH_KEY) ubuntu@$$IP "pm2 status && sudo systemctl status nginx"

deploy: ## Fazer deploy da aplicação
	@echo "🚀 Fazendo deploy..."
	@IP=$$($(TERRAFORM) output -raw app_public_ip 2>/dev/null); \
	if [ -z "$$IP" ]; then \
		echo "❌ Erro: IP não encontrado."; \
		exit 1; \
	fi; \
	ssh -i $(SSH_KEY) ubuntu@$$IP "/home/ubuntu/deploy.sh"

ssl: ## Configurar SSL
	@echo "🔒 Configurando SSL..."
	@IP=$$($(TERRAFORM) output -raw app_public_ip 2>/dev/null); \
	DOMAIN=$$($(TERRAFORM) output -raw app_domain 2>/dev/null); \
	if [ -z "$$IP" ] || [ -z "$$DOMAIN" ]; then \
		echo "❌ Erro: IP ou domínio não encontrado."; \
		exit 1; \
	fi; \
	ssh -i $(SSH_KEY) ubuntu@$$IP "sudo certbot --nginx -d $$DOMAIN"

clean: ## Limpar arquivos temporários
	@echo "🧹 Limpando arquivos temporários..."
	rm -rf .terraform/
	rm -f .terraform.lock.hcl
	rm -f terraform.tfstate.backup
	rm -f outputs.txt
	@echo "✅ Limpeza concluída!"

fmt: ## Formatar arquivos Terraform
	@echo "✨ Formatando arquivos..."
	$(TERRAFORM) fmt -recursive

check: validate fmt ## Validar e formatar
	@echo "✅ Verificação completa!"

setup: ## Setup inicial completo
	@echo "🚀 Setup inicial..."
	@if [ ! -f "terraform.tfvars" ]; then \
		echo "📝 Criando terraform.tfvars..."; \
		cp terraform.tfvars.example terraform.tfvars; \
		echo "⚠️  IMPORTANTE: Edite terraform.tfvars com seus valores!"; \
		echo "   nano terraform.tfvars"; \
		exit 1; \
	fi
	@echo "✅ Arquivo terraform.tfvars encontrado"
	@$(MAKE) init
	@$(MAKE) validate
	@echo "✅ Setup completo! Execute 'make plan' para continuar."

info: ## Mostrar informações da infraestrutura
	@echo "📊 Informações da Infraestrutura:"
	@echo ""
	@echo "🌐 Domínios:"
	@$(TERRAFORM) output -raw landing_domain 2>/dev/null && echo "" || echo "  Landing: N/A"
	@$(TERRAFORM) output -raw app_domain 2>/dev/null && echo "" || echo "  App: N/A"
	@echo ""
	@echo "🖥️  Servidor:"
	@echo "  IP: $$($(TERRAFORM) output -raw app_public_ip 2>/dev/null || echo 'N/A')"
	@echo "  Instance ID: $$($(TERRAFORM) output -raw app_instance_id 2>/dev/null || echo 'N/A')"
	@echo ""
	@echo "🔗 URLs:"
	@echo "  App: $$($(TERRAFORM) output -raw app_url 2>/dev/null || echo 'N/A')"
	@echo "  Landing: $$($(TERRAFORM) output -raw landing_url 2>/dev/null || echo 'N/A')"

cost: ## Estimar custos (requer infracost)
	@if command -v infracost >/dev/null 2>&1; then \
		echo "💰 Estimando custos..."; \
		infracost breakdown --path .; \
	else \
		echo "⚠️  infracost não instalado. Instale em: https://www.infracost.io/docs/"; \
		echo ""; \
		echo "💰 Custos estimados manualmente:"; \
		echo "  - EC2 t2.micro: $$0/mês (12 meses free tier)"; \
		echo "  - EBS 30GB: $$0/mês (30GB free tier)"; \
		echo "  - Data Transfer: $$0/mês (15GB free tier)"; \
		echo "  - DNS: HostGator (fora da AWS)"; \
		echo "  - Total AWS: ~$$0/mês (primeiros 12 meses, sem tráfego excedente)"; \
	fi

.DEFAULT_GOAL := help
