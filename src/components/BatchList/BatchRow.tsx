import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  IconButton,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { BatchResult } from '../../types/batch';
import { formatDisplayDate, formatDisplayTime } from '../../utils/dateUtils';
import { formatNumber } from '../../utils/formatters';

interface BatchRowProps {
  batch: BatchResult;
  /** 1-based row index for accessibility */
  rowIndex: number;
}

/**
 * A single row in the batch list table.
 * Memoized with React.memo to prevent unnecessary re-renders.
 */
const BatchRow: React.FC<BatchRowProps> = memo(({ batch, rowIndex }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/batch/${encodeURIComponent(batch.batch_id)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNavigate();
    }
  };

  return (
    <TableRow
      hover
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="row"
      aria-rowindex={rowIndex}
      aria-label={`Batch ${batch.batch_id}, ${batch.success ? 'Success' : 'Failed'}`}
      sx={{
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        '&:focus': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: '-2px' },
      }}
      data-testid={`batch-row-${batch.batch_id}`}
    >
      {/* Batch ID */}
      <TableCell>
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{ fontFamily: 'monospace', letterSpacing: '0.3px' }}
        >
          {batch.batch_id}
        </Typography>
      </TableCell>

      {/* Date + Time */}
      <TableCell>
        <Typography variant="body2">{formatDisplayDate(new Date(batch.started_at))}</Typography>
        <Typography variant="caption" color="text.secondary">
          {formatDisplayTime(new Date(batch.started_at))}
        </Typography>
      </TableCell>

      {/* Status */}
      <TableCell>
        <Box display="flex" alignItems="center" gap={0.75}>
          {batch.success ? (
            <CheckCircleIcon
              sx={{ fontSize: 16, color: 'success.main' }}
              aria-hidden="true"
            />
          ) : (
            <CancelIcon
              sx={{ fontSize: 16, color: 'error.main' }}
              aria-hidden="true"
            />
          )}
          <Typography
            variant="body2"
            fontWeight={500}
            color={batch.success ? 'success.main' : 'error.main'}
          >
            {batch.status}
          </Typography>
        </Box>
      </TableCell>

      {/* Total Orders */}
      <TableCell>
        <Typography variant="body2">{formatNumber(batch.total_orders)}</Typography>
      </TableCell>

      {/* Action */}
      <TableCell align="center">
        <Tooltip title="View Details" arrow>
          <IconButton
            size="small"
            color="primary"
            onClick={(e) => { e.stopPropagation(); handleNavigate(); }}
            aria-label={`View details for ${batch.batch_id}`}
            data-testid={`batch-row-action-${batch.batch_id}`}
          >
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
});

BatchRow.displayName = 'BatchRow';

export default BatchRow;
