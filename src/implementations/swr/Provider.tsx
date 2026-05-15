import { ReactNode } from 'react'
import { SWRConfig } from 'swr'
import { MockApiError } from '../../api/types'

function shouldRetryOnError(error: Error): boolean {
  return error instanceof MockApiError && error.retryable
}

export function SwrProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        dedupingInterval: 1500,
        revalidateOnFocus: false,
        shouldRetryOnError,
        errorRetryCount: 2,
        errorRetryInterval: 800,
      }}
    >
      {children}
    </SWRConfig>
  )
}

export function resetSwrCache() {
  // SWR's cache is managed internally via the provider
  // Remounting the provider effectively resets state
}
