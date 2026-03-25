-- Migration: Criar função RPC get_goal_history_with_stats
-- Data: 2024-03-18
-- Descrição: Função PostgreSQL que retorna histórico de progresso com estatísticas calculadas

-- Função para buscar histórico com agregação e cálculos
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

-- Comentários para documentação
COMMENT ON FUNCTION get_goal_history_with_stats(UUID, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) IS 
'Retorna histórico de progresso de uma meta com estatísticas calculadas (variação e dias desde último snapshot)';
