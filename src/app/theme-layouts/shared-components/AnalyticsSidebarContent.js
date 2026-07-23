import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Logo from './Logo';
import Navigation from './Navigation';

function AnalyticsSidebarContent({ collapsed = false, onToggleCollapse }) {
  return (
    <div className="flex min-h-full flex-col">
      <Box className={collapsed ? 'px-10 pb-8 pt-16' : 'px-20 pb-8 pt-24'}>
        <Box className={collapsed ? 'flex flex-col items-center gap-8' : 'flex items-center justify-between gap-8'}>
          <Logo collapsed={collapsed} />
          {onToggleCollapse && (
            <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
              <IconButton
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                onClick={onToggleCollapse}
                size="small"
                sx={{
                  width: 44,
                  height: 44,
                  color: 'text.secondary',
                  '&:hover': { backgroundColor: 'rgba(201, 162, 39, .1)', color: 'primary.light' },
                }}
              >
                <FuseSvgIcon size={18}>
                  {collapsed
                    ? 'heroicons-outline:chevron-double-right'
                    : 'heroicons-outline:chevron-double-left'}
                </FuseSvgIcon>
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Box
          className={collapsed ? 'mx-auto mt-20 flex h-44 w-44 items-center justify-center rounded-12' : 'mt-24 rounded-12 px-14 py-12'}
          sx={{
            background:
              'linear-gradient(135deg, rgba(201, 162, 39, .15), rgba(31, 88, 67, .16))',
            border: '1px solid rgba(201, 162, 39, .22)',
          }}
        >
          <Box className={collapsed ? 'flex items-center justify-center' : 'flex items-start gap-10'}>
            <Box
              aria-hidden="true"
              className="mt-2 flex h-28 w-28 shrink-0 items-center justify-center rounded-8"
              sx={{
                backgroundColor: 'rgba(201, 162, 39, .17)',
                color: 'primary.light',
              }}
            >
              <FuseSvgIcon size={16}>heroicons-outline:globe-alt</FuseSvgIcon>
            </Box>
            {!collapsed && <Box className="min-w-0">
              <Typography className="truncate text-12 font-semibold">
                readalquran.online
              </Typography>
              <Box className="mt-6 flex items-center gap-6">
                <Box
                  aria-label="Connection pending"
                  className="h-7 w-7 rounded-full"
                  sx={{
                    backgroundColor: 'primary.light',
                    boxShadow: '0 0 0 3px rgba(201, 162, 39, .12)',
                  }}
                />
                <Typography
                  className="text-10 font-medium"
                  color="text.secondary"
                >
                  Analytics workspace
                </Typography>
              </Box>
            </Box>}
          </Box>
        </Box>
      </Box>

      <Navigation className={collapsed ? 'analytics-navigation--collapsed pb-16' : 'pb-16'} layout="vertical" />
    </div>
  );
}

export default AnalyticsSidebarContent;
