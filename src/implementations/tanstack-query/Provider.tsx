import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MockApiError } from '../../api/types'

function shouldRetry(failureCount: number, error: Error): boolean {
  return error instanceof MockApiError && error.retryable && failureCount < 2
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      gcTime: 60000,
      retry: shouldRetry,
      refetchOnWindowFocus: false,
    },
  },
})

export function TanStackProvider({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

export function resetTanStackCache() {
  queryClient.clear()
}

export { queryClient }
