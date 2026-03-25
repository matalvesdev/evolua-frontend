# 🎤 Como Usar GitHub Copilot Efetivamente

## Comandos para Copilot

### 1. Pedir Análise
```
@copilot analise este arquivo e identifique problemas de performance

@copilot revise se este componente segue nossos padrões de código

@copilot qual é o impacto de remover este hook?
```

### 2. Pedir Implementação
```
@copilot crie um componente para listar pacientes com filtros usando React Query

@copilot implemente a validação do forms de pacientes com Zod

@copilot adicione erro handling nesta mutation
```

### 3. Pedir Refatoração
```
@copilot refatore este componente para extrair hooks customizados

@copilot reduza a complexidade desta função (mais de 50 linhas)

@copilot melhore a performance desta query N+1
```

### 4. Pedir Testes
```
@copilot escreva testes para este componente

@copilot gere testes para esta função

@copilot crie casos de teste para validação Zod
```

### 5. Pedir Documentação
```
@copilot adicione JSDoc a todas as funções públicas

@copilot documente o propósito desta função

@copilot crie um README com setup e instalação
```

---

## Padrão de Conversa Eficiente

### ❌ Ineficiente
```
me ajuda com componente

preciso de ajuda com um botão

qual é o problema aqui?
```

### ✅ Eficiente
```
Criei um componente de botão em frontend-evolua/src/components/ui/button.tsx 
que reutiliza Button do shadcn/ui. Preciso adicionar três variantes de tamanho 
(sm, md, lg) mantendo a tipagem forte. Como fazer isso seguindo nossos padrões?

Aqui está o código atual:
[copiar arquivo ou snippet]
```

---

## Contexto Que Ajuda

Quando você faz um pedido, inclua:

1. **Arquivo/Pasta**: Onde está o código
   ```
   frontend-evolua/src/components/patients/patient-form.tsx
   ```

2. **Contexto**: O que já existe
   ```
   Já temos React Hook Form + Zod implementados em outros forms
   ```

3. **Restrição**: Padrões a seguir
   ```
   Seguir padrões em .claude/commands/typescript-patterns.md
   ```

4. **Objetivo**: O que você quer
   ```
   Implementar validação de email que mostre erro em tempo real
   ```

5. **Problema (se houver)**: Erro ou comportamento esperado vs real
   ```
   Error: "Cannot find type Patient" 
   Esperado: types carregarem corretamente
   ```

---

## Prompts Poderosos

### "Use o contexto do projeto"
```
Implemente a funcionalidade de criar pacientes usando:
- Padrões em .claude/commands/typescript-patterns.md
- API client em lib/api/client.ts
- Validação com Zod
- React Query para state management
```

### "Revise conforme nossos padrões"
```
Revise este componente conforme nossas convenções:
- Usar hook customizado para lógica
- Separar tipos em interfaces
- Adicionar JSDoc
- Usar kebab-case em arquivos
```

### "Implemente completo"
```
Crie um feature completo:
1. Componente com form (React Hook Form + Zod)
2. Hook customizado (usePatientForm)
3. Testes unitários
4. Documentação JSDoc
```

---

## Checklist Após Implementação

Sempre pedir ao Copilot para:
- [ ] Verificar tipos TypeScript: `npm run type-check`
- [ ] Verificar linting: `npm run lint`
- [ ] Adicionar JSDoc a funções públicas
- [ ] Verificar se segue padrões em `.claude/commands/`
- [ ] Sugerir testes a escrever
- [ ] Revisar performance

---

## Prompts por Tarefa

### Criar Novo Módulo
```
Crie um novo módulo para [funcionalidade]:
1. Tipos/DTOs em lib/types
2. API endpoints em lib/api/endpoints
3. Hook customizado em hooks/use-[feature]
4. Componente principal em components/[feature]
5. Testes para cada parte

Siga os padrões em .claude/commands/typescript-patterns.md
```

### Debugar Erro
```
Estou recebendo o erro: [ERRO]

Contexto:
- Arquivo: [caminho]
- Stack trace: [trace]
- Comportamento esperado: [esperado]
- Comportamento real: [real]

Como resolver de acordo com .claude/commands/troubleshooting.md?
```

### Otimizar Performance
```
Este endpoint está lento:
- Arquivo: [caminho]
- Tempo de resposta: Xms

Identifique queries N+1 e outras otimizações seguindo 
os padrões de performance em .claude/commands/troubleshooting.md
```

### Revisar PR
```
Este é meu PR:
[descrição do que foi feito]

Revise de acordo com:
1. Padrões em .claude/commands/typescript-patterns.md
2. Troubleshooting em .claude/commands/troubleshooting.md
3. Segurança e performance
4. Testes necessários
```

