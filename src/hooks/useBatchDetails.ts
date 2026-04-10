import { useQuery } from '@tanstack/react-query';
import { fetchBatchById } from '../services/batchApi';
import { BatchResult } from '../types/batch';

/**
 * Custom hook that fetches and caches a single batch's details.
 * @param batchId - The batch ID to fetch (e.g. "BATCH-20260401-0000")
 */
export const useBatchDetails = (batchId: string | undefined) => {
  const queryResult = useQuery<BatchResult | null, Error>({
    queryKey: ['batch', batchId],
    queryFn: () => {
      if (!batchId) return Promise.resolve(null);
      return fetchBatchById(batchId);
    },
    enabled: !!batchId,
    staleTime: 60_000, // 1 minute
    retry: 2,
  });

  return {
    batch: queryResult.data ?? null,
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
    notFound: queryResult.isSuccess && queryResult.data === null,
  };
};
