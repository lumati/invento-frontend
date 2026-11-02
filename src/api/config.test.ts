import { afterEach, describe, expect, it, vi } from 'vitest';

import { API_BASE_URL, DEFAULT_API_BASE_URL } from './config';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('API configuration', () => {
  it('defaults to the local Laravel backend with the version prefix', () => {
    expect(DEFAULT_API_BASE_URL).toBe('http://127.0.0.1:8000/api/v1');
  });

  it('falls back to the default when VITE_API_URL is blank', async () => {
    vi.stubEnv('VITE_API_URL', '   ');
    vi.resetModules();
    const config = await import('./config');
    expect(config.API_BASE_URL).toBe(DEFAULT_API_BASE_URL);
  });

  it('uses VITE_API_URL and trims surrounding whitespace', async () => {
    vi.stubEnv('VITE_API_URL', ' https://api.example.test/api/v1 ');
    vi.resetModules();
    const config = await import('./config');
    expect(config.API_BASE_URL).toBe('https://api.example.test/api/v1');
  });

  it('exposes the same base URL used by the API client', () => {
    expect(API_BASE_URL.endsWith('/api/v1')).toBe(true);
  });
});
