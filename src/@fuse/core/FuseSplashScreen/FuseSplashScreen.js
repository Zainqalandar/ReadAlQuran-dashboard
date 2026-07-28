import { memo } from 'react';
import Box from '@mui/material/Box';

const BRAND_LOGO = '/logos/logo1.png';

function FuseSplashScreen() {
  return (
    <div id="fuse-splash-screen">
      <div className="logo">
        <img src={BRAND_LOGO} alt="ReadAlQuran" />
        <span>Loading ReadAlQuran...</span>
      </div>
      <Box
        id="spinner"
        sx={{
          '& > div': {
            backgroundColor: 'palette.secondary.main',
          },
        }}
      >
        <div className="bounce1" />
        <div className="bounce2" />
        <div className="bounce3" />
      </Box>
    </div>
  );
}

export default memo(FuseSplashScreen);
