// src/pages/Register.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/useAuth'; // Correct import path for useAuth
import api from '../api/api';
import type { LoginResponse } from '../types/job';
import axios, { AxiosError } from 'axios'; // Import axios itself

// Type guard to check if an error is an AxiosError (Good to keep this)
function isAxiosError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}

interface RegisterProps {
  onNavigate: (page: string, param?: number | string) => void; // Updated to match App.tsx's handleNavigate
}

const Register: React.FC<RegisterProps> = ({ onNavigate }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'job_seeker' | 'recruiter'>('job_seeker');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // New state for success message
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null); // Clear previous messages
    setLoading(true);

    try {
      // CORRECTED: Changed '/api/auth/register' to '/auth/register'
      // The baseURL in api.ts already handles '/api'
      const response = await api.post<LoginResponse>('/auth/register', {
        username,
        email,
        password,
        is_recruiter: role === 'recruiter', // Send boolean to backend
      });

      const { user: registeredBackendUser, access_token } = response.data;

      // Log in the user immediately in AuthContext
      // Note: For registration, you might choose to redirect to login page
      // without auto-logging in, but current flow logs in.
      login(registeredBackendUser, access_token);

      // For recruiters, attempt to create a default company entry
      if (role === 'recruiter') {
        try {
          const companyPayload = {
            name: `${username} Co.`, // Default name for the company
            description: `Default company profile for recruiter ${username}.`,
            industry: 'Unspecified',
            website: `http://${username.toLowerCase().replace(/\s/g, '')}co.com`,
            contact_email: `${username.toLowerCase()}@${username.toLowerCase().replace(/\s/g, '')}co.com`,
            owner_id: registeredBackendUser.id, // CRITICAL: Link company to the newly registered recruiter
          };
          // Assuming /companies endpoint is directly under /api, so '/companies' is correct
          await api.post('/companies', companyPayload);
          console.log(`Default company "${companyPayload.name}" created for recruiter ${username}.`);
        } catch (companyErr: unknown) {
          console.error("Error creating default company for recruiter:", companyErr);
          let companyErrorMessage = "Failed to create default company.";
          if (isAxiosError(companyErr) && companyErr.response && companyErr.response.data && typeof companyErr.response.data === 'object') {
            const responseData = companyErr.response.data as { message?: string };
            if (responseData.message) {
              companyErrorMessage = `Failed to create default company: ${responseData.message}`;
            }
          }
          setError(`Registration successful, but ${companyErrorMessage} You may need to create it manually.`);
        }
      }

      setSuccessMessage('Registration successful! Redirecting to login...');
      // Redirect to login page after successful registration
      // Add a small delay to allow user to see the success message
      setTimeout(() => {
        onNavigate('login'); // Redirect to login after successful registration
      }, 1500); // 1.5 second delay

    } catch (err: unknown) {
      let errorMessage = "Failed to register. Please try again.";
      console.error("Registration error:", err);

      if (isAxiosError(err)) {
        if (err.response) {
          console.error("Register.tsx: Axios error response:", err.response); // Log Axios response
          if (err.response.data && typeof err.response.data === 'object') {
            const responseData = err.response.data as { message?: string };
            if (responseData.message && typeof responseData.message === 'string') {
              errorMessage = responseData.message;
            } else {
              errorMessage = `Failed to register: ${err.message || 'Server responded with unexpected data.'}`;
            }
          } else {
            errorMessage = `Failed to register: ${err.message || 'Network error or server unreachable.'}`;
          }
        }
      } else if (err instanceof Error) {
        errorMessage = `Failed to register: ${err.message}`;
      } else {
        errorMessage = "Failed to register. An unexpected error occurred.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">Register</h2>
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
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Register as:
            </label>
            <select
              id="role"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={role}
              onChange={(e) => setRole(e.target.value as 'job_seeker' | 'recruiter')}
            >
              <option value="job_seeker">Job Seeker</option>
              <option value="recruiter">Recruiter</option>
            </select>
          </div>
          {error && <p className="text-red-500 text-sm whitespace-pre-line">{error}</p>}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> {successMessage}</span>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <button onClick={() => onNavigate('login')} className="text-blue-600 hover:underline">
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
