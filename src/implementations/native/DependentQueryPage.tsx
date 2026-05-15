import { Spin, Alert, Typography, Descriptions } from 'antd'
import { useNativeQuery } from './useNativeQuery'
import { getCurrentUser, getTasksForUser } from '../../api/mockApi'
import { TaskTable } from '../../shared/components/TaskTable'
import { useResearchScenario } from '../../shared/hooks/useResearchScenario'
import type { User, Task, PaginatedResponse, RequestContext } from '../../api/types'

function buildContext(): RequestContext {
  return { implementation: 'native', scenario: 's8-dependent-query' }
}

export function NativeDependentQueryPage() {
  const userQuery = useNativeQuery<User>({
    cacheKey: 'native:dependent:user',
    queryFn: () => getCurrentUser(buildContext()),
    staleTimeMs: 10000,
  })

  const tasksQuery = useNativeQuery<PaginatedResponse<Task>>({
    cacheKey: `native:dependent:tasks:${userQuery.data?.id ?? 'pending'}`,
    queryFn: () => getTasksForUser(userQuery.data!.id, buildContext()),
    enabled: Boolean(userQuery.data?.id),
    staleTimeMs: 10000,
  })

  useResearchScenario('native', 's8-dependent-query', !!tasksQuery.data)

  if (userQuery.isLoading) return <Spin tip="Loading user..." />
  if (userQuery.error) return <Alert type="error" message={userQuery.error.message} />

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
      {tasksQuery.error && <Alert type="error" message={tasksQuery.error.message} />}
      {tasksQuery.data && (
        <TaskTable
          tasks={tasksQuery.data.items}
          implementation="native"
        />
      )}
    </div>
  )
}
