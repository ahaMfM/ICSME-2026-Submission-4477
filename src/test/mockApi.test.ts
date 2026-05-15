import { describe, it, expect, beforeEach } from 'vitest'
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  getCurrentUser,
  getTasksForUser,
  resetMockApi,
  updateApiConfig,
} from '../api/mockApi'
import { resetRequestLog } from '../api/requestLogger'
import type { RequestContext } from '../api/types'
import { MockApiError } from '../api/types'

const ctx: RequestContext = { implementation: 'native', scenario: 's1-task-list' }

beforeEach(() => {
  resetMockApi()
  resetRequestLog()
  updateApiConfig({ latencyMinMs: 0, latencyMaxMs: 0 })
})

describe('getTasks', () => {
  it('returns paginated results', async () => {
    const result = await getTasks({ page: 1, pageSize: 5 }, ctx)
    expect(result.items).toHaveLength(5)
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(5)
    expect(result.total).toBe(24)
    expect(result.hasMore).toBe(true)
  })

  it('returns last page correctly', async () => {
    const result = await getTasks({ page: 5, pageSize: 5 }, ctx)
    expect(result.items).toHaveLength(4)
    expect(result.hasMore).toBe(false)
  })

  it('filters by search term', async () => {
    const result = await getTasks({ page: 1, pageSize: 30, search: 'authentication' }, ctx)
    expect(result.items.length).toBeGreaterThan(0)
    expect(result.items.every((t) => t.title.toLowerCase().includes('authentication'))).toBe(true)
  })
})

describe('getTaskById', () => {
  it('returns the requested task', async () => {
    const task = await getTaskById('task-1', ctx)
    expect(task.id).toBe('task-1')
    expect(task.title).toContain('Task 1')
  })

  it('throws for unknown task', async () => {
    await expect(getTaskById('nonexistent', ctx)).rejects.toThrow(MockApiError)
  })
})

describe('mutations', () => {
  it('creates a task', async () => {
    const created = await createTask(
      { title: 'New', description: 'Desc', priority: 'high', userId: 'user-1' },
      ctx,
    )
    expect(created.title).toBe('New')
    expect(created.completed).toBe(false)

    const list = await getTasks({ page: 1, pageSize: 30 }, ctx)
    expect(list.items.find((t) => t.id === created.id)).toBeTruthy()
  })

  it('updates a task', async () => {
    const updated = await updateTask('task-1', { title: 'Updated' }, ctx)
    expect(updated.title).toBe('Updated')
  })

  it('deletes a task', async () => {
    await deleteTask('task-1', ctx)
    const list = await getTasks({ page: 1, pageSize: 30 }, ctx)
    expect(list.items.find((t) => t.id === 'task-1')).toBeUndefined()
  })

  it('toggles completion', async () => {
    const before = await getTaskById('task-1', ctx)
    const after = await toggleTaskCompletion('task-1', ctx)
    expect(after.completed).toBe(!before.completed)
  })
})

describe('user queries', () => {
  it('returns current user', async () => {
    const user = await getCurrentUser(ctx)
    expect(user.id).toBe('user-1')
    expect(user.name).toBe('Alice Chen')
  })

  it('returns tasks for a user', async () => {
    const result = await getTasksForUser('user-1', ctx)
    expect(result.items.length).toBeGreaterThan(0)
    expect(result.items.every((t) => t.userId === 'user-1')).toBe(true)
  })
})

describe('failure modes', () => {
  it('always mode throws on every request', async () => {
    updateApiConfig({ failureMode: 'always' })
    await expect(getTasks({ page: 1 }, ctx)).rejects.toThrow(MockApiError)
  })

  it('next mode fails once then succeeds', async () => {
    updateApiConfig({ failureMode: 'next' })
    await expect(getTasks({ page: 1 }, ctx)).rejects.toThrow(MockApiError)
    const result = await getTasks({ page: 1 }, ctx)
    expect(result.items.length).toBeGreaterThan(0)
  })

  it('errors include retryable flag', async () => {
    updateApiConfig({ failureMode: 'always', retryableFailureRate: 1 })
    try {
      await getTasks({ page: 1 }, ctx)
    } catch (err) {
      expect(err).toBeInstanceOf(MockApiError)
      expect((err as MockApiError).retryable).toBe(true)
    }
  })
})
