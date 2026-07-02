import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface DashboardHomeData {
  stats: {
    patients: { active: number; total: number }
    appointments: { today: number; month: number }
    tasks: { pending: number }
    finances: { monthIncome: string; monthExpense: string; monthBalance: string; pendingCount: number }
    reports: { drafts: number }
  }
  todayAppointments: Array<{
    id: string; patientId: string; patientName: string
    dateTime: string; duration: number; type: string; status: string
  }>
  pendingTasks: Array<{
    id: string; title: string; priority: string; status: string; dueDate: string | null
  }>
}

export function useDashboardHome() {
  return useQuery<DashboardHomeData>({
    queryKey: ['dashboard', 'home'],
    queryFn: () => api.get<DashboardHomeData>('/api/dashboard/home'),
    staleTime: 30_000,
  })
}
