import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { selectUser } from 'app/store/userSlice';
import JwtService from '../../auth/services/jwtService';

function UserMenu({ variant = 'toolbar', collapsed = false }) {
  const user = useSelector(selectUser);

  const [userMenu, setUserMenu] = useState(null);

  const userMenuClick = (event) => {
    setUserMenu(event.currentTarget);
  };

  const userMenuClose = () => {
    setUserMenu(null);
  };

  return (
    <>
      <Button
        className={
          variant === 'sidebar'
            ? collapsed
              ? 'min-h-48 w-full justify-center rounded-10 px-0 py-8 text-left normal-case'
              : 'min-h-48 w-full justify-start rounded-10 px-10 py-8 text-left normal-case'
            : 'min-h-40 min-w-40 px-0 py-0 md:py-6 md:pl-16'
        }
        onClick={userMenuClick}
        color="inherit"
        sx={
          variant === 'sidebar'
            ? {
                border: '1px solid #27272a',
                backgroundColor: 'rgba(255, 255, 255, .025)',
                '&:hover': { backgroundColor: 'rgba(201, 162, 39, .09)' },
              }
            : undefined
        }
      >
        {variant === 'toolbar' && (
          <div className="mx-4 hidden flex-col items-end md:flex">
            <Typography component="span" className="flex font-semibold">
              {user.name}
            </Typography>
          </div>
        )}

        {user.photo ? (
          <Avatar
            className={
              variant === 'sidebar'
                ? 'h-40 w-40 shrink-0 border-2 border-solid border-[#c9a227]/70'
                : 'h-40 w-40 border-2 border-solid border-[#c9a227]/70 md:mx-4'
            }
            alt={user.name}
            src={user.photo}
          />
        ) : (
          <Avatar className={variant === 'sidebar' ? 'h-40 w-40 shrink-0' : 'h-40 w-40 md:mx-4'}>
            {user.name.charAt(0)}
          </Avatar>
        )}

        {variant === 'sidebar' && !collapsed && (
          <div className="ml-10 min-w-0 flex-1 text-left">
            <Typography component="span" className="block truncate text-12 font-semibold">
              {user.name}
            </Typography>
            <Typography component="span" className="mt-2 block truncate text-10" color="text.secondary">
              Dashboard administrator
            </Typography>
          </div>
        )}

        {variant === 'sidebar' && !collapsed && (
          <FuseSvgIcon size={16} color="action">
            heroicons-outline:dots-vertical
          </FuseSvgIcon>
        )}
      </Button>

      <Popover
        open={Boolean(userMenu)}
        anchorEl={userMenu}
        onClose={userMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        classes={{
          paper: 'py-8',
        }}
      >
        <MenuItem
          onClick={() => {
            userMenuClose();
            JwtService.logout();
          }}
        >
          <ListItemIcon className="min-w-40">
            <FuseSvgIcon>heroicons-outline:logout</FuseSvgIcon>
          </ListItemIcon>
          <ListItemText primary="Sign out" />
        </MenuItem>
      </Popover>
    </>
  );
}

export default UserMenu;
