import React, { useCallback, useState } from 'react';
import {
  Autocomplete,
  Box,
  Collapse,
  TextField,
  Typography,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

/** 24-hour options: "00" … "23" */
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, '0'),
);

/** Minute options: multiples of 5 – "00", "05", "10", … "55" */
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, '0'),
);

/** Validates a "HH" or "H" string as 0–23 */
const isValidHour = (v: string): boolean => {
  const n = parseInt(v, 10);
  return !isNaN(n) && n >= 0 && n <= 23 && /^\d{1,2}$/.test(v.trim());
};

/** Validates a "MM" or "M" string as 0–59 */
const isValidMinute = (v: string): boolean => {
  const n = parseInt(v, 10);
  return !isNaN(n) && n >= 0 && n <= 59 && /^\d{1,2}$/.test(v.trim());
};

/**
 * Combines hour + minute strings into "HH:mm".
 * Returns '' if EITHER part is not yet valid — keeps the parent value clean
 * until the user has fully entered both parts.
 */
const buildTimeString = (hour: string, minute: string): string => {
  if (!isValidHour(hour) || !isValidMinute(minute)) return '';
  return `${String(parseInt(hour, 10)).padStart(2, '0')}:${String(parseInt(minute, 10)).padStart(2, '0')}`;
};

interface TimeSlotProps {
  label: string;
  /** Initial value only – component owns its own state after mount */
  initialValue: string;
  onChange: (val: string) => void;
  hasRangeError: boolean;
  testIdPrefix: string;
}

/**
 * A single HH : MM editable-dropdown pair.
 *
 * KEY FIX: hour and minute live in LOCAL useState so they are never re-derived
 * from the parent's value prop.  The previous implementation used useMemo on
 * the value prop, which meant selecting a hour then (before the minute was
 * picked) the parent stored "" and the memo re-derived hour → "" — visually
 * resetting the control and preventing the filter from ever being built.
 *
 * This component is intentionally uncontrolled after mount.  The parent resets
 * it by changing the `key` on <CustomTimePicker> (via resetKey prop).
 */
const TimeSlot: React.FC<TimeSlotProps> = ({
  label,
  initialValue,
  onChange,
  hasRangeError,
  testIdPrefix,
}) => {
  // Initialise from the prop ONCE — never update from prop after mount.
  const [hour, setHour] = useState<string>(() => initialValue.split(':')[0] ?? '');
  const [minute, setMinute] = useState<string>(() => initialValue.split(':')[1] ?? '');

  const handleHourChange = useCallback(
    (_: React.SyntheticEvent, newVal: string | null) => {
      const h = newVal ?? '';
      setHour(h);
      // minute is captured from state — won't lose its value
      setMinute((prevMinute) => {
        onChange(buildTimeString(h, prevMinute));
        return prevMinute; // state unchanged
      });
    },
    [onChange],
  );

  const handleMinuteChange = useCallback(
    (_: React.SyntheticEvent, newVal: string | null) => {
      const m = newVal ?? '';
      setMinute(m);
      setHour((prevHour) => {
        onChange(buildTimeString(prevHour, m));
        return prevHour;
      });
    },
    [onChange],
  );

  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mb: 0.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.4px' }}
      >
        {label}
      </Typography>
      <Box display="flex" alignItems="center" gap={0.5}>
        {/* Hours dropdown */}
        <Autocomplete
          freeSolo
          options={HOUR_OPTIONS}
          value={hour}
          onInputChange={handleHourChange}
          sx={{ width: 90 }}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              placeholder="HH"
              error={hasRangeError && isValidHour(hour)}
              inputProps={{
                ...params.inputProps,
                maxLength: 2,
                'aria-label': `${label} hours`,
              }}
              data-testid={`${testIdPrefix}-hour`}
            />
          )}
        />

        <Typography variant="body1" fontWeight={700} color="text.secondary" sx={{ userSelect: 'none' }}>
          :
        </Typography>

        {/* Minutes dropdown */}
        <Autocomplete
          freeSolo
          options={MINUTE_OPTIONS}
          value={minute}
          onInputChange={handleMinuteChange}
          sx={{ width: 90 }}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              placeholder="MM"
              error={hasRangeError && isValidMinute(minute)}
              inputProps={{
                ...params.inputProps,
                maxLength: 2,
                'aria-label': `${label} minutes`,
              }}
              data-testid={`${testIdPrefix}-minute`}
            />
          )}
        />
      </Box>
    </Box>
  );
};

interface CustomTimePickerProps {
  /** Drives the Collapse open/close animation */
  open: boolean;
  /**
   * Increment this to force a clean remount of the time slots (e.g. after Clear).
   * Because TimeSlot is uncontrolled, changing the key is the only way to reset it.
   */
  resetKey: number;
  onStartChange: (val: string) => void;
  onEndChange: (val: string) => void;
  /** Range-level error message from the parent (e.g. "start must be before end") */
  rangeError?: string;
}

/**
 * Animated panel showing Start + End time pickers when Custom is selected.
 * Hours: editable dropdown 00–23 (24-hour format).
 * Minutes: editable dropdown with 5-min multiples (00, 05 … 55); free-text allowed.
 */
const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  open,
  resetKey,
  onStartChange,
  onEndChange,
  rangeError,
}) => (
  <Collapse in={open} timeout={250} unmountOnExit>
    <Box
      sx={{
        mt: 2,
        p: 2,
        bgcolor: '#FFF8F0',
        border: '1px solid',
        borderColor: 'primary.light',
        borderRadius: 1,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
        alignItems: 'flex-start',
      }}
      data-testid="custom-time-picker"
      role="group"
      aria-label="Custom time range"
    >
      {/* Section label */}
      <Box display="flex" alignItems="center" gap={0.75} width="100%" mb={-1}>
        <AccessTimeIcon sx={{ fontSize: 16, color: 'primary.main' }} />
        <Typography variant="caption" color="primary.main" fontWeight={600}>
          Custom Time Range (24-hour) — select hours then minutes for each slot
        </Typography>
      </Box>

      {/* Start time — key changes on reset so local state is wiped */}
      <TimeSlot
        key={`start-${resetKey}`}
        label="Start Time"
        initialValue=""
        onChange={onStartChange}
        hasRangeError={!!rangeError}
        testIdPrefix="custom-start"
      />

      {/* End time */}
      <TimeSlot
        key={`end-${resetKey}`}
        label="End Time"
        initialValue=""
        onChange={onEndChange}
        hasRangeError={!!rangeError}
        testIdPrefix="custom-end"
      />

      {rangeError && (
        <Typography variant="caption" color="error" width="100%">
          ⚠ {rangeError}
        </Typography>
      )}
    </Box>
  </Collapse>
);

export default CustomTimePicker;
