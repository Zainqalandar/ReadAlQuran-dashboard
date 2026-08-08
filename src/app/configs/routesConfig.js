import FuseUtils from '@fuse/utils';
import FuseLoading from '@fuse/core/FuseLoading';
import { Navigate } from 'react-router-dom';
import settingsConfig from 'app/configs/settingsConfig';
import Error404Page from '../main/404/Error404Page';
import SignInConfig from '../main/sign-in/SignInConfig';
import DashboardPage from '../main/dashboard/DashboardPage';
import AudiencePage from '../main/audience/AudiencePage';
import LiveActivityPage from '../main/live/LiveActivityPage';
import TrafficQualityPage from '../main/traffic/TrafficQualityPage';
import SearchPerformancePage from '../main/search/SearchPerformancePage';
import AnalyticsWorkspacePage from '../main/analytics/AnalyticsWorkspacePage';
import SiteOperationsPage from '../main/admin/SiteOperationsPage';
import UsersFeedbackPage from '../main/admin/UsersFeedbackPage';
import GuestNotificationsPage from '../main/admin/GuestNotificationsPage';

const routeConfigs = [SignInConfig];

const analyticsViews = [
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
  {
    path: '/analytics/audience',
    element: <AudiencePage />,
    auth: settingsConfig.defaultAuth,
  },
  {
    path: '/analytics/live',
    element: <LiveActivityPage />,
    auth: settingsConfig.defaultAuth,
  },
  {
    path: '/analytics/traffic',
    element: <TrafficQualityPage />,
    auth: settingsConfig.defaultAuth,
  },
  {
    path: '/analytics/search',
    element: <SearchPerformancePage />,
    auth: settingsConfig.defaultAuth,
  },
  {
    path: '/operations',
    element: <SiteOperationsPage />,
    auth: settingsConfig.defaultAuth,
  },
  {
    path: '/operations/users',
    element: <UsersFeedbackPage />,
    auth: settingsConfig.defaultAuth,
  },
  {
    path: '/operations/notification-devices',
    element: <GuestNotificationsPage />,
    auth: settingsConfig.defaultAuth,
  },
  {
    path: '/operations/guest-notifications',
    element: <Navigate to="/operations/notification-devices" replace />,
    auth: settingsConfig.defaultAuth,
  },
  {
    path: '/guest-notifications',
    element: <Navigate to="/operations/notification-devices" replace />,
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
