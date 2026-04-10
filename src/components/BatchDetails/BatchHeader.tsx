import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { BatchResult } from '../../types/batch';
import { formatDisplayDate, formatDisplayTime, formatDuration } from '../../utils/dateUtils';

interface BatchHeaderProps {
  batch: BatchResult;
}

/**
 * Displays the batch ID as a large centered heading with execution metadata below.
 * Uses the "professional analytics" style from the design spec.
 */
const BatchHeader: React.FC<BatchHeaderProps> = ({ batch }) => {
  const statusColor = batch.success ? 'success' : 'error';
  const StatusIcon = batch.success ? CheckCircleIcon : CancelIcon;

  return (
    <Box textAlign="center" mb={4} data-testid="batch-header">
      {/* Large Batch ID */}
      <Typography
        variant="h1"
        component="h1"
        sx={{
          fontSize: { xs: '28px', sm: '36px', md: '48px' },
          fontWeight: 700,
          letterSpacing: '1px',
          color: 'primary.main',
          fontFamily: 'monospace',
          mb: 1,
        }}
        data-testid="batch-header-id"
      >
        {batch.batch_id}
      </Typography>

      {/* Status chip */}
      <Box display="flex" justifyContent="center" mb={2}>
        <Chip
          icon={<StatusIcon fontSize="small" />}
          label={batch.success ? 'SUCCESS' : 'FAILED'}
          color={statusColor}
          variant="filled"
          sx={{ fontWeight: 700, fontSize: '13px', letterSpacing: '0.5px', px: 1 }}
          data-testid="batch-header-status"
        />
      </Box>

      {/* Metadata row */}
      <Box
        display="flex"
        flexWrap="wrap"
        justifyContent="center"
        gap={{ xs: 2, md: 4 }}
        sx={{ color: 'text.secondary' }}
      >
        <MetadataItem label="Date" value={formatDisplayDate(batch.started_at)} />
        <MetadataItem label="Start Time" value={formatDisplayTime(batch.started_at)} />
        <MetadataItem label="End Time" value={formatDisplayTime(batch.completed_at)} />
        <MetadataItem label="Duration" value={formatDuration(batch.total_duration_seconds)} />
      </Box>
    </Box>
  );
};

interface MetadataItemProps {
  label: string;
  value: string;
}

const MetadataItem: React.FC<MetadataItemProps> = ({ label, value }) => (
  <Box textAlign="center">
    <Typography variant="caption" color="text.secondary" display="block" textTransform="uppercase" letterSpacing="0.5px">
      {label}
    </Typography>
    <Typography variant="body1" fontWeight={600} color="text.primary">
      {value}
    </Typography>
  </Box>
);

export default BatchHeader;
