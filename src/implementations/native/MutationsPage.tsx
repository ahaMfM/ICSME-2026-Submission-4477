import { useState } from 'react'
import { Alert, Typography, message } from 'antd'
import { useNativeQuery } from './useNativeQuery'
import { invalidateNativeCache } from './nativeCache'
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
import type { PaginatedResponse, Task, TaskInput, RequestContext } from '../../api/types'

function buildContext(): RequestContext {
  return { implementation: 'native', scenario: 's3-s5-mutations' }
}

export function NativeMutationsPage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const listQuery = useNativeQuery<PaginatedResponse<Task>>({
    cacheKey: 'native:mutations:list',
    queryFn: () => getTasks({ page: 1, pageSize: 10 }, buildContext()),
    staleTimeMs: 5000,
  })

  useResearchScenario('native', 's3-s5-mutations', !!listQuery.data)

  async function refreshList() {
    invalidateNativeCache('native:mutations')
    await listQuery.refetch()
  }

  async function handleCreate(input: TaskInput) {
    try {
      await createTask(input, buildContext())
      recordMutation('native')
      await refreshList()
      message.success('Task created')
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Create failed')
    }
  }

  async function handleUpdate(input: TaskInput) {
    if (!selectedTask) return
    try {
      await updateTask(selectedTask.id, input, buildContext())
      recordMutation('native')
      setSelectedTask(null)
      await refreshList()
      message.success('Task updated')
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Update failed')
    }
  }

  async function handleDelete(task: Task) {
    try {
      await deleteTask(task.id, buildContext())
      recordMutation('native')
      if (selectedTask?.id === task.id) setSelectedTask(null)
      await refreshList()
      message.success('Task deleted')
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Delete failed')
    }
  }

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
      await refreshList()
    } catch (err) {
      listQuery.setData((current) => ({
        ...current!,
        items: previousItems,
      }))
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

      {listQuery.error && (
        <Alert type="error" message={listQuery.error.message} style={{ margin: '16px 0' }} />
      )}

      <TaskTable
        tasks={listQuery.data?.items ?? []}
        loading={listQuery.isLoading}
        implementation="native"
        onToggle={handleOptimisticToggle}
        onDelete={handleDelete}
        onSelect={setSelectedTask}
        selectedTaskId={selectedTask?.id}
      />
    </div>
  )
}
