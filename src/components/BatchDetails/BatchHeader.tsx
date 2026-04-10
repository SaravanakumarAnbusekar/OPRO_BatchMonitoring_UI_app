import React from 'react';
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DownloadIcon from '@mui/icons-material/Download';
import { BatchResult } from '../../types/batch';
import { formatDisplayDate, formatDisplayTime, formatDuration } from '../../utils/dateUtils';

/** Status chip color mapping for BatchJobStatus */
const STATUS_CHIP_COLOR: Record<string, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
  COMPLETED: 'success',
  FAILED: 'error',
  PARTIAL: 'warning',
  CANCELLED: 'default',
  RUNNING: 'info',
  QUEUED: 'info',
  PENDING: 'default',
};

interface BatchHeaderProps {
  batch: BatchResult;
  onDownload?: () => void;
}

/**
 * Displays the batch ID as a large centered heading with execution metadata below.
 * Uses the "professional analytics" style from the design spec.
 */
const BatchHeader: React.FC<BatchHeaderProps> = ({ batch, onDownload }) => {
  const chipColor = STATUS_CHIP_COLOR[batch.status] ?? 'default';
  const StatusIcon = batch.success ? CheckCircleIcon : CancelIcon;

  return (
    <Box textAlign="center" mb={4} data-testid="batch-header">
      {/* Large Batch ID + Download button */}
      <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
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
        <Tooltip title="Download Batch Log (CSV)" arrow>
          <IconButton
            onClick={onDownload}
            color="primary"
            sx={{
              mb: 1,
              border: '2px solid',
              borderColor: 'primary.main',
              borderRadius: 1,
              p: 1.2,
              '&:hover': { bgcolor: 'primary.main', color: 'white' },
              transition: 'all 0.3s ease',
            }}
            aria-label="Download batch log as CSV"
            data-testid="batch-download-btn"
          >
            <DownloadIcon sx={{ fontSize: { xs: 24, md: 32 } }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Status chip */}
      <Box display="flex" justifyContent="center" mb={2}>
        <Chip
          icon={<StatusIcon fontSize="small" />}
          label={batch.status}
          color={chipColor}
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
        <MetadataItem label="Date" value={formatDisplayDate(new Date(batch.started_at))} />
        <MetadataItem label="Start Time" value={formatDisplayTime(new Date(batch.started_at))} />
        <MetadataItem label="End Time" value={formatDisplayTime(new Date(batch.completed_at))} />
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
