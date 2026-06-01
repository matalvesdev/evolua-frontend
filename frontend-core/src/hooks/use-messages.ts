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
    queryFn: async () => {
      const res = await api.get<{ data: Message[] } | Message[]>('/api/messages')
      return Array.isArray(res) ? res : (res?.data ?? [])
    },
    staleTime: 30_000,
  })
}

export function useAutomations() {
  return useQuery<Automation[]>({
    queryKey: ['automations'],
    queryFn: async () => {
      const res = await api.get<{ data: Automation[] } | Automation[]>('/api/messages/automations/whatsapp')
      return Array.isArray(res) ? res : (res?.data ?? [])
    },
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
      api.patch(`/api/messages/automations/whatsapp/${id}`, { active }),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['automations'] }) },
  })
}
