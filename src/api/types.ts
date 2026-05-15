export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  userId: string
  createdAt: string
}

export interface User {
  id: string
  name: string
  email: string
}

export interface TaskInput {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  userId: string
}

export interface TaskUpdateInput {
  title?: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
  completed?: boolean
}

export interface TaskQuery {
  page?: number
  pageSize?: number
  search?: string
  userId?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

export type FailureMode = 'none' | 'random' | 'always' | 'next'

export interface MockApiConfig {
  latencyMinMs: number
  latencyMaxMs: number
  failureMode: FailureMode
  randomFailureRate: number
  retryableFailureRate: number
}

export type ApiEndpoint =
  | 'getTasks'
  | 'getTaskById'
  | 'getCurrentUser'
  | 'getTasksForUser'
  | 'createTask'
  | 'updateTask'
  | 'deleteTask'
  | 'toggleTaskCompletion'

export type ImplementationKey = 'native' | 'tanstack-query' | 'swr'

export type ScenarioKey =
  | 's1-task-list'
  | 's2-task-detail'
  | 's3-s5-mutations'
  | 's6-optimistic-update'
  | 's7-pagination'
  | 's8-dependent-query'
  | 's9-manual-refetch'
  | 's10-s11-error-retry'
  | 's12-background-revalidation'

export interface RequestContext {
  implementation: ImplementationKey
  scenario: ScenarioKey
  observer?: string
}

export interface RequestLogEntry {
  id: string
  timestamp: number
  endpoint: ApiEndpoint
  params: unknown
  implementation: ImplementationKey
  scenario: ScenarioKey
  observer?: string
  durationMs: number
  success: boolean
  retryCount: number
  concurrentDuplicate: boolean
  repeatedWithinWindow: boolean
  isMutation: boolean
}

export class MockApiError extends Error {
  retryable: boolean

  constructor(message: string, retryable: boolean) {
    super(message)
    this.name = 'MockApiError'
    this.retryable = retryable
  }
}
