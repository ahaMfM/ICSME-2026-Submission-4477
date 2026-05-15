import useSWR from 'swr'
import { Spin, Alert, Typography, Descriptions } from 'antd'
import { getCurrentUser, getTasksForUser } from '../../api/mockApi'
import { TaskTable } from '../../shared/components/TaskTable'
import { useResearchScenario } from '../../shared/hooks/useResearchScenario'
import type { RequestContext } from '../../api/types'

function buildContext(): RequestContext {
  return { implementation: 'swr', scenario: 's8-dependent-query' }
}

export function SwrDependentQueryPage() {
  const userQuery = useSWR(['swr', 'current-user'], () =>
    getCurrentUser(buildContext()),
  )

  const tasksQuery = useSWR(
    userQuery.data?.id ? ['swr', 'tasks-for-user', userQuery.data.id] : null,
    ([, , userId]) => getTasksForUser(userId, buildContext()),
  )

  useResearchScenario('swr', 's8-dependent-query', !!tasksQuery.data)

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
        <TaskTable tasks={tasksQuery.data.items} implementation="swr" />
      )}
    </div>
  )
}
