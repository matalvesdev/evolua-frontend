-- Migration: Criar tabela goal_milestones
-- Data: 2024-03-18
-- Descrição: Armazena marcos importantes na evolução das metas terapêuticas

-- Criar ENUM para tipos de milestone
CREATE TYPE milestone_type AS ENUM (
  'started',
  'significant_increase',
  'significant_decrease',
  'completed'
);

-- Criar tabela goal_milestones
CREATE TABLE IF NOT EXISTS goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES patient_goals(id) ON DELETE CASCADE,
  type milestone_type NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  progress INTEGER NOT NULL CHECK (progress >= 0 AND progress <= 100),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraint para evitar duplicatas do mesmo tipo no mesmo momento
  CONSTRAINT unique_goal_milestone UNIQUE (goal_id, type, date)
);

-- Criar índices para otimização de queries
CREATE INDEX IF NOT EXISTS idx_goal_milestones_goal_id 
ON goal_milestones(goal_id);

CREATE INDEX IF NOT EXISTS idx_goal_milestones_date 
ON goal_milestones(date DESC);

-- Comentários para documentação
COMMENT ON TABLE goal_milestones IS 'Armazena marcos importantes na evolução das metas terapêuticas';
COMMENT ON COLUMN goal_milestones.id IS 'Identificador único do milestone';
COMMENT ON COLUMN goal_milestones.goal_id IS 'Referência à meta terapêutica';
COMMENT ON COLUMN goal_milestones.type IS 'Tipo do marco: started, significant_increase, significant_decrease, completed';
COMMENT ON COLUMN goal_milestones.date IS 'Data e hora do marco';
COMMENT ON COLUMN goal_milestones.progress IS 'Percentual de progresso no momento do marco (0-100)';
COMMENT ON COLUMN goal_milestones.description IS 'Descrição do marco';
COMMENT ON COLUMN goal_milestones.created_at IS 'Data e hora da criação do registro';
