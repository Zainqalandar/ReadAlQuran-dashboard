import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

function Logo() {
  return (
    <Box
      className="flex items-center gap-12"
      aria-label="Read Al Quran Analytics"
    >
      <Box
        aria-hidden="true"
        className="rounded-10 flex h-40 w-40 items-center justify-center"
        sx={{
          background: 'linear-gradient(145deg, #dbb84a, #a67c00)',
          boxShadow: '0 10px 24px -14px rgba(201, 162, 39, .75)',
          color: '#09090b',
        }}
      >
        <FuseSvgIcon size={22}>heroicons-outline:book-open</FuseSvgIcon>
      </Box>
      <Box className="min-w-0">
        <Typography className="truncate text-15 font-bold leading-tight">
          Read Al Quran
        </Typography>
        <Typography
          className="mt-2 text-10 font-semibold uppercase tracking-widest"
          color="text.secondary"
        >
          Analytics
        </Typography>
      </Box>
    </Box>
  );
}

export default Logo;
