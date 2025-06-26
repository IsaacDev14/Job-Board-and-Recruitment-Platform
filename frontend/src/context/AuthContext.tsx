// src/context/AuthContext.tsx
import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/job';
// Corrected: Added 'type' keyword for AuthContextType import
import { AuthContext, type AuthContextType } from './AuthContextObject';

// AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // This internal setUser function is what the context will provide
  const setUser = (newUser: User | null) => {
    setCurrentUser(newUser);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setCurrentUser(null);
      setToken(null);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    const loadUserFromLocalStorage = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
          const parsedUser: User = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
          setToken(storedToken);
          setIsAuthenticated(true);
        } else {
          setCurrentUser(null);
          setToken(null);
          setIsAuthenticated(false);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error("Failed to load user from localStorage:", error);
        setCurrentUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromLocalStorage();
  }, []);

  const login = (userData: User, userToken: string) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
    setCurrentUser(userData);
    setToken(userToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  // The value provided to consumers of this context
  const contextValue: AuthContextType = {
    user: currentUser,
    token: token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
