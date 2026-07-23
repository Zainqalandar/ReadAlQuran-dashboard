import AppBar from '@mui/material/AppBar';
import { ThemeProvider } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import clsx from 'clsx';
import { memo } from 'react';
import { useSelector } from 'react-redux';
import { selectFooterTheme } from 'app/store/fuse/settingsSlice';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import Box from '@mui/material/Box';

function FooterLayout(props) {
    const footerTheme = useSelector(selectFooterTheme);

    return (
        <ThemeProvider theme={footerTheme}>
            <AppBar
                id="fuse-footer"
                className={clsx('relative z-20 shadow-md', props.className)}
                color="default"
                sx={{ backgroundColor: footerTheme.palette.background.paper }}
            >
                <Toolbar className="container flex flex-col items-center overflow-x-auto px-8 py-4 sm:px-12 md:min-h-64">
                    <Box className="flex justify-center space-x-4 mb-4">
                        <IconButton color="inherit" href="https://facebook.com">
                            <FacebookIcon />
                        </IconButton>
                        <IconButton color="inherit" href="https://twitter.com">
                            <TwitterIcon />
                        </IconButton>
                        <IconButton color="inherit" href="https://instagram.com">
                            <InstagramIcon />
                        </IconButton>
                    </Box>
                    <Typography variant="body2" color="textSecondary" align="center">
                        © {new Date().getFullYear()} Your Company. All rights reserved.
                    </Typography>
                </Toolbar>
            </AppBar>
        </ThemeProvider>
    );
}

export default memo(FooterLayout);