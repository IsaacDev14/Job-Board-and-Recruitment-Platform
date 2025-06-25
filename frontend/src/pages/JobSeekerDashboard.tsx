// src/pages/JobSeekerDashboard.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/api';
import type { Application } from '../types/job';

// Import React Icons
import {
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaMapMarkerAlt,
  FaDollarSign,
  FaSpinner, // Added FaSpinner for loading state, if not already imported elsewhere
} from 'react-icons/fa';

interface JobSeekerDashboardProps {
  onNavigate: (page: string, jobId?: number) => void;
}

const JobSeekerDashboard: React.FC<JobSeekerDashboardProps> = ({ onNavigate }) => {
  const { user, isAuthenticated } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // This is the state variable being flagged

  const fetchApplications = useCallback(async () => {
    // If auth state is not yet determined, or user is not a job seeker,
    // don't try to fetch applications. Set loading to false and return.
    if (!isAuthenticated || !user || user.role !== 'job_seeker') {
      setLoading(false);
      // Optional: Set a specific error message if not authenticated or not job seeker
      if (!isAuthenticated) {
        setError("You must be logged in to view your applications.");
      } else if (user && user.role !== 'job_seeker') {
        setError("Access Denied: This dashboard is for job seekers only.");
      }
      return;
    }

    setLoading(true);
    setError(null); // Clear any previous errors before fetching

    try {
      // Fetch applications and expand job details
      // Assuming your backend/json-server supports _expand=job
      const appsRes = await api.get<Application[]>(`/applications?user_id=${user.id}&_expand=job`);
      setApplications(appsRes.data);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      setError('Failed to load your applications. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]); // Dependencies for useCallback

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]); // Dependency for useEffect

  // Conditional rendering for various states
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto mb-4" />
          <p className="text-lg text-gray-700 font-medium">Loading your applications...</p>
        </div>
      </div>
    );
  }

  // Handle access denied if user is not authenticated or not a job seeker
  // (This check is also in fetchApplications, but good to have a direct render fallback)
  if (!user || user.role !== 'job_seeker') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 text-center bg-white p-8 rounded-lg shadow-xl border border-red-200">
          <FaTimesCircle className="mx-auto text-red-500" size={60} /> {/* Using FaTimesCircle for errors/denial */}
          <h2 className="text-2xl font-bold text-red-800">Access Denied</h2>
          <p className="mt-2 text-md text-gray-600">
            {error || "You must be logged in as a job seeker to view this page."}
          </p>
          <button
            onClick={() => onNavigate('login')}
            className="mt-4 w-full flex justify-center items-center py-2 px-4 border border-transparent text-md font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ease-in-out"
          >
            Login or Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-gray-50 py-10 min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
          <div className="px-6 py-8 sm:p-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FaFileAlt className="text-gray-600 mr-2" size={26} />
              Your Job Applications
            </h2>

            {/* THIS IS THE CRUCIAL ADDITION TO USE THE 'error' STATE */}
            {error && (
              <div className="text-center text-red-600 mb-6 p-4 bg-red-100 border border-red-400 rounded-lg shadow-sm">
                {error}
              </div>
            )}

            {applications.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                <FaFileAlt className="mx-auto text-gray-400 mb-4" size={64} />
                <p className="text-lg text-gray-500 mb-3">You haven't applied to any jobs yet.</p>
                <p className="text-md text-gray-400">Ready to find your next opportunity?</p>
                <button
                  onClick={() => onNavigate('jobs')}
                  className="mt-6 inline-flex items-center px-5 py-2.5 border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ease-in-out"
                >
                  <FaSearch className="-ml-1 mr-2" size={18} aria-hidden="true" />
                  Browse Jobs
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map(app => (
                  <div
                    key={app.id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 relative hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900 leading-snug sm:pr-4">
                        {app.job?.title || 'Job Title Not Found'}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm mt-2 sm:mt-0">
                        <span className="flex items-center text-gray-700">
                          <FaMapMarkerAlt className="w-4 h-4 mr-1 text-gray-500" />
                          {app.job?.location || 'Location Not Found'}
                        </span>
                        <span className="flex items-center text-purple-700 font-semibold">
                          <FaDollarSign className="w-4 h-4 mr-1 text-purple-600" />
                          {app.job?.salary_range || 'Salary Not Specified'}
                        </span>
                        <span className="flex items-center text-gray-500">
                          <FaClock className="w-4 h-4 mr-1 text-gray-500" />
                          {new Date(app.applied_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-3 mt-3">
                      <div className="flex items-center mb-3">
                        <span className="font-medium text-gray-700 text-sm mr-2">Status:</span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium gap-1
                            ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${app.status === 'accepted' ? 'bg-green-100 text-green-800' : ''}
                            ${app.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                          `}
                        >
                          {app.status === 'pending' && <FaClock className="w-3 h-3" />}
                          {app.status === 'accepted' && <FaCheckCircle className="w-3 h-3" />}
                          {app.status === 'rejected' && <FaTimesCircle className="w-3 h-3" />}
                          <span className="ml-1">{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span>
                        </span>
                      </div>

                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap line-clamp-3">
                        {app.job?.description || 'No description available.'}
                      </p>
                      <div className="mt-4 text-right">
                        <button
                          onClick={() => onNavigate('job-details', app.job?.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ease-in-out"
                        >
                          View Original Job Post
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default JobSeekerDashboard;