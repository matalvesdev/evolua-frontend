import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Message {
  id: string
  patient: string
  patientId?: string
  phone: string
  type: 'reminder' | 'confirmation' | 'reschedule' | 'exercise' | 'manual'
  text: string
  sentAt: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
}

export interface Automation {
  id: string
  label: string
  desc: string
  active: boolean
}

export function useMessages() {
  return useQuery<Message[]>({
    queryKey: ['messages'],
    queryFn: () => api.get<Message[]>('/api/messages'),
    staleTime: 30_000,
  })
}

export function useAutomations() {
  return useQuery<Automation[]>({
    queryKey: ['automations'],
    queryFn: () => api.get<Automation[]>('/api/automations/whatsapp'),
    staleTime: 60_000,
  })
}

export function useSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { patientId: string; text: string; type?: string }) =>
      api.post<Message>('/api/messages/send', body),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['messages'] }) },
  })
}

export function useToggleAutomation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api.patch(`/api/automations/whatsapp/${id}`, { active }),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['automations'] }) },
  })
}
