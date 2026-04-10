/**
 * TypeScript interfaces and types for the CronJob Monitor application.
 */

/** Represents the result of a single batch execution step */
export interface BatchStepResult {
  step_name: string;
  started_at: Date;
  completed_at: Date;
  duration_seconds: number;
  records_processed: number;
  success: boolean;
  error_message?: string;
}

/** Represents a full batch execution result with all six steps */
export interface BatchResult {
  /** Format: "BATCH-YYYYMMDD-HHMM" */
  batch_id: string;
  started_at: Date;
  completed_at: Date;
  success: boolean;
  /** Random 800–1200 */
  total_orders: number;
  /** 85–95% of total_orders */
  orders_allocated: number;
  /** 40–50% of total_orders */
  suggestions_generated: number;
  /** Sum of all step durations */
  total_duration_seconds: number;
  edw_fetch: BatchStepResult;
  pass1_allocation: BatchStepResult;
  consolidation: BatchStepResult;
  pass2_allocation: BatchStepResult;
  edd_comparison: BatchStepResult;
  codis_suggestions: BatchStepResult;
}

/** Filter state managed via context and URL params */
export interface FilterState {
  jobId: string;
  date: string | null; // ISO date string YYYY-MM-DD
  timeFrame: 'all' | 'morning' | 'afternoon' | 'custom';
  customTimeStart: string;
  customTimeEnd: string;
  /** 'all' shows every batch; 'success' / 'failed' filter by batch outcome */
  status: 'all' | 'success' | 'failed';
}

/** Default empty filter state */
export const DEFAULT_FILTER_STATE: FilterState = {
  jobId: '',
  date: null,
  timeFrame: 'all',
  customTimeStart: '',
  customTimeEnd: '',
  status: 'all',
};

/** Time frame display labels */
export const TIME_FRAME_OPTIONS = [
  { value: 'all', label: 'All Day' },
  { value: 'morning', label: 'Morning (00:00–12:00)' },
  { value: 'afternoon', label: 'Afternoon (12:00–23:59)' },
  { value: 'custom', label: 'Custom' },
] as const;

/** Ordered list of step keys matching BatchResult fields */
export const STEP_KEYS: (keyof Pick<
  BatchResult,
  | 'edw_fetch'
  | 'pass1_allocation'
  | 'consolidation'
  | 'pass2_allocation'
  | 'edd_comparison'
  | 'codis_suggestions'
>)[] = [
  'edw_fetch',
  'pass1_allocation',
  'consolidation',
  'pass2_allocation',
  'edd_comparison',
  'codis_suggestions',
];

/** Human-readable step labels */
export const STEP_LABELS: Record<string, string> = {
  edw_fetch: 'EDW Fetch',
  pass1_allocation: 'Pass 1 Allocation',
  consolidation: 'Consolidation',
  pass2_allocation: 'Pass 2 Allocation',
  edd_comparison: 'EDD Comparison',
  codis_suggestions: 'CODIS Suggestions',
};

/** Circled number characters for steps ①–⑥ */
export const STEP_NUMBERS = ['①', '②', '③', '④', '⑤', '⑥'];
