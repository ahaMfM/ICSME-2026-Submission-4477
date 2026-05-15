import { useQuery } from '@tanstack/react-query'
import { Button, Alert, Space, Typography } from 'antd'
import { getTasks } from '../../api/mockApi'
import { taskKeys } from './queryKeys'
import { TaskTable } from '../../shared/components/TaskTable'
import { recordManualRefetch } from '../../research/metrics'
import { useResearchScenario } from '../../shared/hooks/useResearchScenario'
import type { RequestContext } from '../../api/types'

function buildContext(): RequestContext {
  return { implementation: 'tanstack-query', scenario: 's9-manual-refetch' }
}

export function TanStackManualRefetchPage() {
  const query = useQuery({
    queryKey: taskKeys.manualRefetch(),
    queryFn: () => getTasks({ page: 1, pageSize: 6 }, buildContext()),
    staleTime: 30000,
  })

  useResearchScenario('tanstack-query', 's9-manual-refetch', !!query.data)

  return (
    <div>
      <Typography.Paragraph type="secondary">
        Data is cached with a long stale time (30s). Press Refetch to manually
        re-fetch from the server. TanStack Query issues a single request and
        updates all subscribers sharing this query key.
      </Typography.Paragraph>

      <Space style={{ marginBottom: 16 }}>
        <Button
          onClick={() => {
            recordManualRefetch('tanstack-query')
            void query.refetch()
          }}
          loading={query.isFetching}
        >
          Refetch
        </Button>
        <Typography.Text type="secondary">
          {query.isFetching ? 'Fetching...' : 'Idle'}
        </Typography.Text>
      </Space>

      {query.error && (
        <Alert
          type="error"
          message={(query.error as Error).message}
          style={{ marginBottom: 16 }}
        />
      )}

      <TaskTable
        tasks={query.data?.items ?? []}
        loading={query.isLoading}
        implementation="tanstack-query"
      />
    </div>
  )
}
