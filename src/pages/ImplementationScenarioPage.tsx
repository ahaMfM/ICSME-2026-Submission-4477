import { useParams } from 'react-router-dom'
import { Alert } from 'antd'
import { implementations } from '../implementations'
import { isImplementationKey, isScenarioKey } from '../shared/constants/implementations'
import type { ImplementationKey, ScenarioKey } from '../api/types'

export function ImplementationScenarioPage() {
  const { implementation, scenario, taskId } = useParams<{
    implementation: string
    scenario: string
    taskId: string
  }>()

  if (!implementation || !isImplementationKey(implementation)) {
    return <Alert type="error" message="Unknown implementation" />
  }

  if (!scenario || !isScenarioKey(scenario)) {
    return <Alert type="error" message="Unknown scenario" />
  }

  const mod = implementations[implementation as ImplementationKey]
  const Provider = mod.Provider
  const ScenarioComponent = getScenarioComponent(
    mod,
    scenario as ScenarioKey,
    taskId,
  )

  return (
    <Provider>
      <ScenarioComponent />
    </Provider>
  )
}

function getScenarioComponent(
  mod: (typeof implementations)[ImplementationKey],
  scenario: ScenarioKey,
  taskId?: string,
): React.ComponentType {
  switch (scenario) {
    case 's1-task-list':
      return mod.TaskListPage
    case 's2-task-detail':
      return () => <mod.TaskDetailPage taskId={taskId ?? 'task-1'} />
    case 's3-s5-mutations':
      return mod.MutationsPage
    case 's6-optimistic-update':
      return mod.OptimisticUpdatePage
    case 's7-pagination':
      return mod.PaginationPage
    case 's8-dependent-query':
      return mod.DependentQueryPage
    case 's9-manual-refetch':
      return mod.ManualRefetchPage
    case 's10-s11-error-retry':
      return mod.ErrorRetryPage
    case 's12-background-revalidation':
      return mod.BackgroundRevalidationPage
  }
}
