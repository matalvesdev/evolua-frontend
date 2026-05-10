# Time de Desenvolvimento — Índice
**Evolua CRM | Squad de Dev**

---

## Estrutura

```
.agents/dev/
├── INDICE.md                      ← Este arquivo
├── agente-tech-lead.md            ← Tech Lead / coordenação técnica
├── agente-arquiteto.md            ← Arquitetura de sistema
├── agente-frontend.md             ← Frontend Next.js / React
├── agente-backend.md              ← Backend NestJS / Prisma
├── agente-mobile.md               ← Mobile (futuro: React Native)
├── agente-qa.md                   ← QA & testes automatizados
└── agente-seguranca.md            ← Security Engineer
```

---

## Stack técnica do Evolua

| Camada | Tecnologia | Localização |
|--------|-----------|-------------|
| Frontend | Next.js 14, TypeScript, Tailwind | `frontend-core/` |
| Backend | NestJS, Prisma, PostgreSQL | `backend-core/` |
| Auth | Supabase Auth | Integrado no backend |
| Banco | PostgreSQL via Supabase | Supabase Cloud |
| Storage | Supabase Storage | Supabase Cloud |
| IA/RAG | Python, FastAPI | `rag-service/` |
| Infra | Terraform, AWS/GCP | `terraform/` |
| CI/CD | GitHub Actions | `.github/` |
| Container | Docker Compose | `docker-compose.yml` |

---

## Convenções do projeto

### Commits
```
feat: nova feature
fix: correção de bug
refactor: refatoração sem mudança de comportamento
test: adição/atualização de testes
docs: documentação
chore: tarefas de manutenção (deps, config)
perf: otimização de performance
```

### Branches
```
main            → produção (protegida)
develop         → integração
feat/[nome]     → novas features
fix/[nome]      → correções
hotfix/[nome]   → correção urgente em produção
```

### Pull Requests
- Mínimo 1 review aprovado para merge em develop
- Mínimo 2 reviews para merge em main
- Testes automatizados devem passar (CI verde)
- PR deve ter descrição clara do que muda e por quê

---

## Roadmap técnico (próximas prioridades)

| # | Prioridade | Descrição | Squad |
|---|-----------|-----------|-------|
| 1 | Alta | Pipeline de transcrição de áudio (Whisper) | Backend + ML |
| 2 | Alta | Geração de prontuário com LLM | Backend + ML |
| 3 | Alta | Sistema de assinatura digital de prontuários | Backend + Frontend |
| 4 | Média | Notificações push (lembretes de agenda) | Backend + Frontend |
| 5 | Média | Relatório em PDF nativo | Backend |
| 6 | Média | App mobile (React Native) | Mobile |
| 7 | Baixa | Integração com planos de saúde | Backend |
