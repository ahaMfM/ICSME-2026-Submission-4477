import type { ReactNode, ComponentType } from 'react'
import type { ImplementationKey } from '../api/types'

export interface ImplementationModule {
  key: ImplementationKey
  Provider: ComponentType<{ children: ReactNode }>
  TaskListPage: ComponentType
  TaskDetailPage: ComponentType<{ taskId: string }>
  MutationsPage: ComponentType
  OptimisticUpdatePage: ComponentType
  PaginationPage: ComponentType
  DependentQueryPage: ComponentType
  ManualRefetchPage: ComponentType
  ErrorRetryPage: ComponentType
  BackgroundRevalidationPage: ComponentType
  resetCache: () => void
}
