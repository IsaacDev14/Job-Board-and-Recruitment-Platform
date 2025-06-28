// src/pages/RecruiterDashboard.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/api';
import type { Job } from '../types/job'; // Removed unused 'Company' import
import EditJobModal from '../components/EditJobModal';
import DeleteJobModal from '../components/DeleteJobModal';
import NotificationToast from '../components/NotificationToast';

// Import React Icons
import {
  FaBriefcase,
  FaPlusCircle,
  FaMapMarkerAlt,
  FaDollarSign,
  FaEdit,
  FaTrash,
  FaTimes,
  FaTimesCircle,
} from 'react-icons/fa';

interface RecruiterDashboardProps {
  onNavigate: (page: string, jobId?: number) => void;
}

const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ onNavigate }) => {
  const { user, isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true); // For initial data fetch
  const [actionLoading, setActionLoading] = useState(false); // For CRUD actions
  const [error, setError] = useState<string | null>(null);

  // State for Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentJobToManage, setCurrentJobToManage] = useState<Job | null>(null);

  // State for Notifications
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // useCallback to memoize the fetch function and prevent re-creation
  const fetchRecruiterData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotification(null); // Clear notifications on data fetch

    if (!isAuthenticated || !user || user.role !== 'recruiter') {
      setLoading(false);
      // The ProtectedRoute or App.tsx should handle this, but as a safeguard:
      setError('You are not authorized to view this page.');
      return;
    }

    if (!user.company_id) {
      setLoading(false);
      setError("Your company profile is not set. Please update your profile to associate with a company.");
      return;
    }

    try {
      // Fetch jobs specifically for the recruiter's company_id
      // _expand=company ensures that the company details are included with each job
      const jobsRes = await api.get<Job[]>(`/jobs?company_id=${user.company_id}&_expand=company`);
      setJobs(jobsRes.data);
    } catch (err) {
      console.error("Failed to fetch recruiter dashboard data:", err);
      setError('Failed to load your jobs. Please try again later.');
      setNotification({ message: 'Failed to load dashboard data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]); // Dependencies for useCallback

  useEffect(() => {
    fetchRecruiterData();
  }, [fetchRecruiterData]); // Now dependent on the memoized function


  // --- CRUD Handlers ---
  const handleEditClick = (job: Job) => {
    setCurrentJobToManage(job);
    setShowEditModal(true);
    setNotification(null); // Clear any old notifications
  };

  const handleDeleteClick = (job: Job) => {
    setCurrentJobToManage(job);
    setShowDeleteModal(true);
    setNotification(null); // Clear any old notifications
  };

  const handleUpdateJob = async (jobId: number, updatedData: Partial<Job>) => {
    if (!currentJobToManage) return;

    setActionLoading(true);
    try {
      const response = await api.patch<Job>(`/jobs/${jobId}`, updatedData); // Get the updated job back

      setJobs(jobs.map(job =>
        job.id === jobId ? { ...job, ...response.data } : job // Use response.data to ensure full update
      ));
      setShowEditModal(false);
      setCurrentJobToManage(null);
      setNotification({ message: 'Job updated successfully!', type: 'success' });
    } catch (err) {
      console.error("Failed to update job:", err);
      setNotification({ message: 'Failed to update job. Please try again.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    if (!currentJobToManage) return;

    setActionLoading(true);
    try {
      await api.delete(`/jobs/${jobId}`);

      setJobs(jobs.filter(job => job.id !== jobId));
      setShowDeleteModal(false);
      setCurrentJobToManage(null);
      setNotification({ message: 'Job deleted successfully!', type: 'success' });
    } catch (err) {
      console.error("Failed to delete job:", err);
      setNotification({ message: 'Failed to delete job. Please try again.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Loading your posted jobs...</p>
        </div>
      </div>
    );
  }

  // Ensure user is a recruiter and has a company_id
  if (!user || user.role !== 'recruiter' || !user.company_id) {
    return (
      <div className="text-center py-10 text-red-600">
        Access Denied: This dashboard is for recruiters only and requires an associated company.
        <button
            onClick={() => onNavigate('profile')}
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Update Profile
          </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
      <div className="px-6 py-8 sm:p-10">
        {/* Notification Area */}
        {notification && (
          <NotificationToast
            message={notification.message}
            type={notification.type}
            onDismiss={() => setNotification(null)}
          />
        )}

        {/* Main Content Area (Error messages here are critical, not toast) */}
        {error && (
          <div className="max-w-6xl mx-auto mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-between shadow-sm">
            <p className="flex items-center">
              <FaTimesCircle className="mr-3 text-red-500" />
              {error}
            </p>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
              <FaTimes />
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0 flex items-center">
            <FaBriefcase className="text-gray-600 mr-2" size={26} />
            Your Posted Jobs
          </h2>
          <button
            onClick={() => onNavigate('post-job')}
            className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ease-in-out"
          >
            <FaPlusCircle className="-ml-1 mr-2" size={18} aria-hidden="true" />
            Post a New Job
          </button>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg bg-gray-50">
            <FaBriefcase className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-lg text-gray-500 mb-3">You haven't posted any jobs yet.</p>
            <p className="text-md text-gray-400">Click the "Post a New Job" button above to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div
                key={job.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 relative hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 leading-snug sm:pr-4">{job.title}</h3>
                  <div className="flex items-center space-x-4 text-sm mt-2 sm:mt-0">
                    <span className="flex items-center text-gray-700">
                      <FaMapMarkerAlt className="w-4 h-4 mr-1 text-gray-500" />
                      {job.location}
                    </span>
                    <span className="flex items-center text-purple-700 font-semibold">
                      <FaDollarSign className="w-4 h-4 mr-1 text-purple-600" />
                      {job.salary_range}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 mt-3">
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap line-clamp-3">
                    {job.description}
                  </p>
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditClick(job); }}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 ease-in-out"
                      disabled={actionLoading} // Disable during any action
                    >
                      <FaEdit className="mr-2" /> Edit
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(job); }}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 ease-in-out"
                      disabled={actionLoading} // Disable during any action
                    >
                      <FaTrash className="mr-2" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Modals for Recruiters --- */}
      {showEditModal && currentJobToManage && (
        <EditJobModal
          job={currentJobToManage}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateJob}
          isLoading={actionLoading}
        />
      )}

      {showDeleteModal && currentJobToManage && (
        <DeleteJobModal
          job={currentJobToManage}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteJob}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default RecruiterDashboard;