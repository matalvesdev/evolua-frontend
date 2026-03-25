# .claude - Integração GitHub Copilot

> Configuração otimizada para desenvolvimento eficiente do Evolua CRM

## 📁 Estrutura

```
.claude/
├── claude.md                     # Instruções principais
├── commands/                     # Guias e referências
│   ├── como-usar-copilot.md     # Como pedir tarefas ao Copilot
│   ├── flow.md                   # Fluxo padrão de desenvolvimento
│   ├── typescript-patterns.md    # Padrões TS/React obrigatórios
│   ├── troubleshooting.md        # Erros e soluções comuns
│   ├── snippets.md               # Componentes e snippets prontos
│   └── structure-reference.md    # Referência de estrutura de arquivos
```

## 🚀 Quick Start

### 1. Leia Primeiro
Quando começar a trabalhar, leia em ordem:
1. `claude.md` - Overview do projeto
2. `.claude/commands/como-usar-copilot.md` - Como usar o Copilot
3. `.claude/commands/flow.md` - Fluxo padrão

### 2. Desenvolva Eficientemente
Durante o desenvolvimento, use:
- `typescript-patterns.md` - Padrões de código
- `structure-reference.md` - Onde colocar cada tipo de arquivo
- `snippets.md` - Componentes prontos para copiar

### 3. Quando Erros Ocorrem
Consulte imediatamente:
- `troubleshooting.md` - Diagnóstico e soluções

---

## 💬 Usando com Copilot

### Exemplo 1: Criar Componente
```
@copilot crie um componente de formul rio para pacientes usando:
- React Hook Form + Zod (conforme .claude/commands/typescript-patterns.md)
- Validação em tempo real
- Tratamento de erro
- Salvar em frontend-evolua/src/components/patients/patient-form.tsx
```

### Exemplo 2: Debugar Erro
```
estou recebendo erro "Cannot find type Patient"
 em frontend-evolua/src/components/patients/patient-card.tsx

vê em .claude/commands/troubleshooting.md as soluções e aplica aqui
```

### Exemplo 3: Implementar Feature Completa
```
implemente a feature de criar pacientes seguindo:
1. Padrões em .claude/commands/typescript-patterns.md
2. Estrutura em .claude/commands/structure-reference.md
3. Componentes em .claude/commands/snippets.md

incluir:
- Componente com form
- Hook customizado
- Validação Zod
- API client
- Testes
```

---

## 📊 Padrões que Usamos

### Nomenclatura
```typescript
// Componentes PascalCase
export function PatientCard() {}

// Funções camelCase
export function createPatient() {}

// Arquivos kebab-case
patient-card.tsx
use-patients.ts

// Tipos PascalCase
interface Patient {}
type PatientStatus = 'active' | 'inactive'

// Constantes UPPER_SNAKE_CASE
const MAX_RETRIES = 3
```

### React Query Pattern
```typescript
export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: () => api.get('/patients'),
  })
}

export function usePatientActions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input) => api.post('/patients', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients'] }),
  })
}
```

### Validação com Zod
```typescript
const schema = z.object({
  name: z.string().min(1, 'Obrigatório'),
  email: z.string().email('Email inválido'),
})

type FormData = z.infer<typeof schema>
```

---

## 🛠️ Checklists

### Antes de Começar a Tarefa
- [ ] Leia o arquivo relevante em `.claude/commands/`
- [ ] Entenda a estrutura em `structure-reference.md`
- [ ] Identifique padrões existentes similares
- [ ] Faça o setup local se necessário

### Enquanto Desenvolve
- [ ] Crie/Modifique incrementalmente (uma mudança por vez)
- [ ] Siga padrões em `typescript-patterns.md`
- [ ] Adicione JSDoc para funções públicas
- [ ] Mantenha tipos fortes em TS

### Antes de Comitar
- [ ] `npm run type-check` - sem erros TS
- [ ] `npm run lint` - sem warnings
- [ ] Testes passando (se houver)
- [ ] Funcionalidade testada manualmente

### Se Deu Erro
- [ ] Consulte `troubleshooting.md`
- [ ] Procure na stack de erro a seção relevante
- [ ] Siga a solução
- [ ] Se persistir, pessa ao Copilot com contexto

---

## 📚 Documentação Importante

### Leitura Essencial
- `claude.md` - Setup, stack, padrões
- `como-usar-copilot.md` - Como conversar comigo
- `flow.md` - Fluxo padrão de trabalho

### Referência Durante Desenvolvimento
- `typescript-patterns.md` - Padrões TS/React
- `structure-reference.md` - Estrutura de pastas
- `snippets.md` - Componentes prontos

### Quando Algo Quebra
- `troubleshooting.md` - Erros e soluções

---

## ⚡ Hot Tips

1. **Leia Primeiro**: Sempre ler o arquivo antes de pedir ao Copilot
2. **Contexto**: Quando pedir ajuda, cite o arquivo e o contexto
3. **Padrões**: Seguir padrões existentes torna tudo mais fácil
4. **Snippets**: Use os componentes prontos em `snippets.md`
5. **Troubleshooting**: 80% dos problemas já tem solução em `troubleshooting.md`

---

## 📌 Comandos Git Comuns

```bash
# Criar feature
git checkout -b feature/nome-descritivo

# Salvar trabalho
git add .
git commit -m "feat: descrição curta"
git push origin feature/nome-descritivo

# Sincronizar com develop
git fetch origin
git rebase origin/develop
git push -f origin feature/nome-descritivo

# Abrir PR
# No GitHub: compare develop com sua branch

# Finalizar
git checkout develop
git pull origin develop
git branch -d feature/nome-descritivo
```

---

## 🎯 Próximos Passos

1. **Ler `claude.md`** - Entender o projeto
2. **Ler `como-usar-copilot.md`** - Aprender a conversar
3. **Marcar `structure-reference.md` como favorito** - Referência rápida
4. **Manter `snippets.md` aberto** - Copiar componentes prontos
5. **Consultar `troubleshooting.md`** - Quando algo quebra

---

**Bom desenvolvimento! 🚀**

