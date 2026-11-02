/** Backend API base URL used by every request, including the `/api/v1` prefix. */
export const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

function resolveApiBaseUrl(configured: string | undefined): string {
  const value = configured?.trim();
  return value !== undefined && value.length > 0 ? value : DEFAULT_API_BASE_URL;
}

/** Resolved from `VITE_API_URL`; see `.env.example`. */
export const API_BASE_URL: string = resolveApiBaseUrl(import.meta.env.VITE_API_URL);
