import { useState } from 'react'
import { Switch, Space, Typography } from 'antd'
import { useNativeQuery } from './useNativeQuery'
import { getTasks } from '../../api/mockApi'
import { TaskTable } from '../../shared/components/TaskTable'
import { useResearchScenario } from '../../shared/hooks/useResearchScenario'
import type { PaginatedResponse, Task, RequestContext } from '../../api/types'

function buildContext(observer?: string): RequestContext {
  return { implementation: 'native', scenario: 's1-task-list', observer }
}

function TaskListObserver({ search, observer }: { search: string; observer: string }) {
  const query = useNativeQuery<PaginatedResponse<Task>>({
    cacheKey: `native:tasks:list:${search}`,
    queryFn: () =>
      getTasks({ page: 1, pageSize: 6, search: search || undefined }, buildContext(observer)),
    staleTimeMs: 5000,
  })

  useResearchScenario('native', 's1-task-list', !!query.data)

  return (
    <div style={{ marginTop: 8 }}>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        Observer: {observer}
      </Typography.Text>
      <TaskTable
        tasks={query.data?.items ?? []}
        loading={query.isLoading}
        implementation="native"
      />
    </div>
  )
}

export function NativeTaskListPage() {
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
