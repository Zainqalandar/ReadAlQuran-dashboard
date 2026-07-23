import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Logo from './Logo';
import Navigation from './Navigation';

function AnalyticsSidebarContent() {
  return (
    <div className="flex min-h-full flex-col">
      <Box className="px-20 pb-8 pt-24">
        <Logo />

        <Box
          className="mt-24 rounded-12 px-14 py-12"
          sx={{
            background:
              'linear-gradient(135deg, rgba(201, 162, 39, .15), rgba(31, 88, 67, .16))',
            border: '1px solid rgba(201, 162, 39, .22)',
          }}
        >
          <Box className="flex items-start gap-10">
            <Box
              aria-hidden="true"
              className="mt-2 flex h-28 w-28 shrink-0 items-center justify-center rounded-8"
              sx={{
                backgroundColor: 'rgba(201, 162, 39, .17)',
                color: 'primary.light',
              }}
            >
              <FuseSvgIcon size={16}>heroicons-outline:globe-alt</FuseSvgIcon>
            </Box>
            <Box className="min-w-0">
              <Typography className="truncate text-12 font-semibold">
                readalquran.online
              </Typography>
              <Box className="mt-6 flex items-center gap-6">
                <Box
                  aria-label="Connection pending"
                  className="h-7 w-7 rounded-full"
                  sx={{
                    backgroundColor: 'primary.light',
                    boxShadow: '0 0 0 3px rgba(201, 162, 39, .12)',
                  }}
                />
                <Typography
                  className="text-10 font-medium"
                  color="text.secondary"
                >
                  Analytics workspace
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Navigation className="pb-16" layout="vertical" />

      <Box className="mt-auto px-20 pb-20 pt-12">
        <Box
          className="rounded-12 px-14 py-12"
          sx={{
            backgroundColor: 'rgba(255, 255, 255, .025)',
            border: '1px solid #27272a',
          }}
        >
          <Box className="flex items-center gap-8">
            <FuseSvgIcon size={16} sx={{ color: '#4ade80' }}>
              heroicons-outline:shield-check
            </FuseSvgIcon>
            <Typography className="text-11 font-semibold">
              Privacy-first workspace
            </Typography>
          </Box>
          <Typography
            className="mt-6 text-10 leading-relaxed"
            color="text.secondary"
          >
            Connect only the sources you trust. No visitor figures are shown
            until a source is added.
          </Typography>
        </Box>
      </Box>
    </div>
  );
}

export default AnalyticsSidebarContent;
