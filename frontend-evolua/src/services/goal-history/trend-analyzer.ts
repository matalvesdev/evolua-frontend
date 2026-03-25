import { differenceInWeeks, differenceInDays } from 'date-fns'
import type {
  GoalProgressSnapshot,
  Milestone,
  MilestoneType,
  ProgressTrend,
  TrendAnalysis,
  PeriodSelection,
  PeriodStats,
  PeriodComparisonResult
} from '@/types/evolution-history'
import { presetPeriodConfig } from '@/types/evolution-history'

/**
 * Serviço de análise de tendências de progresso
 */
export class TrendAnalyzer {
  /**
   * Analisa tendência de progresso em um período
   * @param snapshots - Array de snapshots ordenados por data
   * @param periodDays - Número de dias para análise (padrão: 30)
   * @returns Classificação da tendência
   */
  analyzeTrend(snapshots: GoalProgressSnapshot[], periodDays: number = 30): ProgressTrend {
    if (snapshots.length < 2) {
      return 'stagnation'
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - periodDays)
    
    const recentSnapshots = snapshots.filter(s => s.createdAt >= cutoffDate)
    
    if (recentSnapshots.length < 2) {
      return 'stagnation'
    }
    
    // Ordenar por data (mais antigo primeiro)
    const sorted = [...recentSnapshots].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    
    const firstProgress = sorted[0].progress
    const lastProgress = sorted[sorted.length - 1].progress
    const variation = lastProgress - firstProgress
    
    if (variation >= 10) return 'improvement'
    if (variation <= -10) return 'regression'
    return 'stagnation'
  }

  /**
   * Calcula taxa média de progresso por semana
   * @param snapshots - Array de snapshots
   * @returns Taxa média de progresso por semana
   */
  calculateAverageWeeklyRate(snapshots: GoalProgressSnapshot[]): number {
    if (snapshots.length < 2) {
      return 0
    }

    // Ordenar por data
    const sorted = [...snapshots].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    
    const weeks = differenceInWeeks(
      sorted[sorted.length - 1].createdAt,
      sorted[0].createdAt
    )
    
    if (weeks === 0) {
      return 0
    }
    
    const totalVariation = sorted[sorted.length - 1].progress - sorted[0].progress
    return totalVariation / weeks
  }

  /**
   * Detecta milestones baseado em mudanças significativas
   * @param snapshots - Array de snapshots ordenados por data
   * @returns Array de milestones detectados
   */
  detectMilestones(snapshots: GoalProgressSnapshot[]): Milestone[] {
    const milestones: Milestone[] = []
    
    if (snapshots.length === 0) return milestones

    // Ordenar por data (mais antigo primeiro)
    const sorted = [...snapshots].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

    // Milestone: Meta iniciada
    if (sorted[0].progress === 0) {
      milestones.push({
        id: `milestone-started-${sorted[0].id}`,
        goalId: sorted[0].goalId,
        type: 'started',
        date: sorted[0].createdAt,
        progress: 0,
        description: 'Meta iniciada',
        createdAt: sorted[0].createdAt
      })
    }

    // Detectar mudanças significativas (≥20%)
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]
      const current = sorted[i]
      const variation = current.progress - prev.progress

      if (Math.abs(variation) >= 20) {
        const type: MilestoneType = variation > 0 ? 'significant_increase' : 'significant_decrease'
        milestones.push({
          id: `milestone-${type}-${current.id}`,
          goalId: current.goalId,
          type,
          date: current.createdAt,
          progress: current.progress,
          description: `Mudança significativa: ${variation > 0 ? '+' : ''}${variation}%`,
          createdAt: current.createdAt
        })
      }

      // Milestone: Meta concluída
      if (current.progress === 100 && prev.progress < 100) {
        milestones.push({
          id: `milestone-completed-${current.id}`,
          goalId: current.goalId,
          type: 'completed',
          date: current.createdAt,
          progress: 100,
          description: 'Meta concluída',
          createdAt: current.createdAt
        })
      }
    }

    return milestones
  }

  /**
   * Compara estatísticas entre dois períodos
   * @param snapshots - Array de snapshots
   * @param period1 - Primeiro período
   * @param period2 - Segundo período
   * @returns Resultado da comparação
   */
  comparePeriods(
    snapshots: GoalProgressSnapshot[],
    period1: PeriodSelection,
    period2: PeriodSelection
  ): PeriodComparisonResult {
    const stats1 = this.calculatePeriodStats(snapshots, period1)
    const stats2 = this.calculatePeriodStats(snapshots, period2)
    
    const variation = stats2.averageProgress - stats1.averageProgress

    return {
      period1: stats1,
      period2: stats2,
      variation
    }
  }

  /**
   * Calcula estatísticas de um período
   * @param snapshots - Array de snapshots
   * @param period - Período para análise
   * @returns Estatísticas do período
   */
  private calculatePeriodStats(
    snapshots: GoalProgressSnapshot[],
    period: PeriodSelection
  ): PeriodStats {
    const { start, end } = this.getPeriodDates(period)
    
    const periodSnapshots = snapshots.filter(
      s => s.createdAt >= start && s.createdAt <= end
    )

    const averageProgress = periodSnapshots.length > 0
      ? periodSnapshots.reduce((sum, s) => sum + s.progress, 0) / periodSnapshots.length
      : 0

    return {
      averageProgress,
      updateCount: periodSnapshots.length,
      startDate: start,
      endDate: end
    }
  }

  /**
   * Converte PeriodSelection para datas de início e fim
   * @param period - Seleção de período
   * @returns Objeto com datas de início e fim
   */
  private getPeriodDates(period: PeriodSelection): { start: Date; end: Date } {
    if (period.type === 'custom' && period.customRange) {
      return {
        start: period.customRange.start,
        end: period.customRange.end
      }
    }

    if (period.type === 'preset' && period.preset) {
      const days = presetPeriodConfig[period.preset].days
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - days)
      
      return { start, end }
    }

    // Fallback: últimos 30 dias
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)
    return { start, end }
  }

  /**
   * Cria análise completa de tendência
   * @param snapshots - Array de snapshots
   * @param periodDays - Número de dias para análise
   * @returns Análise completa de tendência
   */
  createTrendAnalysis(snapshots: GoalProgressSnapshot[], periodDays: number = 30): TrendAnalysis {
    const trend = this.analyzeTrend(snapshots, periodDays)
    const averageWeeklyRate = this.calculateAverageWeeklyRate(snapshots)

    if (snapshots.length < 2) {
      return {
        trend,
        averageWeeklyRate,
        periodDays,
        startProgress: 0,
        endProgress: 0,
        totalVariation: 0
      }
    }

    const sorted = [...snapshots].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    const startProgress = sorted[0].progress
    const endProgress = sorted[sorted.length - 1].progress

    return {
      trend,
      averageWeeklyRate,
      periodDays,
      startProgress,
      endProgress,
      totalVariation: endProgress - startProgress
    }
  }
}

// Exportar instância singleton
export const trendAnalyzer = new TrendAnalyzer()
