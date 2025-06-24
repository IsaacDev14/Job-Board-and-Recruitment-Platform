import React, { useState } from 'react';

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

  // Handle input changes
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

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }

    console.log('Logging in with:', formData);
    setError(null);
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

        {/* Email */}
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

        {/* Password */}
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

        {/* Forgot password & Register link */}
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
