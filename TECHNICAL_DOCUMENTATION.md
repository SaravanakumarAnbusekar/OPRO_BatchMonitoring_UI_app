# OPRO Cronjob Monitor — Complete Technical Documentation

> **Ashley Furniture Industries** | React + TypeScript SPA
> Last updated: April 2026

---

## Table of Contents

1. [Application Overview](#1-application-overview)
2. [Project Structure](#2-project-structure)
3. [Bootstrap Layer — main.tsx & App.tsx](#3-bootstrap-layer)
4. [Data Layer](#4-data-layer)
   - 4.1 [TypeScript Types — `src/types/batch.ts`](#41-typescript-types)
   - 4.2 [Mock Data — `src/services/mockData.ts`](#42-mock-data)
   - 4.3 [API Service — `src/services/batchApi.ts`](#43-api-service)
   - 4.4 [Export Service — `src/services/exportService.ts`](#44-export-service)
5. [State & Logic Layer](#5-state--logic-layer)
   - 5.1 [Theme — `src/theme/ashleyTheme.ts`](#51-theme)
   - 5.2 [Filter Context — `src/contexts/FilterContext.tsx`](#52-filter-context)
   - 5.3 [Custom Hooks](#53-custom-hooks)
   - 5.4 [Utility Functions](#54-utility-functions)
6. [Shared Infrastructure Components](#6-shared-infrastructure-components)
7. [Screen 1 — Batch List](#7-screen-1--batch-list)
8. [Screen 2 — Batch Details](#8-screen-2--batch-details)
9. [Architectural & Design Decisions](#9-architectural--design-decisions)
10. [Package Reference](#10-package-reference)

---

## 1. Application Overview

The **OPRO Cronjob Monitor** is a single-page React application (SPA) built for Ashley Furniture Industries to monitor the execution of OPRO batch cronjobs. Each batch job runs a six-step pipeline that processes furniture orders, allocates inventory, and generates CODIS suggestions.

### What the app does

| Screen | Route | Purpose |
|--------|-------|---------|
| Batch List | `/` | View all batch executions in a paginated, filterable table |
| Batch Details | `/batch/:batchId` | Drill into a single batch — see metrics, step timings, errors |

### High-level data flow

```
User opens browser
    → React Router loads the correct Page component
        → Page calls a custom hook (useBatches / useBatchDetails)
            → Hook calls React Query → fetchBatches / fetchBatchById (batchApi.ts)
                → batchApi applies filters to MOCK_BATCHES and returns paginated data
                    → Hook returns { data, isLoading, isError }
                        → Page passes data down to display components
                            → User sees the rendered table or detail view
```

### Technology stack at a glance

- **React 18** — UI rendering with concurrent features
- **TypeScript 5** — Full static type safety across the entire codebase
- **Vite 5** — Lightning-fast dev server and optimised production builds
- **Material UI (MUI) v7** — Component library implementing the Ashley brand theme
- **React Router v7** — Client-side routing with URL-persisted filter params
- **TanStack React Query v5** — Server state management, caching, loading/error states
- **date-fns v3** — Date formatting and parsing utilities
- **Axios v1** — HTTP client (wired but dormant; mock data currently used)

---

## 2. Project Structure

```
opro-cronjob-monitor/
├── index.html                        # HTML shell, Roboto font, meta tags
├── vite.config.ts                    # Vite config with path aliases
├── tsconfig.app.json                 # TypeScript config with path aliases
├── .env.example                      # Environment variable template
└── src/
    ├── main.tsx                      # DOM mount point
    ├── App.tsx                       # Providers + router
    ├── index.css                     # Global CSS reset
    │
    ├── types/
    │   └── batch.ts                  # All interfaces, enums, constants
    │
    ├── theme/
    │   └── ashleyTheme.ts            # MUI theme + custom color tokens
    │
    ├── services/
    │   ├── mockData.ts               # Seeded random data generator (20 batches)
    │   ├── batchApi.ts               # API layer (filter/paginate over mock data)
    │   └── exportService.ts          # PDF/CSV/email stubs
    │
    ├── hooks/
    │   ├── useBatches.ts             # React Query hook for batch list
    │   ├── useBatchDetails.ts        # React Query hook for single batch
    │   └── useWebSocket.ts           # Live-mode WebSocket skeleton
    │
    ├── utils/
    │   ├── dateUtils.ts              # Date formatting + time-frame filtering
    │   └── formatters.ts             # Number, percentage, progress bar utils
    │
    ├── contexts/
    │   └── FilterContext.tsx         # Global filter state + updaters
    │
    ├── pages/
    │   ├── BatchListPage.tsx         # Screen 1 — list + filters
    │   └── BatchDetailsPage.tsx      # Screen 2 — single batch analytics
    │
    └── components/
        ├── layout/

---

## 3. Bootstrap Layer

### `src/main.tsx` — DOM Mount Point

```typescript
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found.');
createRoot(rootElement).render(
  <StrictMode><App /></StrictMode>
);
```

**What happens here:**
`createRoot` (React 18 concurrent API) mounts the app onto `<div id="root">` in `index.html`. `StrictMode` wraps the whole tree, causing every component to render twice in development — this deliberately surfaces side-effects and deprecated API usage early.

---

### `src/App.tsx` — Provider Tree & Router

```typescript
const App: React.FC = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={ashleyTheme}>
        <CssBaseline />
        <FilterProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingSpinner fullHeight message="Loading page…" />}>
              <Routes>
                <Route path="/"              element={<BatchListPage />} />
                <Route path="/batch/:batchId" element={<BatchDetailsPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </FilterProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);
```

**Provider order is intentional — outer-to-inner:**

| Layer | Provider | Reason for position |
|-------|----------|-------------------|
| 1 | `ErrorBoundary` | Must be outermost — catches errors thrown by *any* child, including other providers |
| 2 | `QueryClientProvider` | React Query needs to wrap all data-fetching hooks; sits outside theme so errors in theme don't block the query client |
| 3 | `ThemeProvider` + `CssBaseline` | MUI styling cascades down; `CssBaseline` injects a CSS reset |
| 4 | `FilterProvider` | Custom context; must be inside Router so it could read URL params if needed |
| 5 | `BrowserRouter` | Router must wrap all `<Route>` declarations and `useNavigate`/`useParams` hooks |
| 6 | `Suspense` | Catches the lazy-load promise thrown by `React.lazy()`; shows `LoadingSpinner` while the page chunk downloads |

**Pages are lazy-loaded:**
```typescript
const BatchListPage    = lazy(() => import('./pages/BatchListPage'));
const BatchDetailsPage = lazy(() => import('./pages/BatchDetailsPage'));
```
This splits the bundle into separate JS chunks. The user only downloads the page they navigate to. On first visit to `/`, the `BatchDetailsPage` chunk is never downloaded.

**`QueryClient` configuration:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 2 } },
});
```
- `refetchOnWindowFocus: false` — prevents surprising refetches when the user alt-tabs
- `retry: 2` — on failure, React Query retries the fetch twice before marking it as error

---

## 4. Data Layer

### 4.1 TypeScript Types
**File:** `src/types/batch.ts`

This is the **single source of truth** for every data shape in the app. Nothing is typed inline in components.

#### `BatchStepResult` — one pipeline step
```typescript
export interface BatchStepResult {
  step_name: string;         // e.g. "EDW Fetch"
  started_at: Date;          // Step start timestamp
  completed_at: Date;        // Step end timestamp
  duration_seconds: number;  // Pre-computed (completed - started)
  records_processed: number; // How many records this step touched
  success: boolean;          // Did this step complete without error?
  error_message?: string;    // Populated only on failure
}
```

#### `BatchResult` — a full batch execution
```typescript
export interface BatchResult {
  batch_id: string;               // Format: "BATCH-YYYYMMDD-HHMM"
  started_at: Date;
  completed_at: Date;
  success: boolean;               // true only if ALL 6 steps succeeded
  total_orders: number;           // Random 800–1200
  orders_allocated: number;       // 85–95% of total_orders
  suggestions_generated: number;  // 40–50% of total_orders
  total_duration_seconds: number; // Sum of all step durations
  // The 6 pipeline steps as typed fields (not a generic array):
  edw_fetch: BatchStepResult;
  pass1_allocation: BatchStepResult;
  consolidation: BatchStepResult;
  pass2_allocation: BatchStepResult;
  edd_comparison: BatchStepResult;
  codis_suggestions: BatchStepResult;
}
```

**Why individual step fields instead of `steps: BatchStepResult[]`?**
TypeScript can enforce that all 6 steps are always present. An array would allow 0–N steps and require runtime length checks everywhere.

#### `FilterState` — everything the user can filter by
```typescript
export interface FilterState {
  jobId: string;                                      // Partial batch ID search
  date: string | null;                                // "YYYY-MM-DD" ISO date
  timeFrame: 'all' | 'morning' | 'afternoon' | 'custom';
  customTimeStart: string;                            // "HH:mm" when custom
  customTimeEnd: string;                              // "HH:mm" when custom
  status: 'all' | 'success' | 'failed';
}
```

#### Constants exported from this file
```typescript
export const DEFAULT_FILTER_STATE: FilterState   // All filters reset to defaults
export const TIME_FRAME_OPTIONS                  // Used by the Select dropdown
export const STEP_KEYS                           // ['edw_fetch', 'pass1_allocation', ...]
export const STEP_LABELS                         // { edw_fetch: 'EDW Fetch', ... }
export const STEP_NUMBERS                        // ['①','②','③','④','⑤','⑥']
```
`STEP_KEYS` is typed as a `keyof Pick<BatchResult, ...>` array — this means iterating it in `ExecutionTimeline` and doing `batch[key]` is fully type-safe. TypeScript will error at compile time if a key is wrong.

---

### 4.2 Mock Data
**File:** `src/services/mockData.ts`

#### Deterministic seeded random number generator
```typescript
const seededRand = (seed: number): (() => number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;  // Always returns a float in [0, 1)
  };
};
const rand = seededRand(20260401); // Seed = April 1, 2026
```
**Why seeded?** Every time the app loads, `generateMockBatches()` is called and produces the **exact same 20 batches**. Without seeding, data would randomise on every page refresh, breaking filter expectations and making debugging inconsistent.

#### Building a single step
```typescript
const buildStep = (
  stepName: string, startTime: Date,
  minDuration: number, maxDuration: number,
  recordsProcessed: number, forceFailure = false,
): BatchStepResult => {
  const duration = randInt(minDuration, maxDuration);
  const completed = new Date(startTime.getTime() + duration * 1000);
  return {
    step_name: stepName, started_at: startTime,
    completed_at: completed, duration_seconds: duration,
    records_processed: recordsProcessed, success: !forceFailure,
    error_message: forceFailure ? 'Timeout: step exceeded...' : undefined,
  };
};
```
Start time is passed in from the caller, and completed_at is derived by adding `duration_seconds * 1000ms` to it. This is how the **chained timeline** is built — each step's `started_at` equals the previous step's `completed_at`.

#### Step chaining (the pipeline)
```typescript
let currentTime = new Date(batchStart);
const edwFetch = buildStep('EDW Fetch', currentTime, 30, 60, totalOrders, failureStepIndex === 0);
currentTime = new Date(currentTime.getTime() + edwFetch.duration_seconds * 1000);
const pass1 = buildStep('Pass 1 Allocation', currentTime, 90, 150, ...);
currentTime = new Date(currentTime.getTime() + pass1.duration_seconds * 1000);
// ... repeat for all 6 steps
```
`currentTime` is a cursor that advances by each step's duration. This means steps never overlap — they are always sequential.

#### Generating 20 batches
```typescript
const baseDate = new Date(2026, 3, 1, 0, 0, 0); // April 1, 2026 00:00 local
for (let i = 0; i < 20; i++) {
  const batchStart = new Date(baseDate.getTime() + i * 2 * 60 * 60 * 1000); // +2h each
  const isFailed = rand() < 0.1; // 10% failure probability
  batches.push(generateBatch(batchStart, isFailed));
}
return batches.sort((a, b) => b.started_at.getTime() - a.started_at.getTime());
```
Batches span April 1 00:00 through April 2 14:00 (20 slots × 2 hours = 40 hours). The `sort` puts newest first, matching the expected display order in the table.

#### Exported data structures
```typescript
export const MOCK_BATCHES: BatchResult[]                 // Sorted array (newest first)
export const MOCK_BATCH_MAP: Record<string, BatchResult> // O(1) lookup by batch_id
export const BATCH_ID_SUGGESTIONS: string[]              // For FilterPanel autocomplete
```
`MOCK_BATCH_MAP` is a JavaScript object where the key is `batch_id`. When `fetchBatchById("BATCH-20260401-0000")` is called, it's a direct property lookup — O(1) — instead of scanning the whole array.

---

### 4.3 API Service
**File:** `src/services/batchApi.ts`

This is the **only layer** that touches data. Components and hooks never import from `mockData.ts` directly.

#### Simulated network delay
```typescript
const SIMULATED_DELAY_MS = 600;
const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
```
This 600ms delay makes the loading skeleton visible during development, so UI states that might be invisible in production (instant network) are always exercised.

#### `fetchBatches` — the filter + paginate pipeline
```typescript
export const fetchBatches = async (params: FetchBatchesParams): Promise<FetchBatchesResult> => {
  await delay(SIMULATED_DELAY_MS);
  let results = [...MOCK_BATCHES]; // Copy — never mutate the source array

  // 1. Filter by Job ID (case-insensitive partial match)
  if (filters.jobId.trim()) {
    const query = filters.jobId.trim().toUpperCase();
    results = results.filter((b) => b.batch_id.toUpperCase().includes(query));
  }

  // 2. Filter by date (compare year/month/day only)
  if (filters.date) {
    const filterDate = parseDateString(filters.date);
    results = results.filter((b) =>
      b.started_at.getFullYear() === filterDate.getFullYear() &&
      b.started_at.getMonth()    === filterDate.getMonth()    &&
      b.started_at.getDate()     === filterDate.getDate()
    );
  }

  // 3. Filter by time frame
  if (filters.timeFrame !== 'all') {
    results = results.filter((b) =>
      isWithinTimeFrame(b.started_at, filters.timeFrame, {
        start: filters.customTimeStart, end: filters.customTimeEnd,
      })
    );
  }

  // 4. Filter by status
  if (filters.status === 'success') results = results.filter((b) => b.success === true);
  else if (filters.status === 'failed') results = results.filter((b) => b.success === false);

  // 5. Paginate
  const total = results.length;
  const startIndex = (page - 1) * pageSize;
  return { data: results.slice(startIndex, startIndex + pageSize), total, page, pageSize };
};
```
Each filter is applied sequentially, narrowing `results` further at each step. Pagination is applied **last** — `total` reflects the count *after* filtering but *before* slicing.

#### `fetchBatchById` — single batch lookup
```typescript
export const fetchBatchById = async (batchId: string): Promise<BatchResult | null> => {
  await delay(SIMULATED_DELAY_MS);
  return MOCK_BATCH_MAP[batchId] ?? null;
};
```
Returns `null` if the ID doesn't exist — the hook (`useBatchDetails`) maps this to `notFound: true`, and the page renders `EmptyState` instead of crashing.

---

### 4.4 Export Service
**File:** `src/services/exportService.ts`

Four async stub functions: `exportBatchPdf`, `exportBatchesCsv`, `exportBatchesExcel`, `emailBatchReport`. Each currently resolves immediately. When the real backend is available, only this file needs to change — every call site in `BatchDetailsPage` remains untouched.

---

## 5. State & Logic Layer

### 5.1 Theme
**File:** `src/theme/ashleyTheme.ts`

The MUI theme is created with `createTheme()` and passed to `ThemeProvider` in `App.tsx`. **Every MUI component throughout the app** automatically inherits these values — there is no need to pass colors as props.

#### Color palette
```typescript
palette: {
  primary: {
    main: '#E87722',  // Ashley brand orange — used for header, buttons, chips, focus rings
    light: '#F09A55', // Hover states, lighter accents
    dark: '#B85810',  // Header avatar background, active states
  },
  secondary: {
    main: '#78909C',  // Mild blue-gray — secondary buttons, email report button
  },
  success:  { main: '#2E7D32' }, // Success status badges
  error:    { main: '#C62828' }, // Failed status badges
}
```

#### Table header override
```typescript
MuiTableHead: {
  styleOverrides: {
    root: {
      '& .MuiTableCell-head': {
        backgroundColor: '#FEF3E8',        // Soft orange tint
        color: '#5D3A1A',                  // Dark warm text for contrast
        borderBottom: '2px solid #F0BC8A', // Accent separator line
      },
    },
  },
},
```
This is a **global component override** — it applies to *every* `<TableHead>` in the app without any className or sx prop on the component itself.

#### Custom color tokens (`ashleyColors`)
```typescript
export const ashleyColors = {
  metrics: {
    primary:   '#E87722', // Total Orders card — orange
    secondary: '#2C5F2D', // Allocated Orders card — forest green (semantic)
    accent:    '#B85810', // Suggestions card — deep orange
  },
  brand: { orange: '#E87722', orangeLight: '#FEF3E8', ... }
}
```
These are used in `MetricCards.tsx` for the card accent colors. They live outside the MUI palette because they're purely cosmetic per-card colors, not semantic UI states.

---

### 5.2 Filter Context
**File:** `src/contexts/FilterContext.tsx`

The filter state is **global** — `FilterPanel` writes to it, and `BatchListPage` reads from it to pass into `useBatches`. Without a context, the filter state would need to live in a common ancestor and be prop-drilled through multiple layers.

#### Context value shape
```typescript
interface FilterContextValue {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;   // Replace entire filter object
  updateFilter: <K>(key: K, value: FilterState[K]) => void; // Update one field
  resetFilters: () => void;                     // Back to DEFAULT_FILTER_STATE
  hasActiveFilters: boolean;                    // true if any non-default filter is set
  isLive: boolean;                              // Future: WebSocket live mode toggle
  setIsLive: (live: boolean) => void;
}
```

#### `hasActiveFilters` computed value
```typescript
const hasActiveFilters = useMemo(
  () =>
    filters.jobId     !== DEFAULT_FILTER_STATE.jobId     ||
    filters.date      !== DEFAULT_FILTER_STATE.date      ||
    filters.timeFrame !== DEFAULT_FILTER_STATE.timeFrame ||
    filters.status    !== DEFAULT_FILTER_STATE.status,
  [filters],
);
```
This drives the "active filters" badge (future enhancement) without any imperative tracking. Adding a new filter field just means adding one more `||` condition here.

#### How the context is consumed
- **`FilterPanel`** — calls `setFilters()` on Apply, `resetFilters()` on Clear
- **`BatchListPage`** — reads `filters` and passes to `useBatches()`
- **`useFilterContext()`** hook — throws a descriptive error if called outside `<FilterProvider>` (prevents silent failures)

---

### 5.3 Custom Hooks

#### `useBatches` — `src/hooks/useBatches.ts`
```typescript
export const useBatches = ({ filters, page, pageSize = 10 }: UseBatchesOptions) => {
  const queryResult = useQuery<FetchBatchesResult, Error>({
    queryKey: ['batches', filters, page, pageSize],
    queryFn:  () => fetchBatches({ filters, page, pageSize }),
    staleTime: 30_000, // 30 seconds before re-fetching
    retry: 2,
  });
  return {
    batches: queryResult.data?.data ?? [],
    total:   queryResult.data?.total ?? 0,
    isLoading, isFetching, isError, error, refetch,
  };
};
```
**`queryKey`** is `['batches', filters, page, pageSize]`. React Query compares this key deeply on every render. When any filter or page changes, the key changes, and React Query automatically re-runs `queryFn`. The caller never writes `useEffect` to trigger refetches.

**`staleTime: 30_000`** — the cached result is considered fresh for 30 seconds. If the user changes filters and changes back, the original result is served from cache instantly (no spinner) for up to 30 seconds.

#### `useBatchDetails` — `src/hooks/useBatchDetails.ts`
```typescript
export const useBatchDetails = (batchId: string | undefined) => {
  const queryResult = useQuery({
    queryKey: ['batch', batchId],
    queryFn:  () => batchId ? fetchBatchById(batchId) : Promise.resolve(null),
    enabled:  !!batchId,         // Query only runs when batchId is defined
    staleTime: 60_000,           // 1 minute — detail pages change less often
  });
  return {
    batch: queryResult.data ?? null,
    notFound: queryResult.isSuccess && queryResult.data === null,
    ...
  };
};
```
**`enabled: !!batchId`** prevents the query from firing with `undefined` as the key. The `notFound` boolean is derived: `isSuccess` means the fetch completed without error, but if `data === null` it means `fetchBatchById` returned null (ID not in map).

#### `useWebSocket` — `src/hooks/useWebSocket.ts`
Skeleton hook for future live-mode real-time updates. Currently a no-op with a console log. When implemented, it will establish a WebSocket connection and push new batch data into the React Query cache via `queryClient.setQueryData()`. The `enabled` prop is false by default, so it never connects until explicitly activated.

---

### 5.4 Utility Functions

#### `src/utils/dateUtils.ts`

| Function | Signature | What it does |
|----------|-----------|--------------|
| `formatDisplayDate` | `(date: Date) → string` | "Apr 01, 2026" |
| `formatDisplayTime` | `(date: Date) → string` | "14:00:00" (24h) |
| `formatDateTime` | `(date: Date) → string` | "Apr 01, 2026 14:00:00" |
| `formatDuration` | `(seconds: number) → string` | 125 → "2m 05s" |
| `parseDateString` | `(str: string) → Date \| null` | Parses "YYYY-MM-DD" |
| `isWithinTimeFrame` | `(date, timeFrame, custom) → boolean` | Core filter logic |
| `isValidTimeString` | `(time: string) → boolean` | Validates "HH:mm" format |
| `isValidBatchIdFormat` | `(id: string) → boolean` | Validates "BATCH-YYYYMMDD-HHMM" |

**`isWithinTimeFrame` — the custom time filter engine:**
```typescript
export const isWithinTimeFrame = (date: Date, timeFrame: TimeFrame, custom: CustomRange): boolean => {
  const totalMinutes = date.getHours() * 60 + date.getMinutes();
  switch (timeFrame) {
    case 'morning':   return totalMinutes >= 0   && totalMinutes < 720;  // 00:00–12:00
    case 'afternoon': return totalMinutes >= 720  && totalMinutes <= 1439; // 12:00–23:59
    case 'custom': {
      const parseHHMM = (hhmm: string): number => {
        const [h, m] = hhmm.split(':').map(Number);
        return isNaN(h) || isNaN(m) ? -1 : h * 60 + m;
      };
      const startMin = parseHHMM(custom.start); // e.g. "12:00" → 720
      const endMin   = parseHHMM(custom.end);   // e.g. "16:00" → 960
      if (startMin < 0 || endMin < 0) return true; // Incomplete range — show all
      return totalMinutes >= startMin && totalMinutes <= endMin;
    }
    default: return true;
  }
};
```
Everything is converted to **minutes since midnight** for simple numeric comparisons. "12:00–16:00" becomes 720–960 minutes.

#### `src/utils/formatters.ts`

| Function | What it does |
|----------|--------------|
| `formatNumber` | Locale-aware thousands separator: 1200 → "1,200" |
| `formatPercent` | Ratio to percent string: 0.852 → "85.2%" |
| `stepPercentage` | `(stepDuration / totalDuration) * 100` rounded to integer |
| `progressBarColor` | Returns hex color: ≥35% = red, ≥20% = orange, else green |
| `allocationRate` | `(allocated / total)` as formatted percent string |

---

## 6. Shared Infrastructure Components

### `src/components/shared/ErrorBoundary.tsx`
A **class component** (React functional components cannot be error boundaries — this is a React architectural constraint). It implements two lifecycle methods:

- `getDerivedStateFromError(error)` — static method, updates state to `{ hasError: true, error }` before re-render, causing the fallback UI to render instead of the crashed tree
- `componentDidCatch(error, info)` — called after the error UI is rendered; the TODO here is to send errors to a monitoring service like Sentry

```typescript
handleReset = (): void => {
  this.setState({ hasError: false, error: null });
};
```
The "Try Again" button calls `handleReset`, which clears the error state and re-renders the children. This is useful when a transient data-fetching error caused the crash.

### `src/components/shared/LoadingSpinner.tsx`
A simple functional component rendering a centered MUI `CircularProgress`. Props:
- `message` (default: "Loading…") — displayed below the spinner
- `size` (default: 48px)
- `fullHeight` (default: false) — when true, uses `minHeight: '60vh'` so it fills the page on initial load

Used in two contexts: inside `Suspense` in `App.tsx` (page chunk loading), and inside page components when `isLoading` is true.

### `src/components/shared/EmptyState.tsx`
Shown inside `BatchTable` when the filtered result set is empty. Props:
- `title`, `description` — text content
- `actionLabel`, `onAction` — optional CTA button (used to call `resetFilters`)

Has `role="status"` and `aria-live="polite"` — screen readers announce the empty state automatically when it appears.

### `src/components/layout/Header.tsx`
The sticky application header. Key elements:

**Skip-to-content link** (accessibility):
```html
<a href="#main-content">Skip to main content</a>
```
Visually hidden at `-9999px` but becomes visible on keyboard focus. Screen reader users and keyboard-only users can skip the header and jump directly to the batch table.

**Ashley logo mark** (inline SVG):
```typescript
const AshleyLogoMark: React.FC = () => (
  <Box sx={{ bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 1, px: 1.25, py: 0.5, ... }}>
    <svg width="26" height="30" viewBox="0 0 26 30">
      <path d="M13 1 L1 29 H6.5 L13 11 L19.5 29 H25 Z" fill="white" />  {/* A legs */}
      <rect x="7.5" y="20" width="11" height="2.5" rx="1" fill="white" /> {/* A crossbar */}
    </svg>
    {/* ASHLEY / FURNITURE stacked text */}
  </Box>
);
```
The SVG "A" mark uses a path of `M13 1 L1 29` (left leg) and `L19.5 29 H25 Z` (right leg) to form the A shape, with a `rect` as the crossbar. The frosted pill background (`rgba(255,255,255,0.12)`) ensures the logo is distinguishable on the orange header.

### `src/components/layout/Layout.tsx`
Wraps every page. Renders: Header → `<main id="main-content">` → `<footer>`. The `id="main-content"` is the target of the skip-to-content link. `tabIndex={-1}` on `<main>` allows focus to be programmatically moved to it when the skip link is activated.

---

## 7. Screen 1 — Batch List

### Data flow overview for Screen 1

```
URL params (page, pageSize, jobId, date, timeFrame, status)
    ↓ read once on mount
FilterContext (filters state)
    ↓ passed to
useBatches(filters, page, pageSize)
    ↓ React Query queryKey changes → queryFn fires
fetchBatches(params) [batchApi.ts]
    ↓ filters + paginates MOCK_BATCHES
{ data: BatchResult[], total: number }
    ↓ returned to
BatchListPage
    ↓ passes batches + pagination props to
BatchTable → maps each batch to BatchRow
```

---

### `src/pages/BatchListPage.tsx`

The **orchestrator** of Screen 1. It owns:
- Pagination state (`page`, `pageSize`) in local `useState`
- URL sync via `useSearchParams`
- Connects `FilterContext` ↔ `useBatches` ↔ `BatchTable`

#### URL synchronisation (two-way)
```typescript
// Mount: URL → Context (restores state on page refresh)
useEffect(() => {
  const jobId = searchParams.get('jobId') ?? '';
  const status = (searchParams.get('status') as FilterState['status']) ?? 'all';
  setFilters({ jobId, date, timeFrame, customTimeStart: '', customTimeEnd: '', status });
}, []); // Runs once on mount only

// On every change: Context + pagination → URL
useEffect(() => {
  const params: Record<string, string> = { page: String(page), pageSize: String(pageSize) };
  if (filters.jobId)          params.jobId     = filters.jobId;
  if (filters.date)           params.date      = filters.date;
  if (filters.timeFrame !== 'all') params.timeFrame = filters.timeFrame;
  if (filters.status    !== 'all') params.status    = filters.status;
  setSearchParams(params, { replace: true }); // replace: true keeps browser history clean
}, [filters, page, pageSize, setSearchParams]);
```
`replace: true` is critical — without it, every filter change would push a new browser history entry, and the Back button would cycle through every filter combination the user tried.

#### Styled page heading
```typescript
<Box display="flex" alignItems="center" gap={1.5}>
  <Box sx={{ bgcolor: 'primary.main', borderRadius: 1, width: 40, height: 40 }}>
    <HistoryIcon sx={{ color: 'white' }} />
  </Box>
  <Typography variant="h3">Batch Execution History</Typography>
  {!isLoading && (
    <Chip label={`${total} batches`} sx={{ bgcolor: 'primary.main', color: 'white' }} />
  )}
</Box>
<Divider sx={{ borderColor: 'primary.light', ml: '56px' }} />
```
The batch count chip (`20 batches`) comes directly from `useBatches().total` — it reflects the **post-filter** count, so when the user filters to "Failed only" it shows "2 batches" rather than 20.

---

### `src/components/BatchList/FilterPanel.tsx`

The filter bar containing all 4 filter controls. Manages **local filter state** that is only committed to the global context when "Apply Filters" is clicked.

#### Why local state before committing?
If every keystroke in the Job ID field immediately updated the global context → triggered `useBatches` → fired `fetchBatches`, there would be an API call for each letter typed. The local state pattern debounces this: the user types the full ID, then clicks Apply.

#### Internal state
```typescript
const [localFilters, setLocalFilters] = useState<FilterState>(filters); // Mirrors context
const [jobIdError, setJobIdError]     = useState('');
const [dateError, setDateError]       = useState('');
const [customPickerResetKey, ...]     = useState(0);  // Forces CustomTimePicker remount on Clear
```

#### The four filter handlers
```typescript
handleJobIdChange   → updates localFilters.jobId via Autocomplete onInputChange
handleDateChange    → updates localFilters.date via TextField onChange
handleTimeFrameChange → updates localFilters.timeFrame; clears custom times if leaving 'custom'
handleStatusChange  → updates localFilters.status
handleCustomStartChange / handleCustomEndChange → called by CustomTimePicker
```

#### Apply Filters — `handleSubmit`
```typescript
const handleSubmit = useCallback(() => {
  // 1. Validate Job ID format
  if (jobId is provided but malformed) { setJobIdError(...); return; }

  // 2. Validate custom time range
  if (timeFrame === 'custom') {
    if (!customTimeStart || !customTimeEnd) {
      setDateError('Enter both start and end times...'); return;
    }
    if (customTimeStart >= customTimeEnd) {
      setDateError('Start time must be before end time'); return;
    }
  }

  // 3. Commit to global context + notify parent
  setDateError('');
  setFilters(localFilters);   // Updates FilterContext
  onSubmit(localFilters);     // Tells BatchListPage to reset page to 1
}, [localFilters, setFilters, onSubmit]);
```

#### Clear — `handleClear`
```typescript
const handleClear = useCallback(() => {
  resetFilters();                          // Resets FilterContext to DEFAULT_FILTER_STATE
  setLocalFilters(EMPTY_FILTERS);          // Resets local state
  setCustomPickerResetKey((k) => k + 1);  // ← KEY: forces CustomTimePicker remount
  onSubmit(EMPTY_FILTERS);                // Triggers re-fetch with no filters
}, [resetFilters, onSubmit]);
```

---

### `src/components/BatchList/CustomTimePicker.tsx`

The expandable Start/End time picker shown when `timeFrame === 'custom'`.

#### The critical design — uncontrolled TimeSlot
This component was redesigned after a subtle bug: the previous version used `useMemo` to derive `hour` and `minute` from the `value` prop. When a user selected hour "12" but hadn't yet selected a minute, `buildTimeString("12", "")` returned `""` (because the minute was invalid). The parent stored `""`, which flowed back as `value=""`, causing `useMemo` to re-derive `hour=""` — erasing the hour selection. The filter never built.

**Fix:** `TimeSlot` now uses `useState` initialized once from the prop. The `value` prop is never read again after mount:

```typescript
const TimeSlot: React.FC<TimeSlotProps> = ({ label, initialValue, onChange, ... }) => {
  // Initialized ONCE. Never re-derived from props.
  const [hour,   setHour]   = useState<string>(() => initialValue.split(':')[0] ?? '');
  const [minute, setMinute] = useState<string>(() => initialValue.split(':')[1] ?? '');

  const handleHourChange = useCallback((_: React.SyntheticEvent, newVal: string | null) => {
    const h = newVal ?? '';
    setHour(h);
    setMinute((prevMinute) => {          // Read latest minute from state (not closure)
      onChange(buildTimeString(h, prevMinute)); // '' until minute also selected
      return prevMinute;
    });
  }, [onChange]);
  // handleMinuteChange is symmetric
};
```
The functional update `setMinute((prevMinute) => {...})` reads the latest minute value from React state — not from a stale closure. This avoids a classic hooks closure trap where `handleHourChange` would capture the `minute` value from the time of its last creation rather than the current value.

**Reset mechanism:** When the user clicks Clear, `customPickerResetKey` increments in FilterPanel. This is passed as `resetKey` to `CustomTimePicker`, which uses it as part of the `key` prop on each `TimeSlot`:
```typescript
<TimeSlot key={`start-${resetKey}`} ... />
<TimeSlot key={`end-${resetKey}`}   ... />
```
When `key` changes, React unmounts and remounts the component from scratch — local state is wiped. This is the correct way to reset an intentionally uncontrolled component.

#### `buildTimeString` — combining hour + minute
```typescript
const buildTimeString = (hour: string, minute: string): string => {
  if (!isValidHour(hour) || !isValidMinute(minute)) return '';
  return `${String(parseInt(hour, 10)).padStart(2, '0')}:${String(parseInt(minute, 10)).padStart(2, '0')}`;
};
```
Returns `''` if either part is incomplete or invalid. The parent stores `''` until both parts are filled. `batchApi.ts` treats `''` as "no time filter" — correct behavior while the user is mid-entry.

---

### `src/components/BatchList/BatchTable.tsx`

Renders the MUI `Table` with header, body, and a pagination row.

#### Loading skeleton
```typescript
{isLoading ? (
  Array.from({ length: SKELETON_ROWS }).map((_, idx) => (
    <TableRow key={idx}>
      {COLUMNS.map((col) => (
        <TableCell key={col}>
          <Skeleton variant="text" height={24} width="80%" />
        </TableCell>
      ))}
    </TableRow>
  ))
) : ...}
```
`Array.from({ length: 5 })` creates 5 skeleton rows matching the expected data rows. The user sees a table-shaped placeholder immediately — no layout shift when data arrives.

#### Pagination handler
```typescript
const handleChangePage = (_: unknown, newPage: number) => {
  onPageChange(newPage + 1); // MUI uses 0-based pages; our API uses 1-based
};
```
MUI's `TablePagination` uses 0-based page index internally. The `+1` converts to the 1-based page numbers that `fetchBatches` uses (`(page - 1) * pageSize` for the slice start index).

#### Row count summary
```typescript
<Typography variant="caption">
  Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} batches
</Typography>
```
Example: page=2, pageSize=10, total=20 → "Showing 11–20 of 20 batches".

---

### `src/components/BatchList/BatchRow.tsx`

A single table row. Wrapped in `React.memo()`:
```typescript
const BatchRow: React.FC<BatchRowProps> = memo(({ batch, rowIndex }) => { ... });
BatchRow.displayName = 'BatchRow';
```
`React.memo` shallowly compares props before re-rendering. Since `batch` objects are the same references between renders (React Query doesn't recreate them if data hasn't changed), rows that haven't changed don't re-render when pagination updates.

#### Navigation on click or keyboard
```typescript
const handleNavigate = () => navigate(`/batch/${encodeURIComponent(batch.batch_id)}`);

const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNavigate(); }
};

<TableRow
  onClick={handleNavigate}
  onKeyDown={handleKeyDown}
  tabIndex={0}
  role="row"
  aria-label={`Batch ${batch.batch_id}, ${batch.success ? 'Success' : 'Failed'}`}
>
```
`tabIndex={0}` makes the row focusable via Tab. `onKeyDown` handles Enter and Space for keyboard users. `encodeURIComponent` handles any special characters in the batch ID (e.g. the `-` characters are safe but this future-proofs for other ID formats).

---

## 8. Screen 2 — Batch Details

### Data flow overview for Screen 2

```
URL: /batch/BATCH-20260401-0800
    ↓ useParams()
batchId = "BATCH-20260401-0800"
    ↓
useBatchDetails(batchId)
    ↓ React Query queryKey = ['batch', 'BATCH-20260401-0800']
fetchBatchById('BATCH-20260401-0800')
    ↓ O(1) lookup in MOCK_BATCH_MAP
BatchResult object
    ↓ returned to
BatchDetailsPage
    ↓ passes batch to:
    ├── BatchHeader     (batch_id, success, timestamps, duration)
    ├── MetricCards     (total_orders, orders_allocated, suggestions_generated)
    └── ExecutionTimeline → maps STEP_KEYS → StepDetail (each BatchStepResult)
```

---

### `src/pages/BatchDetailsPage.tsx`

Orchestrates Screen 2. Key responsibilities:

#### URL param extraction
```typescript
const { batchId } = useParams<{ batchId: string }>();
const decodedId = batchId ? decodeURIComponent(batchId) : undefined;
```
`decodeURIComponent` reverses the encoding done in `BatchRow`. The decoded ID is passed to `useBatchDetails`.

#### Handling all data states
```typescript
{isError   && <Alert severity="error">...</Alert>}
{notFound  && <EmptyState title="Batch not found" description={`No batch found with ID "${decodedId}"`} />}
{isLoading && <Box>{/* Skeleton layout */}</Box>}
{!isLoading && !isError && batch && (
  <>
    <BatchHeader batch={batch} />
    <MetricCards batch={batch} onViewAll={handleViewAll} />
    <ExecutionTimeline batch={batch} />
    {/* Action buttons */}
  </>
)}
```
Four explicit states are handled: error, not-found, loading, and success. There is no "else" branch that could leave the user in an ambiguous state.

#### Loading skeleton
The skeleton mimics the exact layout of the real content:
```typescript
<Skeleton variant="text" height={60} width="60%" sx={{ mx: 'auto', mb: 1 }} />  {/* BatchHeader ID */}
<Skeleton variant="text" height={30} width="40%" sx={{ mx: 'auto', mb: 4 }} />  {/* Status chip */}
<Box display="flex" gap={3} mb={4}>
  {[1, 2, 3].map((i) => <Skeleton key={i} variant="rectangular" height={160} sx={{ flex: 1 }} />)}
</Box>                                                                            {/* 3 metric cards */}
<Skeleton variant="rectangular" height={320} />                                  {/* Timeline */}
```

#### Action buttons and "Coming Soon" toast
```typescript
const handleExportPdf = useCallback(async () => {
  if (!batch) return;
  await exportBatchPdf(batch);           // Calls stub in exportService.ts
  setSnackbar('PDF export – Coming Soon!');
}, [batch]);
```
The `Snackbar` with `autoHideDuration={3000}` shows for 3 seconds then auto-dismisses. `aria-live="polite"` ensures screen readers announce the message.

---

### `src/components/BatchDetails/BatchHeader.tsx`

```typescript
<Typography variant="h1" sx={{ fontSize: '48px', fontFamily: 'monospace', color: 'primary.main' }}>
  {batch.batch_id}   {/* "BATCH-20260401-0800" */}
</Typography>
<Chip
  icon={<StatusIcon fontSize="small" />}
  label={batch.success ? 'SUCCESS' : 'FAILED'}
  color={batch.success ? 'success' : 'error'}
/>
```
The `h1` uses `fontFamily: 'monospace'` so all characters have equal width — the batch ID looks like a terminal/code value, appropriate for a technical identifier. The `Chip` uses MUI's built-in `color="success"` and `color="error"` which map to the theme's semantic success/error palette colors.

**Metadata row** — four `MetadataItem` sub-components each show a label + value:
```
Date: Apr 01, 2026   |   Start: 08:00:00   |   End: 08:07:34   |   Duration: 7m 34s
```

---

### `src/components/BatchDetails/MetricCards.tsx`

Three cards side-by-side (responsive: stack on mobile via MUI Grid `size={{ xs: 12, md: 4 }}`).

Each `MetricCard` receives:
- `accentColor` — from `ashleyColors.metrics` (orange / forest-green / deep-orange)
- `value` — formatted number string
- `subtitle` — contextual text (e.g. "95.2% allocation rate")
- `metricType` — used to call `onViewAll('orders' | 'allocated' | 'suggestions')`

The "View All →" button is a `variant="text"` button with `p: 0` (zero padding) styled to look like a clickable text link. The current `onViewAll` handler shows a "Coming Soon" snackbar.

---

### `src/components/BatchDetails/ExecutionTimeline.tsx`

The container for the 6-step breakdown. Key code:

```typescript
{STEP_KEYS.map((key, index) => (
  <Box key={key} role="listitem">
    <StepDetail
      step={batch[key]}                  // type-safe: key is 'edw_fetch' | 'pass1_allocation' | ...
      stepNumber={STEP_NUMBERS[index]}   // '①' | '②' | ...
      stepIndex={index}
      totalDuration={batch.total_duration_seconds}
    />
  </Box>
))}
```
`STEP_KEYS` from `types/batch.ts` drives this loop — no hardcoding step names here. `batch[key]` is fully type-checked because `STEP_KEYS` is typed as `keyof Pick<BatchResult, ...>`.

---

### `src/components/BatchDetails/StepDetail.tsx`

The most interactive component in the app — each step row has a progress bar, status icon, and expandable detail panel.

#### Progress bar calculation
```typescript
const percentage = stepPercentage(step.duration_seconds, totalDuration);
// stepPercentage = Math.round((step.duration_seconds / totalDuration) * 100)

const barColor = progressBarColor(percentage);
// ≥35% → red (#C62828)   ≥20% → orange (#F57C00)   else → green (#2E7D32)
```

#### MUI LinearProgress
```typescript
<LinearProgress
  variant="determinate"
  value={percentage}
  sx={{
    height: 10, borderRadius: 5,
    bgcolor: '#E0E0E0',
    '& .MuiLinearProgress-bar': { bgcolor: barColor, borderRadius: 5 },
  }}
/>
```
`variant="determinate"` requires a `value` prop (0–100). The `sx` override targets the inner bar element with `& .MuiLinearProgress-bar` — MUI's class-based selector pattern for child elements.

#### Expandable detail panel
```typescript
const [expanded, setExpanded] = useState(false);
// ...
<Collapse in={expanded} timeout="auto" unmountOnExit>
  <Box sx={{ px: 3, py: 2, bgcolor: '#FAFAFA', borderTop: '1px solid', borderColor: 'divider' }}>
    <DetailItem label="Started At"          value={formatDisplayTime(step.started_at)} />
    <DetailItem label="Completed At"        value={formatDisplayTime(step.completed_at)} />
    <DetailItem label="Records Processed"   value={formatNumber(step.records_processed)} />
    {step.error_message && (
      <Typography color="error.main">{step.error_message}</Typography>
    )}
  </Box>
</Collapse>
```
`unmountOnExit` removes the DOM nodes when collapsed — reducing the DOM node count for all 6 steps when they're all collapsed. `timeout="auto"` lets MUI calculate the animation duration from the content height.

**Functional update pattern for expand toggle:**
```typescript
<IconButton onClick={() => setExpanded((prev) => !prev)} aria-expanded={expanded}>
```
The functional updater `(prev) => !prev` avoids closure staleness — always reads the latest expanded state rather than the value captured when the handler was created.

---

## 9. Architectural & Design Decisions

### Decision 1 — React Query for server state (not useState + useEffect)

**What:** All data fetching uses TanStack React Query instead of `useState` + `useEffect` + `fetch`.

**Why:** The traditional pattern requires boilerplate for loading, error, refetch, and cache states:
```typescript
// ❌ Without React Query — 20+ lines per data fetch
const [data, setData] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);
useEffect(() => {
  setIsLoading(true);
  fetchBatches(filters).then(setData).catch(setError).finally(() => setIsLoading(false));
}, [filters]); // Easy to get dependency array wrong
```
React Query collapses this to 5 lines and adds automatic caching, deduplication (two components requesting the same key share one fetch), background refetching, and retry logic — none of which the manual pattern provides.

---

### Decision 2 — FilterState in React Context (not prop drilling or URL-only)

**What:** Filter state lives in `FilterContext`, not in the Page component or only in the URL.

**Why:** The filter is read by `BatchListPage` and written by `FilterPanel` — they are siblings in the component tree, not parent/child. Without context, the state would need to live in their common ancestor (`Layout` or `App`), and every intermediate component between would have to pass the props down — prop drilling. Context eliminates this. The URL is also written as a side-effect for shareability, but the runtime state is in context for immediate reactivity.

---

### Decision 3 — Uncontrolled TimeSlot components with key-based reset

**What:** `TimeSlot` inside `CustomTimePicker` manages its own local `useState` for hour and minute. The parent resets it by changing the `key` prop.

**Why:** The alternative (fully controlled component with `value` prop driving local display) caused a critical bug — the parent would store `""` when the user had partially entered a time (e.g. hour selected, minute not yet), which flowed back as `value=""`, erasing the hour they typed. Uncontrolled components with a reset mechanism are the correct pattern when a form field needs persistent partial state during editing.

---

### Decision 4 — API layer as a swap-point for real backend

**What:** All data access goes through `batchApi.ts`. Components and hooks never import `mockData.ts`.

**Why:** When the real OPRO API is available, only `batchApi.ts` changes. The functions keep the same signatures (`fetchBatches`, `fetchBatchById`) — hooks, components, and pages remain untouched. This is the Repository pattern applied to frontend code.

```typescript
// Future real implementation — only this file changes:
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });
export const fetchBatches = async (params) => {
  const { data } = await api.get('/batches', { params });
  return data;
};
```

---

### Decision 5 — TypeScript strict mode + explicit type exports from types/batch.ts

**What:** All interfaces live in `src/types/batch.ts`. `tsconfig.app.json` has `"strict": true`.

**Why:** Strict mode catches `null` dereferences, implicit `any` types, and missing return statements at compile time — not at runtime in production. Centralising types means there is one canonical definition of `BatchResult`. If a field name changes, TypeScript reports every usage that breaks.

---

### Decision 6 — `React.memo` on `BatchRow`

**What:** `BatchRow` is wrapped in `memo()`.

**Why:** The batch table can display up to 25 rows at once. When the user changes pages (a state update in `BatchListPage`), React would normally re-render all 25 rows. With `memo`, only rows whose `batch` prop reference changed are re-rendered. Since React Query returns stable object references for unchanged data, typically only the new page's rows render.

---

### Decision 7 — Seeded random for mock data

**What:** `mockData.ts` uses a Linear Congruential Generator seeded with `20260401`.

**Why:** If `Math.random()` were used, the 20 batches would change on every page refresh. The filter "show April 1 morning batches" would sometimes return 0 results and sometimes 8 — making development and debugging unpredictable. The seed guarantees the same 20 batches always exist with the same IDs, timestamps, and success/failure states.

---

### Decision 8 — Lazy page loading with React.lazy + Suspense

**What:** Both page components are imported with `React.lazy()`.

**Why:** Without lazy loading, Vite would bundle everything into one JS file. With lazy loading, the build produces separate chunks:
- `BatchListPage` chunk — downloaded on visiting `/`
- `BatchDetailsPage` chunk — downloaded only when a user clicks a row

For a monitoring tool that most users open on the list page, this means the detail page JS is never downloaded for users who only view the list — faster initial load.

---

### Decision 9 — MUI global component overrides in the theme

**What:** Table header styles and row hover colors are defined in `ashleyTheme.ts` `components.MuiTableHead.styleOverrides` — not in component `sx` props.

**Why:** If the brand decides to change the orange tint, there is one place to change it. The alternative (inline `sx={{ backgroundColor: '#FEF3E8' }}` on the `TableHead` in `BatchTable`) means a future designer must find and update every table in the app. Global overrides enforce brand consistency automatically.

---

### Decision 10 — Class component for ErrorBoundary

**What:** `ErrorBoundary` is a class component, not a functional component.

**Why:** React's error boundary API (`getDerivedStateFromError`, `componentDidCatch`) only works in class components. This is a React architectural limitation — functional components cannot implement these lifecycle methods. This is the only class component in the codebase; everything else is functional.

---

### Decision 11 — URL filter persistence with replace: true

**What:** Filter state is written to URL search params using `setSearchParams(params, { replace: true })`.

**Why:** Without `replace: true`, every filter interaction pushes a new entry to the browser history stack. If the user applies 5 filters and then presses Back, they cycle through 5 intermediate filter states instead of going back to the previous page. `replace: true` keeps history clean — Back always goes to wherever the user came from.

---

### Decision 12 — Pagination: 1-based API, 0-based MUI

**What:** `fetchBatches` uses 1-based page numbers. MUI `TablePagination` uses 0-based. The conversion is in `BatchTable.tsx`.

**Why:** REST APIs conventionally use `page=1` for the first page (matches human language — "page 1"). MUI's pagination component follows the zero-indexed JavaScript convention. The conversion is isolated to the `handleChangePage` function — a one-line `+1` / `-1` adjustment. This keeps both the API contract and the UI component idiomatic.

---

## 10. Package Reference

### Production dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | 18.3+ | Core UI library. Concurrent features (automatic batching, transitions). Used everywhere. |
| `react-dom` | 18.3+ | DOM renderer. `createRoot` API used in `main.tsx`. |
| `@mui/material` | 7.3+ | Component library. Provides every UI element: AppBar, Table, Chip, LinearProgress, Autocomplete, Select, Collapse, Skeleton, etc. |
| `@mui/icons-material` | 7.3+ | 2000+ SVG icon components. Used throughout for HistoryIcon, CheckCircleIcon, CancelIcon, ArrowForwardIcon, etc. |
| `@emotion/react` | 11.x | CSS-in-JS runtime required by MUI. Parses the `sx` prop and `styled` API at runtime. |
| `@emotion/styled` | 11.x | Styled component API for Emotion. Required by MUI's internal component styling. |
| `react-router-dom` | 7.x | Client-side routing. `BrowserRouter`, `Routes`, `Route`, `useNavigate`, `useParams`, `useSearchParams`. |
| `@tanstack/react-query` | 5.x | Server state management. `QueryClient`, `QueryClientProvider`, `useQuery`. Provides caching, loading states, retry, and background refetch. |
| `axios` | 1.x | HTTP client. Imported in `batchApi.ts` but not yet called (mock data is used). Ready for real API integration via `axios.create({ baseURL: ... })`. |
| `date-fns` | 3.x | Date utility library. `format`, `parseISO`, `isValid` used in `dateUtils.ts`. Chosen over Moment.js because it is tree-shakeable (only imported functions are bundled). |

### Development dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | 5.x | Build tool and dev server. Provides HMR (Hot Module Replacement), ES module dev server, and Rollup-based production builds. |
| `@vitejs/plugin-react` | 4.x | Vite plugin that enables React Fast Refresh (HMR for React components) and JSX transform. |
| `typescript` | 5.x | TypeScript compiler. `tsconfig.app.json` configures strict mode and path aliases. |
| `@types/node` | 22.x | Node.js type definitions. Required for `path`, `url` imports in `vite.config.ts`. |
| `eslint` | 9.x | Static analysis. Catches common JS/TS errors and enforces code style. |
| `typescript-eslint` | 8.x | TypeScript-aware ESLint rules. Enables type-checked linting (e.g. detecting unused variables with their types). |

### Why these packages were chosen over alternatives

| Decision | Chosen | Alternative considered | Reason |
|----------|--------|----------------------|--------|
| State management | React Query | Redux, Zustand | React Query is purpose-built for server state (loading/error/cache). Redux would require sagas/thunks for async — significant boilerplate for what is essentially a read-mostly dashboard. |
| Component library | MUI v7 | Ant Design, Chakra UI | MUI has the most comprehensive data display components (Table, Skeleton, LinearProgress) and the most mature theming system — critical for brand color enforcement. |
| Build tool | Vite | Create React App, Webpack | Vite uses native ES modules for dev server — startup in under 300ms vs CRA's ~10s. Rollup-based production builds produce smaller bundles than Webpack with less configuration. |
| Date library | date-fns | Moment.js, Day.js | date-fns is tree-shakeable (only used functions are bundled), immutable (no mutation bugs), and has full TypeScript types. Moment.js adds ~67KB even if only `format` is used. |
| CSS approach | MUI sx prop + theme | CSS Modules, Tailwind | The `sx` prop colocates styles with the component and has full access to the theme tokens. Theme-level overrides enforce brand consistency. No separate `.css` files to maintain. |

---

*End of Technical Documentation*
*Generated for OPRO Cronjob Monitor v1.0 | Ashley Furniture Industries*
