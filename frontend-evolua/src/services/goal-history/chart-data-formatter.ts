import { startOfWeek, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type {
  GoalProgressSnapshot,
  Milestone,
  ChartDataPoint
} from '@/types/evolution-history'

/**
 * Formatador de dados para visualização em gráficos
 */
export class ChartDataFormatter {
  /**
   * Transforma snapshots em pontos de dados para gráfico
   * @param snapshots - Array de snapshots
   * @param milestones - Array de milestones
   * @returns Array de pontos de dados formatados
   */
  format(snapshots: GoalProgressSnapshot[], milestones: Milestone[]): ChartDataPoint[] {
    // Ordenar snapshots por data (mais antigo primeiro)
    const sorted = [...snapshots].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

    return sorted.map((snapshot, index) => {
      const prevSnapshot = index > 0 ? sorted[index - 1] : null
      const variation = prevSnapshot ? snapshot.progress - prevSnapshot.progress : 0

      // Verificar se há milestone nesta data
      const milestone = milestones.find(m => 
        Math.abs(m.date.getTime() - snapshot.createdAt.getTime()) < 60000 // 1 minuto de tolerância
      )

      return {
        date: snapshot.createdAt,
        progress: snapshot.progress,
        variation,
        isMilestone: !!milestone,
        milestoneType: milestone?.type
      }
    })
  }

  /**
   * Agrupa dados por semana para períodos longos
   * @param snapshots - Array de snapshots
   * @returns Array de snapshots agrupados por semana
   */
  groupByWeek(snapshots: GoalProgressSnapshot[]): GoalProgressSnapshot[] {
    if (snapshots.length === 0) return []

    // Ordenar por data
    const sorted = [...snapshots].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

    // Agrupar por semana
    const weekGroups = new Map<string, GoalProgressSnapshot[]>()

    for (const snapshot of sorted) {
      const weekStart = startOfWeek(snapshot.createdAt, { locale: ptBR })
      const weekKey = format(weekStart, 'yyyy-MM-dd')

      if (!weekGroups.has(weekKey)) {
        weekGroups.set(weekKey, [])
      }
      weekGroups.get(weekKey)!.push(snapshot)
    }

    // Criar snapshot representativo para cada semana (último da semana)
    const weeklySnapshots: GoalProgressSnapshot[] = []

    for (const [weekKey, group] of weekGroups) {
      const lastSnapshot = group[group.length - 1]
      weeklySnapshots.push(lastSnapshot)
    }

    return weeklySnapshots
  }

  /**
   * Calcula progresso geral como média de múltiplas metas
   * @param goalProgresses - Array de progressos de diferentes metas
   * @returns Progresso geral (média aritmética)
   */
  calculateOverallProgress(goalProgresses: number[]): number {
    if (goalProgresses.length === 0) return 0
    
    const sum = goalProgresses.reduce((acc, progress) => acc + progress, 0)
    return Math.round((sum / goalProgresses.length) * 100) / 100 // Arredondar para 2 casas decimais
  }

  /**
   * Formata dados para tooltip do gráfico
   * @param snapshot - Snapshot a ser formatado
   * @returns Objeto com dados formatados para tooltip
   */
  formatTooltipData(snapshot: GoalProgressSnapshot): {
    date: string
    progress: string
    variation: string
  } {
    const dateStr = format(snapshot.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    const progressStr = `${snapshot.progress}%`
    const variationStr = snapshot.variation !== undefined
      ? `${snapshot.variation > 0 ? '+' : ''}${snapshot.variation}%`
      : '0%'

    return {
      date: dateStr,
      progress: progressStr,
      variation: variationStr
    }
  }

  /**
   * Determina se período é longo (>6 meses) e precisa agrupamento
   * @param snapshots - Array de snapshots
   * @returns true se período > 6 meses
   */
  shouldGroupByWeek(snapshots: GoalProgressSnapshot[]): boolean {
    if (snapshots.length < 2) return false

    const sorted = [...snapshots].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    const firstDate = sorted[0].createdAt
    const lastDate = sorted[sorted.length - 1].createdAt

    const diffInDays = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
    return diffInDays > 180 // 6 meses
  }
}

// Exportar instância singleton
export const chartDataFormatter = new ChartDataFormatter()
