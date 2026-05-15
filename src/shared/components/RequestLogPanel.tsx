import { Card, Table, Tag } from 'antd'
import { useStoreSnapshot } from '../hooks/useStoreSnapshot'
import {
  subscribeRequestLog,
  getRequestLogSnapshot,
  getRequestLogEntries,
} from '../../api/requestLogger'
import type { ImplementationKey, RequestLogEntry } from '../../api/types'
import type { ColumnsType } from 'antd/es/table'

interface Props {
  implementation?: ImplementationKey
}

export function RequestLogPanel({ implementation }: Props) {
  useStoreSnapshot(subscribeRequestLog, getRequestLogSnapshot)
  const entries = getRequestLogEntries(implementation).slice(0, 15)

  const columns: ColumnsType<RequestLogEntry> = [
    {
      title: 'Endpoint',
      dataIndex: 'endpoint',
      key: 'endpoint',
      width: 130,
      render: (v: string) => <span style={{ fontSize: 11 }}>{v}</span>,
    },
    {
      title: 'ms',
      dataIndex: 'durationMs',
      key: 'durationMs',
      width: 50,
      render: (v: number) => <span style={{ fontSize: 11 }}>{v}</span>,
    },
    {
      title: 'Flags',
      key: 'flags',
      width: 120,
      render: (_: unknown, record: RequestLogEntry) => (
        <span>
          {record.success ? (
            <Tag color="green" style={{ fontSize: 10, marginRight: 2 }}>
              OK
            </Tag>
          ) : (
            <Tag color="red" style={{ fontSize: 10, marginRight: 2 }}>
              FAIL
            </Tag>
          )}
          {record.concurrentDuplicate && (
            <Tag color="orange" style={{ fontSize: 10, marginRight: 2 }}>
              DUP
            </Tag>
          )}
          {record.repeatedWithinWindow && (
            <Tag color="purple" style={{ fontSize: 10, marginRight: 2 }}>
              RPT
            </Tag>
          )}
          {record.retryCount > 0 && (
            <Tag color="blue" style={{ fontSize: 10 }}>
              R{record.retryCount}
            </Tag>
          )}
        </span>
      ),
    },
  ]

  return (
    <Card title="Request Log" size="small">
      <Table
        dataSource={entries}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="small"
        style={{ fontSize: 11 }}
      />
    </Card>
  )
}
