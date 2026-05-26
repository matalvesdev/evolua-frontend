import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Settings {
  clinicName: string
  clinicPhone: string
  clinicAddress: string
  sessionDuration: number
  notifSessao: boolean
  notifReport: boolean
  notifPagamento: boolean
  notifWhatsapp: boolean
  notifEmail: boolean
  iaTranscricao: boolean
  iaRelatorio: boolean
  iaLembrete: boolean
  iaSugestao: boolean
  pixKey: string
  cobAutomatica: boolean
  sessionValue: number
  lgpd: boolean
  analytics: boolean
}

export function useSettings() {
  return useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: () => api.get<Settings>('/api/settings'),
    staleTime: 60_000,
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Settings>) => api.patch<Settings>('/api/settings', body),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['settings'] }) },
  })
}
