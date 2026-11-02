import DashboardIcon from '@mui/icons-material/Dashboard';
import type { ElementType } from 'react';

/** One sidebar link. `path` is resolved by the router on click. */
export type NavItem = {
  label: string;
  path: string;
  icon: ElementType;
};

/** A labelled section of the sidebar navigation. */
export type NavGroup = {
  label: string;
  items: readonly NavItem[];
};

/**
 * Dummy navigation data for the shell. It stays local to the layout until the
 * real feature modules register their own routes.
 */
export const NAV_GROUPS: readonly NavGroup[] = [
  {
    label: 'MAIN',
    items: [{ label: 'Dashboard', path: '/', icon: DashboardIcon }],
  },
];
