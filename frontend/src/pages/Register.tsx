// src/pages/Register.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/api';
import type { User } from '../types/job'; // ADDED 'type' keyword

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
  const { login } = useAuth(); // We can automatically log in after registration

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Check if username or email already exists
      const usernameExists = await api.get<User[]>(`/users?username=${username}`);
      if (usernameExists.data.length > 0) {
        setError('Username already taken.');
        setLoading(false);
        return;
      }

      const emailExists = await api.get<User[]>(`/users?email=${email}`);
      if (emailExists.data.length > 0) {
        setError('Email already registered.');
        setLoading(false);
        return;
      }

      // If unique, register the new user
      const newUser: Omit<User, 'id'> = { username, email, password, role };
      const response = await api.post<User>('/users', newUser);

      // For recruiters, also add a company entry
      if (role === 'recruiter') {
        // Find highest company ID and increment
        const companyRes = await api.get('/companies?_sort=id&_order=desc&_limit=1');
        const lastCompanyId = companyRes.data.length > 0 ? companyRes.data[0].id : 100; // Start from 100 if no companies
        const newCompanyId = lastCompanyId + 1;

        await api.post('/companies', { id: newCompanyId, name: `${username} Co.` });
      }

      // Automatically log in the new user
      const registeredUser = response.data;
      const dummyToken = `dummy-jwt-${registeredUser.id}-${Date.now()}`;
      login(registeredUser, dummyToken);

      onNavigate('dashboard'); // Redirect to dashboard after successful registration
    } catch (err) {
      console.error("Registration error:", err);
      setError('Failed to register. Please try again.');
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
          {error && <p className="text-red-500 text-sm">{error}</p>}
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