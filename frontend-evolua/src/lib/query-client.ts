import { QueryClient } from "@tanstack/react-query"

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,        // 1 min — dados considerados frescos
        gcTime: 5 * 60 * 1000,       // 5 min — manter no cache após não-usado
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: (failureCount, error) => {
          // Não re-tentar em erros 4xx (exceto 429)
          if (error instanceof Error && 'status' in (error as Record<string,unknown>)) {
            const status = (error as Record<string, number>).status;
            if (status >= 400 && status < 500 && status !== 429) return false;
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

export function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient()
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }
  return browserQueryClient
}
