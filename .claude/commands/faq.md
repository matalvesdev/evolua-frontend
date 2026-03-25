# ❓ FAQ & Referência Rápida

## Perguntas Frequentes

### P: Onde começo?
**R**: Leia na ordem:
1. `claude.md` - Overview do projeto
2. `como-usar-copilot.md` - Como usar comigo
3. `flow.md` - Fluxo de desenvolvimento

### P: Como criar um novo componente?
**R**: 
1. Abra `.claude/commands/typescript-patterns.md` seção "Componentes React"
2. Copie o template em `snippets.md`
3. Modifique conforme necessário
4. Coloque em `frontend-evolua/src/components/[feature]/nome-componente.tsx`

### P: Como fazer uma mutation com React Query?
**R**: Veja exemplo em `.claude/commands/snippets.md` seção "Componente com React Query"

### P: Qual é a estrutura de pastas?
**R**: Veja `.claude/commands/structure-reference.md` para overview completo

### P: O que fazer quando recebar um erro?
**R**: 
1. Abra `.claude/commands/troubleshooting.md`
2. Procure pelo tipo de erro (TS, Network, React, etc)
3. Siga a solução

### P: Como debugar?
**R**: Veja seção "Debugging" em `.claude/commands/troubleshooting.md`

### P: Qual é o padrão para formulários?
**R**: Use React Hook Form + Zod. Exemplo em `.claude/commands/snippets.md`

### P: Como usar API client?
**R**: Veja `.claude/commands/typescript-patterns.md` seção "API Client"

### P: Como criar validação Zod?
**R**: Veja `.claude/commands/snippets.md` e `.claude/commands/typescript-patterns.md` seção "Validação com Zod"

### P: Como fazer teste de componente?
**R**: Veja `.claude/commands/troubleshooting.md` ou pissa ao Copilot: "@copilot crie teste para este componente"

---

## Referência por Tarefa

### Criar Novo Recurso (Pacientes, Agendamentos, etc)
**Arquivos a criar/modificar:**
1. `backend-evolua/backend-evolua/src/[resource]/[resource].controller.ts`
2. `backend-evolua/backend-evolua/src/[resource]/[resource].service.ts`
3. `backend-evolua/backend-evolua/src/[resource]/dto/create-[resource].dto.ts`
4. `frontend-evolua/src/lib/types/[resource].ts`
5. `frontend-evolua/src/lib/api/endpoints/[resource].ts`
6. `frontend-evolua/src/lib/schemas/[resource].schema.ts`
7. `frontend-evolua/src/hooks/use-[resource].ts`
8. `frontend-evolua/src/components/[resource]/[resource]-form.tsx`
9. `frontend-evolua/src/components/[resource]/[resource]-list.tsx`
10. `frontend-evolua/src/app/(app)/[resource]/page.tsx`

**Padrões a seguir:**
- Veja `.claude/commands/typescript-patterns.md`
- Veja `.claude/commands/structure-reference.md`

### Corrigir Bug
1. Abra `.claude/commands/troubleshooting.md`
2. Procure identificação do erro
3. Siga a solução
4. Se não resolver, pissa com contexto ao Copilot

### Otimizar Performance
1. Veja `.claude/commands/troubleshooting.md` seção "Performance"
2. Identifique query N+1, re-renders, etc
3. Aplique solução

### Refatorar Código
1. Leia código atual
2. Identifique problema (duplicação, complexidade, etc)
3. Procure padrão similar em codebase
4. Aplique mesmo padrão

---

## Atalhos Mentais

| Situação | Arquivo |
|----------|---------|
| Não sei como começar | `flow.md` |
| Preciso criar componente | `snippets.md` + `typescript-patterns.md` |
| Não sei padrão TS | `typescript-patterns.md` |
| Erro TypeScript | `troubleshooting.md` |
| Erro Network | `troubleshooting.md` |
| Erro React | `troubleshooting.md` |
| Não sei onde por arquivo | `structure-reference.md` |
| Preciso de referência rápida | `como-usar-copilot.md` |
| Dúvida sobre convenção | `typescript-patterns.md` |

---

## Checklist de Qualidade

Antes de fazer commit, verifique:

```
Desenvolvimento
- [ ] Código escrito seguindo padrões em typescript-patterns.md
- [ ] Componentes em local correto (structure-reference.md)
- [ ] JSDoc adicionado a funções públicas
- [ ] Tipos TypeScript explícitos e fortes

Testes
- [ ] npm run type-check - sem erros
- [ ] npm run lint - sem warnings
- [ ] Funcionalidade testada manualmente
- [ ] Testes unitários passando (se houver)

Antes de Push
- [ ] Git branch: git checkout -b feature/nome
- [ ] Commit message clara: git commit -m "feat: descrição"
- [ ] Rebase com develop se necessário
- [ ] Push: git push origin feature/nome
- [ ] Criar PR com description

Após Review
- [ ] Fixar comentários do review
- [ ] Re-testar
- [ ] Fazer merge quando aprovado
```

---

## Conversas Exemplo com Copilot

### Exemplo 1: Implementar Feature Completa
```
Preciso implementar CRUD de pacientes seguindo nossa stack.

Crie:
1. Backend NestJS (controller, service, DTO)
2. Frontend React (form com validação Zod, lista com React Query)
3. Padrões em .claude/commands/typescript-patterns.md
4. Estrutura em .claude/commands/structure-reference.md

Incluir tratamento de erro, loading states e validação.
```

### Exemplo 2: Revisar Código
```
Revise este código:
[copiar código]

Confira:
1. Padrões em typescript-patterns.md
2. Estrutura em structure-reference.md
3. Performance
4. Segurança
5. Testes necessários
```

### Exemplo 3: Debugar Erro
```
Estou recebendo erro: [ERRO]
Arquivo: frontend-evolua/src/components/patients/patient-form.tsx
Stack: [STACK]

Comportamento esperado: [ESPERADO]
Comportamento real: [REAL]

Confira troubleshooting.md e aplica solução.
```

### Exemplo 4: Otimizar Query
```
Este endpoint está lento (Xms):
[código]

Identifique:
1. Queries N+1
2. Índices faltando
3. Seleção desnecessária de colunas
4. Agregações ineficientes

Use troubleshooting.md como referência.
```

---

## Números Importantes

| Métrica | Limite |
|---------|--------|
| Componente | <200 linhas |
| Função | <50 linhas |
| Hook | <100 linhas |
| Arquivo | <300 linhas |
| Props interface | <10 props |
| API response | <1s (ideal <200ms) |
| Type-check | 0 erros |
| Lint | 0 warnings |
| Test coverage | >80% (ideal) |

---

## Aliases Úteis

Se usar bash/PowerShell, adicione a `.env` ou profile:

```bash
# Frontend
alias fdev='cd frontend-evolua && npm run dev'
alias fbuild='cd frontend-evolua && npm run build'
alias ftest='cd frontend-evolua && npm run test'
alias flint='cd frontend-evolua && npm run lint'

# Backend
alias bdev='cd backend-evolua/backend-evolua && npm run start:dev'
alias bbuild='cd backend-evolua/backend-evolua && npm run build'
alias btest='cd backend-evolua/backend-evolua && npm run test'

# Git
alias gf='git fetch origin'
alias gb='git branch'
alias gc='git commit -m'
alias gp='git push origin'
alias gpl='git pull origin'
```

---

## Recursos Externos

- **Next.js Docs**: https://nextjs.org/docs
- **React Query**: https://tanstack.com/query/latest
- **Zod**: https://zod.dev
- **NestJS**: https://docs.nestjs.com
- **Prisma**: https://www.prisma.io/docs
- **shadcn/ui**: https://ui.shadcn.com

