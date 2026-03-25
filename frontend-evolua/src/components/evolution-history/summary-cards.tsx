import { useMemo } from 'react'
import { differenceInDays } from 'date-fns'
import type { SummaryCardsProps } from '@/types/evolution-history'

/**
 * Cards de resumo com métricas principais do histórico de evolução.
 * Exibe progresso atual, progresso há 30 dias, variação percentual e
 * tempo médio para atingir 10% de progresso.
 */
export function SummaryCards({ snapshots }: SummaryCardsProps) {
  const stats = useMemo(() => {
    if (snapshots.length === 0) {
      return {
        currentProgress: 0,
        progress30DaysAgo: 0,
        variation: 0,
        avgDaysFor10Percent: 0
      }
    }

    // Ordenar por data (mais recente primeiro)
    const sorted = [...snapshots].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    
    const currentProgress = sorted[0].progress

    // Progresso há 30 dias
    const date30DaysAgo = new Date()
    date30DaysAgo.setDate(date30DaysAgo.getDate() - 30)
    
    const snapshot30DaysAgo = sorted.find(s => s.createdAt <= date30DaysAgo)
    const progress30DaysAgo = snapshot30DaysAgo?.progress || sorted[sorted.length - 1].progress

    const variation = currentProgress - progress30DaysAgo

    // Tempo médio para atingir 10% de progresso
    let totalDays = 0
    let progressJumps = 0

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i]
      const next = sorted[i + 1]
      const progressDiff = Math.abs(current.progress - next.progress)
      
      if (progressDiff >= 10) {
        const days = differenceInDays(current.createdAt, next.createdAt)
        totalDays += days
        progressJumps++
      }
    }

    const avgDaysFor10Percent = progressJumps > 0 ? Math.round(totalDays / progressJumps) : 0

    return {
      currentProgress,
      progress30DaysAgo,
      variation,
      avgDaysFor10Percent
    }
  }, [snapshots])

  const cards = [
    {
      icon: 'trending_up',
      label: 'Progresso Atual',
      value: `${stats.currentProgress}%`,
      color: 'purple'
    },
    {
      icon: 'history',
      label: 'Há 30 Dias',
      value: `${stats.progress30DaysAgo}%`,
      color: 'blue'
    },
    {
      icon: stats.variation >= 0 ? 'arrow_upward' : 'arrow_downward',
      label: 'Variação',
      value: `${stats.variation > 0 ? '+' : ''}${stats.variation}%`,
      color: stats.variation >= 0 ? 'green' : 'red'
    },
    {
      icon: 'schedule',
      label: 'Tempo Médio (10%)',
      value: stats.avgDaysFor10Percent > 0 ? `${stats.avgDaysFor10Percent} dias` : 'N/A',
      color: 'yellow'
    }
  ]

  const colorClasses = {
    purple: 'bg-purple-100 text-[#8A05BE]',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600'
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="glass-card rounded-xl p-4 border border-white hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`${colorClasses[card.color as keyof typeof colorClasses]} p-2 rounded-lg`}>
              <span className="material-symbols-outlined text-[20px]">
                {card.icon}
              </span>
            </div>
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              {card.label}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{card.value}</p>
        </div>
      ))}
    </div>
  )
}
