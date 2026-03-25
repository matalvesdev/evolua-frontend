# 🎯 Fluxo Padrão de Desenvolvimento

## 1️⃣ Entender a Tarefa
- Ler o contexto e verificar se precisa de mais informações
- Identificar arquivos afetados
- Consultar tipos/interfaces em `lib/types/` ou schemas

## 2️⃣ Explorer / Read
- **Ler arquivo(s) relevantes completos** antes de fazer mudanças
- Verificar imports, tipos e dependências
- Entender o padrão usado naquele arquivo

## 3️⃣ Planning (opcional para tarefas complexas)
- Usar `manage_todo_list` para tarefas com múltiplos passos
- Quebrar em sub-tarefas atomizadas
- Planejar sequência de edições

## 4️⃣ Implementation
- **Editar incrementalmente**: uma mudança funcional por vez
- Manter contexto antes/depois em replacements (3-5 linhas)
- Testar localmente se possível
- Fazer commits frequentes

## 5️⃣ Validation
- Verificar tipos: `npm run type-check`
- Verificar linting: `npm run lint`
- Rodar testes se existirem: `npm run test`
- Verificar integração com APIs

## 6️⃣ Communicate
- Resumir o que foi feito
- Apontar arquivos modificados
- Alertar sobre possíveis quebras

---

## ⚡ Dicas de Eficiência

### Leitura Eficiente
- Use `read_file` com ranges grandes (não múltiplas pequenas leituras)
- Use `semantic_search` para explorar código desconhecido
- Use `list_code_usages` para entender impacto de mudanças

### Edições Eficientes
- Agrupe edições independentes com `multi_replace_string_in_file`
- Uma mudança lógica por `replace_string_in_file` call
- Sempre inclua contexto para disambiguação

### Verificação Rápida
- Rodar testes antes de considerar "pronto"
- Verificar tipos antes de comitar
- Testar o fluxo do usuário se for UI

### Navegação
- Use absolute paths sempre (`c:/Users/.../file.ts`)
- Preferir caminhos relativos em comandos (`frontend-evolua/src/...`)
- Criar diretórios se não existirem com `create_directory`

