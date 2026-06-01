import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface TaskItem {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed'
  dueDate?: string
  patientId?: string
  patientName?: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
}

export function useTasks() {
  return useQuery<TaskItem[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await api.get<{ data: TaskItem[] } | TaskItem[]>('/api/tasks')
      return Array.isArray(res) ? res : (res?.data ?? [])
    },
    staleTime: 30_000,
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<TaskItem>) => api.post<TaskItem>('/api/tasks', body),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['tasks'] }) },
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<TaskItem> }) =>
      api.patch<TaskItem>(`/api/tasks/${id}`, body),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['tasks'] }) },
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/tasks/${id}`),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['tasks'] }) },
  })
}
