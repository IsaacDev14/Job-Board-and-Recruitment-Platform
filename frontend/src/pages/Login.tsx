// src/pages/Login.tsx
import React, { useState, useEffect } from 'react'; // Import useEffect
import { useAuth } from '../context/useAuth'; // Correct import path for useAuth
import api from '../api/api';
import type { LoginResponse } from '../types/job';
import axios from 'axios'; // Import axios itself to use axios.isAxiosError

interface LoginProps {
  onNavigate: (page: string) => void;
}

const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login, isAuthenticated, user } = useAuth(); // Get isAuthenticated and user from context
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // useEffect to handle navigation AFTER authentication state updates
  useEffect(() => {
    console.log("Login.tsx useEffect: isAuthenticated changed to", isAuthenticated, "User:", user); // Debug log
    if (isAuthenticated && user) {
      console.log("Login.tsx useEffect: User is authenticated, navigating based on role."); // Debug log
      // Navigate based on role after successful authentication
      if (user.role === 'recruiter') {
        onNavigate('my-jobs'); // Recruiters go to their jobs list
      } else if (user.role === 'job_seeker') {
        onNavigate('dashboard'); // Job seekers go to their generic dashboard
      } else {
        onNavigate('home'); // Fallback for other roles or if role is unexpected
      }
    }
  }, [isAuthenticated, user, onNavigate]); // Dependencies: isAuthenticated, user, and onNavigate

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    console.log("Login.tsx: Attempting login for email:", email); // Debug log

    try {
      const response = await api.post<LoginResponse>('/auth/login', { email, password });
      const { access_token, user: backendUser } = response.data; // Renamed 'user' to 'backendUser' to avoid conflict

      console.log("Login.tsx: API call successful. Response data:", response.data); // Debug log

      // Call the login function from AuthContext, which updates the global state
      login(backendUser, access_token);
      console.log("Login.tsx: AuthContext login function called. Waiting for state update..."); // Debug log

      // Removed direct onNavigate call here. Navigation will be handled by useEffect.

    } catch (err: unknown) {
      let errorMessage = "Login failed. Please try again.";
      console.error('Login.tsx: Login failed:', err); // Detailed error log

      if (axios.isAxiosError(err)) {
        if (err.response) {
          console.error("Login.tsx: Axios error response:", err.response); // Log Axios response
          if (err.response.status === 401) {
            errorMessage = 'Invalid credentials. Please check your email and password.';
          } else if (err.response.data && typeof err.response.data === 'object' && (err.response.data as { message?: string }).message) {
            errorMessage = (err.response.data as { message?: string }).message!; // Use specific backend message
          } else {
            errorMessage = `Login failed: Server responded with status ${err.response.status}.`;
          }
        } else {
          errorMessage = `Login failed: Network error or server unreachable. (${err.message})`;
        }
      } else if (err instanceof Error) {
        errorMessage = `Login failed: ${err.message}`;
      } else {
        errorMessage = "Login failed. An unexpected error occurred.";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      console.log("Login.tsx: Login attempt finished. isLoading set to false."); // Debug log
    }
  };

  return (
    <section className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div className="text-center text-sm">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Login;
