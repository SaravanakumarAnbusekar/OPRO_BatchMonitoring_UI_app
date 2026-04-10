import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, Chip, Divider, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import HistoryIcon from '@mui/icons-material/History';
import { useBatches } from '../hooks/useBatches';
import { useFilterContext } from '../contexts/FilterContext';
import { FilterState } from '../types/batch';
import FilterPanel from '../components/BatchList/FilterPanel';
import BatchTable from '../components/BatchList/BatchTable';
import Layout from '../components/layout/Layout';

/**
 * Page 1 – Batch List View.
 * Displays the filter panel and paginated batch table.
 * Filters are persisted in URL query parameters.
 */
const BatchListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, setFilters, resetFilters } = useFilterContext();

  const [page, setPage] = useState<number>(
    parseInt(searchParams.get('page') ?? '1', 10) || 1,
  );
  const [pageSize, setPageSize] = useState<number>(
    parseInt(searchParams.get('pageSize') ?? '10', 10) || 10,
  );

  // Sync URL → context on mount
  useEffect(() => {
    const jobId = searchParams.get('jobId') ?? '';
    const date = searchParams.get('date') ?? null;
    const timeFrame = (searchParams.get('timeFrame') as FilterState['timeFrame']) ?? 'all';
    const status = (searchParams.get('status') as FilterState['status']) ?? 'all';
    setFilters({ jobId, date, timeFrame, customTimeStart: '', customTimeEnd: '', status });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Sync context → URL when filters or pagination change
  useEffect(() => {
    const params: Record<string, string> = { page: String(page), pageSize: String(pageSize) };
    if (filters.jobId) params.jobId = filters.jobId;
    if (filters.date) params.date = filters.date;
    if (filters.timeFrame !== 'all') params.timeFrame = filters.timeFrame;
    if (filters.status !== 'all') params.status = filters.status;
    setSearchParams(params, { replace: true });
  }, [filters, page, pageSize, setSearchParams]);

  const { batches, total, isLoading, isError, error, refetch } = useBatches({
    filters,
    page,
    pageSize,
  });

  const handleSubmit = useCallback(
    (_newFilters: FilterState) => {
      setPage(1); // Reset to first page on new filter
    },
    [],
  );

  const handleClearFilters = useCallback(() => {
    resetFilters();
    setPage(1);
  }, [resetFilters]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  return (
    <Layout>
      {/* Page title */}
      <Box mb={3}>
        {/* Icon + heading row */}
        <Box display="flex" alignItems="center" gap={1.5} mb={0.75}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              borderRadius: 1,
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            <HistoryIcon sx={{ color: 'white', fontSize: 22 }} />
          </Box>

          <Typography
            variant="h3"
            component="h2"
            sx={{ fontWeight: 700, lineHeight: 1.2, flexGrow: 1 }}
          >
            Batch Execution History
          </Typography>

          {/* Live batch count chip */}
          {!isLoading && (
            <Chip
              label={`${total} batch${total !== 1 ? 'es' : ''}`}
              size="small"
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                fontWeight: 600,
                fontSize: '12px',
                height: 24,
              }}
              aria-label={`${total} batches found`}
              data-testid="batch-count-chip"
            />
          )}
        </Box>

        {/* Accent divider line */}
        <Divider
          sx={{
            borderColor: 'primary.light',
            borderWidth: '1.5px',
            mb: 1,
            ml: '56px', // Align with text, not icon
          }}
          aria-hidden="true"
        />

        <Typography variant="body2" color="text.secondary" sx={{ ml: '56px' }}>
          View and filter all OPRO batch executions. Click any row to see step-by-step details.
        </Typography>
      </Box>

      {/* Error alert */}
      {isError && (
        <Alert
          severity="error"
          action={
            <Button size="small" color="inherit" onClick={() => refetch()} startIcon={<RefreshIcon />}>
              Retry
            </Button>
          }
          sx={{ mb: 3 }}
          data-testid="batch-list-error"
        >
          {error?.message ?? 'Failed to load batch data. Please try again.'}
        </Alert>
      )}

      {/* Filter Panel */}
      <FilterPanel onSubmit={handleSubmit} />

      {/* Batch Table */}
      <BatchTable
        batches={batches}
        total={total}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onClearFilters={handleClearFilters}
      />
    </Layout>
  );
};

export default BatchListPage;
