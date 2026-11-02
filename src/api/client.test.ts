// @vitest-environment jsdom
import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient, refreshClient, setSessionExpiredHandler } from './client';
import { clearSession, readSession, saveSession } from './session';

const storedUser = { id: 1, username: 'johndoe', email: 'user@example.com' };

function ok<T>(config: InternalAxiosRequestConfig, data: T, status = 200): AxiosResponse<T> {
  return { data, status, statusText: String(status), headers: {}, config };
}

function unauthorized(config: InternalAxiosRequestConfig, message: string): AxiosError {
  return new AxiosError('Request failed with status code 401', 'ERR_BAD_REQUEST', config, undefined, {
    data: { success: false, message, data: null },
    status: 401,
    statusText: 'Unauthorized',
    headers: {},
    config,
  });
}

function installAdapters(apiAdapter: AxiosAdapter, refreshAdapter: AxiosAdapter): void {
  apiClient.defaults.adapter = apiAdapter;
  refreshClient.defaults.adapter = refreshAdapter;
}

beforeEach(() => {
  window.localStorage.clear();
  clearSession();
  // Keep the default redirect handler from touching jsdom's window.
  setSessionExpiredHandler(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  clearSession();
  setSessionExpiredHandler(null);
});

describe('API client interceptor', () => {
  it('attaches the stored access token as a Bearer header', async () => {
    saveSession({ accessToken: 'access-1', refreshToken: 'refresh-1', user: storedUser });
    const seen: InternalAxiosRequestConfig[] = [];
    installAdapters(
      async (config) => {
        seen.push(config);
        return ok(config, { success: true, message: 'ok', data: { items: [] } });
      },
      async (config) => ok(config, { success: true, message: 'refreshed', data: {} }),
    );

    await apiClient.get('/projects');

    expect(seen).toHaveLength(1);
    expect(seen[0].headers.Authorization).toBe('Bearer access-1');
  });

  it('does not attach an Authorization header without a session', async () => {
    const seen: InternalAxiosRequestConfig[] = [];
    installAdapters(
      async (config) => {
        seen.push(config);
        return ok(config, { success: true, message: 'ok', data: null });
      },
      async (config) => ok(config, { success: true, message: 'refreshed', data: {} }),
    );

    await apiClient.get('/projects');

    expect(seen[0].headers.Authorization).toBeUndefined();
  });

  it('refreshes once and retries the original request with the rotated token', async () => {
    saveSession({ accessToken: 'expired-token', refreshToken: 'refresh-1', user: storedUser });
    const apiCalls: InternalAxiosRequestConfig[] = [];
    const refreshCalls: InternalAxiosRequestConfig[] = [];
    installAdapters(
      async (config) => {
        apiCalls.push(config);
        if (apiCalls.length === 1) {
          throw unauthorized(config, 'Token expired');
        }
        return ok(config, { success: true, message: 'ok', data: { items: ['kept'] } });
      },
      async (config) => {
        refreshCalls.push(config);
        return ok(config, {
          success: true,
          message: 'Token refreshed',
          data: { access_token: 'rotated-access', refresh_token: 'rotated-refresh' },
        });
      },
    );

    const response = await apiClient.get('/projects');

    expect(response.data).toEqual({ success: true, message: 'ok', data: { items: ['kept'] } });
    expect(apiCalls).toHaveLength(2);
    expect(refreshCalls).toHaveLength(1);
    expect(refreshCalls[0].url).toBe('/authentication/refresh');
    expect(JSON.parse(String(refreshCalls[0].data))).toEqual({ refresh_token: 'refresh-1' });
    expect(apiCalls[1].headers.Authorization).toBe('Bearer rotated-access');
    expect(readSession()).toEqual({
      accessToken: 'rotated-access',
      refreshToken: 'rotated-refresh',
      user: storedUser,
    });
  });

  it('retries the original request exactly once when it keeps returning 401', async () => {
    saveSession({ accessToken: 'expired-token', refreshToken: 'refresh-1', user: storedUser });
    const apiCalls: InternalAxiosRequestConfig[] = [];
    const refreshCalls: InternalAxiosRequestConfig[] = [];
    installAdapters(
      async (config) => {
        apiCalls.push(config);
        throw unauthorized(config, 'Token expired');
      },
      async (config) => {
        refreshCalls.push(config);
        return ok(config, {
          success: true,
          message: 'Token refreshed',
          data: { access_token: 'rotated-access', refresh_token: 'rotated-refresh' },
        });
      },
    );

    await expect(apiClient.get('/projects')).rejects.toBeInstanceOf(AxiosError);

    expect(apiCalls).toHaveLength(2);
    expect(refreshCalls).toHaveLength(1);
  });

  it('clears the session and notifies expiry when the refresh call fails', async () => {
    saveSession({ accessToken: 'expired-token', refreshToken: 'refresh-1', user: storedUser });
    const onSessionExpired = vi.fn();
    setSessionExpiredHandler(onSessionExpired);
    installAdapters(
      async (config) => {
        throw unauthorized(config, 'Token expired');
      },
      async (config) => {
        throw unauthorized(config, 'Refresh token expired');
      },
    );

    await expect(apiClient.get('/projects')).rejects.toBeInstanceOf(AxiosError);

    expect(onSessionExpired).toHaveBeenCalledTimes(1);
    expect(readSession()).toEqual({ accessToken: null, refreshToken: null, user: null });
    expect(window.localStorage.getItem('invento.auth.accessToken')).toBeNull();
  });

  it('does not try to refresh a 401 coming from the login endpoint', async () => {
    saveSession({ accessToken: 'access-1', refreshToken: 'refresh-1', user: storedUser });
    let refreshCalls = 0;
    installAdapters(
      async (config) => {
        throw unauthorized(config, 'Credenciales inválidas');
      },
      async (config) => {
        refreshCalls += 1;
        return ok(config, { success: true, message: 'refreshed', data: {} });
      },
    );

    await expect(apiClient.post('/authentication/login', { email: 'a@b.test', password: 'x' })).rejects.toBeInstanceOf(
      AxiosError,
    );

    expect(refreshCalls).toBe(0);
  });

  it('skips the refresh flow when no refresh token is stored', async () => {
    saveSession({ accessToken: 'access-1', refreshToken: null, user: storedUser });
    let refreshCalls = 0;
    installAdapters(
      async (config) => {
        throw unauthorized(config, 'Token expired');
      },
      async (config) => {
        refreshCalls += 1;
        return ok(config, { success: true, message: 'refreshed', data: {} });
      },
    );

    await expect(apiClient.get('/projects')).rejects.toBeInstanceOf(AxiosError);

    expect(refreshCalls).toBe(0);
    expect(readSession()).toEqual({ accessToken: null, refreshToken: null, user: null });
  });
});
