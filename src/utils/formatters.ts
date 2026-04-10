/**
 * Data formatting utilities for display in the UI.
 */

/**
 * Formats a number with locale-aware thousands separators.
 * e.g. 1200 → "1,200"
 */
export const formatNumber = (n: number): string =>
  n.toLocaleString('en-US');

/**
 * Formats a percentage to one decimal place.
 * e.g. 0.852 → "85.2%"
 */
export const formatPercent = (ratio: number): string =>
  `${(ratio * 100).toFixed(1)}%`;

/**
 * Returns a step's percentage contribution to the total batch duration.
 * @param stepDuration  - Duration of this step in seconds
 * @param totalDuration - Total batch duration in seconds
 */
export const stepPercentage = (stepDuration: number, totalDuration: number): number => {
  if (totalDuration === 0) return 0;
  return Math.round((stepDuration / totalDuration) * 100);
};

/**
 * Returns an ASCII-style progress bar string.
 * e.g. percentage=60, width=20 → "████████████░░░░░░░░"
 */
export const asciiProgressBar = (percentage: number, width = 20): string => {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  return '▓'.repeat(filled) + '░'.repeat(empty);
};

/**
 * Returns a color hex string for a progress bar based on percentage of total.
 * Used to color-code execution step bars.
 */
export const progressBarColor = (percentage: number): string => {
  if (percentage >= 35) return '#C62828'; // red – high duration
  if (percentage >= 20) return '#F57C00'; // orange – medium duration
  return '#2E7D32'; // green – low duration
};

/**
 * Truncates a string to maxLength, appending "…" if truncated.
 */
export const truncate = (str: string, maxLength: number): string =>
  str.length > maxLength ? `${str.slice(0, maxLength - 1)}…` : str;

/**
 * Builds the status label for a batch.
 */
export const batchStatusLabel = (success: boolean): string =>
  success ? 'Success' : 'Failed';

/**
 * Returns the order allocation rate as a percentage string.
 * e.g. allocated=950, total=1000 → "95.0%"
 */
export const allocationRate = (allocated: number, total: number): string =>
  total === 0 ? '0.0%' : formatPercent(allocated / total);
