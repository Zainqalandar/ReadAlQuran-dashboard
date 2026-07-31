import {
  Alert,
  Box,
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
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { useMemo, useState } from 'react';
import {
  getAdminApiErrorMessage,
  useGetNotificationDevicesQuery,
} from './adminApi';
import { formatExactDateTime, formatRelativeTime } from './relativeTime';

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Math.max(0, Number(value) || 0));
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
  if (device?.ownerType === 'user') {
    return device.userEmail || 'Signed-in reader';
  }

  return 'Anonymous browser profile';
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

function dedupeDevices(items) {
  const logicalDevices = new Map();

  items.forEach((device) => {
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
    logicalDevices.set(key, {
      ...latest,
      failureCount: Math.max(
        Number(existing.failureCount) || 0,
        Number(device.failureCount) || 0
      ),
      lastSentAt: latestNullableIso(existing.lastSentAt, device.lastSentAt),
    });
  });

  return Array.from(logicalDevices.values()).sort((left, right) =>
    String(right.lastSeenAt).localeCompare(String(left.lastSeenAt))
  );
}

function NotificationDevicesPage() {
  const { data, error, isFetching, isLoading, refetch } =
    useGetNotificationDevicesQuery();
  const [query, setQuery] = useState('');
  const devices = useMemo(
    () => dedupeDevices(Array.isArray(data?.devices) ? data.devices : []),
    [data?.devices]
  );
  const filteredDevices = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return devices;

    return devices.filter((device) => {
      const details = getDeviceDetails(device.userAgent);
      return [
        getDeviceLabel(device),
        getDeviceSecondary(device),
        getDeviceTypeLabel(device),
        device.id,
        device.deviceId,
        device.userId,
        device.userName,
        device.userEmail,
        device.userAgent,
        details.browser,
        details.platform,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search));
    });
  }, [devices, query]);
  const summary = useMemo(
    () =>
      devices.reduce(
        (result, device) => {
          result.enabledDevices += 1;
          result.signedInDevices += device.ownerType === 'user' ? 1 : 0;
          result.guestDevices += device.ownerType === 'guest' ? 1 : 0;
          result.reachedDevices += device.lastSentAt ? 1 : 0;
          result.devicesWithFailures += device.failureCount > 0 ? 1 : 0;
          return result;
        },
        {
          enabledDevices: 0,
          signedInDevices: 0,
          guestDevices: 0,
          reachedDevices: 0,
          devicesWithFailures: 0,
        }
      ),
    [devices]
  );
  const pageError = getAdminApiErrorMessage(
    error,
    'Unable to load notification devices.'
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
              <Typography className="text-3xl font-extrabold leading-tight">
                Notification devices
              </Typography>
              <Typography className="mt-8 text-14" color="text.secondary">
                Signed-in readers and anonymous browsers with website push enabled.
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
          <Box className="mx-auto flex w-full max-w-[1440px] flex-col gap-20">
            {isLoading ? <LinearProgress /> : null}
            {error ? <Alert severity="error">{pageError}</Alert> : null}

            <Box className="flex flex-wrap items-center gap-10">
              <Chip
                color="success"
                label={`${formatNumber(summary.enabledDevices)} enabled`}
                variant="outlined"
              />
              <Chip
                label={`${formatNumber(summary.signedInDevices)} signed-in`}
                variant="outlined"
              />
              <Chip
                label={`${formatNumber(summary.guestDevices)} guest`}
                variant="outlined"
              />
              <Chip
                label={`${formatNumber(summary.reachedDevices)} reached before`}
                variant="outlined"
              />
              <Chip
                color={summary.devicesWithFailures > 0 ? 'warning' : 'default'}
                label={`${formatNumber(summary.devicesWithFailures)} with failures`}
                variant="outlined"
              />
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
              <Box className="flex flex-wrap items-center justify-between gap-16 border-b p-20">
                <Box>
                  <Typography className="text-16 font-bold">Enabled notification devices</Typography>
                  <Typography className="mt-4 text-12" color="text.secondary">
                    Signed-in rows show the reader account; guest rows stay anonymous.
                  </Typography>
                </Box>
                <TextField
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search devices"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: { xs: '100%', sm: 280 } }}
                />
              </Box>

              {!isLoading && filteredDevices.length === 0 ? (
                <Box className="px-20 py-40 text-center">
                  <Typography color="text.secondary">
                    {devices.length === 0
                      ? 'No signed-in or guest device has enabled notifications yet.'
                      : 'No device matches this search.'}
                  </Typography>
                </Box>
              ) : (
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table size="small" sx={{ minWidth: 1080 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Owner</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Browser</TableCell>
                      <TableCell>Platform</TableCell>
                      <TableCell>Enabled</TableCell>
                      <TableCell>Last seen</TableCell>
                      <TableCell>Last sent</TableCell>
                      <TableCell align="right">Failures</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredDevices.map((device) => {
                      const details = getDeviceDetails(device.userAgent);
                      return (
                        <TableRow key={device.id} hover>
                          <TableCell>
                            <Typography className="text-13 font-semibold">
                              {getDeviceLabel(device)}
                            </Typography>
                            <Typography
                              className="mt-2 max-w-[300px] truncate text-11"
                              color="text.secondary"
                              title={
                                device.ownerType === 'user'
                                  ? device.userEmail || ''
                                  : device.userAgent || ''
                              }
                            >
                              {getDeviceSecondary(device)}
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
                          <TableCell>{details.browser}</TableCell>
                          <TableCell>{details.platform}</TableCell>
                          <TableCell>{formatExactDateTime(device.createdAt)}</TableCell>
                          <TableCell title={formatExactDateTime(device.lastSeenAt)}>
                            {formatRelativeTime(device.lastSeenAt)}
                          </TableCell>
                          <TableCell title={formatExactDateTime(device.lastSentAt)}>
                            {formatRelativeTime(device.lastSentAt)}
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              color={device.failureCount > 0 ? 'warning' : 'success'}
                              label={formatNumber(device.failureCount)}
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
              )}
            </Paper>
          </Box>
        </Box>
      }
    />
  );
}

export default NotificationDevicesPage;
