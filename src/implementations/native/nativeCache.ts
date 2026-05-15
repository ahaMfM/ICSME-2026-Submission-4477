interface CacheEntry<T> {
  value: T
  updatedAt: number
}

const cache = new Map<string, CacheEntry<unknown>>()

export function getCachedValue<T>(key: string): CacheEntry<T> | undefined {
  return cache.get(key) as CacheEntry<T> | undefined
}

export function setCachedValue<T>(key: string, value: T): void {
  cache.set(key, { value, updatedAt: Date.now() })
}

export function updateCachedValue<T>(
  key: string,
  updater: (current: T) => T,
): void {
  const entry = cache.get(key) as CacheEntry<T> | undefined
  if (entry) {
    cache.set(key, { value: updater(entry.value), updatedAt: Date.now() })
  }
}

export function invalidateNativeCache(prefix?: string): void {
  if (!prefix) {
    cache.clear()
    return
  }
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key)
    }
  }
}
