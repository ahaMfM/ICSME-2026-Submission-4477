import { useState } from 'react'
import { Button, Switch, Space, Alert } from 'antd'
import { useNativeQuery } from './useNativeQuery'
import { getTasks } from '../../api/mockApi'
import { TaskTable } from '../../shared/components/TaskTable'
import { FailureModeControls } from '../../shared/components/FailureModeControls'
import { recordManualRefetch } from '../../research/metrics'
import { useResearchScenario } from '../../shared/hooks/useResearchScenario'
import type { PaginatedResponse, Task, RequestContext } from '../../api/types'

function buildContext(): RequestContext {
  return { implementation: 'native', scenario: 's10-s11-error-retry' }
}

export function NativeErrorRetryPage() {
  const [backgroundRefresh, setBackgroundRefresh] = useState(false)

  const query = useNativeQuery<PaginatedResponse<Task>>({
    cacheKey: 'native:errors:list',
    queryFn: () => getTasks({ page: 1, pageSize: 5 }, buildContext()),
    staleTimeMs: 0,
    retry: 2,
    backgroundRefreshMs: backgroundRefresh ? 5000 : undefined,
  })

  useResearchScenario('native', 's10-s11-error-retry', !!query.data)

  return (
    <div>
      <FailureModeControls />

      <Space style={{ marginBottom: 16 }}>
        <Button
          onClick={() => {
            recordManualRefetch('native')
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
