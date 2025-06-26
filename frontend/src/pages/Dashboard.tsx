// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { FaUserCircle, FaBuilding, FaBriefcase, FaListAlt, FaPlusSquare, FaFileAlt } from 'react-icons/fa'; // Corrected FaRegUserCircle to FaUserCircle

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, isAuthenticated } = useAuth();
  const [loadingMessage, setLoadingMessage] = useState('Loading dashboard...');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        setLoadingMessage('Redirecting to login...');
      } else if (!user) {
        setLoadingMessage('User data not found. Please log in again.');
      } else {
        setLoadingMessage('');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user) {
    return <div className="text-center py-20 text-gray-700">{loadingMessage}</div>;
  }

  return (
    <section className="min-h-screen py-16 px-4 bg-gray-50 flex flex-col items-center">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg p-8 space-y-8">
        <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Welcome to Your Dashboard, {user.username}!
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* User Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex flex-col items-center text-center shadow-sm">
            <FaUserCircle className="text-blue-600 text-5xl mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Account Overview</h3>
            <p className="text-gray-700 text-lg mb-1">Role: <span className="font-medium capitalize">{user.role?.replace('_', ' ')}</span></p>
            <p className="text-gray-700 text-lg mb-1">Email: <span className="font-medium">{user.email}</span></p>
            {user.role === 'recruiter' && user.company_id !== undefined && ( // Check for undefined, not just truthy
                <p className="text-gray-700 text-lg flex items-center">
                    <FaBuilding className="mr-2" /> Company ID: <span className="font-medium">{user.company_id}</span>
                </p>
            )}
            <button
              onClick={() => onNavigate('profile')}
              className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <FaUserCircle className="mr-2" /> Edit Profile {/* Corrected icon usage */}
            </button>
          </div>

          {/* Role-specific Actions */}
          {user.role === 'recruiter' ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex flex-col items-center text-center shadow-sm">
              <FaBriefcase className="text-green-600 text-5xl mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Recruiter Actions</h3>
              <p className="text-gray-700 mb-4">Manage your job listings and applications.</p>
              <div className="space-y-3 w-full max-w-xs">
                <button
                  onClick={() => onNavigate('post-job')}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaPlusSquare className="mr-2" /> Post a New Job
                </button>
                <button
                  onClick={() => onNavigate('my-jobs')}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaListAlt className="mr-2" /> View My Posted Jobs
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 flex flex-col items-center text-center shadow-sm">
              <FaFileAlt className="text-purple-600 text-5xl mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Job Seeker Actions</h3>
              <p className="text-gray-700 mb-4">Track your applications and find new opportunities.</p>
              <div className="space-y-3 w-full max-w-xs">
                <button
                  onClick={() => onNavigate('applications')}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  <FaListAlt className="mr-2" /> View My Applications
                </button>
                <button
                  onClick={() => onNavigate('jobs')}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  <FaBriefcase className="mr-2" /> Browse All Jobs
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
