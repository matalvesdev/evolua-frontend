import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Article {
  id: string
  title: string
  authors: string
  source: string
  year: number
  area: string
  type: string
  abstract: string
  doi?: string
  tags: string[]
  saved: boolean
}

export function useArticles() {
  return useQuery<Article[]>({
    queryKey: ['articles'],
    queryFn: async () => {
      const res = await api.get<{ data: Article[] } | Article[]>('/api/articles')
      return Array.isArray(res) ? res : (res?.data ?? [])
    },
    staleTime: 60_000,
  })
}
