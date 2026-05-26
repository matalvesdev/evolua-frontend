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
    queryFn: () => api.get<BlogPost[]>('/api/blog/posts'),
    staleTime: 300_000,
  })
}
