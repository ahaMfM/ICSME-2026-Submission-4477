import type {
  Task,
  User,
  TaskInput,
  TaskUpdateInput,
  TaskQuery,
  PaginatedResponse,
  MockApiConfig,
  FailureMode,
  ApiEndpoint,
  RequestContext,
} from './types'
import { MockApiError } from './types'
import { beginRequest, finalizeRequest } from './requestLogger'

const SEED_USERS: User[] = [
  { id: 'user-1', name: 'Alice Chen', email: 'alice@example.com' },
  { id: 'user-2', name: 'Bob Martinez', email: 'bob@example.com' },
  { id: 'user-3', name: 'Carol Park', email: 'carol@example.com' },
]

function generateSeedTasks(): Task[] {
  const priorities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high']
  const tasks: Task[] = []

  for (let i = 1; i <= 24; i++) {
    tasks.push({
      id: `task-${i}`,
      title: `Task ${i}: ${taskTitles[i - 1]!}`,
      description: `Description for task ${i}. This is a sample task used in the experiment.`,
      completed: i % 4 === 0,
      priority: priorities[(i - 1) % 3]!,
      userId: SEED_USERS[(i - 1) % 3]!.id,
      createdAt: new Date(2024, 0, i).toISOString(),
    })
  }

  return tasks
}

const taskTitles = [
  'Set up project scaffolding',
  'Implement authentication',
  'Design database schema',
  'Build REST API endpoints',
  'Create form validation',
  'Add error handling',
  'Write unit tests',
  'Set up CI/CD pipeline',
  'Implement caching layer',
  'Build search functionality',
  'Add pagination support',
  'Create user dashboard',
  'Implement notifications',
  'Build reporting module',
  'Add export functionality',
  'Create admin panel',
  'Implement rate limiting',
  'Build webhook system',
  'Add audit logging',
  'Create backup system',
  'Implement SSO integration',
  'Build file upload service',
  'Add real-time updates',
  'Create monitoring alerts',
]

let database = {
  users: [...SEED_USERS],
  tasks: generateSeedTasks(),
}

let config: MockApiConfig = {
  latencyMinMs: 250,
  latencyMaxMs: 700,
  failureMode: 'none',
  randomFailureRate: 0.2,
  retryableFailureRate: 0.75,
}

let configListeners: Array<() => void> = []

function notifyConfigListeners() {
  for (const listener of configListeners) {
    listener()
  }
}

export function getApiConfig(): MockApiConfig {
  return config
}

export function updateApiConfig(updates: Partial<MockApiConfig>): void {
  config = { ...config, ...updates }
  notifyConfigListeners()
}

export function subscribeApiConfig(listener: () => void): () => void {
  configListeners = [...configListeners, listener]
  return () => {
    configListeners = configListeners.filter((l) => l !== listener)
  }
}

export function getApiConfigSnapshot(): MockApiConfig {
  return config
}

export function resetMockApi(): void {
  database = { users: [...SEED_USERS], tasks: generateSeedTasks() }
  config = {
    latencyMinMs: 250,
    latencyMaxMs: 700,
    failureMode: 'none',
    randomFailureRate: 0.2,
    retryableFailureRate: 0.75,
  }
  notifyConfigListeners()
}

function randomLatency(): number {
  return config.latencyMinMs + Math.random() * (config.latencyMaxMs - config.latencyMinMs)
}

function shouldFail(): boolean {
  switch (config.failureMode) {
    case 'none':
      return false
    case 'always':
      return true
    case 'next':
      return true
    case 'random':
      return Math.random() < config.randomFailureRate
  }
}

function isRetryable(): boolean {
  return Math.random() < config.retryableFailureRate
}

async function simulateRequest<T>(
  endpoint: ApiEndpoint,
  params: unknown,
  context: RequestContext,
  operation: () => T,
): Promise<T> {
  const { requestId, startTime, concurrentDuplicate, repeatedWithinWindow } =
    beginRequest(endpoint, params)

  const latency = randomLatency()
  await new Promise((resolve) => setTimeout(resolve, latency))

  if (shouldFail()) {
    if (config.failureMode === 'next') {
      updateApiConfig({ failureMode: 'none' })
    }
    const retryable = isRetryable()
    finalizeRequest(
      requestId,
      endpoint,
      params,
      context,
      startTime,
      false,
      0,
      concurrentDuplicate,
      repeatedWithinWindow,
    )
    throw new MockApiError(
      `Request to ${endpoint} failed${retryable ? ' (retryable)' : ''}`,
      retryable,
    )
  }

  const result = operation()

  finalizeRequest(
    requestId,
    endpoint,
    params,
    context,
    startTime,
    true,
    0,
    concurrentDuplicate,
    repeatedWithinWindow,
  )

  return result
}

export async function getTasks(
  query: TaskQuery,
  context: RequestContext,
): Promise<PaginatedResponse<Task>> {
  return simulateRequest('getTasks', query, context, () => {
    let filtered = [...database.tasks]

    if (query.search) {
      const term = query.search.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          t.description.toLowerCase().includes(term),
      )
    }

    if (query.userId) {
      filtered = filtered.filter((t) => t.userId === query.userId)
    }

    const page = query.page ?? 1
    const pageSize = query.pageSize ?? 10
    const start = (page - 1) * pageSize
    const items = filtered.slice(start, start + pageSize)

    return {
      items,
      page,
      pageSize,
      total: filtered.length,
      hasMore: start + pageSize < filtered.length,
    }
  })
}

export async function getTaskById(
  taskId: string,
  context: RequestContext,
): Promise<Task> {
  return simulateRequest('getTaskById', { taskId }, context, () => {
    const task = database.tasks.find((t) => t.id === taskId)
    if (!task) throw new MockApiError(`Task ${taskId} not found`, false)
    return task
  })
}

export async function getCurrentUser(context: RequestContext): Promise<User> {
  return simulateRequest('getCurrentUser', {}, context, () => {
    return database.users[0]!
  })
}

export async function getTasksForUser(
  userId: string,
  context: RequestContext,
): Promise<PaginatedResponse<Task>> {
  return simulateRequest('getTasksForUser', { userId }, context, () => {
    const filtered = database.tasks.filter((t) => t.userId === userId)
    return {
      items: filtered,
      page: 1,
      pageSize: filtered.length,
      total: filtered.length,
      hasMore: false,
    }
  })
}

export async function createTask(
  input: TaskInput,
  context: RequestContext,
): Promise<Task> {
  return simulateRequest('createTask', input, context, () => {
    const task: Task = {
      id: `task-${Date.now()}`,
      title: input.title,
      description: input.description,
      completed: false,
      priority: input.priority,
      userId: input.userId,
      createdAt: new Date().toISOString(),
    }
    database.tasks = [task, ...database.tasks]
    return task
  })
}

export async function updateTask(
  taskId: string,
  input: TaskUpdateInput,
  context: RequestContext,
): Promise<Task> {
  return simulateRequest('updateTask', { taskId, ...input }, context, () => {
    const index = database.tasks.findIndex((t) => t.id === taskId)
    if (index === -1) throw new MockApiError(`Task ${taskId} not found`, false)
    const updated = { ...database.tasks[index]!, ...input }
    database.tasks = database.tasks.map((t) => (t.id === taskId ? updated : t))
    return updated
  })
}

export async function deleteTask(
  taskId: string,
  context: RequestContext,
): Promise<void> {
  return simulateRequest('deleteTask', { taskId }, context, () => {
    database.tasks = database.tasks.filter((t) => t.id !== taskId)
  })
}

export async function toggleTaskCompletion(
  taskId: string,
  context: RequestContext,
): Promise<Task> {
  return simulateRequest('toggleTaskCompletion', { taskId }, context, () => {
    const index = database.tasks.findIndex((t) => t.id === taskId)
    if (index === -1) throw new MockApiError(`Task ${taskId} not found`, false)
    const updated = {
      ...database.tasks[index]!,
      completed: !database.tasks[index]!.completed,
    }
    database.tasks = database.tasks.map((t) => (t.id === taskId ? updated : t))
    return updated
  })
}

export function getUsers(): User[] {
  return database.users
}

export { type FailureMode }
