import { BatchResult, BatchStepResult, BatchJobStatus, STEP_KEYS } from '../types/batch';

/**
 * Base batch data from batch_run_mock.json – the canonical shape
 * produced by the ashley-oms-opro backend.
 */
const BASE_BATCH: BatchResult = {
  batch_id: 'OPRO-20260410-091041-055f467a',
  started_at: '2026-04-10T09:10:41.001981Z',
  completed_at: '2026-04-10T09:10:42.364609Z',
  success: true,
  status: 'COMPLETED',
  total_orders: 10,
  orders_allocated: 7,
  orders_credit_held: 0,
  orders_off_hold_realloc: 0,
  orders_credit_exceeded: 0,
  orders_failed_minimums: 2,
  suggestions_generated: 10,
  total_duration_seconds: 1.363,
  epic_clone: { step_name: 'EPIC Clone Create', success: true, records_processed: 1, records_output: 1, duration_seconds: 1.104, error_message: null, details: { clone_id: 'clone-OPRO-20260410-091041-055f467a', epic_mode: 'mock', is_placeholder: true } },
  edw_fetch: { step_name: 'EDW Fetch', success: true, records_processed: 10, records_output: 10, duration_seconds: 0.1, error_message: null, details: {} },
  unreserve_demand: { step_name: 'Unreserve Demand (EPIC Clone)', success: true, records_processed: 10, records_output: 10, duration_seconds: 0.001, error_message: null, details: { clone_id: 'clone-OPRO-20260410-091041-055f467a', orders_to_unreserve: 10, is_placeholder: true } },
  credit_hold_check: { step_name: 'Credit Hold Check (CS180)', success: true, records_processed: 10, records_output: 0, duration_seconds: 0.001, error_message: null, details: { orders_checked: 10, unique_customers: 6, orders_on_hold: 0 } },
  off_hold_realloc: { step_name: 'Off-Hold Re-allocation (CR010L)', success: true, records_processed: 10, records_output: 0, duration_seconds: 0.0, error_message: null, details: { orders_taken_off_hold: 0, orders_excluded_type2: 0 } },
  unallocated_credit: { step_name: 'Calculate Unallocated Credit (CS147A/B)', success: true, records_processed: 10, records_output: 0, duration_seconds: 0.0, error_message: null, details: { customers_processed: 6, customers_with_credit: 6, customers_exceeded: 0 } },
  prioritize_orders: { step_name: 'Prioritize Open Orders (CS146X1)', success: true, records_processed: 0, records_output: 2, duration_seconds: 0.008, error_message: null, details: { prioritized_order_count: 10, orders_failed_minimums: 2 } },
  pass1_allocation: { step_name: 'Pass 1 Allocation', success: true, records_processed: 0, records_output: 0, duration_seconds: 0.0, error_message: null, details: {} },
  consolidation: { step_name: 'Consolidation', success: true, records_processed: 8, records_output: 6, duration_seconds: 0.002, error_message: null, details: { total_groups: 6, exempt_solo: 3, groups_meeting_minimum: 2, groups_below_minimum: 1, orders_deferred: 1 } },
  re_establish_atp: { step_name: 'Re-establish Gross ATP (CS146S4)', success: true, records_processed: 10, records_output: 0, duration_seconds: 0.0, error_message: null, details: { clone_id: 'clone-OPRO-20260410-091041-055f467a', pass1_allocations_released: 0, consolidated_groups: 3, consolidated_order_lines: 5 } },
  pass2_allocation: { step_name: 'Pass 2 Allocation (CS146S3)', success: true, records_processed: 7, records_output: 7, duration_seconds: 0.0, error_message: null, details: { allocated: 7, partial: 0, failed: 0, tie_groups: 5 } },
  edd_comparison: { step_name: 'EDD Comparison', success: true, records_processed: 10, records_output: 7, duration_seconds: 0.0, error_message: null, details: { improved: 2, unchanged: 1, delayed: 4, avg_change_days: 1.57 } },
  codis_suggestions: { step_name: 'CODIS Suggestions', success: true, records_processed: 10, records_output: 10, duration_seconds: 0.128, error_message: null, details: { total_suggestions: 10, published_to_kafka: 0, publish_failed: 10, allocate_count: 7, unallocate_count: 3 } },
};

/** Seeded deterministic random */
const seededRand = (seed: number): (() => number) => {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
};
const rand = seededRand(20260410);
const randInt = (min: number, max: number): number => Math.floor(rand() * (max - min + 1)) + min;
const randFloat = (min: number, max: number): number => +(rand() * (max - min) + min).toFixed(3);

/** Generate a hex string of given length */
const randHex = (len: number): string => {
  let h = '';
  for (let i = 0; i < len; i++) h += Math.floor(rand() * 16).toString(16);
  return h;
};

/** Deep-clone and vary a step */
const varyStep = (base: BatchStepResult, factor: number, fail: boolean): BatchStepResult => ({
  ...base,
  success: !fail,
  records_processed: Math.max(0, base.records_processed + randInt(-2, 5)),
  records_output: Math.max(0, base.records_output + randInt(-1, 3)),
  duration_seconds: +(base.duration_seconds * factor).toFixed(3),
  error_message: fail ? 'Timeout: step exceeded maximum execution threshold. Contact OPRO support.' : null,
  details: { ...base.details },
});

/** Status distribution for mock data variety */
const MOCK_STATUSES: BatchJobStatus[] = [
  'COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED',
  'COMPLETED', 'FAILED', 'PARTIAL', 'COMPLETED', 'CANCELLED',
];

/**
 * Generates 10 mock batch results based on batch_run_mock.json schema.
 */
const generateMockBatches = (): BatchResult[] => {
  const batches: BatchResult[] = [];

  for (let i = 0; i < 10; i++) {
    const hourOffset = i * 2;
    const baseHour = 6 + hourOffset; // 06:00 → 24:00 spread
    const day = baseHour >= 24 ? 11 : 10; // April 10-11, 2026
    const hour = baseHour % 24;
    const min = randInt(0, 59);
    const sec = randInt(0, 59);
    const pad2 = (n: number) => String(n).padStart(2, '0');

    const status = MOCK_STATUSES[i];
    const isFailed = status === 'FAILED';
    const isPartial = status === 'PARTIAL';
    const isCancelled = status === 'CANCELLED';
    const success = status === 'COMPLETED';

    const batchId = `OPRO-202604${pad2(day)}-${pad2(hour)}${pad2(min)}${pad2(sec)}-${randHex(8)}`;
    const startedAt = `2026-04-${pad2(day)}T${pad2(hour)}:${pad2(min)}:${pad2(sec)}.${String(randInt(0, 999)).padStart(3, '0')}Z`;
    const durationFactor = randFloat(0.5, 3.0);
    const totalDuration = +(BASE_BATCH.total_duration_seconds * durationFactor).toFixed(3);
    const completedMs = new Date(startedAt).getTime() + totalDuration * 1000;
    const completedAt = new Date(completedMs).toISOString();

    const totalOrders = randInt(5, 25);
    const ordersAllocated = isFailed ? 0 : isCancelled ? 0 : Math.max(0, totalOrders - randInt(0, 5));
    const ordersCreditHeld = randInt(0, 2);
    const ordersFailedMinimums = randInt(0, 3);
    const suggestionsGenerated = isFailed ? 0 : totalOrders;
    const failStepIdx = isFailed ? randInt(0, 12) : isPartial ? randInt(8, 12) : -1;

    const steps: Record<string, BatchStepResult> = {};
    STEP_KEYS.forEach((key, idx) => {
      const baseStep = BASE_BATCH[key];
      steps[key] = varyStep(baseStep, durationFactor, idx === failStepIdx);
    });

    batches.push({
      batch_id: batchId,
      started_at: startedAt,
      completed_at: completedAt,
      success,
      status,
      total_orders: totalOrders,
      orders_allocated: ordersAllocated,
      orders_credit_held: ordersCreditHeld,
      orders_off_hold_realloc: randInt(0, 1),
      orders_credit_exceeded: randInt(0, 1),
      orders_failed_minimums: ordersFailedMinimums,
      suggestions_generated: suggestionsGenerated,
      total_duration_seconds: totalDuration,
      ...(steps as Pick<BatchResult,
        'epic_clone' | 'edw_fetch' | 'unreserve_demand' | 'credit_hold_check' |
        'off_hold_realloc' | 'unallocated_credit' | 'prioritize_orders' |
        'pass1_allocation' | 'consolidation' | 're_establish_atp' |
        'pass2_allocation' | 'edd_comparison' | 'codis_suggestions'>),
    });
  }

  // Sort descending by start time (newest first)
  return batches.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
};

/** Pre-generated mock batch dataset */
export const MOCK_BATCHES: BatchResult[] = generateMockBatches();

/** Lookup map for O(1) batch retrieval by ID */
export const MOCK_BATCH_MAP: Record<string, BatchResult> = Object.fromEntries(
  MOCK_BATCHES.map((b) => [b.batch_id, b]),
);

/** Returns all distinct batch IDs for autocomplete suggestions */
export const BATCH_ID_SUGGESTIONS: string[] = MOCK_BATCHES.map((b) => b.batch_id);

// ─── DEV CONSOLE INSPECTION ──────────────────────────────────────────────────
if (import.meta.env.DEV) {
  console.group('%c MOCK DATA — OPRO Cronjob Monitor', 'color:#E87722;font-weight:bold;font-size:13px');
  console.log('%c MOCK_BATCHES (10 batches, newest first)', 'color:#78909C;font-weight:600');
  console.table(
    MOCK_BATCHES.map((b) => ({
      batch_id: b.batch_id,
      started_at: b.started_at,
      status: b.status,
      total_orders: b.total_orders,
      orders_allocated: b.orders_allocated,
      suggestions: b.suggestions_generated,
      duration_secs: b.total_duration_seconds,
    })),
  );
  console.groupEnd();
}
