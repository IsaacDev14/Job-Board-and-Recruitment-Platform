// src/context/AuthProvider.tsx
import React, { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react'; // CORRECTED: type-only import for ReactNode
import api from '../api/api'; // Your API client instance
// Import AuthContext (value) and type AuthContextType (type) from the dedicated object file
import { AuthContext } from './AuthContextObject';
import type { AuthContextType } from './AuthContextObject'; // CORRECTED: type-only import for AuthContextType
import type { User, BackendUser } from '../types/job'; // Import specific types

/**
 * The AuthProvider component manages the authentication state for the application.
 * It provides the authentication context to all its children components.
 * @param children ReactNode - The child components that will have access to the auth context.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Transforms raw user data received from the backend into the frontend's `User` type.
   * This is where `is_recruiter` boolean is mapped to the `role` string.
   * Wrapped in `useCallback` for stability.
   * @param backendUser The user data object directly from the backend API.
   * @returns A `User` object formatted for the frontend.
   */
  const transformBackendUser = useCallback((backendUser: BackendUser): User => {
    const role: User['role'] = backendUser.is_recruiter ? 'recruiter' : 'job_seeker';
    // Extend logic here if you have other roles like 'admin' from the backend
    // e.g., if (backendUser.is_admin) return 'admin';

    return {
      id: backendUser.id,
      username: backendUser.username,
      email: backendUser.email,
      is_recruiter: backendUser.is_recruiter, // Keep this if frontend needs the raw flag
      role: role, // The derived role string
      company_id: backendUser.company_id || null, // Ensure null if undefined
    };
  }, []); // Empty dependency array as it only depends on its inputs

  /**
   * Logs out the user by clearing local storage, state, and API authorization header.
   * Wrapped in `useCallback` for stability across renders.
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setToken(null);
    setIsAuthenticated(false);
    delete api.defaults.headers.common['Authorization']; // Clear Axios default header
    console.log("AuthContext: User logged out.");
  }, []); // No dependencies, so this function's reference is stable

  /**
   * Effect hook to load user authentication data from local storage or backend on component mount.
   * It attempts to re-authenticate the user using a stored token.
   * Dependencies are `logout` and `transformBackendUser` (both stable `useCallback` functions).
   */
  useEffect(() => {
    const loadUserFromBackendOrStorage = async () => {
      setIsLoading(true);
      try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          // Fetch current user data from the backend to validate token and get fresh data
          const response = await api.get<BackendUser>('/current_user');
          const backendUserData = response.data;

          const transformedUser = transformBackendUser(backendUserData);
          setCurrentUser(transformedUser);
          setToken(storedToken);
          setIsAuthenticated(true);
          console.log("AuthContext: User loaded and transformed from backend/token:", transformedUser);
        } else {
          // No token found, ensure all states are reset
          setCurrentUser(null);
          setToken(null);
          setIsAuthenticated(false);
          localStorage.removeItem('token'); // Just in case there was a stale, empty token
        }
      } catch (error) {
        console.error("AuthContext: Failed to load user or validate token:", error);
        // If API call fails (e.g., token expired, network error), force logout
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromBackendOrStorage();
  }, [logout, transformBackendUser]); // Dependencies: logout and transformBackendUser are stable callbacks

  /**
   * Logs in a user, setting their data and token in the context and local storage.
   * This function is called by login forms.
   * Wrapped in `useCallback` for stability.
   * @param backendUserData The raw user data from the login API response.
   * @param userToken The access token from the login API response.
   */
  const login = useCallback((backendUserData: BackendUser, userToken: string) => {
    const transformedUser = transformBackendUser(backendUserData);
    localStorage.setItem('token', userToken); // Store the token

    setCurrentUser(transformedUser);
    setToken(userToken);
    setIsAuthenticated(true);
    api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`; // Set Axios header
    console.log("AuthContext: User logged in and transformed:", transformedUser);
  }, [transformBackendUser]); // Dependency: transformBackendUser is a stable callback

  /**
   * Internal function to directly set the current user state.
   * Exposed via the context as `setUser` for components like Profile to update user details.
   * Wrapped in `useCallback` for stability.
   * @param newUser The new user object to set.
   */
  const internalSetUser = useCallback((newUser: User | null) => {
    setCurrentUser(newUser);
    if (newUser === null) {
      localStorage.removeItem('token'); // Clear token if user is explicitly set to null
      setIsAuthenticated(false);
    }
    // Note: If you update user data via API (e.g., profile update),
    // you might want to also update the `user` item in localStorage if you store it,
    // but relying on /current_user on load is generally more robust.
  }, []); // No dependencies, so this function's reference is stable

  // The value provided to consumers of this context
  const contextValue: AuthContextType = {
    user: currentUser,
    token: token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setUser: internalSetUser // Expose the internal setter via the public name `setUser`
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
