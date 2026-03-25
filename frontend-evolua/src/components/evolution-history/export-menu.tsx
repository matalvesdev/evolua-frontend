"use client"

import { useRef, useState } from "react"
import { GoalProgressSnapshot, Milestone, ExportFormat } from "@/types/evolution-history"
import { ExportService } from "@/services/goal-history"

/** Props do componente ExportMenu */
interface ExportMenuProps {
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
  chartRef: React.RefObject<HTMLDivElement | null>
}

const formats: { format: ExportFormat; label: string; icon: string }[] = [
  { format: "pdf", label: "Exportar PDF", icon: "picture_as_pdf" },
  { format: "csv", label: "Exportar CSV", icon: "table_chart" },
  { format: "png", label: "Salvar Imagem", icon: "image" },
]

/**
 * Menu dropdown para exportação de dados históricos em múltiplos formatos.
 * Suporta exportação em PDF, CSV e PNG com feedback visual de progresso.
 */
export function ExportMenu({ patientName, snapshots, milestones, chartRef }: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<ExportFormat | null>(null)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleExport(format: ExportFormat) {
    setOpen(false)
    setLoading(format)
    try {
      if (format === "pdf") {
        await ExportService.exportToPDF({
          format: "pdf",
          includeCharts: true,
          includeTimeline: true,
          includeTrendAnalysis: true,
        })
      } else if (format === "csv") {
        ExportService.exportToCSV(snapshots)
      } else if (format === "png") {
        if (chartRef.current) {
          await ExportService.exportChartToPNG(chartRef.current)
        }
      }
      showToast("success", `Exportação em ${format.toUpperCase()} concluída.`)
    } catch {
      showToast("error", `Erro ao exportar em ${format.toUpperCase()}.`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={!!loading}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2 rounded-xl transition-all disabled:opacity-50"
        aria-label="Exportar dados"
      >
        {loading ? (
          <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
        ) : (
          <span className="material-symbols-outlined text-[16px]">download</span>
        )}
        Exportar
        <span className="material-symbols-outlined text-[14px]">
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 min-w-[180px] overflow-hidden">
          {formats.map(({ format, label, icon }) => (
            <button
              key={format}
              onClick={() => handleExport(format)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-[#8A05BE]/5 hover:text-[#8A05BE] transition-colors text-left"
            >
              <span className="material-symbols-outlined text-[18px]">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Backdrop para fechar o menu */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg text-sm font-semibold transition-all ${
            toast.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          {toast.message}
        </div>
      )}
    </div>
  )
}
