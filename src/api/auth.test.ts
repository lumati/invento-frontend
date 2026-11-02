// @vitest-environment jsdom
import { AxiosError, type AxiosAdapter } from 'axios';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { LoginResponseData } from '@/types';

import { loginRequest, logoutRequest } from './auth';
import { apiClient } from './client';
import { ApiError, resolveApiErrorMessage } from './errors';
import { clearSession } from './session';

const loginData: LoginResponseData = {
  access_token: 'access-1',
  refresh_token: 'refresh-1',
  token_type: 'Bearer',
  expires_in: 900,
  user: { id: 1, username: 'johndoe', email: 'user@example.com' },
};

function respondWith(adapter: AxiosAdapter): void {
  apiClient.defaults.adapter = adapter;
}

beforeEach(() => {
  window.localStorage.clear();
  clearSession();
});

afterEach(() => {
  clearSession();
});

describe('auth API requests', () => {
  it('unwraps the login envelope into tokens and the user', async () => {
    respondWith(async (config) => ({
      data: { success: true, message: 'Login exitoso', data: loginData },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }));

    await expect(loginRequest({ email: 'user@example.com', password: 'secret' })).resolves.toEqual({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      user: loginData.user,
    });
  });

  it('posts the credentials to the login endpoint', async () => {
    let body: unknown;
    respondWith(async (config) => {
      body = JSON.parse(String(config.data)) as unknown;
      return {
        data: { success: true, message: 'Login exitoso', data: loginData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    });

    await loginRequest({ email: 'user@example.com', password: 'secret' });

    expect(body).toEqual({ email: 'user@example.com', password: 'secret' });
  });

  it('treats a 200 envelope with success:false as an authentication failure', async () => {
    respondWith(async (config) => ({
      data: { success: false, message: 'Usuario inactivo', data: null },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }));

    await expect(loginRequest({ email: 'user@example.com', password: 'secret' })).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Usuario inactivo',
    });
  });

  it('posts the refresh token to the logout endpoint', async () => {
    let url: string | undefined;
    let body: unknown;
    respondWith(async (config) => {
      url = config.url;
      body = JSON.parse(String(config.data)) as unknown;
      return {
        data: { success: true, message: 'Sesión cerrada', data: null },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    });

    await logoutRequest('refresh-1');

    expect(url).toBe('/authentication/logout');
    expect(body).toEqual({ refresh_token: 'refresh-1' });
  });
});

describe('resolveApiErrorMessage', () => {
  it('returns the backend message from a failed HTTP response', () => {
    const config = { headers: {} } as never;
    const error = new AxiosError('Request failed with status code 401', 'ERR_BAD_REQUEST', config, undefined, {
      data: { success: false, message: 'Credenciales inválidas', data: null },
      status: 401,
      statusText: 'Unauthorized',
      headers: {},
      config,
    });

    expect(resolveApiErrorMessage(error, 'fallback')).toBe('Credenciales inválidas');
  });

  it('returns the ApiError message', () => {
    expect(resolveApiErrorMessage(new ApiError('Usuario inactivo', 403), 'fallback')).toBe('Usuario inactivo');
  });

  it('falls back for network failures without a backend message', () => {
    const error = new AxiosError('Network Error', 'ERR_NETWORK', { headers: {} } as never);

    expect(resolveApiErrorMessage(error, 'Unable to sign in. Please try again.')).toBe(
      'Unable to sign in. Please try again.',
    );
  });

  it('falls back for unknown values', () => {
    expect(resolveApiErrorMessage('boom', 'fallback')).toBe('fallback');
  });
});
