// src/pages/Login.tsx

import React, { useState } from 'react';

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
const Login: React.FC = () => {
  // Local component state to handle form input values
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  // Local component state to handle error messages or success
  const [error, setError] = useState<string | null>(null);

  // Handle changes in form inputs
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

    // Very basic form validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }

    // Simulate login (in a real app, call your backend API here)
    console.log('Logging in with:', formData);
    setError(null); // Clear any previous error

    // Example response simulation
    alert(`Welcome back, ${formData.email}`);
  };

  return (
    <div className="py-20 text-center text-gray-700 min-h-[50vh] flex flex-col justify-center items-center">
      <h2 className="text-3xl font-bold mb-4">Login to Your Account</h2>
      <p className="text-lg mb-6">Enter your credentials to continue.</p>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-left"
      >
        {error && (
          <div className="mb-4 text-red-600 font-medium">{error}</div>
        )}

        {/* Email Field */}
        <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="email">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />

        {/* Password Field */}
        <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="password">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="********"
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors"
        >
          Login
        </button>

        {/* Forgot password link */}
        <button
          type="button"
          onClick={() => alert('Forgot Password feature coming soon!')}
          className="block text-blue-600 hover:underline mt-4 mx-auto"
        >
          Forgot Password?
        </button>
      </form>
    </div>
  );
};

export default Login;
