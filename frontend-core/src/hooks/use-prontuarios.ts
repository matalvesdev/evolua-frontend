import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Prontuario {
  id: string
  patient: string
  dob: string
  area: string
  diagnosis: string
  created: string
  lastSession: string
  sessions: number
  scales: Record<string, string | number>
  anamnese: string
  objectives: string[]
  evolution: string
}

export function useProntuarios() {
  return useQuery<Prontuario[]>({
    queryKey: ['prontuarios'],
    queryFn: () => api.get<Prontuario[]>('/api/patients/records'),
    staleTime: 30_000,
  })
}

export function useCreateProntuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Prontuario>) => api.post<Prontuario>('/api/patients/records', body),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['prontuarios'] }) },
  })
}

export function useUpdateProntuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Prontuario> }) =>
      api.patch<Prontuario>(`/api/patients/records/${id}`, body),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['prontuarios'] }) },
  })
}
