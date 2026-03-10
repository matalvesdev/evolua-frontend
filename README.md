# Evolua CRM - Sistema de Gestão para Fonoaudiólogos

Sistema completo de gestão para fonoaudiólogos, incluindo gerenciamento de pacientes, agendamentos, relatórios, comunicação via WhatsApp e muito mais.

## 🚀 Status do Projeto

✅ **Infraestrutura:** Completa e pronta para deploy  
✅ **Documentação:** Completa e AI-native  
✅ **Frontend:** Next.js 16 com TypeScript  
✅ **Backend:** Supabase (PostgreSQL + Auth + Storage)  
✅ **Deploy:** Terraform + AWS EC2 (Free Tier)

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Deploy](#-deploy)
- [Desenvolvimento](#-desenvolvimento)
- [Documentação](#-documentação)
- [Custos](#-custos)
- [Suporte](#-suporte)

---

## 🎯 Visão Geral

O Evolua CRM é uma plataforma completa para fonoaudiólogos gerenciarem seus consultórios, incluindo:

- 👥 **Gestão de Pacientes** - Cadastro completo com histórico
- 📅 **Agendamentos** - Sistema de agenda com notificações
- 📝 **Relatórios** - Geração automática de relatórios com IA
- 💬 **Comunicação** - Integração com WhatsApp
- 📊 **Dashboard** - Métricas e indicadores
- 💰 **Financeiro** - Controle de receitas e despesas
- 🎙️ **Gravações** - Transcrição automática de áudio
- 📄 **Documentos** - Armazenamento seguro

---

## 🏗️ Arquitetura

### Infraestrutura

```
┌─────────────────────────────────────────────────────────┐
│                      USUÁRIOS                            │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   AWS EC2 (t2.micro)                     │
│  ┌────────────────────────────────────────────────┐     │
│  │  Next.js 16 (SSR + SSG + ISR)                  │     │
│  │  - Frontend React                              │     │
│  │  - API Routes                                  │     │
│  └────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────┐     │
│  │  Node.js 20 + PM2                              │     │
│  └────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────┐     │
│  │  Nginx (Reverse Proxy + SSL)                   │     │
│  └────────────────────────────────────────────────┘     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    SUPABASE                              │
│  - PostgreSQL Database                                   │
│  - Authentication                                        │
│  - Storage (S3-compatible)                               │
└─────────────────────────────────────────────────────────┘
```

### Stack Tecnológica

**Frontend:**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui

**Backend:**
- Supabase (PostgreSQL)
- Supabase Auth
- Supabase Storage
- Next.js API Routes

**Infraestrutura:**
- AWS EC2 (t2.micro)
- Nginx
- PM2
- Let's Encrypt SSL
- Route53 DNS
- CloudWatch Monitoring

**DevOps:**
- Terraform (IaC)
- GitHub Actions (CI/CD)
- AWS Free Tier

---

## 🛠️ Tecnologias

### Core
- **Next.js 16** - Framework React com SSR
- **TypeScript** - Type safety
- **Supabase** - Backend as a Service
- **Terraform** - Infrastructure as Code

### UI/UX
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Componentes React
- **Lucide Icons** - Ícones
- **Radix UI** - Primitivos acessíveis

### Integrações
- **OpenAI** - Geração de relatórios com IA
- **WhatsApp API** - Comunicação com pacientes
- **Himetrica** - Analytics

### Monitoramento
- **CloudWatch** - Métricas e logs
- **SNS** - Alertas por email

---

## 📁 Estrutura do Projeto

```
evolua-crm/
├── frontend-evolua/          # Aplicação Next.js
│   ├── src/
│   │   ├── app/              # App Router (páginas)
│   │   ├── components/       # Componentes React
│   │   ├── lib/              # Utilitários
│   │   └── types/            # TypeScript types
│   ├── public/               # Assets estáticos
│   └── package.json
│
├── terraform/                # Infraestrutura como código
│   ├── main.tf               # Configuração principal
│   ├── variables.tf          # Variáveis
│   ├── vpc.tf                # Security Groups
│   ├── ec2.tf                # Instâncias EC2
│   ├── route53.tf            # DNS
│   ├── cloudwatch.tf         # Monitoramento
│   ├── outputs.tf            # Outputs
│   ├── user-data/
│   │   └── app-init.sh       # Script de inicialização
│   ├── README.md             # Documentação completa
│   ├── QUICKSTART.md         # Guia rápido
│   ├── FIRST-DEPLOY.md       # Primeiro deploy
│   ├── DEPLOY-CHECKLIST.md   # Checklist
│   └── IMPLEMENTATION-SUMMARY.md
│
├── spec/                     # Especificações (AI-native)
│   ├── project-analysis.md   # Análise do projeto
│   ├── product.md            # Visão do produto
│   ├── architecture.md       # Arquitetura geral
│   ├── backend.md            # Arquitetura backend
│   ├── frontend.md           # Arquitetura frontend
│   ├── infrastructure.md     # Infraestrutura
│   ├── api.md                # Especificação de APIs
│   ├── mcp-architecture.md   # MCP servers
│   └── ai-workflow.md        # Workflow de IA
│
├── agents/                   # Agentes especializados
│   ├── product-owner.agent.md
│   ├── architect.agent.md
│   ├── backend.agent.md
│   ├── frontend.agent.md
│   ├── devops.agent.md
│   └── qa.agent.md
│
├── skills/                   # Skills reutilizáveis
│   ├── backend.skill.md
│   ├── frontend.skill.md
│   ├── devops.skill.md
│   ├── testing.skill.md
│   └── security.skill.md
│
├── .claude/                  # Contexto global da IA
│   └── claude.md
│
└── README.md                 # Este arquivo
```

---

## 🚀 Deploy

### Pré-requisitos

- Terraform instalado
- AWS CLI configurado
- Chave SSH criada na AWS
- Projeto Supabase criado
- Domínios registrados

### Deploy Rápido

```bash
# 1. Configurar
cd terraform
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars  # Preencher valores

# 2. Deploy
terraform init
terraform apply

# 3. Configurar DNS
# Copiar name servers do output e configurar no registrador

# 4. Aguardar setup e configurar SSL
ssh -i evolua-key.pem ubuntu@<IP>
tail -f /var/log/cloud-init-output.log
sudo certbot --nginx -d app.evolua.com
sudo certbot --nginx -d useevolua.com -d www.useevolua.com

# 5. Testar
curl https://app.evolua.com
```

### Documentação Completa

- **Guia Completo:** [`terraform/README.md`](terraform/README.md)
- **Guia Rápido:** [`terraform/QUICKSTART.md`](terraform/QUICKSTART.md)
- **Primeiro Deploy:** [`terraform/FIRST-DEPLOY.md`](terraform/FIRST-DEPLOY.md)
- **Checklist:** [`terraform/DEPLOY-CHECKLIST.md`](terraform/DEPLOY-CHECKLIST.md)

---

## 💻 Desenvolvimento

### Setup Local

```bash
# 1. Clonar repositório
git clone https://github.com/seu-usuario/evolua-crm.git
cd evolua-crm

# 2. Instalar dependências
cd frontend-evolua
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
nano .env.local  # Preencher valores

# 4. Iniciar Supabase local (opcional)
supabase start

# 5. Iniciar desenvolvimento
npm run dev
```

### Variáveis de Ambiente

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run start        # Iniciar produção
npm run lint         # Lint
npm run type-check   # Type check
npm test             # Testes
```

---

## 📚 Documentação

### Especificações (AI-native)

O projeto segue a metodologia **Spec Driven Development (SDD)** e é totalmente **AI-native**, permitindo que agentes de IA mantenham e evoluam o sistema.

#### Documentos Principais

- **[Análise do Projeto](spec/project-analysis.md)** - Visão geral completa
- **[Produto](spec/product.md)** - Visão do produto e funcionalidades
- **[Arquitetura](spec/architecture.md)** - Arquitetura geral do sistema
- **[Backend](spec/backend.md)** - Arquitetura backend
- **[Frontend](spec/frontend.md)** - Arquitetura frontend
- **[Infraestrutura](spec/infrastructure.md)** - Infraestrutura AWS
- **[APIs](spec/api.md)** - Especificação de APIs
- **[MCP](spec/mcp-architecture.md)** - Model Context Protocol
- **[AI Workflow](spec/ai-workflow.md)** - Workflow de desenvolvimento com IA

#### Agentes Especializados

- **[Product Owner](agents/product-owner.agent.md)** - Requisitos e funcionalidades
- **[Architect](agents/architect.agent.md)** - Arquitetura do sistema
- **[Backend](agents/backend.agent.md)** - Implementação backend
- **[Frontend](agents/frontend.agent.md)** - Implementação frontend
- **[DevOps](agents/devops.agent.md)** - Infraestrutura e deploy
- **[QA](agents/qa.agent.md)** - Qualidade e testes

#### Skills Reutilizáveis

- **[Backend](skills/backend.skill.md)** - Conhecimento backend
- **[Frontend](skills/frontend.skill.md)** - Conhecimento frontend
- **[DevOps](skills/devops.skill.md)** - Conhecimento DevOps
- **[Testing](skills/testing.skill.md)** - Conhecimento de testes
- **[Security](skills/security.skill.md)** - Conhecimento de segurança

#### Contexto Global

- **[Claude Context](.claude/claude.md)** - Manual operacional da IA

---

## 💰 Custos

### Primeiros 12 Meses (AWS Free Tier)

| Serviço | Custo |
|---------|-------|
| EC2 t2.micro (750h/mês) | $0 |
| EBS 30GB | $0 |
| Data Transfer 15GB | $0 |
| Route53 Hosted Zone | $0.50 |
| CloudWatch (free tier) | $0 |
| Supabase (free tier) | $0 |
| **Total** | **~$0.50/mês** |

### Após Free Tier (Mês 13+)

| Serviço | Custo |
|---------|-------|
| EC2 t2.micro | $8.50 |
| EBS 30GB | $2.40 |
| Data Transfer | $1-5 |
| Route53 | $0.50 |
| Supabase | $0-25 |
| **Total** | **$12-51/mês** |

### Otimizações

- **Reserved Instances:** 30-40% desconto com compromisso de 1 ano
- **Savings Plans:** Flexibilidade com desconto
- **CloudFront:** Adicionar apenas quando necessário
- **Supabase Free Tier:** Suficiente para começar

---

## 🔒 Segurança

### Implementado

- ✅ HTTPS obrigatório (Let's Encrypt)
- ✅ SSH restrito ao IP do administrador
- ✅ Security Groups AWS configurados
- ✅ Firewall UFW no servidor
- ✅ Row Level Security (RLS) no banco
- ✅ JWT tokens via Supabase
- ✅ Variáveis de ambiente protegidas
- ✅ Secrets não commitados

### Compliance

- ✅ LGPD ready (dados no Brasil)
- ✅ GDPR ready
- ⚠️ HIPAA considerations (dados de saúde)

---

## 📊 Monitoramento

### CloudWatch

- **Métricas:** CPU, Network, Disk, Status Checks
- **Alarmes:** CPU > 80%, Status check failed
- **Dashboard:** Visualização em tempo real
- **Logs:** CloudWatch Logs

### Alertas

- Email via SNS quando:
  - CPU > 80% por 10 minutos
  - Status check falhar

### Acesso

```bash
# URL do dashboard
terraform output cloudwatch_dashboard_url
```

---

## 🔄 CI/CD

### GitHub Actions (Planejado)

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]

jobs:
  deploy:
    - Lint
    - Type check
    - Tests
    - Build
    - Deploy to EC2
    - Health check
    - Notify
```

### Deploy Manual

```bash
# Conectar ao servidor
ssh -i evolua-key.pem ubuntu@<IP>

# Executar deploy
/home/ubuntu/deploy.sh
```

---

## 🆘 Suporte

### Documentação

- **Terraform:** [`terraform/README.md`](terraform/README.md)
- **Infraestrutura:** [`spec/infrastructure.md`](spec/infrastructure.md)
- **Arquitetura:** [`spec/architecture.md`](spec/architecture.md)

### Troubleshooting

- **Logs do servidor:** `/var/log/cloud-init-output.log`
- **Logs da aplicação:** `pm2 logs evolua-crm`
- **Logs do Nginx:** `/var/log/nginx/error.log`
- **CloudWatch:** Dashboard + Alarms

### Comandos Úteis

```bash
# Conectar ao servidor
ssh -i evolua-key.pem ubuntu@$(terraform output -raw app_public_ip)

# Ver status
pm2 status
sudo systemctl status nginx

# Ver logs
pm2 logs evolua-crm --lines 100
sudo tail -f /var/log/nginx/error.log

# Reiniciar
pm2 restart evolua-crm
sudo systemctl restart nginx

# Deploy
/home/ubuntu/deploy.sh
```

---

## 🎯 Roadmap

### ✅ Fase 1 - MVP (Completo)
- [x] Gestão de pacientes
- [x] Agendamentos
- [x] Relatórios básicos
- [x] Dashboard
- [x] Infraestrutura AWS
- [x] Documentação AI-native

### 🚧 Fase 2 - Integrações (Em Progresso)
- [ ] WhatsApp API
- [ ] OpenAI para relatórios
- [ ] Transcrição de áudio
- [ ] GitHub Actions CI/CD

### 📋 Fase 3 - Avançado (Planejado)
- [ ] Multi-tenant
- [ ] Mobile app
- [ ] Telemedicina
- [ ] Marketplace de templates

---

## 👥 Desenvolvimento

Este é um projeto privado e proprietário.

Para desenvolvedores autorizados:

1. Clone o repositório
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Solicite revisão de código

---

## 📄 Licença

Proprietary - Todos os direitos reservados

---

## 🙏 Agradecimentos

- **Next.js** - Framework incrível
- **Supabase** - Backend simplificado
- **Terraform** - IaC poderoso
- **AWS** - Infraestrutura confiável
- **shadcn/ui** - Componentes lindos

---

## 📞 Contato

- **Website:** https://useevolua.com
- **App:** https://app.evolua.com
- **Email:** contato@evolua.com

---

**Desenvolvido com ❤️ para fonoaudiólogos**

**Status:** ✅ Pronto para produção  
**Versão:** 1.0.0  
**Última atualização:** 09/03/2024
