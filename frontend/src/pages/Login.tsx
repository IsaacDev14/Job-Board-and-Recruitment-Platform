import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import api from '../api/api';
import type { BackendUser } from '../types/job';
import { LogIn, Mail, Lock } from 'lucide-react';
import axios from 'axios';

// Define props interface for Login component
interface LoginProps {
  onNavigate: (page: string, param?: number | string) => void;
}

// Define the Login component
const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  // Access login function and authentication status from AuthContext
  const { login, isAuthenticated } = useAuth();
  // State for form inputs and UI feedback
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effect to log changes in authentication status
  useEffect(() => {
    console.log(`Login.tsx useEffect: isAuthenticated changed to ${isAuthenticated}`);
    // Navigation is handled by App.tsx's useEffect
  }, [isAuthenticated]);

  // Handle form submission for login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    setSuccessMessage(null); // Clear previous success messages
    setIsSubmitting(true); // Disable form during submission

    try {
      console.log(`Login.tsx: Attempting login for email: ${email}`);
      // Make API call to authenticate user
      const res = await api.post<{ access_token: string; user: BackendUser }>('/auth/login', { email, password });
      console.log('Login.tsx: API call successful. Response data:', res.data);

      // Update AuthContext with user data and token
      login(res.data.user, res.data.access_token);
      console.log('Login.tsx: AuthContext login function called. State update pending...');

      // Set success message for user feedback
      setSuccessMessage('Login successful! Redirecting...');
      // Navigation is handled by App.tsx's useEffect, no manual navigation here

    } catch (err: unknown) {
      console.error('Login.tsx: Login failed:', err);
      let errorMessage = 'Login failed. Please check your credentials and try again.';

      // Handle Axios-specific errors
      if (axios.isAxiosError(err)) {
        if (err.response) {
          console.error('Login.tsx: Axios error response:', err.response);
          if (err.response.status === 401) {
            errorMessage = 'Invalid credentials. Please check your email and password.';
          } else if (err.response.data && typeof err.response.data === 'object' && (err.response.data as { message?: string }).message) {
            errorMessage = (err.response.data as { message: string }).message;
          } else {
            errorMessage = `Login failed: Server responded with status ${err.response.status}.`;
          }
        } else {
          errorMessage = `Login failed: Network error or server unreachable. (${err.message})`;
        }
      } else if (err instanceof Error) {
        errorMessage = `Login failed: ${err.message}`;
      } else {
        errorMessage = 'Login failed. An unexpected error occurred.';
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
      console.log('Login.tsx: Login attempt finished. isSubmitting set to false.');
    }
  };

  // Render the login form UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl border border-gray-200">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
            Welcome Back!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Display error message if present */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}
          {/* Display success message if present */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> {successMessage}</span>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Email input field */}
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            {/* Password input field */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Forgot password link */}
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          {/* Submit button */}
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ease-in-out"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </span>
              ) : (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <LogIn className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" aria-hidden="true" />
                  </span>
                  Sign in
                </>
              )}
            </button>
          </div>
        </form>
        {/* Register link */}
        <div className="text-center text-sm mt-4">
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;