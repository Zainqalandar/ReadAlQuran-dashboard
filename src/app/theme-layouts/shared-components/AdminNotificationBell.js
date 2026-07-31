import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useGetAdminActivityQuery } from '../../main/admin/adminApi';
import { formatRelativeTime } from '../../main/admin/relativeTime';

const READ_AT_KEY = 'readalquran:dashboard-notifications-read-at';

function getStoredReadAt() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(READ_AT_KEY) || '';
}

function getActivityIcon(type) {
  return type === 'user-login'
    ? 'heroicons-outline:user-add'
    : 'heroicons-outline:bell';
}

function AdminNotificationBell({ collapsed = false }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [readAt, setReadAt] = useState(getStoredReadAt);
  const { data, error, isLoading, isFetching, refetch } =
    useGetAdminActivityQuery(undefined, {
      pollingInterval: 30000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    });
  const notifications = useMemo(
    () => (Array.isArray(data?.notifications) ? data.notifications : []),
    [data?.notifications]
  );
  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) => !readAt || notification.createdAt > readAt
      ).length,
    [notifications, readAt]
  );

  const markReadThrough = (createdAt) => {
    const nextReadAt =
      createdAt && createdAt > new Date().toISOString()
        ? createdAt
        : new Date().toISOString();
    setReadAt(nextReadAt);
    window.localStorage.setItem(READ_AT_KEY, nextReadAt);
  };

  const markAllRead = () => {
    const newestCreatedAt = notifications[0]?.createdAt;
    markReadThrough(newestCreatedAt);
  };

  const trigger = (
    <Button
      aria-label={`Admin notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      aria-haspopup="true"
      aria-expanded={Boolean(anchorEl)}
      className={
        collapsed
          ? 'min-h-48 w-full min-w-0 justify-center rounded-10 px-0 py-8 normal-case'
          : 'min-h-48 w-full justify-start rounded-10 px-12 py-8 text-left normal-case'
      }
      color="inherit"
      onClick={(event) => setAnchorEl(event.currentTarget)}
      sx={{
        border: '1px solid #27272a',
        backgroundColor: 'rgba(255, 255, 255, .025)',
        '&:hover': { backgroundColor: 'rgba(201, 162, 39, .09)' },
      }}
    >
      <Badge
        badgeContent={unreadCount}
        color="error"
        max={99}
        overlap="circular"
        sx={{
          '& .MuiBadge-badge': {
            minWidth: 17,
            height: 17,
            padding: '0 4px',
            fontSize: 9,
            fontWeight: 700,
          },
        }}
      >
        <Box
          className="flex h-32 w-32 shrink-0 items-center justify-center rounded-8"
          sx={{ color: unreadCount > 0 ? 'primary.light' : 'text.secondary' }}
        >
          <FuseSvgIcon size={20}>heroicons-outline:bell</FuseSvgIcon>
        </Box>
      </Badge>

      {!collapsed && (
        <Box className="ml-10 min-w-0 flex-1 text-left">
          <Typography className="block truncate text-12 font-semibold">
            Notifications
          </Typography>
          <Typography className="mt-2 block truncate text-10" color="text.secondary">
            {unreadCount > 0
              ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}`
              : 'Reader activity'}
          </Typography>
        </Box>
      )}
    </Button>
  );

  return (
    <>
      {collapsed ? (
        <Tooltip title="Notifications" placement="right">
          {trigger}
        </Tooltip>
      ) : (
        trigger
      )}

      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        marginThreshold={12}
        onClose={() => setAnchorEl(null)}
        open={Boolean(anchorEl)}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{
          sx: {
            width: { xs: 'calc(100vw - 24px)', sm: 390 },
            maxWidth: 390,
            overflow: 'hidden',
            border: '1px solid #2d2d32',
            borderRadius: 2,
            backgroundColor: '#151519',
            backgroundImage: 'none',
            boxShadow: '0 18px 48px rgba(0, 0, 0, .42)',
          },
        }}
      >
        <Box
          className="flex min-h-64 items-center justify-between gap-12 border-b px-16 py-12"
          sx={{ borderColor: '#2d2d32' }}
        >
          <Box className="min-w-0">
            <Typography className="text-14 font-bold">Admin notifications</Typography>
            <Typography className="mt-2 text-10" color="text.secondary">
              Logins and website notification activity
            </Typography>
          </Box>
          <Box className="flex shrink-0 items-center gap-4">
            <Tooltip title={isFetching ? 'Refreshing' : 'Refresh'}>
              <span>
                <IconButton
                  aria-label="Refresh admin notifications"
                  disabled={isFetching}
                  onClick={() => refetch()}
                  size="small"
                >
                  {isFetching ? (
                    <CircularProgress color="inherit" size={16} />
                  ) : (
                    <FuseSvgIcon size={17}>heroicons-outline:refresh</FuseSvgIcon>
                  )}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Mark all as read">
              <span>
                <IconButton
                  aria-label="Mark all admin notifications as read"
                  disabled={unreadCount === 0}
                  onClick={markAllRead}
                  size="small"
                >
                  <FuseSvgIcon size={17}>heroicons-outline:check</FuseSvgIcon>
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ maxHeight: 430, overflowY: 'auto' }}>
          {isLoading ? (
            <Box className="flex min-h-160 items-center justify-center">
              <CircularProgress color="inherit" size={24} />
            </Box>
          ) : error ? (
            <Box className="px-20 py-32 text-center">
              <Typography className="text-12" color="error.light">
                Unable to load notifications.
              </Typography>
            </Box>
          ) : notifications.length === 0 ? (
            <Box className="px-20 py-40 text-center">
              <FuseSvgIcon className="mx-auto" color="action" size={24}>
                heroicons-outline:bell
              </FuseSvgIcon>
              <Typography className="mt-10 text-12" color="text.secondary">
                No reader activity yet.
              </Typography>
            </Box>
          ) : (
            notifications.map((notification) => {
              const isUnread = !readAt || notification.createdAt > readAt;

              return (
                <ListItemButton
                  key={notification.id}
                  component={RouterLink}
                  onClick={() => {
                    markReadThrough(notification.createdAt);
                    setAnchorEl(null);
                  }}
                  sx={{
                    alignItems: 'flex-start',
                    gap: 1.5,
                    minHeight: 76,
                    px: 2,
                    py: 1.5,
                    borderBottom: '1px solid #25252a',
                    backgroundColor: isUnread
                      ? 'rgba(201, 162, 39, .055)'
                      : 'transparent',
                    '&:last-child': { borderBottom: 0 },
                  }}
                  to={notification.href}
                >
                  <Box
                    className="mt-2 flex h-34 w-34 shrink-0 items-center justify-center rounded-full"
                    sx={{
                      color:
                        notification.ownerType === 'guest'
                          ? 'text.secondary'
                          : 'primary.light',
                      backgroundColor:
                        notification.ownerType === 'guest'
                          ? 'rgba(255, 255, 255, .06)'
                          : 'rgba(201, 162, 39, .11)',
                    }}
                  >
                    <FuseSvgIcon size={17}>
                      {getActivityIcon(notification.type)}
                    </FuseSvgIcon>
                  </Box>
                  <Box className="min-w-0 flex-1">
                    <Box className="flex items-start gap-8">
                      <Typography className="min-w-0 flex-1 text-12 font-semibold">
                        {notification.title}
                      </Typography>
                      {isUnread && (
                        <Box
                          aria-label="Unread"
                          className="mt-5 h-7 w-7 shrink-0 rounded-full"
                          sx={{ backgroundColor: 'primary.light' }}
                        />
                      )}
                    </Box>
                    <Typography
                      className="mt-3 line-clamp-2 text-11 leading-relaxed"
                      color="text.secondary"
                    >
                      {notification.message}
                    </Typography>
                    <Typography className="mt-5 text-9" color="text.disabled">
                      {formatRelativeTime(notification.createdAt)}
                    </Typography>
                  </Box>
                </ListItemButton>
              );
            })
          )}
        </Box>
      </Popover>
    </>
  );
}

export default AdminNotificationBell;
