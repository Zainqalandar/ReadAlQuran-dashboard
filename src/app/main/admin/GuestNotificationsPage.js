import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
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
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { getAdminApiErrorMessage, useGetNotificationDevicesQuery } from './adminApi';
import {
  dedupeNotificationDevices,
  getDeliveryEventAt,
  getDeliverySourceLabel,
  getNotificationDeviceDetails,
  getNotificationDeviceKey,
  getNotificationDeviceLabel,
  getNotificationFunnel,
  latestNullableIso,
  percentageRate,
  safeCount,
} from './notificationDeviceUtils';
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

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(safeCount(value));
}

function formatPercent(value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return '--';
  }

  const normalized = Math.max(0, Number(value) || 0);
  return `${normalized.toFixed(normalized >= 10 ? 0 : 1)}%`;
}

function getDeviceSecondary(device) {
  return device?.ownerType === 'user'
    ? device.userEmail || 'Signed-in reader'
    : 'Anonymous browser profile';
}

function getDeviceTypeLabel(device) {
  return device?.ownerType === 'user' ? 'Signed-in' : 'Guest';
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

function getDeliveryStatusColor(status) {
  if (status === 'failed') return 'error';
  if (status === 'pending') return 'warning';
  if (status === 'opened') return 'success';
  if (status === 'displayed') return 'info';
  if (status === 'accepted') return 'primary';
  return 'default';
}

function DeliveryTime({ label, value }) {
  return (
    <Box>
      <Typography className="text-10 font-bold uppercase" color="text.disabled">
        {label}
      </Typography>
      <Typography
        className="mt-2 text-11"
        color={value ? 'text.secondary' : 'text.disabled'}
        title={value ? formatExactDateTime(value) : ''}
      >
        {value ? formatRelativeTime(value) : '--'}
      </Typography>
    </Box>
  );
}

function DeliveryAuditHistory({ deliveries, deviceLabel }) {
  return (
    <Box
      sx={{
        backgroundColor: 'rgba(12, 12, 15, .72)',
        borderTop: '1px solid #27272a',
        p: 2,
      }}
    >
      <Box className="mb-12 flex flex-wrap items-center justify-between gap-8">
        <Box>
          <Typography className="text-12 font-bold">
            Recent delivery audit · {deviceLabel}
          </Typography>
          <Typography className="mt-2 text-10" color="text.secondary">
            Newest activity first. Provider acceptance does not guarantee browser display.
          </Typography>
        </Box>
        <Chip
          label={`${formatNumber(deliveries.length)} recent event${
            deliveries.length === 1 ? '' : 's'
          }`}
          size="small"
          variant="outlined"
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 1.25,
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        }}
      >
        {deliveries.map((delivery, index) => {
          const eventAt = getDeliveryEventAt(delivery);
          const hasFailure = Boolean(
            delivery.status === 'failed' || delivery.failedAt || delivery.errorMessage
          );

          return (
            <Paper
              component="article"
              elevation={0}
              key={delivery.deliveryId || `${delivery.createdAt}-${index}`}
              sx={{
                backgroundColor: 'rgba(24, 24, 28, .92)',
                border: '1px solid #2b2b31',
                borderRadius: 1.5,
                minWidth: 0,
                p: 1.5,
              }}
            >
              <Box className="flex flex-wrap items-center justify-between gap-8">
                <Box className="flex flex-wrap items-center gap-6">
                  <Chip
                    label={getDeliverySourceLabel(delivery.source)}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    color={getDeliveryStatusColor(delivery.status)}
                    label={formatKind(delivery.status)}
                    size="small"
                  />
                  {delivery.disabled ? (
                    <Chip color="error" label="Endpoint disabled" size="small" variant="outlined" />
                  ) : null}
                </Box>
                <Typography
                  className="text-10"
                  color="text.secondary"
                  title={formatExactDateTime(eventAt)}
                >
                  {formatRelativeTime(eventAt)}
                </Typography>
              </Box>

              <Typography
                className="mt-10 truncate text-12 font-semibold"
                title={delivery.notificationKind || ''}
              >
                {delivery.notificationKind
                  ? formatKind(delivery.notificationKind)
                  : 'Notification kind unavailable'}
              </Typography>
              <Typography
                className="mt-2 truncate text-10"
                color="text.secondary"
                title={delivery.campaignId || ''}
              >
                Campaign: {delivery.campaignId || '--'}
              </Typography>
              <Typography
                className="mt-2 truncate text-10"
                color="text.disabled"
                title={delivery.deliveryId || ''}
              >
                Delivery: {delivery.deliveryId || '--'} · Created{' '}
                {formatRelativeTime(delivery.createdAt)}
              </Typography>

              <Box
                className="mt-10"
                sx={{
                  display: 'grid',
                  gap: 1,
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                }}
              >
                <DeliveryTime label="Accepted" value={delivery.acceptedAt} />
                <DeliveryTime label="Displayed" value={delivery.displayedAt} />
                <DeliveryTime label="Opened" value={delivery.openedAt} />
              </Box>

              {hasFailure ? (
                <Box
                  className="mt-10 rounded-6 px-8 py-6"
                  sx={{
                    backgroundColor: 'rgba(248, 113, 113, .08)',
                    border: '1px solid rgba(248, 113, 113, .22)',
                  }}
                >
                  <Typography className="text-10 font-bold" color="error.light">
                    Failed {formatRelativeTime(delivery.failedAt)}
                    {delivery.statusCode !== null ? ` · HTTP ${delivery.statusCode}` : ''}
                  </Typography>
                  {delivery.errorMessage ? (
                    <Typography
                      className="line-clamp-2 mt-2 text-10"
                      color="error.light"
                      title={delivery.errorMessage}
                    >
                      {delivery.errorMessage}
                    </Typography>
                  ) : null}
                </Box>
              ) : null}
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
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
          <Typography className="mt-8 text-24 font-extrabold leading-none">{value}</Typography>
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
  const { data, error, isFetching, isLoading, refetch } = useGetNotificationDevicesQuery(
    undefined,
    {
      pollingInterval: 60_000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
    }
  );
  const [query, setQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [responseFilter, setResponseFilter] = useState('all');
  const [preferenceFilter, setPreferenceFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [timeZoneFilter, setTimeZoneFilter] = useState('all');
  const [sortBy, setSortBy] = useState('totalVisits');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [expandedDeviceKey, setExpandedDeviceKey] = useState(null);

  const devices = useMemo(
    () => dedupeNotificationDevices(Array.isArray(data?.devices) ? data.devices : []),
    [data?.devices]
  );
  const timeZones = useMemo(
    () => Array.from(new Set(devices.map((device) => device.timeZone))).sort(),
    [devices]
  );
  const filteredDevices = useMemo(() => {
    const search = query.trim().toLowerCase();
    const matches = devices.filter((device) => {
      const details = getNotificationDeviceDetails(device.userAgent);
      const activityStatus = getActivityStatus(device);
      const healthStatus = getHealthStatus(device);
      const funnel = getNotificationFunnel(device);
      const matchesSearch =
        !search ||
        [
          getNotificationDeviceLabel(device),
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
          ...device.recentDeliveries.flatMap((delivery) => [
            delivery.deliveryId,
            delivery.source,
            getDeliverySourceLabel(delivery.source),
            delivery.status,
            delivery.campaignId,
            delivery.notificationKind,
            delivery.statusCode,
            delivery.errorMessage,
          ]),
          details.browser,
          details.platform,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search));
      const matchesOwner = ownerFilter === 'all' || device.ownerType === ownerFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'enabled' && device.enabled) ||
        (statusFilter === 'disabled' && !device.enabled);
      const matchesActivity = activityFilter === 'all' || activityStatus === activityFilter;
      const matchesPreference =
        preferenceFilter === 'all' || device.contentPreference === preferenceFilter;
      const matchesHealth = healthFilter === 'all' || healthStatus === healthFilter;
      const matchesTimeZone = timeZoneFilter === 'all' || device.timeZone === timeZoneFilter;
      const matchesResponse =
        responseFilter === 'all' ||
        (responseFilter === 'opened' && funnel.opened > 0) ||
        (responseFilter === 'displayed-no-open' &&
          funnel.displayed !== null &&
          funnel.displayed > 0 &&
          funnel.trackedOpened === 0) ||
        (responseFilter === 'accepted-not-displayed' &&
          funnel.displayed !== null &&
          funnel.trackedAccepted > 0 &&
          funnel.displayed === 0) ||
        (responseFilter === 'accepted-no-open' &&
          funnel.trackedAccepted > 0 &&
          funnel.trackedOpened === 0) ||
        (responseFilter === 'display-unavailable' && funnel.displayed === null) ||
        (responseFilter === 'not-accepted' && funnel.accepted === 0);

      return (
        matchesSearch &&
        matchesOwner &&
        matchesStatus &&
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
      if (sortBy === 'displayed') {
        return (right.notificationDisplayedCount ?? -1) - (left.notificationDisplayedCount ?? -1);
      }
      if (sortBy === 'totalVisits') {
        return right.totalVisitCount - left.totalVisitCount;
      }
      if (sortBy === 'displayRate') {
        return (
          (getNotificationFunnel(right).acceptedToDisplayedRate ?? -1) -
          (getNotificationFunnel(left).acceptedToDisplayedRate ?? -1)
        );
      }
      if (sortBy === 'openRate') {
        return (
          (getNotificationFunnel(right).displayedToOpenedRate ?? -1) -
          (getNotificationFunnel(left).displayedToOpenedRate ?? -1)
        );
      }
      if (sortBy === 'lastTotalVisit') {
        return String(right.lastTotalVisitAt || '').localeCompare(
          String(left.lastTotalVisitAt || '')
        );
      }
      if (sortBy === 'lastVisit') {
        return String(right.lastNotificationVisitAt || '').localeCompare(
          String(left.lastNotificationVisitAt || '')
        );
      }
      if (sortBy === 'lastSeen') {
        return String(right.lastSeenAt || '').localeCompare(String(left.lastSeenAt || ''));
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
    statusFilter,
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
          const funnel = getNotificationFunnel(device);
          result.enabledDevices += device.enabled ? 1 : 0;
          result.disabledDevices += device.enabled ? 0 : 1;
          result.notificationsAccepted += funnel.accepted;
          result.notificationVisits += device.notificationVisitCount;
          result.totalVisits += device.totalVisitCount;
          result.activeDevices += device.enabled && getActivityStatus(device) === 'active' ? 1 : 0;
          result.devicesWithFailures += device.failureCount > 0 ? 1 : 0;
          if (funnel.displayed !== null) {
            result.displayTrackingDevices += 1;
            result.notificationsDisplayed += funnel.displayed;
            result.displayTrackedAccepted += funnel.trackedAccepted || 0;
            result.displayTrackedOpened += funnel.trackedOpened || 0;
          }
          result.lastTotalVisitAt = latestNullableIso(
            result.lastTotalVisitAt,
            device.lastTotalVisitAt
          );
          result.lastNotificationDisplayedAt = latestNullableIso(
            result.lastNotificationDisplayedAt,
            device.lastNotificationDisplayedAt
          );
          result.lastNotificationVisitAt = latestNullableIso(
            result.lastNotificationVisitAt,
            device.lastNotificationVisitAt
          );
          return result;
        },
        {
          enabledDevices: 0,
          disabledDevices: 0,
          notificationsAccepted: 0,
          notificationsDisplayed: 0,
          notificationVisits: 0,
          totalVisits: 0,
          activeDevices: 0,
          devicesWithFailures: 0,
          displayTrackingDevices: 0,
          displayTrackedAccepted: 0,
          displayTrackedOpened: 0,
          lastTotalVisitAt: null,
          lastNotificationDisplayedAt: null,
          lastNotificationVisitAt: null,
        }
      ),
    [devices]
  );
  const acceptedToDisplayedRate =
    summary.displayTrackingDevices > 0
      ? percentageRate(summary.notificationsDisplayed, summary.displayTrackedAccepted)
      : null;
  const displayedToOpenedRate =
    summary.displayTrackingDevices > 0
      ? percentageRate(summary.displayTrackedOpened, summary.notificationsDisplayed)
      : null;
  const hasFilters = Boolean(
    query ||
      ownerFilter !== 'all' ||
      statusFilter !== 'all' ||
      activityFilter !== 'all' ||
      responseFilter !== 'all' ||
      preferenceFilter !== 'all' ||
      healthFilter !== 'all' ||
      timeZoneFilter !== 'all'
  );
  const pageError = getAdminApiErrorMessage(error, 'Unable to load notification devices.');

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
    statusFilter,
    timeZoneFilter,
  ]);

  const clearFilters = () => {
    setQuery('');
    setOwnerFilter('all');
    setStatusFilter('all');
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
      label: 'Disabled devices',
      value: formatNumber(summary.disabledDevices),
      detail: 'Retained for delivery diagnosis',
      icon: <WarningAmberIcon sx={{ fontSize: 19 }} />,
      tone: summary.disabledDevices > 0 ? 'red' : 'gold',
    },
    {
      label: 'Total visits',
      value: formatNumber(summary.totalVisits),
      detail: `Last: ${formatRelativeTime(summary.lastTotalVisitAt)}`,
      icon: <GroupsIcon sx={{ fontSize: 19 }} />,
      tone: 'green',
    },
    {
      label: 'Provider accepted',
      value: formatNumber(summary.notificationsAccepted),
      detail: 'Accepted by the browser push provider',
      icon: <SendIcon sx={{ fontSize: 18 }} />,
      tone: 'blue',
    },
    {
      label: 'Displayed',
      value:
        summary.displayTrackingDevices > 0 ? formatNumber(summary.notificationsDisplayed) : '--',
      detail:
        summary.displayTrackingDevices > 0
          ? `${formatNumber(summary.displayTrackingDevices)}/${formatNumber(
              devices.length
            )} devices reporting · Last: ${formatRelativeTime(summary.lastNotificationDisplayedAt)}`
          : 'Browser display receipts not available',
      icon: <DevicesOtherIcon sx={{ fontSize: 19 }} />,
      tone: 'green',
    },
    {
      label: 'Opened from push',
      value: formatNumber(summary.notificationVisits),
      detail: `Last: ${formatRelativeTime(summary.lastNotificationVisitAt)}`,
      icon: <TouchAppIcon sx={{ fontSize: 19 }} />,
      tone: 'green',
    },
    {
      label: 'Accepted → displayed',
      value: formatPercent(acceptedToDisplayedRate),
      detail:
        summary.displayTrackingDevices > 0
          ? 'Display receipts / tracked accepts in the same measurement window'
          : 'Browser display receipts not available',
      icon: <TrendingUpIcon sx={{ fontSize: 19 }} />,
      tone: 'green',
    },
    {
      label: 'Displayed → opened',
      value: formatPercent(displayedToOpenedRate),
      detail:
        summary.displayTrackingDevices > 0
          ? 'Tracked opens / display receipts in the same measurement window'
          : 'Browser display receipts not available',
      icon: <TrendingUpIcon sx={{ fontSize: 19 }} />,
      tone: 'green',
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
                Provider acceptance, browser display receipts, attributed opens, and device health.
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
                  <RefreshIcon className={isFetching ? 'animate-spin' : ''} sx={{ fontSize: 18 }} />
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
                  xl: 'repeat(4, minmax(0, 1fr))',
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
                    <Typography className="text-16 font-bold">Device engagement</Typography>
                    <Typography className="mt-4 text-12" color="text.secondary">
                      {formatNumber(filteredDevices.length)} of {formatNumber(devices.length)}{' '}
                      devices
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
                      xl: 'minmax(280px, 1.5fr) repeat(8, minmax(120px, .7fr))',
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
                    aria-label="Filter by subscription status"
                    select
                    size="small"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    <MenuItem value="all">All statuses</MenuItem>
                    <MenuItem value="enabled">Enabled</MenuItem>
                    <MenuItem value="disabled">Disabled</MenuItem>
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
                    <MenuItem value="opened">Opened from push</MenuItem>
                    <MenuItem value="displayed-no-open">Displayed, not opened</MenuItem>
                    <MenuItem value="accepted-not-displayed">Accepted, not displayed</MenuItem>
                    <MenuItem value="accepted-no-open">Accepted, not opened</MenuItem>
                    <MenuItem value="display-unavailable">Display receipt unavailable</MenuItem>
                    <MenuItem value="not-accepted">Not accepted yet</MenuItem>
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
                    <MenuItem value="totalVisits">Most total visits</MenuItem>
                    <MenuItem value="lastTotalVisit">Latest total visit</MenuItem>
                    <MenuItem value="visits">Most push opens</MenuItem>
                    <MenuItem value="sent">Most provider accepts</MenuItem>
                    <MenuItem value="displayed">Most display receipts</MenuItem>
                    <MenuItem value="displayRate">Highest accepted → displayed</MenuItem>
                    <MenuItem value="openRate">Highest displayed → opened</MenuItem>
                    <MenuItem value="lastVisit">Latest push open</MenuItem>
                    <MenuItem value="lastSeen">Latest seen</MenuItem>
                    <MenuItem value="failures">Most failures</MenuItem>
                  </TextField>
                </Box>
              </Box>

              {!isLoading && filteredDevices.length === 0 ? (
                <Box className="px-20 py-48 text-center">
                  <Typography className="text-14 font-semibold">
                    {devices.length === 0
                      ? 'No notification devices are available yet.'
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
                      sx={{ minWidth: 2180 }}
                    >
                      <TableHead>
                        <TableRow>
                          {[
                            'Reader / device',
                            'Audience',
                            'Status',
                            'Browser',
                            'Profile',
                            'Activity',
                            'Total visits',
                            'Provider accepted',
                            'Displayed',
                            'Opened from push',
                            'Funnel rates',
                            'Last content',
                            'Health',
                            'Delivery audit',
                          ].map((heading) => (
                            <TableCell key={heading} sx={TABLE_HEAD_SX}>
                              {heading}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedDevices.map((device) => {
                          const details = getNotificationDeviceDetails(device.userAgent);
                          const activity = getActivityStatus(device);
                          const health = getHealthStatus(device);
                          const funnel = getNotificationFunnel(device);
                          const lastKind = device.lastNotificationKind || device.lastEngagementKind;
                          const deviceKey = getNotificationDeviceKey(device);
                          const auditPanelId = `delivery-audit-${deviceKey.replace(
                            /[^a-z0-9_-]/gi,
                            '-'
                          )}`;
                          const isAuditExpanded = expandedDeviceKey === deviceKey;
                          const latestDelivery = device.recentDeliveries[0];

                          return (
                            <Fragment key={deviceKey}>
                              <TableRow hover>
                                <TableCell sx={{ minWidth: 230 }}>
                                  <Typography className="max-w-[250px] truncate text-13 font-semibold">
                                    {getNotificationDeviceLabel(device)}
                                  </Typography>
                                  <Typography
                                    className="mt-2 max-w-[250px] truncate text-11"
                                    color="text.secondary"
                                    title={getDeviceSecondary(device)}
                                  >
                                    {getDeviceSecondary(device)}
                                  </Typography>
                                  <Typography className="mt-2 text-10" color="text.disabled">
                                    Registered {formatRelativeTime(device.createdAt)}
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
                                <TableCell sx={{ minWidth: 105 }}>
                                  <Chip
                                    color={device.enabled ? 'success' : 'error'}
                                    label={device.enabled ? 'Enabled' : 'Disabled'}
                                    size="small"
                                    variant="outlined"
                                  />
                                  <Typography className="mt-5 text-10" color="text.secondary">
                                    {device.enabled ? 'Eligible for push' : 'Not targeted'}
                                  </Typography>
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
                                  <Typography
                                    className="max-w-[170px] truncate text-11"
                                    title={device.timeZone}
                                  >
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
                                <TableCell sx={{ minWidth: 135 }}>
                                  <Typography className="text-16 font-bold">
                                    {formatNumber(device.totalVisitCount)}
                                  </Typography>
                                  <Typography
                                    className="mt-3 text-10"
                                    color="text.secondary"
                                    title={formatExactDateTime(device.lastTotalVisitAt)}
                                  >
                                    Last {formatRelativeTime(device.lastTotalVisitAt)}
                                  </Typography>
                                </TableCell>
                                <TableCell sx={{ minWidth: 125 }}>
                                  <Typography className="text-16 font-bold">
                                    {formatNumber(funnel.accepted)}
                                  </Typography>
                                  <Typography
                                    className="mt-3 text-10"
                                    color="text.secondary"
                                    title={formatExactDateTime(device.lastSentAt)}
                                  >
                                    Last {formatRelativeTime(device.lastSentAt)}
                                  </Typography>
                                </TableCell>
                                <TableCell sx={{ minWidth: 145 }}>
                                  <Typography className="text-16 font-bold">
                                    {funnel.displayed === null
                                      ? '--'
                                      : formatNumber(funnel.displayed)}
                                  </Typography>
                                  <Typography
                                    className="mt-3 text-10"
                                    color="text.secondary"
                                    title={formatExactDateTime(device.lastNotificationDisplayedAt)}
                                  >
                                    {funnel.displayed === null
                                      ? 'Receipt unavailable'
                                      : `Last ${formatRelativeTime(
                                          device.lastNotificationDisplayedAt
                                        )}`}
                                  </Typography>
                                </TableCell>
                                <TableCell sx={{ minWidth: 150 }}>
                                  <Box className="flex items-center gap-8">
                                    <Typography className="text-16 font-bold">
                                      {formatNumber(funnel.opened)}
                                    </Typography>
                                    <Chip
                                      color={funnel.opened > 0 ? 'success' : 'default'}
                                      label={funnel.opened > 0 ? 'Opened' : 'No open'}
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
                                <TableCell sx={{ minWidth: 175 }}>
                                  <Typography
                                    className="text-12 font-bold"
                                    sx={{
                                      color:
                                        funnel.acceptedToDisplayedRate > 0
                                          ? '#7ee6bb'
                                          : 'text.secondary',
                                    }}
                                  >
                                    Accepted → displayed:{' '}
                                    {formatPercent(funnel.acceptedToDisplayedRate)}
                                  </Typography>
                                  <Typography className="mt-4 text-11" color="text.secondary">
                                    Displayed → opened:{' '}
                                    {formatPercent(funnel.displayedToOpenedRate)}
                                  </Typography>
                                  <Typography className="mt-3 text-10" color="text.disabled">
                                    Accepted → opened: {formatPercent(funnel.acceptedToOpenedRate)}
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
                                      `Last accepted ${formatRelativeTime(
                                        device.lastEngagementAt
                                      )}`}
                                  </Typography>
                                </TableCell>
                                <TableCell sx={{ minWidth: 115 }}>
                                  <Chip
                                    color={
                                      health === 'failures'
                                        ? 'warning'
                                        : health === 'healthy'
                                        ? 'success'
                                        : 'default'
                                    }
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
                                <TableCell sx={{ minWidth: 170 }}>
                                  <Button
                                    aria-controls={auditPanelId}
                                    aria-expanded={isAuditExpanded}
                                    disabled={device.recentDeliveries.length === 0}
                                    endIcon={
                                      isAuditExpanded ? (
                                        <KeyboardArrowUpIcon />
                                      ) : (
                                        <KeyboardArrowDownIcon />
                                      )
                                    }
                                    onClick={() =>
                                      setExpandedDeviceKey(isAuditExpanded ? null : deviceKey)
                                    }
                                    size="small"
                                    variant="outlined"
                                  >
                                    {device.recentDeliveries.length === 0
                                      ? 'No history'
                                      : isAuditExpanded
                                      ? 'Hide history'
                                      : `View ${formatNumber(device.recentDeliveries.length)}`}
                                  </Button>
                                  {latestDelivery ? (
                                    <Typography
                                      className="mt-5 max-w-[180px] truncate text-10"
                                      color="text.secondary"
                                      title={`${getDeliverySourceLabel(
                                        latestDelivery.source
                                      )} · ${formatKind(latestDelivery.status)}`}
                                    >
                                      Latest: {getDeliverySourceLabel(latestDelivery.source)} ·{' '}
                                      {formatKind(latestDelivery.status)}
                                    </Typography>
                                  ) : (
                                    <Typography className="mt-5 text-10" color="text.disabled">
                                      Audit not available
                                    </Typography>
                                  )}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell
                                  colSpan={14}
                                  sx={{
                                    borderBottom: isAuditExpanded ? '1px solid #2b2b31' : 0,
                                    p: 0,
                                  }}
                                >
                                  <Collapse
                                    id={auditPanelId}
                                    in={isAuditExpanded}
                                    timeout="auto"
                                    unmountOnExit
                                  >
                                    <DeliveryAuditHistory
                                      deliveries={device.recentDeliveries}
                                      deviceLabel={getNotificationDeviceLabel(device)}
                                    />
                                  </Collapse>
                                </TableCell>
                              </TableRow>
                            </Fragment>
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
                    sx={{
                      borderTop: '1px solid #27272a',
                      color: 'text.secondary',
                    }}
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
