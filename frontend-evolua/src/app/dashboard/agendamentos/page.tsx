"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { useAppointments, useTodayAppointments, useAppointmentMutations } from "@/hooks"
import type { Appointment } from "@/lib/api/appointments"

const WEEKDAYS_SHORT = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"]
const WEEKDAYS_MINI = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const HOURS = Array.from({ length: 13 }, (_, i) => i + 7) // 7h - 19h

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
  scheduled: { label: "Agendado", bg: "bg-yellow-100/80", text: "text-yellow-800", dot: "bg-yellow-500", border: "border-l-yellow-500" },
  confirmed: { label: "Confirmado", bg: "bg-blue-100/80", text: "text-blue-800", dot: "bg-blue-500", border: "border-l-blue-500" },
  "in-progress": { label: "Em Andamento", bg: "bg-purple-100/80", text: "text-purple-800", dot: "bg-purple-500", border: "border-l-purple-500" },
  completed: { label: "Concluído", bg: "bg-green-100/80", text: "text-green-800", dot: "bg-green-500", border: "border-l-green-500" },
  cancelled: { label: "Cancelado", bg: "bg-red-100/80", text: "text-red-700", dot: "bg-red-400", border: "border-l-red-400" },
  "no-show": { label: "Faltou", bg: "bg-orange-100/80", text: "text-orange-800", dot: "bg-orange-500", border: "border-l-orange-500" },
}

type ViewMode = "day" | "week"

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.scheduled
}

function formatTime(dateTime: string) {
  return new Date(dateTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

function formatEndTime(dateTime: string, durationMin: number) {
  const d = new Date(dateTime)
  d.setMinutes(d.getMinutes() + durationMin)
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
}

function getWeekDays(date: Date): Date[] {
  const d = new Date(date)
  const day = d.getDay()
  const start = new Date(d)
  start.setDate(d.getDate() - day)
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(start)
    dd.setDate(start.getDate() + i)
    return dd
  })
}

function generateMiniCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  const days: { day: number; isCurrentMonth: boolean; date: Date }[] = []

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i
    days.push({ day: d, isCurrentMonth: false, date: new Date(year, month - 1, d) })
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) })
  }
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, isCurrentMonth: false, date: new Date(year, month + 1, i) })
  }
  return days
}

function formatType(type: string): string {
  const map: Record<string, string> = {
    regular: "Sessão Regular",
    evaluation: "Avaliação",
    reevaluation: "Reavaliação",
    discharge: "Alta",
  }
  return map[type] || type
}

function getAppointmentPosition(apt: Appointment, startHour: number) {
  const d = new Date(apt.dateTime)
  const hours = d.getHours()
  const minutes = d.getMinutes()
  const top = ((hours - startHour) * 72) + (minutes / 60) * 72
  const height = Math.max((apt.duration / 60) * 72, 24)
  return { top, height }
}

const NAV_TABS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/pacientes", label: "Pacientes" },
  { href: "/dashboard/agendamentos", label: "Agenda" },
  { href: "/dashboard/financeiro", label: "Financeiro" },
  { href: "/dashboard/relatorios", label: "Relatórios" },
  { href: "/dashboard/configuracoes", label: "Configurações" },
]

export default function AgendamentosPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>("week")
  const [searchQuery, setSearchQuery] = useState("")
  const gridRef = useRef<HTMLDivElement>(null)

  const today = useMemo(() => new Date(), [])
  const todayStr = today.toDateString()
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate])

  // Mini calendar state
  const calMonth = currentDate.getMonth()
  const calYear = currentDate.getFullYear()
  const monthName = currentDate.toLocaleDateString("pt-BR", { month: "long" })
  const miniDays = useMemo(() => generateMiniCalendarDays(calYear, calMonth), [calYear, calMonth])

  // Fetch data for the visible week
  const weekStart = weekDays[0].toISOString()
  const weekEndDate = new Date(weekDays[6])
  weekEndDate.setHours(23, 59, 59, 999)
  const weekEnd = weekEndDate.toISOString()

  const { appointments: weekAppointments, loading } = useAppointments({ startDate: weekStart, endDate: weekEnd, limit: 200 })
  useTodayAppointments()
  const { confirmAppointment, startAppointment, cancelAppointment, completeAppointment } = useAppointmentMutations()

  // Month appointments for mini calendar dots
  const monthStart = new Date(calYear, calMonth, 1).toISOString()
  const monthEnd = new Date(calYear, calMonth + 1, 0, 23, 59, 59).toISOString()
  const { appointments: monthAppointments } = useAppointments({ startDate: monthStart, endDate: monthEnd, limit: 200 })

  // Group appointments by day of week
  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, Appointment[]>()
    weekAppointments.forEach((apt) => {
      const key = new Date(apt.dateTime).toDateString()
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(apt)
    })
    return map
  }, [weekAppointments])

  // Sidebar: upcoming events list
  const upcomingEvents = useMemo(() => {
    const now = new Date()
    return weekAppointments
      .filter((a) => new Date(a.dateTime) >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
  }, [weekAppointments])

  // Group upcoming by day for sidebar
  const upcomingByDay = useMemo(() => {
    const groups: { date: Date; label: string; appointments: Appointment[] }[] = []
    const dayMap = new Map<string, Appointment[]>()
    upcomingEvents.forEach((apt) => {
      const key = new Date(apt.dateTime).toDateString()
      if (!dayMap.has(key)) dayMap.set(key, [])
      dayMap.get(key)!.push(apt)
    })
    dayMap.forEach((apts, key) => {
      const date = new Date(key)
      let label = ""
      if (isSameDay(date, today)) label = "HOJE"
      else if (isSameDay(date, new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1))) label = "AMANHÃ"
      else label = date.toLocaleDateString("pt-BR", { weekday: "long" }).toUpperCase()
      groups.push({ date, label, appointments: apts })
    })
    return groups
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upcomingEvents, todayStr])

  // Mini calendar: count appointments per day
  const appointmentCountByDay = useMemo(() => {
    const map = new Map<string, number>()
    monthAppointments.forEach((apt) => {
      const key = new Date(apt.dateTime).toDateString()
      map.set(key, (map.get(key) || 0) + 1)
    })
    return map
  }, [monthAppointments])

  // Scroll to current hour on mount
  useEffect(() => {
    if (gridRef.current) {
      const now = new Date()
      const scrollTo = ((now.getHours() - 7) * 72) - 72
      gridRef.current.scrollTop = Math.max(0, scrollTo)
    }
  }, [])

  const handlePrevMonth = () => setCurrentDate(new Date(calYear, calMonth - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(calYear, calMonth + 1, 1))

  const handlePrevWeek = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 7)
    setSelectedDate(d)
  }
  const handleNextWeek = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 7)
    setSelectedDate(d)
  }
  const handleToday = () => {
    setSelectedDate(new Date())
    setCurrentDate(new Date())
  }

  void confirmAppointment
  void startAppointment
  void cancelAppointment
  void completeAppointment

  return (
    <>
      <DashboardHeader />

      {/* Navigation tabs */}
      <nav className="px-6 lg:px-10 bg-transparent mb-0 hidden md:block">
        <div className="flex items-center justify-center gap-8">
          {NAV_TABS.map((item) => {
            const isActive = item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-1 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-[#8A05BE] text-gray-900"
                    : "border-transparent text-gray-500 hover:text-[#8A05BE] hover:border-[#8A05BE]/30"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="flex-1 overflow-hidden pb-16 md:pb-0">
        <div className="flex h-[calc(100vh-140px)] max-w-[1400px] mx-auto">

        {/* ===== LEFT SIDEBAR ===== */}
        <aside className="hidden lg:flex flex-col w-[300px] shrink-0 border-r border-gray-200/60 bg-white/40 backdrop-blur-sm overflow-y-auto">
          {/* Month + Year Header */}
          <div className="px-4 pt-5 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-bold text-gray-900 capitalize">{monthName}</h2>
                <span className="text-2xl font-light text-[#820AD1]">{calYear}</span>
              </div>
              <div className="flex gap-0.5">
                <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                  <span className="material-symbols-outlined text-gray-500 text-[20px]">chevron_left</span>
                </button>
                <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                  <span className="material-symbols-outlined text-gray-500 text-[20px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mini Calendar */}
          <div className="px-4 pb-4">
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS_MINI.map((d) => (
                <div key={d} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {miniDays.map((d, i) => {
                const isToday = isSameDay(d.date, today) && d.isCurrentMonth
                const isSelected = isSameDay(d.date, selectedDate) && d.isCurrentMonth
                const count = appointmentCountByDay.get(d.date.toDateString()) || 0
                const isInWeek = weekDays.some((wd) => isSameDay(wd, d.date)) && d.isCurrentMonth
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (d.isCurrentMonth) {
                        setSelectedDate(d.date)
                      }
                    }}
                    className={`relative flex flex-col items-center justify-center py-1 rounded-lg transition-all text-xs ${
                      !d.isCurrentMonth
                        ? "text-gray-300"
                        : isSelected
                          ? "bg-[#820AD1] text-white font-bold shadow-sm shadow-[#820AD1]/20"
                          : isToday
                            ? "bg-[#820AD1]/10 text-[#820AD1] font-bold"
                            : isInWeek
                              ? "bg-gray-50 text-gray-700 font-medium"
                              : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span>{d.day}</span>
                    {count > 0 && d.isCurrentMonth && (
                      <div className="flex gap-0.5 mt-0.5">
                        {Array.from({ length: Math.min(count, 3) }).map((_, j) => (
                          <span key={j} className={`w-1 h-1 rounded-full ${isSelected ? "bg-white/70" : "bg-[#820AD1]"}`} />
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Upcoming Events List */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 border-t border-gray-100">
            <div className="pt-3 flex flex-col gap-3">
              {upcomingByDay.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-gray-400">
                  <span className="material-symbols-outlined text-3xl mb-2">event_available</span>
                  <p className="text-sm">Nenhum agendamento</p>
                </div>
              ) : (
                upcomingByDay.map((group) => (
                  <div key={group.date.toDateString()}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold tracking-wide ${
                          group.label === "HOJE" ? "text-[#820AD1]" : "text-gray-500"
                        }`}>
                          {group.label}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {group.date.toLocaleDateString("pt-BR", { day: "numeric", month: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                    {group.appointments.map((apt) => {
                      const sc = getStatusConfig(apt.status)
                      return (
                        <div
                          key={apt.id}
                          onClick={() => router.push(`/dashboard/agendamentos/${apt.id}`)}
                          className="flex items-start gap-2.5 py-2 cursor-pointer group hover:bg-gray-50 rounded-lg px-1 -mx-1 transition-colors"
                        >
                          <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${sc.dot}`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                              <span>{formatTime(apt.dateTime)}</span>
                              <span>–</span>
                              <span>{formatEndTime(apt.dateTime, apt.duration)}</span>
                            </div>
                            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#820AD1] transition-colors">
                              {apt.patientName || "Paciente"}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* ===== MAIN CALENDAR AREA ===== */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/60 bg-white/30 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <button onClick={handlePrevWeek} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="material-symbols-outlined text-gray-500 text-[20px]">chevron_left</span>
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1.5 text-xs font-bold text-[#820AD1] bg-[#820AD1]/10 hover:bg-[#820AD1]/15 rounded-lg transition-colors"
              >
                Hoje
              </button>
              <button onClick={handleNextWeek} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="material-symbols-outlined text-gray-500 text-[20px]">chevron_right</span>
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {(["day", "week"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    viewMode === mode
                      ? "bg-[#820AD1] text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {mode === "day" ? "Dia" : "Semana"}
                </button>
              ))}
            </div>

            {/* Search + New */}
            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-white/60 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#820AD1]/30 focus:border-[#820AD1]/30 w-40 placeholder:text-gray-400"
                />
              </div>
              <Link href="/dashboard/agendamentos/novo">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#820AD1] hover:bg-[#6D08AF] rounded-lg transition-colors shadow-sm shadow-[#820AD1]/20">
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Novo
                </button>
              </Link>
            </div>
          </div>

          {/* Week Day Headers */}
          <div className="flex border-b border-gray-200/60 bg-white/20">
            <div className="w-14 shrink-0" />
            {weekDays.map((day, i) => {
              const isToday = isSameDay(day, today)
              const dayApts = appointmentsByDay.get(day.toDateString()) || []
              return (
                <div
                  key={i}
                  className={`flex-1 flex flex-col items-center py-2 border-l border-gray-100 ${
                    isToday ? "bg-[#820AD1]/5" : ""
                  }`}
                >
                  <span className={`text-[10px] font-bold tracking-wider ${isToday ? "text-[#820AD1]" : "text-gray-400"}`}>
                    {WEEKDAYS_SHORT[i]}
                  </span>
                  <span className={`text-lg font-bold mt-0.5 ${
                    isToday
                      ? "w-8 h-8 flex items-center justify-center rounded-full bg-[#820AD1] text-white"
                      : "text-gray-800"
                  }`}>
                    {day.getDate()}
                  </span>
                  {dayApts.length > 0 && !isToday && (
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: Math.min(dayApts.length, 3) }).map((_, j) => (
                        <span key={j} className="w-1 h-1 rounded-full bg-[#820AD1]" />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            <div className="w-3 shrink-0" />
          </div>

          {/* Time Grid */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="material-symbols-outlined animate-spin text-[#820AD1] text-2xl">progress_activity</span>
            </div>
          ) : (
            <div ref={gridRef} className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="relative" style={{ height: HOURS.length * 72 }}>
                {/* Hour rows */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 flex border-b border-gray-100"
                    style={{ top: (hour - 7) * 72, height: 72 }}
                  >
                    <div className="w-14 shrink-0 pr-2 pt-0 text-right">
                      <span className="text-[10px] font-medium text-gray-400">{`${hour}:00`}</span>
                    </div>
                    {weekDays.map((day, i) => (
                      <div
                        key={i}
                        className={`flex-1 border-l border-gray-100 ${
                          isSameDay(day, today) ? "bg-[#820AD1]/2" : ""
                        }`}
                      >
                        <div className="h-1/2 border-b border-gray-50" />
                      </div>
                    ))}
                    <div className="w-3 shrink-0 pr-1 pt-0 text-right">
                      <span className="text-[10px] font-medium text-gray-300">{`${hour}:00`}</span>
                    </div>
                  </div>
                ))}

                {/* Current time indicator */}
                {weekDays.some((d) => isSameDay(d, today)) && (() => {
                  const now = new Date()
                  const topPos = ((now.getHours() - 7) * 72) + (now.getMinutes() / 60) * 72
                  const dayIndex = weekDays.findIndex((d) => isSameDay(d, today))
                  if (dayIndex < 0 || topPos < 0) return null
                  return (
                    <div
                      className="absolute z-20 pointer-events-none"
                      style={{
                        top: topPos,
                        left: `calc(56px + ${dayIndex} * ((100% - 56px - 12px) / 7))`,
                        width: `calc((100% - 56px - 12px) / 7)`,
                      }}
                    >
                      <div className="relative">
                        <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-[#820AD1]" />
                        <div className="h-[2px] bg-[#820AD1] w-full" />
                      </div>
                    </div>
                  )
                })()}

                {/* Appointment blocks */}
                {weekDays.map((day, dayIndex) => {
                  const dayApts = appointmentsByDay.get(day.toDateString()) || []
                  return dayApts.map((apt) => {
                    const { top, height } = getAppointmentPosition(apt, 7)
                    const sc = getStatusConfig(apt.status)
                    if (top < 0) return null
                    return (
                      <div
                        key={apt.id}
                        onClick={() => router.push(`/dashboard/agendamentos/${apt.id}`)}
                        className={`absolute z-10 cursor-pointer rounded-lg border-l-[3px] ${sc.border} ${sc.bg} backdrop-blur-sm px-2 py-1 overflow-hidden hover:shadow-md hover:z-30 transition-shadow group`}
                        style={{
                          top,
                          height: Math.max(height, 28),
                          left: `calc(56px + ${dayIndex} * ((100% - 56px - 12px) / 7) + 2px)`,
                          width: `calc((100% - 56px - 12px) / 7 - 4px)`,
                        }}
                      >
                        <p className={`text-[10px] font-bold ${sc.text} truncate`}>
                          {formatTime(apt.dateTime)} {apt.patientName || "Paciente"}
                        </p>
                        {height >= 44 && (
                          <p className="text-[10px] text-gray-500 truncate mt-0.5">
                            {formatType(apt.type)} · {apt.duration}min
                          </p>
                        )}
                        {height >= 60 && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            <span className={`text-[9px] font-medium ${sc.text}`}>{sc.label}</span>
                          </div>
                        )}
                      </div>
                    )
                  })
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
    </>
  )
}
