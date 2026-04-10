import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import { BatchResult, STEP_KEYS, STEP_LABELS, STEP_NUMBERS } from '../../types/batch';
import StepDetail from './StepDetail';

interface ExecutionTimelineProps {
  batch: BatchResult;
}

/**
 * Execution breakdown section with six numbered step rows.
 * Uses professional double-line style for the section header.
 */
const ExecutionTimeline: React.FC<ExecutionTimelineProps> = ({ batch }) => (
  <Paper
    variant="outlined"
    sx={{ mb: 4, overflow: 'hidden' }}
    data-testid="execution-timeline"
    aria-label="Execution timeline"
    role="region"
  >
    {/* Section header with double-line border effect */}
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
      <TimelineIcon sx={{ color: 'primary.contrastText', fontSize: 20 }} aria-hidden="true" />
      <Typography variant="h3" sx={{ color: 'primary.contrastText', fontSize: '18px', fontWeight: 600 }}>
        Execution Breakdown
      </Typography>
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', ml: 'auto' }}>
        {STEP_KEYS.length} steps
      </Typography>
    </Box>

    {/* Column header legend */}
    <Box
      display="flex"
      alignItems="center"
      gap={1.5}
      px={2}
      py={1}
      sx={{ bgcolor: '#F9F9F9', borderBottom: '1px solid', borderColor: 'divider' }}
      aria-hidden="true"
    >
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: '28px' }}>
        #
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: { xs: '100px', sm: '160px' } }}>
        Step Name
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: '56px' }}>
        Duration
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1, mx: 1 }}>
        Progress
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: '36px', textAlign: 'right' }}>
        %
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: '18px' }}>
        Status
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: '32px' }}>
        Detail
      </Typography>
    </Box>

    {/* Step rows */}
    <Box p={2} role="list" aria-label="Execution steps">
      {STEP_KEYS.map((key, index) => (
        <Box key={key} role="listitem">
          <StepDetail
            step={batch[key]}
            stepNumber={STEP_NUMBERS[index]}
            stepIndex={index}
            totalDuration={batch.total_duration_seconds}
          />
        </Box>
      ))}
    </Box>

    {/* Footer summary */}
    <Box
      px={3}
      py={1.5}
      sx={{ bgcolor: '#F5F5F5', borderTop: '1px solid', borderColor: 'divider' }}
    >
      <Typography variant="caption" color="text.secondary">
        Step labels:&nbsp;
        {STEP_KEYS.map((key) => STEP_LABELS[key]).join(' → ')}
      </Typography>
    </Box>
  </Paper>
);

export default ExecutionTimeline;
