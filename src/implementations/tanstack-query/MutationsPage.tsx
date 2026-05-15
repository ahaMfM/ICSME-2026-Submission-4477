import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert, Typography, message } from 'antd'
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
} from '../../api/mockApi'
import { taskKeys } from './queryKeys'
import { TaskTable } from '../../shared/components/TaskTable'
import { TaskForm } from '../../shared/components/TaskForm'
import { recordMutation } from '../../research/metrics'
import { useResearchScenario } from '../../shared/hooks/useResearchScenario'
import type { Task, TaskInput, PaginatedResponse, RequestContext } from '../../api/types'

function buildContext(): RequestContext {
  return { implementation: 'tanstack-query', scenario: 's3-s5-mutations' }
}

export function TanStackMutationsPage() {
  const queryClient = useQueryClient()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const listQuery = useQuery({
    queryKey: taskKeys.mutationList(),
    queryFn: () => getTasks({ page: 1, pageSize: 10 }, buildContext()),
  })

  useResearchScenario('tanstack-query', 's3-s5-mutations', !!listQuery.data)

  const createMutation = useMutation({
    mutationFn: (input: TaskInput) => createTask(input, buildContext()),
    onSuccess: () => {
      recordMutation('tanstack-query')
      void queryClient.invalidateQueries({ queryKey: taskKeys.mutationList() })
      message.success('Task created')
    },
    onError: (err) => message.error(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: TaskInput }) =>
      updateTask(id, input, buildContext()),
    onSuccess: () => {
      recordMutation('tanstack-query')
      setSelectedTask(null)
      void queryClient.invalidateQueries({ queryKey: taskKeys.mutationList() })
      message.success('Task updated')
    },
    onError: (err) => message.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTask(id, buildContext()),
    onSuccess: () => {
      recordMutation('tanstack-query')
      void queryClient.invalidateQueries({ queryKey: taskKeys.mutationList() })
      message.success('Task deleted')
    },
    onError: (err) => message.error(err.message),
  })

  const toggleMutation = useMutation({
    mutationFn: (taskId: string) => toggleTaskCompletion(taskId, buildContext()),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.mutationList() })
      const previous = queryClient.getQueryData<PaginatedResponse<Task>>(
        taskKeys.mutationList(),
      )
      queryClient.setQueryData<PaginatedResponse<Task>>(
        taskKeys.mutationList(),
        (old) =>
          old
            ? {
                ...old,
                items: old.items.map((t) =>
                  t.id === taskId ? { ...t, completed: !t.completed } : t,
                ),
              }
            : old,
      )
      return { previous }
    },
    onError: (_err, _taskId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(taskKeys.mutationList(), context.previous)
      }
      message.error('Toggle failed — rolled back')
    },
    onSettled: () => {
      recordMutation('tanstack-query')
      void queryClient.invalidateQueries({ queryKey: taskKeys.mutationList() })
    },
  })

  function handleSubmit(input: TaskInput) {
    if (selectedTask) {
      updateMutation.mutate({ id: selectedTask.id, input })
    } else {
      createMutation.mutate(input)
    }
  }

  return (
    <div>
      <Typography.Title level={5}>
        {selectedTask ? 'Update Task' : 'Create Task'}
      </Typography.Title>
      <TaskForm
        onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
        initialValues={selectedTask ?? undefined}
        submitLabel={selectedTask ? 'Update' : 'Create'}
      />

      {listQuery.error && (
        <Alert
          type="error"
          message={(listQuery.error as Error).message}
          style={{ margin: '16px 0' }}
        />
      )}

      <TaskTable
        tasks={listQuery.data?.items ?? []}
        loading={listQuery.isLoading}
        implementation="tanstack-query"
        onToggle={(task) => toggleMutation.mutate(task.id)}
        onDelete={(task) => deleteMutation.mutate(task.id)}
        onSelect={setSelectedTask}
        selectedTaskId={selectedTask?.id}
      />
    </div>
  )
}
