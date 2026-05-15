import { describe, it, expect, beforeEach } from 'vitest'
import {
  beginRequest,
  finalizeRequest,
  getRequestLogSnapshot,
  resetRequestLog,
} from '../api/requestLogger'

beforeEach(() => {
  resetRequestLog()
})

describe('request logging', () => {
  it('records a successful request', () => {
    const { requestId, startTime, concurrentDuplicate, repeatedWithinWindow } =
      beginRequest('getTasks', { page: 1 })

    finalizeRequest(
      requestId,
      'getTasks',
      { page: 1 },
      { implementation: 'native', scenario: 'task-list' },
      startTime,
      true,
      0,
      concurrentDuplicate,
      repeatedWithinWindow,
    )

    const entries = getRequestLogSnapshot()
    expect(entries).toHaveLength(1)
    expect(entries[0]!.endpoint).toBe('getTasks')
    expect(entries[0]!.success).toBe(true)
  })

  it('detects concurrent duplicates', () => {
    const first = beginRequest('getTasks', { page: 1 })
    const second = beginRequest('getTasks', { page: 1 })

    expect(first.concurrentDuplicate).toBe(false)
    expect(second.concurrentDuplicate).toBe(true)

    finalizeRequest(
      first.requestId,
      'getTasks',
      { page: 1 },
      { implementation: 'native', scenario: 'task-list' },
      first.startTime,
      true,
      0,
      first.concurrentDuplicate,
      first.repeatedWithinWindow,
    )
    finalizeRequest(
      second.requestId,
      'getTasks',
      { page: 1 },
      { implementation: 'native', scenario: 'task-list' },
      second.startTime,
      true,
      0,
      second.concurrentDuplicate,
      second.repeatedWithinWindow,
    )

    const entries = getRequestLogSnapshot()
    expect(entries[0]!.concurrentDuplicate).toBe(true)
    expect(entries[1]!.concurrentDuplicate).toBe(false)
  })

  it('detects repeated requests within window', () => {
    const first = beginRequest('getTasks', { page: 1 })
    finalizeRequest(
      first.requestId,
      'getTasks',
      { page: 1 },
      { implementation: 'native', scenario: 'task-list' },
      first.startTime,
      true,
      0,
      false,
      false,
    )

    const second = beginRequest('getTasks', { page: 1 })
    expect(second.repeatedWithinWindow).toBe(true)
  })

  it('classifies mutations correctly', () => {
    const { requestId, startTime } = beginRequest('createTask', { title: 'Test' })
    finalizeRequest(
      requestId,
      'createTask',
      { title: 'Test' },
      { implementation: 'native', scenario: 'mutations' },
      startTime,
      true,
      0,
      false,
      false,
    )

    const entries = getRequestLogSnapshot()
    expect(entries[0]!.isMutation).toBe(true)
  })

  it('does not classify reads as mutations', () => {
    const { requestId, startTime } = beginRequest('getTasks', { page: 1 })
    finalizeRequest(
      requestId,
      'getTasks',
      { page: 1 },
      { implementation: 'native', scenario: 'task-list' },
      startTime,
      true,
      0,
      false,
      false,
    )

    const entries = getRequestLogSnapshot()
    expect(entries[0]!.isMutation).toBe(false)
  })
})
