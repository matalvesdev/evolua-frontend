# Deploy Workflow Checklist

**Use este checklist toda vez que for fazer deploy de uma feature**

## 📋 Pre-Development

- [ ] Criar branch a partir de `develop`: `git checkout -b feature/nome-descritivo`
- [ ] Branch segue padrão: `feature/*`, `fix/*`, `hotfix/*`, `docs/*`
- [ ] Branch está rastreando origin: `git branch -u origin/develop`

## 💻 Development

- [ ] Código segue style guide do projeto (prettier, eslint)
- [ ] Componentes/functions têm JSDoc
- [ ] TypeScript strict mode (sem `any`)
- [ ] Testes unitários implementados (se aplicável)
- [ ] Sem console.log desnecessários
- [ ] Sem comentários em português no código (só em docs)

## 🧪 Local Testing

```bash
# Frontend
npm run lint          # ✅ Sem erros
npm run test          # ✅ Testes passando
npm run build         # ✅ Build sucesso
npm run dev           # ✅ Rodar local e testar manualmente

# Backend  
npm run lint          # ✅ Sem erros
npm run test          # ✅ Testes passando
npm run build         # ✅ Build sucesso
npm run start:dev     # ✅ Rodar local e testar endpoints
```

- [ ] Funcionalidade nova testada localmente
- [ ] Não quebrou funcionalidades existentes
- [ ] Responsividade OK (mobile-first)
- [ ] Performance OK (no console warnings)
- [ ] Sem memory leaks (React DevTools)

## 📝 Git Workflow

### Commit

```bash
git add .
git commit -m "<type>(<scope>): <subject>"
# Exemplos:
# feat(goals): add create goal endpoint
# fix(buttons): fix primary button color
# docs: add deploy guide
```

- [ ] Commit messages claras e descritivas
- [ ] 1 commit por feature lógica (squash se necessário)
- [ ] Sem merge commits desnecessários
- [ ] Sem commits de debug ou secrets

### Push

```bash
git push origin feature/seu-nome
```

- [ ] Push sem erros
- [ ] Branch criada remotamente corretamente

### Pull Request

- [ ] PR title: `feat: descrição` ou `fix: descrição`
- [ ] PR description: explicar O QUÊ, POR QUÊ, COMO
- [ ] Adicionar screenshots/videos se UI change
- [ ] Linked issues se aplicável
- [ ] Reviewers atribuídos

### Code Review

- [ ] ✅ Code review aprovado
- [ ] ✅ Todas as discussões resolvidas
- [ ] ✅ CI checks passando (lint, test, build)

## 🔀 Staging Deploy (develop branch)

```bash
# Merge em develop
git checkout develop
git pull origin develop
git merge --no-ff feature/seu-nome
git push origin develop
# ↓ Vercel auto-deploya
```

- [ ] Branch merge OK
- [ ] Vercel deploy triggered
- [ ] Staging URL respondendo
- [ ] Funcionalidade testada em staging
- [ ] Sem erros no console
- [ ] Sem erros no backend logs

## 🚀 Production Deploy (main branch)

### Frontend

```bash
# Merge em main
git checkout main
git pull origin main
git merge --no-ff develop
git push origin main
# ↓ Vercel auto-deploya em produção
```

- [ ] Merge OK (sem conflicts)
- [ ] Vercel deploy triggered
- [ ] Production URL respondendo (https://useevolua.com.br)
- [ ] Funcionalidade funcionando em produção
- [ ] Sem erros no console
- [ ] Navegação OK

### Backend + Terraform

```bash
# Merge em main
git checkout main
git pull origin main
git merge --no-ff develop
git push origin main

# Deploy infraestrutura
cd terraform
terraform plan               # Revisar mudanças
terraform apply -auto-approve  # Deploy em EC2
```

- [ ] Merge OK
- [ ] Terraform plan OK (sem mudanças inesperadas)
- [ ] Terraform apply OK
- [ ] API respondendo (https://api.useevolua.com.br/api/health)
- [ ] Database migrations executadas
- [ ] PM2 restarted corretamente
- [ ] Backend logs sem erros

## ✅ Post-Production Verification

```bash
# Teste checklist
- [ ] Home page carrega: https://useevolua.com.br
- [ ] API health: https://api.useevolua.com.br/api/health
- [ ] Login funciona
- [ ] Criar novo paciente funciona
- [ ] Listar pacientes funciona
- [ ] Adicionar meta funciona
- [ ] Histórico de alterações preservado
- [ ] Sem 5xx errors nos logs
- [ ] Performance aceitável (< 3s load time)
- [ ] Responsividade OK em mobile/tablet/desktop
```

- [ ] Todas as verificações passando
- [ ] Monitore por 30 minutos após deploy
- [ ] Alertas de erro? Rollback preparado
- [ ] Documentação atualizada (README, CHANGELOG)

## 🆘 Se Algo Deu Errado

### Frontend Rollback (Vercel)
```bash
# Dashboard Vercel → Previous deployment → Redeploy
```

### Backend Rollback (Terraform)
```bash
git revert <commit-hash>
git push origin main
cd terraform
terraform apply -auto-approve
```

## 📊 Monitoring

- [ ] Vercel dashboard: sem errors, build times normais
- [ ] EC2 CPU/Memory: < 50%
- [ ] Database connections: saudável
- [ ] Error rate: próximo de 0%
- [ ] Response times: < 1s

## 🎯 Final Checklist

- [ ] Feature completa e testada
- [ ] Code review aprovado
- [ ] Deploy realizado em ambos os ambientes
- [ ] Produção verificada e funcionando
- [ ] Documentação atualizada
- [ ] Time notificado da mudança
- [ ] Ready para próxima feature!

---

**Deployment Time**: Estimado 15-30 minutos (totalmente)

**Emergency Contact**: DevOps lead se houver problemas críticos

---

**Template Version**: 1.0
**Last Updated**: 28/03/2026
