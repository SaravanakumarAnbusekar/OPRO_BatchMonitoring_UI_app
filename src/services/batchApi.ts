/**
 * Batch API service layer.
 * Currently uses mock data; swap implementations here when a real API is available.
 *
 * TODO: Replace mock imports with axios calls to process.env.VITE_API_BASE_URL
 */
import { BatchResult } from '../types/batch';
import { FilterState } from '../types/batch';
import { MOCK_BATCHES, MOCK_BATCH_MAP } from './mockData';
import { isWithinTimeFrame, parseDateString } from '../utils/dateUtils';

/** Simulated network delay (ms) for realistic UX testing */
const SIMULATED_DELAY_MS = 600;

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export interface FetchBatchesParams {
  filters: FilterState;
  page: number;
  pageSize: number;
}

export interface FetchBatchesResult {
  data: BatchResult[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Fetches a paginated, filtered list of batch results.
 * @param params - Filter + pagination options
 */
export const fetchBatches = async (
  params: FetchBatchesParams,
): Promise<FetchBatchesResult> => {
  await delay(SIMULATED_DELAY_MS);

  const { filters, page, pageSize } = params;

  let results = [...MOCK_BATCHES];

  // Filter by Job ID (case-insensitive partial match)
  if (filters.jobId.trim()) {
    const query = filters.jobId.trim().toUpperCase();
    results = results.filter((b) => b.batch_id.toUpperCase().includes(query));
  }

  // Filter by date
  if (filters.date) {
    const filterDate = parseDateString(filters.date);
    if (filterDate) {
      results = results.filter((b) => {
        const bDate = b.started_at;
        return (
          bDate.getFullYear() === filterDate.getFullYear() &&
          bDate.getMonth() === filterDate.getMonth() &&
          bDate.getDate() === filterDate.getDate()
        );
      });
    }
  }

  // Filter by time frame
  if (filters.timeFrame !== 'all') {
    results = results.filter((b) =>
      isWithinTimeFrame(b.started_at, filters.timeFrame, {
        start: filters.customTimeStart,
        end: filters.customTimeEnd,
      }),
    );
  }

  // Filter by status
  if (filters.status === 'success') {
    results = results.filter((b) => b.success === true);
  } else if (filters.status === 'failed') {
    results = results.filter((b) => b.success === false);
  }

  const total = results.length;
  const startIndex = (page - 1) * pageSize;
  const paginatedData = results.slice(startIndex, startIndex + pageSize);

  return {
    data: paginatedData,
    total,
    page,
    pageSize,
  };
};

/**
 * Fetches a single batch result by its ID.
 * @param batchId - The batch ID string (e.g. "BATCH-20260401-0000")
 */
export const fetchBatchById = async (batchId: string): Promise<BatchResult | null> => {
  await delay(SIMULATED_DELAY_MS);
  return MOCK_BATCH_MAP[batchId] ?? null;
};

// ---------------------------------------------------------------------------
// Future API integration placeholders
// ---------------------------------------------------------------------------

/**
 * TODO: Real implementation will use:
 * import axios from 'axios';
 * const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });
 *
 * export const fetchBatches = async (params) => {
 *   const response = await api.get('/batches', { params });
 *   return response.data;
 * };
 */
