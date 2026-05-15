import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './shared/components/AppShell'
import { OverviewPage } from './pages/OverviewPage'
import { ImplementationScenarioPage } from './pages/ImplementationScenarioPage'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<OverviewPage />} />
      <Route path="/:implementation/:scenario" element={<AppShell />}>
        <Route index element={<ImplementationScenarioPage />} />
      </Route>
      <Route path="/:implementation/:scenario/:taskId" element={<AppShell />}>
        <Route index element={<ImplementationScenarioPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
