import axios, { isAxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

import type { ApiEnvelope, RefreshResponseData } from '@/types';

import { API_BASE_URL } from './config';
import { ApiError } from './errors';
import { clearSession, readSession, saveSession } from './session';

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/**
 * Endpoints that answer authentication state themselves: a 401 here is a real
 * answer, not an expired session, so the refresh flow must not run for them.
 */
const AUTH_ENDPOINTS = ['/authentication/login', '/authentication/refresh', '/authentication/logout'];

/** Application client: carries the access token and the refresh retry. */
export const apiClient: AxiosInstance = axios.create({ baseURL: API_BASE_URL });

/** Bare client used for the refresh call, so it never triggers itself again. */
export const refreshClient: AxiosInstance = axios.create({ baseURL: API_BASE_URL });

type SessionExpiredHandler = () => void;

let sessionExpiredHandler: SessionExpiredHandler | null = null;

/**
 * Lets the auth store clear React state when a refresh failure expires the
 * session. Without a handler the client falls back to a window-level redirect.
 */
export function setSessionExpiredHandler(handler: SessionExpiredHandler | null): void {
  sessionExpiredHandler = handler;
}

function notifySessionExpired(): void {
  if (sessionExpiredHandler !== null) {
    sessionExpiredHandler();
    return;
  }
  if (typeof window !== 'undefined') {
    window.location.assign('/login');
  }
}

function isAuthEndpoint(url: string | undefined): boolean {
  if (url === undefined) {
    return false;
  }
  return AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

async function performRefresh(): Promise<string> {
  const { refreshToken } = readSession();
  if (refreshToken === null) {
    throw new ApiError('No refresh token stored', 401);
  }

  const response = await refreshClient.post<ApiEnvelope<RefreshResponseData>>('/authentication/refresh', {
    refresh_token: refreshToken,
  });
  const envelope = response.data;
  if (envelope.success !== true || typeof envelope.data?.access_token !== 'string') {
    throw new ApiError(envelope.message || 'Unable to refresh the session', response.status);
  }

  saveSession({
    accessToken: envelope.data.access_token,
    refreshToken: envelope.data.refresh_token ?? refreshToken,
    user: readSession().user,
  });
  return envelope.data.access_token;
}

let refreshPromise: Promise<string> | null = null;

/** Single-flight refresh: concurrent 401s share one refresh request. */
function refreshAccessToken(): Promise<string> {
  if (refreshPromise === null) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

apiClient.interceptors.request.use((config) => {
  const { accessToken } = readSession();
  if (accessToken !== null) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return config;
});

apiClient.interceptors.response.use(undefined, async (error: unknown) => {
  if (!isAxiosError(error)) {
    throw error;
  }

  const config = error.config as RetriableRequestConfig | undefined;
  if (
    error.response?.status !== 401 ||
    config === undefined ||
    config._retry === true ||
    isAuthEndpoint(config.url)
  ) {
    throw error;
  }

  config._retry = true;
  try {
    await refreshAccessToken();
  } catch {
    clearSession();
    notifySessionExpired();
    throw error;
  }

  // Retried exactly once: the `_retry` flag above keeps a second 401 from looping.
  return apiClient.request(config);
});
