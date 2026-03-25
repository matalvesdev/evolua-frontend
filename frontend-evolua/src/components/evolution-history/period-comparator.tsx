"use client"

import { useState } from "react"
import { PeriodSelection, GoalProgressSnapshot, PeriodComparisonResult } from "@/types/evolution-history"
import { trendAnalyzer } from "@/services/goal-history"
import { PeriodSelector } from "./period-selector"

/** Props do componente PeriodComparator */
interface PeriodComparatorProps {
  /** Snapshots de progresso para calcular estatísticas comparativas */
  snapshots: GoalProgressSnapshot[]
  /** Callback chamado quando os períodos selecionados mudam */
  onPeriodChange: (periods: [PeriodSelection, PeriodSelection]) => void
  /** Períodos iniciais (padrão: últimos 30 dias e últimos 3 meses) */
  initialPeriods?: [PeriodSelection, PeriodSelection]
}

const defaultPeriod1: PeriodSelection = { type: "preset", preset: "last30days" }
const defaultPeriod2: PeriodSelection = { type: "preset", preset: "last3months" }

/**
 * Componente para comparação de progresso entre dois períodos de tempo.
 * Renderiza dois seletores de período e exibe estatísticas comparativas lado a lado.
 */
export function PeriodComparator({ snapshots, onPeriodChange, initialPeriods }: PeriodComparatorProps) {
  const [period1, setPeriod1] = useState<PeriodSelection>(initialPeriods?.[0] ?? defaultPeriod1)
  const [period2, setPeriod2] = useState<PeriodSelection>(initialPeriods?.[1] ?? defaultPeriod2)

  function handlePeriod1Change(p: PeriodSelection) {
    setPeriod1(p)
    onPeriodChange([p, period2])
  }

  function handlePeriod2Change(p: PeriodSelection) {
    setPeriod2(p)
    onPeriodChange([period1, p])
  }

  const comparison: PeriodComparisonResult | null =
    snapshots.length >= 2
      ? trendAnalyzer.comparePeriods(snapshots, period1, period2)
      : null

  const variationColor =
    !comparison ? "text-gray-500"
    : comparison.variation > 0 ? "text-green-600"
    : comparison.variation < 0 ? "text-red-500"
    : "text-gray-500"

  const variationIcon =
    !comparison ? "remove"
    : comparison.variation > 0 ? "arrow_upward"
    : comparison.variation < 0 ? "arrow_downward"
    : "remove"

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/60 rounded-2xl p-4 border border-gray-100">
          <PeriodSelector value={period1} onChange={handlePeriod1Change} label="Período 1" />
        </div>
        <div className="bg-white/60 rounded-2xl p-4 border border-gray-100">
          <PeriodSelector value={period2} onChange={handlePeriod2Change} label="Período 2" />
        </div>
      </div>

      {comparison && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Período 1 */}
          <div className="bg-white/60 rounded-2xl p-4 border border-gray-100 flex flex-col gap-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Período 1</span>
            <span className="text-2xl font-bold text-gray-900">
              {comparison.period1.averageProgress.toFixed(1)}%
            </span>
            <span className="text-xs text-gray-500">
              {comparison.period1.updateCount} atualizações
            </span>
          </div>

          {/* Variação */}
          <div className="bg-white/60 rounded-2xl p-4 border border-gray-100 flex flex-col gap-1 items-center justify-center">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Variação</span>
            <div className={`flex items-center gap-1 ${variationColor}`}>
              <span className="material-symbols-outlined text-[20px]">{variationIcon}</span>
              <span className="text-2xl font-bold">
                {comparison.variation > 0 ? "+" : ""}{comparison.variation.toFixed(1)}%
              </span>
            </div>
            <span className="text-xs text-gray-500">entre os períodos</span>
          </div>

          {/* Período 2 */}
          <div className="bg-white/60 rounded-2xl p-4 border border-gray-100 flex flex-col gap-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Período 2</span>
            <span className="text-2xl font-bold text-gray-900">
              {comparison.period2.averageProgress.toFixed(1)}%
            </span>
            <span className="text-xs text-gray-500">
              {comparison.period2.updateCount} atualizações
            </span>
          </div>
        </div>
      )}

      {!comparison && snapshots.length < 2 && (
        <p className="text-sm text-gray-400 text-center py-4">
          Dados insuficientes para comparação de períodos.
        </p>
      )}
    </div>
  )
}
