import {
  Alert,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
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
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
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

function formatMinutes(value) {
  const minutes = Number(value || 0);

  if (minutes < 60) {
    return `${formatNumber(minutes)} min`;
  }

  return `${formatNumber(minutes / 60)} hr`;
}

function parseGaDateHourMinute(value) {
  if (!value || !/^\d{12}$/.test(value)) {
    return null;
  }

  return new Date(
    Number(value.slice(0, 4)),
    Number(value.slice(4, 6)) - 1,
    Number(value.slice(6, 8)),
    Number(value.slice(8, 10)),
    Number(value.slice(10, 12))
  );
}

function formatRelativeActivity(value) {
  const date = parseGaDateHourMinute(value);

  if (!date) {
    return 'N/A';
  }

  const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));

  if (diffMinutes < 1) {
    return 'Just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 30) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);

  return `${diffMonths} mo ago`;
}

function formatActivityDate(value) {
  const date = parseGaDateHourMinute(value);

  return date ? date.toLocaleString() : '';
}

function readable(value, fallback = '—') {
  if (!value || value === '(not set)') {
    return fallback;
  }

  return value;
}

function deviceChipColor(device) {
  switch (device?.toLowerCase()) {
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

function SummaryCard({ label, value, icon }) {
  return (
    <Paper
      className="rounded-12 p-16"
      elevation={0}
      sx={{ backgroundColor: 'background.paper', border: '1px solid #27272a' }}
    >
      <Box className="flex items-center justify-between gap-12">
        <Box>
          <Typography className="text-10 font-bold uppercase tracking-wide" color="text.secondary">
            {label}
          </Typography>
          <Typography className="mt-7 text-22 font-extrabold leading-none">{value}</Typography>
        </Box>
        <Box
          className="flex h-34 w-34 items-center justify-center rounded-8"
          sx={{ backgroundColor: 'rgba(201, 162, 39, .12)', color: 'primary.light' }}
        >
          <FuseSvgIcon size={18}>{icon}</FuseSvgIcon>
        </Box>
      </Box>
    </Paper>
  );
}

function AudiencePage() {
  const { dateRange } = useAnalyticsDateRange();
  const {
    data: analytics,
    error: analyticsError,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useGetAnalyticsQuery({ dateRange });
  const [search, setSearch] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [lastActivitySort, setLastActivitySort] = useState('desc');
  const error = getAnalyticsErrorMessage(analyticsError, 'Unable to load audience data.');

  const rows = analytics?.audienceDetails || EMPTY_ROWS;

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesDevice = deviceFilter === 'all' || row.device?.toLowerCase() === deviceFilter;
      const matchesSearch = !query ||
        [
          row.country,
          row.city,
          row.device,
          row.deviceModel,
          row.operatingSystem,
          row.browser,
          row.browserVersion,
          row.language,
          row.screenResolution,
          ...(row.landingPages || []).map((landingPage) => landingPage.path),
        ].some((value) => String(value || '').toLowerCase().includes(query));

      return matchesDevice && matchesSearch;
    });
  }, [deviceFilter, rows, search]);

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((firstRow, secondRow) => {
      const firstDate = parseGaDateHourMinute(firstRow.lastActivityAt)?.getTime() || 0;
      const secondDate = parseGaDateHourMinute(secondRow.lastActivityAt)?.getTime() || 0;

      return lastActivitySort === 'desc' ? secondDate - firstDate : firstDate - secondDate;
    });
  }, [filteredRows, lastActivitySort]);

  useEffect(() => {
    setSearch('');
    setDeviceFilter('all');
    setPage(0);
  }, [dateRange]);

  useEffect(() => {
    setPage(0);
  }, [deviceFilter, search]);

  const visibleRows = sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const deviceSummary = analytics?.devices || [];
  const mobileUsers = deviceSummary.find((row) => row.device?.toLowerCase() === 'mobile')?.activeUsers || 0;
  const desktopUsers = deviceSummary.find((row) => row.device?.toLowerCase() === 'desktop')?.activeUsers || 0;
  const hasTableFilters = Boolean(search.trim()) || deviceFilter !== 'all';

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
                <Typography className="text-3xl font-extrabold leading-tight">
                  Visitor insights
                </Typography>
                <Chip
                  label={`Google Analytics · ${formatAnalyticsDateRange(dateRange)}`}
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
                Understand who visits your website, where they are, and which devices they use.
              </Typography>
            </Box>
            <Box className="flex items-center gap-10">
              {analytics?.generatedAt ? (
                <Typography className="text-11" color="text.secondary">
                  Updated {new Date(analytics.generatedAt).toLocaleString()}
                </Typography>
              ) : null}
              <Tooltip title={isFetching ? 'Refreshing audience data' : 'Refresh audience data'}>
                <span>
                  <IconButton
                    aria-label="Refresh audience data"
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
                <Typography className="text-14 font-semibold">Loading visitor insights</Typography>
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
                {error}. Please retry, or contact support if the problem continues.
              </Alert>
            ) : null}

            <Box className="grid grid-cols-1 gap-14 sm:grid-cols-3">
              <SummaryCard label="Visitor groups" value={formatNumber(rows.length)} icon="heroicons-outline:collection" />
              <SummaryCard label="Mobile visitors" value={formatNumber(mobileUsers)} icon="heroicons-outline:device-mobile" />
              <SummaryCard label="Desktop visitors" value={formatNumber(desktopUsers)} icon="heroicons-outline:desktop-computer" />
            </Box>

            <Paper
              className="overflow-hidden rounded-14"
              elevation={0}
              sx={{ backgroundColor: 'background.paper', border: '1px solid #27272a' }}
            >
              <Box className="flex flex-col gap-14 border-b p-20 lg:flex-row lg:items-center lg:justify-between" sx={{ borderColor: '#27272a' }}>
                <Box>
                  <Typography className="text-16 font-bold">Visitor details</Typography>
                  <Typography className="mt-4 text-12" color="text.secondary">
                    Anonymous visitor groups summarized by device, browser, location, and activity.
                  </Typography>
                </Box>
                <Box className="flex flex-col gap-10 sm:flex-row">
                  <TextField
                    aria-label="Search visitor details"
                    placeholder="Search pages, devices, locations…"
                    size="small"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    sx={{ minWidth: { sm: 260 } }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  {hasTableFilters ? (
                    <Tooltip title="Clear table filters">
                      <IconButton
                        aria-label="Clear table filters"
                        onClick={() => {
                          setSearch('');
                          setDeviceFilter('all');
                        }}
                        size="small"
                        sx={{
                          height: 40,
                          width: 40,
                          border: '1px solid rgba(201, 162, 39, .28)',
                          color: 'primary.light',
                          backgroundColor: 'rgba(201, 162, 39, .08)',
                          '&:hover': { backgroundColor: 'rgba(201, 162, 39, .16)' },
                        }}
                      >
                        <FilterAltOffIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                  <TextField
                    aria-label="Filter by device"
                    select
                    size="small"
                    value={deviceFilter}
                    onChange={(event) => setDeviceFilter(event.target.value)}
                    sx={{ minWidth: 150 }}
                  >
                    <MenuItem value="all">All devices</MenuItem>
                    <MenuItem value="mobile">Mobile</MenuItem>
                    <MenuItem value="desktop">Desktop</MenuItem>
                    <MenuItem value="tablet">Tablet</MenuItem>
                  </TextField>
                </Box>
              </Box>

              <TableContainer sx={{ maxHeight: 640 }}>
                <Table stickyHeader aria-label="Visitor details">
                  <TableHead>
                    <TableRow>
                      {['Device', 'Operating system', 'Browser', 'Location', 'Landing pages', 'Users', 'Views', 'Engaged time', 'Last activity'].map((heading) => (
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
                          {heading === 'Last activity' ? (
                            <Box className="flex items-center gap-6">
                              <span>{heading}</span>
                              <Tooltip title={lastActivitySort === 'desc' ? 'Newest activity first' : 'Oldest activity first'}>
                                <IconButton
                                  aria-label="Sort last activity"
                                  onClick={() => setLastActivitySort((currentSort) => (currentSort === 'desc' ? 'asc' : 'desc'))}
                                  size="small"
                                  sx={{
                                    height: 24,
                                    width: 24,
                                    color: 'primary.light',
                                    backgroundColor: 'rgba(201, 162, 39, .1)',
                                    '&:hover': { backgroundColor: 'rgba(201, 162, 39, .18)' },
                                  }}
                                >
                                  {lastActivitySort === 'desc' ? (
                                    <ArrowDownwardIcon sx={{ fontSize: 14 }} />
                                  ) : (
                                    <ArrowUpwardIcon sx={{ fontSize: 14 }} />
                                  )}
                                </IconButton>
                              </Tooltip>
                            </Box>
                          ) : heading}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleRows.length ? (
                      visibleRows.map((row, index) => (
                        <TableRow
                          hover
                          key={`${row.country}-${row.city}-${row.device}-${row.operatingSystem}-${row.browser}-${row.screenResolution}-${index}`}
                          sx={{ '& td': { borderColor: '#27272a' } }}
                        >
                          <TableCell>
                            <Box className="flex flex-col items-start gap-6">
                              <Chip
                                label={readable(row.device)}
                                size="small"
                                sx={{
                                  height: 23,
                                  textTransform: 'capitalize',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  ...deviceChipColor(row.device),
                                }}
                              />
                              {row.deviceModel && row.deviceModel !== '(not set)' ? (
                                <Typography className="max-w-[150px] truncate text-11" color="text.secondary">
                                  {row.deviceModel}
                                </Typography>
                              ) : null}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ minWidth: 150 }}>
                            <Typography className="text-12 font-semibold">{readable(row.operatingSystem, 'N/A')}</Typography>
                          </TableCell>
                          <TableCell sx={{ minWidth: 150 }}>
                            <Typography className="text-12 font-semibold">{readable(row.browser)}</Typography>
                            {row.browserVersion && row.browserVersion !== '(not set)' ? (
                              <Typography className="mt-2 text-10" color="text.secondary">
                                v{row.browserVersion}
                              </Typography>
                            ) : null}
                          </TableCell>
                          <TableCell sx={{ minWidth: 160 }}>
                            <Typography className="text-12 font-semibold">{readable(row.city)}</Typography>
                            <Typography className="mt-2 text-10" color="text.secondary">
                              {readable(row.country)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ minWidth: 260, maxWidth: 360 }}>
                            {row.landingPages?.length ? (
                              <Box className="flex max-w-[340px] flex-col gap-6">
                                {row.landingPages.slice(0, 3).map((landingPage, landingIndex) => (
                                  <Tooltip
                                    key={`${landingPage.path}-${landingIndex}`}
                                    title={`${readable(landingPage.path)} · ${formatNumber(landingPage.sessions)} sessions`}
                                    placement="top-start"
                                  >
                                    <Box className="flex items-center justify-between gap-10">
                                      <Typography className="truncate text-12 font-semibold">
                                        {readable(landingPage.path)}
                                      </Typography>
                                      <Typography className="shrink-0 text-10" color="text.secondary">
                                        {formatNumber(landingPage.sessions)}
                                      </Typography>
                                    </Box>
                                  </Tooltip>
                                ))}
                                {row.landingPages.length > 3 ? (
                                  <Typography className="text-10" color="text.secondary">
                                    +{row.landingPages.length - 3} more
                                  </Typography>
                                ) : null}
                              </Box>
                            ) : (
                              <Typography className="text-12" color="text.secondary">
                                N/A
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography className="text-13 font-bold">{formatNumber(row.activeUsers)}</Typography>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography className="text-12">{formatNumber(row.pageViews)}</Typography>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography className="text-12">{formatMinutes(row.engagementMinutes)}</Typography>
                          </TableCell>
                          <TableCell sx={{ minWidth: 150, whiteSpace: 'nowrap' }}>
                            <Typography className="text-12 font-semibold">{formatRelativeActivity(row.lastActivityAt)}</Typography>
                            {row.lastActivityAt ? (
                              <Typography className="mt-2 text-10" color="text.secondary">
                                {formatActivityDate(row.lastActivityAt)}
                              </Typography>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell align="center" colSpan={9} sx={{ borderColor: '#27272a', py: 48 }}>
                          <Typography className="text-13" color="text.secondary">
                            {rows.length
                              ? 'No rows match the current table filters.'
                              : 'No visitor details are available for this date range yet.'}
                          </Typography>
                          {rows.length && hasTableFilters ? (
                            <Button
                              className="mt-12"
                              color="primary"
                              onClick={() => {
                                setSearch('');
                                setDeviceFilter('all');
                              }}
                              size="small"
                              startIcon={<FilterAltOffIcon />}
                              variant="outlined"
                            >
                              Clear filters
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredRows.length}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 25, 50]}
                onPageChange={(_, nextPage) => setPage(nextPage)}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(Number(event.target.value));
                  setPage(0);
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

export default AudiencePage;
