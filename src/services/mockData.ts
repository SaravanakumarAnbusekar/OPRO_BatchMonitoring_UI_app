import { BatchResult, BatchStepResult } from '../types/batch';

/** Seeded deterministic random to ensure consistent mock data */
const seededRand = (seed: number): (() => number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

const rand = seededRand(20260401);

const randInt = (min: number, max: number): number =>
  Math.floor(rand() * (max - min + 1)) + min;

const randBetween = (min: number, max: number): number =>
  rand() * (max - min) + min;

/**
 * Builds a single BatchStepResult given start time and duration range.
 */
const buildStep = (
  stepName: string,
  startTime: Date,
  minDuration: number,
  maxDuration: number,
  recordsProcessed: number,
  forceFailure = false,
): BatchStepResult => {
  const duration = randInt(minDuration, maxDuration);
  const completed = new Date(startTime.getTime() + duration * 1000);
  const success = !forceFailure;
  return {
    step_name: stepName,
    started_at: startTime,
    completed_at: completed,
    duration_seconds: duration,
    records_processed: recordsProcessed,
    success,
    error_message: forceFailure
      ? 'Timeout: step exceeded maximum execution threshold. Contact OPRO support.'
      : undefined,
  };
};

/**
 * Generates a single BatchResult.
 * @param batchStart - The batch start time
 * @param isFailed   - Whether this batch should fail
 */
const generateBatch = (batchStart: Date, isFailed: boolean): BatchResult => {
  const totalOrders = randInt(800, 1200);
  const ordersAllocated = Math.floor(totalOrders * randBetween(0.85, 0.95));
  const suggestionsGenerated = Math.floor(totalOrders * randBetween(0.40, 0.50));

  // Determine which step fails (if any): step index 0–5
  const failureStepIndex = isFailed ? randInt(0, 5) : -1;

  // Step start times chain together
  let currentTime = new Date(batchStart);

  const edwFetch = buildStep('EDW Fetch', currentTime, 30, 60, totalOrders, failureStepIndex === 0);
  currentTime = new Date(currentTime.getTime() + edwFetch.duration_seconds * 1000);

  const pass1 = buildStep('Pass 1 Allocation', currentTime, 90, 150, totalOrders, failureStepIndex === 1);
  currentTime = new Date(currentTime.getTime() + pass1.duration_seconds * 1000);

  const consolidation = buildStep('Consolidation', currentTime, 20, 40, ordersAllocated, failureStepIndex === 2);
  currentTime = new Date(currentTime.getTime() + consolidation.duration_seconds * 1000);

  const pass2 = buildStep('Pass 2 Allocation', currentTime, 70, 120, ordersAllocated, failureStepIndex === 3);
  currentTime = new Date(currentTime.getTime() + pass2.duration_seconds * 1000);

  const eddComparison = buildStep('EDD Comparison', currentTime, 60, 100, ordersAllocated, failureStepIndex === 4);
  currentTime = new Date(currentTime.getTime() + eddComparison.duration_seconds * 1000);

  const codis = buildStep('CODIS Suggestions', currentTime, 120, 180, suggestionsGenerated, failureStepIndex === 5);
  currentTime = new Date(currentTime.getTime() + codis.duration_seconds * 1000);

  const total =
    edwFetch.duration_seconds +
    pass1.duration_seconds +
    consolidation.duration_seconds +
    pass2.duration_seconds +
    eddComparison.duration_seconds +
    codis.duration_seconds;

  // Format batch ID as BATCH-YYYYMMDD-HHMM
  const pad = (n: number) => String(n).padStart(2, '0');
  const d = batchStart;
  const batchId = `BATCH-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;

  return {
    batch_id: batchId,
    started_at: batchStart,
    completed_at: currentTime,
    success: !isFailed,
    total_orders: totalOrders,
    orders_allocated: ordersAllocated,
    suggestions_generated: suggestionsGenerated,
    total_duration_seconds: total,
    edw_fetch: edwFetch,
    pass1_allocation: pass1,
    consolidation,
    pass2_allocation: pass2,
    edd_comparison: eddComparison,
    codis_suggestions: codis,
  };
};

/**
 * Generates 20 mock batch results spanning April 1–2, 2026 (every 2 hours).
 * 90% success rate, 10% failure rate.
 */
const generateMockBatches = (): BatchResult[] => {
  const batches: BatchResult[] = [];
  // April 1 00:00 → April 2 14:00 = 20 slots every 2 hours
  const baseDate = new Date(2026, 3, 1, 0, 0, 0); // Month is 0-indexed

  for (let i = 0; i < 20; i++) {
    const batchStart = new Date(baseDate.getTime() + i * 2 * 60 * 60 * 1000);
    const isFailed = rand() < 0.1; // 10% failure rate
    batches.push(generateBatch(batchStart, isFailed));
  }

  // Sort descending by start time (newest first)
  return batches.sort((a, b) => b.started_at.getTime() - a.started_at.getTime());
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
// Remove these lines before connecting a real backend.
if (import.meta.env.DEV) {
  console.group('%c MOCK DATA — OPRO Cronjob Monitor', 'color:#E87722;font-weight:bold;font-size:13px');

  console.log('%c MOCK_BATCHES (full array — 20 batches, newest first)', 'color:#78909C;font-weight:600');
  console.table(
    MOCK_BATCHES.map((b) => ({
      batch_id:             b.batch_id,
      started_at:           b.started_at.toLocaleString(),
      completed_at:         b.completed_at.toLocaleString(),
      success:              b.success,
      total_orders:         b.total_orders,
      orders_allocated:     b.orders_allocated,
      suggestions:          b.suggestions_generated,
      duration_secs:        b.total_duration_seconds,
    })),
  );

  console.log('%c MOCK_BATCH_MAP (object — key = batch_id)', 'color:#78909C;font-weight:600');
  console.log(MOCK_BATCH_MAP);

  console.log('%c BATCH_ID_SUGGESTIONS (autocomplete list)', 'color:#78909C;font-weight:600');
  console.log(BATCH_ID_SUGGESTIONS);

  console.log('%c Click any batch below to expand all 6 step details:', 'color:#78909C;font-weight:600');
  MOCK_BATCHES.forEach((b) => {
    console.groupCollapsed(`%c ${b.batch_id}  [${b.success ? '✓ SUCCESS' : '✕ FAILED'}]`, `color:${b.success ? '#2E7D32' : '#C62828'};font-weight:600`);
    console.table([
      b.edw_fetch,
      b.pass1_allocation,
      b.consolidation,
      b.pass2_allocation,
      b.edd_comparison,
      b.codis_suggestions,
    ].map((s) => ({
      step:             s.step_name,
      started_at:       s.started_at.toLocaleTimeString(),
      completed_at:     s.completed_at.toLocaleTimeString(),
      duration_secs:    s.duration_seconds,
      records:          s.records_processed,
      success:          s.success,
      error:            s.error_message ?? '—',
    })));
    console.groupEnd();
  });

  console.groupEnd();
}
