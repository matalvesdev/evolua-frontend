import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Report {
  id: string
  patientId: string
  patientName: string
  type: string
  title: string
  content: string
  status: 'draft' | 'final'
  createdAt: string
  updatedAt: string
}

export function useReports() {
  return useQuery<Report[]>({
    queryKey: ['reports'],
    queryFn: () => api.get<Report[]>('/api/reports'),
    staleTime: 30_000,
  })
}

export function useCreateReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Report>) => api.post<Report>('/api/reports', body),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['reports'] }) },
  })
}

export function useUpdateReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Report> }) =>
      api.patch<Report>(`/api/reports/${id}`, body),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['reports'] }) },
  })
}

export function useDeleteReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/reports/${id}`),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['reports'] }) },
  })
}
