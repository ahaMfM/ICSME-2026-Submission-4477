import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Switch, Space, Typography } from 'antd'
import { getTasks } from '../../api/mockApi'
import { taskKeys } from './queryKeys'
import { TaskTable } from '../../shared/components/TaskTable'
import { useResearchScenario } from '../../shared/hooks/useResearchScenario'
import type { RequestContext } from '../../api/types'

function buildContext(observer?: string): RequestContext {
  return { implementation: 'tanstack-query', scenario: 's1-task-list', observer }
}

function TaskListObserver({ search, observer }: { search: string; observer: string }) {
  const query = useQuery({
    queryKey: taskKeys.list(search),
    queryFn: () =>
      getTasks({ page: 1, pageSize: 6, search: search || undefined }, buildContext(observer)),
  })

  useResearchScenario('tanstack-query', 's1-task-list', !!query.data)

  return (
    <div style={{ marginTop: 8 }}>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        Observer: {observer}
      </Typography.Text>
      <TaskTable
        tasks={query.data?.items ?? []}
        loading={query.isLoading}
        implementation="tanstack-query"
      />
    </div>
  )
}

export function TanStackTaskListPage() {
  const [search, setSearch] = useState('')
  const [showSecondary, setShowSecondary] = useState(false)

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <input
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '4px 8px' }}
        />
        <Switch
          checked={showSecondary}
          onChange={setShowSecondary}
          checkedChildren="2 observers"
          unCheckedChildren="1 observer"
        />
      </Space>

      <TaskListObserver search={search} observer="primary" />
      {showSecondary && <TaskListObserver search={search} observer="secondary" />}
    </div>
  )
}
