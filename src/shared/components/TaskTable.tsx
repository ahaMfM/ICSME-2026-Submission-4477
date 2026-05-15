import { Table, Tag, Button } from 'antd'
import { Link } from 'react-router-dom'
import type { Task, ImplementationKey } from '../../api/types'
import type { ColumnsType } from 'antd/es/table'

interface Props {
  tasks: Task[]
  loading?: boolean
  implementation: ImplementationKey
  onToggle?: (task: Task) => void
  onDelete?: (task: Task) => void
  selectedTaskId?: string
  onSelect?: (task: Task) => void
}

export function TaskTable({
  tasks,
  loading,
  implementation,
  onToggle,
  onDelete,
  selectedTaskId,
  onSelect,
}: Props) {
  const columns: ColumnsType<Task> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Task) => (
        <Link to={`/${implementation}/s2-task-detail/${record.id}`}>{title}</Link>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => {
        const colors = { high: 'red', medium: 'orange', low: 'blue' }
        return <Tag color={colors[priority as keyof typeof colors]}>{priority}</Tag>
      },
    },
    {
      title: 'Status',
      dataIndex: 'completed',
      key: 'completed',
      width: 100,
      render: (completed: boolean) => (
        <Tag color={completed ? 'green' : 'default'}>
          {completed ? 'Done' : 'Pending'}
        </Tag>
      ),
    },
  ]

  if (onToggle || onDelete || onSelect) {
    columns.push({
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_: unknown, record: Task) => (
        <span style={{ display: 'flex', gap: 4 }}>
          {onSelect && (
            <Button
              size="small"
              type={selectedTaskId === record.id ? 'primary' : 'default'}
              onClick={() => onSelect(record)}
            >
              Select
            </Button>
          )}
          {onToggle && (
            <Button size="small" onClick={() => onToggle(record)}>
              {record.completed ? 'Undo' : 'Complete'}
            </Button>
          )}
          {onDelete && (
            <Button size="small" danger onClick={() => onDelete(record)}>
              Delete
            </Button>
          )}
        </span>
      ),
    })
  }

  return (
    <Table
      dataSource={tasks}
      columns={columns}
      rowKey="id"
      loading={loading}
      pagination={false}
      size="small"
    />
  )
}
