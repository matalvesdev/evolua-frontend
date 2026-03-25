# 🚀 Guia Rápido: Aplicar Migrations no Supabase

## ⚠️ ERRO RESOLVIDO

**Erro original:** `relation "patient_goals" does not exist`

**Solução:** Criada migration adicional para criar as tabelas base do sistema.

---

## 📋 Ordem de Execução (IMPORTANTE!)

Execute as migrations **NESTA ORDEM EXATA** no Supabase SQL Editor:

### 1️⃣ PRIMEIRO: Tabelas Base
```sql
-- Arquivo: frontend-evolua/src/lib/supabase/migrations/20240318_create_base_tables.sql
-- Cria: therapists, patients, patient_goals, therapeutic_objectives, weekly_activities
-- ⚠️ EXECUTE ESTE PRIMEIRO!
```

**O que esta migration faz:**
- ✅ Cria tabela `therapists` (terapeutas)
- ✅ Cria tabela `patients` (pacientes)
- ✅ Cria tabela `patient_goals` (metas terapêuticas) ← **RESOLVE O ERRO**
- ✅ Cria tabela `therapeutic_objectives` (objetivos de longo prazo)
- ✅ Cria tabela `weekly_activities` (atividades semanais)
- ✅ Configura triggers para `updated_at`
- ✅ Configura Row Level Security (RLS)

---

### 2️⃣ Tabela de Histórico de Progresso
```sql
-- Arquivo: frontend-evolua/src/lib/supabase/migrations/20240318_create_goal_progress_history.sql
-- Cria: goal_progress_history
```

**O que esta migration faz:**
- ✅ Cria tabela `goal_progress_history` (snapshots de progresso)
- ✅ Adiciona índices otimizados
- ✅ Configura constraints de validação

---

### 3️⃣ Tabela de Marcos (Milestones)
```sql
-- Arquivo: frontend-evolua/src/lib/supabase/migrations/20240318_create_goal_milestones.sql
-- Cria: goal_milestones
```

**O que esta migration faz:**
- ✅ Cria ENUM `milestone_type`
- ✅ Cria tabela `goal_milestones` (marcos importantes)
- ✅ Adiciona índices otimizados

---

### 4️⃣ Trigger Automático
```sql
-- Arquivo: frontend-evolua/src/lib/supabase/migrations/20240318_create_progress_snapshot_trigger.sql
-- Cria: trigger create_progress_snapshot
```

**O que esta migration faz:**
- ✅ Cria função `create_progress_snapshot()`
- ✅ Cria trigger que executa automaticamente quando:
  - Uma meta é criada (INSERT)
  - O progresso de uma meta é atualizado (UPDATE)
- ✅ Cria snapshots e milestones automaticamente

---

### 5️⃣ Função RPC Otimizada
```sql
-- Arquivo: frontend-evolua/src/lib/supabase/migrations/20240318_create_rpc_get_goal_history_with_stats.sql
-- Cria: função get_goal_history_with_stats
```

**O que esta migration faz:**
- ✅ Cria função RPC para buscar histórico com estatísticas
- ✅ Calcula variação entre snapshots
- ✅ Calcula dias desde último snapshot
- ✅ Otimizada com window functions

---

## 🎯 Como Executar

### Passo a Passo:

1. **Abra o Supabase Dashboard**
   - Acesse: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Vá para SQL Editor**
   - Menu lateral → SQL Editor
   - Ou: https://supabase.com/dashboard/project/[SEU_PROJETO]/sql

3. **Execute cada migration**
   - Abra o arquivo no VS Code
   - Copie todo o conteúdo
   - Cole no SQL Editor do Supabase
   - Clique em "Run" (ou Ctrl+Enter)
   - Aguarde confirmação de sucesso

4. **Verifique se funcionou**
   ```sql
   -- Execute esta query para verificar:
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN (
     'therapists',
     'patients', 
     'patient_goals',
     'goal_progress_history',
     'goal_milestones'
   );
   ```
   
   **Resultado esperado:** 5 tabelas listadas

---

## ⚠️ Troubleshooting

### Erro: "relation already exists"
**Solução:** A tabela já existe. Pule essa migration e continue com a próxima.

### Erro: "permission denied"
**Solução:** Você precisa ser owner do projeto no Supabase.

### Erro: "syntax error"
**Solução:** Certifique-se de copiar o arquivo SQL completo, incluindo todos os comentários.

### Erro: "foreign key constraint"
**Solução:** Você pulou uma migration. Execute na ordem correta (1 → 2 → 3 → 4 → 5).

---

## ✅ Checklist de Verificação

Após executar todas as migrations, verifique:

- [ ] Tabela `therapists` existe
- [ ] Tabela `patients` existe
- [ ] Tabela `patient_goals` existe ← **PRINCIPAL**
- [ ] Tabela `goal_progress_history` existe
- [ ] Tabela `goal_milestones` existe
- [ ] Função `create_progress_snapshot()` existe
- [ ] Trigger `trigger_create_progress_snapshot` existe
- [ ] Função `get_goal_history_with_stats()` existe

**Query de verificação completa:**
```sql
-- Verificar tabelas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar funções
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;

-- Verificar triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

---

## 🎉 Próximo Passo

Após aplicar todas as migrations com sucesso:

1. ✅ Banco de dados está pronto
2. ✅ Serviços backend estão implementados
3. 🚧 Falta implementar componentes React

**Continue com:**
```
"Continue implementando os componentes React do histórico de evolução"
```

---

**Última atualização:** 18/03/2024
**Status:** Migrations prontas para execução
