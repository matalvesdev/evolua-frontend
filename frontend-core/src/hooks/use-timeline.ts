import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface TimelineEvent {
  id: string
  date: string
  type: string
  title: string
  description: string
  score?: number
  area?: string
  tag?: string
}

export function useTimeline(patientId: string | undefined) {
  return useQuery<TimelineEvent[]>({
    queryKey: ['timeline', patientId],
    queryFn: () => api.get<TimelineEvent[]>(`/api/patients/${patientId}/timeline`),
    enabled: Boolean(patientId),
    staleTime: 30_000,
  })
}
