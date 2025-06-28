// src/pages/JobSeekerDashboard.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/useAuth';
import api from '../api/api';
import type { Application } from '../types/job';
import {
  UserCircle, Building, Briefcase, ListFilter, FileText, CheckCircle, Clock, XCircle, Search, TrendingUp
} from 'lucide-react';

interface JobSeekerDashboardProps {
  onNavigate: (page: string, jobId?: number) => void;
}

const JobSeekerDashboard: React.FC<JobSeekerDashboardProps> = ({ onNavigate }) => {
  const { user, isAuthenticated } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [applicationsError, setApplicationsError] = useState<string | null>(null);

  // Fetch applications for the job seeker
  // This useCallback now only depends on 'api' (which is stable)
  // and takes 'userId' as an explicit argument.
  const fetchApplications = useCallback(async (userId: number) => {
    setApplicationsLoading(true);
    setApplicationsError(null);
    try {
      // Fetch applications and expand job details
      const res = await api.get<Application[]>(`/applications?user_id=${userId}&_expand=job`);
      setApplications(res.data);
    } catch (err) {
      console.error("JobSeekerDashboard: Failed to fetch applications:", err);
      setApplicationsError('Failed to load your applications. Please try again.');
    } finally {
      setApplicationsLoading(false);
    }
  }, []); // Empty dependency array, as userId is passed as an argument

  useEffect(() => {
    // Only fetch applications if user is authenticated, is a job seeker,
    // and the user object (specifically its ID) is available and stable.
    if (isAuthenticated && user && user.role === 'job_seeker' && user.id !== undefined) {
      console.log(`JobSeekerDashboard useEffect: Authenticated user (${user.id}), fetching applications.`);
      fetchApplications(user.id); // Pass user.id directly
    } else {
      console.log("JobSeekerDashboard useEffect: Not authenticated or not job seeker, skipping fetch.");
      setApplicationsLoading(false); // Ensure loading state is false if not fetching
    }
  }, [isAuthenticated, user, fetchApplications]); // CORRECTED: Depend on 'user' object directly, and fetchApplications

  // Derived stats for applications
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const acceptedApplications = applications.filter(app => app.status === 'accepted').length;
  const rejectedApplications = applications.filter(app => app.status === 'rejected').length;

  // If user is authenticated but not a job seeker, redirect or show error (still relevant for role check)
  if (user && user.role !== 'job_seeker') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 text-center bg-white p-8 rounded-lg shadow-xl border border-red-200">
          <XCircle className="mx-auto text-red-500" size={60} />
          <h2 className="text-2xl font-bold text-red-800">Access Denied</h2>
          <p className="mt-2 text-md text-gray-600">
            This dashboard is for job seekers only. Your current role is: <span className="font-semibold capitalize">{user.role?.replace('_', ' ')}</span>.
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="mt-4 w-full flex justify-center items-center py-2 px-4 border border-transparent text-md font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ease-in-out"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // If user is null or not authenticated at this point, it means ProtectedRoute failed or is still loading.
  // We can return null or a simple loading indicator here, as ProtectedRoute's fallback should catch it.
  if (!user || !isAuthenticated) {
    return null; // ProtectedRoute should handle the fallback UI
  }

  return (
    <section className="min-h-screen py-16 px-4 bg-gray-50 flex flex-col items-center">
      <div className="max-w-6xl w-full bg-white rounded-xl shadow-lg p-8 space-y-8">
        <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Welcome to Your Job Seeker Dashboard, {user.username}!
        </h2>

        {/* Quick Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 text-center shadow-sm flex flex-col items-center">
            <Briefcase size={32} className="text-blue-600 mb-2" />
            <p className="text-sm text-gray-600">Total Applications</p>
            <p className="text-3xl font-bold text-gray-900">{totalApplications}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 text-center shadow-sm flex flex-col items-center">
            <Clock size={32} className="text-yellow-600 mb-2" />
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-3xl font-bold text-gray-900">{pendingApplications}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-5 text-center shadow-sm flex flex-col items-center">
            <CheckCircle size={32} className="text-green-600 mb-2" />
            <p className="text-sm text-gray-600">Accepted</p>
            <p className="text-3xl font-bold text-gray-900">{acceptedApplications}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-5 text-center shadow-sm flex flex-col items-center">
            <XCircle size={32} className="text-red-600 mb-2" />
            <p className="text-sm text-gray-600">Rejected</p>
            <p className="text-3xl font-bold text-gray-900">{rejectedApplications}</p>
          </div>
        </div>

        {/* Recent Applications Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold text-gray-800 flex items-center">
              <FileText size={24} className="mr-2 text-gray-600" /> Recent Applications
            </h3>
            <button
              onClick={() => onNavigate('applications')}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
            >
              View All Applications <ListFilter size={16} className="ml-1" />
            </button>
          </div>
          {applicationsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading recent applications...</p>
            </div>
          ) : applicationsError ? (
            <div className="text-center py-8 text-red-600">
              <XCircle size={32} className="mx-auto mb-2" />
              <p>{applicationsError}</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>You haven't submitted any applications recently.</p>
              <button
                onClick={() => onNavigate('jobs')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Search size={16} className="mr-2" /> Browse Jobs
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.slice(0, 3).map(app => ( // Show top 3 recent applications
                <div key={app.id} className="border border-gray-100 rounded-lg p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{app.job?.title || 'Unknown Job'}</h4>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Building size={14} /> {app.job?.company?.name || 'Unknown Company'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Applied on: {new Date(app.application_date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                      app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {app.status}
                    </span>
                    <button
                      onClick={() => onNavigate('job-details', app.job?.id)}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Job
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Completion / Recommendations Section (Placeholders) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-2xl font-semibold text-gray-800 flex items-center mb-4">
              <UserCircle size={24} className="mr-2 text-gray-600" /> Your Profile
            </h3>
            <p className="text-gray-700 mb-4">Keep your profile up-to-date to attract recruiters.</p>
            {/* Example: A simple progress bar or checklist */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-sm text-gray-600 mb-4">Profile completeness: 75%</p>
            <button
              onClick={() => onNavigate('profile')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <UserCircle size={16} className="mr-2" /> Update Profile
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-2xl font-semibold text-gray-800 flex items-center mb-4">
              <TrendingUp size={24} className="mr-2 text-gray-600" /> Job Recommendations
            </h3>
            <p className="text-gray-700 mb-4">Based on your skills and preferences.</p>
            <div className="text-center text-gray-500 py-4">
              <p>No recommendations yet. Start applying to get personalized suggestions!</p>
            </div>
            <button
              onClick={() => onNavigate('jobs')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Search size={16} className="mr-2" /> Explore All Jobs
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JobSeekerDashboard;
