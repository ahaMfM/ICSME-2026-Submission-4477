import { useState } from 'react'
import useSWR from 'swr'
import { Alert, Typography, message } from 'antd'
import { getTasks, toggleTaskCompletion } from '../../api/mockApi'
import { TaskTable } from '../../shared/components/TaskTable'
import { recordMutation } from '../../research/metrics'
import { useResearchScenario } from '../../shared/hooks/useResearchScenario'
import type { Task, RequestContext } from '../../api/types'

function buildContext(): RequestContext {
  return { implementation: 'swr', scenario: 's6-optimistic-update' }
}

export function SwrOptimisticUpdatePage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const { data, error, isLoading, mutate } = useSWR(
    ['swr', 'optimistic', 'list'],
    () => getTasks({ page: 1, pageSize: 10 }, buildContext()),
  )

  useResearchScenario('swr', 's6-optimistic-update', !!data)

  async function handleOptimisticToggle(task: Task) {
    const optimisticData = data
      ? {
          ...data,
          items: data.items.map((t) =>
            t.id === task.id ? { ...t, completed: !t.completed } : t,
          ),
        }
      : data

    try {
      await mutate(optimisticData, { revalidate: false })
      await toggleTaskCompletion(task.id, buildContext())
      recordMutation('swr')
      await mutate()
    } catch {
      await mutate(data, { revalidate: false })
      message.error('Toggle failed — rolled back')
    }
  }

  return (
    <div>
      <Typography.Paragraph type="secondary">
        Toggle a task's completion status. SWR uses <code>mutate(optimisticData,
        {'{'} revalidate: false {'}'})</code> for the immediate update, then a manual
        try/catch to roll back on failure.
      </Typography.Paragraph>

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
        onToggle={handleOptimisticToggle}
        onSelect={setSelectedTask}
        selectedTaskId={selectedTask?.id}
      />
    </div>
  )
}
