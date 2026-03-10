# 🚀 Começando com Evolua CRM

Guia rápido para começar a usar o projeto.

---

## 🎯 O que você quer fazer?

### 1️⃣ Fazer Deploy em Produção

**Tempo:** 30-60 minutos  
**Custo:** ~$0.50/mês (primeiros 12 meses)

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars  # Preencher valores
terraform init
terraform apply
```

📖 **Guia completo:** [`terraform/FIRST-DEPLOY.md`](terraform/FIRST-DEPLOY.md)

---

### 2️⃣ Desenvolver Localmente

**Tempo:** 10 minutos  
**Custo:** Gratuito

```bash
cd frontend-evolua
npm install
cp .env.example .env.local
nano .env.local  # Preencher valores
npm run dev
```

📖 **Guia completo:** [`frontend-evolua/README.md`](frontend-evolua/README.md)

---

### 3️⃣ Entender a Arquitetura

**Tempo:** 15 minutos  
**Leitura recomendada:**

1. [`README.md`](README.md) - Visão geral
2. [`spec/project-analysis.md`](spec/project-analysis.md) - Análise completa
3. [`spec/architecture.md`](spec/architecture.md) - Arquitetura detalhada

---

### 4️⃣ Trabalhar com IA

**Tempo:** 5 minutos  
**Contexto para IA:**

- [`.claude/claude.md`](.claude/claude.md) - Manual operacional
- [`agents/`](agents/) - Agentes especializados
- [`skills/`](skills/) - Conhecimento reutilizável
- [`spec/`](spec/) - Especificações completas

---

## 📚 Documentação por Nível

### 🟢 Iniciante

1. **[README.md](README.md)** - Comece aqui!
2. **[terraform/QUICKSTART.md](terraform/QUICKSTART.md)** - Deploy rápido
3. **[GETTING-STARTED.md](GETTING-STARTED.md)** - Este arquivo

### 🟡 Intermediário

1. **[spec/architecture.md](spec/architecture.md)** - Arquitetura
2. **[terraform/README.md](terraform/README.md)** - Infraestrutura
3. **[spec/api.md](spec/api.md)** - APIs

### 🔴 Avançado

1. **[spec/infrastructure.md](spec/infrastructure.md)** - Infraestrutura completa
2. **[terraform/IMPLEMENTATION-SUMMARY.md](terraform/IMPLEMENTATION-SUMMARY.md)** - Detalhes técnicos
3. **[PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md)** - Estrutura completa

---

## 🎓 Tutoriais Rápidos

### Deploy em 5 Minutos

```bash
# 1. Configurar
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Editar terraform.tfvars com seus valores

# 2. Deploy
terraform init && terraform apply

# 3. Configurar DNS
# Copiar name servers do output
# Configurar no registrador de domínio

# 4. Aguardar e configurar SSL
ssh -i evolua-key.pem ubuntu@<IP>
sudo certbot --nginx -d app.evolua.com
```

### Desenvolvimento em 3 Minutos

```bash
# 1. Setup
cd frontend-evolua
npm install

# 2. Configurar
cp .env.example .env.local
# Editar .env.local com valores do Supabase

# 3. Iniciar
npm run dev
# Abrir http://localhost:3000
```

### Entender Arquitetura em 10 Minutos

```bash
# 1. Visão geral
cat README.md

# 2. Análise do projeto
cat spec/project-analysis.md

# 3. Arquitetura
cat spec/architecture.md

# 4. Infraestrutura
cat spec/infrastructure.md
```

---

## 🗺️ Mapa de Navegação

```
📁 evolua-crm/
│
├── 🚀 COMEÇAR AQUI
│   ├── README.md                    ← Visão geral do projeto
│   ├── GETTING-STARTED.md           ← Este arquivo
│   └── PROJECT-STRUCTURE.md         ← Estrutura completa
│
├── 🏗️ DEPLOY
│   └── terraform/
│       ├── FIRST-DEPLOY.md          ← Guia completo (900 linhas)
│       ├── QUICKSTART.md            ← Guia rápido (300 linhas)
│       ├── DEPLOY-CHECKLIST.md      ← Checklist (600 linhas)
│       └── README.md                ← Documentação (800 linhas)
│
├── 💻 DESENVOLVIMENTO
│   └── frontend-evolua/
│       ├── README.md                ← Setup local
│       ├── src/app/                 ← Páginas
│       └── src/components/          ← Componentes
│
├── 📚 ARQUITETURA
│   └── spec/
│       ├── project-analysis.md      ← Análise (400 linhas)
│       ├── architecture.md          ← Arquitetura (600 linhas)
│       ├── backend.md               ← Backend (700 linhas)
│       ├── frontend.md              ← Frontend (500 linhas)
│       └── infrastructure.md        ← Infraestrutura (1,200 linhas)
│
└── 🤖 IA
    ├── .claude/claude.md            ← Manual operacional (800 linhas)
    ├── agents/                      ← Agentes especializados (6 arquivos)
    └── skills/                      ← Conhecimento reutilizável (5 arquivos)
```

---

## 🎯 Casos de Uso

### Caso 1: Sou desenvolvedor e quero contribuir

1. Clone o repositório
2. Leia [`README.md`](README.md)
3. Configure ambiente local (veja acima)
4. Leia [`spec/architecture.md`](spec/architecture.md)
5. Escolha uma issue e comece!

### Caso 2: Sou DevOps e quero fazer deploy

1. Leia [`terraform/FIRST-DEPLOY.md`](terraform/FIRST-DEPLOY.md)
2. Prepare pré-requisitos (AWS CLI, Terraform, chaves)
3. Configure `terraform.tfvars`
4. Execute `terraform apply`
5. Configure DNS e SSL

### Caso 3: Sou arquiteto e quero entender o sistema

1. Leia [`spec/project-analysis.md`](spec/project-analysis.md)
2. Leia [`spec/architecture.md`](spec/architecture.md)
3. Aprofunde em [`spec/backend.md`](spec/backend.md) e [`spec/frontend.md`](spec/frontend.md)
4. Revise [`spec/infrastructure.md`](spec/infrastructure.md)

### Caso 4: Sou IA e quero trabalhar no projeto

1. Leia [`.claude/claude.md`](.claude/claude.md)
2. Consulte agentes em [`agents/`](agents/)
3. Use skills em [`skills/`](skills/)
4. Siga especificações em [`spec/`](spec/)

---

## 📊 Checklist de Início

### Para Deploy

- [ ] AWS CLI instalado e configurado
- [ ] Terraform instalado
- [ ] Chave SSH criada na AWS
- [ ] Projeto Supabase criado
- [ ] Domínios registrados
- [ ] `terraform.tfvars` preenchido
- [ ] Leu [`terraform/FIRST-DEPLOY.md`](terraform/FIRST-DEPLOY.md)

### Para Desenvolvimento

- [ ] Node.js 20 instalado
- [ ] Git configurado
- [ ] Repositório clonado
- [ ] Dependências instaladas (`npm install`)
- [ ] `.env.local` configurado
- [ ] Supabase local rodando (opcional)
- [ ] Leu [`frontend-evolua/README.md`](frontend-evolua/README.md)

### Para Entender

- [ ] Leu [`README.md`](README.md)
- [ ] Leu [`spec/project-analysis.md`](spec/project-analysis.md)
- [ ] Leu [`spec/architecture.md`](spec/architecture.md)
- [ ] Explorou estrutura de pastas
- [ ] Entendeu fluxo de dados

---

## 🆘 Precisa de Ajuda?

### Problemas Comuns

**Deploy falha:**
- Verifique [`terraform/README.md#troubleshooting`](terraform/README.md#troubleshooting)
- Verifique credenciais AWS
- Verifique `terraform.tfvars`

**Aplicação não inicia:**
- Verifique logs: `pm2 logs evolua-crm`
- Verifique Nginx: `sudo systemctl status nginx`
- Verifique [`terraform/DEPLOY-CHECKLIST.md`](terraform/DEPLOY-CHECKLIST.md)

**DNS não propaga:**
- Aguarde até 48 horas
- Verifique name servers no registrador
- Use `dig app.evolua.com` para testar

**Desenvolvimento local:**
- Verifique `.env.local`
- Verifique Supabase URL e keys
- Verifique Node.js versão (20+)

### Onde Encontrar Respostas

| Pergunta | Documento |
|----------|-----------|
| Como fazer deploy? | [`terraform/FIRST-DEPLOY.md`](terraform/FIRST-DEPLOY.md) |
| Como desenvolver localmente? | [`frontend-evolua/README.md`](frontend-evolua/README.md) |
| Como funciona a arquitetura? | [`spec/architecture.md`](spec/architecture.md) |
| Quais são os custos? | [`terraform/README.md#custos`](terraform/README.md#custos) |
| Como configurar SSL? | [`terraform/FIRST-DEPLOY.md#configurar-ssl`](terraform/FIRST-DEPLOY.md#configurar-ssl) |
| Como monitorar? | [`spec/infrastructure.md#monitoramento`](spec/infrastructure.md#monitoramento) |
| Como fazer backup? | [`spec/infrastructure.md#backup`](spec/infrastructure.md#backup) |

---

## 🎉 Próximos Passos

Depois de começar, considere:

1. **Configurar CI/CD** - GitHub Actions para deploy automático
2. **Implementar testes** - Unitários, integração, E2E
3. **Adicionar monitoring** - APM, logs estruturados
4. **Otimizar performance** - CDN, cache, otimizações
5. **Implementar staging** - Ambiente de testes

---

## 📞 Recursos

### Documentação
- **Completa:** [`terraform/README.md`](terraform/README.md)
- **Rápida:** [`terraform/QUICKSTART.md`](terraform/QUICKSTART.md)
- **Checklist:** [`terraform/DEPLOY-CHECKLIST.md`](terraform/DEPLOY-CHECKLIST.md)

### Especificações
- **Projeto:** [`spec/project-analysis.md`](spec/project-analysis.md)
- **Arquitetura:** [`spec/architecture.md`](spec/architecture.md)
- **Infraestrutura:** [`spec/infrastructure.md`](spec/infrastructure.md)

### Contexto IA
- **Manual:** [`.claude/claude.md`](.claude/claude.md)
- **Agentes:** [`agents/`](agents/)
- **Skills:** [`skills/`](skills/)

---

## 💡 Dicas

### Para Deploy Rápido
```bash
# Use o Makefile!
cd terraform
make setup    # Inicializar
make apply    # Deploy
make ssh      # Conectar
make logs     # Ver logs
```

### Para Desenvolvimento
```bash
# Use scripts do package.json
npm run dev          # Desenvolvimento
npm run build        # Build
npm run lint         # Lint
npm run type-check   # Type check
```

### Para Documentação
```bash
# Busque por palavra-chave
grep -r "palavra" spec/
grep -r "palavra" terraform/

# Ou use seu editor
code .
# Ctrl+Shift+F para buscar
```

---

**Pronto para começar?** Escolha um dos caminhos acima e boa sorte! 🚀

---

**Última atualização:** 09/03/2024  
**Versão:** 1.0.0
