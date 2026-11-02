/** Authenticated user as returned by the backend. Extra backend fields are preserved. */
export type User = {
  id: number;
  username: string;
  email: string;
  [key: string]: unknown;
};

/** Every backend response is wrapped in this envelope. */
export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  error?: unknown;
};

/** `data` payload of `POST /authentication/login`. */
export type LoginResponseData = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
};

/** `data` payload of `POST /authentication/refresh`. */
export type RefreshResponseData = {
  access_token: string;
  refresh_token?: string;
};
