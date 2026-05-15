import { Button, Descriptions, Alert, Spin } from 'antd'
import { useNativeQuery } from './useNativeQuery'
import { getTaskById } from '../../api/mockApi'
import { recordManualRefetch } from '../../research/metrics'
import { useResearchScenario } from '../../shared/hooks/useResearchScenario'
import type { Task, RequestContext } from '../../api/types'

function buildContext(): RequestContext {
  return { implementation: 'native', scenario: 's2-task-detail' }
}

interface Props {
  taskId: string
}

export function NativeTaskDetailPage({ taskId }: Props) {
  const query = useNativeQuery<Task>({
    cacheKey: `native:task-detail:${taskId}`,
    queryFn: () => getTaskById(taskId, buildContext()),
    staleTimeMs: 10000,
  })

  useResearchScenario('native', 's2-task-detail', !!query.data)

  if (query.isLoading) return <Spin />
  if (query.error) return <Alert type="error" message={query.error.message} />
  if (!query.data) return null

  const task = query.data

  return (
    <div>
      <Button
        size="small"
        onClick={() => {
          recordManualRefetch('native')
          void query.refetch()
        }}
        loading={query.isFetching}
        style={{ marginBottom: 16 }}
      >
        Refetch
      </Button>
      <Descriptions bordered size="small" column={2}>
        <Descriptions.Item label="Title">{task.title}</Descriptions.Item>
        <Descriptions.Item label="Priority">{task.priority}</Descriptions.Item>
        <Descriptions.Item label="Status">
          {task.completed ? 'Completed' : 'Pending'}
        </Descriptions.Item>
        <Descriptions.Item label="User">{task.userId}</Descriptions.Item>
        <Descriptions.Item label="Description" span={2}>
          {task.description}
        </Descriptions.Item>
      </Descriptions>
    </div>
  )
}
