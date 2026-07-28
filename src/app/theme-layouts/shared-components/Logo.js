import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const BRAND_LOGO = '/logos/logo1.png';

function Logo({ collapsed = false }) {
  return (
    <Box
      className="flex items-center gap-12"
      aria-label="ReadAlQuran Analytics"
    >
      <Box
        component="img"
        alt=""
        aria-hidden="true"
        className="h-40 w-40 shrink-0 rounded-10 object-cover"
        src={BRAND_LOGO}
        sx={{
          boxShadow: '0 10px 24px -14px rgba(201, 162, 39, .75)',
          border: '1px solid rgba(201, 162, 39, .34)',
        }}
      />
      {!collapsed && (
        <Box className="min-w-0">
          <Typography className="truncate text-15 font-bold leading-tight">
            ReadAlQuran
          </Typography>
          <Typography
            className="mt-2 text-10 font-semibold uppercase tracking-widest"
            color="text.secondary"
          >
            Analytics
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default Logo;
