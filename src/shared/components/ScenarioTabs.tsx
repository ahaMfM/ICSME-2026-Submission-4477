import { Tabs } from 'antd'
import { useNavigate } from 'react-router-dom'
import { SCENARIOS } from '../constants/implementations'
import type { ImplementationKey, ScenarioKey } from '../../api/types'

interface Props {
  implementation: ImplementationKey
  current: ScenarioKey
}

export function ScenarioTabs({ implementation, current }: Props) {
  const navigate = useNavigate()

  const items = SCENARIOS.map((s) => ({
    key: s.key,
    label: s.label,
  }))

  function handleChange(key: string) {
    navigate(`/${implementation}/${key}`)
  }

  return (
    <Tabs
      activeKey={current}
      items={items}
      onChange={handleChange}
      size="small"
      style={{ marginBottom: 0 }}
    />
  )
}
