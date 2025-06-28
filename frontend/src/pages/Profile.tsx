// src/pages/Profile.tsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import { useAuth } from '../hooks/useAuth';
import type { User, Company } from '../types/job';
import { FaUserCircle, FaEnvelope, FaBuilding } from 'react-icons/fa';
import NotificationToast from '../components/NotificationToast'; // Added NotificationToast

interface ProfileProps {
  onNavigate: (page: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, setUser } = useAuth();
  const [formData, setFormData] = useState<Partial<User>>({});
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchUserData = useCallback(async () => {
    if (!isAuthenticated || !user || !user.id) {
      setError("You must be logged in to view your profile.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    setNotification(null);

    try {
      // Fetch current user data from the backend
      const userResponse = await api.get<User>(`/users/${user.id}`);
      // Ensure role and company_id are set, as they are crucial for rendering
      setFormData({
        ...userResponse.data,
        company_id: userResponse.data.company_id || undefined // Ensure it's undefined if null/0
      });

      // If the user is a recruiter, fetch the list of companies
      if (userResponse.data.role === 'recruiter') {
        const companiesResponse = await api.get<Company[]>('/companies');
        setCompanies(companiesResponse.data);
      }

    } catch (err) {
      console.error("Failed to fetch user data:", err);
      setError("Failed to load profile data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]); // Dependencies ensure data refetches if auth state or user changes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Special handling for company_id to ensure it's a number or undefined/null
    if (name === 'company_id') {
      // Convert to number, or null if the value is empty string (e.g., "Select a Company" option)
      // json-server handles null for optional foreign keys well.
      setFormData(prev => ({ ...prev, [name]: value ? Number(value) : null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setNotification(null); // Clear previous notifications

    if (!user || !user.id) {
      setError("User not authenticated.");
      setIsSaving(false);
      return;
    }

    try {
      // Send only the updated formData fields to the backend
      const updatedUserRes = await api.patch<User>(`/users/${user.id}`, formData);

      // Update the user data in the AuthContext to reflect changes immediately across the app
      // Ensure the company_id is correctly set as a number or undefined/null in the context
      setUser({ ...updatedUserRes.data, company_id: updatedUserRes.data.company_id || undefined });
      setNotification({ message: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError('Failed to update profile. Please try again.');
      setNotification({ message: 'Failed to update profile.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Display loading state
  if (isLoading) {
    return (
      <section className="min-h-screen py-16 px-4 bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Loading profile...</p>
        </div>
      </section>
    );
  }

  // Display error state
  if (error) {
    return (
      <section className="min-h-screen py-16 px-4 bg-gray-50 flex justify-center items-center">
        <div className="text-center text-red-600 text-lg p-4 bg-red-100 border border-red-400 rounded-lg shadow-sm">
          {error}
          <button
            onClick={() => onNavigate('dashboard')} // Or 'login' depending on the error type
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </section>
    );
  }

  // Fallback if user somehow becomes null after loading
  if (!user) {
    return (
      <section className="min-h-screen py-16 px-4 bg-gray-50 flex justify-center items-center">
        <div className="text-center text-red-600 text-lg p-4 bg-red-100 border border-red-400 rounded-lg shadow-sm">
          User data not available. Please log in.
          <button
            onClick={() => onNavigate('login')}
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </section>
    );
  }

  // Main Profile Form UI
  return (
    <section className="min-h-screen py-16 px-4 bg-gray-50 flex justify-center items-start">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-8 space-y-6 border border-gray-100">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">Your Profile</h2>

        {/* Back to Dashboard button */}
        <div className="flex justify-start mb-6">
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-blue-600 hover:underline flex items-center transition-colors duration-200"
          >
            ← <span className="ml-2">Back to Dashboard</span>
          </button>
        </div>

        {notification && (
          <NotificationToast
            message={notification.message}
            type={notification.type}
            onDismiss={() => setNotification(null)}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center mb-8">
            <FaUserCircle className="text-blue-500 text-6xl mb-4" />
            <p className="text-2xl font-semibold text-gray-900">{formData.username}</p>
            <p className="text-lg text-gray-600">{formData.role?.replace('_', ' ').toUpperCase()}</p>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                <FaEnvelope />
              </span>
              <input
                type="email"
                name="email"
                id="email"
                className="flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-2.5"
                value={formData.email || ''}
                onChange={handleChange}
                required
                disabled={isSaving || isLoading}
              />
            </div>
          </div>

          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                <FaUserCircle />
              </span>
              <input
                type="text"
                name="username"
                id="username"
                className="flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-2.5"
                value={formData.username || ''}
                onChange={handleChange}
                required
                disabled={isSaving || isLoading}
              />
            </div>
          </div>

          {/* Company Selection (for Recruiters) */}
          {formData.role === 'recruiter' && (
            <div>
              <label htmlFor="company_id" className="block text-sm font-medium text-gray-700 mb-1">
                Associated Company
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  <FaBuilding />
                </span>
                <select
                  name="company_id"
                  id="company_id"
                  className="flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-2.5 bg-white"
                  value={formData.company_id || ''} // Use '' for select's default option
                  onChange={handleChange}
                  disabled={isSaving || isLoading}
                >
                  <option value="">Select a Company (Optional)</option> {/* Changed to Optional */}
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                (Your jobs will be associated with this company. If your company is not listed, you can request it be added by an admin.)
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSaving || isLoading}
              className="w-full py-2.5 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving Profile...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Profile;