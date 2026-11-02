// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AxiosError, type AxiosAdapter, type AxiosResponse } from 'axios';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/api/client';
import { AUTH_STORAGE_KEYS, clearSession } from '@/api/session';
import type { LoginResponseData } from '@/types';

import { AuthProvider } from './AuthProvider';
import LoginPage from './LoginPage';

const loginData: LoginResponseData = {
  access_token: 'access-1',
  refresh_token: 'refresh-1',
  token_type: 'Bearer',
  expires_in: 900,
  user: { id: 1, username: 'johndoe', email: 'user@example.com' },
};

function succeed(config: Parameters<AxiosAdapter>[0]): AxiosResponse {
  return {
    data: { success: true, message: 'Login exitoso', data: loginData },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  };
}

function renderLoginPage() {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<h1>Protected dashboard</h1>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

function submitLogin(): void {
  fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: 'user@example.com' } });
  fireEvent.change(screen.getByLabelText(/^Password/), { target: { value: 'secret' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
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

describe('LoginPage', () => {
  it('renders the email, password and submit controls', () => {
    apiClient.defaults.adapter = async (config) => succeed(config);
    renderLoginPage();

    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/)).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
  });

  it('toggles the password visibility', () => {
    apiClient.defaults.adapter = async (config) => succeed(config);
    renderLoginPage();

    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(screen.getByLabelText(/^Password/)).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(screen.getByLabelText(/^Password/)).toHaveAttribute('type', 'password');
  });

  it('shows the backend message when the credentials are rejected with 401', async () => {
    apiClient.defaults.adapter = async (config) => {
      throw new AxiosError('Request failed with status code 401', 'ERR_BAD_REQUEST', config, undefined, {
        data: { success: false, message: 'Credenciales inválidas', data: null },
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config,
      });
    };
    renderLoginPage();

    submitLogin();

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales inválidas');
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)).toBeNull();
    expect(screen.queryByText('Protected dashboard')).not.toBeInTheDocument();
  });

  it('shows the backend message when a 200 envelope reports success:false', async () => {
    apiClient.defaults.adapter = async (config) => ({
      data: { success: false, message: 'Usuario inactivo', data: null },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
    renderLoginPage();

    submitLogin();

    expect(await screen.findByRole('alert')).toHaveTextContent('Usuario inactivo');
  });

  it('disables the submit button while the login request is in flight', async () => {
    let resolveLogin: ((response: AxiosResponse) => void) | undefined;
    let capturedConfig: Parameters<AxiosAdapter>[0] | undefined;
    apiClient.defaults.adapter = (config) =>
      new Promise<AxiosResponse>((resolve) => {
        capturedConfig = config;
        resolveLogin = resolve;
      });
    renderLoginPage();

    submitLogin();

    await waitFor(() => expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled());
    expect(capturedConfig).toBeDefined();
    resolveLogin?.(succeed(capturedConfig as Parameters<AxiosAdapter>[0]));
    await waitFor(() => expect(screen.getByText('Protected dashboard')).toBeInTheDocument());
  });

  it('stores the session and navigates to the protected area on success', async () => {
    apiClient.defaults.adapter = async (config) => succeed(config);
    renderLoginPage();

    submitLogin();

    expect(await screen.findByText('Protected dashboard')).toBeInTheDocument();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)).toBe('access-1');
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken)).toBe('refresh-1');
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.user)).toContain('johndoe');
  });
});
