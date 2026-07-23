import FuseUtils from '@fuse/utils';
import FuseLoading from '@fuse/core/FuseLoading';
import { Navigate } from 'react-router-dom';
import settingsConfig from 'app/configs/settingsConfig';
import Error404Page from '../main/404/Error404Page';
import SignInConfig from '../main/sign-in/SignInConfig';
import DashboardPage from '../main/dashboard/DashboardPage';
import AnalyticsWorkspacePage from '../main/analytics/AnalyticsWorkspacePage';

const routeConfigs = [SignInConfig];

const analyticsViews = [
  {
    path: '/analytics/live',
    title: 'Live activity',
    description:
      'Monitor current reader activity as soon as a data source is connected.',
    icon: 'heroicons-outline:lightning-bolt',
  },
  {
    path: '/analytics/traffic',
    title: 'Traffic sources',
    description: 'See how readers discover readalquran.online across the web.',
    icon: 'heroicons-outline:cursor-click',
  },
  {
    path: '/analytics/search',
    title: 'Search performance',
    description:
      'Understand search queries, landing pages and organic discovery.',
    icon: 'heroicons-outline:search',
  },
  {
    path: '/analytics/content',
    title: 'Content performance',
    description: 'Learn which pages and topics serve readers best.',
    icon: 'heroicons-outline:document-report',
  },
  {
    path: '/analytics/journeys',
    title: 'Quran journeys',
    description: 'Explore the paths readers take through Quran study.',
    icon: 'heroicons-outline:book-open',
  },
  {
    path: '/analytics/audience',
    title: 'Visitors',
    description: 'Build a respectful picture of returning and new readers.',
    icon: 'heroicons-outline:users',
  },
  {
    path: '/analytics/technology',
    title: 'Locations & devices',
    description: 'Understand reader context across regions and devices.',
    icon: 'heroicons-outline:globe-alt',
  },
  {
    path: '/analytics/reports',
    title: 'Reports',
    description: 'Create a small collection of the website views you revisit.',
    icon: 'heroicons-outline:collection',
  },
  {
    path: '/analytics/data-sources',
    title: 'Data sources',
    description:
      'Manage approved analytics connections and collection settings.',
    icon: 'heroicons-outline:database',
  },
];

const routes = [
  ...FuseUtils.generateRoutesFromConfigs(
    routeConfigs,
    settingsConfig.defaultAuth
  ),
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
    auth: settingsConfig.defaultAuth,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
    auth: settingsConfig.defaultAuth,
  },
  ...analyticsViews.map((view) => ({
    path: view.path,
    element: <AnalyticsWorkspacePage {...view} />,
    auth: settingsConfig.defaultAuth,
  })),
  {
    path: 'loading',
    element: <FuseLoading />,
  },
  {
    path: '404',
    element: <Error404Page />,
  },
  {
    path: '*',
    element: <Navigate to="404" />,
  },
];

export default routes;
