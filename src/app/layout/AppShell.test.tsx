// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { clearSession, saveSession } from '@/api/session';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { KaiadminThemeProvider } from '@/theme';

import AppShell from './AppShell';

function LocationProbe() {
  const { pathname } = useLocation();
  return <p data-testid="location">{pathname}</p>;
}

function renderShell(initialPath = '/') {
  return render(
    <KaiadminThemeProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <AuthProvider>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="*" element={<LocationProbe />} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </KaiadminThemeProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  clearSession();
  saveSession({
    accessToken: 'access-1',
    refreshToken: null,
    user: { id: 1, username: 'johndoe', email: 'user@example.com' },
  });
});

afterEach(() => {
  cleanup();
  clearSession();
});

describe('AppShell', () => {
  it('navigates to the dashboard when the sidebar item is clicked', () => {
    renderShell('/somewhere');

    fireEvent.click(screen.getByRole('button', { name: 'Dashboard' }));

    expect(screen.getByTestId('location')).toHaveTextContent('/');
  });

  it('opens the off-canvas navigation from the topbar and closes it with Escape', async () => {
    renderShell();

    expect(screen.getAllByText('MAIN')).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    await waitFor(() => expect(screen.getAllByText('MAIN')).toHaveLength(2));

    fireEvent.keyDown(screen.getByRole('presentation'), { key: 'Escape' });
    await waitFor(() => expect(screen.getAllByText('MAIN')).toHaveLength(1));
  });
});
