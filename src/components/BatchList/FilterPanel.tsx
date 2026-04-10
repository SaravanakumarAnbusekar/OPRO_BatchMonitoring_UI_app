import React, { useCallback, useEffect, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { useFilterContext } from '../../contexts/FilterContext';
import { FilterState, TIME_FRAME_OPTIONS } from '../../types/batch';
import { BATCH_ID_SUGGESTIONS } from '../../services/mockData';
import { isValidBatchIdFormat } from '../../utils/dateUtils';
import CustomTimePicker from './CustomTimePicker';

interface FilterPanelProps {
  /** Called when Submit is clicked with the validated filter state */
  onSubmit: (filters: FilterState) => void;
}

/**
 * Filter panel with Job ID autocomplete, date picker, and time frame dropdown.
 * Filters persist in the context and URL query params.
 */
/** Status filter options */
const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'success', label: '✓ Success' },
  { value: 'failed', label: '✕ Failed' },
] as const;

const FilterPanel: React.FC<FilterPanelProps> = ({ onSubmit }) => {
  const { filters, setFilters, resetFilters } = useFilterContext();
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [jobIdError, setJobIdError] = useState('');
  const [dateError, setDateError] = useState('');
  /**
   * Incrementing this key forces CustomTimePicker to remount its uncontrolled
   * TimeSlot children, clearing their local hour/minute state on Clear.
   */
  const [customPickerResetKey, setCustomPickerResetKey] = useState(0);

  // Sync local state when context filters change (e.g. from URL)
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleJobIdChange = useCallback((_: React.SyntheticEvent, value: string | null) => {
    const val = value ?? '';
    setLocalFilters((prev) => ({ ...prev, jobId: val }));
    if (val && !isValidBatchIdFormat(val) && !BATCH_ID_SUGGESTIONS.some((s) => s.includes(val))) {
      setJobIdError('');
    } else {
      setJobIdError('');
    }
  }, []);

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters((prev) => ({ ...prev, date: e.target.value || null }));
    setDateError('');
  }, []);

  const handleTimeFrameChange = useCallback((e: SelectChangeEvent) => {
    const newFrame = e.target.value as FilterState['timeFrame'];
    setLocalFilters((prev) => ({
      ...prev,
      timeFrame: newFrame,
      // Reset custom times when switching away from custom
      ...(newFrame !== 'custom' ? { customTimeStart: '', customTimeEnd: '' } : {}),
    }));
  }, []);

  const handleCustomStartChange = useCallback((val: string) => {
    setLocalFilters((prev) => ({ ...prev, customTimeStart: val }));
  }, []);

  const handleCustomEndChange = useCallback((val: string) => {
    setLocalFilters((prev) => ({ ...prev, customTimeEnd: val }));
  }, []);

  const handleStatusChange = useCallback((e: SelectChangeEvent) => {
    setLocalFilters((prev) => ({
      ...prev,
      status: e.target.value as FilterState['status'],
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    // Validate job ID format if provided
    if (localFilters.jobId && !BATCH_ID_SUGGESTIONS.some((s) => s.includes(localFilters.jobId))) {
      if (localFilters.jobId.length > 3 && !isValidBatchIdFormat(localFilters.jobId)) {
        setJobIdError('Format: BATCH-YYYYMMDD-HHMM');
        return;
      }
    }
    // Validate custom time range: both times required, start < end
    if (localFilters.timeFrame === 'custom') {
      if (!localFilters.customTimeStart || !localFilters.customTimeEnd) {
        setDateError('Enter both start and end times to apply the custom filter');
        return;
      }
      if (localFilters.customTimeStart >= localFilters.customTimeEnd) {
        setDateError('Start time must be before end time');
        return;
      }
    }
    setDateError('');
    setFilters(localFilters);
    onSubmit(localFilters);
  }, [localFilters, setFilters, onSubmit]);

  const EMPTY_FILTERS: FilterState = {
    jobId: '', date: null, timeFrame: 'all', customTimeStart: '', customTimeEnd: '', status: 'all',
  };

  const handleClear = useCallback(() => {
    resetFilters();
    setJobIdError('');
    setDateError('');
    setLocalFilters(EMPTY_FILTERS);
    setCustomPickerResetKey((k) => k + 1); // force CustomTimePicker remount
    onSubmit(EMPTY_FILTERS);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetFilters, onSubmit]);

  return (
    <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }} data-testid="filter-panel">
      <Box display="flex" alignItems="center" mb={2} gap={1}>
        <FilterListIcon color="primary" fontSize="small" aria-hidden="true" />
        <Typography variant="subtitle1" fontWeight={600}>
          Filter Batches
        </Typography>
      </Box>

      <Grid container spacing={2} alignItems="flex-start">
        {/* Job ID Autocomplete — md:3 to fit all 4 filters in one row */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Autocomplete
            freeSolo
            options={BATCH_ID_SUGGESTIONS}
            value={localFilters.jobId}
            onInputChange={handleJobIdChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Job ID"
                placeholder="BATCH-YYYYMMDD-HHMM"
                size="small"
                error={!!jobIdError}
                helperText={jobIdError}
                inputProps={{ ...params.inputProps, 'aria-label': 'Filter by Job ID' }}
                data-testid="filter-job-id"
              />
            )}
          />
        </Grid>

        {/* Date picker */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            type="date"
            label="Date"
            value={localFilters.date ?? ''}
            onChange={handleDateChange}
            size="small"
            fullWidth
            error={!!dateError}
            helperText={dateError}
            InputLabelProps={{ shrink: true }}
            inputProps={{ 'aria-label': 'Filter by date' }}
            data-testid="filter-date"
          />
        </Grid>

        {/* Time Frame */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Select
            value={localFilters.timeFrame}
            onChange={handleTimeFrameChange}
            size="small"
            fullWidth
            displayEmpty
            inputProps={{ 'aria-label': 'Filter by time frame' }}
            data-testid="filter-timeframe"
          >
            {TIME_FRAME_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        {/* Status filter */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Select
            value={localFilters.status}
            onChange={handleStatusChange}
            size="small"
            fullWidth
            displayEmpty
            inputProps={{ 'aria-label': 'Filter by status' }}
            data-testid="filter-status"
          >
            {STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>

      {/* Custom time range picker – shown only when timeFrame === 'custom' */}
      <CustomTimePicker
        open={localFilters.timeFrame === 'custom'}
        resetKey={customPickerResetKey}
        onStartChange={handleCustomStartChange}
        onEndChange={handleCustomEndChange}
        rangeError={dateError && localFilters.timeFrame === 'custom' ? dateError : undefined}
      />

      {/* Action buttons */}
      <Box display="flex" gap={2} mt={2.5}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          startIcon={<FilterListIcon />}
          data-testid="filter-submit-btn"
          aria-label="Apply filters"
        >
          Apply Filters
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          onClick={handleClear}
          startIcon={<ClearIcon />}
          data-testid="filter-clear-btn"
          aria-label="Clear all filters"
        >
          Clear
        </Button>
      </Box>
    </Paper>
  );
};

export default FilterPanel;
