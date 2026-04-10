import React from 'react';
import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { BatchResult } from '../../types/batch';
import { formatNumber, allocationRate } from '../../utils/formatters';
import { ashleyColors } from '../../theme/ashleyTheme';

interface MetricCardsProps {
  batch: BatchResult;
  /** Called when a "View All" button is clicked (future feature) */
  onViewAll?: (metricType: 'orders' | 'allocated' | 'suggestions') => void;
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor: string;
  metricType: 'orders' | 'allocated' | 'suggestions';
  onViewAll?: (type: 'orders' | 'allocated' | 'suggestions') => void;
}

/**
 * Individual metric card with border, large value, and "View All" button.
 */
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accentColor,
  metricType,
  onViewAll,
}) => (
  <Paper
    variant="outlined"
    sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', borderColor: ashleyColors.neutral.border }}
    data-testid={`metric-card-${metricType}`}
  >
    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
      <Box sx={{ color: accentColor }}>{icon}</Box>
      <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>
        {title}
      </Typography>
    </Box>

    <Typography
      variant="h2"
      sx={{ fontSize: '36px', fontWeight: 700, color: accentColor, mb: 0.5, lineHeight: 1 }}
      aria-label={`${title}: ${value}`}
    >
      {value}
    </Typography>

    <Typography variant="caption" color="text.secondary" mb="auto">
      {subtitle}
    </Typography>

    <Divider sx={{ my: 2 }} />

    <Button
      variant="text"
      size="small"
      onClick={() => onViewAll?.(metricType)}
      sx={{
        alignSelf: 'flex-start',
        color: accentColor,
        fontWeight: 600,
        p: 0,
        '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
      }}
      aria-label={`View all ${title.toLowerCase()}`}
      data-testid={`metric-card-view-all-${metricType}`}
    >
      View All →
    </Button>
  </Paper>
);

/**
 * Three metric cards: Total Orders, Allocated Orders, Suggestions Generated.
 */
const MetricCards: React.FC<MetricCardsProps> = ({ batch, onViewAll }) => {
  const allocationPct = allocationRate(batch.orders_allocated, batch.total_orders);

  return (
    <Grid container spacing={3} mb={4} data-testid="metric-cards">
      <Grid size={{ xs: 12, md: 4 }}>
        <MetricCard
          title="Total Orders"
          value={formatNumber(batch.total_orders)}
          subtitle="Orders processed in this batch"
          icon={<ShoppingCartIcon />}
          accentColor={ashleyColors.metrics.primary}
          metricType="orders"
          onViewAll={onViewAll}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <MetricCard
          title="Allocated Orders"
          value={formatNumber(batch.orders_allocated)}
          subtitle={`${allocationPct} allocation rate`}
          icon={<InventoryIcon />}
          accentColor={ashleyColors.metrics.secondary}
          metricType="allocated"
          onViewAll={onViewAll}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <MetricCard
          title="Suggestions Generated"
          value={formatNumber(batch.suggestions_generated)}
          subtitle="CODIS optimization suggestions"
          icon={<LightbulbIcon />}
          accentColor={ashleyColors.metrics.accent}
          metricType="suggestions"
          onViewAll={onViewAll}
        />
      </Grid>
    </Grid>
  );
};

export default MetricCards;
