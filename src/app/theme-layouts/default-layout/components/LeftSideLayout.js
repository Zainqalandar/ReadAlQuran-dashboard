import { memo } from 'react';
import FuseScrollbars from '@fuse/core/FuseScrollbars/FuseScrollbars';
import AnalyticsSidebarContent from 'app/theme-layouts/shared-components/AnalyticsSidebarContent';
import { styled } from '@mui/material/styles';
import Hidden from '@mui/material/Hidden';

const StyledAside = styled('aside')(({ theme }) => ({
  width: 286,
  minWidth: 286,
  height: '100dvh',
  position: 'sticky',
  top: 0,
  backgroundColor: '#0f0f12',
  borderRight: `1px solid ${theme.palette.divider}`,
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
  return (
    <Hidden mdDown>
      <StyledAside aria-label="Analytics navigation">
        <StyledContent
          className="flex min-h-0 flex-1 flex-col"
          option={{ suppressScrollX: true, wheelPropagation: false }}
        >
          <AnalyticsSidebarContent />
        </StyledContent>
      </StyledAside>
    </Hidden>
  );
}

export default memo(LeftSideLayout);
