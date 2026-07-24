import {
  Alert,
  Button,
  IconButton,
  LinearProgress,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import RefreshIcon from '@mui/icons-material/Refresh';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  formatAnalyticsDateRange,
  useAnalyticsDateRange,
} from '../analytics/AnalyticsDateRange';
import { alhudaAdminUrl, analyticsApiBase } from '../analytics/analyticsApiConfig';

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

function formatSessionSeconds(value) {
  const seconds = Number(value || 0);

  if (seconds < 60) {
    return `${formatNumber(seconds)} sec`;
  }

  return `${formatNumber(seconds / 60)} min`;
}

function MetricCard({ icon, label, value, helper }) {
  return (
    <Paper
      className="rounded-14 p-20"
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        border: '1px solid #27272a',
      }}
    >
      <Box className="flex items-start justify-between gap-16">
        <Box>
          <Typography className="text-11 font-bold uppercase tracking-wide" color="text.secondary">
            {label}
          </Typography>
          <Typography className="mt-12 text-28 font-extrabold leading-none">
            {value}
          </Typography>
        </Box>
        <Box
          aria-hidden="true"
          className="flex h-38 w-38 shrink-0 items-center justify-center rounded-8"
          sx={{
            backgroundColor: 'rgba(201, 162, 39, .13)',
            color: 'primary.light',
          }}
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

function ListPanel({ title, items, renderItem }) {
  return (
    <Paper
      className="rounded-14 p-20"
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        border: '1px solid #27272a',
      }}
    >
      <Typography className="text-15 font-bold">{title}</Typography>
      <Box className="mt-16 flex flex-col divide-y">
        {items.length ? (
          items.map(renderItem)
        ) : (
          <Typography className="py-14 text-12" color="text.secondary">
            No data yet.
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

function DashboardPage() {
  const { dateRange } = useAnalyticsDateRange();
  const [analytics, setAnalytics] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const isLoading = status === 'loading' || status === 'refreshing';

  const loadAnalytics = useCallback(async (mode = 'loading') => {
    setStatus(mode);
    setError('');

    try {
      const query = new URLSearchParams(dateRange).toString();
      const response = await fetch(`${analyticsApiBase}/api/admin/analytics?${query}`, {
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message || 'Unable to load analytics.');
      }

      setAnalytics(payload);
      setStatus('ready');
    } catch (requestError) {
      setError(requestError.message || 'Unable to load analytics.');
      setStatus('error');
    }
  }, [dateRange]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const metricCards = useMemo(() => {
    const monthly = analytics?.monthly || {};
    const realtime = analytics?.realtime || {};

    return [
      {
        label: 'Visitors in selected range',
        value: formatNumber(monthly.activeUsers),
        helper: `${formatNumber(monthly.sessions)} sessions in this date range`,
        icon: 'heroicons-outline:users',
      },
      {
        label: 'Sessions in selected range',
        value: formatNumber(monthly.sessions),
        helper: `${formatNumber(monthly.activeUsers)} active users in this date range`,
        icon: 'heroicons-outline:clock',
      },
      {
        label: 'Views in selected range',
        value: formatNumber(monthly.pageViews),
        helper: `${formatNumber(monthly.totalUsers)} total users counted by GA4`,
        icon: 'heroicons-outline:document-chart-bar',
      },
      {
        label: 'Engaged time in selected range',
        value: formatMinutes(monthly.engagementMinutes),
        helper: `${formatSessionSeconds(monthly.averageSessionSeconds)} average session duration`,
        icon: 'heroicons-outline:chart-bar',
      },
      {
        label: 'Active last 30 min',
        value: formatNumber(realtime.activeUsers),
        helper: 'GA4 realtime active users',
        icon: 'heroicons-outline:bolt',
      },
    ];
  }, [analytics]);

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
                  Analytics overview
                </Typography>
                <Box
                  className="rounded-full px-10 py-4"
                  sx={{
                    backgroundColor: 'rgba(201, 162, 39, .12)',
                    border: '1px solid rgba(201, 162, 39, .22)',
                  }}
                >
                  <Typography className="text-10 font-bold uppercase tracking-wide" color="primary.light">
                    GA4 connected
                  </Typography>
                </Box>
              </Box>
              <Typography className="mt-8 text-14" color="text.secondary">
                Website intelligence for {formatAnalyticsDateRange(dateRange)}.
              </Typography>
            </Box>
            <Box className="flex flex-wrap items-center gap-10">
              {analytics?.generatedAt ? (
                <Typography className="text-11" color="text.secondary">
                  Updated {new Date(analytics.generatedAt).toLocaleString()}
                </Typography>
              ) : null}
              <Tooltip title={isLoading ? 'Refreshing analytics' : 'Refresh analytics data'}>
                <span>
                  <IconButton
                    aria-label="Refresh analytics data"
                    className="h-36 w-36 border border-solid"
                    disabled={isLoading}
                    onClick={() => loadAnalytics('refreshing')}
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
                    <RefreshIcon
                      className={isLoading ? 'animate-spin' : ''}
                      sx={{ fontSize: 18 }}
                    />
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
                <Typography className="text-14 font-semibold">
                  Loading Google Analytics data
                </Typography>
                <LinearProgress className="mt-16" color="primary" />
              </Paper>
            ) : null}

            {status === 'error' ? (
              <Alert
                severity="warning"
                action={
                  <Button
                    color="inherit"
                    href={alhudaAdminUrl}
                    size="small"
                    target="_blank"
                  >
                    Open admin
                  </Button>
                }
                sx={{
                  backgroundColor: 'rgba(201, 162, 39, .11)',
                  border: '1px solid rgba(201, 162, 39, .24)',
                  color: 'text.primary',
                }}
              >
                {error}. Make sure Al-Huda is running, you are signed in as admin, and GA4 credentials are available.
              </Alert>
            ) : null}

            <Box className="grid grid-cols-1 gap-16 sm:grid-cols-2 xl:grid-cols-5">
              {metricCards.map((card) => (
                <MetricCard key={card.label} {...card} />
              ))}
            </Box>

            <Paper
              className="rounded-14 p-20"
              elevation={0}
              sx={{
                backgroundColor: 'background.paper',
                border: '1px solid #27272a',
              }}
            >
              <Typography className="text-15 font-bold">Top pages</Typography>
              <Box className="mt-16 flex flex-col divide-y">
                {(analytics?.topPages || []).length ? (
                  analytics.topPages.map((page) => (
                    <Box
                      key={`${page.path}-${page.title}`}
                      className="grid grid-cols-1 gap-8 py-14 md:grid-cols-[1fr_110px_110px_140px]"
                    >
                      <Box className="min-w-0">
                        <Typography className="truncate text-13 font-semibold">
                          {page.title || page.path}
                        </Typography>
                        <Typography className="truncate text-11" color="text.secondary">
                          {page.path}
                        </Typography>
                      </Box>
                      <Typography className="text-12" color="text.secondary">
                        {formatNumber(page.pageViews)} views
                      </Typography>
                      <Typography className="text-12" color="text.secondary">
                        {formatNumber(page.activeUsers)} users
                      </Typography>
                      <Typography className="text-12" color="text.secondary">
                        {formatMinutes(page.engagementMinutes)}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography className="py-14 text-12" color="text.secondary">
                    No page data yet.
                  </Typography>
                )}
              </Box>
            </Paper>

            <Box className="grid grid-cols-1 gap-16 lg:grid-cols-3">
              <ListPanel
                title="Traffic sources"
                items={analytics?.trafficSources || []}
                renderItem={(item) => (
                  <Box key={item.channel} className="flex items-center justify-between gap-16 py-12">
                    <Typography className="text-13 font-semibold">{item.channel}</Typography>
                    <Typography className="text-12" color="text.secondary">
                      {formatNumber(item.sessions)} sessions
                    </Typography>
                  </Box>
                )}
              />
              <ListPanel
                title="Countries"
                items={analytics?.countries || []}
                renderItem={(item) => (
                  <Box key={item.country} className="flex items-center justify-between gap-16 py-12">
                    <Typography className="text-13 font-semibold">{item.country}</Typography>
                    <Typography className="text-12" color="text.secondary">
                      {formatNumber(item.activeUsers)} users
                    </Typography>
                  </Box>
                )}
              />
              <ListPanel
                title="Devices"
                items={analytics?.devices || []}
                renderItem={(item) => (
                  <Box key={item.device} className="flex items-center justify-between gap-16 py-12">
                    <Typography className="capitalize text-13 font-semibold">{item.device}</Typography>
                    <Typography className="text-12" color="text.secondary">
                      {formatNumber(item.pageViews)} views
                    </Typography>
                  </Box>
                )}
              />
            </Box>
          </Box>
        </Box>
      }
    />
  );
}

export default DashboardPage;
