// src/context/AuthContextObject.ts
import { createContext } from 'react';
import type { User } from '../types/job';

// Define the shape of your authentication context
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

// Create the AuthContext
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
