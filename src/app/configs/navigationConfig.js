const navigationConfig = [
  {
    id: 'overview',
    title: 'Overview',
    type: 'group',
    children: [
      {
        id: 'dashboard',
        title: 'Analytics overview',
        subtitle: 'Your website at a glance',
        icon: 'heroicons-outline:chart-bar',
        type: 'item',
        url: '/dashboard',
      },
      {
        id: 'live-traffic',
        title: 'Live activity',
        subtitle: 'Visitors happening now',
        icon: 'heroicons-outline:lightning-bolt',
        type: 'item',
        url: '/analytics/live',
        badge: { title: 'Live', bg: '#dc2626', fg: '#fff7ed', effect: 'pulse' },
      },
    ],
  },
  {
    id: 'site-operations',
    title: 'Site administration',
    type: 'group',
    children: [
      {
        id: 'site-operations',
        title: 'Site operations',
        subtitle: 'Readers and notifications',
        icon: 'heroicons-outline:shield-check',
        type: 'item',
        url: '/operations',
        end: true,
        badge: { title: 'Beta', bg: '#1f5843', fg: '#ecfff8' },
      },
      {
        id: 'users-feedback',
        title: 'Users and feedback',
        subtitle: 'Accounts and reader reports',
        icon: 'heroicons-outline:chat-alt-2',
        type: 'item',
        url: '/operations/users',
      },
      {
        id: 'notification-devices',
        title: 'Notification devices',
        subtitle: 'Signed-in and guest push devices',
        icon: 'heroicons-outline:bell',
        type: 'item',
        url: '/operations/notification-devices',
      },
    ],
  },
  {
    id: 'audience',
    title: 'Audience',
    type: 'group',
    children: [
      {
        id: 'visitors',
        title: 'Visitors',
        subtitle: 'Returning and new readers',
        icon: 'heroicons-outline:users',
        type: 'item',
        url: '/analytics/audience',
      },
    ],
  },
  {
    id: 'acquisition',
    title: 'Acquisition',
    type: 'group',
    children: [
      {
        id: 'traffic-sources',
        title: 'Traffic sources',
        subtitle: 'Where readers find you',
        icon: 'heroicons-outline:cursor-click',
        type: 'item',
        url: '/analytics/traffic',
      },
      {
        id: 'search-performance',
        title: 'Google Search',
        subtitle: 'How people find your website',
        icon: 'feather:google',
        type: 'item',
        url: '/analytics/search',
      },
    ],
  },
];

export default navigationConfig;
