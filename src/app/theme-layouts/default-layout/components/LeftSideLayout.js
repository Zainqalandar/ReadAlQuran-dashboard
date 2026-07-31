import { memo, useState } from 'react';
import FuseScrollbars from '@fuse/core/FuseScrollbars/FuseScrollbars';
import AnalyticsSidebarContent from 'app/theme-layouts/shared-components/AnalyticsSidebarContent';
import AdminNotificationBell from 'app/theme-layouts/shared-components/AdminNotificationBell';
import UserMenu from 'app/theme-layouts/shared-components/UserMenu';
import { styled } from '@mui/material/styles';
import Hidden from '@mui/material/Hidden';
import clsx from 'clsx';

const StyledAside = styled('aside')(({ theme }) => ({
  width: 286,
  minWidth: 286,
  height: '100dvh',
  position: 'sticky',
  top: 0,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#0f0f12',
  borderRight: `1px solid ${theme.palette.divider}`,
  transition: theme.transitions.create(['width', 'min-width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.standard,
  }),
  '&.analytics-sidebar--collapsed': {
    '& .analytics-navigation--collapsed .fuse-list-subheader': {
      display: 'none',
    },
    '& .analytics-navigation--collapsed .fuse-list-item': {
      width: 'calc(100% - 20px)',
      minHeight: 44,
      margin: '8px 10px 0',
      padding: '10px 0',
      justifyContent: 'center',
    },
    '& .analytics-navigation--collapsed .fuse-list-item-icon': {
      marginRight: '0 !important',
    },
    '& .analytics-navigation--collapsed .fuse-list-item-text, & .analytics-navigation--collapsed .item-badge': {
      display: 'none',
    },
    '& .analytics-navigation--collapsed .fuse-list-item > .fuse-list-item-icon': {
      width: 24,
      height: 24,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
}));

const StyledContent = styled(FuseScrollbars)(() => ({
  overscrollBehavior: 'contain',
  overflowX: 'hidden',
  overflowY: 'auto',
  WebkitOverflowScrolling: 'touch',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '100% 40px, 100% 10px',
  backgroundAttachment: 'local, scroll',
  height: '100%', // Ensure it takes full height
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(201, 162, 39, .35) transparent',
  '&::-webkit-scrollbar': {
    width: 6,
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    borderRadius: 999,
    backgroundColor: 'rgba(201, 162, 39, .35)',
  },
  '& .ps__rail-y': {
    right: 2,
    width: 6,
    opacity: 1,
    backgroundColor: 'transparent !important',
  },
  '&:hover > .ps__rail-y, &.ps--focus > .ps__rail-y, &.ps--scrolling-y > .ps__rail-y': {
    opacity: 1,
    backgroundColor: 'transparent !important',
  },
  '& .ps__thumb-y': {
    right: 1,
    width: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(201, 162, 39, .26)',
  },
  '&:hover > .ps__rail-y > .ps__thumb-y, &.ps--focus > .ps__rail-y > .ps__thumb-y, &.ps--scrolling-y > .ps__rail-y > .ps__thumb-y, & .ps__rail-y:hover > .ps__thumb-y': {
    right: 1,
    width: 4,
    backgroundColor: 'rgba(201, 162, 39, .42)',
  },
}));

function LeftSideLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Hidden mdDown>
      <StyledAside
        aria-label="Analytics navigation"
        className={clsx(collapsed && 'analytics-sidebar--collapsed')}
        sx={{ width: collapsed ? 80 : 286, minWidth: collapsed ? 80 : 286 }}
      >
        <StyledContent
          className="flex min-h-0 flex-1 flex-col"
          option={{ suppressScrollX: true, wheelPropagation: false }}
        >
          <AnalyticsSidebarContent
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((value) => !value)}
          />
        </StyledContent>
        <div
          className={
            collapsed
              ? 'shrink-0 space-y-8 px-10 pb-16 pt-10'
              : 'shrink-0 space-y-8 px-20 pb-20 pt-12'
          }
        >
          <AdminNotificationBell collapsed={collapsed} />
          <UserMenu variant="sidebar" collapsed={collapsed} />
        </div>
      </StyledAside>
    </Hidden>
  );
}

export default memo(LeftSideLayout);
