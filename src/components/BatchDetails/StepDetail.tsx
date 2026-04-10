import React, { useState } from 'react';
import {
  Box,
  Collapse,
  IconButton,
  LinearProgress,
  Tooltip,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { BatchStepResult } from '../../types/batch';
import { formatDuration } from '../../utils/dateUtils';
import { stepPercentage, progressBarColor, formatNumber } from '../../utils/formatters';

interface StepDetailProps {
  step: BatchStepResult;
  stepNumber: string; // e.g. "①"
  stepIndex: number;
  totalDuration: number;
}

/**
 * Single execution step row with progress bar, percentage, and expandable detail.
 */
const StepDetail: React.FC<StepDetailProps> = ({
  step,
  stepNumber,
  stepIndex,
  totalDuration,
}) => {
  const [expanded, setExpanded] = useState(false);
  const percentage = stepPercentage(step.duration_seconds, totalDuration);
  const barColor = progressBarColor(percentage);

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: step.success ? 'divider' : 'error.light',
        borderRadius: 1,
        mb: 1,
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        bgcolor: step.success ? 'background.paper' : '#FFF5F5',
      }}
      data-testid={`step-detail-${stepIndex}`}
    >
      {/* Step row */}
      <Box
        display="flex"
        alignItems="center"
        gap={1.5}
        px={2}
        py={1.5}
      >
        {/* Step number */}
        <Typography
          sx={{ fontSize: '18px', minWidth: '28px', textAlign: 'center', userSelect: 'none' }}
          aria-hidden="true"
        >
          {stepNumber}
        </Typography>

        {/* Step name */}
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{ minWidth: { xs: '100px', sm: '160px' }, flexShrink: 0 }}
        >
          {step.step_name}
        </Typography>

        {/* Duration */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ minWidth: '56px', flexShrink: 0 }}
        >
          {formatDuration(step.duration_seconds)}
        </Typography>

        {/* Progress bar */}
        <Box sx={{ flexGrow: 1, mx: 1 }}>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height: 10,
              borderRadius: 5,
              bgcolor: '#E0E0E0',
              '& .MuiLinearProgress-bar': { bgcolor: barColor, borderRadius: 5 },
            }}
            aria-label={`${step.step_name} duration: ${percentage}% of total`}
          />
        </Box>

        {/* Percentage */}
        <Typography
          variant="caption"
          fontWeight={600}
          sx={{ minWidth: '36px', textAlign: 'right', color: barColor }}
        >
          {percentage}%
        </Typography>

        {/* Status icon */}
        {step.success ? (
          <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} aria-label="Step succeeded" />
        ) : (
          <CancelIcon sx={{ fontSize: 18, color: 'error.main' }} aria-label="Step failed" />
        )}

        {/* Expand toggle */}
        <Tooltip title={expanded ? 'Collapse' : 'Expand'} arrow>
          <IconButton
            size="small"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            aria-label={`${expanded ? 'Collapse' : 'Expand'} ${step.step_name} details`}
            data-testid={`step-expand-${stepIndex}`}
          >
            {expanded ? <RemoveIcon fontSize="small" /> : <AddIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Expandable detail panel */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box
          sx={{ px: 3, py: 2, bgcolor: '#FAFAFA', borderTop: '1px solid', borderColor: 'divider' }}
          data-testid={`step-detail-expanded-${stepIndex}`}
        >
          <Box display="flex" flexWrap="wrap" gap={3}>
            <DetailItem label="Duration" value={formatDuration(step.duration_seconds)} />
            <DetailItem label="Records Processed" value={formatNumber(step.records_processed)} />
            <DetailItem label="Records Output" value={formatNumber(step.records_output)} />
            {step.error_message && (
              <Box width="100%">
                <Typography variant="caption" color="text.secondary" textTransform="uppercase">
                  Error
                </Typography>
                <Typography variant="body2" color="error.main" fontWeight={500}>
                  {step.error_message}
                </Typography>
              </Box>
            )}
            {step.details && Object.keys(step.details).length > 0 && (
              <Box width="100%">
                <Typography variant="caption" color="text.secondary" textTransform="uppercase" display="block" mb={0.5}>
                  Details
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                  {Object.entries(step.details).map(([key, val]) => (
                    <Typography key={key} component="li" variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                      <strong>{key.replace(/_/g, ' ')}:</strong> {String(val)}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" textTransform="uppercase" display="block">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={500}>
      {value}
    </Typography>
  </Box>
);

export default StepDetail;
