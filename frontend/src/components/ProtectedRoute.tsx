// src/components/ProtectedRoute.tsx
import React from 'react';
import type { ReactNode } from 'react'; // ADDED 'type' keyword
import { useAuth } from '../hooks/useAuth';
import type { User } from '../types/job'; // ADDED 'type' keyword

interface ProtectedRouteProps {
  children: ReactNode;
  fallback: ReactNode;
  allowedRoles: User['role'][];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="text-center py-20 text-xl text-gray-700">Loading authentication...</div>;
  }

  if (!isAuthenticated || !user) {
    return fallback;
  }

  if (!allowedRoles.includes(user.role)) {
    return <div className="text-center py-20 text-xl text-red-600">Access Denied: You do not have the required role to view this page.</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;