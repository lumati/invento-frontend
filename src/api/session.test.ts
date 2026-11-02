// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { User } from '@/types';

import { AUTH_STORAGE_KEYS, clearSession, readSession, saveSession } from './session';

const user: User = { id: 1, username: 'johndoe', email: 'user@example.com' };

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe('auth session storage', () => {
  it('persists the session under the namespaced keys', () => {
    saveSession({ accessToken: 'access-1', refreshToken: 'refresh-1', user });

    expect(window.localStorage.getItem('invento.auth.accessToken')).toBe('access-1');
    expect(window.localStorage.getItem('invento.auth.refreshToken')).toBe('refresh-1');
    expect(JSON.parse(window.localStorage.getItem('invento.auth.user') ?? 'null')).toEqual(user);
    expect(AUTH_STORAGE_KEYS).toEqual({
      accessToken: 'invento.auth.accessToken',
      refreshToken: 'invento.auth.refreshToken',
      user: 'invento.auth.user',
    });
  });

  it('round-trips a saved session', () => {
    saveSession({ accessToken: 'access-2', refreshToken: 'refresh-2', user });

    expect(readSession()).toEqual({
      accessToken: 'access-2',
      refreshToken: 'refresh-2',
      user,
    });
  });

  it('returns an empty session when storage holds nothing', () => {
    expect(readSession()).toEqual({ accessToken: null, refreshToken: null, user: null });
  });

  it('ignores a corrupted persisted user while keeping the tokens', () => {
    window.localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, 'access-3');
    window.localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, 'refresh-3');
    window.localStorage.setItem(AUTH_STORAGE_KEYS.user, 'not-json');

    expect(readSession()).toEqual({
      accessToken: 'access-3',
      refreshToken: 'refresh-3',
      user: null,
    });
  });

  it('clears every persisted key', () => {
    saveSession({ accessToken: 'access-4', refreshToken: 'refresh-4', user });

    clearSession();

    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)).toBeNull();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken)).toBeNull();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEYS.user)).toBeNull();
    expect(readSession()).toEqual({ accessToken: null, refreshToken: null, user: null });
  });

  it('keeps working in memory when localStorage is disabled', () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('Storage is disabled', 'SecurityError');
      },
    });

    try {
      expect(() => saveSession({ accessToken: 'access-5', refreshToken: 'refresh-5', user })).not.toThrow();
      expect(readSession()).toEqual({
        accessToken: 'access-5',
        refreshToken: 'refresh-5',
        user,
      });
      expect(() => clearSession()).not.toThrow();
      expect(readSession()).toEqual({ accessToken: null, refreshToken: null, user: null });
    } finally {
      if (originalDescriptor === undefined) {
        Reflect.deleteProperty(window, 'localStorage');
      } else {
        Object.defineProperty(window, 'localStorage', originalDescriptor);
      }
    }
  });
});
