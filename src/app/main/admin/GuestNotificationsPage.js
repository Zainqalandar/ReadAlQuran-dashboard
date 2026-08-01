import {
  Alert,
  Box,
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
import DevicesOtherIcon from '@mui/icons-material/DevicesOther';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import GroupsIcon from '@mui/icons-material/Groups';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { useEffect, useMemo, useState } from 'react';
import {
  getAdminApiErrorMessage,
  useGetNotificationDevicesQuery,
} from './adminApi';
import { formatExactDateTime, formatRelativeTime } from './relativeTime';

const DAY_MS = 24 * 60 * 60 * 1000;
const TABLE_HEAD_SX = {
  backgroundColor: '#18181c',
  borderColor: '#2b2b31',
  color: 'text.secondary',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0,
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
};

function safeCount(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(safeCount(value));
}

function formatPercent(value) {
  const normalized = Math.max(0, Number(value) || 0);
  return `${normalized.toFixed(normalized >= 10 ? 0 : 1)}%`;
}

function getOpenRate(device) {
  const sent = safeCount(device?.notificationSentCount);
  const visits = safeCount(device?.notificationVisitCount);
  return sent > 0 ? Math.min(100, (visits / sent) * 100) : 0;
}

function getDeviceDetails(userAgent) {
  const value = String(userAgent || '');
  let browser = 'Unknown browser';
  let platform = 'Unknown platform';

  if (/Edg\//i.test(value)) browser = 'Microsoft Edge';
  else if (/Firefox\//i.test(value)) browser = 'Firefox';
  else if (/CriOS\//i.test(value)) browser = 'Chrome iOS';
  else if (/Chrome\//i.test(value)) browser = 'Chrome';
  else if (/Safari\//i.test(value)) browser = 'Safari';

  if (/Android/i.test(value)) platform = 'Android';
  else if (/iPhone|iPad|iPod/i.test(value)) platform = 'iOS / iPadOS';
  else if (/Windows/i.test(value)) platform = 'Windows';
  else if (/Macintosh|Mac OS X/i.test(value)) platform = 'macOS';
  else if (/Linux/i.test(value)) platform = 'Linux';

  return { browser, platform };
}

function getDeviceLabel(device) {
  if (device?.ownerType === 'user') {
    return device.userName || device.userEmail || 'Signed-in reader';
  }

  const id = String(device?.id || device?.deviceId || '').replace(/-/g, '');
  return `Guest ${id.slice(0, 8).toUpperCase() || 'DEVICE'}`;
}

function getDeviceSecondary(device) {
  return device?.ownerType === 'user'
    ? device.userEmail || 'Signed-in reader'
    : 'Anonymous browser profile';
}

function getDeviceTypeLabel(device) {
  return device?.ownerType === 'user' ? 'Signed-in' : 'Guest';
}

function getLogicalDeviceKey(device) {
  if (device?.ownerType !== 'user') {
    return `guest:${device?.deviceId || device?.id || ''}`;
  }

  const details = getDeviceDetails(device.userAgent);
  return `user:${device.userId}:${details.browser}:${details.platform}`;
}

function latestNullableIso(left, right) {
  if (!left) return right;
  if (!right) return left;
  return String(left).localeCompare(String(right)) >= 0 ? left : right;
}

function normalizeDevice(device) {
  return {
    ...device,
    contentPreference:
      device.contentPreference || (device.ownerType === 'guest' ? 'hadith' : 'balanced'),
    timeZone: device.timeZone || 'UTC',
    notificationSentCount: safeCount(device.notificationSentCount),
    notificationVisitCount: safeCount(device.notificationVisitCount),
    failureCount: safeCount(device.failureCount),
  };
}

function dedupeDevices(items) {
  const logicalDevices = new Map();

  items.map(normalizeDevice).forEach((device) => {
    const key = getLogicalDeviceKey(device);
    const existing = logicalDevices.get(key);

    if (!existing) {
      logicalDevices.set(key, device);
      return;
    }

    const latest =
      String(device.lastSeenAt).localeCompare(String(existing.lastSeenAt)) >= 0
        ? device
        : existing;
    const latestVisit =
      String(device.lastNotificationVisitAt || '').localeCompare(
        String(existing.lastNotificationVisitAt || '')
      ) >= 0
        ? device
        : existing;

    logicalDevices.set(key, {
      ...latest,
      failureCount: Math.max(existing.failureCount, device.failureCount),
      lastSentAt: latestNullableIso(existing.lastSentAt, device.lastSentAt),
      lastEngagementAt: latestNullableIso(
        existing.lastEngagementAt,
        device.lastEngagementAt
      ),
      notificationSentCount:
        existing.notificationSentCount + device.notificationSentCount,
      notificationVisitCount:
        existing.notificationVisitCount + device.notificationVisitCount,
      lastNotificationVisitAt: latestNullableIso(
        existing.lastNotificationVisitAt,
        device.lastNotificationVisitAt
      ),
      lastNotificationCampaignId: latestVisit.lastNotificationCampaignId,
      lastNotificationKind: latestVisit.lastNotificationKind,
    });
  });

  return Array.from(logicalDevices.values());
}

function getActivityStatus(device) {
  const lastSeen = new Date(device?.lastSeenAt).getTime();
  if (!Number.isFinite(lastSeen)) return 'dormant';

  const inactiveDays = Math.max(0, Math.floor((Date.now() - lastSeen) / DAY_MS));
  if (inactiveDays <= 14) return 'active';
  if (inactiveDays <= 60) return 'cooling';
  return 'dormant';
}

function getActivityLabel(status) {
  if (status === 'active') return 'Active';
  if (status === 'cooling') return 'Cooling';
  return 'Dormant';
}

function getActivityColor(status) {
  if (status === 'active') return 'success';
  if (status === 'cooling') return 'warning';
  return 'default';
}

function formatPreference(value) {
  if (value === 'hadith') return 'Hadith-first';
  if (value === 'quran') return 'Quran-first';
  return 'Balanced';
}

function formatKind(value) {
  const normalized = String(value || '').trim();
  if (!normalized) return 'No campaign yet';
  return normalized
    .replace(/^admin-/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getHealthStatus(device) {
  if (device.failureCount > 0) return 'failures';
  if (device.notificationSentCount === 0) return 'untested';
  return 'healthy';
}

function MetricCard({ icon, label, value, detail, tone = 'gold' }) {
  const toneStyles = {
    gold: { backgroundColor: 'rgba(201, 162, 39, .12)', color: '#e4c65e' },
    green: { backgroundColor: 'rgba(46, 158, 118, .13)', color: '#7ee6bb' },
    blue: { backgroundColor: 'rgba(83, 147, 255, .13)', color: '#9fc2ff' },
    red: { backgroundColor: 'rgba(248, 113, 113, .12)', color: '#fca5a5' },
  };

  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: 108,
        border: '1px solid #27272a',
        borderRadius: 2,
        backgroundColor: 'background.paper',
        p: 2,
      }}
    >
      <Box className="flex h-full items-start justify-between gap-12">
        <Box className="min-w-0">
          <Typography className="text-11 font-bold uppercase" color="text.secondary">
            {label}
          </Typography>
          <Typography className="mt-8 text-24 font-extrabold leading-none">
            {value}
          </Typography>
          <Typography className="mt-8 truncate text-11" color="text.secondary">
            {detail}
          </Typography>
        </Box>
        <Box
          className="flex h-36 w-36 shrink-0 items-center justify-center rounded-8"
          sx={toneStyles[tone]}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
}

function NotificationDevicesPage() {
  const { data, error, isFetching, isLoading, refetch } =
    useGetNotificationDevicesQuery();
  const [query, setQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [responseFilter, setResponseFilter] = useState('all');
  const [preferenceFilter, setPreferenceFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [timeZoneFilter, setTimeZoneFilter] = useState('all');
  const [sortBy, setSortBy] = useState('visits');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const devices = useMemo(
    () => dedupeDevices(Array.isArray(data?.devices) ? data.devices : []),
    [data?.devices]
  );
  const timeZones = useMemo(
    () => Array.from(new Set(devices.map((device) => device.timeZone))).sort(),
    [devices]
  );
  const filteredDevices = useMemo(() => {
    const search = query.trim().toLowerCase();
    const matches = devices.filter((device) => {
      const details = getDeviceDetails(device.userAgent);
      const activityStatus = getActivityStatus(device);
      const healthStatus = getHealthStatus(device);
      const sent = device.notificationSentCount;
      const visits = device.notificationVisitCount;
      const matchesSearch =
        !search ||
        [
          getDeviceLabel(device),
          getDeviceSecondary(device),
          getDeviceTypeLabel(device),
          device.id,
          device.deviceId,
          device.userId,
          device.userName,
          device.userEmail,
          device.userAgent,
          device.timeZone,
          device.contentPreference,
          device.lastNotificationKind,
          device.lastNotificationCampaignId,
          details.browser,
          details.platform,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search));
      const matchesOwner =
        ownerFilter === 'all' || device.ownerType === ownerFilter;
      const matchesActivity =
        activityFilter === 'all' || activityStatus === activityFilter;
      const matchesPreference =
        preferenceFilter === 'all' ||
        device.contentPreference === preferenceFilter;
      const matchesHealth =
        healthFilter === 'all' || healthStatus === healthFilter;
      const matchesTimeZone =
        timeZoneFilter === 'all' || device.timeZone === timeZoneFilter;
      const matchesResponse =
        responseFilter === 'all' ||
        (responseFilter === 'visited' && visits > 0) ||
        (responseFilter === 'unconverted' && sent > 0 && visits === 0) ||
        (responseFilter === 'unreached' && sent === 0);

      return (
        matchesSearch &&
        matchesOwner &&
        matchesActivity &&
        matchesPreference &&
        matchesHealth &&
        matchesTimeZone &&
        matchesResponse
      );
    });

    return matches.sort((left, right) => {
      if (sortBy === 'sent') {
        return right.notificationSentCount - left.notificationSentCount;
      }
      if (sortBy === 'rate') {
        return getOpenRate(right) - getOpenRate(left);
      }
      if (sortBy === 'lastVisit') {
        return String(right.lastNotificationVisitAt || '').localeCompare(
          String(left.lastNotificationVisitAt || '')
        );
      }
      if (sortBy === 'lastSeen') {
        return String(right.lastSeenAt || '').localeCompare(
          String(left.lastSeenAt || '')
        );
      }
      if (sortBy === 'failures') {
        return right.failureCount - left.failureCount;
      }
      return right.notificationVisitCount - left.notificationVisitCount;
    });
  }, [
    activityFilter,
    devices,
    healthFilter,
    ownerFilter,
    preferenceFilter,
    query,
    responseFilter,
    sortBy,
    timeZoneFilter,
  ]);
  const paginatedDevices = filteredDevices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  const summary = useMemo(
    () =>
      devices.reduce(
        (result, device) => {
          result.enabledDevices += 1;
          result.notificationsSent += device.notificationSentCount;
          result.notificationVisits += device.notificationVisitCount;
          result.respondingDevices += device.notificationVisitCount > 0 ? 1 : 0;
          result.activeDevices += getActivityStatus(device) === 'active' ? 1 : 0;
          result.devicesWithFailures += device.failureCount > 0 ? 1 : 0;
          result.lastNotificationVisitAt = latestNullableIso(
            result.lastNotificationVisitAt,
            device.lastNotificationVisitAt
          );
          return result;
        },
        {
          enabledDevices: 0,
          notificationsSent: 0,
          notificationVisits: 0,
          respondingDevices: 0,
          activeDevices: 0,
          devicesWithFailures: 0,
          lastNotificationVisitAt: null,
        }
      ),
    [devices]
  );
  const overallOpenRate =
    summary.notificationsSent > 0
      ? (summary.notificationVisits / summary.notificationsSent) * 100
      : 0;
  const hasFilters = Boolean(
    query ||
      ownerFilter !== 'all' ||
      activityFilter !== 'all' ||
      responseFilter !== 'all' ||
      preferenceFilter !== 'all' ||
      healthFilter !== 'all' ||
      timeZoneFilter !== 'all'
  );
  const pageError = getAdminApiErrorMessage(
    error,
    'Unable to load notification devices.'
  );

  useEffect(() => {
    setPage(0);
  }, [
    activityFilter,
    healthFilter,
    ownerFilter,
    preferenceFilter,
    query,
    responseFilter,
    sortBy,
    timeZoneFilter,
  ]);

  const clearFilters = () => {
    setQuery('');
    setOwnerFilter('all');
    setActivityFilter('all');
    setResponseFilter('all');
    setPreferenceFilter('all');
    setHealthFilter('all');
    setTimeZoneFilter('all');
  };

  const metrics = [
    {
      label: 'Enabled devices',
      value: formatNumber(summary.enabledDevices),
      detail: `${formatNumber(summary.activeDevices)} active in 14 days`,
      icon: <DevicesOtherIcon sx={{ fontSize: 19 }} />,
      tone: 'gold',
    },
    {
      label: 'Notifications sent',
      value: formatNumber(summary.notificationsSent),
      detail: 'Tracked deliveries from now onward',
      icon: <SendIcon sx={{ fontSize: 18 }} />,
      tone: 'blue',
    },
    {
      label: 'Visits from push',
      value: formatNumber(summary.notificationVisits),
      detail: `Last: ${formatRelativeTime(summary.lastNotificationVisitAt)}`,
      icon: <TouchAppIcon sx={{ fontSize: 19 }} />,
      tone: 'green',
    },
    {
      label: 'Open rate',
      value: formatPercent(overallOpenRate),
      detail: 'Attributed visits / tracked sends',
      icon: <TrendingUpIcon sx={{ fontSize: 19 }} />,
      tone: 'green',
    },
    {
      label: 'Responding devices',
      value: formatNumber(summary.respondingDevices),
      detail: 'Devices with at least one push visit',
      icon: <GroupsIcon sx={{ fontSize: 19 }} />,
      tone: 'blue',
    },
    {
      label: 'Delivery issues',
      value: formatNumber(summary.devicesWithFailures),
      detail: 'Devices with current failures',
      icon: <WarningAmberIcon sx={{ fontSize: 19 }} />,
      tone: summary.devicesWithFailures > 0 ? 'red' : 'gold',
    },
  ];

  return (
    <FusePageSimple
      header={
        <div
          className="flex w-full flex-col justify-center border-b px-24 py-24 sm:px-40"
          style={{ borderColor: '#27272a' }}
        >
          <Box className="flex flex-wrap items-center justify-between gap-16">
            <Box>
              <Typography className="text-3xl font-extrabold leading-tight">
                Notification devices
              </Typography>
              <Typography className="mt-8 text-14" color="text.secondary">
                Delivery health, reader response, content preference, and push-attributed visits.
              </Typography>
            </Box>
            <Tooltip title={isFetching ? 'Refreshing devices' : 'Refresh devices'}>
              <span>
                <IconButton
                  aria-label="Refresh notification devices"
                  disabled={isFetching}
                  onClick={refetch}
                  size="small"
                  sx={{
                    border: '1px solid rgba(201, 162, 39, .38)',
                    color: 'primary.light',
                    backgroundColor: 'rgba(201, 162, 39, .08)',
                  }}
                >
                  <RefreshIcon
                    className={isFetching ? 'animate-spin' : ''}
                    sx={{ fontSize: 18 }}
                  />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </div>
      }
      content={
        <Box className="w-full p-24 sm:p-40">
          <Box className="mx-auto flex w-full max-w-[1680px] flex-col gap-20">
            {isLoading ? <LinearProgress /> : null}
            {error ? <Alert severity="error">{pageError}</Alert> : null}

            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(3, minmax(0, 1fr))',
                  xl: 'repeat(6, minmax(0, 1fr))',
                },
              }}
            >
              {metrics.map((metric) => (
                <MetricCard key={metric.label} {...metric} />
              ))}
            </Box>

            <Paper
              elevation={0}
              sx={{
                backgroundColor: 'background.paper',
                border: '1px solid #27272a',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Box className="border-b p-16 sm:p-20">
                <Box className="flex flex-wrap items-start justify-between gap-12">
                  <Box>
                    <Typography className="text-16 font-bold">
                      Device engagement
                    </Typography>
                    <Typography className="mt-4 text-12" color="text.secondary">
                      {formatNumber(filteredDevices.length)} of {formatNumber(devices.length)} devices
                    </Typography>
                  </Box>
                  {hasFilters ? (
                    <Button
                      onClick={clearFilters}
                      size="small"
                      startIcon={<FilterAltOffIcon />}
                      variant="outlined"
                    >
                      Clear filters
                    </Button>
                  ) : null}
                </Box>

                <Box
                  className="mt-16"
                  sx={{
                    display: 'grid',
                    gap: 1.25,
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, minmax(0, 1fr))',
                      lg: 'minmax(240px, 1.5fr) repeat(3, minmax(135px, .7fr))',
                      xl: 'minmax(280px, 1.5fr) repeat(6, minmax(130px, .7fr))',
                    },
                  }}
                >
                  <TextField
                    aria-label="Search notification devices"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search reader, browser, timezone, campaign..."
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    aria-label="Filter by audience"
                    select
                    size="small"
                    value={ownerFilter}
                    onChange={(event) => setOwnerFilter(event.target.value)}
                  >
                    <MenuItem value="all">All audiences</MenuItem>
                    <MenuItem value="user">Signed-in</MenuItem>
                    <MenuItem value="guest">Guest</MenuItem>
                  </TextField>
                  <TextField
                    aria-label="Filter by activity"
                    select
                    size="small"
                    value={activityFilter}
                    onChange={(event) => setActivityFilter(event.target.value)}
                  >
                    <MenuItem value="all">All activity</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="cooling">Cooling</MenuItem>
                    <MenuItem value="dormant">Dormant</MenuItem>
                  </TextField>
                  <TextField
                    aria-label="Filter by push response"
                    select
                    size="small"
                    value={responseFilter}
                    onChange={(event) => setResponseFilter(event.target.value)}
                  >
                    <MenuItem value="all">All responses</MenuItem>
                    <MenuItem value="visited">Visited from push</MenuItem>
                    <MenuItem value="unconverted">Sent, no visit</MenuItem>
                    <MenuItem value="unreached">Not sent yet</MenuItem>
                  </TextField>
                  <TextField
                    aria-label="Filter by content preference"
                    select
                    size="small"
                    value={preferenceFilter}
                    onChange={(event) => setPreferenceFilter(event.target.value)}
                  >
                    <MenuItem value="all">All interests</MenuItem>
                    <MenuItem value="hadith">Hadith-first</MenuItem>
                    <MenuItem value="quran">Quran-first</MenuItem>
                    <MenuItem value="balanced">Balanced</MenuItem>
                  </TextField>
                  <TextField
                    aria-label="Filter by delivery health"
                    select
                    size="small"
                    value={healthFilter}
                    onChange={(event) => setHealthFilter(event.target.value)}
                  >
                    <MenuItem value="all">All health</MenuItem>
                    <MenuItem value="healthy">Healthy</MenuItem>
                    <MenuItem value="failures">Has failures</MenuItem>
                    <MenuItem value="untested">Not tested</MenuItem>
                  </TextField>
                  <TextField
                    aria-label="Filter by timezone"
                    select
                    size="small"
                    value={timeZoneFilter}
                    onChange={(event) => setTimeZoneFilter(event.target.value)}
                  >
                    <MenuItem value="all">All timezones</MenuItem>
                    {timeZones.map((timeZone) => (
                      <MenuItem key={timeZone} value={timeZone}>
                        {timeZone}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    aria-label="Sort notification devices"
                    select
                    size="small"
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                  >
                    <MenuItem value="visits">Most push visits</MenuItem>
                    <MenuItem value="sent">Most notifications</MenuItem>
                    <MenuItem value="rate">Highest open rate</MenuItem>
                    <MenuItem value="lastVisit">Latest push visit</MenuItem>
                    <MenuItem value="lastSeen">Latest seen</MenuItem>
                    <MenuItem value="failures">Most failures</MenuItem>
                  </TextField>
                </Box>
              </Box>

              {!isLoading && filteredDevices.length === 0 ? (
                <Box className="px-20 py-48 text-center">
                  <Typography className="text-14 font-semibold">
                    {devices.length === 0
                      ? 'No notification devices are enabled yet.'
                      : 'No devices match the selected filters.'}
                  </Typography>
                  {hasFilters ? (
                    <Button className="mt-12" onClick={clearFilters} size="small">
                      Clear filters
                    </Button>
                  ) : null}
                </Box>
              ) : (
                <>
                  <TableContainer sx={{ maxHeight: 'min(680px, calc(100vh - 300px))' }}>
                    <Table
                      aria-label="Notification device engagement details"
                      size="small"
                      stickyHeader
                      sx={{ minWidth: 1540 }}
                    >
                      <TableHead>
                        <TableRow>
                          {[
                            'Reader / device',
                            'Audience',
                            'Browser',
                            'Profile',
                            'Activity',
                            'Delivered',
                            'Visits from push',
                            'Open rate',
                            'Last content',
                            'Health',
                          ].map((heading) => (
                            <TableCell key={heading} sx={TABLE_HEAD_SX}>
                              {heading}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedDevices.map((device) => {
                          const details = getDeviceDetails(device.userAgent);
                          const activity = getActivityStatus(device);
                          const health = getHealthStatus(device);
                          const openRate = getOpenRate(device);
                          const lastKind =
                            device.lastNotificationKind || device.lastEngagementKind;

                          return (
                            <TableRow key={device.id} hover>
                              <TableCell sx={{ minWidth: 230 }}>
                                <Typography className="max-w-[250px] truncate text-13 font-semibold">
                                  {getDeviceLabel(device)}
                                </Typography>
                                <Typography
                                  className="mt-2 max-w-[250px] truncate text-11"
                                  color="text.secondary"
                                  title={getDeviceSecondary(device)}
                                >
                                  {getDeviceSecondary(device)}
                                </Typography>
                                <Typography className="mt-2 text-10" color="text.disabled">
                                  Enabled {formatRelativeTime(device.createdAt)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  color={device.ownerType === 'user' ? 'primary' : 'default'}
                                  label={getDeviceTypeLabel(device)}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell sx={{ minWidth: 135 }}>
                                <Typography className="text-12 font-semibold">
                                  {details.browser}
                                </Typography>
                                <Typography className="mt-2 text-11" color="text.secondary">
                                  {details.platform}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ minWidth: 165 }}>
                                <Typography className="max-w-[170px] truncate text-11" title={device.timeZone}>
                                  {device.timeZone}
                                </Typography>
                                <Chip
                                  className="mt-5"
                                  label={formatPreference(device.contentPreference)}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell sx={{ minWidth: 130 }}>
                                <Chip
                                  color={getActivityColor(activity)}
                                  label={getActivityLabel(activity)}
                                  size="small"
                                  variant="outlined"
                                />
                                <Typography
                                  className="mt-5 text-11"
                                  color="text.secondary"
                                  title={formatExactDateTime(device.lastSeenAt)}
                                >
                                  {formatRelativeTime(device.lastSeenAt)}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ minWidth: 125 }}>
                                <Typography className="text-16 font-bold">
                                  {formatNumber(device.notificationSentCount)}
                                </Typography>
                                <Typography
                                  className="mt-3 text-10"
                                  color="text.secondary"
                                  title={formatExactDateTime(device.lastSentAt)}
                                >
                                  Last {formatRelativeTime(device.lastSentAt)}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ minWidth: 150 }}>
                                <Box className="flex items-center gap-8">
                                  <Typography className="text-16 font-bold">
                                    {formatNumber(device.notificationVisitCount)}
                                  </Typography>
                                  <Chip
                                    color={device.notificationVisitCount > 0 ? 'success' : 'default'}
                                    label={device.notificationVisitCount > 0 ? 'Responded' : 'No visit'}
                                    size="small"
                                    variant="outlined"
                                  />
                                </Box>
                                <Typography
                                  className="mt-3 text-10"
                                  color="text.secondary"
                                  title={formatExactDateTime(device.lastNotificationVisitAt)}
                                >
                                  Last {formatRelativeTime(device.lastNotificationVisitAt)}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ minWidth: 105 }}>
                                <Typography
                                  className="text-15 font-bold"
                                  sx={{ color: openRate > 0 ? '#7ee6bb' : 'text.secondary' }}
                                >
                                  {device.notificationSentCount > 0
                                    ? formatPercent(openRate)
                                    : '--'}
                                </Typography>
                                <Typography className="mt-3 text-10" color="text.secondary">
                                  {formatNumber(device.notificationVisitCount)} /{' '}
                                  {formatNumber(device.notificationSentCount)}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ minWidth: 180 }}>
                                <Typography className="max-w-[190px] truncate text-12 font-semibold">
                                  {formatKind(lastKind)}
                                </Typography>
                                <Typography
                                  className="mt-3 max-w-[190px] truncate text-10"
                                  color="text.secondary"
                                  title={device.lastNotificationCampaignId || ''}
                                >
                                  {device.lastNotificationCampaignId ||
                                    `Last sent ${formatRelativeTime(device.lastEngagementAt)}`}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ minWidth: 115 }}>
                                <Chip
                                  color={health === 'failures' ? 'warning' : health === 'healthy' ? 'success' : 'default'}
                                  label={
                                    health === 'failures'
                                      ? `${formatNumber(device.failureCount)} failures`
                                      : health === 'healthy'
                                      ? 'Healthy'
                                      : 'Not tested'
                                  }
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={filteredDevices.length}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    onPageChange={(_, nextPage) => setPage(nextPage)}
                    onRowsPerPageChange={(event) => {
                      setRowsPerPage(Number(event.target.value));
                      setPage(0);
                    }}
                    sx={{ borderTop: '1px solid #27272a', color: 'text.secondary' }}
                  />
                </>
              )}
            </Paper>
          </Box>
        </Box>
      }
    />
  );
}

export default NotificationDevicesPage;
