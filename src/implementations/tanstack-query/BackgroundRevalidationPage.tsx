import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Switch, Space, Alert, Typography } from 'antd'
import { getTasks } from '../../api/mockApi'
import { taskKeys } from './queryKeys'
import { TaskTable } from '../../shared/components/TaskTable'
import { useResearchScenario } from '../../shared/hooks/useResearchScenario'
import type { RequestContext } from '../../api/types'

function buildContext(): RequestContext {
  return { implementation: 'tanstack-query', scenario: 's12-background-revalidation' }
}

export function TanStackBackgroundRevalidationPage() {
  const [enabled, setEnabled] = useState(false)

  const query = useQuery({
    queryKey: taskKeys.bgRevalidation(),
    queryFn: () => getTasks({ page: 1, pageSize: 6 }, buildContext()),
    staleTime: 0,
    refetchInterval: enabled ? 5000 : false,
  })

  useResearchScenario('tanstack-query', 's12-background-revalidation', !!query.data)

  return (
    <div>
      <Typography.Paragraph type="secondary">
        Enable background revalidation to automatically re-fetch every 5 seconds.
        TanStack Query uses the <code>refetchInterval</code> option — no manual
        interval management required. Watch the request log for periodic requests.
      </Typography.Paragraph>

      <Space style={{ marginBottom: 16 }}>
        <Switch
          checked={enabled}
          onChange={setEnabled}
          checkedChildren="Every 5s"
          unCheckedChildren="Disabled"
        />
        <Typography.Text type="secondary">
          {query.isFetching ? 'Revalidating...' : 'Idle'}
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
