# 🚀 Configurações Adicionadas para Potencializar Desenvolvimento

**Data**: 25 de março de 2026  
**Adicionado**: Estrutura completa de desenvolvimento otimizado

---

## 📋 Novos Arquivos de Configuração

### 1. **.prettierrc** - Formatação Consistente
Garante que todo o código seja formatado igualmente.
```bash
# Usar embutido ou rodar manualmente
npm run format
```

### 2. **.editorconfig** - Configuração Universal de Editor
Aplica settings consistentes independente do editor (VS Code, etc).
- Charset UTF-8
- Line endings LF
- 2 spaces indent

### 3. **.husky/** - Git Hooks Automáticos
Roda verificações automaticamente antes de cada commit.

**Pre-commit** (`.husky/pre-commit`):
- ✅ Type-check TypeScript
- ✅ ESLint validation
- ✅ Prettier formatting
- ✅ Re-add formatted files

**Commit-msg** (`.husky/commit-msg`):
- ✅ Valida formato (Conventional Commits)
- ✅ Rejeita commits mal formatados
- ✅ Garante mensagens descritivas

**Como usar**:
```bash
# Mensagens válidas:
git commit -m "feat(auth): add login page"
git commit -m "fix(patients): resolve list pagination"
git commit -m "docs: update README"

# Mensagens inválidas (serão rejeitadas):
git commit -m "Update code"
git commit -m "fixes"
```

---

## 🛠️ Makefile - Comandos Úteis

Simplifica execução de tasks comuns.

```bash
make help                    # Mostrar todos os comandos disponíveis

# Setup
make setup                   # Instalar dependências (primeira vez)
make install                 # Instalar deps novamente

# Desenvolvimento
make dev                     # Rodar frontend + backend
make dev-frontend            # Apenas frontend
make dev-backend             # Apenas backend

# Build
make build                   # Build frontend + backend
make build-frontend
make build-backend

# Testes
make test                    # Rodar todos os testes
make test-frontend
make test-backend
make test-watch              # Modo watch
make test-coverage           # Coverage report

# Linting & Formatting
make lint                    # ESLint todos os projetos
make format                  # Prettier format tudo
make type-check              # TypeScript type-check

# Database
make db-studio               # Abrir Prisma Studio
make db-migrate              # Rodar migrations
make db-push                 # Push schema changes

# Limpeza
make clean                   # Remover build artifacts
make reset                   # Full reset (clean + install)

# Git
make commit-msg-help         # Mostrar formato de mensagens
```

**Exemplo**:
```bash
cd ~/fono-v2
make dev                     # Start frontend + backend
make format                  # Format code
make test                    # Run all tests
```

---

## 🎭 Agents / Personas do Copilot

Localizados em `.claude/agents/`:

- **architect.md** - Design, arquitetura, refatoração
- **frontend-dev.md** - React, TypeScript, componentes
- **backend-dev.md** - NestJS, Prisma, APIs
- **qa-tester.md** - Testes, qualidade, security
- **devops.md** - Deploy, CI/CD, infraestrutura
- **product-owner.md** - Requisitos, specs, features

**Como usar**:
```
@copilot (architect) revise a estrutura deste código

@copilot (frontend-dev) crie um componente para [feature]

@copilot (backend-dev) crie endpoint para [feature]

@copilot (qa) escreva testes para [função]

@copilot (devops) configure GitHub Actions
```

---

## 🔧 VS Code - Extensões Recomendadas

Arquivo: `.vscode/extensions.json`

**Principais extensões**:
- **GitHub Copilot** - IA para desenvolvimento
- **Copilot Chat** - Chat com IA
- **ESLint** - Linting
- **Prettier** - Formatação
- **GitLens** - Git integration
- **Tailwind CSS** - IntelliSense
- **Material Icons** - File icons
- **Remote Development** - SSH, WSL, Docker
- e mais...

**Instalar recomendadas**:
```bash
# VS Code askará automaticamente
# Ou manualmente: Ctrl+Shift+X > Ver "Extensões Recomendadas"
```

---

## 🐛 VS Code - Debugging

Arquivo: `.vscode/launch.json`

**Configurações disponíveis**:
- Frontend Dev
- Backend Debug
- Backend Tests
- Frontend Tests
- Chrome Debugging
- Full Stack (frontend + backend)

**Como usar**:
1. Abrir `.vscode/launch.json`
2. Abrir Debug view (Ctrl+Shift+D)
3. Selecionar configuração
4. Pressionar Play (F5)

**Exemplo - Debugar backend**:
```bash
# 1. Colocar breakpoint no código
# 2. No Debug view, selecionar "Backend Debug"
# 3. Pressionar F5
# 4. Código executa até breakpoint
```

---

## 📋 VS Code - Tasks

Arquivo: `.vscode/tasks.json`

**Run tasks**:
```bash
Ctrl+Shift+P > Tasks: Run Task > Selecionar

Ou direto do Terminal:
- Frontend Dev
- Backend Dev
- Database - Prisma Studio
- Frontend - Lint
- Frontend - Format
- Test - Frontend
- etc...
```

---

## 📦 Environment Files

Caminho: `frontend-evolua/.env.example` e `backend-evolua/backend-evolua/.env.example`

**Para novo setup**:
```bash
# Frontend
cp frontend-evolua/.env.example frontend-evolua/.env.local
# Editar .env.local com valores reais

# Backend
cp backend-evolua/backend-evolua/.env.example backend-evolua/backend-evolua/.env
# Editar .env com valores reais
```

---

## ✅ Checklist de Setup Completo

```
Primeiro setup:
☐ Clone repositório
☐ make setup (instalar deps)
☐ Copiar .env.example → .env.local (frontend)
☐ Copiar .env.example → .env (backend)
☐ Preencher valores de ambiente
☐ make db-migrate (migrations)
☐ make dev (start dev servers)

Dia a dia:
☐ make dev (ou F5 para debug)
☐ make format (antes de comitar)
☐ Escrever commits com formato correto
☐ make test (antes de push)
```

---

## 🎯 Workflow Otimizado

### 1. Começar Feature
```bash
make dev                                    # Start servers
# @copilot (product) especifique requisito
# @copilot (architecture) design solução
```

### 2. Implementar
```bash
# @copilot (frontend-dev) implemente componente
# @copilot (backend-dev) implemente endpoint
make format                                 # Format code
make lint                                   # Check linting
```

### 3. Testar
```bash
make test                                   # Run tests
# @copilot (qa) escreva testes faltando
make test-coverage                          # Coverage report
```

### 4. Comitar
```bash
# Git hooks rodam automaticamente
git add .
git commit -m "feat(patients): add filter by status"
# Se commit-msg inválida, rejeita - corrija e tente novamente
```

### 5. Push & Deploy
```bash
git push origin feature/nome
# Abrir PR no GitHub
# @copilot (devops) verifique CI/CD
```

---

## 📊 Comandos Mais Usados

```bash
# Desenvolvimento diário
make dev                    # Start full stack
make format                 # Format code
make lint                   # Check for errors
make test                   # Run tests

# Debugging
Ctrl+Shift+D               # Open Debug view
F5                         # Start debugging

# Database
make db-studio             # Prisma visual editor
make db-migrate            # Run migrations

# Git
make commit-msg-help       # See commit format
git commit -m "type: msg"  # Commit with validation
```

---

## 🆘 Troubleshooting

### Git hooks não rodam
```bash
# Verificar se .husky/pre-commit é executável
ls -la .husky/
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

### Prettier conflita com ESLint
```bash
# Make format já trata isso
make format
```

### Commit rejeitado por commit-msg
```bash
# Verificar formato esperado
make commit-msg-help

# Exemplos válidos:
git commit -m "feat(auth): add login functionality"
git commit -m "fix(patients): resolve list pagination"
```

### Copilot agents não funcionam
```bash
# Ler README em .claude/agents/
cat .claude/agents/README.md

# Usar formatação correta
@copilot (frontend-dev) sua pergunta
```

---

## 📚 Recursos

- **Padrões de código**: `.claude/commands/typescript-patterns.md`
- **Estrutura de pastas**: `.claude/commands/structure-reference.md`
- **Troubleshooting**: `.claude/commands/troubleshooting.md`
- **Agents**: `.claude/agents/README.md`
- **Makefile help**: `make help`
- **VS Code tasks**: Ctrl+Shift+P > Tasks: Run Task

---

## 🎉 Próximas Steps

1. ✅ Ler este arquivo
2. ✅ Rodar `make setup`
3. ✅ Rodar `make dev`
4. ✅ Começar usando agents do Copilot
5. ✅ Copiar `.env.example` e preencher valores

**Bom desenvolvimento! 🚀**

