/**
 * Export service – placeholder implementations.
 * Future: integrate jsPDF, xlsx, and email APIs here.
 */
import { BatchResult } from '../types/batch';

/** Exports the given batch as a PDF. Currently shows a "Coming Soon" toast. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const exportBatchPdf = async (_batch: BatchResult): Promise<void> => {
  // TODO: Implement PDF export using jsPDF or react-pdf
  return Promise.resolve();
};

/** Exports all batches as a CSV file. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const exportBatchesCsv = async (_batches: BatchResult[]): Promise<void> => {
  // TODO: Implement CSV export
  return Promise.resolve();
};

/** Exports batches as an Excel file. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const exportBatchesExcel = async (_batches: BatchResult[]): Promise<void> => {
  // TODO: Implement Excel export using xlsx library
  return Promise.resolve();
};

/** Sends batch report via email. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const emailBatchReport = async (_batch: BatchResult, _to: string): Promise<void> => {
  // TODO: Implement email via SendGrid or internal SMTP API
  return Promise.resolve();
};
