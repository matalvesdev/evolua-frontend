import { queryOptions } from '@tanstack/react-query'
import { fetchChangelogEntries } from '../lib/changelog'

export const changelogQueryOptions = () =>
  queryOptions({
    queryKey: ['changelog'],
    queryFn: () => fetchChangelogEntries(),
    staleTime: 1000 * 60 * 5,
    retry: (failureCount) => failureCount < 2,
    throwOnError: true,
  })
