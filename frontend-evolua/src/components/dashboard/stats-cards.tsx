"use client"

import { useMemo } from "react"
import { usePatients, useTodayAppointments, useWeekAppointments, usePendingReports } from "@/hooks"

interface StatCardData {
  label: string
  icon: string
  value: number
  footnote: string
  footnoteIcon: string
  footnoteColor: string
  hasGradientDecor?: boolean
}

function StatCard({ card }: { card: StatCardData }) {
  return (
    <div className="glass-panel flex-1 min-w-[140px] md:w-40 p-4 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.05)] flex flex-col justify-between relative overflow-hidden group hover:shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all cursor-pointer">
      {card.hasGradientDecor && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-linear-to-br from-purple-100 to-transparent rounded-bl-full opacity-50" />
      )}
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
          {card.label}
        </span>
        <span className="material-symbols-outlined text-[#8A05BE] text-lg">
          {card.icon}
        </span>
      </div>
      <span className="text-3xl font-bold text-gray-900">
        {String(card.value).padStart(2, "0")}
      </span>
      <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${card.footnoteColor}`}>
        {card.footnoteIcon && (
          <span className="material-symbols-outlined text-sm">{card.footnoteIcon}</span>
        )}
        {card.footnote}
      </div>
    </div>
  )
}

export function StatsCards() {
  const { patients } = usePatients({ status: "active", limit: 999 })
  const { appointments: weekAppts } = useWeekAppointments()
  const { reports: pendingReports } = usePendingReports()
  const { appointments: todayAppts } = useTodayAppointments()

  const cards = useMemo<StatCardData[]>(() => {
    const pendingToday = todayAppts.filter(
      (a) => a.status === "scheduled" || a.status === "confirmed"
    ).length

    return [
      {
        label: "Pacientes Ativos",
        icon: "people_alt",
        value: patients.length,
        footnote: pendingToday > 0 ? `${pendingToday} Pendências` : "Nenhuma pendência",
        footnoteIcon: pendingToday > 0 ? "warning" : "check_circle",
        footnoteColor: pendingToday > 0 ? "text-amber-500" : "text-gray-400",
        hasGradientDecor: true,
      },
      {
        label: "Sessões/Semana",
        icon: "calendar_today",
        value: weekAppts.length,
        footnote: `+${weekAppts.filter((a) => a.status === "completed").length} que semana passada`,
        footnoteIcon: "trending_up",
        footnoteColor: "text-emerald-500",
      },
      {
        label: "Relatórios IA",
        icon: "auto_awesome",
        value: pendingReports.length,
        footnote: pendingReports.length > 0 ? "Prontos para revisão" : "Tudo em dia",
        footnoteIcon: "",
        footnoteColor: pendingReports.length > 0 ? "text-[#8A05BE]" : "text-emerald-500",
      },
    ]
  }, [patients.length, weekAppts, pendingReports.length, todayAppts])

  return (
    <div className="flex flex-wrap gap-4 w-full md:w-auto">
      {cards.map((card) => (
        <StatCard key={card.label} card={card} />
      ))}
    </div>
  )
}
