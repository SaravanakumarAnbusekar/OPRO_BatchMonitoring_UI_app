import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';

interface EmptyStateProps {
  /** Main heading text */
  title?: string;
  /** Supporting description */
  description?: string;
  /** Optional action button label */
  actionLabel?: string;
  /** Callback when action button is clicked */
  onAction?: () => void;
}

/**
 * Shown when a filtered table returns zero results.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No results found',
  description = 'Try adjusting your filters or clearing the search.',
  actionLabel,
  onAction,
}) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    py={8}
    px={4}
    textAlign="center"
    data-testid="empty-state"
    role="status"
    aria-live="polite"
    aria-label={title}
  >
    <SearchOffIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
    <Typography variant="h6" fontWeight={600} gutterBottom>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary" maxWidth={400}>
      {description}
    </Typography>
    {actionLabel && onAction && (
      <Button
        variant="outlined"
        color="primary"
        onClick={onAction}
        sx={{ mt: 3 }}
        data-testid="empty-state-action"
      >
        {actionLabel}
      </Button>
    )}
  </Box>
);

export default EmptyState;
