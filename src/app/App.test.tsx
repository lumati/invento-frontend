// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { clearSession, saveSession } from '@/api/session';
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
  });

  it('renders the authenticated placeholder for a persisted session', () => {
    saveSession({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      user: { id: 1, username: 'johndoe', email: 'user@example.com' },
    });

    renderApp();

    expect(screen.getByText('Signed in as johndoe')).toBeInTheDocument();
  });
});
