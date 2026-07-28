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
  useGetGuestPushDevicesQuery,
} from './adminApi';

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Math.max(0, Number(value) || 0));
}

function formatDate(value) {
  if (!value) return 'Never';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleString();
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
  const id = String(device?.id || device?.deviceId || '').replace(/-/g, '');
  return `Guest ${id.slice(0, 8).toUpperCase() || 'DEVICE'}`;
}

function GuestNotificationsPage() {
  const { data, error, isFetching, isLoading, refetch } =
    useGetGuestPushDevicesQuery();
  const [query, setQuery] = useState('');
  const devices = useMemo(
    () => (Array.isArray(data?.devices) ? data.devices : []),
    [data?.devices]
  );
  const filteredDevices = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return devices;

    return devices.filter((device) => {
      const details = getDeviceDetails(device.userAgent);
      return [
        getDeviceLabel(device),
        device.id,
        device.deviceId,
        device.userAgent,
        details.browser,
        details.platform,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search));
    });
  }, [devices, query]);
  const summary = data?.summary || {
    enabledDevices: devices.length,
    reachedDevices: 0,
    devicesWithFailures: 0,
  };
  const pageError = getAdminApiErrorMessage(
    error,
    'Unable to load guest notification devices.'
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
                Guest notification devices
              </Typography>
              <Typography className="mt-8 text-14" color="text.secondary">
                Anonymous browsers that currently have website push enabled.
              </Typography>
            </Box>
            <Tooltip title={isFetching ? 'Refreshing devices' : 'Refresh devices'}>
              <span>
                <IconButton
                  aria-label="Refresh guest notification devices"
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
                  <Typography className="text-16 font-bold">Enabled guest devices</Typography>
                  <Typography className="mt-4 text-12" color="text.secondary">
                    Device labels are anonymous and identify one browser profile.
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
                      ? 'No guest device has enabled notifications yet.'
                      : 'No device matches this search.'}
                  </Typography>
                </Box>
              ) : (
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table size="small" sx={{ minWidth: 980 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Device</TableCell>
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
                              title={device.userAgent || ''}
                            >
                              {device.userAgent || 'User agent unavailable'}
                            </Typography>
                          </TableCell>
                          <TableCell>{details.browser}</TableCell>
                          <TableCell>{details.platform}</TableCell>
                          <TableCell>{formatDate(device.createdAt)}</TableCell>
                          <TableCell>{formatDate(device.lastSeenAt)}</TableCell>
                          <TableCell>{formatDate(device.lastSentAt)}</TableCell>
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

export default GuestNotificationsPage;
