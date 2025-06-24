// src/pages/Login.tsx

import React, { useState } from 'react';
// Import icons from react-icons (install with `npm install react-icons` or `yarn add react-icons`)
import { FaEnvelope, FaLock } from 'react-icons/fa';

interface LoginProps {
  onNavigate: (page: string) => void;
}

/**
 * Interface for the login form state
 */
interface LoginFormData {
  email: string;
  password: string;
}

/**
 * Login Page Component
 */
const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [error, setError] = useState<string | null>(null);

  // Handle input changes and update form state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }

    // Simulate login logic
    console.log('Logging in with:', formData);
    setError(null);
    alert(`Welcome back, ${formData.email}`);
  };

  return (
    <div className="py-20 text-gray-700 min-h-[50vh] flex flex-col justify-center items-center">
      {/* Page Title */}
      <h2 className="text-3xl font-bold mb-4 text-center">Login to Your Account</h2>
      <p className="text-lg mb-6 text-center">Enter your credentials to continue.</p>

      {/* Login Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-left"
      >
        {/* Display error message */}
        {error && (
          <div className="mb-4 text-red-600 font-medium">{error}</div>
        )}

        {/* Email input with icon */}
        <label
          className="block mb-2 text-sm font-medium text-gray-700"
          htmlFor="email"
        >
          Email
        </label>
        <div className="relative mb-4">
          <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full pl-10 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Password input with icon */}
        <label
          className="block mb-2 text-sm font-medium text-gray-700"
          htmlFor="password"
        >
          Password
        </label>
        <div className="relative mb-4">
          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="********"
            className="w-full pl-10 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors"
        >
          Login
        </button>

        {/* Forgot password & register links */}
        <div className="mt-4 text-center text-xs text-gray-600">
          <button
            type="button"
            onClick={() => alert('Forgot Password feature coming soon!')}
            className="text-blue-600 hover:underline mr-2"
          >
            Forgot Password?
          </button>
          | Don’t have an account?
          <button
            type="button"
            onClick={() => onNavigate('register')}
            className="text-blue-600 hover:underline ml-2"
          >
            Register here
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
