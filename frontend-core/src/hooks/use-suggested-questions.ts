import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useSuggestedQuestions() {
  return useQuery<string[]>({
    queryKey: ['suggested-questions'],
    queryFn: async () => {
      const res = await api.get<{ data: string[] } | string[]>('/api/ai/suggested-questions')
      return Array.isArray(res) ? res : (res?.data ?? [])
    },
    staleTime: 300_000,
  })
}
