// src/context/AuthContextDefinition.ts
import { createContext } from 'react';
import type { User } from '../types/job';

// Define the type for the context value
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

// Create and export the AuthContext
export const AuthContext = createContext<AuthContextType | undefined>(undefined);