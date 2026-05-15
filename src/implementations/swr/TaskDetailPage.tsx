import useSWR from 'swr'
import { Button, Descriptions, Alert, Spin } from 'antd'
import { getTaskById } from '../../api/mockApi'
import { recordManualRefetch } from '../../research/metrics'
import { useResearchScenario } from '../../shared/hooks/useResearchScenario'
import type { RequestContext } from '../../api/types'

function buildContext(): RequestContext {
  return { implementation: 'swr', scenario: 's2-task-detail' }
}

interface Props {
  taskId: string
}

export function SwrTaskDetailPage({ taskId }: Props) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    ['swr', 'task-detail', taskId],
    () => getTaskById(taskId, buildContext()),
  )

  useResearchScenario('swr', 's2-task-detail', !!data)

  if (isLoading) return <Spin />
  if (error) return <Alert type="error" message={(error as Error).message} />
  if (!data) return null

  return (
    <div>
      <Button
        size="small"
        onClick={() => {
          recordManualRefetch('swr')
          void mutate()
        }}
        loading={isValidating}
        style={{ marginBottom: 16 }}
      >
        Refetch
      </Button>
      <Descriptions bordered size="small" column={2}>
        <Descriptions.Item label="Title">{data.title}</Descriptions.Item>
        <Descriptions.Item label="Priority">{data.priority}</Descriptions.Item>
        <Descriptions.Item label="Status">
          {data.completed ? 'Completed' : 'Pending'}
        </Descriptions.Item>
        <Descriptions.Item label="User">{data.userId}</Descriptions.Item>
        <Descriptions.Item label="Description" span={2}>
          {data.description}
        </Descriptions.Item>
      </Descriptions>
    </div>
  )
}
