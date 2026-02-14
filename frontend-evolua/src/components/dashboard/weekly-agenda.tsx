"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAppointments } from "@/hooks"

const DAY_LABELS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"] as const

const APPOINTMENT_TYPE_LABELS: Record<string, string> = {
  evaluation: "Avaliação",
  session: "Sessão",
  follow_up: "Retorno",
  reevaluation: "Reavaliação",
  parent_meeting: "Reunião com Pais",
  report_delivery: "Entrega de Relatório",
  regular: "Terapia",
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function shiftWeek(current: Date, delta: number): Date {
  const d = new Date(current)
  d.setDate(d.getDate() + delta * 7)
  return d
}

export function WeeklyAgenda() {
  const router = useRouter()
  const today = useMemo(() => new Date(), [])
  const [weekStart, setWeekStart] = useState(() => getWeekStart(today))

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      return d
    }),
    [weekStart]
  )

  const monthLabel = useMemo(() => {
    const fmt = (d: Date) => d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    const first = weekDays[0]
    const last = weekDays[6]
    return first.getMonth() === last.getMonth()
      ? fmt(first)
      : `${fmt(first)} — ${fmt(last)}`
  }, [weekDays])

  const weekFilter = useMemo(() => {
    const end = new Date(weekStart)
    end.setDate(end.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    return { startDate: weekStart.toISOString(), endDate: end.toISOString() }
  }, [weekStart])

  const { appointments } = useAppointments(weekFilter)

  const daysWithEvents = useMemo(() => {
    const set = new Set<string>()
    for (const a of appointments) {
      const d = new Date(a.dateTime)
      set.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
    }
    return set
  }, [appointments])

  const hasEvents = useCallback(
    (date: Date) => daysWithEvents.has(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`),
    [daysWithEvents]
  )

  const nextAppointment = useMemo(() => {
    return appointments
      .filter((a) => (a.status === "scheduled" || a.status === "confirmed") && new Date(a.dateTime) > today)
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0] ?? null
  }, [appointments, today])

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-[0_4px_30px_rgba(0,0,0,0.05)] flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#8A05BE]">calendar_month</span>
          <h3 className="font-bold text-lg text-gray-800">Minha Agenda Semanal</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-100">
          <button onClick={() => setWeekStart((p) => shiftWeek(p, -1))} className="hover:text-[#8A05BE] transition-colors">
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <span className="font-medium capitalize text-xs">{monthLabel}</span>
          <button onClick={() => setWeekStart((p) => shiftWeek(p, 1))} className="hover:text-[#8A05BE] transition-colors">
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Week strip */}
      <div className="grid grid-cols-7 gap-2 mb-8 text-center">
        {weekDays.map((date, i) => {
          const isToday = isSameDay(date, today)
          const isWeekend = date.getDay() === 0 || date.getDay() === 6
          const dayHasEvents = hasEvents(date)

          return (
            <div
              key={i}
              className={`flex flex-col gap-2 items-center py-2 rounded-xl relative transition-all ${
                isToday
                  ? "z-10"
                  : isWeekend
                  ? "opacity-40"
                  : ""
              }`}
            >
              {isToday && (
                <div className="absolute inset-0 bg-[#8A05BE] rounded-xl shadow-lg transform -skew-x-3 scale-110 -z-10" />
              )}
              <span className={`text-xs font-bold uppercase ${isToday ? "text-white/80 pt-2" : "text-gray-400"}`}>
                {isToday ? "Hoje" : DAY_LABELS[date.getDay()]}
              </span>
              <span className={isToday ? "text-2xl font-bold text-white pb-2" : "text-lg font-medium text-gray-600"}>
                {date.getDate()}
              </span>
              {dayHasEvents && !isToday && (
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              )}
              {dayHasEvents && isToday && (
                <div className="w-1.5 h-1.5 bg-white rounded-full absolute bottom-1.5" />
              )}
            </div>
          )
        })}
      </div>

      {/* Next appointment card */}
      {nextAppointment ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => router.push(`/dashboard/agendamentos/${nextAppointment.id}`)}
          onKeyDown={(e) => e.key === "Enter" && router.push(`/dashboard/agendamentos/${nextAppointment.id}`)}
          className="bg-white border border-gray-100 rounded-xl p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-12 bg-[#8A05BE] rounded-full" />
            <div>
              <h4 className="font-bold text-gray-900 text-base">
                {nextAppointment.patientName} — {APPOINTMENT_TYPE_LABELS[nextAppointment.type] ?? "Sessão"}
              </h4>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-sm">schedule</span>
                {new Date(nextAppointment.dateTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                {" "}• Presencial
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#8A05BE] uppercase tracking-wider hover:bg-purple-50 px-4 py-2 rounded-lg transition-colors">
            Ver Detalhes
          </span>
        </div>
      ) : (
        <div className="bg-white/40 border border-gray-100 rounded-xl p-5 text-center">
          <span className="material-symbols-outlined text-3xl text-gray-300 mb-1 block">event_available</span>
          <p className="text-sm text-gray-400">Nenhum compromisso próximo esta semana</p>
        </div>
      )}
    </div>
  )
}
