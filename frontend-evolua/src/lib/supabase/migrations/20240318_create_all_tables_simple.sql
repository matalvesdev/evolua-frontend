-- Migration: Criar todas as tabelas necessárias (versão simplificada)
-- Data: 2024-03-18
-- Descrição: Cria todas as tabelas necessárias para o sistema de histórico de evolução

-- ============================================================================
-- 1. Tabela: patient_goals (se não existir)
-- ============================================================================
CREATE TABLE IF NOT EXISTS patient_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status TEXT NOT NULL DEFAULT 'started',
  icon_name TEXT DEFAULT 'target',
  color_scheme TEXT DEFAULT 'purple',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_by UUID
);

CREATE INDEX IF NOT EXISTS idx_patient_goals_patient_id ON patient_goals(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_goals_progress ON patient_goals(progress);

COMMENT ON TABLE patient_goals IS 'Metas terapêuticas de curto prazo dos pacientes';

-- ============================================================================
-- 2. Tabela: goal_progress_history
-- ============================================================================
CREATE TABLE IF NOT EXISTS goal_progress_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES patient_goals(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  therapist_id UUID NOT NULL,
  notes TEXT,
  CONSTRAINT unique_goal_timestamp UNIQUE (goal_id, created_at)
);

CREATE INDEX IF NOT EXISTS idx_goal_progress_history_goal_id ON goal_progress_history(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_progress_history_created_at ON goal_progress_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_goal_progress_history_goal_created ON goal_progress_history(goal_id, created_at DESC);

COMMENT ON TABLE goal_progress_history IS 'Armazena snapshots históricos de progresso das metas terapêuticas';

-- ============================================================================
-- 3. Tabela: goal_milestones
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'milestone_type') THEN
    CREATE TYPE milestone_type AS ENUM (
      'started',
      'significant_increase',
      'significant_decrease',
      'completed'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES patient_goals(id) ON DELETE CASCADE,
  type milestone_type NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  progress INTEGER NOT NULL CHECK (progress >= 0 AND progress <= 100),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_goal_milestone UNIQUE (goal_id, type, date)
);

CREATE INDEX IF NOT EXISTS idx_goal_milestones_goal_id ON goal_milestones(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_date ON goal_milestones(date DESC);

COMMENT ON TABLE goal_milestones IS 'Armazena marcos importantes na evolução das metas terapêuticas';

-- ============================================================================
-- 4. Função: create_progress_snapshot
-- ============================================================================
CREATE OR REPLACE FUNCTION create_progress_snapshot()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar snapshot apenas se o progresso mudou ou é uma nova meta
  IF (TG_OP = 'UPDATE' AND OLD.progress != NEW.progress) OR TG_OP = 'INSERT' THEN
    INSERT INTO goal_progress_history (goal_id, progress, therapist_id)
    VALUES (NEW.id, NEW.progress, COALESCE(NEW.updated_by, NEW.id));
    
    -- Milestone: Meta iniciada
    IF TG_OP = 'INSERT' AND NEW.progress = 0 THEN
      INSERT INTO goal_milestones (goal_id, type, date, progress, description)
      VALUES (NEW.id, 'started', NOW(), 0, 'Meta iniciada')
      ON CONFLICT (goal_id, type, date) DO NOTHING;
      
    -- Milestone: Meta concluída
    ELSIF TG_OP = 'UPDATE' AND NEW.progress = 100 AND OLD.progress < 100 THEN
      INSERT INTO goal_milestones (goal_id, type, date, progress, description)
      VALUES (NEW.id, 'completed', NOW(), 100, 'Meta concluída')
      ON CONFLICT (goal_id, type, date) DO NOTHING;
      
    -- Milestone: Mudança significativa
    ELSIF TG_OP = 'UPDATE' AND ABS(NEW.progress - OLD.progress) >= 20 THEN
      INSERT INTO goal_milestones (
        goal_id, 
        type, 
        date, 
        progress, 
        description
      )
      VALUES (
        NEW.id,
        CASE 
          WHEN NEW.progress > OLD.progress THEN 'significant_increase'::milestone_type
          ELSE 'significant_decrease'::milestone_type
        END,
        NOW(),
        NEW.progress,
        FORMAT(
          'Mudança significativa: %s%s%%', 
          CASE WHEN NEW.progress > OLD.progress THEN '+' ELSE '' END,
          NEW.progress - OLD.progress
        )
      )
      ON CONFLICT (goal_id, type, date) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. Trigger: trigger_create_progress_snapshot
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_create_progress_snapshot ON patient_goals;

CREATE TRIGGER trigger_create_progress_snapshot
AFTER INSERT OR UPDATE OF progress ON patient_goals
FOR EACH ROW
EXECUTE FUNCTION create_progress_snapshot();

-- ============================================================================
-- 6. Função RPC: get_goal_history_with_stats
-- ============================================================================
CREATE OR REPLACE FUNCTION get_goal_history_with_stats(
  p_goal_id UUID,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  snapshot_id UUID,
  progress INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  therapist_id UUID,
  notes TEXT,
  variation INTEGER,
  days_since_last INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH snapshots_with_lag AS (
    SELECT 
      id,
      progress,
      created_at,
      therapist_id,
      notes,
      LAG(progress) OVER (ORDER BY created_at) as prev_progress,
      LAG(created_at) OVER (ORDER BY created_at) as prev_date
    FROM goal_progress_history
    WHERE goal_id = p_goal_id
      AND (p_start_date IS NULL OR created_at >= p_start_date)
      AND (p_end_date IS NULL OR created_at <= p_end_date)
    ORDER BY created_at
  )
  SELECT 
    id as snapshot_id,
    progress,
    created_at,
    therapist_id,
    notes,
    COALESCE(progress - prev_progress, 0) as variation,
    COALESCE(EXTRACT(DAY FROM created_at - prev_date)::INTEGER, 0) as days_since_last
  FROM snapshots_with_lag
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Verificação Final
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Todas as tabelas e funções foram criadas com sucesso!';
  RAISE NOTICE '✅ Tabelas: patient_goals, goal_progress_history, goal_milestones';
  RAISE NOTICE '✅ Trigger: trigger_create_progress_snapshot';
  RAISE NOTICE '✅ Função RPC: get_goal_history_with_stats';
END $$;
