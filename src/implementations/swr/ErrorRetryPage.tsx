import { useState } from 'react'
import useSWR from 'swr'
import { Button, Switch, Space, Alert } from 'antd'
import { getTasks } from '../../api/mockApi'
import { TaskTable } from '../../shared/components/TaskTable'
import { FailureModeControls } from '../../shared/components/FailureModeControls'
import { recordManualRefetch } from '../../research/metrics'
import { useResearchScenario } from '../../shared/hooks/useResearchScenario'
import type { RequestContext } from '../../api/types'

function buildContext(): RequestContext {
  return { implementation: 'swr', scenario: 's10-s11-error-retry' }
}

export function SwrErrorRetryPage() {
  const [backgroundRefresh, setBackgroundRefresh] = useState(false)

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    ['swr', 'error-list'],
    () => getTasks({ page: 1, pageSize: 5 }, buildContext()),
    {
      refreshInterval: backgroundRefresh ? 5000 : 0,
    },
  )

  useResearchScenario('swr', 's10-s11-error-retry', !!data)

  return (
    <div>
      <FailureModeControls />

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
        <Switch
          checked={backgroundRefresh}
          onChange={setBackgroundRefresh}
          checkedChildren="BG Refresh ON"
          unCheckedChildren="BG Refresh OFF"
        />
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
