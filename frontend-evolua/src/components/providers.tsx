"use client"

import * as React from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { getQueryClient } from "@/lib/query-client"
import { HimetricaProvider } from "@/components/analytics/himetrica-provider"
import { ErrorBoundary } from "@/components/error-boundary"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const queryClient = getQueryClient()

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HimetricaProvider>
          {children}
        </HimetricaProvider>
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
