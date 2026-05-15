import type { RequestLogEntry, ImplementationKey, ApiEndpoint } from './types'

const DUPLICATE_WINDOW_MS = 1500

let entries: RequestLogEntry[] = []
let listeners: Array<() => void> = []
let nextId = 1

const inFlight = new Map<string, number>()
const lastCompleted = new Map<string, number>()

function buildSignature(endpoint: ApiEndpoint, params: unknown): string {
  return `${endpoint}:${JSON.stringify(params)}`
}

function notify() {
  for (const listener of listeners) {
    listener()
  }
}

export interface BeginRequestResult {
  requestId: string
  startTime: number
  concurrentDuplicate: boolean
  repeatedWithinWindow: boolean
}

export function beginRequest(
  endpoint: ApiEndpoint,
  params: unknown,
): BeginRequestResult {
  const signature = buildSignature(endpoint, params)
  const now = Date.now()

  const concurrentCount = inFlight.get(signature) ?? 0
  const concurrentDuplicate = concurrentCount > 0
  inFlight.set(signature, concurrentCount + 1)

  const lastTime = lastCompleted.get(signature)
  const repeatedWithinWindow =
    lastTime !== undefined && now - lastTime < DUPLICATE_WINDOW_MS

  return {
    requestId: `req-${nextId++}`,
    startTime: now,
    concurrentDuplicate,
    repeatedWithinWindow,
  }
}

const MUTATION_ENDPOINTS = new Set<ApiEndpoint>([
  'createTask',
  'updateTask',
  'deleteTask',
  'toggleTaskCompletion',
])

export function finalizeRequest(
  requestId: string,
  endpoint: ApiEndpoint,
  params: unknown,
  context: { implementation: ImplementationKey; scenario: string; observer?: string },
  startTime: number,
  success: boolean,
  retryCount: number,
  concurrentDuplicate: boolean,
  repeatedWithinWindow: boolean,
): void {
  const signature = buildSignature(endpoint, params)
  const now = Date.now()

  const currentInFlight = inFlight.get(signature) ?? 1
  if (currentInFlight <= 1) {
    inFlight.delete(signature)
  } else {
    inFlight.set(signature, currentInFlight - 1)
  }
  lastCompleted.set(signature, now)

  const entry: RequestLogEntry = {
    id: requestId,
    timestamp: startTime,
    endpoint,
    params,
    implementation: context.implementation,
    scenario: context.scenario as RequestLogEntry['scenario'],
    observer: context.observer,
    durationMs: now - startTime,
    success,
    retryCount,
    concurrentDuplicate,
    repeatedWithinWindow,
    isMutation: MUTATION_ENDPOINTS.has(endpoint),
  }

  entries = [entry, ...entries]
  notify()
}

export function subscribeRequestLog(listener: () => void): () => void {
  listeners = [...listeners, listener]
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

export function getRequestLogSnapshot(): RequestLogEntry[] {
  return entries
}

export function getRequestLogEntries(
  implementation?: ImplementationKey,
): RequestLogEntry[] {
  if (!implementation) return entries
  return entries.filter((e) => e.implementation === implementation)
}

export function resetRequestLog(): void {
  entries = []
  inFlight.clear()
  lastCompleted.clear()
  notify()
}
