import { ThemeProvider } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { memo } from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { selectToolbarTheme } from 'app/store/fuse/settingsSlice';
import Logo from '../../shared-components/Logo';
import UserMenu from '../../shared-components/UserMenu';
import NavbarToggleButton from '../../shared-components/NavbarToggleButton';

function ToolbarLayout(props) {
  const toolbarTheme = useSelector(selectToolbarTheme);

  return (
    <ThemeProvider theme={toolbarTheme}>
      <AppBar
        id="fuse-toolbar"
        className={clsx(
          'relative z-20 flex border-b-1 shadow-0',
          props.className
        )}
        color="default"
        sx={{ backgroundColor: toolbarTheme.palette.background.paper }}
      >
        <Toolbar className="min-h-64 px-16 sm:px-24">
          <NavbarToggleButton className="mr-12 flex h-40 w-40 p-0 md:hidden" />
          <div className="flex md:hidden">
            <Logo />
          </div>
          <div className="hidden md:flex md:flex-col">
            <Typography className="text-14 font-bold leading-tight">
              Website intelligence
            </Typography>
            <Typography
              className="mt-2 text-11 leading-tight"
              color="text.secondary"
            >
              readalquran.online
            </Typography>
          </div>
          <div className="flex flex-1" />
          <Button
            className="mr-8 hidden min-h-36 rounded-8 px-12 text-11 sm:inline-flex"
            component={NavLink}
            to="/dashboard"
            color="inherit"
          >
            Overview
          </Button>
          <UserMenu />
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}

export default memo(ToolbarLayout);
