import type { ImplementationKey, ScenarioKey } from '../api/types'

interface MetricsState {
  manualRefetchCount: Record<ImplementationKey, number>
  mutationCount: Record<ImplementationKey, number>
  firstSuccessMs: Record<ImplementationKey, Record<string, number>>
  renderCounts: Record<ImplementationKey, Record<string, number>>
}

let state: MetricsState = createInitialState()
let listeners: Array<() => void> = []

function createInitialState(): MetricsState {
  return {
    manualRefetchCount: { native: 0, 'tanstack-query': 0, swr: 0 },
    mutationCount: { native: 0, 'tanstack-query': 0, swr: 0 },
    firstSuccessMs: { native: {}, 'tanstack-query': {}, swr: {} },
    renderCounts: { native: {}, 'tanstack-query': {}, swr: {} },
  }
}

function notify() {
  for (const listener of listeners) {
    listener()
  }
}

export function recordManualRefetch(implementation: ImplementationKey): void {
  state = {
    ...state,
    manualRefetchCount: {
      ...state.manualRefetchCount,
      [implementation]: state.manualRefetchCount[implementation] + 1,
    },
  }
  notify()
}

export function recordMutation(implementation: ImplementationKey): void {
  state = {
    ...state,
    mutationCount: {
      ...state.mutationCount,
      [implementation]: state.mutationCount[implementation] + 1,
    },
  }
  notify()
}

export function recordFirstSuccess(
  implementation: ImplementationKey,
  scenario: ScenarioKey,
  durationMs: number,
): void {
  const key = `${implementation}:${scenario}`
  const existing = state.firstSuccessMs[implementation][key]
  if (existing !== undefined) return

  state = {
    ...state,
    firstSuccessMs: {
      ...state.firstSuccessMs,
      [implementation]: {
        ...state.firstSuccessMs[implementation],
        [key]: durationMs,
      },
    },
  }
  notify()
}

export function recordRender(
  implementation: ImplementationKey,
  scenario: ScenarioKey,
  count: number,
): void {
  const key = `${implementation}:${scenario}`
  state = {
    ...state,
    renderCounts: {
      ...state.renderCounts,
      [implementation]: {
        ...state.renderCounts[implementation],
        [key]: count,
      },
    },
  }
  notify()
}

export function subscribeMetrics(listener: () => void): () => void {
  listeners = [...listeners, listener]
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

export function getMetricsSnapshot(): MetricsState {
  return state
}

export function resetResearchMetrics(): void {
  state = createInitialState()
  notify()
}
