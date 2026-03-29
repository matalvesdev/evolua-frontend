import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { TimelineItemProps } from '@/types/evolution-history'
import { milestoneConfig } from '@/types/evolution-history'

/**
 * Item individual da timeline de marcos importantes.
 * Exibe ícone, data, descrição e progresso do milestone com cores baseadas no tipo.
 */
export function TimelineItem({ milestone, isHighlighted, onClick }: TimelineItemProps) {
  const config = milestoneConfig[milestone.type as keyof typeof milestoneConfig]

  const colorClasses = {
    green: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-200',
      icon: 'text-green-600'
    },
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: 'text-blue-600'
    },
    yellow: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      icon: 'text-yellow-600'
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: 'text-red-600'
    }
  }

  const colors = colorClasses[config.color as keyof typeof colorClasses]
  const dateStr = format(milestone.date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-pressed={isHighlighted}
      aria-label={`Marco: ${config.label} em ${dateStr} — ${milestone.description}`}
      className={`flex items-start gap-4 p-4 rounded-xl transition-all cursor-pointer ${
        isHighlighted
          ? 'bg-[#8A05BE]/10 border-2 border-[#8A05BE]'
          : 'hover:bg-gray-50 border border-transparent'
      }`}
    >
      {/* Icon */}
      <div className={`${colors.bg} ${colors.border} border p-3 rounded-full shrink-0`}>
        <span className={`material-symbols-outlined text-[24px] ${colors.icon}`}>
          {config.icon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`${colors.bg} ${colors.text} ${colors.border} border text-xs font-bold px-2 py-1 rounded-full`}>
            {config.label}
          </span>
          <span className="text-xs text-gray-500">{dateStr}</span>
        </div>
        
        <p className="text-sm text-gray-900 font-medium mb-1">
          {milestone.description}
        </p>
        
        <p className="text-xs text-gray-600">
          Progresso: <span className="font-bold text-[#8A05BE]">{milestone.progress}%</span>
        </p>
      </div>
    </div>
  )
}
