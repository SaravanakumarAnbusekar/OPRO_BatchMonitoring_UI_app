import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { BatchResult } from '../../types/batch';
import { formatNumber } from '../../utils/formatters';
import { formatDuration } from '../../utils/dateUtils';

interface BatchSummaryTableProps {
  batch: BatchResult;
}

/** 5 major batch metrics displayed in a table */
interface SummaryRow {
  metric: string;
  value: string;
  description: string;
}

/**
 * Summary table highlighting 5 major details about the batch.
 * Placed between MetricCards and ExecutionTimeline.
 * Follows the existing Paper/Table theme from BatchTable.
 */
const BatchSummaryTable: React.FC<BatchSummaryTableProps> = ({ batch }) => {
  const allocationRate =
    batch.total_orders > 0
      ? `${((batch.orders_allocated / batch.total_orders) * 100).toFixed(1)}%`
      : '0.0%';

  const rows: SummaryRow[] = [
    {
      metric: 'Total Orders vs Allocated',
      value: `${formatNumber(batch.orders_allocated)} / ${formatNumber(batch.total_orders)} (${allocationRate})`,
      description: 'Orders successfully allocated out of total orders processed in this batch run',
    },
    {
      metric: 'Orders on Credit Hold',
      value: formatNumber(batch.orders_credit_held),
      description: 'Orders placed on credit hold during CS180 credit check step',
    },
    {
      metric: 'Orders Failed Minimums',
      value: formatNumber(batch.orders_failed_minimums),
      description: 'Orders that did not meet shipping minimum thresholds (dollar or cube)',
    },
    {
      metric: 'Suggestions Generated',
      value: formatNumber(batch.suggestions_generated),
      description: 'Total CODIS optimization suggestions published (allocate + unallocate)',
    },
    {
      metric: 'Total Execution Time',
      value: formatDuration(batch.total_duration_seconds),
      description: 'End-to-end batch duration across all 13 pipeline steps',
    },
  ];

  return (
    <Paper
      variant="outlined"
      sx={{ mb: 4, overflow: 'hidden' }}
      data-testid="batch-summary-table"
      aria-label="Batch summary"
      role="region"
    >
      {/* Section header – matches ExecutionTimeline style */}
      <Box
        sx={{
          px: 3,
          py: 2,
          bgcolor: 'primary.main',
          borderBottom: '3px double',
          borderColor: 'primary.dark',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <AssessmentIcon sx={{ color: 'primary.contrastText', fontSize: 20 }} aria-hidden="true" />
        <Typography variant="h3" sx={{ color: 'primary.contrastText', fontSize: '18px', fontWeight: 600 }}>
          Batch Summary
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', ml: 'auto' }}>
          5 key metrics
        </Typography>
      </Box>

      <TableContainer>
        <Table size="small" aria-label="Batch summary table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '13px', width: '30%' }}>
                Metric
              </TableCell>
              <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '13px', width: '25%' }}>
                Value
              </TableCell>
              <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '13px' }}>
                Description
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.metric} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {row.metric}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ fontFamily: 'monospace' }}>
                    {row.value}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {row.description}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default BatchSummaryTable;
