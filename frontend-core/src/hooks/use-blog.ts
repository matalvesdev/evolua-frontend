import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  category: string
  image: string
  date: string
  readTime: string
}

export function useBlogPosts() {
  return useQuery<BlogPost[]>({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const res = await api.get<{ data: BlogPost[] } | BlogPost[]>('/api/blog/posts')
      return Array.isArray(res) ? res : (res?.data ?? [])
    },
    staleTime: 300_000,
  })
}
