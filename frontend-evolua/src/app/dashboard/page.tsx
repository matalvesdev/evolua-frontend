"use client"

import { useCallback, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { WelcomeSection } from "@/components/dashboard/welcome-section"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { QuickActionsSidebar, type SidebarAction } from "@/components/dashboard/quick-actions-sidebar"
import { WeeklyAgenda } from "@/components/dashboard/weekly-agenda"
import { RemindersPanel } from "@/components/dashboard/reminders-panel"
import { DashboardTodoList } from "@/components/dashboard/dashboard-todo-list"
import { AIAssistantPanel } from "@/components/dashboard/ai-assistant-panel"
import { QuickNotes } from "@/components/dashboard/quick-notes"
import { RecentDocuments } from "@/components/dashboard/recent-documents"
import { Portal } from "@/components/ui/portal"
import { NewPatientModal } from "@/components/dashboard/modals/new-patient-modal"
import { NewAppointmentModal } from "@/components/dashboard/modals/new-appointment-modal"
import { NewReportModal } from "@/components/dashboard/modals/new-report-modal"

type ModalType = "patient" | "appointment" | "report" | null

export default function DashboardPage() {
  const [modal, setModal] = useState<ModalType>(null)
  const closeModal = useCallback(() => setModal(null), [])

  const handleSidebarAction = useCallback((action: SidebarAction) => {
    if (action === "financial") return
    setModal(action)
  }, [])

  return (
    <>
      <DashboardHeader />

      {/* Navigation tabs */}
      <nav className="px-6 lg:px-10 bg-transparent mb-8 hidden md:block">
        <div className="flex items-center justify-center gap-8">
          {[
            { href: "/dashboard", label: "Dashboard" },
            { href: "/dashboard/pacientes", label: "Pacientes" },
            { href: "/dashboard/agendamentos", label: "Agenda" },
            { href: "/dashboard/financeiro", label: "Financeiro" },
            { href: "/dashboard/relatorios", label: "Relatórios" },
            { href: "/dashboard/configuracoes", label: "Configurações" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`px-1 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                item.href === "/dashboard"
                  ? "border-[#8A05BE] text-gray-900"
                  : "border-transparent text-gray-500 hover:text-[#8A05BE] hover:border-[#8A05BE]/30"
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth pb-24">
        {/* Row 1: Welcome greeting + Stats cards */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <WelcomeSection />
          <StatsCards />
        </div>

        {/* Row 2: Quick Actions | Reminders | Weekly Agenda */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          <div className="lg:col-span-2">
            <QuickActionsSidebar onAction={handleSidebarAction} />
          </div>

          <div className="lg:col-span-3">
            <div className="glass-panel rounded-2xl p-6 shadow-[0_4px_30px_rgba(0,0,0,0.05)] h-full flex flex-col">
              <RemindersPanel />
            </div>
          </div>

          <div className="lg:col-span-7">
            <WeeklyAgenda />
          </div>
        </div>

        {/* Row 3: Tasks | AI Assistant | Quick Notes | Recent Documents */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardTodoList />
          <AIAssistantPanel />
          <QuickNotes />
          <RecentDocuments />
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-200 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 gap-4">
            <p>© {new Date().getFullYear()} Evolua Premium. Uso exclusivo.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#8A05BE] transition-colors">Suporte Prioritário</a>
              <a href="#" className="hover:text-[#8A05BE] transition-colors">Privacidade</a>
              <a href="#" className="hover:text-[#8A05BE] transition-colors">Termos</a>
            </div>
          </div>
        </footer>
      </main>

      {/* Modals — rendered via portal to avoid z-index issues */}
      <Portal>
        <NewPatientModal open={modal === "patient"} onClose={closeModal} />
        <NewAppointmentModal open={modal === "appointment"} onClose={closeModal} />
        <NewReportModal open={modal === "report"} onClose={closeModal} />
      </Portal>
    </>
  )
}
