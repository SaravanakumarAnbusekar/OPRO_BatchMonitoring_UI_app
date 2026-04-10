/**
 * TypeScript interfaces and types for the CronJob Monitor application.
 * Schema aligned with ashley-oms-opro BatchResult / BatchStepResult.
 */

/** Batch job status values from ashley-oms-opro BatchJobStatus enum */
export type BatchJobStatus =
  | 'PENDING'
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'PARTIAL';

/** All possible batch status values */
export const BATCH_JOB_STATUSES: BatchJobStatus[] = [
  'PENDING',
  'QUEUED',
  'RUNNING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'PARTIAL',
];

/** Represents the result of a single batch execution step */
export interface BatchStepResult {
  step_name: string;
  success: boolean;
  records_processed: number;
  records_output: number;
  duration_seconds: number;
  error_message: string | null;
  details: Record<string, unknown>;
}

/** Represents a full batch execution result with all 13 steps */
export interface BatchResult {
  /** Format: "OPRO-YYYYMMDD-HHMMSS-<hex>" */
  batch_id: string;
  started_at: string;
  completed_at: string;
  success: boolean;
  /** Derived status for filtering */
  status: BatchJobStatus;
  total_orders: number;
  orders_allocated: number;
  orders_credit_held: number;
  orders_off_hold_realloc: number;
  orders_credit_exceeded: number;
  orders_failed_minimums: number;
  suggestions_generated: number;
  /** Sum of all step durations */
  total_duration_seconds: number;
  /* 13 pipeline steps in execution order */
  epic_clone: BatchStepResult;
  edw_fetch: BatchStepResult;
  unreserve_demand: BatchStepResult;
  credit_hold_check: BatchStepResult;
  off_hold_realloc: BatchStepResult;
  unallocated_credit: BatchStepResult;
  prioritize_orders: BatchStepResult;
  pass1_allocation: BatchStepResult;
  consolidation: BatchStepResult;
  re_establish_atp: BatchStepResult;
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
  /** 'all' shows every batch; other values filter by BatchJobStatus */
  status: 'all' | BatchJobStatus;
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

/** Ordered list of 13 step keys matching BatchResult fields */
export const STEP_KEYS: (keyof Pick<
  BatchResult,
  | 'epic_clone'
  | 'edw_fetch'
  | 'unreserve_demand'
  | 'credit_hold_check'
  | 'off_hold_realloc'
  | 'unallocated_credit'
  | 'prioritize_orders'
  | 'pass1_allocation'
  | 'consolidation'
  | 're_establish_atp'
  | 'pass2_allocation'
  | 'edd_comparison'
  | 'codis_suggestions'
>)[] = [
  'epic_clone',
  'edw_fetch',
  'unreserve_demand',
  'credit_hold_check',
  'off_hold_realloc',
  'unallocated_credit',
  'prioritize_orders',
  'pass1_allocation',
  'consolidation',
  're_establish_atp',
  'pass2_allocation',
  'edd_comparison',
  'codis_suggestions',
];

/** Human-readable step labels */
export const STEP_LABELS: Record<string, string> = {
  epic_clone: 'EPIC Clone Create',
  edw_fetch: 'EDW Fetch',
  unreserve_demand: 'Unreserve Demand',
  credit_hold_check: 'Credit Hold Check',
  off_hold_realloc: 'Off-Hold Re-allocation',
  unallocated_credit: 'Unallocated Credit',
  prioritize_orders: 'Prioritize Orders',
  pass1_allocation: 'Pass 1 Allocation',
  consolidation: 'Consolidation',
  re_establish_atp: 'Re-establish ATP',
  pass2_allocation: 'Pass 2 Allocation',
  edd_comparison: 'EDD Comparison',
  codis_suggestions: 'CODIS Suggestions',
};

/** Circled number characters for steps ①–⑬ */
export const STEP_NUMBERS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑪', '⑫', '⑬'];
