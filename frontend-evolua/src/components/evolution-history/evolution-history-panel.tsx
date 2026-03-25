"use client"

import { useRef, useState } from "react"
import type { EvolutionHistoryPanelProps, PeriodSelection } from "@/types/evolution-history"
import { useEvolutionHistory } from "@/hooks/use-evolution-history"
import { EmptyState } from "./empty-state"
import { ErrorState } from "./error-state"
import { SkeletonLoader } from "./skeleton-loader"
import { SummaryCards } from "./summary-cards"
import { ProgressChart } from "./progress-chart"
import { TrendBadge } from "./trend-badge"
import { TimelineComponent } from "./timeline-component"
import { PeriodComparator } from "./period-comparator"
import { ExportMenu } from "./export-menu"

/**
 * Painel principal de histórico de evolução do plano terapêutico.
 * Container que orquestra todos os subcomponentes: gráfico, timeline,
 * análise de tendências, comparação de períodos e exportação.
 * Responsivo: drawer lateral em desktop, modal fullscreen em mobile.
 */
export function EvolutionHistoryPanel({
  goalId,
  patientId,
  isOpen,
  onClose,
}: EvolutionHistoryPanelProps) {
  const { snapshots, milestones, trendAnalysis, loading, error, refetch } = useEvolutionHistory({
    goalId,
    patientId,
  })

  const [highlightedMilestoneId, setHighlightedMilestoneId] = useState<string | undefined>()
  const [comparisonPeriods, setComparisonPeriods] = useState<[PeriodSelection, PeriodSelection] | undefined>()
  const [showComparator, setShowComparator] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed z-50 bg-white shadow-2xl overflow-y-auto inset-0 md:inset-auto md:top-0 md:right-0 md:h-full md:w-full md:max-w-4xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Histórico de Evolução</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {goalId ? "Meta específica" : "Progresso geral do paciente"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!loading && !error && snapshots.length > 0 && (
              <ExportMenu
                goalId={goalId}
                patientId={patientId}
                patientName=""
                snapshots={snapshots}
                milestones={milestones}
                chartRef={chartRef}
              />
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Fechar painel"
            >
              <span className="material-symbols-outlined text-gray-600">close</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading && <SkeletonLoader />}

          {error && !loading && <ErrorState message={error} onRetry={refetch} />}

          {!loading && !error && snapshots.length === 0 && (
            <EmptyState
              icon="history"
              title="Nenhum histórico disponível"
              description="O histórico será criado automaticamente conforme o progresso é atualizado."
            />
          )}

          {!loading && !error && snapshots.length > 0 && (
            <>
              {/* Summary Cards */}
              <SummaryCards snapshots={snapshots} />

              {/* Trend Badge */}
              {trendAnalysis && (
                <div className="flex justify-center">
                  <TrendBadge
                    trend={trendAnalysis.trend}
                    averageWeeklyRate={trendAnalysis.averageWeeklyRate}
                  />
                </div>
              )}

              {/* Progress Chart */}
              <div className="glass-card rounded-2xl p-6 border border-white" ref={chartRef}>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#8A05BE]">show_chart</span>
                  Gráfico de Evolução
                </h3>
                <div className="h-80">
                  <ProgressChart
                    snapshots={snapshots}
                    milestones={milestones}
                    comparisonPeriods={comparisonPeriods}
                    onMilestoneClick={(milestone) => {
                      setHighlightedMilestoneId(milestone.id)
                      document.getElementById("timeline-section")?.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                      })
                    }}
                  />
                </div>
              </div>

              {/* Timeline */}
              {milestones.length > 0 && (
                <div id="timeline-section" className="glass-card rounded-2xl p-6 border border-white">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#8A05BE]">timeline</span>
                    Marcos Importantes
                  </h3>
                  <TimelineComponent
                    milestones={milestones}
                    highlightedMilestoneId={highlightedMilestoneId}
                    onMilestoneClick={(milestone) => {
                      setHighlightedMilestoneId(
                        highlightedMilestoneId === milestone.id ? undefined : milestone.id
                      )
                    }}
                  />
                </div>
              )}

              {/* Comparação de Períodos */}
              <div className="glass-card rounded-2xl border border-white overflow-hidden">
                <button
                  onClick={() => setShowComparator((v) => !v)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors"
                >
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#8A05BE]">compare_arrows</span>
                    Comparar Períodos
                  </h3>
                  <span className="material-symbols-outlined text-gray-400">
                    {showComparator ? "expand_less" : "expand_more"}
                  </span>
                </button>

                {showComparator && (
                  <div className="px-6 pb-6">
                    <PeriodComparator
                      snapshots={snapshots}
                      onPeriodChange={setComparisonPeriods}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
