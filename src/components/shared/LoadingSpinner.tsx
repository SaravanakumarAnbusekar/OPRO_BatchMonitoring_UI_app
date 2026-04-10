import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  /** Optional message displayed below the spinner */
  message?: string;
  /** Size of the spinner (pixels or MUI size string) */
  size?: number | string;
  /** Whether to fill the full viewport height */
  fullHeight?: boolean;
}

/**
 * Reusable centered loading spinner with optional message.
 * @example <LoadingSpinner message="Fetching batches…" />
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading…',
  size = 48,
  fullHeight = false,
}) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    minHeight={fullHeight ? '60vh' : '200px'}
    gap={2}
    data-testid="loading-spinner"
    role="status"
    aria-label={message}
  >
    <CircularProgress size={size} color="primary" thickness={4} />
    {message && (
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    )}
  </Box>
);

export default LoadingSpinner;
