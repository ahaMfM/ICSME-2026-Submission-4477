import type { RequestLogEntry, ImplementationKey } from '../api/types'

export interface RequestMetrics {
  total: number
  successful: number
  failed: number
  duplicates: number
  repeatedWithinWindow: number
  totalRetries: number
  mutations: number
  avgDurationMs: number
}

export function buildRequestMetrics(
  entries: RequestLogEntry[],
  implementation?: ImplementationKey,
): RequestMetrics {
  const filtered = implementation
    ? entries.filter((e) => e.implementation === implementation)
    : entries

  if (filtered.length === 0) {
    return {
      total: 0,
      successful: 0,
      failed: 0,
      duplicates: 0,
      repeatedWithinWindow: 0,
      totalRetries: 0,
      mutations: 0,
      avgDurationMs: 0,
    }
  }

  const totalDuration = filtered.reduce((sum, e) => sum + e.durationMs, 0)

  return {
    total: filtered.length,
    successful: filtered.filter((e) => e.success).length,
    failed: filtered.filter((e) => !e.success).length,
    duplicates: filtered.filter((e) => e.concurrentDuplicate).length,
    repeatedWithinWindow: filtered.filter((e) => e.repeatedWithinWindow).length,
    totalRetries: filtered.reduce((sum, e) => sum + e.retryCount, 0),
    mutations: filtered.filter((e) => e.isMutation).length,
    avgDurationMs: Math.round(totalDuration / filtered.length),
  }
}
