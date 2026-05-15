import { useState } from 'react'
import { Alert, Typography, message } from 'antd'
import { useNativeQuery } from './useNativeQuery'
import { invalidateNativeCache } from './nativeCache'
import { getTasks, toggleTaskCompletion } from '../../api/mockApi'
import { TaskTable } from '../../shared/components/TaskTable'
import { recordMutation } from '../../research/metrics'
import { useResearchScenario } from '../../shared/hooks/useResearchScenario'
import type { PaginatedResponse, Task, RequestContext } from '../../api/types'

function buildContext(): RequestContext {
  return { implementation: 'native', scenario: 's6-optimistic-update' }
}

export function NativeOptimisticUpdatePage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const listQuery = useNativeQuery<PaginatedResponse<Task>>({
    cacheKey: 'native:optimistic:list',
    queryFn: () => getTasks({ page: 1, pageSize: 10 }, buildContext()),
    staleTimeMs: 5000,
  })

  useResearchScenario('native', 's6-optimistic-update', !!listQuery.data)

  async function handleOptimisticToggle(task: Task) {
    const previousItems = listQuery.data?.items ?? []

    listQuery.setData((current) => ({
      ...current!,
      items: current!.items.map((t) =>
        t.id === task.id ? { ...t, completed: !t.completed } : t,
      ),
    }))

    try {
      await toggleTaskCompletion(task.id, buildContext())
      recordMutation('native')
      invalidateNativeCache('native:optimistic')
      await listQuery.refetch()
    } catch {
      listQuery.setData((current) => ({
        ...current!,
        items: previousItems,
      }))
      message.error('Toggle failed — rolled back')
    }
  }

  return (
    <div>
      <Typography.Paragraph type="secondary">
        Toggle a task's completion status. The UI updates immediately (optimistic),
        then confirms with the server. On failure, the previous state is restored.
      </Typography.Paragraph>

      {listQuery.error && (
        <Alert type="error" message={listQuery.error.message} style={{ marginBottom: 16 }} />
      )}

      <TaskTable
        tasks={listQuery.data?.items ?? []}
        loading={listQuery.isLoading}
        implementation="native"
        onToggle={handleOptimisticToggle}
        onSelect={setSelectedTask}
        selectedTaskId={selectedTask?.id}
      />
    </div>
  )
}
