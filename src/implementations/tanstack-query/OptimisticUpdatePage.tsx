import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert, Typography, message } from 'antd'
import { getTasks, toggleTaskCompletion } from '../../api/mockApi'
import { taskKeys } from './queryKeys'
import { TaskTable } from '../../shared/components/TaskTable'
import { recordMutation } from '../../research/metrics'
import { useResearchScenario } from '../../shared/hooks/useResearchScenario'
import type { Task, PaginatedResponse, RequestContext } from '../../api/types'

function buildContext(): RequestContext {
  return { implementation: 'tanstack-query', scenario: 's6-optimistic-update' }
}

export function TanStackOptimisticUpdatePage() {
  const queryClient = useQueryClient()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const listQuery = useQuery({
    queryKey: taskKeys.optimisticList(),
    queryFn: () => getTasks({ page: 1, pageSize: 10 }, buildContext()),
  })

  useResearchScenario('tanstack-query', 's6-optimistic-update', !!listQuery.data)

  const toggleMutation = useMutation({
    mutationFn: (taskId: string) => toggleTaskCompletion(taskId, buildContext()),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.optimisticList() })
      const previous = queryClient.getQueryData<PaginatedResponse<Task>>(
        taskKeys.optimisticList(),
      )
      queryClient.setQueryData<PaginatedResponse<Task>>(
        taskKeys.optimisticList(),
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
        queryClient.setQueryData(taskKeys.optimisticList(), context.previous)
      }
      message.error('Toggle failed — rolled back')
    },
    onSettled: () => {
      recordMutation('tanstack-query')
      void queryClient.invalidateQueries({ queryKey: taskKeys.optimisticList() })
    },
  })

  return (
    <div>
      <Typography.Paragraph type="secondary">
        Toggle a task's completion status. TanStack Query's <code>onMutate</code> captures
        previous state as context, <code>onError</code> restores it automatically,
        and <code>onSettled</code> invalidates the query to confirm with the server.
      </Typography.Paragraph>

      {listQuery.error && (
        <Alert
          type="error"
          message={(listQuery.error as Error).message}
          style={{ marginBottom: 16 }}
        />
      )}

      <TaskTable
        tasks={listQuery.data?.items ?? []}
        loading={listQuery.isLoading}
        implementation="tanstack-query"
        onToggle={(task) => toggleMutation.mutate(task.id)}
        onSelect={setSelectedTask}
        selectedTaskId={selectedTask?.id}
      />
    </div>
  )
}
