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
        badge: { title: 'Beta', bg: '#1f5843', fg: '#ecfff8' },
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
        title: 'Search performance',
        subtitle: 'Queries and landing pages',
        icon: 'heroicons-outline:search',
        type: 'item',
        url: '/analytics/search',
      },
    ],
  },
  {
    id: 'content',
    title: 'Content intelligence',
    type: 'group',
    children: [
      {
        id: 'content-performance',
        title: 'Content performance',
        subtitle: 'Pages that guide readers',
        icon: 'heroicons-outline:document-report',
        type: 'item',
        url: '/analytics/content',
      },
      {
        id: 'quran-journeys',
        title: 'Quran journeys',
        subtitle: 'Reader paths and retention',
        icon: 'heroicons-outline:book-open',
        type: 'item',
        url: '/analytics/journeys',
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
      {
        id: 'locations-devices',
        title: 'Locations & devices',
        subtitle: 'How the Ummah reads',
        icon: 'heroicons-outline:globe-alt',
        type: 'item',
        url: '/analytics/technology',
      },
    ],
  },
  {
    id: 'workspace',
    title: 'Workspace',
    type: 'group',
    children: [
      {
        id: 'reports',
        title: 'Reports',
        subtitle: 'Saved website views',
        icon: 'heroicons-outline:collection',
        type: 'item',
        url: '/analytics/reports',
      },
      {
        id: 'data-sources',
        title: 'Data sources',
        subtitle: 'Connections and privacy',
        icon: 'heroicons-outline:database',
        type: 'item',
        url: '/analytics/data-sources',
      },
    ],
  },
];

export default navigationConfig;
