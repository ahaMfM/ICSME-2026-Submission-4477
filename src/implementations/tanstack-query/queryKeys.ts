export const taskKeys = {
  all: ['tasks'] as const,
  list: (search?: string) => ['tasks', 'list', search ?? ''] as const,
  detail: (id: string) => ['tasks', 'detail', id] as const,
  mutationList: () => ['tasks', 'mutation-list'] as const,
  optimisticList: () => ['tasks', 'optimistic-list'] as const,
  infinite: () => ['tasks', 'infinite'] as const,
  currentUser: () => ['user', 'current'] as const,
  tasksForUser: (userId: string) => ['tasks', 'for-user', userId] as const,
  manualRefetch: () => ['tasks', 'manual-refetch'] as const,
  errorList: () => ['tasks', 'error-list'] as const,
  bgRevalidation: () => ['tasks', 'bg-revalidation'] as const,
}
