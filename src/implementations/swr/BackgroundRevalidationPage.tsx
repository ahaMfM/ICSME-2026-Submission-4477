import { useState } from 'react'
import useSWR from 'swr'
import { Switch, Space, Alert, Typography } from 'antd'
import { getTasks } from '../../api/mockApi'
import { TaskTable } from '../../shared/components/TaskTable'
import { useResearchScenario } from '../../shared/hooks/useResearchScenario'
import type { RequestContext } from '../../api/types'

function buildContext(): RequestContext {
  return { implementation: 'swr', scenario: 's12-background-revalidation' }
}

export function SwrBackgroundRevalidationPage() {
  const [enabled, setEnabled] = useState(false)

  const { data, error, isLoading, isValidating } = useSWR(
    ['swr', 'bg-revalidation', 'list'],
    () => getTasks({ page: 1, pageSize: 6 }, buildContext()),
    { refreshInterval: enabled ? 5000 : 0 },
  )

  useResearchScenario('swr', 's12-background-revalidation', !!data)

  return (
    <div>
      <Typography.Paragraph type="secondary">
        Enable background revalidation to automatically re-fetch every 5 seconds.
        SWR uses the <code>refreshInterval</code> option. The stale-while-revalidate
        pattern serves cached data immediately while the background fetch proceeds.
      </Typography.Paragraph>

      <Space style={{ marginBottom: 16 }}>
        <Switch
          checked={enabled}
          onChange={setEnabled}
          checkedChildren="Every 5s"
          unCheckedChildren="Disabled"
        />
        <Typography.Text type="secondary">
          {isValidating ? 'Revalidating...' : 'Idle'}
        </Typography.Text>
      </Space>

      {error && (
        <Alert
          type="error"
          message={(error as Error).message}
          style={{ marginBottom: 16 }}
        />
      )}

      <TaskTable
        tasks={data?.items ?? []}
        loading={isLoading}
        implementation="swr"
      />
    </div>
  )
}
