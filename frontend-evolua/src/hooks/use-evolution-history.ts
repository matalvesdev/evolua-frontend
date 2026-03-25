import { useState, useEffect, useCallback, useMemo } from 'react'
import type {
  GoalProgressSnapshot,
  Milestone,
  TrendAnalysis
} from '@/types/evolution-history'
import { goalHistoryService, trendAnalyzer } from '@/services/goal-history'

/** Props do hook useEvolutionHistory */
interface UseEvolutionHistoryProps {
  /** ID da meta específica; se undefined, carrega histórico geral do paciente */
  goalId?: string
  /** ID do paciente */
  patientId: string
}

/** Retorno do hook useEvolutionHistory */
interface UseEvolutionHistoryReturn {
  /** Snapshots de progresso carregados */
  snapshots: GoalProgressSnapshot[]
  /** Milestones da meta (vazio quando goalId não é fornecido) */
  milestones: Milestone[]
  /** Análise de tendência calculada (null se dados insuficientes) */
  trendAnalysis: TrendAnalysis | null
  /** Indica se os dados estão sendo carregados */
  loading: boolean
  /** Mensagem de erro, ou null se não houver erro */
  error: string | null
  /** Função para recarregar os dados */
  refetch: () => Promise<void>
}

/**
 * Hook customizado para gerenciar o estado do painel de histórico de evolução.
 * Carrega snapshots e milestones via Goal_History_Service e calcula análise
 * de tendência automaticamente usando o Trend_Analyzer.
 *
 * @param props - goalId opcional e patientId obrigatório
 * @returns Estado e handlers para uso no Evolution_History_Panel
 */
export function useEvolutionHistory({
  goalId,
  patientId,
}: UseEvolutionHistoryProps): UseEvolutionHistoryReturn {
  const [snapshots, setSnapshots] = useState<GoalProgressSnapshot[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const snapshotsData = goalId
        ? await goalHistoryService.fetchGoalHistory(goalId)
        : await goalHistoryService.fetchPatientHistory(patientId)

      setSnapshots(snapshotsData)

      if (goalId) {
        const milestonesData = await goalHistoryService.fetchMilestones(goalId)
        setMilestones(milestonesData)
      } else {
        setMilestones([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar histórico')
    } finally {
      setLoading(false)
    }
  }, [goalId, patientId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Memoizar análise de tendência para evitar recálculos desnecessários
  const trendAnalysis = useMemo<TrendAnalysis | null>(() => {
    if (snapshots.length < 2) return null
    return trendAnalyzer.createTrendAnalysis(snapshots, 30)
  }, [snapshots])

  return {
    snapshots,
    milestones,
    trendAnalysis,
    loading,
    error,
    refetch: fetchData,
  }
}
