// src/pages/Dashboard.tsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import JobSeekerDashboard from './JobSeekerDashboard';
import RecruiterDashboard from './RecruiterDashboard';

// Import React Icons for general loading/access denied (FaUserCircle)
import { FaUserCircle } from 'react-icons/fa';

interface DashboardProps {
  onNavigate: (page: string, jobId?: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 text-center bg-white p-8 rounded-lg shadow-xl border border-gray-200">
          <FaUserCircle className="mx-auto text-indigo-400" size={60} />
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-md text-gray-600">
            Please log in to view your personalized dashboard.
          </p>
          <button
            onClick={() => onNavigate('login')}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent text-md font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ease-in-out"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-gray-50 py-10 min-h-screen">
      <div className="max-w-6xl mx-auto"> {/* Changed max-w-7xl to max-w-6xl to match other content */}
        <div className="text-center mb-10 pb-6 border-b border-gray-100">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Welcome, {user.username}!
          </h1>
          <p className="text-md text-gray-600">
            {user.role === 'recruiter'
              ? 'Manage your posted job opportunities and connect with top talent.'
              : 'Review your job applications and track their progress.'}
          </p>
        </div>

        {user.role === 'recruiter' ? (
          <RecruiterDashboard onNavigate={onNavigate} />
        ) : (
          <JobSeekerDashboard onNavigate={onNavigate} />
        )}
      </div>
    </section>
  );
};

export default Dashboard;