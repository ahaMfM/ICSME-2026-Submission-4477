import { Layout, Button, Space, Typography } from 'antd'
import { Outlet, useParams } from 'react-router-dom'
import { ImplementationTabs } from './ImplementationTabs'
import { ScenarioTabs } from './ScenarioTabs'
import { RequestLogPanel } from './RequestLogPanel'
import { resetMockApi } from '../../api/mockApi'
import { resetRequestLog } from '../../api/requestLogger'
import { resetResearchMetrics } from '../../research/metrics'
import type { ImplementationKey, ScenarioKey } from '../../api/types'
import { isImplementationKey } from '../constants/implementations'

const { Header, Content, Sider } = Layout
const { Title } = Typography

export function AppShell() {
  const { implementation, scenario } = useParams<{
    implementation: string
    scenario: string
  }>()

  const currentImpl: ImplementationKey | undefined =
    implementation && isImplementationKey(implementation) ? implementation : undefined

  function handleReset() {
    resetMockApi()
    resetRequestLog()
    resetResearchMetrics()
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        <Title level={4} style={{ color: '#fff', margin: 0 }}>
          Server-State Experiment
        </Title>
        <Space>
          <Button onClick={handleReset} size="small">
            Reset All
          </Button>
        </Space>
      </Header>
      <Layout>
        <Content style={{ padding: '16px 24px' }}>
          {currentImpl && <ImplementationTabs current={currentImpl} />}
          {currentImpl && scenario && (
            <ScenarioTabs
              implementation={currentImpl}
              current={scenario as ScenarioKey}
            />
          )}
          <div style={{ marginTop: 16 }}>
            <Outlet />
          </div>
        </Content>
        <Sider
          width={380}
          theme="light"
          style={{ padding: '16px', overflow: 'auto', maxHeight: '100vh' }}
        >
          <RequestLogPanel implementation={currentImpl} />
        </Sider>
      </Layout>
    </Layout>
  )
}
