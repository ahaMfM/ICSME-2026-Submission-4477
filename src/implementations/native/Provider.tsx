import type { ReactNode } from 'react'
import { invalidateNativeCache } from './nativeCache'

export function NativeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export function resetNativeCache() {
  invalidateNativeCache()
}
