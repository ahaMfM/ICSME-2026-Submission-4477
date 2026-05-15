import { useState, useCallback } from 'react'
import { Button, Space, Alert, Spin, Typography } from 'antd'
import { getTasks } from '../../api/mockApi'
import { TaskTable } from '../../shared/components/TaskTable'
import { useResearchScenario } from '../../shared/hooks/useResearchScenario'
import type { Task, RequestContext } from '../../api/types'

function buildContext(): RequestContext {
  return { implementation: 'native', scenario: 's7-pagination' }
}

export function NativePaginationPage() {
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<Task[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useResearchScenario('native', 's7-pagination', items.length > 0)

  const loadPage = useCallback(async (targetPage: number, reset = false) => {
    setIsFetching(true)
    setError(null)
    try {
      const response = await getTasks(
        { page: targetPage, pageSize: 5 },
        buildContext(),
      )
      setPage(targetPage)
      setHasMore(response.hasMore)
      setItems((current) => {
        if (reset) return response.items
        const byId = new Map(current.map((item) => [item.id, item]))
        response.items.forEach((item) => byId.set(item.id, item))
        return Array.from(byId.values())
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsFetching(false)
    }
  }, [])

  const handleLoadFirst = () => void loadPage(1, true)
  const handleLoadNext = () => void loadPage(page + 1)

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={handleLoadFirst} loading={isFetching && page === 1}>
          Load First Page
        </Button>
        <Button
          onClick={handleLoadNext}
          disabled={!hasMore}
          loading={isFetching && page > 1}
        >
          Load Next Page
        </Button>
        <Typography.Text type="secondary">
          Page {page} | {items.length} items loaded
        </Typography.Text>
      </Space>

      {error && <Alert type="error" message={error.message} style={{ marginBottom: 16 }} />}

      {isFetching && items.length === 0 ? (
        <Spin />
      ) : (
        <TaskTable tasks={items} implementation="native" />
      )}
    </div>
  )
}
