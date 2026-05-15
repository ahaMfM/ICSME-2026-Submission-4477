import { useInfiniteQuery } from '@tanstack/react-query'
import { Button, Space, Alert, Spin, Typography } from 'antd'
import { getTasks } from '../../api/mockApi'
import { taskKeys } from './queryKeys'
import { TaskTable } from '../../shared/components/TaskTable'
import { useResearchScenario } from '../../shared/hooks/useResearchScenario'
import type { RequestContext } from '../../api/types'

function buildContext(): RequestContext {
  return { implementation: 'tanstack-query', scenario: 's7-pagination' }
}

export function TanStackPaginationPage() {
  const query = useInfiniteQuery({
    queryKey: taskKeys.infinite(),
    queryFn: ({ pageParam }) =>
      getTasks({ page: pageParam, pageSize: 5 }, buildContext()),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
  })

  const items = query.data?.pages.flatMap((page) => page.items) ?? []
  useResearchScenario('tanstack-query', 's7-pagination', items.length > 0)

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          onClick={() => void query.fetchNextPage()}
          disabled={!query.hasNextPage}
          loading={query.isFetchingNextPage}
        >
          Load Next Page
        </Button>
        <Typography.Text type="secondary">
          {query.data?.pages.length ?? 0} pages | {items.length} items loaded
        </Typography.Text>
      </Space>

      {query.error && (
        <Alert
          type="error"
          message={(query.error as Error).message}
          style={{ marginBottom: 16 }}
        />
      )}

      {query.isLoading ? (
        <Spin />
      ) : (
        <TaskTable tasks={items} implementation="tanstack-query" />
      )}
    </div>
  )
}
