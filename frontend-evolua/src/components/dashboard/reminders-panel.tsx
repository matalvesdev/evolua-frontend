"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useTasks, useWeekAppointments, usePatients, useTodayAppointments, usePendingReports } from "@/hooks"

interface AISuggestion {
  id: string
  icon: string
  iconColor: string
  label: string
  message: string
  actionLabel: string
  actionHref?: string
  actionType?: "appointment" | "report" | "navigate"
  priority: number // lower = higher priority
}

interface RemindersPanelProps {
  onOpenAppointmentModal?: () => void
  onOpenReportModal?: () => void
}

export function RemindersPanel(_props?: RemindersPanelProps) {
  const router = useRouter()
  const { tasks: reminders } = useTasks({ type: "reminder" })
  const { tasks: allTasks } = useTasks({})
  const { appointments: weekAppts } = useWeekAppointments()
  const { appointments: todayAppts } = useTodayAppointments()
  const { patients } = usePatients({ limit: 100, status: "active" })
  const { reports: pendingReports } = usePendingReports()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const suggestions = useMemo<AISuggestion[]>(() => {
    const items: AISuggestion[] = []
    const now = new Date()

    // 1. Upcoming session reminder (within 60 min)
    const upcoming = todayAppts
      .filter((a) => a.status === "scheduled" || a.status === "confirmed")
      .filter((a) => {
        const diff = (new Date(a.dateTime).getTime() - now.getTime()) / 60000
        return diff > 0 && diff <= 60
      })
    if (upcoming.length > 0) {
      const next = upcoming[0]
      const time = new Date(next.dateTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      items.push({
        id: `upcoming-${next.id}`,
        icon: "event",
        iconColor: "text-blue-500",
        label: "Próxima sessão",
        message: `Sua próxima sessão começa às ${time}. Prepare-se!`,
        actionLabel: "Ver agenda",
        actionHref: "/dashboard/agendamentos",
        actionType: "navigate",
        priority: 1,
      })
    }

    // 2. Free weekday slots
    const weekDayAppts = new Set(weekAppts.map((a) => new Date(a.dateTime).toDateString()))
    for (let i = 1; i <= 5; i++) {
      const day = new Date(now)
      day.setDate(now.getDate() + i)
      if (day.getDay() !== 0 && day.getDay() !== 6 && !weekDayAppts.has(day.toDateString())) {
        const dayName = day.toLocaleDateString("pt-BR", { weekday: "long" })
        items.push({
          id: `free-${i}`,
          icon: "calendar_add_on",
          iconColor: "text-purple-500",
          label: "Agenda livre",
          message: `Você tem ${dayName} livre. Deseja agendar sessões para esse dia?`,
          actionLabel: "Agendar",
          actionType: "appointment",
          priority: 3,
        })
        break
      }
    }

    // 3. Patients without appointments this week
    if (patients.length > 0) {
      const patientsWithAppts = new Set(weekAppts.map((a) => a.patientId))
      const inactive = patients.filter((p) => !patientsWithAppts.has(p.id))
      if (inactive.length > 0) {
        const count = inactive.length
        const name = inactive[0].name.split(" ")[0]
        items.push({
          id: "patients-no-appt",
          icon: "person_alert",
          iconColor: "text-orange-500",
          label: "Acompanhamento",
          message: count === 1
            ? `${name} não tem sessão esta semana. Agendar acompanhamento?`
            : `${count} pacientes sem sessão esta semana. ${name} e outros aguardam agendamento.`,
          actionLabel: "Agendar",
          actionType: "appointment",
          priority: 4,
        })
      }
    }

    // 4. Pending reports to review
    if (pendingReports.length > 0) {
      items.push({
        id: "pending-reports",
        icon: "rate_review",
        iconColor: "text-amber-500",
        label: "Relatórios pendentes",
        message: `Você tem ${pendingReports.length} relatório${pendingReports.length > 1 ? "s" : ""} aguardando revisão.`,
        actionLabel: "Revisar",
        actionHref: "/dashboard/relatorios",
        actionType: "navigate",
        priority: 2,
      })
    }

    // 5. Overdue reminders/tasks
    const overdue = reminders.filter(
      (r) => r.status === "pending" && r.dueDate && new Date(r.dueDate) < now
    )
    if (overdue.length > 0) {
      items.push({
        id: "overdue-tasks",
        icon: "alarm",
        iconColor: "text-red-500",
        label: "Tarefas vencidas",
        message: `Você tem ${overdue.length} tarefa${overdue.length > 1 ? "s" : ""} vencida${overdue.length > 1 ? "s" : ""}. Revise para manter tudo em dia.`,
        actionLabel: "Revisar",
        actionHref: "/dashboard/tarefas",
        actionType: "navigate",
        priority: 2,
      })
    }

    // 6. No sessions today — suggest productive actions
    if (todayAppts.length === 0 && patients.length > 0) {
      items.push({
        id: "no-sessions-today",
        icon: "self_improvement",
        iconColor: "text-green-500",
        label: "Dia livre",
        message: "Sem sessões hoje. Que tal gravar relatórios de evolução ou organizar sua agenda?",
        actionLabel: "Gravar relatório",
        actionType: "report",
        priority: 5,
      })
    }

    // 7. High task load
    const pendingTasks = allTasks.filter((t) => t.status === "pending")
    if (pendingTasks.length >= 5) {
      items.push({
        id: "high-task-load",
        icon: "checklist",
        iconColor: "text-indigo-500",
        label: "Muitas tarefas",
        message: `Você tem ${pendingTasks.length} tarefas pendentes. Priorize as mais urgentes.`,
        actionLabel: "Ver tarefas",
        actionHref: "/dashboard/tarefas",
        actionType: "navigate",
        priority: 6,
      })
    }

    // 8. End of day — remind to complete notes
    const hour = now.getHours()
    const completedToday = todayAppts.filter((a) => a.status === "completed")
    if (hour >= 17 && completedToday.length > 0) {
      items.push({
        id: "end-of-day-notes",
        icon: "edit_note",
        iconColor: "text-teal-500",
        label: "Notas do dia",
        message: `Você completou ${completedToday.length} sessão${completedToday.length > 1 ? "ões" : ""} hoje. Não esqueça de registrar as evoluções!`,
        actionLabel: "Gravar relatório",
        actionType: "report",
        priority: 2,
      })
    }

    // 9. New patients without first appointment
    const newPatients = patients.filter((p) => {
      const created = new Date(p.createdAt)
      const daysSince = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      return daysSince <= 7
    })
    const newWithoutAppt = newPatients.filter(
      (p) => !weekAppts.some((a) => a.patientId === p.id)
    )
    if (newWithoutAppt.length > 0) {
      const name = newWithoutAppt[0].name.split(" ")[0]
      items.push({
        id: "new-patient-appt",
        icon: "waving_hand",
        iconColor: "text-pink-500",
        label: "Novo paciente",
        message: `${name} foi cadastrado recentemente e ainda não tem sessão agendada.`,
        actionLabel: "Agendar",
        actionType: "appointment",
        priority: 3,
      })
    }

    return items
      .filter((s) => !dismissed.has(s.id))
      .sort((a, b) => a.priority - b.priority)
  }, [todayAppts, weekAppts, patients, pendingReports, reminders, allTasks, dismissed])

  const visible = suggestions.slice(0, 3)

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <span className="bg-red-100 text-red-500 p-1.5 rounded-lg material-symbols-outlined text-sm">notifications_active</span>
          <h3 className="font-bold text-gray-800">Meus Lembretes</h3>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-6 text-gray-400">
          <span className="material-symbols-outlined text-3xl mb-1 block">check_circle</span>
          <p className="text-sm">Tudo em dia!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-2">
          {visible.map((s, i) => {
            const dotColor = i === 0 ? "bg-red-500" : i === 1 ? "bg-amber-500" : "bg-gray-300"
            return (
              <div key={s.id} className="flex gap-3 group cursor-pointer">
                <div className={`w-1.5 h-1.5 mt-2 rounded-full ${dotColor} shrink-0`} />
                <div>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-[#8A05BE] transition-colors">
                    {s.message.split(".")[0]}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {s.priority <= 2 ? "Urgente • Há 30 min" : s.priority <= 4 ? "Vence em 3 horas" : "Vence amanhã"}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button
        onClick={() => router.push("/dashboard/tarefas")}
        className="w-full mt-4 text-xs font-bold text-[#8A05BE] tracking-wide hover:underline text-center uppercase py-2"
      >
        Gerenciar Lembretes
      </button>
    </div>
  )
}
