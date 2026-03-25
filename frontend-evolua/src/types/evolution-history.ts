// Types e interfaces para funcionalidade de Histórico de Evolução do Plano Terapêutico

// ============================================================================
// Domain Models
// ============================================================================

/** Registro histórico do progresso de uma meta em um momento específico */
export interface GoalProgressSnapshot {
  /** ID único do snapshot */
  id: string
  /** ID da meta associada */
  goalId: string
  /** Valor do progresso (0-100) */
  progress: number
  /** Data e hora do registro */
  createdAt: Date
  /** ID do terapeuta que registrou */
  therapistId: string
  /** Observações opcionais */
  notes?: string
  /** Calculado: diferença do snapshot anterior */
  variation?: number
  /** Calculado: dias desde último snapshot */
  daysSinceLast?: number
}

/** Tipos de marcos importantes na evolução de uma meta */
export type MilestoneType = 'started' | 'significant_increase' | 'significant_decrease' | 'completed'

/** Marco importante na evolução de uma meta terapêutica */
export interface Milestone {
  /** ID único do milestone */
  id: string
  /** ID da meta associada */
  goalId: string
  /** Tipo do marco */
  type: MilestoneType
  /** Data em que o marco ocorreu */
  date: Date
  /** Valor do progresso no momento do marco */
  progress: number
  /** Descrição textual do marco */
  description: string
  /** Data de criação do registro */
  createdAt: Date
}

/** Classificação da tendência de evolução */
export type ProgressTrend = 'improvement' | 'stagnation' | 'regression'

/** Resultado completo da análise de tendência de progresso */
export interface TrendAnalysis {
  /** Classificação da tendência */
  trend: ProgressTrend
  /** Taxa média de progresso por semana */
  averageWeeklyRate: number
  /** Número de dias analisados */
  periodDays: number
  /** Progresso no início do período */
  startProgress: number
  /** Progresso no final do período */
  endProgress: number
  /** Variação total no período */
  totalVariation: number
}

/** Períodos predefinidos disponíveis para seleção */
export type PresetPeriod = 'last7days' | 'last30days' | 'last3months' | 'last6months'

/** Seleção de período para análise ou comparação */
export interface PeriodSelection {
  /** Tipo de seleção: predefinido ou personalizado */
  type: 'preset' | 'custom'
  /** Período predefinido selecionado (quando type === 'preset') */
  preset?: PresetPeriod
  /** Intervalo de datas personalizado (quando type === 'custom') */
  customRange?: {
    start: Date
    end: Date
  }
}

/** Estatísticas calculadas para um período específico */
export interface PeriodStats {
  /** Progresso médio no período */
  averageProgress: number
  /** Número de atualizações no período */
  updateCount: number
  /** Data de início do período */
  startDate: Date
  /** Data de fim do período */
  endDate: Date
}

/** Resultado da comparação entre dois períodos */
export interface PeriodComparisonResult {
  /** Estatísticas do primeiro período */
  period1: PeriodStats
  /** Estatísticas do segundo período */
  period2: PeriodStats
  /** Variação de progresso médio entre os períodos */
  variation: number
}

/** Formatos de exportação disponíveis */
export type ExportFormat = 'pdf' | 'csv' | 'png'

/** Opções para exportação de dados históricos */
export interface ExportOptions {
  /** Formato do arquivo exportado */
  format: ExportFormat
  /** Incluir gráficos no export */
  includeCharts: boolean
  /** Incluir timeline de marcos */
  includeTimeline: boolean
  /** Incluir análise de tendências */
  includeTrendAnalysis: boolean
  /** Intervalo de datas para filtrar dados exportados */
  dateRange?: { start: Date; end: Date }
  /** Elemento HTML do gráfico para captura PNG */
  chartElement?: HTMLElement
}

/** Métricas de resumo exibidas nos cards do painel */
export interface SummaryMetrics {
  /** Progresso atual da meta */
  currentProgress: number
  /** Progresso registrado há 30 dias */
  progressThirtyDaysAgo: number
  /** Variação percentual nos últimos 30 dias */
  percentageVariation: number
  /** Tempo médio em dias para atingir 10% de progresso */
  avgTimeToTenPercent: number
}

/** Dados completos para exportação de relatório */
export interface ExportData {
  /** Nome do paciente */
  patientName: string
  /** ID do paciente */
  patientId: string
  /** Nome da meta (opcional) */
  goalName?: string
  /** ID da meta (opcional) */
  goalId?: string
  /** Período dos dados exportados */
  period: {
    start: Date
    end: Date
  }
  /** Snapshots de progresso */
  snapshots: GoalProgressSnapshot[]
  /** Milestones da meta */
  milestones: Milestone[]
  /** Análise de tendência */
  trendAnalysis: TrendAnalysis
  /** Data de geração do relatório */
  generatedAt: Date
  /** ID do terapeuta que gerou o relatório */
  generatedBy: string
}

/** Ponto de dados formatado para renderização no gráfico */
export interface ChartDataPoint {
  /** Data do ponto */
  date: Date
  /** Valor do progresso (0-100) */
  progress: number
  /** Variação em relação ao ponto anterior */
  variation: number
  /** Indica se este ponto corresponde a um milestone */
  isMilestone: boolean
  /** Tipo do milestone (quando isMilestone === true) */
  milestoneType?: MilestoneType
}

// ============================================================================
// Configuration Objects
// ============================================================================

export const milestoneConfig: Record<MilestoneType, { icon: string; color: string; label: string }> = {
  started: {
    icon: 'flag',
    color: 'green',
    label: 'Iniciado'
  },
  significant_increase: {
    icon: 'trending_up',
    color: 'blue',
    label: 'Aumento Significativo'
  },
  significant_decrease: {
    icon: 'trending_down',
    color: 'yellow',
    label: 'Diminuição Significativa'
  },
  completed: {
    icon: 'check_circle',
    color: 'green',
    label: 'Concluído'
  }
}

export const trendConfig: Record<ProgressTrend, { icon: string; color: string; label: string }> = {
  improvement: {
    icon: 'arrow_upward',
    color: 'green',
    label: 'Melhora'
  },
  stagnation: {
    icon: 'remove',
    color: 'yellow',
    label: 'Estagnação'
  },
  regression: {
    icon: 'arrow_downward',
    color: 'red',
    label: 'Regressão'
  }
}

export const presetPeriodConfig: Record<PresetPeriod, { label: string; days: number }> = {
  last7days: { label: 'Últimos 7 dias', days: 7 },
  last30days: { label: 'Últimos 30 dias', days: 30 },
  last3months: { label: 'Últimos 3 meses', days: 90 },
  last6months: { label: 'Últimos 6 meses', days: 180 }
}

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

/** DTO para criação manual de snapshot de progresso */
export interface CreateSnapshotDTO {
  /** ID da meta */
  goalId: string
  /** Valor do progresso (0-100) */
  progress: number
  /** ID do terapeuta */
  therapistId: string
  /** Observações opcionais */
  notes?: string
}

/** DTO para criação manual de milestone */
export interface CreateMilestoneDTO {
  /** ID da meta */
  goalId: string
  /** Tipo do marco */
  type: MilestoneType
  /** Data do marco */
  date: Date
  /** Valor do progresso no momento do marco */
  progress: number
  /** Descrição do marco */
  description: string
}

// ============================================================================
// Component Props Interfaces
// ============================================================================

/** Props do componente EvolutionHistoryPanel */
export interface EvolutionHistoryPanelProps {
  /** ID da meta específica; se undefined, mostra histórico geral do paciente */
  goalId?: string
  /** ID do paciente */
  patientId: string
  /** Controla visibilidade do painel */
  isOpen: boolean
  /** Callback chamado ao fechar o painel */
  onClose: () => void
}

/** Props do componente ProgressChart */
export interface ProgressChartProps {
  /** Snapshots de progresso a serem exibidos */
  snapshots: GoalProgressSnapshot[]
  /** Milestones para destacar no gráfico */
  milestones: Milestone[]
  /** Períodos para comparação visual com cores diferentes */
  comparisonPeriods?: [PeriodSelection, PeriodSelection]
  /** Callback ao passar o mouse sobre um ponto */
  onPointHover?: (snapshot: GoalProgressSnapshot) => void
  /** Callback ao clicar em um milestone */
  onMilestoneClick?: (milestone: Milestone) => void
}

/** Props do componente TimelineComponent */
export interface TimelineComponentProps {
  /** Lista de milestones a exibir */
  milestones: Milestone[]
  /** Callback ao clicar em um milestone */
  onMilestoneClick?: (milestone: Milestone) => void
  /** ID do milestone atualmente destacado */
  highlightedMilestoneId?: string
}

/** Props do componente TimelineItem */
export interface TimelineItemProps {
  /** Milestone a ser renderizado */
  milestone: Milestone
  /** Indica se este item está destacado */
  isHighlighted: boolean
  /** Callback ao clicar no item */
  onClick: () => void
}

/** Props do componente TrendBadge */
export interface TrendBadgeProps {
  /** Tendência calculada de progresso */
  trend: ProgressTrend
  /** Taxa média de progresso por semana */
  averageWeeklyRate: number
}

/** Props do componente PeriodComparator */
export interface PeriodComparatorProps {
  /** Callback chamado quando os períodos selecionados mudam */
  onPeriodChange: (periods: [PeriodSelection, PeriodSelection]) => void
  /** Períodos iniciais para comparação */
  initialPeriods?: [PeriodSelection, PeriodSelection]
}

/** Props do componente PeriodSelector */
export interface PeriodSelectorProps {
  /** Período atualmente selecionado */
  value: PeriodSelection
  /** Callback chamado quando o período muda */
  onChange: (period: PeriodSelection) => void
  /** Label descritivo exibido acima dos controles */
  label: string
}

/** Props do componente ExportMenu */
export interface ExportMenuProps {
  /** ID da meta específica (opcional) */
  goalId?: string
  /** ID do paciente */
  patientId: string
  /** Nome do paciente para uso no nome do arquivo exportado */
  patientName: string
  /** Snapshots de progresso a serem exportados */
  snapshots: GoalProgressSnapshot[]
  /** Milestones a serem incluídos na exportação */
  milestones: Milestone[]
  /** Referência ao elemento do gráfico para exportação PNG */
  chartRef: React.RefObject<HTMLDivElement>
}

/** Props do componente SummaryCards */
export interface SummaryCardsProps {
  /** Snapshots de progresso para calcular as métricas de resumo */
  snapshots: GoalProgressSnapshot[]
}
