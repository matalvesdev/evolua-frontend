"use client"

import { useUser, useTodayAppointments, usePendingReports } from "@/hooks"

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Bom dia"
  if (h < 18) return "Boa tarde"
  return "Boa noite"
}

export function WelcomeSection() {
  const { user } = useUser()
  const { appointments } = useTodayAppointments()
  const { reports: pendingReports } = usePendingReports()

  const pendingSessions = appointments.filter(
    (a) => a.status === "scheduled" || a.status === "confirmed"
  ).length

  const firstName = (
    user?.user_metadata?.name?.split(" ")[0] ??
    user?.user_metadata?.full_name?.split(" ")[0] ??
    "Profissional"
  ) as string

  const displayName = user?.user_metadata?.role === "therapist" ? `Dra. ${firstName}` : firstName
  const greeting = getGreeting()

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-2">
        {greeting},{" "}
        <span className="text-[#8A05BE]">{displayName}</span>
      </h1>
      <p className="text-base text-gray-500">
        {pendingSessions > 0 || pendingReports.length > 0 ? (
          <>
            Você tem{" "}
            <span className="font-semibold text-gray-800">
              {pendingSessions} {pendingSessions === 1 ? "sessão" : "sessões"}
            </span>
            {pendingReports.length > 0 && (
              <>
                {" "}e{" "}
                <span className="font-semibold text-gray-800">
                  {pendingReports.length}{" "}
                  {pendingReports.length === 1 ? "relatório" : "relatórios"}
                </span>
              </>
            )}
            {" "}pendente{pendingSessions + pendingReports.length > 1 ? "s" : ""} hoje.
            Vamos evoluir? 💜
          </>
        ) : (
          "Tudo em dia por aqui. Continue com o ótimo trabalho! 💜"
        )}
      </p>
    </div>
  )
}
