import type { ImplementationKey, ScenarioKey } from '../../api/types'

export function buildScenarioPath(
  implementation: ImplementationKey,
  scenario: ScenarioKey,
  taskId?: string,
): string {
  const base = `/${implementation}/${scenario}`
  return taskId ? `${base}/${taskId}` : base
}
