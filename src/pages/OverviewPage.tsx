import { Typography, Card, Space } from 'antd'
import { Link } from 'react-router-dom'
import { IMPLEMENTATION_ORDER, IMPLEMENTATION_LABELS, SCENARIOS } from '../shared/constants/implementations'

export function OverviewPage() {
  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 24px' }}>
      <Typography.Title level={2}>Server-State Management Experiment</Typography.Title>
      <Typography.Paragraph>
        This application compares three React server-state management approaches across
        identical scenarios: a custom <code>useEffect</code>-based implementation,
        TanStack Query, and SWR. Each scenario is instrumented to record request
        deduplication, retry behavior, and mutation lifecycle handling.
      </Typography.Paragraph>

      <Typography.Title level={4}>Choose an implementation to start:</Typography.Title>
      <Space direction="vertical" style={{ width: '100%' }}>
        {IMPLEMENTATION_ORDER.map((impl) => (
          <Card key={impl} size="small">
            <Link to={`/${impl}/${SCENARIOS[0]!.key}`}>
              <Typography.Text strong>{IMPLEMENTATION_LABELS[impl]}</Typography.Text>
            </Link>
          </Card>
        ))}
      </Space>
    </div>
  )
}
