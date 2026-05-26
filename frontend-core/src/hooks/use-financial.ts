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
    queryFn: () => api.get<FinancialMetric[]>('/api/finances/metrics'),
    staleTime: 60_000,
  })
}
