import {
  Alert,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import RefreshIcon from '@mui/icons-material/Refresh';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useMemo } from 'react';
import { getAnalyticsErrorMessage, useGetAnalyticsQuery } from '../analytics/analyticsApi';

const EMPTY_ROWS = [];

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Math.round(Number(value || 0)));
}

function readable(value, fallback = '—') {
  return !value || value === '(not set)' ? fallback : value;
}

function minutesAgoLabel(value) {
  const minutes = Number(value || 0);

  if (minutes <= 0) {
    return 'Just now';
  }

  if (minutes === 1) {
    return '1 min ago';
  }

  return `${minutes} min ago`;
}

function deviceChipSx(device) {
  switch (String(device).toLowerCase()) {
    case 'mobile':
      return { backgroundColor: 'rgba(46, 158, 118, .15)', color: '#7ee6bb' };
    case 'desktop':
      return { backgroundColor: 'rgba(83, 147, 255, .14)', color: '#9fc2ff' };
    case 'tablet':
      return { backgroundColor: 'rgba(201, 162, 39, .14)', color: '#e4c65e' };
    default:
      return { backgroundColor: 'rgba(161, 161, 170, .14)', color: '#d4d4d8' };
  }
}

function RealtimeMetric({ label, value, icon, helper }) {
  return (
    <Paper
      className="rounded-14 p-20"
      elevation={0}
      sx={{ backgroundColor: 'background.paper', border: '1px solid #27272a' }}
    >
      <Box className="flex items-start justify-between gap-16">
        <Box>
          <Typography className="text-11 font-bold uppercase tracking-wide" color="text.secondary">
            {label}
          </Typography>
          <Typography className="mt-12 text-28 font-extrabold leading-none">{value}</Typography>
        </Box>
        <Box
          aria-hidden="true"
          className="flex h-38 w-38 shrink-0 items-center justify-center rounded-8"
          sx={{ backgroundColor: 'rgba(201, 162, 39, .13)', color: 'primary.light' }}
        >
          <FuseSvgIcon size={20}>{icon}</FuseSvgIcon>
        </Box>
      </Box>
      <Typography className="mt-14 text-12 leading-relaxed" color="text.secondary">
        {helper}
      </Typography>
    </Paper>
  );
}

function LiveActivityPage() {
  const {
    data: analytics,
    error: analyticsError,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useGetAnalyticsQuery({ view: 'live' });
  const error = getAnalyticsErrorMessage(
    analyticsError,
    'Unable to load realtime activity.'
  );

  const activityRows = analytics?.realtime?.activity || EMPTY_ROWS;
  const hasAggregateFallback = activityRows.some((row) => row.isAggregateFallback);
  const realtimeEvents = useMemo(
    () => activityRows.reduce((total, row) => total + Number(row.eventCount || 0), 0),
    [activityRows]
  );
  const realtimeViews = useMemo(
    () => activityRows.reduce((total, row) => total + Number(row.pageViews || 0), 0),
    [activityRows]
  );

  return (
    <FusePageSimple
      header={
        <div
          className="flex w-full flex-col justify-center border-b px-24 py-24 sm:px-40"
          style={{ borderColor: '#27272a' }}
        >
          <Box className="flex flex-wrap items-center justify-between gap-16">
            <Box>
              <Box className="flex flex-wrap items-center gap-10">
                <Typography className="text-3xl font-extrabold leading-tight">Live activity</Typography>
                <Chip
                  label="LAST 30 MINUTES"
                  size="small"
                  sx={{
                    height: 24,
                    backgroundColor: 'rgba(46, 158, 118, .13)',
                    border: '1px solid rgba(46, 158, 118, .26)',
                    color: '#7ee6bb',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '.04em',
                  }}
                />
              </Box>
              <Typography className="mt-8 text-14" color="text.secondary">
                GA4 events received during the current realtime window.
              </Typography>
            </Box>
            <Box className="flex items-center gap-10">
              {analytics?.generatedAt ? (
                <Typography className="text-11" color="text.secondary">
                  Updated {new Date(analytics.generatedAt).toLocaleTimeString()}
                </Typography>
              ) : null}
              <Tooltip title={isFetching ? 'Refreshing live activity' : 'Refresh live activity'}>
                <span>
                  <IconButton
                    aria-label="Refresh live activity"
                    className="h-36 w-36 border border-solid"
                    disabled={isFetching}
                    onClick={refetch}
                    size="small"
                    sx={{
                      borderColor: 'rgba(201, 162, 39, .38)',
                      color: 'primary.light',
                      backgroundColor: 'rgba(201, 162, 39, .08)',
                      '&:hover': { backgroundColor: 'rgba(201, 162, 39, .16)' },
                    }}
                  >
                    <RefreshIcon className={isFetching ? 'animate-spin' : ''} sx={{ fontSize: 18 }} />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
        </div>
      }
      content={
        <Box className="w-full p-24 sm:p-40">
          <Box className="mx-auto flex w-full max-w-[1440px] flex-col gap-20">
            {isLoading ? (
              <Paper
                className="overflow-hidden rounded-14 p-20"
                elevation={0}
                sx={{ backgroundColor: 'background.paper', border: '1px solid #27272a' }}
              >
                <Typography className="text-14 font-semibold">Loading GA4 realtime activity</Typography>
                <LinearProgress className="mt-16" color="primary" />
              </Paper>
            ) : null}

            {isError ? (
              <Alert
                severity="warning"
                action={
                  <Button color="inherit" onClick={refetch} size="small">
                    Retry
                  </Button>
                }
                sx={{
                  backgroundColor: 'rgba(201, 162, 39, .11)',
                  border: '1px solid rgba(201, 162, 39, .24)',
                  color: 'text.primary',
                }}
              >
                {error}. Make sure ReadAlQuran is running and you are signed in as an admin.
              </Alert>
            ) : null}

            <Box className="grid grid-cols-1 gap-16 sm:grid-cols-3">
              <RealtimeMetric
                label="Active now"
                value={formatNumber(analytics?.realtime?.activeUsers)}
                helper="Distinct active readers reported by GA4."
                icon="heroicons-outline:bolt"
              />
              <RealtimeMetric
                label="Activity groups"
                value={formatNumber(activityRows.length)}
                helper={
                  hasAggregateFallback
                    ? 'GA4 detailed rows are still catching up.'
                    : 'Anonymous event groups by page, device and location.'
                }
                icon="heroicons-outline:collection"
              />
              <RealtimeMetric
                label="Events in window"
                value={hasAggregateFallback ? 'Pending' : formatNumber(realtimeEvents)}
                helper={
                  hasAggregateFallback
                    ? 'Event and page breakdown will appear after GA4 exposes it.'
                    : `${formatNumber(realtimeViews)} page views across the grouped activity.`
                }
                icon="heroicons-outline:cursor-click"
              />
            </Box>

            <Alert
              icon={<FuseSvgIcon size={18}>heroicons-outline:information-circle</FuseSvgIcon>}
              severity="info"
              sx={{
                backgroundColor: 'rgba(83, 147, 255, .08)',
                border: '1px solid rgba(83, 147, 255, .18)',
                color: 'text.primary',
                '& .MuiAlert-icon': { color: '#9fc2ff' },
              }}
            >
              Each row is an anonymous GA4 event group, not an individual person or IP address. Active users can appear in more than one row when they generate multiple events.
            </Alert>

            <Paper
              className="overflow-hidden rounded-14"
              elevation={0}
              sx={{ backgroundColor: 'background.paper', border: '1px solid #27272a' }}
            >
              <Box className="border-b p-20" sx={{ borderColor: '#27272a' }}>
                <Typography className="text-16 font-bold">Realtime activity stream</Typography>
                <Typography className="mt-4 text-12" color="text.secondary">
                  Current GA4 activity, from the present moment back to 30 minutes ago.
                </Typography>
              </Box>

              <TableContainer sx={{ maxHeight: 620 }}>
                <Table stickyHeader aria-label="GA4 realtime activity stream">
                  <TableHead>
                    <TableRow>
                      {['When', 'Page or screen', 'Event', 'Device', 'Location', 'Active users', 'Events', 'Views'].map((heading) => (
                        <TableCell
                          key={heading}
                          sx={{
                            whiteSpace: 'nowrap',
                            backgroundColor: '#18181c',
                            borderColor: '#2b2b31',
                            color: 'text.secondary',
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '.04em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {heading}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activityRows.length ? (
                      activityRows.map((row, index) => (
                        <TableRow
                          hover
                          key={`${row.minutesAgo}-${row.pageTitle}-${row.eventName}-${row.city}-${index}`}
                          sx={{ '& td': { borderColor: '#27272a' } }}
                        >
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography className="text-12 font-semibold">{minutesAgoLabel(row.minutesAgo)}</Typography>
                          </TableCell>
                          <TableCell sx={{ minWidth: 260, maxWidth: 420 }}>
                            <Tooltip title={readable(row.pageTitle)} placement="top-start">
                              <Typography className="truncate text-12 font-semibold">
                                {readable(row.pageTitle)}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell sx={{ minWidth: 150 }}>
                            <Chip
                              label={readable(row.eventName)}
                              size="small"
                              sx={{
                                height: 23,
                                backgroundColor: 'rgba(46, 158, 118, .14)',
                                color: '#7ee6bb',
                                fontSize: 11,
                                fontWeight: 700,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={readable(row.device)}
                              size="small"
                              sx={{
                                height: 23,
                                textTransform: 'capitalize',
                                fontSize: 11,
                                fontWeight: 700,
                                ...deviceChipSx(row.device),
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ minWidth: 180 }}>
                            <Typography className="text-12 font-semibold">{readable(row.city)}</Typography>
                            <Typography className="mt-2 text-10" color="text.secondary">
                              {readable(row.country)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography className="text-13 font-bold">{formatNumber(row.activeUsers)}</Typography>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography className="text-12">
                              {row.isAggregateFallback ? '—' : formatNumber(row.eventCount)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography className="text-12">
                              {row.isAggregateFallback ? '—' : formatNumber(row.pageViews)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell align="center" colSpan={8} sx={{ borderColor: '#27272a', py: 48 }}>
                          <Typography className="text-13" color="text.secondary">
                            No GA4 realtime activity in the last 30 minutes.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </Box>
      }
    />
  );
}

export default LiveActivityPage;
