"use client"

import { useRouter } from "next/navigation"
import { usePendingReports } from "@/hooks"

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: string; iconBg: string; iconText: string }> = {
  draft: {
    label: "Rascunho",
    bg: "bg-gray-200",
    text: "text-gray-600",
    icon: "folder_open",
    iconBg: "bg-gray-100",
    iconText: "text-gray-500",
  },
  pending_review: {
    label: "Em Revisão",
    bg: "bg-purple-100",
    text: "text-purple-700",
    icon: "psychology",
    iconBg: "bg-purple-100",
    iconText: "text-purple-600",
  },
  approved: {
    label: "Finalizado",
    bg: "bg-green-100",
    text: "text-green-700",
    icon: "description",
    iconBg: "bg-green-100",
    iconText: "text-green-600",
  },
  sent: {
    label: "Enviado",
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: "send",
    iconBg: "bg-blue-100",
    iconText: "text-blue-600",
  },
}

const defaultStatus = {
  label: "Pendente",
  bg: "bg-gray-100",
  text: "text-gray-600",
  icon: "description",
  iconBg: "bg-gray-100",
  iconText: "text-gray-500",
}

export function RecentDocuments() {
  const router = useRouter()
  const { reports, loading } = usePendingReports()

  const recentReports = reports.slice(0, 3)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800">Documentos Recentes</h3>
        <button
          onClick={() => router.push("/dashboard/relatorios")}
          className="text-xs font-bold text-gray-400 hover:text-[#8A05BE] transition-colors"
        >
          VER TODOS
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-6 text-gray-400">
            <span className="material-symbols-outlined animate-spin text-xl mb-1 block">
              progress_activity
            </span>
            <p className="text-xs">Carregando...</p>
          </div>
        ) : recentReports.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <span className="material-symbols-outlined text-3xl mb-1 block">
              folder_off
            </span>
            <p className="text-xs">Nenhum documento recente</p>
          </div>
        ) : (
          recentReports.map((report) => {
            const cfg = statusConfig[report.status] || defaultStatus
            const date = new Date(report.createdAt)
            const timeStr = date.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })

            return (
              <div
                key={report.id}
                onClick={() =>
                  router.push(
                    `/dashboard/pacientes/${report.patientId}/revisar-relatorio?reportId=${report.id}`
                  )
                }
                className="glass-panel p-3 rounded-xl flex items-center gap-3 cursor-pointer border border-transparent hover:border-gray-200 hover:shadow-md transition-all group"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${cfg.iconBg} ${cfg.iconText} flex items-center justify-center shrink-0`}
                >
                  <span className="material-symbols-outlined">{cfg.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h4 className="text-sm font-bold text-gray-800 truncate pr-2 group-hover:text-[#8A05BE] transition-colors">
                      {report.title || "Relatório"}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.text} text-[10px] font-bold uppercase tracking-wide whitespace-nowrap`}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    Paciente: {report.patientName}
                  </p>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    {timeStr}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
