import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

// ── Tipos (alinhados a backend-core/contracts/src/ai.ts) ────────────────────

export interface ChatCitation {
  source: string
  title?: string
  source_url?: string | null
  page?: number | null
  snippet?: string
  similarity?: number
}

export interface AiChatResponse {
  answer: string
  citations: ChatCitation[]
  latency_ms?: number
  model?: string
}

export interface ChatHistoryMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface LibraryDocument {
  id: string
  title: string
  source: string
  source_url?: string | null
  author?: string | null
  specialty?: string | null
  language: string
  chunk_count: number
  created_at: string
}

interface LibraryDocumentListResponse {
  items: LibraryDocument[]
  total: number
}

export interface LibraryIngestResponse {
  documentId: string
  chunks: number
  latencyMs: number
}

// ── Chat (RAG) ──────────────────────────────────────────────────────────────

export function useLibraryChat() {
  return useMutation<
    AiChatResponse,
    Error,
    { question: string; history?: ChatHistoryMessage[]; specialty?: string }
  >({
    mutationFn: ({ question, history = [], specialty }) =>
      api.post<AiChatResponse>('/api/ai/chat', {
        question,
        history: history.slice(-10),
        ...(specialty ? { specialty } : {}),
      }),
  })
}

// ── Documentos ingeridos ──────────────────────────────────────────────────--

export function useLibraryDocuments(specialty?: string) {
  return useQuery<LibraryDocumentListResponse>({
    queryKey: ['library-documents', specialty ?? 'all'],
    queryFn: () => {
      const qs = specialty ? `?specialty=${encodeURIComponent(specialty)}` : ''
      return api.get<LibraryDocumentListResponse>(`/api/ai/library/documents${qs}`)
    },
    staleTime: 60_000,
  })
}

// ── Ingestão por URL ─────────────────────────────────────────────────────--

export function useIngestLibraryUrl() {
  const qc = useQueryClient()
  return useMutation<
    LibraryIngestResponse,
    Error,
    {
      source_url: string
      title: string
      author?: string
      specialty?: string
      language?: string
    }
  >({
    mutationFn: (body) =>
      api.post<LibraryIngestResponse>('/api/ai/library/ingest-url', {
        language: 'pt-BR',
        ...body,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['library-documents'] })
    },
  })
}

// ── Ingestão por arquivo (multipart) ───────────────────────────────────────-

export function useIngestLibraryFile() {
  const qc = useQueryClient()
  return useMutation<
    LibraryIngestResponse,
    Error,
    {
      file: File
      title: string
      author?: string
      specialty?: string
      language?: string
    }
  >({
    mutationFn: ({ file, title, author, specialty, language }) => {
      const form = new FormData()
      form.append('file', file)
      form.append('title', title)
      if (author) form.append('author', author)
      if (specialty) form.append('specialty', specialty)
      form.append('language', language ?? 'pt-BR')
      return api.postForm<LibraryIngestResponse>('/api/ai/library/ingest-file', form)
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['library-documents'] })
    },
  })
}

// ── Remoção ─────────────────────────────────────────────────────────────────

export function useDeleteLibraryDocument() {
  const qc = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.delete<void>(`/api/ai/library/documents/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['library-documents'] })
    },
  })
}
