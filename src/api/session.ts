import type { User } from '@/types';

/** Namespaced `localStorage` keys owned by the auth session. */
export const AUTH_STORAGE_KEYS = {
  accessToken: 'invento.auth.accessToken',
  refreshToken: 'invento.auth.refreshToken',
  user: 'invento.auth.user',
} as const;

export type AuthSession = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
};

export const EMPTY_SESSION: AuthSession = {
  accessToken: null,
  refreshToken: null,
  user: null,
};

/**
 * Mirror kept in memory so the session still works when `localStorage`
 * is unavailable (private mode, storage disabled by policy, quota errors).
 */
let memorySession: AuthSession = EMPTY_SESSION;

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.username === 'string' &&
    typeof candidate.email === 'string'
  );
}

function parseUser(raw: string | null): User | null {
  if (raw === null) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return isUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeKey(storage: Storage, key: string, value: string | null): void {
  if (value === null) {
    storage.removeItem(key);
  } else {
    storage.setItem(key, value);
  }
}

/** Reads the persisted session, falling back to the in-memory mirror. */
export function readSession(): AuthSession {
  const storage = getStorage();
  if (storage === null) {
    return memorySession;
  }
  try {
    return {
      accessToken: storage.getItem(AUTH_STORAGE_KEYS.accessToken),
      refreshToken: storage.getItem(AUTH_STORAGE_KEYS.refreshToken),
      user: parseUser(storage.getItem(AUTH_STORAGE_KEYS.user)),
    };
  } catch {
    return memorySession;
  }
}

/** Persists the session and updates the in-memory mirror atomically. */
export function saveSession(session: AuthSession): void {
  memorySession = session;
  const storage = getStorage();
  if (storage === null) {
    return;
  }
  try {
    writeKey(storage, AUTH_STORAGE_KEYS.accessToken, session.accessToken);
    writeKey(storage, AUTH_STORAGE_KEYS.refreshToken, session.refreshToken);
    writeKey(storage, AUTH_STORAGE_KEYS.user, session.user === null ? null : JSON.stringify(session.user));
  } catch {
    // Storage can be full or denied; the in-memory copy keeps the session usable.
  }
}

/** Forgets the session (in memory and, when possible, in `localStorage`). */
export function clearSession(): void {
  memorySession = EMPTY_SESSION;
  const storage = getStorage();
  if (storage === null) {
    return;
  }
  try {
    writeKey(storage, AUTH_STORAGE_KEYS.accessToken, null);
    writeKey(storage, AUTH_STORAGE_KEYS.refreshToken, null);
    writeKey(storage, AUTH_STORAGE_KEYS.user, null);
  } catch {
    // Nothing else to clear.
  }
}
