// src/pages/Login.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/api';
import type { User } from '../types/job'; // Assuming User type is defined here or in a shared types file
import axios, { AxiosError } from 'axios'; // Import AxiosError

// Type guard to check if an error is an AxiosError
function isAxiosError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}

interface LoginProps {
  onNavigate: (page: string) => void;
}

const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Send login credentials in the request body
      const response = await api.post<User>('/auth/login', {
        username,
        password,
      });

      if (response.status === 200 && response.data) {
        const loggedInUser = response.data;
        const dummyToken = `dummy-jwt-${loggedInUser.id}-${Date.now()}`;
        login(loggedInUser, dummyToken);
        // Note: window.location.href = '/jobs' is a full page reload,
        // consider using onNavigate('jobs') if you have a client-side router
        window.location.href = '/jobs';
      } else {
        setError('Invalid username or password.');
      }
    } catch (err: unknown) { // Use 'unknown' for initial catch
      console.error("Login error:", err);
      let errorMessage = "Failed to log in. Please check your network or server status.";

      if (isAxiosError(err)) {
        if (err.response && err.response.data && typeof err.response.data === 'object') {
          const responseData = err.response.data as { message?: string };
          if (responseData.message && typeof responseData.message === 'string') {
            errorMessage = responseData.message;
          }
        }
      } else if (err instanceof Error) {
        errorMessage = `Login failed: ${err.message}`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          <button onClick={() => onNavigate('forgot-password')} className="font-medium text-blue-600 hover:text-blue-500">
            Forgot your password?
          </button>
        </p>
        <p className="mt-2 text-center text-gray-600">
          Don't have an account?{' '}
          <button onClick={() => onNavigate('register')} className="text-blue-600 hover:underline">
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;