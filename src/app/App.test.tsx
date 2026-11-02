// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { AUTH_STORAGE_KEYS, clearSession, saveSession } from '@/api/session';
import { KaiadminThemeProvider } from '@/theme';

import App from './App';

function renderApp() {
  return render(
    <KaiadminThemeProvider>
      <App />
    </KaiadminThemeProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  clearSession();
  window.history.replaceState({}, '', '/');
});

afterEach(() => {
  cleanup();
  clearSession();
  window.history.replaceState({}, '', '/');
});

describe('App routes', () => {
  it('redirects unauthenticated visitors of the protected area to the login page', () => {
    renderApp();

    expect(screen.getByRole('heading', { name: 'Invento Admin' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
    expect(screen.queryByText('MAIN')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sign out' })).not.toBeInTheDocument();
  });

  it('renders the app shell around the authenticated dashboard', () => {
    saveSession({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      user: { id: 1, username: 'johndoe', email: 'user@example.com' },
    });

    renderApp();

    expect(screen.getByText('MAIN')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('johndoe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
  });

  it('signs out from the topbar and returns to the login page', async () => {
    saveSession({
      accessToken: 'access-1',
      refreshToken: null,
      user: { id: 1, username: 'johndoe', email: 'user@example.com' },
    });

    renderApp();
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(await screen.findByRole('heading', { name: 'Invento Admin' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)).toBeNull();
  });
});
