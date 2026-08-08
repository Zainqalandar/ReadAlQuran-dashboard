import { ThemeProvider } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import clsx from 'clsx';
import { memo } from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { selectToolbarTheme } from 'app/store/fuse/settingsSlice';
import Logo from '../../shared-components/Logo';
import NavbarToggleButton from '../../shared-components/NavbarToggleButton';
import {AnalyticsDateRangeButton} from '../../../main/analytics/AnalyticsDateRange';

const WEBSITE_URL = 'https://www.readalquran.online/';

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
              Read Al Quran Analytics
            </Typography>
            <Box
              aria-label="Open readalquran.online in a new tab"
              className="mt-2 flex w-fit items-center gap-4 text-11 leading-tight"
              component="a"
              href={WEBSITE_URL}
              rel="noopener noreferrer"
              target="_blank"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                transition: 'color .15s ease',
                '&:hover': { color: 'primary.light' },
                '&:focus-visible': {
                  borderRadius: '3px',
                  color: 'primary.light',
                  outline: '2px solid rgba(201, 162, 39, .55)',
                  outlineOffset: '3px',
                },
              }}
            >
              readalquran.online
              <OpenInNewRoundedIcon sx={{ fontSize: 11 }} />
            </Box>
          </div>
          <div className="flex flex-1" />
          <Button
            aria-label="Open analytics overview"
            className="mr-8 hidden sm:inline-flex"
            component={NavLink}
            to="/dashboard"
            startIcon={<DashboardRoundedIcon sx={{ fontSize: '17px !important' }} />}
            sx={{
              height: 40,
              minWidth: 106,
              px: 1.4,
              border: '1px solid rgba(255, 255, 255, .1)',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, .025)',
              color: 'text.secondary',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': {
                borderColor: 'rgba(201, 162, 39, .38)',
                backgroundColor: 'rgba(201, 162, 39, .07)',
                color: 'text.primary',
              },
              '&[aria-current="page"]': {
                borderColor: 'rgba(201, 162, 39, .48)',
                backgroundColor: 'rgba(201, 162, 39, .11)',
                color: 'primary.light',
              },
            }}
          >
            Overview
          </Button>
          <AnalyticsDateRangeButton />
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}

export default memo(ToolbarLayout);
