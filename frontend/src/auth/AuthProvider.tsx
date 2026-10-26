import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { signInRequest, signUpRequest } from '../api/authApi';
import {
  ACCESS_TOKEN_KEY,
  SESSION_EXPIRED_EVENT,
  getApiErrorMessage,
} from '../api/axiosClient';
import { getCurrentUser } from '../api/userApi';
import { AuthContext } from './AuthContext';
import type { AuthUser, SignUpRequest } from '../types/api';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (!token) {
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(getApiErrorMessage(requestError, 'Could not restore your session.'));
          if (!localStorage.getItem(ACCESS_TOKEN_KEY)) setUser(null);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const expireSession = () => {
      setUser(null);
      setError('Your session has expired. Please sign in again.');
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, expireSession);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, expireSession);
  }, []);

  const authenticate = useCallback(async (accessToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setError(null);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const result = await signInRequest({ email, password });
      await authenticate(result.access_token);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Unable to sign in. Please try again.');
      setError(message);
      throw new Error(message);
    }
  }, [authenticate]);

  const signUp = useCallback(async (body: Omit<SignUpRequest, 'role'>) => {
    setError(null);
    try {
      const result = await signUpRequest(body);
      await authenticate(result.access_token);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Unable to create your account. Please try again.');
      setError(message);
      throw new Error(message);
    }
  }, [authenticate]);

  const signOut = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    setUser(null);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, error, signIn, signUp, signOut }),
    [user, isLoading, error, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
