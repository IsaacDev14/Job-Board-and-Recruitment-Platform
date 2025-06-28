// src/components/ProtectedRoute.tsx
import React from 'react';
import type { ReactNode } from 'react'; // Ensure ReactNode is imported as a type
import { useAuth } from '../context/useAuth'; // Correct import path for useAuth
import type { User } from '../types/job'; // Assuming User type is correct

interface ProtectedRouteProps {
  children: ReactNode;
  fallback: ReactNode;
  allowedRoles: User['role'][]; // Made required as per your provided code
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Debug log: Initial state of ProtectedRoute
  console.log(`ProtectedRoute: Initializing. isLoading: ${isLoading}, isAuthenticated: ${isAuthenticated}, User:`, user, `Allowed Roles:`, allowedRoles);

  if (isLoading) {
    console.log("ProtectedRoute: Auth is currently loading, displaying spinner.");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <p className="ml-3 text-lg text-gray-700">Loading authentication...</p>
      </div>
    );
  }

  // Check 1: Is user authenticated and does user object exist?
  if (!isAuthenticated || !user) {
    console.warn("ProtectedRoute: User not authenticated or user object is null/undefined. Rendering fallback.");
    return fallback; // Renders the Login page
  }

  // Debug log: User is authenticated, checking roles
  console.log(`ProtectedRoute: User authenticated. User role: '${user.role}'. Checking against allowed roles: [${allowedRoles.join(', ')}]`);

  // Check 2: Does the user's role match any of the allowed roles?
  if (!allowedRoles.includes(user.role)) {
    console.warn(`ProtectedRoute: Access Denied. User role '${user.role}' is not in allowed roles: [${allowedRoles.join(', ')}]. Displaying access denied message and rendering fallback.`);
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center text-red-600 text-lg p-6 bg-white border border-red-400 rounded-lg shadow-sm">
          Access Denied: You do not have the required role to view this page.
          <p className="mt-2 text-base text-gray-600">Your role: <span className="font-semibold">{user.role.replace('_', ' ').toUpperCase()}</span></p>
          {/* Explicitly render the fallback (Login page) here after the message */}
          {fallback}
        </div>
      </div>
    );
  }

  // If all checks pass, render the children (the protected component)
  console.log("ProtectedRoute: Access granted. Rendering children.");
  return <>{children}</>;
};

export default ProtectedRoute;
