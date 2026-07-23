import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { memo } from 'react';
import NavbarToggleButton from '../../shared-components/NavbarToggleButton';
import AnalyticsSidebarContent from '../../shared-components/AnalyticsSidebarContent';
import UserMenu from '../../shared-components/UserMenu';

const Root = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,

  '& ::-webkit-scrollbar-thumb': {
    boxShadow: `inset 0 0 0 20px ${
      theme.palette.mode === 'light'
        ? 'rgba(0, 0, 0, 0.24)'
        : 'rgba(255, 255, 255, 0.24)'
    }`,
  },
  '& ::-webkit-scrollbar-thumb:active': {
    boxShadow: `inset 0 0 0 20px ${
      theme.palette.mode === 'light'
        ? 'rgba(0, 0, 0, 0.37)'
        : 'rgba(255, 255, 255, 0.37)'
    }`,
  },
}));

const StyledContent = styled(FuseScrollbars)(({ theme }) => ({
  overscrollBehavior: 'contain',
  overflowX: 'hidden',
  overflowY: 'auto',
  WebkitOverflowScrolling: 'touch',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '100% 40px, 100% 10px',
  backgroundAttachment: 'local, scroll',
}));

function NavbarMobileLayout2(props) {
  return (
    <Root
      className={clsx('flex h-full flex-col overflow-hidden', props.className)}
    >
      <div className="flex h-48 shrink-0 flex-row items-center px-20 md:h-72">
        <div className="mx-4 flex flex-1">
          <Typography className="text-12 font-semibold" color="text.secondary">
            Workspace navigation
          </Typography>
        </div>

        <NavbarToggleButton className="h-40 w-40 p-0" />
      </div>

      <StyledContent
        className="flex min-h-0 flex-1 flex-col"
        option={{ suppressScrollX: true, wheelPropagation: false }}
      >
        <AnalyticsSidebarContent />
      </StyledContent>

      <div className="shrink-0 px-20 pb-20 pt-12">
        <UserMenu variant="sidebar" />
      </div>
    </Root>
  );
}

export default memo(NavbarMobileLayout2);
