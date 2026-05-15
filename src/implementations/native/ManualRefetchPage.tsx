import { Button, Alert, Space, Typography } from 'antd'
import { useNativeQuery } from './useNativeQuery'
import { invalidateNativeCache } from './nativeCache'
import { getTasks } from '../../api/mockApi'
import { TaskTable } from '../../shared/components/TaskTable'
import { recordManualRefetch } from '../../research/metrics'
import { useResearchScenario } from '../../shared/hooks/useResearchScenario'
import type { PaginatedResponse, Task, RequestContext } from '../../api/types'

function buildContext(): RequestContext {
  return { implementation: 'native', scenario: 's9-manual-refetch' }
}

export function NativeManualRefetchPage() {
  const query = useNativeQuery<PaginatedResponse<Task>>({
    cacheKey: 'native:manual-refetch:list',
    queryFn: () => getTasks({ page: 1, pageSize: 6 }, buildContext()),
    staleTimeMs: 30000,
  })

  useResearchScenario('native', 's9-manual-refetch', !!query.data)

  function handleRefetch() {
    recordManualRefetch('native')
    invalidateNativeCache('native:manual-refetch')
    void query.refetch()
  }

  return (
    <div>
      <Typography.Paragraph type="secondary">
        Data is cached with a long stale time (30s). Press Refetch to manually
        invalidate the cache and re-fetch from the server. Watch the request log
        for a single new request per click.
      </Typography.Paragraph>

      <Space style={{ marginBottom: 16 }}>
        <Button onClick={handleRefetch} loading={query.isFetching}>
          Refetch
        </Button>
        <Typography.Text type="secondary">
          {query.isFetching ? 'Fetching...' : 'Idle'}
        </Typography.Text>
      </Space>

      {query.error && (
        <Alert type="error" message={query.error.message} style={{ marginBottom: 16 }} />
      )}

      <TaskTable
        tasks={query.data?.items ?? []}
        loading={query.isLoading}
        implementation="native"
      />
    </div>
  )
}
