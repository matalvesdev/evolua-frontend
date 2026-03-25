import type { TrendBadgeProps } from '@/types/evolution-history'
import { trendConfig } from '@/types/evolution-history'

/**
 * Badge visual que exibe a tendência atual de progresso do paciente.
 * Mostra ícone, label e taxa média de progresso semanal com cores correspondentes.
 */
export function TrendBadge({ trend, averageWeeklyRate }: TrendBadgeProps) {
  const config = trendConfig[trend]

  const colorClasses = {
    green: 'bg-green-100 text-green-700 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    red: 'bg-red-100 text-red-700 border-red-200'
  }

  return (
    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border backdrop-blur-sm">
      <div className={`flex items-center gap-2 ${colorClasses[config.color]}`}>
        <span className="material-symbols-outlined text-[20px]">
          {config.icon}
        </span>
        <span className="text-sm font-bold">{config.label}</span>
      </div>
      
      <div className="h-4 w-px bg-gray-300"></div>
      
      <div className="text-sm text-gray-600">
        <span className="font-medium">{averageWeeklyRate.toFixed(1)}%</span>
        <span className="text-xs ml-1">por semana</span>
      </div>
    </div>
  )
}
