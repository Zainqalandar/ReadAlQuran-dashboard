import FuseDialog from '@fuse/core/FuseDialog';
import { styled } from '@mui/material/styles';
import FuseMessage from '@fuse/core/FuseMessage';
import FuseSuspense from '@fuse/core/FuseSuspense';
import AppContext from 'app/AppContext';
import clsx from 'clsx';
import { memo, useContext } from 'react';
import { useSelector } from 'react-redux';
import { useRoutes } from 'react-router-dom';
import { selectFuseCurrentLayoutConfig } from 'app/store/fuse/settingsSlice';
import FooterLayout from './components/FooterLayout';
import LeftSideLayout from './components/LeftSideLayout';
import NavbarWrapperLayout from './components/NavbarWrapperLayout';
import RightSideLayout from './components/RightSideLayout';
import ToolbarLayout from './components/ToolbarLayout';

const Root = styled('div')(({ theme, config }) => ({
    ...(config.mode === 'boxed' && {
        clipPath: 'inset(0)',
        maxWidth: `${config.containerWidth}px`,
        margin: '0 auto',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    }),
    ...(config.mode === 'container' && {
        '& .container': {
            maxWidth: `${config.containerWidth}px`,
            width: '100%',
            margin: '0 auto',
        },
    }),
}));

function Layout(props) {
    const config = useSelector(selectFuseCurrentLayoutConfig);
    const appContext = useContext(AppContext);
    const { routes } = appContext;

    return (
        <Root id="fuse-layout" className="flex w-full" config={config}>
            {config.leftSidePanel.display && <LeftSideLayout />}

            <div className="flex min-w-0 flex-auto flex-col">
                <main id="fuse-main" className="relative flex min-h-full min-w-0 flex-auto flex-col">
                    {config.navbar.display && (
                        <NavbarWrapperLayout
                            className={clsx(config.navbar.style === 'fixed' && 'sticky top-0 z-50')}
                        />
                    )}

                    {config.toolbar.display && (
                        <ToolbarLayout
                            className={clsx(
                                config.toolbar.style === 'fixed' && 'sticky top-0',
                                config.toolbar.position === 'above' && 'z-40 order-first'
                            )}
                        />
                    )}

                    <div className="sticky top-0 z-99">{/* <SettingsPanel /> */}</div>

                    <div className="relative z-10 flex min-h-0 flex-auto flex-col">
                        <FuseDialog />
                        <FuseSuspense>{useRoutes(routes)}</FuseSuspense>
                        {props.children}
                    </div>

                    {config.footer.display && (
                        <FooterLayout className={config.footer.style === 'fixed' && 'sticky bottom-0'} />
                    )}
                </main>
            </div>

            {config.rightSidePanel.display && <RightSideLayout />}
            <FuseMessage />
        </Root>
    );
}

export default memo(Layout);
