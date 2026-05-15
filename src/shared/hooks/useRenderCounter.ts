import { useRef, useEffect } from 'react'
import { recordRender } from '../../research/metrics'
import type { ImplementationKey, ScenarioKey } from '../../api/types'

export function useRenderCounter(
  implementation: ImplementationKey,
  scenario: ScenarioKey,
): number {
  const countRef = useRef(0)
  countRef.current += 1

  useEffect(() => {
    recordRender(implementation, scenario, countRef.current)
  })

  return countRef.current
}
