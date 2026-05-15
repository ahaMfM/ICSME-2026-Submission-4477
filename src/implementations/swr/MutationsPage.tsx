import { useState } from 'react'
import useSWR from 'swr'
import { Alert, Typography, message } from 'antd'
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
} from '../../api/mockApi'
import { TaskTable } from '../../shared/components/TaskTable'
import { TaskForm } from '../../shared/components/TaskForm'
import { recordMutation } from '../../research/metrics'
import { useResearchScenario } from '../../shared/hooks/useResearchScenario'
import type { Task, TaskInput, RequestContext } from '../../api/types'

function buildContext(): RequestContext {
  return { implementation: 'swr', scenario: 's3-s5-mutations' }
}

export function SwrMutationsPage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const { data, error, isLoading, mutate } = useSWR(
    ['swr', 'mutations', 'list'],
    () => getTasks({ page: 1, pageSize: 10 }, buildContext()),
  )

  useResearchScenario('swr', 's3-s5-mutations', !!data)

  async function handleCreate(input: TaskInput) {
    try {
      await createTask(input, buildContext())
      recordMutation('swr')
      await mutate()
      message.success('Task created')
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Create failed')
    }
  }

  async function handleUpdate(input: TaskInput) {
    if (!selectedTask) return
    try {
      await updateTask(selectedTask.id, input, buildContext())
      recordMutation('swr')
      setSelectedTask(null)
      await mutate()
      message.success('Task updated')
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Update failed')
    }
  }

  async function handleDelete(task: Task) {
    try {
      await deleteTask(task.id, buildContext())
      recordMutation('swr')
      if (selectedTask?.id === task.id) setSelectedTask(null)
      await mutate()
      message.success('Task deleted')
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Delete failed')
    }
  }

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
    } catch (err) {
      await mutate(data, { revalidate: false })
      message.error('Toggle failed — rolled back')
    }
  }

  return (
    <div>
      <Typography.Title level={5}>
        {selectedTask ? 'Update Task' : 'Create Task'}
      </Typography.Title>
      <TaskForm
        onSubmit={selectedTask ? handleUpdate : handleCreate}
        initialValues={selectedTask ?? undefined}
        submitLabel={selectedTask ? 'Update' : 'Create'}
      />

      {error && (
        <Alert
          type="error"
          message={(error as Error).message}
          style={{ margin: '16px 0' }}
        />
      )}

      <TaskTable
        tasks={data?.items ?? []}
        loading={isLoading}
        implementation="swr"
        onToggle={handleOptimisticToggle}
        onDelete={handleDelete}
        onSelect={setSelectedTask}
        selectedTaskId={selectedTask?.id}
      />
    </div>
  )
}
