export interface NavTabItem {
  id: string;
  label: string;
  shortLabel?: string;
  path: string;
  icon: string;
  group: 'primary' | 'portal';
  matchPaths: string[];
}

export const DESKTOP_PRIMARY_TABS: NavTabItem[] = [
  {
    id: 'shop',
    label: 'Shop',
    path: 'shop',
    icon: '✦',
    group: 'primary',
    matchPaths: ['shop', 'home', 'product-detail']
  },
  {
    id: 'learn',
    label: 'Learn Studio',
    shortLabel: 'Learn',
    path: 'learn',
    icon: '▤',
    group: 'primary',
    matchPaths: ['learn']
  },
  {
    id: 'ecosystem',
    label: 'Ecosystem',
    path: 'partners',
    icon: '⚓',
    group: 'primary',
    matchPaths: ['partners', 'partner-page']
  },
  {
    id: 'programs',
    label: 'Wellness Programs',
    shortLabel: 'Programs',
    path: 'wellness-programs',
    icon: '🌿',
    group: 'primary',
    matchPaths: ['wellness-programs']
  },
  {
    id: 'approach',
    label: 'Our Approach',
    shortLabel: 'Approach',
    path: 'approach',
    icon: '🔬',
    group: 'primary',
    matchPaths: ['approach']
  },
  {
    id: 'about',
    label: 'About Us',
    shortLabel: 'About',
    path: 'about',
    icon: '🏛',
    group: 'primary',
    matchPaths: ['about']
  },
  {
    id: 'faq',
    label: 'FAQ',
    path: 'faq',
    icon: '❓',
    group: 'primary',
    matchPaths: ['faq']
  },
  {
    id: 'contact',
    label: 'Contact Us',
    shortLabel: 'Contact',
    path: 'contact',
    icon: '✉',
    group: 'primary',
    matchPaths: ['contact']
  }
];

export const DESKTOP_PORTAL_TABS: NavTabItem[] = [
  {
    id: 'orders',
    label: 'My Orders',
    shortLabel: 'Orders',
    path: 'customer-portal',
    icon: '□',
    group: 'portal',
    matchPaths: ['customer-portal']
  },
  {
    id: 'partner-portal',
    label: 'Partner Portal',
    shortLabel: 'Partners',
    path: 'partner-portal',
    icon: '🤝',
    group: 'portal',
    matchPaths: ['partner-portal']
  },
  {
    id: 'admin',
    label: 'Admin Center',
    shortLabel: 'Admin',
    path: 'admin',
    icon: '🔒',
    group: 'portal',
    matchPaths: ['admin']
  }
];

export const ALL_DESKTOP_TABS: NavTabItem[] = [
  ...DESKTOP_PRIMARY_TABS,
  ...DESKTOP_PORTAL_TABS
];
