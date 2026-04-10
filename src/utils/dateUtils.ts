import { format, parseISO, isValid } from 'date-fns';

/**
 * Formats a Date object to "Apr 01, 2026" style.
 */
export const formatDisplayDate = (date: Date): string =>
  format(date, 'MMM dd, yyyy');

/**
 * Formats a Date object to "HH:mm:ss" (24-hour).
 */
export const formatDisplayTime = (date: Date): string =>
  format(date, 'HH:mm:ss');

/**
 * Formats a Date object to "Apr 01, 2026 HH:mm:ss".
 */
export const formatDateTime = (date: Date): string =>
  format(date, 'MMM dd, yyyy HH:mm:ss');

/**
 * Parses a YYYY-MM-DD string into a Date (local midnight).
 * Returns null if invalid.
 */
export const parseDateString = (dateStr: string): Date | null => {
  try {
    const parsed = parseISO(dateStr);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/**
 * Converts seconds to a human-readable duration string.
 * e.g. 125 → "2m 05s"
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, '0')}s`;
};

/** Time-frame filter options */
export type TimeFrame = 'all' | 'morning' | 'afternoon' | 'custom';

interface CustomRange {
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
}

/**
 * Checks whether a Date falls within the given time frame.
 * @param date       - The date to evaluate
 * @param timeFrame  - The selected time frame
 * @param custom     - Custom range (only used when timeFrame === 'custom')
 */
export const isWithinTimeFrame = (
  date: Date,
  timeFrame: TimeFrame,
  custom: CustomRange,
): boolean => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  switch (timeFrame) {
    case 'morning':
      return totalMinutes >= 0 && totalMinutes < 720; // 00:00–12:00
    case 'afternoon':
      return totalMinutes >= 720 && totalMinutes <= 1439; // 12:00–23:59
    case 'custom': {
      const parseHHMM = (hhmm: string): number => {
        const [h, m] = hhmm.split(':').map(Number);
        if (isNaN(h) || isNaN(m)) return -1;
        return h * 60 + m;
      };
      const startMin = parseHHMM(custom.start);
      const endMin = parseHHMM(custom.end);
      if (startMin < 0 || endMin < 0) return true; // Invalid custom range → show all
      return totalMinutes >= startMin && totalMinutes <= endMin;
    }
    default:
      return true;
  }
};

/**
 * Validates that a string matches "HH:mm" 24-hour format.
 */
export const isValidTimeString = (time: string): boolean =>
  /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);

/**
 * Validates that a batch ID matches "BATCH-YYYYMMDD-HHMM".
 */
export const isValidBatchIdFormat = (id: string): boolean =>
  /^BATCH-\d{8}-\d{4}$/.test(id);

/**
 * Returns a YYYY-MM-DD string for today's local date.
 */
export const todayISODate = (): string => format(new Date(), 'yyyy-MM-dd');
