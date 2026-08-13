import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type ClinicalArea = 'linguagem' | 'voz' | 'disfagia' | 'motricidade' | 'gagueira' | 'tea'

export interface Prontuario {
  id: string
  clinicId: string
  patientId: string
  patientName: string
  birthDate: string | null
  clinicalArea: ClinicalArea
  diagnosis: string
  anamnesis: string
  scales: Record<string, string | number>
  objectives: string[]
  latestEvolution: string
  sessionCount: number
  lastSessionAt: string | null
  createdAt: string
  updatedAt: string
}

interface ProntuarioList {
  data: Prontuario[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
}

export interface CreateProntuarioInput {
  patientId: string
  clinicalArea: ClinicalArea
  diagnosis: string
}

export type UpdateProntuarioInput = Partial<Pick<Prontuario,
  'clinicalArea' | 'diagnosis' | 'anamnesis' | 'scales' | 'objectives' | 'latestEvolution'
>>

export function useProntuarios() {
  return useQuery<Prontuario[]>({
    queryKey: ['prontuarios'],
    queryFn: async () => (await api.get<ProntuarioList>('/api/patients/records')).data,
    staleTime: 30_000,
  })
}

export function useCreateProntuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateProntuarioInput) => api.post<{ id: string }>('/api/patients/records', body),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['prontuarios'] }) },
  })
}

export function useUpdateProntuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateProntuarioInput }) =>
      api.patch<{ id: string }>(`/api/patients/records/${id}`, body),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['prontuarios'] }) },
  })
}
