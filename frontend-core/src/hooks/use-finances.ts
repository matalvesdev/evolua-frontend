import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Transaction {
  id: string
  clinicId: string
  userId: string | null
  patientId: string | null
  appointmentId: string | null
  type: 'income' | 'expense'
  category: string
  amount: string
  description: string
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  dueDate: string
  paidAt: string | null
  paymentMethod: string | null
  paymentReference: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface FinancesSummary {
  totalIncome: string
  totalExpense: string
  balance: string
  pendingIncome: string
  overdueIncome: string
}

export interface FinancialMetric {
  month: string
  revenue: number
  expenses: number
  profit: number
  sessions: number
}

interface ListResponse<T> {
  data: T[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
}

// ── GET /api/finances/summary ──────────────────────────────────────────────────

export function useFinancesSummary(params: { startDate?: string; endDate?: string } = {}) {
  const usp = new URLSearchParams()
  if (params.startDate) usp.set('startDate', params.startDate)
  if (params.endDate) usp.set('endDate', params.endDate)
  const q = usp.toString()
  return useQuery<FinancesSummary>({
    queryKey: ['finances', 'summary', params],
    queryFn: () => api.get<FinancesSummary>(`/api/finances/summary${q ? `?${q}` : ''}`),
    staleTime: 60_000,
  })
}

// ── GET /api/finances/transactions ────────────────────────────────────────────

export function useTransactions(params: {
  page?: number
  pageSize?: number
  type?: 'income' | 'expense'
  status?: Transaction['status']
} = {}) {
  const usp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) usp.set(k, String(v))
  }
  const q = usp.toString()
  return useQuery<ListResponse<Transaction>>({
    queryKey: ['finances', 'transactions', params],
    queryFn: () =>
      api.get<ListResponse<Transaction>>(`/api/finances/transactions${q ? `?${q}` : ''}`),
    staleTime: 30_000,
  })
}

// ── POST /api/finances/transactions ───────────────────────────────────────────

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Transaction>) =>
      api.post<Transaction>('/api/finances/transactions', body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finances'] })
    },
  })
}

// ── POST /api/finances/transactions/:id/pay ───────────────────────────────────

export function useMarkTransactionPaid() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.post<Transaction>(`/api/finances/transactions/${id}/pay`, {}),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['finances'] })
    },
  })
}

// ── GET /api/finances/metrics ─────────────────────────────────────────────────

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
