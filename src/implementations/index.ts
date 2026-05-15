import type { ImplementationKey } from '../api/types'
import type { ImplementationModule } from './types'

import { NativeProvider, resetNativeCache } from './native/Provider'
import { NativeTaskListPage } from './native/TaskListPage'
import { NativeTaskDetailPage } from './native/TaskDetailPage'
import { NativeMutationsPage } from './native/MutationsPage'
import { NativeOptimisticUpdatePage } from './native/OptimisticUpdatePage'
import { NativePaginationPage } from './native/PaginationPage'
import { NativeDependentQueryPage } from './native/DependentQueryPage'
import { NativeManualRefetchPage } from './native/ManualRefetchPage'
import { NativeErrorRetryPage } from './native/ErrorRetryPage'
import { NativeBackgroundRevalidationPage } from './native/BackgroundRevalidationPage'

import { TanStackProvider, resetTanStackCache } from './tanstack-query/Provider'
import { TanStackTaskListPage } from './tanstack-query/TaskListPage'
import { TanStackTaskDetailPage } from './tanstack-query/TaskDetailPage'
import { TanStackMutationsPage } from './tanstack-query/MutationsPage'
import { TanStackOptimisticUpdatePage } from './tanstack-query/OptimisticUpdatePage'
import { TanStackPaginationPage } from './tanstack-query/PaginationPage'
import { TanStackDependentQueryPage } from './tanstack-query/DependentQueryPage'
import { TanStackManualRefetchPage } from './tanstack-query/ManualRefetchPage'
import { TanStackErrorRetryPage } from './tanstack-query/ErrorRetryPage'
import { TanStackBackgroundRevalidationPage } from './tanstack-query/BackgroundRevalidationPage'

import { SwrProvider, resetSwrCache } from './swr/Provider'
import { SwrTaskListPage } from './swr/TaskListPage'
import { SwrTaskDetailPage } from './swr/TaskDetailPage'
import { SwrMutationsPage } from './swr/MutationsPage'
import { SwrOptimisticUpdatePage } from './swr/OptimisticUpdatePage'
import { SwrPaginationPage } from './swr/PaginationPage'
import { SwrDependentQueryPage } from './swr/DependentQueryPage'
import { SwrManualRefetchPage } from './swr/ManualRefetchPage'
import { SwrErrorRetryPage } from './swr/ErrorRetryPage'
import { SwrBackgroundRevalidationPage } from './swr/BackgroundRevalidationPage'

const nativeModule: ImplementationModule = {
  key: 'native',
  Provider: NativeProvider,
  TaskListPage: NativeTaskListPage,
  TaskDetailPage: NativeTaskDetailPage,
  MutationsPage: NativeMutationsPage,
  OptimisticUpdatePage: NativeOptimisticUpdatePage,
  PaginationPage: NativePaginationPage,
  DependentQueryPage: NativeDependentQueryPage,
  ManualRefetchPage: NativeManualRefetchPage,
  ErrorRetryPage: NativeErrorRetryPage,
  BackgroundRevalidationPage: NativeBackgroundRevalidationPage,
  resetCache: resetNativeCache,
}

const tanstackModule: ImplementationModule = {
  key: 'tanstack-query',
  Provider: TanStackProvider,
  TaskListPage: TanStackTaskListPage,
  TaskDetailPage: TanStackTaskDetailPage,
  MutationsPage: TanStackMutationsPage,
  OptimisticUpdatePage: TanStackOptimisticUpdatePage,
  PaginationPage: TanStackPaginationPage,
  DependentQueryPage: TanStackDependentQueryPage,
  ManualRefetchPage: TanStackManualRefetchPage,
  ErrorRetryPage: TanStackErrorRetryPage,
  BackgroundRevalidationPage: TanStackBackgroundRevalidationPage,
  resetCache: resetTanStackCache,
}

const swrModule: ImplementationModule = {
  key: 'swr',
  Provider: SwrProvider,
  TaskListPage: SwrTaskListPage,
  TaskDetailPage: SwrTaskDetailPage,
  MutationsPage: SwrMutationsPage,
  OptimisticUpdatePage: SwrOptimisticUpdatePage,
  PaginationPage: SwrPaginationPage,
  DependentQueryPage: SwrDependentQueryPage,
  ManualRefetchPage: SwrManualRefetchPage,
  ErrorRetryPage: SwrErrorRetryPage,
  BackgroundRevalidationPage: SwrBackgroundRevalidationPage,
  resetCache: resetSwrCache,
}

export const implementations: Record<ImplementationKey, ImplementationModule> = {
  native: nativeModule,
  'tanstack-query': tanstackModule,
  swr: swrModule,
}
