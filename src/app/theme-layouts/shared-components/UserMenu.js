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

function UserMenu(props) {
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
        className="min-h-40 min-w-40 px-0 py-0 md:py-6 md:pl-16"
        onClick={userMenuClick}
        color="inherit"
      >
        <div className="mx-4 hidden flex-col items-end md:flex">
          <Typography component="span" className="flex font-semibold">
            {user.name}
          </Typography>
        </div>

        {user.photo ? (
          <Avatar className="md:mx-4" alt="user photo" src={user.photo} />
        ) : (
          <Avatar className="md:mx-4">{user.name}</Avatar>
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
