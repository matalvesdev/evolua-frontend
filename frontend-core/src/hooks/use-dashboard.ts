import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { DashboardStats, Appointment, Patient, Report, Task } from '@/types'

interface ListResponse<T> {
  data: T[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => api.get<DashboardStats>('/api/dashboard/stats'),
    staleTime: 60_000,
  })
}

export function useTodayAppointments() {
  return useQuery<Appointment[]>({
    queryKey: ['appointments', 'today'],
    queryFn: async () => {
      const res = await api.get<ListResponse<Appointment>>('/api/appointments/today')
      return res.data ?? []
    },
    staleTime: 30_000,
  })
}

export function useWeekAppointments() {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  return useQuery<Appointment[]>({
    queryKey: ['appointments', 'week'],
    queryFn: async () => {
      const res = await api.get<ListResponse<Appointment>>(
        `/api/appointments?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`,
      )
      return res.data ?? []
    },
    staleTime: 30_000,
  })
}

export function useActivePatients() {
  return useQuery<Patient[]>({
    queryKey: ['patients', 'active'],
    queryFn: async () => {
      const res = await api.get<ListResponse<Patient>>('/api/patients?status=active&pageSize=100')
      return res.data ?? []
    },
    staleTime: 120_000,
  })
}

export function usePendingReports() {
  return useQuery<Report[]>({
    queryKey: ['reports', 'pending'],
    queryFn: async () => {
      const res = await api.get<ListResponse<Report>>('/api/reports?status=pending_review&pageSize=10')
      return res.data ?? []
    },
    staleTime: 60_000,
  })
}

export function usePendingTasks() {
  return useQuery<Task[]>({
    queryKey: ['tasks', 'pending'],
    queryFn: async () => {
      const res = await api.get<ListResponse<Task>>('/api/tasks?status=pending&pageSize=8')
      return res.data ?? []
    },
    staleTime: 60_000,
  })
}

