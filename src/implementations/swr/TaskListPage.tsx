import { useState } from 'react'
import useSWR from 'swr'
import { Switch, Space, Typography } from 'antd'
import { getTasks } from '../../api/mockApi'
import { TaskTable } from '../../shared/components/TaskTable'
import { useResearchScenario } from '../../shared/hooks/useResearchScenario'
import type { RequestContext } from '../../api/types'

function buildContext(observer?: string): RequestContext {
  return { implementation: 'swr', scenario: 's1-task-list', observer }
}

function TaskListObserver({ search, observer }: { search: string; observer: string }) {
  const { data, isLoading } = useSWR(
    ['swr', 'tasks', 'list', search],
    () => getTasks({ page: 1, pageSize: 6, search: search || undefined }, buildContext(observer)),
  )

  useResearchScenario('swr', 's1-task-list', !!data)

  return (
    <div style={{ marginTop: 8 }}>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        Observer: {observer}
      </Typography.Text>
      <TaskTable
        tasks={data?.items ?? []}
        loading={isLoading}
        implementation="swr"
      />
    </div>
  )
}

export function SwrTaskListPage() {
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
