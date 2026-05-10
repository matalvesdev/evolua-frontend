import { queryOptions } from '@tanstack/react-query'
import { fetchPosts, fetchPostBySlug } from '../lib/blog'

// Single query for all posts — filter client-side to avoid cache fragmentation
export const postsQueryOptions = (categoria?: string) =>
  queryOptions({
    queryKey: ['posts', { categoria: categoria ?? 'Todos' }],
    queryFn: () => fetchPosts(categoria),
    staleTime: 1000 * 60 * 5, // 5 min
    retry: (failureCount, error) => {
      // Don't retry on 404s
      if (error instanceof Error && error.message.includes('404')) return false
      return failureCount < 2
    },
    throwOnError: true,
  })

export const postBySlugQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ['posts', 'slug', slug],
    queryFn: () => fetchPostBySlug(slug),
    staleTime: 1000 * 60 * 10,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('404')) return false
      return failureCount < 2
    },
    throwOnError: true,
  })
