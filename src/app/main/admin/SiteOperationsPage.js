import { Alert, Button, Checkbox, FormControlLabel, LinearProgress, MenuItem, Paper, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  getAdminApiErrorMessage,
  useBroadcastNotificationMutation,
  useGetAdminUsersQuery,
} from './adminApi';

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Math.round(Number(value || 0)));
}

function formatDuration(seconds) {
  const safe = Math.max(0, Number(seconds || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);

  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function Metric({ label, value, icon }) {
  return (
    <Paper className="rounded-14 p-20" elevation={0} sx={{ backgroundColor: 'background.paper', border: '1px solid #27272a' }}>
      <Box className="flex items-center justify-between gap-16">
        <Box>
          <Typography className="text-11 font-bold uppercase tracking-wide" color="text.secondary">{label}</Typography>
          <Typography className="mt-10 text-26 font-extrabold">{value}</Typography>
        </Box>
        <FuseSvgIcon color="primary" size={22}>{icon}</FuseSvgIcon>
      </Box>
    </Paper>
  );
}

function SiteOperationsPage() {
  const { data, error, isFetching, isLoading, refetch } = useGetAdminUsersQuery();
  const [broadcastNotification, { error: broadcastError, isLoading: isSending }] = useBroadcastNotificationMutation();
  const [form, setForm] = useState({
    title: '',
    message: '',
    href: '/',
    type: 'system',
    priority: 'normal',
    push: true,
  });
  const [result, setResult] = useState('');

  const summary = data?.summary || { totalUsers: 0, totalSessionSeconds: 0, totalAudioSeconds: 0 };
  const feedbackCount = Array.isArray(data?.feedback) ? data.feedback.length : 0;
  const pageError = getAdminApiErrorMessage(error, 'Unable to load Al-Huda operations.');
  const sendError = getAdminApiErrorMessage(broadcastError, 'Unable to send the notification.');

  const updateForm = (field) => (event) => {
    const value = field === 'push' ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const sendBroadcast = async (event) => {
    event.preventDefault();
    setResult('');

    try {
      const response = await broadcastNotification({
        ...form,
        href: form.href.trim() || '/',
      }).unwrap();
      setResult(`Delivered in-app to ${formatNumber(response.inAppCreated)} readers.`);
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
                Al-Huda readers, feedback, and notification delivery.
              </Typography>
            </Box>
            <Button startIcon={<RefreshIcon />} variant="outlined" disabled={isFetching} onClick={refetch}>
              Refresh
            </Button>
          </Box>
        </div>
      }
      content={
        <Box className="w-full p-24 sm:p-40">
          <Box className="mx-auto flex w-full max-w-[1440px] flex-col gap-20">
            {isLoading ? <LinearProgress /> : null}
            {error ? <Alert severity="warning">{pageError}</Alert> : null}

            <Box className="grid grid-cols-1 gap-16 sm:grid-cols-2 xl:grid-cols-4">
              <Metric label="Registered readers" value={formatNumber(summary.totalUsers)} icon="heroicons-outline:users" />
              <Metric label="Feedback waiting" value={formatNumber(feedbackCount)} icon="heroicons-outline:chat-alt-2" />
              <Metric label="Reader time" value={formatDuration(summary.totalSessionSeconds)} icon="heroicons-outline:clock" />
              <Metric label="Audio time" value={formatDuration(summary.totalAudioSeconds)} icon="heroicons-outline:volume-up" />
            </Box>

            <Box className="grid grid-cols-1 gap-20 xl:grid-cols-[minmax(0,1fr)_360px]">
              <Paper className="rounded-14 p-20" elevation={0} sx={{ backgroundColor: 'background.paper', border: '1px solid #27272a' }}>
                <Box className="flex flex-wrap items-start justify-between gap-16">
                  <Box>
                    <Typography className="text-16 font-bold">Broadcast notification</Typography>
                    <Typography className="mt-6 text-12" color="text.secondary">
                      Send an in-app message to all registered readers, with optional push delivery.
                    </Typography>
                  </Box>
                </Box>

                <Box component="form" className="mt-20 grid grid-cols-1 gap-16" onSubmit={sendBroadcast}>
                  <TextField label="Title" value={form.title} onChange={updateForm('title')} inputProps={{ maxLength: 120 }} required fullWidth />
                  <TextField label="Message" value={form.message} onChange={updateForm('message')} inputProps={{ maxLength: 420 }} minRows={3} multiline required fullWidth />
                  <Box className="grid grid-cols-1 gap-16 sm:grid-cols-3">
                    <TextField label="Link" value={form.href} onChange={updateForm('href')} helperText="Starts with /" inputProps={{ maxLength: 240 }} />
                    <TextField select label="Type" value={form.type} onChange={updateForm('type')}>
                      {['system', 'quran', 'audio', 'prayer', 'bookmark', 'islamic'].map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                    </TextField>
                    <TextField select label="Priority" value={form.priority} onChange={updateForm('priority')}>
                      {['low', 'normal', 'high'].map((priority) => <MenuItem key={priority} value={priority}>{priority}</MenuItem>)}
                    </TextField>
                  </Box>
                  <Box className="flex flex-wrap items-center justify-between gap-12">
                    <FormControlLabel control={<Checkbox checked={form.push} onChange={updateForm('push')} />} label="Also send push notifications" />
                    <Button type="submit" variant="contained" startIcon={<SendIcon />} disabled={isSending}>
                      {isSending ? 'Sending...' : 'Send broadcast'}
                    </Button>
                  </Box>
                  {broadcastError ? <Alert severity="error">{sendError}</Alert> : null}
                  {result ? <Alert severity="success">{result}</Alert> : null}
                </Box>
              </Paper>

              <Paper className="rounded-14 p-20" elevation={0} sx={{ backgroundColor: 'background.paper', border: '1px solid #27272a' }}>
                <Typography className="text-16 font-bold">Reader records</Typography>
                <Typography className="mt-8 text-12 leading-relaxed" color="text.secondary">
                  Review registered readers, saved Quran activity, and submitted feedback in one place.
                </Typography>
                <Button component={RouterLink} to="/operations/users" className="mt-20" variant="outlined" fullWidth>
                  Open users and feedback
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
