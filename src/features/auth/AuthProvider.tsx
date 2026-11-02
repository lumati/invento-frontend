import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { loginRequest, logoutRequest } from '@/api/auth';
import { setSessionExpiredHandler } from '@/api/client';
import { clearSession, EMPTY_SESSION, readSession, saveSession, type AuthSession } from '@/api/session';
import type { User } from '@/types';

export type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export type AuthProviderProps = {
  children: ReactNode;
};

/**
 * Shared auth session store backed by `localStorage`.
 *
 * When a refresh failure expires the session, the API client calls back into
 * this provider so the protected routes react (and redirect) immediately.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession>(() => readSession());

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setSession(EMPTY_SESSION);
    });
    return () => {
      setSessionExpiredHandler(null);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginRequest({ email, password });
    const nextSession: AuthSession = {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    };
    // Persist and publish together so storage and UI never disagree.
    saveSession(nextSession);
    setSession(nextSession);
  }, []);

  const logout = useCallback(async () => {
    const { refreshToken } = readSession();
    try {
      if (refreshToken !== null) {
        await logoutRequest(refreshToken);
      }
    } catch {
      // Network failures must not keep the user signed in locally.
    }
    clearSession();
    setSession(EMPTY_SESSION);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session.user,
      isAuthenticated: session.accessToken !== null && session.user !== null,
      login,
      logout,
    }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Reads the auth session; throws outside `AuthProvider`. */
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (value === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return value;
}
