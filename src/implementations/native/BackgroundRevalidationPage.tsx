import { useState } from 'react'
import { Switch, Space, Alert, Typography } from 'antd'
import { useNativeQuery } from './useNativeQuery'
import { getTasks } from '../../api/mockApi'
import { TaskTable } from '../../shared/components/TaskTable'
import { useResearchScenario } from '../../shared/hooks/useResearchScenario'
import type { PaginatedResponse, Task, RequestContext } from '../../api/types'

function buildContext(): RequestContext {
  return { implementation: 'native', scenario: 's12-background-revalidation' }
}

export function NativeBackgroundRevalidationPage() {
  const [enabled, setEnabled] = useState(false)

  const query = useNativeQuery<PaginatedResponse<Task>>({
    cacheKey: 'native:bg-revalidation:list',
    queryFn: () => getTasks({ page: 1, pageSize: 6 }, buildContext()),
    staleTimeMs: 0,
    backgroundRefreshMs: enabled ? 5000 : undefined,
  })

  useResearchScenario('native', 's12-background-revalidation', !!query.data)

  return (
    <div>
      <Typography.Paragraph type="secondary">
        Enable background revalidation to automatically re-fetch data every 5 seconds.
        The native implementation uses <code>setInterval</code> inside the custom hook.
        Watch the request log for periodic requests.
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
