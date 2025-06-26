// src/pages/ForgotPassword.tsx
import React, { useState } from 'react';

interface ForgotPasswordProps {
  onNavigate: (page: string) => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    // --- Start Simulated Backend Interaction for Password Reset ---
    console.log(`Simulating password reset request for email: ${email}`);

    // Fix 1: Wrap resolve in an arrow function for setTimeout's first argument
    await new Promise(resolve => setTimeout(() => resolve(null), Math.random() * 1000 + 500)); // Delay between 0.5s and 1.5s

    // Simulate different responses based on email (for demo purposes)
    if (email.includes('@example.com')) {
      setMessage('If an account with that email exists, a password reset link has been sent to your inbox.');
      setEmail('');
    } else {
      setMessage('If an account with that email exists, a password reset link has been sent to your inbox.');
    }
    // --- End Simulated Backend Interaction ---

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot Your Password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address below and we'll send you a link to reset your password.
          </p>
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
                // Fix 2 & 3: Removed 'rounded-none' as 'rounded-md' is desired
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {message && (
            <div className="text-sm text-green-600 text-center p-2 bg-green-50 rounded-md">
              {message}
            </div>
          )}
          {error && (
            <div className="text-sm text-red-600 text-center p-2 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <button
            onClick={() => onNavigate('login')}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Remembered your password? Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
