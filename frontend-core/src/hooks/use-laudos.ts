import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Laudo {
  id: string
  patientId: string
  patientName: string
  type: 'laudo' | 'atestado' | 'relatorio' | 'declaracao'
  title: string
  content: string
  status: 'draft' | 'final'
  createdAt: string
  updatedAt: string
}

export function useLaudos() {
  return useQuery<Laudo[]>({
    queryKey: ['laudos'],
    queryFn: () => api.get<Laudo[]>('/api/reports/laudos'),
    staleTime: 30_000,
  })
}

export function useCreateLaudo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Laudo>) => api.post<Laudo>('/api/reports/laudos', body),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['laudos'] }) },
  })
}

export function useUpdateLaudo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Laudo> }) =>
      api.patch<Laudo>(`/api/reports/laudos/${id}`, body),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['laudos'] }) },
  })
}

export function useDeleteLaudo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/reports/laudos/${id}`),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['laudos'] }) },
  })
}
