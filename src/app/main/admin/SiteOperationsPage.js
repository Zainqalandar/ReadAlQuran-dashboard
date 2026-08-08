import { Alert, Button, Checkbox, FormControlLabel, IconButton, LinearProgress, ListItemText, MenuItem, Paper, TextField, Tooltip, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  getAdminApiErrorMessage,
  useBroadcastGuestNotificationMutation,
  useBroadcastNotificationMutation,
  useGetAdminUsersQuery,
  useGetGuestPushDevicesQuery,
} from './adminApi';
import {
  getGuestDeviceLabel,
  getNotificationDeviceDetails,
} from './notificationDeviceUtils';
import { formatRelativeTime } from './relativeTime';

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Math.round(Number(value || 0)));
}

function formatDuration(seconds) {
  const safe = Math.max(0, Number(seconds || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);

  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function formatDate(value) {
  if (!value) return 'Never';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleString();
}

function getReaderName(user) {
  return user?.name || user?.displayName || user?.userName || 'Unknown reader';
}

function getReaderEmail(user) {
  return user?.email || user?.userEmail || 'No email';
}

function getGuestDeviceSecondary(device) {
  const details = getNotificationDeviceDetails(device?.userAgent);
  return `${details.browser} - Last seen: ${formatRelativeTime(device?.lastSeenAt)}`;
}

function Metric({ label, value, icon }) {
  return (
    <Paper className="rounded-14 p-20" elevation={0} sx={{ backgroundColor: 'background.paper', border: '1px solid #27272a' }}>
      <Box className="flex items-center justify-between gap-16">
        <Box>
          <Typography className="text-11 font-bold uppercase tracking-wide" color="text.secondary">
            {label}
          </Typography>
          <Typography className="text-26 mt-10 font-extrabold">{value}</Typography>
        </Box>
        <FuseSvgIcon color="primary" size={22}>
          {icon}
        </FuseSvgIcon>
      </Box>
    </Paper>
  );
}

function SiteOperationsPage() {
  const { data, error, isFetching, isLoading, refetch } = useGetAdminUsersQuery();
  const {
    data: guestData,
    error: guestDevicesError,
    isFetching: isFetchingGuests,
    isLoading: isLoadingGuests,
    refetch: refetchGuestDevices,
  } = useGetGuestPushDevicesQuery(undefined, {
    pollingInterval: 60_000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,
  });
  const [
    broadcastNotification,
    { error: broadcastError, isLoading: isSendingReaders },
  ] = useBroadcastNotificationMutation();
  const [
    broadcastGuestNotification,
    { error: guestBroadcastError, isLoading: isSendingGuests },
  ] = useBroadcastGuestNotificationMutation();
  const [form, setForm] = useState({
    title: '',
    message: '',
    href: '/',
    type: 'system',
    priority: 'normal',
    push: true,
    audience: 'users',
    recipientMode: 'all',
    targetUserIds: [],
    targetDeviceIds: [],
  });
  const [result, setResult] = useState('');
  const [localError, setLocalError] = useState('');

  const summary = data?.summary || {
    totalUsers: 0,
    totalSessionSeconds: 0,
    totalAudioSeconds: 0,
  };
  const readers = useMemo(() => (Array.isArray(data?.users) ? data.users : []), [data?.users]);
  const allGuestDevices = useMemo(
    () => (Array.isArray(guestData?.devices) ? guestData.devices : []),
    [guestData?.devices]
  );
  const guestDevices = useMemo(
    () => allGuestDevices.filter((device) => device?.enabled !== false),
    [allGuestDevices]
  );
  const disabledGuestDeviceCount = allGuestDevices.length - guestDevices.length;
  const isGuestAudience = form.audience === 'guests';
  const enabledGuestDeviceIds = useMemo(
    () => new Set(guestDevices.map((device) => device.id).filter(Boolean)),
    [guestDevices]
  );
  const selectedRecipientIds = isGuestAudience
    ? form.targetDeviceIds.filter((id) => enabledGuestDeviceIds.has(id))
    : form.targetUserIds;
  const selectedRecipientCount = selectedRecipientIds.length;
  const availableRecipients = isGuestAudience ? guestDevices : readers;
  const isSending = isSendingReaders || isSendingGuests;
  const feedbackCount = Array.isArray(data?.feedback) ? data.feedback.length : 0;
  const pageError = getAdminApiErrorMessage(error, 'Unable to load ReadAlQuran operations.');
  const guestPageError = getAdminApiErrorMessage(
    guestDevicesError,
    'Unable to load guest notification devices.'
  );
  const activeBroadcastError = isGuestAudience
    ? guestBroadcastError
    : broadcastError;
  const sendError = getAdminApiErrorMessage(
    activeBroadcastError,
    'Unable to send the notification.'
  );

  const updateForm = (field) => (event) => {
    const value = field === 'push' ? event.target.checked : event.target.value;

    if (field === 'audience') {
      setForm((current) => ({
        ...current,
        audience: value,
        recipientMode: 'all',
        targetUserIds: [],
        targetDeviceIds: [],
      }));
      return;
    }

    if (field === 'recipientMode') {
      setForm((current) => ({
        ...current,
        recipientMode: value,
        targetUserIds: value === 'all' ? [] : current.targetUserIds,
        targetDeviceIds: value === 'all' ? [] : current.targetDeviceIds,
      }));
      return;
    }

    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateSelectedRecipients = (event) => {
    const value = event.target.value;
    const selectedIds = typeof value === 'string' ? value.split(',') : value;
    setForm((current) => ({
      ...current,
      recipientMode: 'selected',
      ...(isGuestAudience
        ? { targetDeviceIds: selectedIds }
        : { targetUserIds: selectedIds }),
    }));
  };

  const selectAllRecipients = () => {
    const selectedIds = availableRecipients
      .map((recipient) => recipient.id)
      .filter(Boolean)
      .slice(0, 500);
    setForm((current) => ({
      ...current,
      recipientMode: 'selected',
      ...(isGuestAudience
        ? { targetDeviceIds: selectedIds }
        : { targetUserIds: selectedIds }),
    }));
  };

  const clearSelectedRecipients = () => {
    setForm((current) => ({
      ...current,
      ...(isGuestAudience ? { targetDeviceIds: [] } : { targetUserIds: [] }),
    }));
  };

  const refreshOperations = () => {
    refetch();
    refetchGuestDevices();
  };

  const sendBroadcast = async (event) => {
    event.preventDefault();
    setResult('');
    setLocalError('');

    if (form.recipientMode === 'selected' && selectedRecipientCount === 0) {
      setLocalError(
        isGuestAudience
          ? 'Select at least one guest device before sending.'
          : 'Select at least one logged-in reader before sending.'
      );
      return;
    }

    try {
      const notificationPayload = {
        title: form.title,
        message: form.message,
        href: form.href.trim() || '/',
        type: form.type,
        priority: form.priority,
      };

      if (isGuestAudience) {
        const response = await broadcastGuestNotification({
          ...notificationPayload,
          ...(form.recipientMode === 'selected'
            ? { targetDeviceIds: selectedRecipientIds }
            : {}),
        }).unwrap();
        const pushTargets = Math.max(0, Number(response?.pushTargets) || 0);
        const pushAccepted = Math.max(0, Number(response?.push?.sent) || 0);
        const pushFailed = Math.max(0, Number(response?.push?.failed) || 0);
        const targetLabel =
          Array.isArray(response?.targetDeviceIds) &&
          response.targetDeviceIds.length > 0
            ? 'selected guest devices'
            : 'guest devices';

        setResult(
          `Provider accepted ${formatNumber(pushAccepted)}/${formatNumber(pushTargets)} for ${targetLabel}${pushFailed > 0 ? `, failed ${formatNumber(pushFailed)}` : ''}.`
        );
      } else {
        const response = await broadcastNotification({
          ...notificationPayload,
          push: form.push,
          ...(form.recipientMode === 'selected'
            ? { targetUserIds: form.targetUserIds }
            : {}),
        }).unwrap();
        const targetCount = Math.max(0, Number(response?.users) || 0);
        const inAppCreated = Math.max(0, Number(response?.inAppCreated) || 0);
        const pushTargets = Math.max(0, Number(response?.pushTargets) || 0);
        const pushAccepted = Math.max(0, Number(response?.push?.sent) || 0);
        const pushFailed = Math.max(0, Number(response?.push?.failed) || 0);
        const targetLabel =
          Array.isArray(response?.targetUserIds) &&
          response.targetUserIds.length > 0
            ? 'selected readers'
            : 'readers';
        const pushSummary = form.push
          ? ` Provider accepted ${formatNumber(pushAccepted)}/${formatNumber(pushTargets)}${pushFailed > 0 ? `, failed ${formatNumber(pushFailed)}` : ''}.`
          : '';

        setResult(
          `Delivered in-app to ${formatNumber(inAppCreated)}/${formatNumber(targetCount)} ${targetLabel}.${pushSummary}`
        );
      }

      setForm((current) => ({ ...current, title: '', message: '' }));
    } catch {
      // The API error is rendered next to the form.
    }
  };

  return (
    <FusePageSimple
      header={
        <div className="flex w-full flex-col justify-center border-b px-24 py-24 sm:px-40" style={{ borderColor: '#27272a' }}>
          <Box className="flex flex-wrap items-center justify-between gap-16">
            <Box>
              <Typography className="text-3xl font-extrabold leading-tight">Site operations</Typography>
              <Typography className="mt-8 text-14" color="text.secondary">
                ReadAlQuran readers, feedback, and notification delivery.
              </Typography>
            </Box>
            <Tooltip title={isFetching || isFetchingGuests ? 'Refreshing operations' : 'Refresh operations data'}>
              <span>
                <IconButton
                  aria-label="Refresh operations data"
                  className="h-36 w-36 border border-solid"
                  disabled={isFetching || isFetchingGuests}
                  onClick={refreshOperations}
                  size="small"
                  sx={{
                    borderColor: 'rgba(201, 162, 39, .38)',
                    color: 'primary.light',
                    backgroundColor: 'rgba(201, 162, 39, .08)',
                    '&:hover': {
                      backgroundColor: 'rgba(201, 162, 39, .16)',
                      borderColor: 'rgba(201, 162, 39, .58)',
                    },
                    '&.Mui-disabled': {
                      borderColor: 'rgba(201, 162, 39, .2)',
                      color: 'rgba(201, 162, 39, .45)',
                    },
                  }}
                >
                  <RefreshIcon className={isFetching || isFetchingGuests ? 'animate-spin' : ''} sx={{ fontSize: 18 }} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </div>
      }
      content={
        <Box className="w-full p-24 sm:p-40">
          <Box className="mx-auto flex w-full max-w-[1440px] flex-col gap-20">
            {isLoading || isLoadingGuests ? <LinearProgress /> : null}
            {error ? <Alert severity="warning">{pageError}</Alert> : null}
            {guestDevicesError ? <Alert severity="warning">{guestPageError}</Alert> : null}

            <Box className="grid grid-cols-1 gap-16 sm:grid-cols-2 xl:grid-cols-3">
              <Metric label="Registered readers" value={formatNumber(summary.totalUsers)} icon="heroicons-outline:users" />
              <Metric label="Feedback waiting" value={formatNumber(feedbackCount)} icon="heroicons-outline:chat-alt-2" />
              <Metric label="Reader time" value={formatDuration(summary.totalSessionSeconds)} icon="heroicons-outline:clock" />
              <Metric label="Audio time" value={formatDuration(summary.totalAudioSeconds)} icon="heroicons-outline:volume-up" />
              <Metric label="Enabled guest devices" value={formatNumber(guestDevices.length)} icon="heroicons-outline:device-mobile" />
              <Metric label="Disabled guest devices" value={formatNumber(disabledGuestDeviceCount)} icon="heroicons-outline:minus-circle" />
            </Box>

            <Box className="grid grid-cols-1 gap-20 xl:grid-cols-[minmax(0,1fr)_360px]">
              <Paper
                className="rounded-14 p-20"
                elevation={0}
                sx={{
                  backgroundColor: 'background.paper',
                  border: '1px solid #27272a',
                }}
              >
                <Box className="flex flex-wrap items-start justify-between gap-16">
                  <Box>
                    <Typography className="text-16 font-bold">Broadcast notification</Typography>
                    <Typography className="mt-6 text-12" color="text.secondary">
                      Send to logged-in readers or enabled guest notification devices.
                    </Typography>
                  </Box>
                </Box>

                <Box component="form" className="mt-20 grid grid-cols-1 gap-16" onSubmit={sendBroadcast}>
                  <TextField label="Title" value={form.title} onChange={updateForm('title')} inputProps={{ maxLength: 120 }} required fullWidth />
                  <TextField label="Message" value={form.message} onChange={updateForm('message')} inputProps={{ maxLength: 420 }} minRows={3} multiline required fullWidth />
                  <Box className="grid grid-cols-1 gap-16 lg:grid-cols-[200px_220px_minmax(0,1fr)]">
                    <TextField select label="Audience" value={form.audience} onChange={updateForm('audience')}>
                      <MenuItem value="users">Logged-in readers</MenuItem>
                      <MenuItem value="guests">Guest devices</MenuItem>
                    </TextField>
                    <TextField select label="Recipients" value={form.recipientMode} onChange={updateForm('recipientMode')}>
                      <MenuItem value="all">
                        {isGuestAudience ? 'All guest devices' : 'All logged-in readers'}
                      </MenuItem>
                      <MenuItem value="selected">
                        {isGuestAudience ? 'Selected devices' : 'Selected readers'}
                      </MenuItem>
                    </TextField>
                    <TextField
                      select
                      label={isGuestAudience ? 'Choose devices' : 'Choose readers'}
                      value={selectedRecipientIds}
                      onChange={updateSelectedRecipients}
                      disabled={form.recipientMode !== 'selected' || availableRecipients.length === 0}
                      helperText={
                        availableRecipients.length === 0
                          ? isGuestAudience
                            ? 'No enabled guest devices loaded.'
                            : 'No logged-in readers loaded.'
                          : form.recipientMode === 'selected'
                            ? `${formatNumber(selectedRecipientCount)} selected`
                            : 'Switch to selected recipients for custom delivery.'
                      }
                      SelectProps={{
                        multiple: true,
                        renderValue: (selected) => {
                          const selectedValues = Array.isArray(selected) ? selected : [];
                          return selectedValues.length > 0 ? `${formatNumber(selectedValues.length)} selected` : 'None selected';
                        },
                      }}
                      fullWidth
                    >
                      {isGuestAudience
                        ? guestDevices.map((device) => (
                            <MenuItem key={device.id} value={device.id}>
                              <Checkbox checked={form.targetDeviceIds.includes(device.id)} />
                              <ListItemText
                                primary={getGuestDeviceLabel(device)}
                                secondary={getGuestDeviceSecondary(device)}
                              />
                            </MenuItem>
                          ))
                        : readers.map((reader) => (
                            <MenuItem key={reader.id} value={reader.id}>
                              <Checkbox checked={form.targetUserIds.includes(reader.id)} />
                              <ListItemText primary={`${getReaderName(reader)} - ${getReaderEmail(reader)}`} secondary={`Last login: ${formatDate(reader.lastLoginAt)}`} />
                            </MenuItem>
                          ))}
                    </TextField>
                  </Box>
                  {form.recipientMode === 'selected' ? (
                    <Box className="flex flex-wrap items-center gap-8">
                      <Button type="button" size="small" variant="outlined" onClick={selectAllRecipients} disabled={availableRecipients.length === 0}>
                        Select all loaded
                      </Button>
                      <Button type="button" size="small" variant="text" onClick={clearSelectedRecipients} disabled={selectedRecipientCount === 0}>
                        Clear selection
                      </Button>
                    </Box>
                  ) : null}
                  <Box className="grid grid-cols-1 gap-16 sm:grid-cols-3">
                    <TextField label="Link" value={form.href} onChange={updateForm('href')} helperText="Starts with /" inputProps={{ maxLength: 240 }} />
                    <TextField select label="Type" value={form.type} onChange={updateForm('type')}>
                      {['system', 'quran', 'audio', 'prayer', 'bookmark', 'islamic'].map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField select label="Priority" value={form.priority} onChange={updateForm('priority')}>
                      {['low', 'normal', 'high'].map((priority) => (
                        <MenuItem key={priority} value={priority}>
                          {priority}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                  <Box className="flex flex-wrap items-center justify-between gap-12">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isGuestAudience || form.push}
                          disabled={isGuestAudience}
                          onChange={updateForm('push')}
                        />
                      }
                      label={isGuestAudience ? 'Browser push required for guest devices' : 'Also send push notifications'}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<SendIcon />}
                      disabled={isSending}
                      sx={{
                        minWidth: 176,
                        fontWeight: 800,
                        backgroundColor: '#c9a227',
                        color: '#09090b',
                        border: '1px solid rgba(250, 250, 250, .1)',
                        boxShadow: '0 10px 24px rgba(201, 162, 39, .18)',
                        '&:hover': {
                          backgroundColor: '#dbb84a',
                          boxShadow: '0 12px 28px rgba(201, 162, 39, .25)',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: 'rgba(82, 82, 91, .72)',
                          color: 'rgba(250, 250, 250, .72)',
                          borderColor: 'rgba(161, 161, 170, .24)',
                          boxShadow: 'none',
                        },
                      }}
                    >
                      {isSending ? 'Sending...' : 'Send broadcast'}
                    </Button>
                  </Box>
                  {localError ? <Alert severity="error">{localError}</Alert> : null}
                  {activeBroadcastError ? <Alert severity="error">{sendError}</Alert> : null}
                  {result ? <Alert severity="success">{result}</Alert> : null}
                </Box>
              </Paper>

              <Paper
                className="rounded-14 p-20"
                elevation={0}
                sx={{
                  backgroundColor: 'background.paper',
                  border: '1px solid #27272a',
                }}
              >
                <Typography className="text-16 font-bold">Reader records</Typography>
                <Typography className="mt-8 text-12 leading-relaxed" color="text.secondary">
                  Review registered readers, saved Quran activity, and submitted feedback in one place.
                </Typography>
                <Button component={RouterLink} to="/operations/users" className="mt-20" variant="outlined" fullWidth>
                  Open users and feedback
                </Button>
                <Button component={RouterLink} to="/operations/notification-devices" className="mt-12" variant="outlined" fullWidth>
                  Open notification devices
                </Button>
              </Paper>
            </Box>
          </Box>
        </Box>
      }
    />
  );
}

export default SiteOperationsPage;
