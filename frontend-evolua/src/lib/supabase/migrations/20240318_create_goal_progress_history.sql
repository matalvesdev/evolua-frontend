-- Migration: Criar tabela goal_progress_history
-- Data: 2024-03-18
-- Descrição: Armazena snapshots históricos de progresso das metas terapêuticas

-- Criar tabela goal_progress_history
CREATE TABLE IF NOT EXISTS goal_progress_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES patient_goals(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  therapist_id UUID NOT NULL REFERENCES therapists(id),
  notes TEXT,
  
  -- Constraint para evitar duplicatas no mesmo timestamp
  CONSTRAINT unique_goal_timestamp UNIQUE (goal_id, created_at)
);

-- Criar índices para otimização de queries
CREATE INDEX IF NOT EXISTS idx_goal_progress_history_goal_id 
ON goal_progress_history(goal_id);

CREATE INDEX IF NOT EXISTS idx_goal_progress_history_created_at 
ON goal_progress_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_goal_progress_history_goal_created 
ON goal_progress_history(goal_id, created_at DESC);

-- Comentários para documentação
COMMENT ON TABLE goal_progress_history IS 'Armazena snapshots históricos de progresso das metas terapêuticas';
COMMENT ON COLUMN goal_progress_history.id IS 'Identificador único do snapshot';
COMMENT ON COLUMN goal_progress_history.goal_id IS 'Referência à meta terapêutica';
COMMENT ON COLUMN goal_progress_history.progress IS 'Percentual de progresso (0-100)';
COMMENT ON COLUMN goal_progress_history.created_at IS 'Data e hora da criação do snapshot';
COMMENT ON COLUMN goal_progress_history.therapist_id IS 'Terapeuta que atualizou o progresso';
COMMENT ON COLUMN goal_progress_history.notes IS 'Observações opcionais sobre a atualização';
