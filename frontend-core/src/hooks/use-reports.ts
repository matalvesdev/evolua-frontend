import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

// Alinhado a backend-core/contracts/src/report.ts (ReportTypeSchema)
export type ReportType =
  | 'evolution'
  | 'evaluation'
  | 'reevaluation'
  | 'discharge'
  | 'referral'
  | 'treatment_plan'
  | 'progress'
  | 'other'

export interface Report {
  id: string
  patientId: string
  patientName: string
  type: string
  title: string
  content: string
  status: 'draft' | 'review' | 'approved' | 'sent' | 'signed'
  createdAt: string
  updatedAt: string
}

export interface UpdateReportInput {
  title?: string
  content?: string
  sections?: unknown
  type?: ReportType
  transcription?: string | null
  periodStartDate?: string | null
  periodEndDate?: string | null
}

/** Payload aceito por POST /api/reports (CreateReportSchema). */
export interface CreateReportInput {
  patientId: string
  patientName: string
  therapistName: string
  therapistCrfa?: string
  type: ReportType
  title: string
  content?: string
  sections?: unknown
  appointmentId?: string | null
  periodStartDate?: string | null
  periodEndDate?: string | null
}

export function useReports() {
  return useQuery<Report[]>({
    queryKey: ['reports'],
    queryFn: async () => {
      const res = await api.get<{ data: Report[] } | Report[]>('/api/reports')
      return Array.isArray(res) ? res : (res?.data ?? [])
    },
    staleTime: 30_000,
  })
}

export function useCreateReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateReportInput) => api.post<Report>('/api/reports', body),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['reports'] }) },
  })
}

export function useUpdateReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateReportInput }) =>
      api.patch<Report>(`/api/reports/${id}`, body),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['reports'] }) },
  })
}

export function useSubmitReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post<Report>(`/api/reports/${id}/submit`, {}),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['reports'] }) },
  })
}

export function useDeleteReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/reports/${id}`),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['reports'] }) },
  })
}
