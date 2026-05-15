import useSWR from 'swr'
import { Button, Alert, Space, Typography } from 'antd'
import { getTasks } from '../../api/mockApi'
import { TaskTable } from '../../shared/components/TaskTable'
import { recordManualRefetch } from '../../research/metrics'
import { useResearchScenario } from '../../shared/hooks/useResearchScenario'
import type { RequestContext } from '../../api/types'

function buildContext(): RequestContext {
  return { implementation: 'swr', scenario: 's9-manual-refetch' }
}

export function SwrManualRefetchPage() {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    ['swr', 'manual-refetch', 'list'],
    () => getTasks({ page: 1, pageSize: 6 }, buildContext()),
    { revalidateOnFocus: false, dedupingInterval: 0 },
  )

  useResearchScenario('swr', 's9-manual-refetch', !!data)

  return (
    <div>
      <Typography.Paragraph type="secondary">
        Data is cached until manually revalidated. Press Refetch to call{' '}
        <code>mutate()</code> which triggers a single re-fetch and updates
        all subscribers. Watch the request log for one request per click.
      </Typography.Paragraph>

      <Space style={{ marginBottom: 16 }}>
        <Button
          onClick={() => {
            recordManualRefetch('swr')
            void mutate()
          }}
          loading={isValidating}
        >
          Refetch
        </Button>
        <Typography.Text type="secondary">
          {isValidating ? 'Fetching...' : 'Idle'}
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
