import { createTheme, type Theme } from '@mui/material/styles';

import { COLORS, FONT_FAMILY, RADII, SHADOWS } from './tokens';

/**
 * Default application theme: Kaiadmin Lite look rendered through Material UI.
 *
 * Palette roles, typography, radii and the card shadow follow DESIGN.md.
 * CssBaseline is applied by `KaiadminThemeProvider`, so components inherit
 * the canvas background and body typography without extra setup.
 */
export const kaiadminTheme: Theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: COLORS.primary,
      dark: COLORS.primaryDark,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: COLORS.secondary,
      contrastText: '#FFFFFF',
    },
    error: { main: COLORS.error, contrastText: '#FFFFFF' },
    warning: { main: COLORS.warning, contrastText: '#FFFFFF' },
    success: { main: COLORS.success, contrastText: '#FFFFFF' },
    info: { main: COLORS.info, contrastText: '#FFFFFF' },
    background: {
      default: COLORS.backgroundDefault,
      paper: COLORS.backgroundPaper,
    },
    text: {
      primary: COLORS.textPrimary,
      secondary: COLORS.textSecondary,
    },
    divider: COLORS.divider,
  },
  typography: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    h1: { fontSize: '2.15rem', fontWeight: 500, lineHeight: 1.5 },
    h2: { fontSize: '1.85rem', fontWeight: 500, lineHeight: 1.5 },
    h3: { fontSize: '1.64rem', fontWeight: 600, lineHeight: 1.5 },
    h4: { fontSize: '1.35rem', fontWeight: 600, lineHeight: 1.5 },
    h5: { fontSize: '1.2rem', fontWeight: 600, lineHeight: 1.5 },
    h6: { fontSize: '1.07rem', fontWeight: 600, lineHeight: 1.5 },
    body1: { fontSize: '0.875rem', lineHeight: 1.5 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.6 },
    subtitle1: { fontWeight: 600 },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: RADII.card,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { height: '100%' },
        body: {
          margin: 0,
          minHeight: '100%',
          backgroundColor: COLORS.backgroundDefault,
          color: COLORS.textPrimary,
          fontFamily: FONT_FAMILY,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        a: { color: COLORS.primary, textDecoration: 'none' },
        'a:hover': { color: COLORS.primaryDark },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: RADII.card,
          boxShadow: SHADOWS.card,
          border: 'none',
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: RADII.pill,
          padding: '9px 20px',
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          boxShadow: 'none',
          '&.MuiButton-contained.MuiButton-colorPrimary:hover': {
            backgroundColor: COLORS.primaryDark,
          },
        },
        sizeSmall: {
          borderRadius: RADII.small,
          padding: '5px 9px',
          fontSize: '0.6875rem',
        },
        sizeLarge: {
          padding: '12px 24px',
          fontSize: '0.9375rem',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: RADII.input,
          fontSize: '0.875rem',
          backgroundColor: COLORS.backgroundPaper,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { fontSize: '0.875rem' },
      },
    },
    MuiLink: {
      defaultProps: { underline: 'none' },
      styleOverrides: {
        root: {
          '&:hover': { color: COLORS.primaryDark },
        },
      },
    },
  },
});
