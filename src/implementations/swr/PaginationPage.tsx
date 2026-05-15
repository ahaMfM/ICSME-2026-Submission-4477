import useSWRInfinite from 'swr/infinite'
import { Button, Space, Alert, Spin, Typography } from 'antd'
import { getTasks } from '../../api/mockApi'
import { TaskTable } from '../../shared/components/TaskTable'
import { useResearchScenario } from '../../shared/hooks/useResearchScenario'
import type { PaginatedResponse, Task, RequestContext } from '../../api/types'

function buildContext(): RequestContext {
  return { implementation: 'swr', scenario: 's7-pagination' }
}

export function SwrPaginationPage() {
  const { data, error, isLoading, isValidating, size, setSize } = useSWRInfinite<
    PaginatedResponse<Task>
  >(
    (pageIndex, previousPageData) => {
      if (previousPageData && !previousPageData.hasMore) return null
      return ['swr', 'pagination', 'page', pageIndex + 1]
    },
    ([, , , page]) => getTasks({ page: page as number, pageSize: 5 }, buildContext()),
  )

  const items = data?.flatMap((page) => page.items) ?? []
  const hasMore = data ? data[data.length - 1]?.hasMore : true

  useResearchScenario('swr', 's7-pagination', items.length > 0)

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          onClick={() => void setSize(size + 1)}
          disabled={!hasMore}
          loading={isValidating}
        >
          Load Next Page
        </Button>
        <Typography.Text type="secondary">
          {size} pages | {items.length} items loaded
        </Typography.Text>
      </Space>

      {error && (
        <Alert
          type="error"
          message={(error as Error).message}
          style={{ marginBottom: 16 }}
        />
      )}

      {isLoading ? <Spin /> : <TaskTable tasks={items} implementation="swr" />}
    </div>
  )
}
