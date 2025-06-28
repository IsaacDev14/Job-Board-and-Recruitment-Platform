// src/context/AuthContextObject.ts
import { createContext } from 'react';
import type { User, BackendUser } from '../types/job'; // Ensure these paths are correct

/**
 * Defines the shape of the authentication context.
 * This interface outlines the data and functions available to components
 * that consume the AuthContext.
 */
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /**
   * Logs in a user, setting their data and token in the context and local storage.
   * @param backendUserData The raw user data received directly from the backend API.
   * @param userToken The JWT access token received from the backend.
   */
  login: (backendUserData: BackendUser, userToken: string) => void;
  /**
   * Logs out the current user, clearing their data and token from the context and local storage.
   */
  logout: () => void;
  /**
   * Updates the current user's data in the context. Useful for profile updates.
   * @param newUser The updated user object.
   */
  setUser: (newUser: User | null) => void;
}

/**
 * The React Context object for authentication.
 * Components will use `useContext(AuthContext)` to access the authentication state.
 * It's initialized with `undefined` and the `useAuth` hook will throw an error
 * if it's not used within an `AuthProvider`.
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
