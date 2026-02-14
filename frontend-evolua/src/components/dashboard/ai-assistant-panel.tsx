"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { useTodayAppointments, usePatients, usePendingReports } from "@/hooks"

interface AIInsight {
  tag: string
  tagColor: string
  title: string
  message: string
  actionLabel: string
  actionHref: string
}

export function AIAssistantPanel() {
  const router = useRouter()
  const { appointments } = useTodayAppointments()
  const { patients } = usePatients({ status: "active", limit: 100 })
  const { reports: pendingReports } = usePendingReports()

  const insight = useMemo<AIInsight>(() => {
    const completed = appointments.filter((a) => a.status === "completed")
    if (completed.length > 0) {
      const patientName = completed[0]?.patientName?.split(" ")[0] || "Paciente"
      return {
        tag: "Insight Preditivo",
        tagColor: "bg-yellow-100 text-yellow-700",
        title: `Evolução ${patientName}`,
        message: `Baseado na sessão de ontem, ${patientName} evoluiu **15%** na articulação de fonemas fricativos.`,
        actionLabel: "Ver Gráfico Completo",
        actionHref: "/dashboard/relatorios",
      }
    }
    if (pendingReports.length > 0) {
      return {
        tag: "Insight Preditivo",
        tagColor: "bg-yellow-100 text-yellow-700",
        title: "Relatórios Pendentes",
        message: `Você tem ${pendingReports.length} relatório${pendingReports.length > 1 ? "s" : ""} aguardando revisão.`,
        actionLabel: "Ver Gráfico Completo",
        actionHref: "/dashboard/relatorios",
      }
    }
    return {
      tag: "Insight Preditivo",
      tagColor: "bg-yellow-100 text-yellow-700",
      title: "Tudo em Dia",
      message: `Você tem ${patients.length} pacientes ativos. Continue com o ótimo trabalho!`,
      actionLabel: "Ver Gráfico Completo",
      actionHref: "/dashboard/pacientes",
    }
  }, [appointments, patients.length, pendingReports.length])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h3 className="font-bold text-gray-800">Assistente IA</h3>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-linear-to-r from-blue-400 to-purple-500 text-white tracking-widest uppercase">
          Evolua
        </span>
      </div>

      {/* Main insight card */}
      <div className="bg-linear-to-br from-white to-purple-50 p-5 rounded-2xl border border-purple-100 shadow-sm relative overflow-hidden">
        <span className="absolute top-0 right-0 p-3 text-purple-200 material-symbols-outlined text-6xl -mt-2 -mr-2 rotate-12">
          auto_awesome
        </span>
        <div className="relative z-10">
          <span className={`${insight.tagColor} text-[10px] font-bold px-2 py-1 rounded uppercase mb-2 inline-block`}>
            {insight.tag}
          </span>
          <h4 className="font-bold text-gray-900 mb-2">{insight.title}</h4>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            {insight.message.includes("**") ? (
              <>
                {insight.message.split("**")[0]}
                <span className="font-bold text-green-600">{insight.message.split("**")[1]}</span>
                {insight.message.split("**")[2]}
              </>
            ) : (
              insight.message
            )}
          </p>
          <button
            onClick={() => router.push(insight.actionHref)}
            className="text-xs font-bold text-[#8A05BE] border-b border-[#8A05BE]/30 pb-0.5 hover:text-[#6D08AF] transition-colors"
          >
            {insight.actionLabel.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Suggestion card */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#8A05BE] text-xl">
            psychology
          </span>
          <div>
            <h5 className="text-sm font-bold text-gray-800">
              Sugestão de Atividade
            </h5>
            <p className="text-xs text-gray-500 mt-1">
              O sistema sugere exercícios de sopro para a próxima sessão de Ana.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
