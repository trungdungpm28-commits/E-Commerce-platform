import { createContext } from 'react';
import type { AuthUser } from '../types/api';

export interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (body: {
    firstName?: string;
    lastName?: string;
    phone: string;
    email: string;
    password: string;
  }) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
