# 🎭 Copilot Agents / Personas

Use esses agents para pedir ajuda específica ao Copilot em diferentes contextos.

## Como Usar

Você pode invocá-los usando:
```
@copilot (agent-name) sua pergunta/pedido aqui
```

Ou explicitamente:
```
@copilot atuando como [agent-name], [sua pergunta]
```

---

## Agents Disponíveis

### 🏗️ [Architect](./architect.md)
**Para**: Design, arquitetura, refatoração, padrões  
**Foco**: Escalabilidade, estrutura, performance geral
```
@copilot (architect) revise a estrutura de [componente/módulo]
```

### 👨‍💻 [Frontend Developer](./frontend-dev.md)
**Para**: React, TypeScript, componentes, hooks  
**Foco**: Implementação frontend, UI components, performance
```
@copilot (frontend-dev) crie um componente para [feature]
```

### 🔧 [Backend Developer](./backend-dev.md)
**Para**: NestJS, Prisma, APIs, business logic  
**Foco**: Controllers, services, database, endpoints
```
@copilot (backend-dev) crie endpoint para [feature]
```

### 🧪 [QA / Tester](./qa-tester.md)
**Para**: Testes, qualidade, security, coverage  
**Foco**: Unit tests, integration tests, edge cases
```
@copilot (qa) escreva testes para [função/componente]
```

### 🚀 [DevOps / Infrastructure](./devops.md)
**Para**: Deploy, CI/CD, Docker, AWS, monitoring  
**Foco**: Infrastructure, deployment, monitoring
```
@copilot (devops) configure [feature] em [platform]
```

### 👑 [Product Owner](./product-owner.md)
**Para**: Requirements, features, user flows, specs  
**Foco**: User stories, AC, planning, prioritization
```
@copilot (product) especifique a feature [nome]
```

---

## Exemplo de Uso Integrado

### Feature: Adicionar filtro de pacientes por status

**1. Product Owner (especifica)**
```
@copilot (product) especifique a feature "Filtro de Pacientes por Status"

Contexto:
- Usuários querem filtrar pacientes por status (active, inactive, discharged)
- Usar em frontend-evolua/src/components/patients/
- Backend já tem o filtro implementado
```

**2. Frontend Dev (implementa UI)**
```
@copilot (frontend-dev) crie componente para filtro de status

Usar:
- React Hook Form
- Zod validation
- React Query para fetch com filtro
- Padrões em .claude/commands/
```

**3. Architect (revisa)**
```
@copilot (architect) revise o componente [caminho]

Verificar:
- Padrões consistentes
- Performance (evitar re-renders)
- Modularidade
```

**4. QA (escreve testes)**
```
@copilot (qa) escreva testes para [componente]

Casos:
- Selecionar status
- Filtro aplicado
- Reset filtro
```

---

## Quando Usar Cada Agent

| Situação | Agent |
|----------|-------|
| "Como estruturar isso..." | Architect |
| "Implementar novo componente" | Frontend Dev |
| "Criar novo endpoint" | Backend Dev |
| "Não tenho testes para isso" | QA |
| "Como fazer deploy?" | DevOps |
| "Qual é o requisito?" | Product Owner |

---

## Prompts Efetivos

❌ **Ruim**
```
@copilot cria um componente
```

✅ **Bom**
```
@copilot (frontend-dev) crie componente de lista de pacientes

Usando:
- React Query para fetch
- Zod para validação
- Padrões em typescript-patterns.md
- Localize em components/patients/
```

---

## Combinando Agents

Para tarefas complexas, combine múltiplos agents:

```
Tarefa: Implementar feature de agendamentos

1. @copilot (product) especifique requisitos
2. @copilot (architect) design da solução
3. @copilot (backend-dev) implementar API
4. @copilot (frontend-dev) implementar UI
5. @copilot (qa) escrever testes
6. @copilot (devops) deploy strategy
```

---

## Dicas

1. **Seja específico**: Quanto mais contexto, melhor a resposta
2. **Combine com files**: `@copilot (agent) revise [arquivo]`
3. **Use contexto**: Cite padrões(`typescript-patterns.md`), snippets, etc
4. **Iterative**: Use múltiplos prompts refinando conforme avança

