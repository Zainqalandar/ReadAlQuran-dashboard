import {
  Alert,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useEffect, useMemo, useState } from 'react';
import {
  formatAnalyticsDateRange,
  useAnalyticsDateRange,
} from '../analytics/AnalyticsDateRange';
import { getAnalyticsErrorMessage, useGetAnalyticsQuery } from '../analytics/analyticsApi';

const EMPTY_ROWS = [];

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Math.round(Number(value || 0)));
}

function formatPercent(value) {
  return `${(Number(value || 0) * 100).toFixed(1)}%`;
}

function formatDuration(value) {
  const seconds = Number(value || 0);

  if (seconds < 60) {
    return `${formatNumber(seconds)} sec`;
  }

  const minutes = Math.round((seconds / 60) * 10) / 10;

  return `${minutes} min`;
}

function readable(value, fallback = '—') {
  return !value || value === '(not set)' ? fallback : value;
}

function qualityColor(rate) {
  const value = Number(rate || 0);

  if (value >= 0.65) {
    return { backgroundColor: 'rgba(46, 158, 118, .14)', color: '#7ee6bb' };
  }

  if (value >= 0.35) {
    return { backgroundColor: 'rgba(201, 162, 39, .14)', color: '#e4c65e' };
  }

  return { backgroundColor: 'rgba(234, 98, 98, .13)', color: '#f6a4a4' };
}

function QualityMetric({ label, value, helper, icon }) {
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

const tableCellSx = {
  whiteSpace: 'nowrap',
  backgroundColor: '#18181c',
  borderColor: '#2b2b31',
  color: 'text.secondary',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '.04em',
  textTransform: 'uppercase',
};

function TrafficQualityPage() {
  const { dateRange } = useAnalyticsDateRange();
  const {
    data: analytics,
    error: analyticsError,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useGetAnalyticsQuery({ dateRange, view: 'traffic' });
  const [search, setSearch] = useState('');
  const [qualityPage, setQualityPage] = useState(0);
  const [landingPage, setLandingPage] = useState(0);
  const [eventPage, setEventPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const error = getAnalyticsErrorMessage(
    analyticsError,
    'Unable to load traffic quality data.'
  );

  useEffect(() => {
    setSearch('');
    setQualityPage(0);
    setLandingPage(0);
    setEventPage(0);
  }, [dateRange]);

  const qualityRows = analytics?.trafficQuality || EMPTY_ROWS;
  const landingRows = analytics?.trafficLandingDetails || EMPTY_ROWS;
  const pageEventRows = analytics?.pageEventDetails || EMPTY_ROWS;
  const query = search.trim().toLowerCase();
  const filteredQualityRows = useMemo(
    () => qualityRows.filter((row) => !query || [row.channel, row.sourceMedium].some((value) =>
      String(value || '').toLowerCase().includes(query)
    )),
    [qualityRows, query]
  );
  const filteredLandingRows = useMemo(
    () => landingRows.filter((row) => !query || [row.channel, row.sourceMedium, row.landingPage].some((value) =>
      String(value || '').toLowerCase().includes(query)
    )),
    [landingRows, query]
  );
  const filteredPageEventRows = useMemo(
    () => pageEventRows.filter((row) => !query || [row.pagePath, row.pageTitle, row.eventName].some((value) =>
      String(value || '').toLowerCase().includes(query)
    )),
    [pageEventRows, query]
  );

  useEffect(() => {
    setQualityPage(0);
    setLandingPage(0);
    setEventPage(0);
  }, [search]);

  const visibleQualityRows = filteredQualityRows.slice(
    qualityPage * rowsPerPage,
    qualityPage * rowsPerPage + rowsPerPage
  );
  const visibleLandingRows = filteredLandingRows.slice(
    landingPage * rowsPerPage,
    landingPage * rowsPerPage + rowsPerPage
  );
  const visiblePageEventRows = filteredPageEventRows.slice(
    eventPage * rowsPerPage,
    eventPage * rowsPerPage + rowsPerPage
  );
  const monthly = analytics?.monthly || {};
  const viewsPerSession = Number(monthly.sessions)
    ? Number(monthly.pageViews || 0) / Number(monthly.sessions)
    : 0;

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
                <Typography className="text-3xl font-extrabold leading-tight">Traffic quality</Typography>
                <Chip
                  label={`GA4 · ${formatAnalyticsDateRange(dateRange)}`}
                  size="small"
                  sx={{
                    height: 24,
                    backgroundColor: 'rgba(201, 162, 39, .12)',
                    border: '1px solid rgba(201, 162, 39, .25)',
                    color: 'primary.light',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '.04em',
                  }}
                />
              </Box>
              <Typography className="mt-8 text-14" color="text.secondary">
                Compare the quality of traffic from each channel and source.
              </Typography>
            </Box>
            <Box className="flex items-center gap-10">
              {analytics?.generatedAt ? (
                <Typography className="text-11" color="text.secondary">
                  Updated {new Date(analytics.generatedAt).toLocaleString()}
                </Typography>
              ) : null}
              <Tooltip title={isFetching ? 'Refreshing traffic data' : 'Refresh traffic data'}>
                <span>
                  <IconButton
                    aria-label="Refresh traffic quality data"
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
          <Box className="mx-auto flex w-full max-w-[1600px] flex-col gap-20">
            {isLoading ? (
              <Paper
                className="overflow-hidden rounded-14 p-20"
                elevation={0}
                sx={{ backgroundColor: 'background.paper', border: '1px solid #27272a' }}
              >
                <Typography className="text-14 font-semibold">Loading GA4 traffic quality</Typography>
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
                {error}. Make sure Al-Huda is running and you are signed in as an admin.
              </Alert>
            ) : null}

            <Box className="grid grid-cols-1 gap-16 sm:grid-cols-2 xl:grid-cols-5">
              <QualityMetric
                label="Sessions"
                value={formatNumber(monthly.sessions)}
                helper={`${formatNumber(monthly.activeUsers)} active users in this date range.`}
                icon="heroicons-outline:clock"
              />
              <QualityMetric
                label="Engaged sessions"
                value={formatNumber(monthly.engagedSessions)}
                helper="Sessions that GA4 considered meaningfully engaged."
                icon="heroicons-outline:lightning-bolt"
              />
              <QualityMetric
                label="Engagement rate"
                value={formatPercent(monthly.engagementRate)}
                helper="Engaged sessions divided by all sessions."
                icon="heroicons-outline:chart-bar"
              />
              <QualityMetric
                label="Average session"
                value={formatDuration(monthly.averageSessionSeconds)}
                helper="Average amount of time per session."
                icon="heroicons-outline:clock"
              />
              <QualityMetric
                label="Views per session"
                value={viewsPerSession.toFixed(1)}
                helper={`${formatNumber(monthly.pageViews)} total page views.`}
                icon="heroicons-outline:document-chart-bar"
              />
            </Box>

            <Paper
              className="overflow-hidden rounded-14"
              elevation={0}
              sx={{ backgroundColor: 'background.paper', border: '1px solid #27272a' }}
            >
              <Box className="flex flex-col gap-14 border-b p-20 lg:flex-row lg:items-center lg:justify-between" sx={{ borderColor: '#27272a' }}>
                <Box>
                  <Typography className="text-16 font-bold">Source quality</Typography>
                  <Typography className="mt-4 text-12" color="text.secondary">
                    Sessions, engagement and reading depth for each acquisition source.
                  </Typography>
                </Box>
                <TextField
                  aria-label="Search traffic quality"
                  placeholder="Search channel or source…"
                  size="small"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  sx={{ minWidth: { sm: 280 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <TableContainer sx={{ maxHeight: 580 }}>
                <Table stickyHeader aria-label="GA4 traffic source quality">
                  <TableHead>
                    <TableRow>
                      {['Source / medium', 'Channel', 'Sessions', 'Engaged sessions', 'Engagement rate', 'Avg. session', 'Views', 'Users'].map((heading) => (
                        <TableCell key={heading} sx={tableCellSx}>{heading}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleQualityRows.length ? (
                      visibleQualityRows.map((row, index) => (
                        <TableRow
                          hover
                          key={`${row.sourceMedium}-${row.channel}-${index}`}
                          sx={{ '& td': { borderColor: '#27272a' } }}
                        >
                          <TableCell sx={{ minWidth: 220 }}>
                            <Typography className="text-12 font-semibold">{readable(row.sourceMedium)}</Typography>
                          </TableCell>
                          <TableCell sx={{ minWidth: 170 }}>
                            <Chip
                              label={readable(row.channel)}
                              size="small"
                              sx={{
                                height: 23,
                                backgroundColor: 'rgba(201, 162, 39, .13)',
                                border: '1px solid rgba(201, 162, 39, .22)',
                                color: 'primary.light',
                                fontSize: 11,
                                fontWeight: 700,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography className="text-13 font-bold">{formatNumber(row.sessions)}</Typography>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography className="text-12">{formatNumber(row.engagedSessions)}</Typography>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Chip
                              label={formatPercent(row.engagementRate)}
                              size="small"
                              sx={{ height: 23, fontSize: 11, fontWeight: 700, ...qualityColor(row.engagementRate) }}
                            />
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography className="text-12">{formatDuration(row.averageSessionSeconds)}</Typography>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography className="text-12">{formatNumber(row.pageViews)}</Typography>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography className="text-12">{formatNumber(row.activeUsers)}</Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell align="center" colSpan={8} sx={{ borderColor: '#27272a', py: 48 }}>
                          <Typography className="text-13" color="text.secondary">
                            No matching traffic quality data yet.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredQualityRows.length}
                page={qualityPage}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 25, 50]}
                onPageChange={(_, nextPage) => setQualityPage(nextPage)}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(Number(event.target.value));
                  setQualityPage(0);
                  setLandingPage(0);
                  setEventPage(0);
                }}
                sx={{ borderTop: '1px solid #27272a', color: 'text.secondary' }}
              />
            </Paper>

            <Paper
              className="overflow-hidden rounded-14"
              elevation={0}
              sx={{ backgroundColor: 'background.paper', border: '1px solid #27272a' }}
            >
              <Box className="border-b p-20" sx={{ borderColor: '#27272a' }}>
                <Typography className="text-16 font-bold">Landing-page quality</Typography>
                <Typography className="mt-4 text-12" color="text.secondary">
                  The first page of each session, broken down by the traffic source that sent the reader.
                </Typography>
              </Box>

              <TableContainer sx={{ maxHeight: 580 }}>
                <Table stickyHeader aria-label="GA4 traffic landing page quality">
                  <TableHead>
                    <TableRow>
                      {['Landing page', 'Source / medium', 'Channel', 'Sessions', 'Engaged sessions', 'Engagement rate', 'Views', 'Engaged time'].map((heading) => (
                        <TableCell key={heading} sx={tableCellSx}>{heading}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleLandingRows.length ? (
                      visibleLandingRows.map((row, index) => (
                        <TableRow
                          hover
                          key={`${row.landingPage}-${row.sourceMedium}-${index}`}
                          sx={{ '& td': { borderColor: '#27272a' } }}
                        >
                          <TableCell sx={{ minWidth: 300, maxWidth: 460 }}>
                            <Tooltip title={readable(row.landingPage)} placement="top-start">
                              <Typography className="truncate text-12 font-semibold">{readable(row.landingPage)}</Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell sx={{ minWidth: 210 }}>
                            <Typography className="text-12 font-semibold">{readable(row.sourceMedium)}</Typography>
                          </TableCell>
                          <TableCell sx={{ minWidth: 160 }}>
                            <Chip
                              label={readable(row.channel)}
                              size="small"
                              sx={{
                                height: 23,
                                backgroundColor: 'rgba(201, 162, 39, .13)',
                                color: 'primary.light',
                                fontSize: 11,
                                fontWeight: 700,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography className="text-13 font-bold">{formatNumber(row.sessions)}</Typography>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography className="text-12">{formatNumber(row.engagedSessions)}</Typography>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Chip
                              label={formatPercent(row.engagementRate)}
                              size="small"
                              sx={{ height: 23, fontSize: 11, fontWeight: 700, ...qualityColor(row.engagementRate) }}
                            />
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography className="text-12">{formatNumber(row.pageViews)}</Typography>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography className="text-12">{formatDuration(Number(row.engagementMinutes || 0) * 60)}</Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell align="center" colSpan={8} sx={{ borderColor: '#27272a', py: 48 }}>
                          <Typography className="text-13" color="text.secondary">
                            No matching landing-page quality data yet.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredLandingRows.length}
                page={landingPage}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 25, 50]}
                onPageChange={(_, nextPage) => setLandingPage(nextPage)}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(Number(event.target.value));
                  setLandingPage(0);
                  setQualityPage(0);
                  setEventPage(0);
                }}
                sx={{ borderTop: '1px solid #27272a', color: 'text.secondary' }}
              />
            </Paper>

            <Paper
              className="overflow-hidden rounded-14"
              elevation={0}
              sx={{ backgroundColor: 'background.paper', border: '1px solid #27272a' }}
            >
              <Box className="border-b p-20" sx={{ borderColor: '#27272a' }}>
                <Typography className="text-16 font-bold">Page paths and events</Typography>
                <Typography className="mt-4 text-12" color="text.secondary">
                  Shows page activity and the GA4 events reported on those pages.
                </Typography>
              </Box>

              <TableContainer sx={{ maxHeight: 580 }}>
                <Table stickyHeader aria-label="GA4 page path and event details">
                  <TableHead>
                    <TableRow>
                      {['Page path', 'Page title', 'Event name', 'Event count', 'Users', 'Views', 'Engaged time'].map((heading) => (
                        <TableCell key={heading} sx={tableCellSx}>{heading}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visiblePageEventRows.length ? (
                      visiblePageEventRows.map((row, index) => (
                        <TableRow
                          hover
                          key={`${row.pagePath}-${row.eventName}-${index}`}
                          sx={{ '& td': { borderColor: '#27272a' } }}
                        >
                          <TableCell sx={{ minWidth: 260, maxWidth: 400 }}>
                            <Tooltip title={readable(row.pagePath)} placement="top-start">
                              <Typography className="truncate text-12 font-semibold">{readable(row.pagePath)}</Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell sx={{ minWidth: 240, maxWidth: 380 }}>
                            <Tooltip title={readable(row.pageTitle)} placement="top-start">
                              <Typography className="truncate text-12">{readable(row.pageTitle)}</Typography>
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
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography className="text-13 font-bold">{formatNumber(row.eventCount)}</Typography>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography className="text-12">{formatNumber(row.activeUsers)}</Typography>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography className="text-12">{formatNumber(row.pageViews)}</Typography>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography className="text-12">{formatDuration(Number(row.engagementMinutes || 0) * 60)}</Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell align="center" colSpan={7} sx={{ borderColor: '#27272a', py: 48 }}>
                          <Typography className="text-13" color="text.secondary">
                            No matching page event data yet.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredPageEventRows.length}
                page={eventPage}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 25, 50]}
                onPageChange={(_, nextPage) => setEventPage(nextPage)}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(Number(event.target.value));
                  setEventPage(0);
                  setLandingPage(0);
                  setQualityPage(0);
                }}
                sx={{ borderTop: '1px solid #27272a', color: 'text.secondary' }}
              />
            </Paper>
          </Box>
        </Box>
      }
    />
  );
}

export default TrafficQualityPage;
