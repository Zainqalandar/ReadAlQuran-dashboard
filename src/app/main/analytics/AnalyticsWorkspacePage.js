import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

function AnalyticsWorkspacePage({ title, description, icon }) {
  return (
    <FusePageSimple
      header={
        <div
          className="flex w-full flex-col justify-center border-b px-24 py-24 sm:px-40"
          style={{ borderColor: '#27272a' }}
        >
          <Typography className="text-3xl font-extrabold leading-tight">
            {title}
          </Typography>
          <Typography className="mt-8 text-14" color="text.secondary">
            {description}
          </Typography>
        </div>
      }
      content={
        <Box className="w-full p-24 sm:p-40">
          <Paper
            className="mx-auto flex w-full max-w-[920px] flex-col items-center rounded-16 px-24 py-56 text-center sm:px-40"
            elevation={0}
            sx={{
              backgroundColor: 'background.paper',
              border: '1px solid #27272a',
            }}
          >
            <Box
              aria-hidden="true"
              className="flex h-56 w-56 items-center justify-center rounded-16"
              sx={{
                backgroundColor: 'rgba(201, 162, 39, .13)',
                color: 'primary.light',
              }}
            >
              <FuseSvgIcon size={28}>{icon}</FuseSvgIcon>
            </Box>
            <Typography className="mt-24 text-20 font-bold">
              Waiting for a connected data source
            </Typography>
            <Typography
              className="mt-10 max-w-[590px] text-13 leading-relaxed"
              color="text.secondary"
            >
              This view is ready for your website data. Once an approved
              provider is connected, insights will be displayed here with their
              source and collection status.
            </Typography>
          </Paper>
        </Box>
      }
    />
  );
}

export default AnalyticsWorkspacePage;
