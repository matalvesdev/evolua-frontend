# 🎯 CLAUDE COPILOT - DASHBOARD

**Status**: ✅ Configurado e Pronto  
**Documentação**: 2,100+ linhas  
**Última atualização**: 25/03/2026  
**Agente**: GitHub Copilot (Claude Haiku 4.5)

---

## 📋 Resumo Executivo

Sua base de conocimiento está organizada em **9 documentos** cobrindo todos os aspectos do desenvolvimento do Evolua CRM. Siga o fluxo abaixo para máxima eficiência.

---

## 🚀 COMEÇAR AQUI

### 1️⃣ Onboarding (Novo no projeto?)
Leia em ordem:
1. **[claude.md](claude.md)** - Overview do projeto e stack (5 min)
2. **[commands/como-usar-copilot.md](commands/como-usar-copilot.md)** - Como pedir tarefas (3 min)
3. **[commands/flow.md](commands/flow.md)** - Fluxo padrão (2 min)

**Tempo total**: ~10 min

### 2️⃣ Desenvolvimento
Mantenha estes abertos na aba:
- **[commands/typescript-patterns.md](commands/typescript-patterns.md)** - Padrões TS/React
- **[commands/structure-reference.md](commands/structure-reference.md)** - Estrutura de pastas
- **[commands/snippets.md](commands/snippets.md)** - Componentes prontos

### 3️⃣ Quando Duvidas Surgem
Consulte em ordem:
1. **[commands/faq.md](commands/faq.md)** - Perguntas frequentes
2. **[commands/troubleshooting.md](commands/troubleshooting.md)** - Erros e soluções
3. **Pedir ao Copilot** - `@copilot [sua dúvida]`

---

## 📚 Guia de Referência

| Documento | Tamanho | Propósito | Quando Usar |
|-----------|---------|----------|------------|
| **claude.md** | 300 linhas | Overview do projeto | Início do dia / Onboarding |
| **flow.md** | 100 linhas | Fluxo de trabalho | Antes de começar tarefa |
| **typescript-patterns.md** | 250 linhas | Padrões de código | Durante desenvolvimento |
| **snippets.md** | 200 linhas | Componentes prontos | Precisar criar componente |
| **structure-reference.md** | 300 linhas | Estrutura de pastas | Não sabe onde por arquivo |
| **troubleshooting.md** | 350 linhas | Bugs e soluções | Algo quebrou |
| **como-usar-copilot.md** | 200 linhas | Como usar comigo | Quer aproveitam-me melhor |
| **faq.md** | 300 linhas | Perguntas comuns | Dúvidas rápidas |
| **README.md** | 150 linhas | Índice e submissões | Referência rápida |

**Total**: 2,100+ linhas de documentação

---

## 🎯 Fluxos Comuns

### Fluxo 1: Criar Nova Feature (30 min)
```
1. Ler: structure-reference.md  (onde colocar arquivos)
2. Ler: typescript-patterns.md  (padrões de código)
3. Copiar: snippets.md          (template de componente)
4. Implementar: fazer código
5. Validar: npm run type-check && npm run lint
6. Comitar: git commit -m "feat: descrição"
```

### Fluxo 2: Debugar Erro (10 min)
```
1. Ver erro completo
2. Abrir: troubleshooting.md
3. Procurar tipo de erro
4. Seguir solução
5. Se não resolver: pedir ao @copilot com contexto
```

### Fluxo 3: Refatorar Código (20 min)
```
1. Ler: typescript-patterns.md  (padrão correto)
2. Aplicar padrão
3. npm run type-check && npm run lint
4. Testar manualmente
5. Comitar: git commit -m "refactor: descrição"
```

### Fluxo 4: Implementação Complexa (60+ min)
```
1. Ler: como-usar-copilot.md   (como pedir bem)
2. Pedir ao @copilot:
   "Implemente [feature] seguindo:
    - Padrões em typescript-patterns.md
    - Estrutura em structure-reference.md
    - Componentes em snippets.md"
3. Revisar código gerado
4. Testar
5. Comitar
```

---

## ⚡ Cheat Sheet

### Setup
```bash
# Frontend
cd frontend-evolua && npm install && npm run dev

# Backend
cd backend-evolua/backend-evolua && npm install && npm run start:dev
```

### Validação
```bash
npm run type-check      # Verificar tipos TS
npm run lint            # ESLint
npm run test            # Testes
```

### Git
```bash
git checkout -b feature/nome                    # Criar feature
git commit -m "feat: descrição"                 # Comitar
git push origin feature/nome                    # Enviar
# Abrir PR no GitHub
```

---

## 🔑 Padrões-Chave

```typescript
// Componente
export function ComponentName() {}                    // PascalCase

// Arquivo
patient-card.tsx                                      // kebab-case

// Função
export function createPatient() {}                    // camelCase

// Tipo
interface Patient {}                                  // PascalCase

// Hook
export function usePatients() {}                      // use + PascalCase

// Validação
const schema = z.object({ name: z.string() })        // Zod

// Estado
const { data } = useQuery({...})                      // React Query

// Forma
useForm + zodResolver(schema)                         // React Hook Form
```

---

## 📞 Conversa com Copilot

### ✅ Bom
```
@copilot create um componente de formulário para pacientes usando:
- React Hook Form + Zod (conforme typescript-patterns.md)
- Salvear em frontend-evolua/src/components/patients/patient-form.tsx
- Incluir validação, tratanento de erro e loading state
```

### ❌ Ruim
```
me faz um componentede form

preciso de ajuda

qual é o problema?
```

---

## 🎓 Recursos Externos

- [Next.js Docs](https://nextjs.org/docs)
- [React Query](https://tanstack.com/query/latest)
- [Zod Validation](https://zod.dev)
- [NestJS Docs](https://docs.nestjs.com)
- [Prisma](https://www.prisma.io/docs)
- [shadcn/ui](https://ui.shadcn.com)

---

## ✨ Dicas de Ouro

1. **Leia primeiro antes de pedir**: 80% das respostas estão aqui
2. **Use snippets.md**: Componentes prontos para copiar
3. **Marque structure-reference.md**: Referência diária
4. **Consulte troubleshooting.md**: 90% dos erros tem solução
5. **Padrões existentes**: Procure código similar antes de criar novo

---

## 🚀 Próximo Passo

👉 **Leia agora**: [claude.md](claude.md)

Depois: [commands/como-usar-copilot.md](commands/como-usar-copilot.md)

---

**Bom desenvolvimento! 🎉**

---

## 📊 Velocidade de Desenvolvimento Esperada

Com este setup:
- ⚡ **Criar componente simples**: 5 min
- ⚡ **Criar recurso completo** (CRUD): 30 min
- ⚡ **Debugar erro comum**: 2 min
- ⚡ **Refatorar código**: 10 min
- ⚡ **Implementar feature complexa**: 60+ min (com ajuda do Copilot)

**Total documentação consultada por dia**: ~5-10 min  
**Tempo economizado vs sem docs**: ~30-50% mais rápido
