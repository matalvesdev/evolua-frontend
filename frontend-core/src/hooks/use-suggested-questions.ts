import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useSuggestedQuestions() {
  return useQuery<string[]>({
    queryKey: ['suggested-questions'],
    queryFn: () => api.get<string[]>('/api/ai/suggested-questions'),
    staleTime: 300_000,
  })
}
