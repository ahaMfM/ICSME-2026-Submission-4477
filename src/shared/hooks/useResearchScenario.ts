import { useRef, useEffect } from 'react'
import { recordFirstSuccess } from '../../research/metrics'
import type { ImplementationKey, ScenarioKey } from '../../api/types'

export function useResearchScenario(
  implementation: ImplementationKey,
  scenario: ScenarioKey,
  hasData: boolean,
): void {
  const mountTime = useRef(Date.now())
  const recorded = useRef(false)

  useEffect(() => {
    if (hasData && !recorded.current) {
      recorded.current = true
      const duration = Date.now() - mountTime.current
      recordFirstSuccess(implementation, scenario, duration)
    }
  }, [hasData, implementation, scenario])
}
