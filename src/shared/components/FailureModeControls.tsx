import { Card, Form, Select, InputNumber, Space } from 'antd'
import { useStoreSnapshot } from '../hooks/useStoreSnapshot'
import {
  getApiConfigSnapshot,
  subscribeApiConfig,
  updateApiConfig,
} from '../../api/mockApi'
import type { FailureMode } from '../../api/types'

export function FailureModeControls() {
  const config = useStoreSnapshot(subscribeApiConfig, getApiConfigSnapshot)

  return (
    <Card title="API Configuration" size="small" style={{ marginBottom: 16 }}>
      <Form layout="vertical" size="small">
        <Form.Item label="Failure Mode">
          <Select
            value={config.failureMode}
            onChange={(value: FailureMode) =>
              updateApiConfig({ failureMode: value })
            }
          >
            <Select.Option value="none">None</Select.Option>
            <Select.Option value="random">Random (20%)</Select.Option>
            <Select.Option value="always">Always Fail</Select.Option>
            <Select.Option value="next">Next Request Fails</Select.Option>
          </Select>
        </Form.Item>
        <Space>
          <Form.Item label="Min Latency (ms)">
            <InputNumber
              value={config.latencyMinMs}
              onChange={(v) => v !== null && updateApiConfig({ latencyMinMs: v })}
              min={0}
              max={5000}
              step={50}
            />
          </Form.Item>
          <Form.Item label="Max Latency (ms)">
            <InputNumber
              value={config.latencyMaxMs}
              onChange={(v) => v !== null && updateApiConfig({ latencyMaxMs: v })}
              min={0}
              max={5000}
              step={50}
            />
          </Form.Item>
        </Space>
      </Form>
    </Card>
  )
}
