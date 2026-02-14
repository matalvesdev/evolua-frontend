"use client"

import { useRouter } from "next/navigation"

export type SidebarAction = "patient" | "appointment" | "report" | "financial"

interface QuickActionsSidebarProps {
  onAction: (action: SidebarAction) => void
}

interface ActionItem {
  icon: string
  label: string
  action: SidebarAction
  primary?: boolean
}

const ACTIONS: ActionItem[] = [
  { icon: "person_add", label: "Novo Paciente", action: "patient", primary: true },
  { icon: "event", label: "Agendar Sessão", action: "appointment" },
  { icon: "mic", label: "Relatório Áudio", action: "report" },
  { icon: "payments", label: "Ver Financeiro", action: "financial" },
]

export function QuickActionsSidebar({ onAction }: QuickActionsSidebarProps) {
  const router = useRouter()

  const handleClick = (action: SidebarAction) => {
    if (action === "financial") {
      router.push("/dashboard/financeiro")
      return
    }
    onAction(action)
  }

  return (
    <div className="flex flex-col gap-3">
      {ACTIONS.map(({ icon, label, action, primary }) => (
        <button
          key={action}
          onClick={() => handleClick(action)}
          className={`w-full py-4 px-4 rounded-xl flex items-center gap-3 transition-all min-h-[48px] ${
            primary
              ? "bg-[#8A05BE] hover:bg-[#6D08AF] text-white shadow-lg shadow-purple-200 hover:-translate-y-1 transform"
              : "glass-panel hover:bg-white border border-gray-200 text-gray-700 hover:shadow-md"
          }`}
        >
          <span
            className={`material-symbols-outlined ${
              primary ? "bg-white/20 p-1.5 rounded-lg" : "text-[#8A05BE]"
            }`}
          >
            {icon}
          </span>
          <span className="font-medium text-sm">{label}</span>
        </button>
      ))}
    </div>
  )
}
