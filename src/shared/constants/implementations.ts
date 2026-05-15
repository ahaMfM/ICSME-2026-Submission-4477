import type { ImplementationKey, ScenarioKey } from '../../api/types'

export const IMPLEMENTATION_ORDER: ImplementationKey[] = [
  'native',
  'tanstack-query',
  'swr',
]

export const IMPLEMENTATION_LABELS: Record<ImplementationKey, string> = {
  native: 'Native (useEffect)',
  'tanstack-query': 'TanStack Query',
  swr: 'SWR',
}

export interface ScenarioDefinition {
  key: ScenarioKey
  label: string
  path: string
}

export const SCENARIOS: ScenarioDefinition[] = [
  { key: 's1-task-list', label: 'S1 Task List', path: 's1-task-list' },
  { key: 's2-task-detail', label: 'S2 Task Detail', path: 's2-task-detail' },
  { key: 's3-s5-mutations', label: 'S3–S5 Mutations', path: 's3-s5-mutations' },
  { key: 's6-optimistic-update', label: 'S6 Optimistic Update', path: 's6-optimistic-update' },
  { key: 's7-pagination', label: 'S7 Pagination', path: 's7-pagination' },
  { key: 's8-dependent-query', label: 'S8 Dependent Query', path: 's8-dependent-query' },
  { key: 's9-manual-refetch', label: 'S9 Manual Refetch', path: 's9-manual-refetch' },
  { key: 's10-s11-error-retry', label: 'S10–S11 Error & Retry', path: 's10-s11-error-retry' },
  { key: 's12-background-revalidation', label: 'S12 Background Revalidation', path: 's12-background-revalidation' },
]

export function isImplementationKey(value: string): value is ImplementationKey {
  return IMPLEMENTATION_ORDER.includes(value as ImplementationKey)
}

export function isScenarioKey(value: string): value is ScenarioKey {
  return SCENARIOS.some((s) => s.key === value)
}
