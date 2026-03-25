"use client"

import { useMemo } from 'react'
import type { TimelineComponentProps } from '@/types/evolution-history'
import { TimelineItem } from './timeline-item'

/**
 * Componente de timeline que exibe marcos importantes em ordem cronológica.
 * Ordena milestones por data e sincroniza seleção com o Progress_Chart.
 */
export function TimelineComponent({
  milestones,
  onMilestoneClick,
  highlightedMilestoneId
}: TimelineComponentProps) {
  // Ordenar milestones cronologicamente (mais antigo primeiro, mais recente por último)
  const sortedMilestones = useMemo(() => {
    return [...milestones].sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [milestones])

  if (sortedMilestones.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <span className="material-symbols-outlined text-[48px] text-gray-300 mb-2">
          timeline
        </span>
        <p className="text-sm">Nenhum marco registrado ainda</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sortedMilestones.map((milestone) => (
        <TimelineItem
          key={milestone.id}
          milestone={milestone}
          isHighlighted={milestone.id === highlightedMilestoneId}
          onClick={() => onMilestoneClick?.(milestone)}
        />
      ))}
    </div>
  )
}
