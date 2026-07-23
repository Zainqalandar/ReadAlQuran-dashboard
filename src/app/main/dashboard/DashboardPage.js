import { Button, Paper, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { NavLink } from 'react-router-dom';

const readinessCards = [
  {
    label: 'Traffic insights',
    description:
      'Visitor and referral trends will appear when a source is connected.',
    icon: 'heroicons-outline:chart-bar',
  },
  {
    label: 'Reader journeys',
    description:
      'Understand which Quran pages help readers continue their study.',
    icon: 'heroicons-outline:book-open',
  },
  {
    label: 'Search discovery',
    description:
      'See the queries and landing pages that bring people to the site.',
    icon: 'heroicons-outline:search',
  },
];

function DashboardPage() {
  return (
    <FusePageSimple
      header={
        <div
          className="flex w-full flex-col justify-center border-b px-24 py-24 sm:px-40"
          style={{ borderColor: '#27272a' }}
        >
          <Box className="flex flex-wrap items-center gap-10">
            <Typography className="text-3xl font-extrabold leading-tight">
              Analytics overview
            </Typography>
            <Box
              className="rounded-full px-10 py-4"
              sx={{
                backgroundColor: 'rgba(201, 162, 39, .12)',
                border: '1px solid rgba(201, 162, 39, .22)',
              }}
            >
              <Typography
                className="text-10 font-bold uppercase tracking-wide"
                color="primary.light"
              >
                Setup mode
              </Typography>
            </Box>
          </Box>
          <Typography className="mt-8 text-14" color="text.secondary">
            Prepare a focused, privacy-aware view of readalquran.online.
          </Typography>
        </div>
      }
      content={
        <Box className="w-full p-24 sm:p-40">
          <Box className="mx-auto flex w-full max-w-[1440px] flex-col gap-20">
            <Paper
              className="overflow-hidden rounded-16 p-24 sm:p-32"
              elevation={0}
              sx={{
                background:
                  'radial-gradient(circle at 100% 0%, rgba(201, 162, 39, .16), transparent 34%), linear-gradient(135deg, #18181f, #141419)',
                border: '1px solid #27272a',
              }}
            >
              <Box className="flex flex-col justify-between gap-24 lg:flex-row lg:items-center">
                <Box className="max-w-[680px]">
                  <Box className="flex items-center gap-10">
                    <Box
                      aria-hidden="true"
                      className="rounded-10 flex h-40 w-40 items-center justify-center"
                      sx={{
                        backgroundColor: 'rgba(201, 162, 39, .15)',
                        color: 'primary.light',
                      }}
                    >
                      <FuseSvgIcon size={22}>
                        heroicons-outline:database
                      </FuseSvgIcon>
                    </Box>
                    <Typography className="text-16 font-bold">
                      Your analytics space is ready for a data source.
                    </Typography>
                  </Box>
                  <Typography
                    className="mt-16 text-14 leading-relaxed"
                    color="text.secondary"
                  >
                    Connect a trusted analytics provider to turn this workspace
                    into an actionable view of readers, content and discovery.
                  </Typography>
                </Box>
                <Button
                  className="rounded-10 min-h-44 shrink-0 px-20 text-12 font-bold"
                  color="primary"
                  component={NavLink}
                  to="/analytics/data-sources"
                  variant="contained"
                >
                  Connect a data source
                </Button>
              </Box>
            </Paper>

            <Box className="grid grid-cols-1 gap-16 md:grid-cols-3">
              {readinessCards.map((card) => (
                <Paper
                  key={card.label}
                  className="rounded-14 p-20"
                  elevation={0}
                  sx={{
                    backgroundColor: 'background.paper',
                    border: '1px solid #27272a',
                  }}
                >
                  <Box
                    aria-hidden="true"
                    className="rounded-10 flex h-36 w-36 items-center justify-center"
                    sx={{
                      backgroundColor: 'rgba(31, 88, 67, .22)',
                      color: '#83c5a9',
                    }}
                  >
                    <FuseSvgIcon size={19}>{card.icon}</FuseSvgIcon>
                  </Box>
                  <Typography className="mt-20 text-15 font-bold">
                    {card.label}
                  </Typography>
                  <Typography
                    className="mt-8 text-12 leading-relaxed"
                    color="text.secondary"
                  >
                    {card.description}
                  </Typography>
                </Paper>
              ))}
            </Box>

            <Paper
              className="rounded-16 p-24 sm:p-28"
              elevation={0}
              sx={{ border: '1px solid #27272a' }}
            >
              <Typography className="text-16 font-bold">
                A clear next step
              </Typography>
              <Typography
                className="mt-8 max-w-[760px] text-13 leading-relaxed"
                color="text.secondary"
              >
                Add your approved analytics connection first. The dashboard will
                then show only live, sourced data instead of placeholder
                figures.
              </Typography>
            </Paper>
          </Box>
        </Box>
      }
    />
  );
}

export default DashboardPage;
