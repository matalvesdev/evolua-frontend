import { queryOptions } from '@tanstack/react-query'
import { fetchFaqItems } from '../lib/faq'

export const faqQueryOptions = () =>
  queryOptions({
    queryKey: ['faq'],
    queryFn: () => fetchFaqItems(),
    staleTime: 1000 * 60 * 10,
    retry: (failureCount) => failureCount < 2,
    throwOnError: true,
  })
