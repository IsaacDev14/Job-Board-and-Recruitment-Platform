// src/components/ProtectedRoute.tsx
import React from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { User } from '../types/job';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback: ReactNode;
  allowedRoles: User['role'][];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    // Render a simple loading indicator while authentication status is being determined
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <p className="ml-3 text-lg text-gray-700">Loading authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // If not authenticated or user object is missing, show fallback (e.g., login page)
    return fallback;
  }

  if (!allowedRoles.includes(user.role)) {
    // If authenticated but role is not allowed, show an access denied message
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center text-red-600 text-lg p-6 bg-white border border-red-400 rounded-lg shadow-sm">
          Access Denied: You do not have the required role to view this page.
          <p className="mt-2 text-base text-gray-600">Your role: <span className="font-semibold">{user.role.replace('_', ' ').toUpperCase()}</span></p>
        </div>
      </div>
    );
  }

  // If authenticated and role is allowed, render the children
  return <>{children}</>;
};

export default ProtectedRoute;