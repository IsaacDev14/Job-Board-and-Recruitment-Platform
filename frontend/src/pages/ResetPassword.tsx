// src/pages/ResetPassword.tsx
import React, { useState, useEffect } from 'react';
// Assuming onNavigate is passed from App.tsx for navigation
// For a real app, you'd import your API utility (e.g., api from '../api/api')
// import api from '../api/api';

interface ResetPasswordProps {
  onNavigate: (page: string) => void;
  // In a real app, this would take a token from URL params, e.g., token?: string;
  // For now, we'll simulate token validation.
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ onNavigate }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true); // Simulate token validation

  // In a real application, you would parse the token from the URL (e.g., using a routing library)
  // and validate it with your backend here.
  useEffect(() => {
    // Simulate token validation check (e.g., on component mount)
    // For json-server, this is purely illustrative.
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');

    if (!tokenFromUrl || tokenFromUrl.length < 10) { // Basic mock check for token presence/length
      setIsValidToken(false);
      setError("Invalid or missing password reset token. Please check your link or request a new one.");
    } else {
      setIsValidToken(true);
      // In a real app, you'd likely make an API call here to validate the token
      // e.g., api.get(`/auth/validate-reset-token?token=${tokenFromUrl}`)
      // .then(res => setIsValidToken(res.data.valid))
      // .catch(err => { setIsValidToken(false); setError(err.response?.data?.message || "Invalid token."); });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!isValidToken) {
      setError("Cannot reset password: Invalid token.");
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
      }

      setIsLoading(true);

      try {
          // In a real application, you would make an API call here:
          // const response = await api.post('/auth/reset-password', {
          //   token: new URLSearchParams(window.location.search).get('token'),
          //   newPassword: newPassword
          // });

          // Simulate API call delay and success/failure for demonstration
          await new Promise(resolve => setTimeout(() => resolve(null), Math.random() * 1000 + 500));

          // Simulate a successful response
          setMessage('Your password has been reset successfully. You can now log in with your new password.');
          setNewPassword('');
          setConfirmPassword('');

          // After successful reset, typically navigate to login page
          setTimeout(() => {
              onNavigate('login');
          }, 2000); // Redirect to login after 2 seconds

      } catch (err) {
          // Handle real API errors here
          // const apiErrorMessage = err.response?.data?.message || 'Failed to reset password. Please try again.';
          // setError(apiErrorMessage);
          setError('Failed to reset password. Please try again. (Simulated Error)'); // Simulated error
          console.error("Password reset failed:", err);
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Set Your New Password
          </h2>
          {!isValidToken && (
            <p className="mt-2 text-center text-red-600 text-sm">
              {error || "Please check your reset link. It might be invalid or expired."}
            </p>
          )}
        </div>

        {isValidToken ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="new-password" className="sr-only">
                  New Password
                </label>
                <input
                  id="new-password"
                  name="new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="New Password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="mt-4">
                <label htmlFor="confirm-password" className="sr-only">
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 text-center">
            <button
              onClick={() => onNavigate('forgot-password')}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Request a new reset link
            </button>
          </div>
        )}
        <div className="text-sm text-center mt-4">
          <button
            onClick={() => onNavigate('login')}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;