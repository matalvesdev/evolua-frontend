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
    queryFn: async () => {
      const res = await api.get<{ data: Record<string, unknown>[] } | Record<string, unknown>[]>('/api/patients/records')
      const rows = Array.isArray(res) ? res : (res?.data ?? [])
      return rows.map((r) => ({
        id: r.id as string,
        patient: typeof r.patientName === 'string' ? r.patientName as string : (r.patient as { name?: string })?.name ?? '',
        dob: '',
        area: '',
        diagnosis: r.title as string ?? '',
        created: r.createdAt as string ?? '',
        lastSession: r.createdAt as string ?? '',
        sessions: 0,
        scales: {},
        anamnese: '',
        objectives: [],
        evolution: r.content as string ?? '',
      }))
    },
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
