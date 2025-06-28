// src/pages/Register.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/api';
import type { User } from '../types/job'; // Assuming User type is defined here or in a shared types file
import axios, { AxiosError } from 'axios'; // Import AxiosError

// Type guard to check if an error is an AxiosError
function isAxiosError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}

interface RegisterProps {
  onNavigate: (page: string) => void;
}

const Register: React.FC<RegisterProps> = ({ onNavigate }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'job_seeker' | 'recruiter'>('job_seeker');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post<User>('/auth/register', {
        username,
        email,
        password,
        is_recruiter: role === 'recruiter', // Send boolean to backend
      });

      const registeredUser = response.data;
      const dummyToken = `dummy-jwt-${registeredUser.id}-${Date.now()}`;
      login(registeredUser, dummyToken); // Log in the user immediately

      // For recruiters, attempt to create a default company entry
      if (role === 'recruiter') {
        try {
          // No need to get lastCompanyId or generate newCompanyId, backend handles IDs
          const companyPayload = {
            name: `${username} Co.`, // Default name for the company
            description: `Default company profile for recruiter ${username}.`,
            industry: 'Unspecified',
            website: `http://${username.toLowerCase().replace(/\s/g, '')}co.com`,
            contact_email: `${username.toLowerCase()}@${username.toLowerCase().replace(/\s/g, '')}co.com`,
            owner_id: registeredUser.id, // CRITICAL: Link company to the newly registered recruiter
          };
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
          // Do not prevent navigation, as user registration itself was successful
        }
      }

      onNavigate('dashboard'); // Navigate to dashboard after successful registration (and optional company creation)

    } catch (err: unknown) { // Use 'unknown' for initial catch
      let errorMessage = "Failed to register. Please try again.";
      console.error("Registration error:", err); // Log the full error for debugging

      if (isAxiosError(err)) {
        if (err.response && err.response.data && typeof err.response.data === 'object') {
          const responseData = err.response.data as { message?: string };
          if (responseData.message && typeof responseData.message === 'string') {
            errorMessage = responseData.message; // Use the specific backend message
          } else {
            errorMessage = `Failed to register: ${err.message || 'Server responded with unexpected data.'}`;
          }
        } else {
          errorMessage = `Failed to register: ${err.message || 'Network error or server unreachable.'}`;
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