import {
  Button,
  IconButton,
  MenuItem,
  Popover,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'readalquran.analytics.date-range';
const AnalyticsDateRangeContext = createContext(null);
const DATE_RANGE_PRESET_LABELS = {
  last7: 'Last 7 days',
  last30: 'Last 30 days',
  thisMonth: 'This month',
  lastMonth: 'Last month',
  custom: 'Custom dates',
};

export function toAnalyticsInputDate(date) {
  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

export function getAnalyticsRangeForPreset(preset) {
  const endDate = new Date();
  const startDate = new Date(endDate);

  if (preset === 'last7') {
    startDate.setDate(startDate.getDate() - 6);
  } else if (preset === 'last30') {
    startDate.setDate(startDate.getDate() - 29);
  } else if (preset === 'thisMonth') {
    startDate.setDate(1);
  } else if (preset === 'lastMonth') {
    startDate.setMonth(startDate.getMonth() - 1, 1);
    endDate.setDate(0);
  }

  return { startDate: toAnalyticsInputDate(startDate), endDate: toAnalyticsInputDate(endDate) };
}

export function formatAnalyticsDateRange(range) {
  if (!range?.startDate || !range?.endDate) {
    return 'Choose dates';
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return `${formatter.format(new Date(`${range.startDate}T00:00:00`))} – ${formatter.format(
    new Date(`${range.endDate}T00:00:00`)
  )}`;
}

function isValidRange(range) {
  return Boolean(
    range?.startDate &&
      range?.endDate &&
      /^\d{4}-\d{2}-\d{2}$/.test(range.startDate) &&
      /^\d{4}-\d{2}-\d{2}$/.test(range.endDate) &&
      range.startDate <= range.endDate
  );
}

function getInitialRangeState() {
  const fallback = { preset: 'last30', range: getAnalyticsRangeForPreset('last30') };

  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');

    if (stored && isValidRange(stored.range)) {
      return { preset: stored.preset || 'custom', range: stored.range };
    }
  } catch {
    // A malformed local setting should never prevent the dashboard from loading.
  }

  return fallback;
}

export function AnalyticsDateRangeProvider({ children }) {
  const [rangeState, setRangeState] = useState(getInitialRangeState);

  const setAnalyticsDateRange = useCallback((range, preset = 'custom') => {
    const nextState = { preset, range: { ...range } };
    setRangeState(nextState);

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    } catch {
      // Continue with the in-memory selection when browser storage is unavailable.
    }
  }, []);

  const value = useMemo(
    () => ({
      dateRange: rangeState.range,
      dateRangePreset: rangeState.preset,
      setAnalyticsDateRange,
    }),
    [rangeState, setAnalyticsDateRange]
  );

  return (
    <AnalyticsDateRangeContext.Provider value={value}>
      {children}
    </AnalyticsDateRangeContext.Provider>
  );
}

export function useAnalyticsDateRange() {
  const context = useContext(AnalyticsDateRangeContext);

  if (!context) {
    throw new Error('useAnalyticsDateRange must be used inside AnalyticsDateRangeProvider.');
  }

  return context;
}

export function AnalyticsDateRangeButton() {
  const { dateRange, dateRangePreset, setAnalyticsDateRange } = useAnalyticsDateRange();
  const [anchorElement, setAnchorElement] = useState(null);
  const [preset, setPreset] = useState(dateRangePreset);
  const [draftRange, setDraftRange] = useState(dateRange);
  const [error, setError] = useState('');

  function openCalendar(event) {
    setPreset(dateRangePreset);
    setDraftRange(dateRange);
    setError('');
    setAnchorElement(event.currentTarget);
  }

  function closeCalendar() {
    setAnchorElement(null);
  }

  function handlePresetChange(event) {
    const nextPreset = event.target.value;
    setPreset(nextPreset);
    setError('');

    if (nextPreset !== 'custom') {
      setDraftRange(getAnalyticsRangeForPreset(nextPreset));
    }
  }

  function applyRange() {
    if (!isValidRange(draftRange)) {
      setError('Choose a valid start and end date.');
      return;
    }

    setAnalyticsDateRange(draftRange, preset);
    closeCalendar();
  }

  function clearRange() {
    const defaultRange = getAnalyticsRangeForPreset('last30');
    setPreset('last30');
    setDraftRange(defaultRange);
    setError('');
    setAnalyticsDateRange(defaultRange, 'last30');
    closeCalendar();
  }

  const isOpen = Boolean(anchorElement);
  const selectedPeriodLabel = DATE_RANGE_PRESET_LABELS[dateRangePreset] || 'Custom dates';

  return (
    <>
      <Tooltip
        title={`Controls dates across all historical analytics reports · ${formatAnalyticsDateRange(
          dateRange
        )}`}
      >
        <Button
          aria-label={`Global analytics date range: ${selectedPeriodLabel}`}
          onClick={openCalendar}
          sx={{
            mr: 1,
            minWidth: { xs: 40, sm: 166 },
            height: 40,
            p: '4px',
            justifyContent: 'flex-start',
            border: '1px solid rgba(201, 162, 39, .38)',
            borderRadius: '10px',
            color: 'text.primary',
            backgroundColor: '#1d1d22',
            boxShadow: '0 3px 10px rgba(0, 0, 0, .18)',
            textTransform: 'none',
            '&:hover': {
              borderColor: 'rgba(224, 189, 54, .68)',
              backgroundColor: '#222228',
              boxShadow: '0 4px 14px rgba(0, 0, 0, .24)',
            },
          }}
        >
          <Box
            aria-hidden="true"
            className="flex shrink-0 items-center justify-center"
            sx={{
              width: 30,
              height: 30,
              borderRadius: '7px',
              backgroundColor: 'rgba(201, 162, 39, .15)',
              color: 'primary.light',
            }}
          >
            <CalendarMonthIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              minWidth: 0,
              ml: 1.1,
              flexDirection: 'column',
              alignItems: 'flex-start',
              lineHeight: 1,
            }}
          >
            <Typography
              component="span"
              className="text-9 font-semibold uppercase tracking-wide"
              color="text.secondary"
            >
              Date range
            </Typography>
            <Typography
              component="span"
              className="mt-3 max-w-[90px] truncate text-11 font-bold leading-none"
              sx={{ color: 'primary.light' }}
            >
              {selectedPeriodLabel}
            </Typography>
          </Box>
          <KeyboardArrowDownIcon
            sx={{
              display: { xs: 'none', sm: 'block' },
              ml: 'auto',
              mr: 0.25,
              color: 'text.secondary',
              fontSize: 18,
            }}
          />
        </Button>
      </Tooltip>
      <Popover
        anchorEl={anchorElement}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={isOpen}
        onClose={closeCalendar}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1,
            width: { xs: 'calc(100vw - 32px)', sm: 380 },
            maxWidth: 380,
            backgroundColor: 'background.paper',
            border: '1px solid #34343b',
            borderRadius: 3,
          },
        }}
      >
        <Box className="p-20">
          <Typography className="text-16 font-bold">Filter all analytics data</Typography>
          <Typography className="mt-5 text-12" color="text.secondary">
            This global date range controls every historical analytics report.
          </Typography>
          <TextField
            fullWidth
            label="Period"
            select
            size="small"
            value={preset}
            onChange={handlePresetChange}
            sx={{ mt: 18 }}
          >
            <MenuItem value="last7">Last 7 days</MenuItem>
            <MenuItem value="last30">Last 30 days</MenuItem>
            <MenuItem value="thisMonth">This month</MenuItem>
            <MenuItem value="lastMonth">Last month</MenuItem>
            <MenuItem value="custom">Custom dates</MenuItem>
          </TextField>
          {preset === 'custom' ? (
            <Box className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2">
              <TextField
                fullWidth
                label="Start date"
                type="date"
                size="small"
                value={draftRange.startDate}
                inputProps={{ max: toAnalyticsInputDate(new Date()) }}
                InputLabelProps={{ shrink: true }}
                onChange={(event) => setDraftRange((range) => ({ ...range, startDate: event.target.value }))}
              />
              <TextField
                fullWidth
                label="End date"
                type="date"
                size="small"
                value={draftRange.endDate}
                inputProps={{ max: toAnalyticsInputDate(new Date()) }}
                InputLabelProps={{ shrink: true }}
                onChange={(event) => setDraftRange((range) => ({ ...range, endDate: event.target.value }))}
              />
            </Box>
          ) : null}
          <Typography className="mt-14 text-12" color="text.secondary">
            Selected: {formatAnalyticsDateRange(draftRange)}
          </Typography>
          {error ? (
            <Typography className="mt-8 text-12" color="error.main">
              {error}
            </Typography>
          ) : null}
          <Box className="mt-18 flex items-center justify-between gap-8">
            <Tooltip title="Clear filter">
              <IconButton
                aria-label="Clear analytics date filter"
                onClick={clearRange}
                size="small"
                sx={{
                  height: 34,
                  width: 34,
                  border: '1px solid rgba(201, 162, 39, .34)',
                  color: '#d5af27',
                  backgroundColor: 'rgba(201, 162, 39, .08)',
                  '&:hover': {
                    borderColor: 'rgba(201, 162, 39, .7)',
                    backgroundColor: 'rgba(201, 162, 39, .16)',
                  },
                }}
              >
                <FilterAltOffIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
            <Box className="flex items-center gap-8">
              <Button color="inherit" onClick={closeCalendar} size="small">
                Cancel
              </Button>
              <Button
                onClick={applyRange}
                size="small"
                variant="contained"
                sx={{
                  minWidth: 104,
                  border: '1px solid rgba(201, 162, 39, .75)',
                  borderRadius: '999px',
                  backgroundColor: '#d5af27',
                  color: '#050505',
                  fontWeight: 700,
                  boxShadow: '0 8px 18px rgba(201, 162, 39, .16)',
                  '&:hover': {
                    backgroundColor: '#e0bd36',
                    boxShadow: '0 10px 22px rgba(201, 162, 39, .22)',
                  },
                }}
              >
                Apply filter
              </Button>
            </Box>
          </Box>
        </Box>
      </Popover>
    </>
  );
}
