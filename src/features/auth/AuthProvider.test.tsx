// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AxiosError, type AxiosAdapter } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient, refreshClient } from '@/api/client';
import { AUTH_STORAGE_KEYS, clearSession, saveSession } from '@/api/session';
import type { LoginResponseData } from '@/types';

import { AuthProvider, useAuth } from './AuthProvider';

const loginData: LoginResponseData = {
  access_token: 'access-1',
  refresh_token: 'refresh-1',
  token_type: 'Bearer',
  expires_in: 900,
  user: { id: 1, username: 'johndoe', email: 'user@example.com' },
};

function installAdapter(adapter: AxiosAdapter): void {
  apiClient.defaults.adapter = adapter;
}

function loginEnvelope(config: Parameters<AxiosAdapter>[0]) {
  return {
    data: { success: true, message: 'Login exitoso', data: loginData },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  };
}

function AuthProbe() {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user">{user?.username ?? 'none'}</span>
      <button
        type="button"
        onClick={() => {
          void login('user@example.com', 'secret').catch(() => {});
        }}
      >
        do-login
      </button>
      <button type="button" onClick={() => void logout()}>
        do-logout
      </button>
    </div>
  );
}

function renderProbe() {
  render(
    <AuthProvider>
      <AuthProbe />
    </AuthProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  clearSession();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  clearSession();
});

describe('auth store', () => {
  it('starts unauthenticated when storage is empty', () => {
    renderProbe();

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('none');
  });

  it('restores a persisted session on mount', () => {
    saveSession({ accessToken: 'access-1', refreshToken: 'refresh-1', user: loginData.user });

    renderProbe();

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('user')).toHaveTextContent('johndoe');
  });

  it('stores tokens, user and state together on login', async () => {
    installAdapter(async (config) => loginEnvelope(config));
    renderProbe();

    fireEvent.click(screen.getByText('do-login'));

    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('true'));
    expect(screen.getByTestId('user')).toHaveTextContent('johndoe');
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)).toBe('access-1');
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken)).toBe('refresh-1');
    expect(JSON.parse(window.localStorage.getItem(AUTH_STORAGE_KEYS.user) ?? 'null')).toEqual(loginData.user);
  });

  it('keeps the logged-out state when the login request fails', async () => {
    installAdapter(async (config) => {
      throw new AxiosError('Request failed with status code 401', 'ERR_BAD_REQUEST', config, undefined, {
        data: { success: false, message: 'Credenciales inválidas', data: null },
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config,
      });
    });
    renderProbe();

    fireEvent.click(screen.getByText('do-login'));

    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('false'));
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)).toBeNull();
  });

  it('calls the logout endpoint with the refresh token and clears the session', async () => {
    saveSession({ accessToken: 'access-1', refreshToken: 'refresh-1', user: loginData.user });
    const bodies: unknown[] = [];
    installAdapter(async (config) => {
      bodies.push(JSON.parse(String(config.data)) as unknown);
      return {
        data: { success: true, message: 'Sesión cerrada', data: null },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    });
    renderProbe();

    fireEvent.click(screen.getByText('do-logout'));

    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('false'));
    expect(bodies).toEqual([{ refresh_token: 'refresh-1' }]);
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)).toBeNull();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken)).toBeNull();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.user)).toBeNull();
  });

  it('clears the session even when the logout request fails', async () => {
    saveSession({ accessToken: 'access-1', refreshToken: 'refresh-1', user: loginData.user });
    installAdapter(async () => {
      throw new AxiosError('Network Error', 'ERR_NETWORK');
    });
    renderProbe();

    fireEvent.click(screen.getByText('do-logout'));

    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('false'));
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)).toBeNull();
  });

  it('clears the state when a refresh failure expires the session', async () => {
    saveSession({ accessToken: 'access-1', refreshToken: 'refresh-1', user: loginData.user });
    apiClient.defaults.adapter = async (config) => {
      throw new AxiosError('Request failed with status code 401', 'ERR_BAD_REQUEST', config, undefined, {
        data: { success: false, message: 'Token expired', data: null },
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config,
      });
    };
    refreshClient.defaults.adapter = async (config) => {
      throw new AxiosError('Request failed with status code 401', 'ERR_BAD_REQUEST', config, undefined, {
        data: { success: false, message: 'Refresh token expired', data: null },
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config,
      });
    };
    renderProbe();
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');

    await expect(apiClient.get('/projects')).rejects.toBeDefined();

    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('false'));
  });
});
