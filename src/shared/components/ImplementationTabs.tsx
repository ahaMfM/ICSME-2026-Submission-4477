import { Tabs } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import {
  IMPLEMENTATION_ORDER,
  IMPLEMENTATION_LABELS,
} from '../constants/implementations'
import type { ImplementationKey } from '../../api/types'

interface Props {
  current: ImplementationKey
}

export function ImplementationTabs({ current }: Props) {
  const navigate = useNavigate()
  const { scenario } = useParams()

  const items = IMPLEMENTATION_ORDER.map((key) => ({
    key,
    label: IMPLEMENTATION_LABELS[key],
  }))

  function handleChange(key: string) {
    navigate(`/${key}/${scenario ?? 's1-task-list'}`)
  }

  return (
    <Tabs
      activeKey={current}
      items={items}
      onChange={handleChange}
      style={{ marginBottom: 0 }}
    />
  )
}
