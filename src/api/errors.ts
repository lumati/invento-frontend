import { isAxiosError } from 'axios';

/** Error carrying a user-facing message coming from the backend envelope. */
export class ApiError extends Error {
  readonly status: number | undefined;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function envelopeMessage(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) {
    return null;
  }
  const message = (data as Record<string, unknown>).message;
  return typeof message === 'string' && message.trim().length > 0 ? message.trim() : null;
}

/**
 * Turns any failure into a message safe to show in the UI.
 * Backend envelope messages win; unknown failures use the fallback.
 */
export function resolveApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message.trim().length > 0 ? error.message : fallback;
  }
  if (isAxiosError(error)) {
    return envelopeMessage(error.response?.data) ?? fallback;
  }
  return fallback;
}
