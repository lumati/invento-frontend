import type { ApiEnvelope, LoginResponseData, User } from '@/types';

import { apiClient } from './client';
import { unwrapEnvelope } from './envelope';

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResult = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

const LOGIN_FALLBACK_MESSAGE = 'Unable to sign in. Please try again.';

/** `POST /authentication/login` — rejects with the backend message on failure. */
export async function loginRequest(credentials: LoginCredentials): Promise<LoginResult> {
  const response = await apiClient.post<ApiEnvelope<LoginResponseData>>('/authentication/login', credentials);
  const data = unwrapEnvelope(response.data, LOGIN_FALLBACK_MESSAGE);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    user: data.user,
  };
}

/** `POST /authentication/logout` — revokes the refresh token server-side. */
export async function logoutRequest(refreshToken: string): Promise<void> {
  await apiClient.post<ApiEnvelope<null>>('/authentication/logout', { refresh_token: refreshToken });
}
