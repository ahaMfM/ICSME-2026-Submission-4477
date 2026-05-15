import { useSyncExternalStore } from 'react'

export function useStoreSnapshot<T>(
  subscribe: (listener: () => void) => () => void,
  getSnapshot: () => T,
): T {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
