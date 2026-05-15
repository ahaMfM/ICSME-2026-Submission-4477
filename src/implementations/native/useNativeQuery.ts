import { useState, useEffect, useCallback, useRef } from 'react'
import { MockApiError } from '../../api/types'
import { getCachedValue, setCachedValue } from './nativeCache'

interface UseNativeQueryOptions<T> {
  cacheKey: string
  queryFn: () => Promise<T>
  enabled?: boolean
  staleTimeMs?: number
  backgroundRefreshMs?: number
  retry?: number
}

interface UseNativeQueryResult<T> {
  data: T | undefined
  error: Error | undefined
  isLoading: boolean
  isFetching: boolean
  refetch: () => Promise<T | undefined>
  setData: (updater: (current: T | undefined) => T) => void
}

export function useNativeQuery<T>(
  options: UseNativeQueryOptions<T>,
): UseNativeQueryResult<T> {
  const {
    cacheKey,
    queryFn,
    enabled = true,
    staleTimeMs = 5000,
    backgroundRefreshMs,
    retry = 0,
  } = options

  const cached = getCachedValue<T>(cacheKey)
  const [data, setDataState] = useState<T | undefined>(cached?.value)
  const [error, setError] = useState<Error | undefined>()
  const [isLoading, setIsLoading] = useState(!cached)
  const [isFetching, setIsFetching] = useState(false)
  const mountedRef = useRef(true)

  const isCacheFresh =
    cached !== undefined && Date.now() - cached.updatedAt < staleTimeMs

  const execute = useCallback(async (): Promise<T | undefined> => {
    setIsFetching(true)
    setError(undefined)

    let attempt = 0
    while (attempt <= retry) {
      try {
        const result = await queryFn()
        if (!mountedRef.current) return undefined
        setCachedValue(cacheKey, result)
        setDataState(result)
        setIsLoading(false)
        setIsFetching(false)
        return result
      } catch (err) {
        const shouldRetry =
          err instanceof MockApiError && err.retryable && attempt < retry
        if (!shouldRetry) {
          if (!mountedRef.current) return undefined
          setError(err instanceof Error ? err : new Error(String(err)))
          setIsLoading(false)
          setIsFetching(false)
          return undefined
        }
      }
      attempt += 1
    }
    return undefined
  }, [cacheKey, queryFn, retry])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    if (isCacheFresh) {
      setDataState(cached?.value)
      setIsLoading(false)
      return
    }
    void execute()
  }, [enabled, execute, isCacheFresh, cached?.value])

  useEffect(() => {
    if (!backgroundRefreshMs || !enabled) return
    const interval = setInterval(() => {
      void execute()
    }, backgroundRefreshMs)
    return () => clearInterval(interval)
  }, [backgroundRefreshMs, enabled, execute])

  const setData = useCallback(
    (updater: (current: T | undefined) => T) => {
      const newValue = updater(data)
      setCachedValue(cacheKey, newValue)
      setDataState(newValue)
    },
    [data, cacheKey],
  )

  return { data, error, isLoading, isFetching, refetch: execute, setData }
}
