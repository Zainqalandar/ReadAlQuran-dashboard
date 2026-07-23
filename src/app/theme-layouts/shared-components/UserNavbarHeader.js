import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { useSelector } from 'react-redux';
import { selectUser } from 'app/store/userSlice';

const Root = styled('div')(({ theme }) => ({
  '& .username, & .email': {
    transition: theme.transitions.create('opacity', {
      duration: theme.transitions.duration.shortest,
      easing: theme.transitions.easing.easeInOut,
    }),
  },

  '& .avatar': {
    background: theme.palette.background.default,
    transition: theme.transitions.create('all', {
      duration: theme.transitions.duration.shortest,
      easing: theme.transitions.easing.easeInOut,
    }),
    bottom: 0,
    '& > img': {
      borderRadius: '50%',
    },
  },
}));

function UserNavbarHeader(props) {
  const user = useSelector(selectUser);
  return (
    <Root className="user relative flex flex-col items-center justify-center p-16 pb-14 shadow-0">
      <div className="mb-24 flex items-center justify-center">
        <Avatar
          sx={{
            backgroundColor: 'background.paper',
            color: 'text.secondary',
          }}
          className="avatar h-96 w-96 text-32 font-bold"
          src={user.photo}
          alt={user.name}
        >
          {user.name.charAt(0)}
        </Avatar>
      </div>
      <Typography className="username whitespace-nowrap text-14 font-medium">
        {user.name}
      </Typography>
      <Typography className="email whitespace-nowrap text-13 font-medium" color="text.secondary">
        {user.email}
      </Typography>
    </Root>
  );
}

export default UserNavbarHeader;
