# 🎯 Ordem de Execução das Migrations

## ✅ Situação Detectada

Você já tem as tabelas base no banco de dados:
- ✅ `therapists` existe
- ✅ `patients` existe  
- ✅ `patient_goals` existe
- ✅ Triggers de `updated_at` já existem

**Erro recebido:** `trigger "update_patients_updated_at" for relation "patients" already exists`

---

## 🚀 Execute APENAS estas migrations (na ordem):

### 1️⃣ Adicionar coluna updated_by (se necessário)
```sql
-- Arquivo: frontend-evolua/src/lib/supabase/migrations/20240318_add_updated_by_to_patient_goals.sql
-- Adiciona coluna updated_by à tabela patient_goals (necessária para o trigger)
```

### 2️⃣ Criar tabela goal_progress_history
```sql
-- Arquivo: frontend-evolua/src/lib/supabase/migrations/20240318_create_goal_progress_history.sql
```

### 3️⃣ Criar tabela goal_milestones
```sql
-- Arquivo: frontend-evolua/src/lib/supabase/migrations/20240318_create_goal_milestones.sql
```

### 4️⃣ Criar trigger automático
```sql
-- Arquivo: frontend-evolua/src/lib/supabase/migrations/20240318_create_progress_snapshot_trigger.sql
```

### 5️⃣ Criar função RPC
```sql
-- Arquivo: frontend-evolua/src/lib/supabase/migrations/20240318_create_rpc_get_goal_history_with_stats.sql
```

---

## ⚠️ NÃO Execute:

❌ **NÃO execute:** `20240318_create_base_tables.sql` (suas tabelas já existem)

---

## 📋 Checklist de Execução

Execute no Supabase SQL Editor:

- [ ] 1. `20240318_add_updated_by_to_patient_goals.sql`
- [ ] 2. `20240318_create_goal_progress_history.sql`
- [ ] 3. `20240318_create_goal_milestones.sql`
- [ ] 4. `20240318_create_progress_snapshot_trigger.sql`
- [ ] 5. `20240318_create_rpc_get_goal_history_with_stats.sql`

---

## ✅ Verificação Final

Após executar todas as migrations, execute esta query:

```sql
-- Verificar se tudo foi criado
SELECT 
  'goal_progress_history' as tabela,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'goal_progress_history') as existe
UNION ALL
SELECT 
  'goal_milestones',
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'goal_milestones')
UNION ALL
SELECT 
  'trigger_create_progress_snapshot',
  EXISTS(SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_create_progress_snapshot')
UNION ALL
SELECT 
  'get_goal_history_with_stats',
  EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_goal_history_with_stats');
```

**Resultado esperado:** Todas as linhas devem mostrar `true`

---

## 🎉 Próximo Passo

Após executar com sucesso:

```
"Migrations aplicadas! Continue implementando os componentes React"
```

---

**Última atualização:** 18/03/2024
