import { Form, Input, Select, Button } from 'antd'
import type { TaskInput } from '../../api/types'
import { getUsers } from '../../api/mockApi'

interface Props {
  onSubmit: (values: TaskInput) => void
  loading?: boolean
  initialValues?: Partial<TaskInput>
  submitLabel?: string
}

export function TaskForm({ onSubmit, loading, initialValues, submitLabel }: Props) {
  const [form] = Form.useForm<TaskInput>()
  const users = getUsers()

  function handleFinish(values: TaskInput) {
    onSubmit(values)
    form.resetFields()
  }

  return (
    <Form
      form={form}
      layout="inline"
      onFinish={handleFinish}
      initialValues={{
        priority: 'medium',
        userId: users[0]?.id,
        ...initialValues,
      }}
      size="small"
    >
      <Form.Item name="title" rules={[{ required: true, message: 'Title required' }]}>
        <Input placeholder="Task title" style={{ width: 180 }} />
      </Form.Item>
      <Form.Item name="description" initialValue="">
        <Input placeholder="Description" style={{ width: 180 }} />
      </Form.Item>
      <Form.Item name="priority">
        <Select style={{ width: 100 }}>
          <Select.Option value="low">Low</Select.Option>
          <Select.Option value="medium">Medium</Select.Option>
          <Select.Option value="high">High</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="userId">
        <Select style={{ width: 130 }}>
          {users.map((u) => (
            <Select.Option key={u.id} value={u.id}>
              {u.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {submitLabel ?? 'Create'}
        </Button>
      </Form.Item>
    </Form>
  )
}
