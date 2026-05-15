import { useQuery } from '@tanstack/react-query'
import { Spin, Alert, Typography, Descriptions } from 'antd'
import { getCurrentUser, getTasksForUser } from '../../api/mockApi'
import { taskKeys } from './queryKeys'
import { TaskTable } from '../../shared/components/TaskTable'
import { useResearchScenario } from '../../shared/hooks/useResearchScenario'
import type { RequestContext } from '../../api/types'

function buildContext(): RequestContext {
  return { implementation: 'tanstack-query', scenario: 's8-dependent-query' }
}

export function TanStackDependentQueryPage() {
  const userQuery = useQuery({
    queryKey: taskKeys.currentUser(),
    queryFn: () => getCurrentUser(buildContext()),
  })

  const tasksQuery = useQuery({
    queryKey: taskKeys.tasksForUser(userQuery.data?.id ?? 'pending'),
    queryFn: () => getTasksForUser(userQuery.data!.id, buildContext()),
    enabled: Boolean(userQuery.data?.id),
  })

  useResearchScenario('tanstack-query', 's8-dependent-query', !!tasksQuery.data)

  if (userQuery.isLoading) return <Spin tip="Loading user..." />
  if (userQuery.error)
    return <Alert type="error" message={(userQuery.error as Error).message} />

  return (
    <div>
      {userQuery.data && (
        <Descriptions size="small" style={{ marginBottom: 16 }}>
          <Descriptions.Item label="User">{userQuery.data.name}</Descriptions.Item>
          <Descriptions.Item label="Email">{userQuery.data.email}</Descriptions.Item>
        </Descriptions>
      )}

      <Typography.Title level={5}>Tasks for {userQuery.data?.name}</Typography.Title>

      {tasksQuery.isLoading && <Spin />}
      {tasksQuery.error && (
        <Alert type="error" message={(tasksQuery.error as Error).message} />
      )}
      {tasksQuery.data && (
        <TaskTable tasks={tasksQuery.data.items} implementation="tanstack-query" />
      )}
    </div>
  )
}
