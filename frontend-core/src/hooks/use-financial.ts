import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface FinancialMetric {
  month: string
  revenue: number
  expenses: number
  profit: number
  sessions: number
}

export function useFinancialMetrics() {
  return useQuery<FinancialMetric[]>({
    queryKey: ['financial-metrics'],
    queryFn: async () => {
      const res = await api.get<{ data: FinancialMetric[] } | FinancialMetric[]>('/api/finances/metrics')
      return Array.isArray(res) ? res : (res?.data ?? [])
    },
    staleTime: 60_000,
  })
}
