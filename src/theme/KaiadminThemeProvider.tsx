import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import type { ReactNode } from 'react';

import { kaiadminTheme } from './kaiadminTheme';

export type KaiadminThemeProviderProps = {
  children: ReactNode;
};

/**
 * Wraps the application in the Kaiadmin theme and applies CssBaseline,
 * so the canvas background and Public Sans body typography are global.
 */
export function KaiadminThemeProvider({ children }: KaiadminThemeProviderProps) {
  return (
    <ThemeProvider theme={kaiadminTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
