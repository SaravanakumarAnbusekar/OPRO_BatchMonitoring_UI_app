import { useQuery } from '@tanstack/react-query';
import { fetchBatches, FetchBatchesResult } from '../services/batchApi';
import { FilterState } from '../types/batch';

interface UseBatchesOptions {
  filters: FilterState;
  page: number;
  pageSize?: number;
}

/**
 * Custom hook that fetches and caches the paginated batch list.
 * Uses React Query for data fetching, caching, and loading/error states.
 */
export const useBatches = ({ filters, page, pageSize = 10 }: UseBatchesOptions) => {
  const queryResult = useQuery<FetchBatchesResult, Error>({
    queryKey: ['batches', filters, page, pageSize],
    queryFn: () => fetchBatches({ filters, page, pageSize }),
    staleTime: 30_000, // 30 seconds
    retry: 2,
  });

  return {
    batches: queryResult.data?.data ?? [],
    total: queryResult.data?.total ?? 0,
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
};
