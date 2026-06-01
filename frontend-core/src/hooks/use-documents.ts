import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Document {
  id: string
  patientId: string
  patientName: string
  type: string
  title: string
  content: string
  status: 'draft' | 'final'
  createdAt: string
  updatedAt: string
}

export function useDocuments() {
  return useQuery<Document[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get<{ data: Document[] } | Document[]>('/api/documents')
      return Array.isArray(res) ? res : (res?.data ?? [])
    },
    staleTime: 30_000,
  })
}

export function useCreateDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Document>) => api.post<Document>('/api/documents', body),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['documents'] }) },
  })
}

export function useUpdateDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Document> }) =>
      api.patch<Document>(`/api/documents/${id}`, body),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['documents'] }) },
  })
}

export function useDeleteDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/documents/${id}`),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['documents'] }) },
  })
}
