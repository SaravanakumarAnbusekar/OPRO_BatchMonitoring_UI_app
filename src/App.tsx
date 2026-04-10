import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import ashleyTheme from './theme/ashleyTheme';
import { FilterProvider } from './contexts/FilterContext';
import ErrorBoundary from './components/shared/ErrorBoundary';
import LoadingSpinner from './components/shared/LoadingSpinner';

// Lazy-load pages for code splitting
const BatchListPage = lazy(() => import('./pages/BatchListPage'));
const BatchDetailsPage = lazy(() => import('./pages/BatchDetailsPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

/**
 * Application root – wires together providers, theme, routing.
 */
const App: React.FC = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={ashleyTheme}>
        <CssBaseline />
        <FilterProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingSpinner fullHeight message="Loading page…" />}>
              <Routes>
                <Route path="/" element={<BatchListPage />} />
                <Route path="/batch/:batchId" element={<BatchDetailsPage />} />
                {/* Future routes can be added here */}
              </Routes>
            </Suspense>
          </BrowserRouter>
        </FilterProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
