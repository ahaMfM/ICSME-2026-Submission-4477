# Server-State Management Experiment

A controlled comparison of three React server-state management approaches—native `useEffect`, [TanStack Query](https://tanstack.com/query/latest), and [SWR](https://swr.vercel.app/)—across identical scenarios. This is the research artifact for the paper *"To Query or Not to Query: An Empirical Study of Server-State Management Trade-Offs in React"*.

## Quick Start

```bash
bun install
bun run dev
```

Open http://localhost:5173 and select an implementation to begin exploring scenarios.

## Scenarios

| Scenario | What it demonstrates |
|---|---|
| **Task List** | Cache behavior, request deduplication with two concurrent observers |
| **Task Detail** | Single-resource fetch, manual refetch |
| **Mutations** | Create/update/delete, optimistic toggle with rollback on error |
| **Pagination** | Infinite-list page accumulation |
| **Dependent Query** | Sequential fetch: user first, then user's tasks |
| **Error & Retry** | Configurable failure modes, automatic retries, background revalidation |

## What to Observe

The **Request Log** panel (right sidebar) records every API call with flags:

- **DUP** — concurrent duplicate: same request was already in flight
- **RPT** — repeated within 1.5 seconds of the last identical call
- **R*n*** — retried *n* times before this attempt

Key behavioral differences:

1. **Deduplication**: Enable the "2 observers" toggle on the Task List page. Native fires two parallel requests (one per observer). TanStack Query and SWR deduplicate them into one.
2. **Optimistic updates**: On the Mutations page, toggle a task's completion. All three update the UI immediately, but on failure: TanStack Query uses structured `onMutate`/`onError` context; native and SWR restore manually.
3. **Pagination**: Native manages five state variables manually. TanStack Query uses `useInfiniteQuery`. SWR uses `useSWRInfinite`.
4. **Retries**: Set failure mode to "Random" on the Error page. Native retries in a loop inside the hook. TanStack Query uses a configurable retry function. SWR uses `errorRetryCount`.

## Tech Stack

| Dependency | Role |
|---|---|
| React 19 | UI framework |
| Vite | Build tooling |
| TypeScript | Type safety |
| Ant Design | UI component library |
| @tanstack/react-query | Query library under test |
| swr | Query library under test |
| react-router-dom | Client routing |
| Vitest | Test runner |

## Project Structure

```
src/
├── api/            Mock API with configurable latency, errors, and request logging
├── research/       Metrics collection and comparison helpers
├── implementations/
│   ├── native/     useEffect + useState + manual cache (baseline)
│   ├── tanstack-query/   TanStack Query v5 implementation
│   └── swr/        SWR v2 implementation
├── shared/         Shared hooks, components, and constants
├── pages/          Route-level pages
└── test/           Unit and integration tests
```

## Running Tests

```bash
bun test
```

## Building for Production

```bash
bun run build
```
