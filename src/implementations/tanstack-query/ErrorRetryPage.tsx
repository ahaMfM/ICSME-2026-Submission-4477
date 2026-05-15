import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, Switch, Space, Alert } from 'antd'
import { getTasks } from '../../api/mockApi'
import { taskKeys } from './queryKeys'
import { TaskTable } from '../../shared/components/TaskTable'
import { FailureModeControls } from '../../shared/components/FailureModeControls'
import { recordManualRefetch } from '../../research/metrics'
import { useResearchScenario } from '../../shared/hooks/useResearchScenario'
import type { RequestContext } from '../../api/types'

function buildContext(): RequestContext {
  return { implementation: 'tanstack-query', scenario: 's10-s11-error-retry' }
}

export function TanStackErrorRetryPage() {
  const [backgroundRefresh, setBackgroundRefresh] = useState(false)

  const query = useQuery({
    queryKey: taskKeys.errorList(),
    queryFn: () => getTasks({ page: 1, pageSize: 5 }, buildContext()),
    staleTime: 0,
    refetchInterval: backgroundRefresh ? 5000 : false,
  })

  useResearchScenario('tanstack-query', 's10-s11-error-retry', !!query.data)

  return (
    <div>
      <FailureModeControls />

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
        <Switch
          checked={backgroundRefresh}
          onChange={setBackgroundRefresh}
          checkedChildren="BG Refresh ON"
          unCheckedChildren="BG Refresh OFF"
        />
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
