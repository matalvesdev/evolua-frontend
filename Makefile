.PHONY: help install dev build test lint format clean setup reset

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)Evolua CRM - Development Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# Setup
setup: ## Initial project setup (install dependencies)
	@echo "$(BLUE)Setting up project...$(NC)"
	npm install
	cd frontend-evolua && npm install && cd ..
	cd backend-evolua/backend-evolua && npm install && cd ../..
	@echo "$(GREEN)✓ Setup complete$(NC)"

install: ## Install all dependencies
	@echo "$(BLUE)Installing dependencies...$(NC)"
	npm install
	cd frontend-evolua && npm install
	cd ../backend-evolua/backend-evolua && npm install

# Development
dev-frontend: ## Start frontend development server
	@echo "$(BLUE)Starting frontend...$(NC)"
	cd frontend-evolua && npm run dev

dev-backend: ## Start backend development server
	@echo "$(BLUE)Starting backend...$(NC)"
	cd backend-evolua/backend-evolua && npm run start:dev

dev: ## Start both frontend and backend in parallel
	@echo "$(BLUE)Starting all services...$(NC)"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:3333"
	@echo ""
	npm run dev

# Building
build-frontend: ## Build frontend for production
	@echo "$(BLUE)Building frontend...$(NC)"
	cd frontend-evolua && npm run build && cd ..
	@echo "$(GREEN)✓ Frontend build complete$(NC)"

build-backend: ## Build backend for production
	@echo "$(BLUE)Building backend...$(NC)"
	cd backend-evolua/backend-evolua && npm run build && cd ../..
	@echo "$(GREEN)✓ Backend build complete$(NC)"

build: build-frontend build-backend ## Build both frontend and backend

# Testing
test-frontend: ## Run frontend tests
	@echo "$(BLUE)Testing frontend...$(NC)"
	cd frontend-evolua && npm run test

test-backend: ## Run backend tests
	@echo "$(BLUE)Testing backend...$(NC)"
	cd backend-evolua/backend-evolua && npm run test

test: ## Run all tests
	@echo "$(BLUE)Running all tests...$(NC)"
	cd frontend-evolua && npm run test
	cd ../backend-evolua/backend-evolua && npm run test

test-watch: ## Run tests in watch mode
	@echo "$(BLUE)Running tests in watch mode...$(NC)"
	cd frontend-evolua && npm run test -- --watch

test-coverage: ## Generate test coverage report
	@echo "$(BLUE)Generating coverage...$(NC)"
	cd frontend-evolua && npm run test -- --coverage
	cd ../backend-evolua/backend-evolua && npm run test:cov

# Linting & Formatting
lint-frontend: ## Lint frontend code
	@echo "$(BLUE)Linting frontend...$(NC)"
	cd frontend-evolua && npm run lint

lint-backend: ## Lint backend code
	@echo "$(BLUE)Linting backend...$(NC)"
	cd backend-evolua/backend-evolua && npm run lint

lint: ## Lint all code
	@echo "$(BLUE)Linting all code...$(NC)"
	cd frontend-evolua && npm run lint
	cd ../backend-evolua/backend-evolua && npm run lint

format-frontend: ## Format frontend code with prettier
	@echo "$(BLUE)Formatting frontend...$(NC)"
	cd frontend-evolua && npm run format

format-backend: ## Format backend code with prettier
	@echo "$(BLUE)Formatting backend...$(NC)"
	cd backend-evolua/backend-evolua && npm run format

format: ## Format all code with prettier
	@echo "$(BLUE)Formatting all code...$(NC)"
	npx prettier --write "frontend-evolua/src/**/*.{ts,tsx,json,css}"
	npx prettier --write "backend-evolua/backend-evolua/src/**/*.ts"
	@echo "$(GREEN)✓ Formatting complete$(NC)"

type-check-frontend: ## Run TypeScript type-check on frontend
	@echo "$(BLUE)Type-checking frontend...$(NC)"
	cd frontend-evolua && npm run type-check

type-check-backend: ## Run TypeScript type-check on backend
	@echo "$(BLUE)Type-checking backend...$(NC)"
	cd backend-evolua/backend-evolua && npx tsc --noEmit

type-check: ## Type-check all code
	@echo "$(BLUE)Type-checking all code...$(NC)"
	cd frontend-evolua && npm run type-check
	cd ../backend-evolua/backend-evolua && npx tsc --noEmit

# Database
db-migrate: ## Run database migrations
	@echo "$(BLUE)Running migrations...$(NC)"
	cd backend-evolua/backend-evolua && npm run prisma:migrate

db-push: ## Push schema changes to database
	@echo "$(BLUE)Pushing database schema...$(NC)"
	cd backend-evolua/backend-evolua && npm run prisma:push

db-studio: ## Open Prisma Studio
	@echo "$(BLUE)Opening Prisma Studio...$(NC)"
	cd backend-evolua/backend-evolua && npm run prisma:studio

# Git
commit-msg-help: ## Show git commit message format
	@echo "$(BLUE)Commit Message Format (Conventional Commits)$(NC)"
	@echo ""
	@echo "Format: type(scope): subject"
	@echo ""
	@echo "Types:"
	@echo "  $(GREEN)feat$(NC)     - A new feature"
	@echo "  $(GREEN)fix$(NC)      - A bug fix"
	@echo "  $(GREEN)docs$(NC)     - Documentation only changes"
	@echo "  $(GREEN)style$(NC)    - Changes that don't affect code meaning"
	@echo "  $(GREEN)refactor$(NC) - Code change without bug fix or feature"
	@echo "  $(GREEN)perf$(NC)     - Performance improvement"
	@echo "  $(GREEN)test$(NC)     - Adding or updating tests"
	@echo "  $(GREEN)chore$(NC)    - Build/dependency changes"
	@echo "  $(GREEN)ci$(NC)       - CI/CD configuration changes"
	@echo "  $(GREEN)revert$(NC)   - Revert a previous commit"
	@echo ""
	@echo "Examples:"
	@echo "  $(YELLOW)feat(auth): add login functionality$(NC)"
	@echo "  $(YELLOW)fix(patients): resolve list pagination$(NC)"
	@echo "  $(YELLOW)docs: update README with setup instructions$(NC)"
	@echo "  $(YELLOW)refactor(api): simplify error handling$(NC)"

# Cleaning
clean-frontend: ## Clean frontend build artifacts
	@echo "$(BLUE)Cleaning frontend...$(NC)"
	cd frontend-evolua && rm -rf .next node_modules dist && cd ..
	@echo "$(GREEN)✓ Frontend cleaned$(NC)"

clean-backend: ## Clean backend build artifacts
	@echo "$(BLUE)Cleaning backend...$(NC)"
	cd backend-evolua/backend-evolua && rm -rf dist node_modules && cd ../..
	@echo "$(GREEN)✓ Backend cleaned$(NC)"

clean: clean-frontend clean-backend ## Clean all build artifacts
	@echo "$(GREEN)✓ All cleaned$(NC)"

reset: clean install ## Full reset (clean install)
	@echo "$(GREEN)✓ Full reset complete$(NC)"

# Docker
docker-build: ## Build Docker image for backend
	@echo "$(BLUE)Building Docker image...$(NC)"
	docker build -t evolua-backend:latest ./backend-evolua
	@echo "$(GREEN)✓ Docker image built$(NC)"

docker-push: ## Push Docker image to ECR (requires AWS credentials)
	@echo "$(BLUE)Pushing to ECR...$(NC)"
	docker push evolua-backend:latest
	@echo "$(GREEN)✓ Pushed to ECR$(NC)"

# Verify
verify: lint type-check test ## Run all checks (lint, type-check, test)
	@echo "$(GREEN)✓ All checks passed$(NC)"

status: ## Show project status
	@echo "$(BLUE)Project Status$(NC)"
	@echo ""
	@echo "Frontend:"
	@echo "  Dev server:  http://localhost:3000"
	@echo "  Build:       npm run build"
	@echo "  Tests:       npm run test"
	@echo ""
	@echo "Backend:"
	@echo "  Dev server:  http://localhost:3333"
	@echo "  Build:       npm run build"
	@echo "  Tests:       npm run test"
	@echo ""
	@echo "Database:"
	@echo "  Studio:      npx prisma studio"
	@echo "  Migrate:     npx prisma migrate dev"

# Default
.DEFAULT_GOAL := help
