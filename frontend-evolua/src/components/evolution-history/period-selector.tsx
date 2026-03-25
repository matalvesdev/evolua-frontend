"use client"

import { useState } from "react"
import { PeriodSelection, PresetPeriod, presetPeriodConfig } from "@/types/evolution-history"

/** Props do componente PeriodSelector */
interface PeriodSelectorProps {
  /** Período atualmente selecionado */
  value: PeriodSelection
  /** Callback chamado quando o período muda */
  onChange: (period: PeriodSelection) => void
  /** Label descritivo exibido acima dos controles */
  label: string
}

/**
 * Seletor de período com opções predefinidas e intervalo personalizado.
 * Permite escolher entre últimos 7/30 dias, 3/6 meses ou datas customizadas.
 */
export function PeriodSelector({ value, onChange, label }: PeriodSelectorProps) {
  const [showCustom, setShowCustom] = useState(value.type === "custom")

  const presets: PresetPeriod[] = ["last7days", "last30days", "last3months", "last6months"]

  function handlePresetChange(preset: PresetPeriod) {
    setShowCustom(false)
    onChange({ type: "preset", preset })
  }

  function handleCustomToggle() {
    setShowCustom(true)
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)
    onChange({ type: "custom", customRange: { start, end } })
  }

  function handleDateChange(field: "start" | "end", dateStr: string) {
    const date = new Date(dateStr)
    const current = value.customRange ?? { start: new Date(), end: new Date() }
    onChange({
      type: "custom",
      customRange: { ...current, [field]: date },
    })
  }

  const toInputDate = (d: Date) => d.toISOString().split("T")[0]

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>

      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => handlePresetChange(preset)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              value.type === "preset" && value.preset === preset
                ? "bg-[#8A05BE] text-white border-[#8A05BE]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#8A05BE]/40 hover:text-[#8A05BE]"
            }`}
          >
            {presetPeriodConfig[preset].label}
          </button>
        ))}
        <button
          onClick={handleCustomToggle}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
            value.type === "custom"
              ? "bg-[#8A05BE] text-white border-[#8A05BE]"
              : "bg-white text-gray-600 border-gray-200 hover:border-[#8A05BE]/40 hover:text-[#8A05BE]"
          }`}
        >
          Personalizado
        </button>
      </div>

      {showCustom && value.customRange && (
        <div className="flex flex-col sm:flex-row gap-2 mt-1">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-gray-500">De</label>
            <input
              type="date"
              value={toInputDate(value.customRange.start)}
              max={toInputDate(value.customRange.end)}
              onChange={(e) => handleDateChange("start", e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#8A05BE] text-gray-700"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-gray-500">Até</label>
            <input
              type="date"
              value={toInputDate(value.customRange.end)}
              min={toInputDate(value.customRange.start)}
              max={toInputDate(new Date())}
              onChange={(e) => handleDateChange("end", e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#8A05BE] text-gray-700"
            />
          </div>
        </div>
      )}
    </div>
  )
}
