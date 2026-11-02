/**
 * Design tokens for the Kaiadmin Lite admin theme.
 * Values come from DESIGN.md at the repository root, the single source of truth.
 */

export const FONT_FAMILY = '"Public Sans", sans-serif';

export const COLORS = {
  primary: '#1572E8',
  primaryDark: '#1269DB',
  secondary: '#6861CE',
  error: '#F25961',
  warning: '#FFAD46',
  success: '#31CE36',
  info: '#48ABF7',
  backgroundDefault: '#F5F7FD',
  backgroundPaper: '#FFFFFF',
  textPrimary: '#2A2F5B',
  textSecondary: '#686F76',
  textHeading: '#444444',
  divider: '#F0F1F3',
  tableHeaderBackground: '#F6F9FC',
  tableHeaderText: '#8898AA',
  sidebarNavy: '#1A2035',
} as const;

/** Navy surface used by the fixed sidebar in the app shell. */
export const SIDEBAR_NAVY = COLORS.sidebarNavy;

export const RADII = {
  small: 3,
  input: 5.25,
  card: 10,
  pill: 100,
} as const;

export const SHADOWS = {
  card: 'rgba(69,65,78,0.1) 2px 6px 15px',
  sidebar: 'rgba(69,65,78,0.06) 4px 4px 10px',
  panel: 'rgba(69,65,78,0.21) -5px 5px 20px',
  modal: 'rgba(69,65,78,0.15) -1px 1px 20px',
} as const;
