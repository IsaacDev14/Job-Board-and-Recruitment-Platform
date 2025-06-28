// src/pages/MyJobs.tsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import { useAuth } from '../context/useAuth'; // Correct import path for useAuth
import type { Job } from '../types/job';
import {
  Briefcase, MapPin, DollarSign, Building2, PlusCircle, Trash2, Pencil
} from 'lucide-react';
import NotificationToast from '../components/NotificationToast'; // Added NotificationToast

interface MyJobsProps {
  onNavigate: (page: string, jobId?: number) => void;
}

const MyJobs: React.FC<MyJobsProps> = ({ onNavigate }) => {
  const { user, isAuthenticated } = useAuth();
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setNotification(null); // Clear previous notifications

    console.log("MyJobs: Attempting to fetch jobs...");
    console.log("MyJobs: isAuthenticated:", isAuthenticated);
    console.log("MyJobs: user:", user);

    if (!isAuthenticated || !user || user.role !== 'recruiter') {
      console.error("MyJobs: Not authenticated or not a recruiter. Rendering error message.");
      setError('You must be logged in as a recruiter to view this page.');
      setIsLoading(false);
      return;
    }

    // *** IMPORTANT CHANGE HERE ***
    // Fetch jobs based on recruiter_id (which is user.id) instead of company_id.
    // The Job model in your backend has a recruiter_id foreign key.
    const recruiterId = user.id;
    if (!recruiterId) {
      console.warn("MyJobs: Recruiter user ID is missing. Cannot fetch jobs.");
      setError('Your recruiter profile is incomplete. User ID is missing.');
      setIsLoading(false);
      setMyJobs([]); // Ensure no old jobs are displayed
      return;
    }

    try {
      console.log(`MyJobs: Fetching jobs for recruiter_id: ${recruiterId}`);
      // Use recruiter_id in the query. _expand=company is still useful to get company details.
      const res = await api.get<Job[]>(`/jobs?_expand=company&recruiter_id=${recruiterId}`);
      setMyJobs(res.data);
      console.log("MyJobs: Jobs fetched successfully:", res.data.length, "jobs.");
    } catch (err) {
      console.error("MyJobs: Failed to load your jobs:", err);
      setError('Failed to load your jobs. Please try again.');
      setNotification({ message: 'Failed to load jobs.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]); // Dependencies for useCallback

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]); // Dependent on the memoized fetchJobs function

  const handleDelete = async (id: number) => {
    // Replaced window.confirm with a console log as per instructions to avoid alert()
    console.log(`MyJobs: Confirming delete for job ID: ${id}. (In a real app, use a custom modal)`);
    // For now, proceed with delete directly for testing purposes.
    // In a production app, you would use a custom modal for confirmation.

    setIsDeleting(true);
    setNotification(null);
    try {
      await api.delete(`/jobs/${id}`);
      setMyJobs(prev => prev.filter(j => j.id !== id));
      setNotification({ message: 'Job deleted successfully!', type: 'success' });
      console.log(`MyJobs: Job ID ${id} deleted successfully.`);
    } catch (err) {
      console.error("MyJobs: Failed to delete the job:", err);
      setNotification({ message: 'Failed to delete the job. Please try again.', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <p className="ml-3 text-lg text-gray-700">Loading your jobs...</p>
      </div>
    );
  }

  // Error state (includes unauthorized access and missing user ID)
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-red-600 font-medium bg-white p-6 rounded-xl shadow-lg border text-center">
          {error}
          {/* Only show "Go to Profile / Login" button if the error is due to auth or missing recruiter ID */}
          {(!isAuthenticated || !user || user.role !== 'recruiter' || !user.id) && (
            <button
              onClick={() => onNavigate('profile')} // Suggest going to profile if user ID is missing or general auth issues
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Go to Profile / Login
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white px-4 pb-32 pt-2">
      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onDismiss={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">My Job Listings</h1>
          <p className="text-gray-500 mt-1">Manage and review all jobs posted by your company.</p>
        </div>
        <button
          onClick={() => onNavigate('post-job')}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-lg font-medium"
        >
          <PlusCircle size={18} /> Post New Job
        </button>
      </div>

      {/* Empty state */}
      {myJobs.length === 0 ? (
        <div className="text-center mt-32">
          <Briefcase className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">No jobs found</h2>
          <p className="text-gray-500 mb-6">You haven’t posted any jobs yet. Let’s fix that.</p>
          <button
            onClick={() => onNavigate('post-job')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition"
          >
            Post Your First Job
          </button>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto space-y-6">
          {myJobs.map(job => (
            <div
              key={job.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-6"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                {/* Job Details */}
                <div>
                  <h3 className="text-2xl font-semibold text-gray-800">{job.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    <Building2 size={14} /> {job.company?.name || 'Unknown Company'}
                  </p>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} /> {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign size={14} /> {job.salary_range}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase size={14} /> {job.type || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => onNavigate('post-job', job.id)} // Pass job.id for editing
                    className="px-4 py-2 rounded-md bg-yellow-400 hover:bg-yellow-500 text-white font-medium flex items-center gap-2 shadow"
                    disabled={isDeleting}
                  >
                    <Pencil size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white font-medium flex items-center gap-2 shadow"
                    disabled={isDeleting}
                  >
                    <Trash2 size={16} /> {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating CTA */}
      <button
        onClick={() => onNavigate('post-job')}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105"
        title="Post New Job"
      >
        <PlusCircle className="w-5 h-5" />
      </button>
    </div>
  );
};

export default MyJobs;
