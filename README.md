# OPRO Cronjob Monitor

> **Ashley Furniture Industries** – Batch Job Execution Monitoring Dashboard

A professional two-page React + TypeScript application for monitoring OPRO cronjob batch executions, built with Material-UI and the Ashley Furniture brand theme.

---

## Features

- **Batch List View** – Paginated table of batch executions with filtering by Job ID, date, and time frame
- **Batch Details View** – Full analytics for a single batch: metric cards, step-by-step execution timeline with progress bars
- **Ashley Furniture Theme** – Brown/green MUI color palette with professional typography
- **Mock Data** – 20 realistic batches for April 1–2, 2026 (90% success, 10% failure)
- **React Query** – Caching, loading skeletons, and retry logic
- **URL Persistence** – Filters saved to URL query params
- **Accessibility** – ARIA labels, keyboard navigation, skip-to-content link, WCAG AA contrast

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| React | 18.3+ | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool |
| MUI | 5.15+ | Component library |
| React Router | 6.x | Client-side routing |
| React Query | 4.x | Data fetching & caching |
| date-fns | 3.x | Date formatting |
| Axios | 1.x | HTTP client (ready for real API) |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
cd opro-cronjob-monitor
npm install
cp .env.example .env.local
```

### Development

```bash
npm run dev
# App runs at http://localhost:5173
```

### Build

```bash
npm run build
npm run preview
```

### Lint

```bash
npm run lint
```

---

## Project Structure

```
src/
├── components/
│   ├── BatchList/       FilterPanel, BatchTable, BatchRow
│   ├── BatchDetails/    BatchHeader, MetricCards, ExecutionTimeline, StepDetail
│   ├── shared/          LoadingSpinner, ErrorBoundary, EmptyState
│   └── layout/          Header, Layout
├── pages/               BatchListPage, BatchDetailsPage
├── services/            batchApi.ts, mockData.ts, exportService.ts
├── hooks/               useBatches, useBatchDetails, useWebSocket
├── types/               batch.ts
├── theme/               ashleyTheme.ts
├── utils/               dateUtils.ts, formatters.ts
└── contexts/            FilterContext.tsx
```

---

## Routes

| Path | Component | Description |
|---|---|---|
| `/` | BatchListPage | Batch list with filters |
| `/batch/:batchId` | BatchDetailsPage | Detailed batch analytics |

---

## Future Features (Placeholders Ready)

- **Real-time Updates** – `useWebSocket` hook scaffolded
- **Export** – `exportService.ts` with PDF, CSV, Excel stubs
- **Bulk Operations** – BulkActionBar skeleton
- **Advanced Filtering** – FilterBuilder structure

---

## Environment Variables

See `.env.example` for all supported variables.

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | REST API base URL |
| `VITE_WS_URL` | WebSocket URL for live mode |
| `VITE_ENABLE_LIVE_MODE` | Toggle live refresh |

---

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
