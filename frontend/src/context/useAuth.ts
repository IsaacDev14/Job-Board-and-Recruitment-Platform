// src/context/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from './AuthContextObject'; // Import AuthContext object
import type { AuthContextType } from './AuthContextObject'; // CORRECTED: type-only import for AuthContextType

/**
 * Custom React Hook to access the authentication context.
 * This hook provides convenient access to the `AuthContextType` values (user, isAuthenticated, login, logout, etc.).
 * It ensures that the hook is always used within an `AuthProvider`.
 * @returns The authentication context value.
 * @throws Error if used outside of an `AuthProvider`.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
