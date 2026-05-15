import { Card, Descriptions } from 'antd'
import { useStoreSnapshot } from '../hooks/useStoreSnapshot'
import {
  subscribeRequestLog,
  getRequestLogSnapshot,
} from '../../api/requestLogger'
import { subscribeMetrics, getMetricsSnapshot } from '../../research/metrics'
import { buildRequestMetrics } from '../../research/comparisonHelpers'
import type { ImplementationKey } from '../../api/types'
import { IMPLEMENTATION_LABELS } from '../constants/implementations'

interface Props {
  implementation: ImplementationKey
}

export function MetricsSummaryPanel({ implementation }: Props) {
  const entries = useStoreSnapshot(subscribeRequestLog, getRequestLogSnapshot)
  const metricsState = useStoreSnapshot(subscribeMetrics, getMetricsSnapshot)
  const requestMetrics = buildRequestMetrics(entries, implementation)

  return (
    <Card
      title={`Metrics: ${IMPLEMENTATION_LABELS[implementation]}`}
      size="small"
      style={{ marginTop: 16 }}
    >
      <Descriptions column={2} size="small">
        <Descriptions.Item label="Requests">{requestMetrics.total}</Descriptions.Item>
        <Descriptions.Item label="Failed">{requestMetrics.failed}</Descriptions.Item>
        <Descriptions.Item label="Duplicates">
          {requestMetrics.duplicates}
        </Descriptions.Item>
        <Descriptions.Item label="Avg Duration">
          {requestMetrics.avgDurationMs}ms
        </Descriptions.Item>
        <Descriptions.Item label="Mutations">
          {metricsState.mutationCount[implementation]}
        </Descriptions.Item>
        <Descriptions.Item label="Refetches">
          {metricsState.manualRefetchCount[implementation]}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  )
}
