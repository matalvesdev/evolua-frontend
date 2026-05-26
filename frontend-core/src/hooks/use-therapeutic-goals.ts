import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface SessionEntry {
  date: string
  score: number
  note: string
}

export interface Goal {
  id: string
  patientId: string
  area: string
  objective: string
  criterion: string
  targetDate: string
  priority: 'alta' | 'media' | 'baixa'
  status: 'nao-iniciado' | 'em-andamento' | 'atingido' | 'pausado'
  sessionsLog: SessionEntry[]
  createdAt: string
}

export function useTherapeuticGoals() {
  return useQuery<Goal[]>({
    queryKey: ['therapeutic-goals'],
    queryFn: () => api.get<Goal[]>('/api/goals'),
    staleTime: 30_000,
  })
}

export function useCreateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Goal>) => api.post<Goal>('/api/goals', body),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['therapeutic-goals'] }) },
  })
}

export function useUpdateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Goal> }) =>
      api.patch<Goal>(`/api/goals/${id}`, body),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['therapeutic-goals'] }) },
  })
}

export function useAddSessionEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ goalId, entry }: { goalId: string; entry: SessionEntry }) =>
      api.post<Goal>(`/api/goals/${goalId}/snapshots`, entry),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['therapeutic-goals'] }) },
  })
}

export function useDeleteGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/goals/${id}`),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['therapeutic-goals'] }) },
  })
}
