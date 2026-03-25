-- Migration: Criar trigger para snapshots automáticos
-- Data: 2024-03-18
-- Descrição: Trigger que cria automaticamente snapshots e milestones quando progresso é atualizado

-- Função que cria snapshot e milestones automaticamente
CREATE OR REPLACE FUNCTION create_progress_snapshot()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar snapshot apenas se o progresso mudou ou é uma nova meta
  IF (TG_OP = 'UPDATE' AND OLD.progress != NEW.progress) OR TG_OP = 'INSERT' THEN
    INSERT INTO goal_progress_history (goal_id, progress, therapist_id)
    VALUES (NEW.id, NEW.progress, NEW.updated_by);
    
    -- Detectar e criar milestones automaticamente
    
    -- Milestone: Meta iniciada (apenas no INSERT com progresso 0)
    IF TG_OP = 'INSERT' AND NEW.progress = 0 THEN
      INSERT INTO goal_milestones (goal_id, type, date, progress, description)
      VALUES (NEW.id, 'started', NOW(), 0, 'Meta iniciada')
      ON CONFLICT (goal_id, type, date) DO NOTHING;
      
    -- Milestone: Meta concluída (progresso atinge 100%)
    ELSIF TG_OP = 'UPDATE' AND NEW.progress = 100 AND OLD.progress < 100 THEN
      INSERT INTO goal_milestones (goal_id, type, date, progress, description)
      VALUES (NEW.id, 'completed', NOW(), 100, 'Meta concluída')
      ON CONFLICT (goal_id, type, date) DO NOTHING;
      
    -- Milestone: Mudança significativa (≥20% de variação)
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

-- Criar trigger que executa a função após INSERT ou UPDATE
DROP TRIGGER IF EXISTS trigger_create_progress_snapshot ON patient_goals;

CREATE TRIGGER trigger_create_progress_snapshot
AFTER INSERT OR UPDATE OF progress ON patient_goals
FOR EACH ROW
EXECUTE FUNCTION create_progress_snapshot();

-- Comentários para documentação
COMMENT ON FUNCTION create_progress_snapshot() IS 'Cria automaticamente snapshots de progresso e milestones quando uma meta é criada ou atualizada';
COMMENT ON TRIGGER trigger_create_progress_snapshot ON patient_goals IS 'Trigger que executa create_progress_snapshot() após INSERT ou UPDATE de progress';
