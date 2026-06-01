import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface TeleSession {
  id: string
  patient: string
  patientId: string
  date: string
  time: string
  link: string
  status: 'scheduled' | 'active' | 'ended'
  sentViaWhatsApp: boolean
  clinicId: string
  createdAt: string
}

export interface CreateTeleSessionInput {
  patientId: string
  patient: string
  date: string
  time: string
  sendWA: boolean
}

export function useTeleSessions() {
  return useQuery<TeleSession[]>({
    queryKey: ['teleconsulta-sessions'],
    queryFn: async () => {
      const res = await api.get<{ data: TeleSession[] } | TeleSession[]>('/api/teleconsulta/sessions')
      return Array.isArray(res) ? res : (res?.data ?? [])
    },
    staleTime: 30_000,
  })
}

export function useCreateTeleSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTeleSessionInput) =>
      api.post<TeleSession>('/api/teleconsulta/sessions', input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['teleconsulta-sessions'] })
    },
  })
}

export function useUpdateTeleSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<TeleSession> }) =>
      api.patch<TeleSession>(`/api/teleconsulta/sessions/${id}`, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['teleconsulta-sessions'] })
    },
  })
}

export function usePatientSummaries() {
  return useQuery<{ id: string; name: string }[]>({
    queryKey: ['patients-summary'],
    queryFn: () => api.get<{ id: string; name: string }[]>('/api/patients?pageSize=200'),
    staleTime: 30_000,
  })
}
