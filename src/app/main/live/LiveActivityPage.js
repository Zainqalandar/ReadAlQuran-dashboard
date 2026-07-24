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
import { useCallback, useEffect, useMemo, useState } from 'react';

const analyticsApiBase =
  process.env.REACT_APP_ALHUDA_API_BASE || 'http://localhost:3001';

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

function formatDateTime(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function addMinutes(value, minutes) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(date.getTime() + minutes * 60 * 1000).toISOString();
}

function formatWindow(snapshot) {
  const startAt = snapshot.bucketStartAt || snapshot.windowStartAt;
  const endAt = addMinutes(startAt, 30) || snapshot.windowEndAt;

  return `${formatDateTime(startAt)} - ${formatDateTime(endAt)}`;
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

function eventChipSx(eventName) {
  switch (String(eventName).toLowerCase()) {
    case 'page_view':
      return { backgroundColor: 'rgba(83, 147, 255, .14)', color: '#9fc2ff' };
    case 'scroll':
    case 'user_engagement':
      return { backgroundColor: 'rgba(46, 158, 118, .14)', color: '#7ee6bb' };
    case 'click':
    case 'select_content':
      return { backgroundColor: 'rgba(201, 162, 39, .14)', color: '#e4c65e' };
    default:
      return { backgroundColor: 'rgba(161, 161, 170, .14)', color: '#d4d4d8' };
  }
}

function groupActivitiesByEvent(activities) {
  const rows = activities?.length ? activities : [null];
  const groups = new Map();

  rows.forEach((activity, index) => {
    const eventName = readable(activity?.eventName, 'Unknown event');
    const group = groups.get(eventName) || {
      eventName,
      rows: [],
      activeUsers: 0,
      eventCount: 0,
      pageViews: 0,
    };

    group.rows.push({ activity, index });
    group.activeUsers += Number(activity?.activeUsers || 0);
    group.eventCount += Number(activity?.eventCount || 0);
    group.pageViews += Number(activity?.pageViews || 0);
    groups.set(eventName, group);
  });

  return Array.from(groups.values()).sort((first, second) => {
    if (second.eventCount !== first.eventCount) {
      return second.eventCount - first.eventCount;
    }

    return second.activeUsers - first.activeUsers;
  });
}

function ActivityDetailsCell({ activities }) {
  const eventGroups = groupActivitiesByEvent(activities);

  return (
    <Box
      className="flex min-w-0 flex-col gap-10 pr-4"
      sx={{ maxHeight: 260, overflowY: 'auto' }}
    >
      {eventGroups.map((group) => (
        <Box
          key={group.eventName}
          className="min-w-0 rounded-8 p-10"
          sx={{
            backgroundColor: 'rgba(255, 255, 255, .025)',
            border: '1px solid rgba(255, 255, 255, .08)',
          }}
        >
          <Box className="flex flex-wrap items-center justify-between gap-8">
            <Chip
              label={group.eventName}
              size="small"
              sx={{
                height: 23,
                fontSize: 10,
                fontWeight: 800,
                ...eventChipSx(group.eventName),
              }}
            />
            <Typography className="text-10 font-semibold" color="text.secondary">
              {formatNumber(group.activeUsers)} users · {formatNumber(group.eventCount)} events · {formatNumber(group.pageViews)} views
            </Typography>
          </Box>

          <Box className="mt-8 flex flex-col">
            {group.rows.map(({ activity, index }, rowIndex) => {
              const pageTitle = readable(activity?.pageTitle);
              const device = readable(activity?.device);
              const city = readable(activity?.city);
              const country = readable(activity?.country);
              const rowKey = `${group.eventName}-${pageTitle}-${device}-${city}-${index}`;

              return (
                <Box
                  key={rowKey}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      lg: 'minmax(170px, 1.2fr) minmax(92px, .55fr) minmax(130px, .8fr) minmax(96px, .5fr)',
                    },
                    gap: 1,
                    py: 1,
                    borderTop: rowIndex === 0 ? 0 : '1px solid rgba(255, 255, 255, .06)',
                  }}
                >
                  <Box className="min-w-0">
                    <Tooltip title={pageTitle} placement="top-start">
                      <Typography className="truncate text-12 font-semibold">
                        {pageTitle}
                      </Typography>
                    </Tooltip>
                    <Typography className="mt-1 text-10" color="text.secondary">
                      {minutesAgoLabel(activity?.minutesAgo)}
                    </Typography>
                  </Box>
                  <Box>
                    <Chip
                      label={device}
                      size="small"
                      sx={{
                        height: 22,
                        textTransform: 'capitalize',
                        fontSize: 10,
                        fontWeight: 700,
                        ...deviceChipSx(activity?.device),
                      }}
                    />
                  </Box>
                  <Box className="min-w-0">
                    <Typography className="truncate text-11 font-semibold">
                      {city}
                    </Typography>
                    <Typography className="mt-1 truncate text-10" color="text.secondary">
                      {country}
                    </Typography>
                  </Box>
                  <Box>
                    {activity ? (
                      <>
                        <Typography className="text-11 font-bold">
                          {formatNumber(activity.activeUsers)} users
                        </Typography>
                        <Typography className="mt-1 text-10" color="text.secondary">
                          {formatNumber(activity.eventCount)} events
                        </Typography>
                      </>
                    ) : (
                      <Typography className="text-11" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
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
  const [analytics, setAnalytics] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const isLoading = status === 'loading' || status === 'refreshing';

  const loadRealtimeActivity = useCallback(async (mode = 'loading') => {
    setStatus(mode);
    setError('');

    try {
      const response = await fetch(`${analyticsApiBase}/api/admin/analytics?view=live`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message || 'Unable to load realtime activity.');
      }

      setAnalytics(payload);
      setStatus('ready');
    } catch (requestError) {
      setError(requestError.message || 'Unable to load realtime activity.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    loadRealtimeActivity();
  }, [loadRealtimeActivity]);

  const activityRows = analytics?.realtime?.activity || [];
  const hasAggregateFallback = activityRows.some((row) => row.isAggregateFallback);
  const realtimeEvents = useMemo(
    () => activityRows.reduce((total, row) => total + Number(row.eventCount || 0), 0),
    [activityRows]
  );
  const realtimeViews = useMemo(
    () => activityRows.reduce((total, row) => total + Number(row.pageViews || 0), 0),
    [activityRows]
  );
  const storedRealtimeRows = analytics?.storedRealtime?.snapshots || [];
  const storedRealtimeError = analytics?.storedRealtime?.meta?.error || '';

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
              <Tooltip title={isLoading ? 'Refreshing live activity' : 'Refresh live activity'}>
                <span>
                  <IconButton
                    aria-label="Refresh live activity"
                    className="h-36 w-36 border border-solid"
                    disabled={isLoading}
                    onClick={() => loadRealtimeActivity('refreshing')}
                    size="small"
                    sx={{
                      borderColor: 'rgba(201, 162, 39, .38)',
                      color: 'primary.light',
                      backgroundColor: 'rgba(201, 162, 39, .08)',
                      '&:hover': { backgroundColor: 'rgba(201, 162, 39, .16)' },
                    }}
                  >
                    <RefreshIcon className={isLoading ? 'animate-spin' : ''} sx={{ fontSize: 18 }} />
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
            {status === 'loading' ? (
              <Paper
                className="overflow-hidden rounded-14 p-20"
                elevation={0}
                sx={{ backgroundColor: 'background.paper', border: '1px solid #27272a' }}
              >
                <Typography className="text-14 font-semibold">Loading GA4 realtime activity</Typography>
                <LinearProgress className="mt-16" color="primary" />
              </Paper>
            ) : null}

            {status === 'error' ? (
              <Alert
                severity="warning"
                action={
                  <Button color="inherit" href={`${analyticsApiBase}/admin`} size="small" target="_blank">
                    Open admin
                  </Button>
                }
                sx={{
                  backgroundColor: 'rgba(201, 162, 39, .11)',
                  border: '1px solid rgba(201, 162, 39, .24)',
                  color: 'text.primary',
                }}
              >
                {error}. Make sure Al-Huda is running and you are signed in as an admin.
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

            {storedRealtimeError ? (
              <Alert
                severity="warning"
                sx={{
                  backgroundColor: 'rgba(201, 162, 39, .11)',
                  border: '1px solid rgba(201, 162, 39, .24)',
                  color: 'text.primary',
                }}
              >
                {storedRealtimeError}
              </Alert>
            ) : null}

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

            <Paper
              className="overflow-hidden rounded-14"
              elevation={0}
              sx={{ backgroundColor: 'background.paper', border: '1px solid #27272a' }}
            >
              <Box
                className="flex flex-wrap items-center justify-between gap-12 border-b p-20"
                sx={{ borderColor: '#27272a' }}
              >
                <Box>
                  <Typography className="text-16 font-bold">Stored 30-minute snapshots</Typography>
                  <Typography className="mt-4 text-12" color="text.secondary">
                    MongoDB history captured from GA4 realtime refreshes.
                  </Typography>
                </Box>
                <Chip
                  label={`${formatNumber(storedRealtimeRows.length)} SAVED`}
                  size="small"
                  sx={{
                    height: 24,
                    backgroundColor: 'rgba(201, 162, 39, .13)',
                    border: '1px solid rgba(201, 162, 39, .26)',
                    color: 'primary.light',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '.04em',
                  }}
                />
              </Box>

              <TableContainer sx={{ maxHeight: 520 }}>
                <Table stickyHeader aria-label="Stored GA4 realtime snapshots">
                  <TableHead>
                    <TableRow>
                      {['Group start', 'Realtime window', 'Active users', 'Events', 'Views', 'Groups', 'Top activity'].map((heading) => (
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
                    {storedRealtimeRows.length ? (
                      storedRealtimeRows.map((snapshot) => {
                        const snapshotHasFallback = snapshot.activity?.some((activity) => activity.isAggregateFallback);

                        return (
                          <TableRow
                            hover
                            key={snapshot.id}
                            sx={{ '& td': { borderColor: '#27272a' } }}
                          >
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                              <Typography className="text-12 font-semibold">
                                {formatDateTime(snapshot.bucketStartAt)}
                              </Typography>
                              <Typography className="mt-2 text-10" color="text.secondary">
                                Saved {formatDateTime(snapshot.capturedAt)}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ minWidth: 230 }}>
                              <Typography className="text-12">{formatWindow(snapshot)}</Typography>
                            </TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                              <Typography className="text-13 font-bold">
                                {formatNumber(snapshot.activeUsers)}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                              <Typography className="text-12">
                                {snapshotHasFallback ? '—' : formatNumber(snapshot.eventCount)}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                              <Typography className="text-12">
                                {snapshotHasFallback ? '—' : formatNumber(snapshot.pageViews)}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                              <Typography className="text-12">
                                {formatNumber(snapshot.activityGroups)}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ minWidth: 320, maxWidth: 520 }}>
                              <ActivityDetailsCell activities={snapshot.activity} />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell align="center" colSpan={7} sx={{ borderColor: '#27272a', py: 42 }}>
                          <Typography className="text-13" color="text.secondary">
                            No stored realtime snapshots yet.
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
