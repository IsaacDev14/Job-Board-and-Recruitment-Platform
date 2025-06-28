// src/pages/MyJobs.tsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import { useAuth } from '../context/useAuth';
import type { Job } from '../types/job';
import {
  Briefcase, MapPin, DollarSign, Building2, PlusCircle, Trash2, Pencil
} from 'lucide-react';
import NotificationToast from '../components/NotificationToast';
import EditJobModal from '../components/EditJobModal';   // Import EditJobModal
import DeleteJobModal from '../components/DeleteJobModal'; // Import DeleteJobModal

interface MyJobsProps {
  onNavigate: (page: string, jobId?: number) => void;
}

const MyJobs: React.FC<MyJobsProps> = ({ onNavigate }) => {
  const { user, isAuthenticated } = useAuth();
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // State for Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false); // Loading state for modal operations

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setNotification(null);

    console.log("MyJobs: --- Starting fetchJobs ---");
    console.log("MyJobs: isAuthenticated:", isAuthenticated);
    console.log("MyJobs: user object:", user);

    if (!isAuthenticated || !user || user.role !== 'recruiter') {
      console.error("MyJobs: Not authenticated or not a recruiter. Setting error state.");
      setError('You must be logged in as a recruiter to view this page.');
      setIsLoading(false);
      return;
    }

    const recruiterId = user.id;
    console.log("MyJobs: Determined recruiterId from user.id:", recruiterId);

    if (!recruiterId) {
      console.warn("MyJobs: Recruiter user ID is missing. Cannot fetch jobs.");
      setError('Your recruiter profile is incomplete. User ID is missing.');
      setIsLoading(false);
      setMyJobs([]);
      return;
    }

    try {
      const apiUrl = `/jobs?_expand=company&recruiter_id=${recruiterId}`;
      console.log(`MyJobs: Attempting API call to: ${apiUrl}`);
      const res = await api.get<Job[]>(apiUrl);
      setMyJobs(res.data);
      console.log("MyJobs: API call successful. Received data:", res.data);
      console.log("MyJobs: Jobs fetched successfully. Number of jobs:", res.data.length);
    } catch (err) {
      console.error("MyJobs: Failed to load your jobs:", err);
      setError('Failed to load your jobs. Please try again.');
      setNotification({ message: 'Failed to load jobs.', type: 'error' });
    } finally {
      setIsLoading(false);
      console.log("MyJobs: --- fetchJobs finished ---");
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // --- Modal Management Functions ---

  const handleEditClick = (job: Job) => {
    setSelectedJob(job);
    setShowEditModal(true);
  };

  const handleDeleteClick = (job: Job) => {
    setSelectedJob(job);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedJob(null);
    setIsModalLoading(false); // Reset modal loading state
  };

  const handleSaveEditedJob = useCallback(async (jobId: number, updatedData: Partial<Job>) => {
    setIsModalLoading(true);
    try {
      // Ensure salary is sent as 'salary' not 'salary_range' if your backend expects 'salary'
      // Adjust this based on your backend's Job model for updating
      const dataToSend = { ...updatedData, salary: updatedData.salary_range };
      delete dataToSend.salary_range; // Remove if backend expects 'salary'

      const res = await api.put<Job>(`/jobs/${jobId}`, dataToSend);
      setMyJobs(prevJobs =>
        prevJobs.map(job => (job.id === jobId ? res.data : job))
      );
      setNotification({ message: 'Job updated successfully!', type: 'success' });
      console.log("MyJobs: Job updated:", res.data);
      closeModals(); // Close modal on success
    } catch (err) {
      console.error("MyJobs: Failed to update job:", err);
      setNotification({ message: 'Failed to update job. Please try again.', type: 'error' });
    } finally {
      setIsModalLoading(false);
    }
  }, []);

  const handleConfirmDeleteJob = useCallback(async (jobId: number) => {
    setIsModalLoading(true);
    try {
      await api.delete(`/jobs/${jobId}`);
      setMyJobs(prev => prev.filter(j => j.id !== jobId));
      setNotification({ message: 'Job deleted successfully!', type: 'success' });
      console.log(`MyJobs: Job ID ${jobId} deleted successfully.`);
      closeModals(); // Close modal on success
    } catch (err) {
      console.error("MyJobs: Failed to delete the job:", err);
      setNotification({ message: 'Failed to delete the job. Please try again.', type: 'error' });
    } finally {
      setIsModalLoading(false);
    }
  }, []);

  // Loading state for initial fetch
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
          {(!isAuthenticated || !user || user.role !== 'recruiter' || !user.id) && (
            <button
              onClick={() => onNavigate('profile')}
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
                    onClick={() => handleEditClick(job)} // Open edit modal
                    className="px-4 py-2 rounded-md bg-yellow-400 hover:bg-yellow-500 text-white font-medium flex items-center gap-2 shadow"
                    disabled={isModalLoading}
                  >
                    <Pencil size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(job)} // Open delete modal
                    className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white font-medium flex items-center gap-2 shadow"
                    disabled={isModalLoading}
                  >
                    <Trash2 size={16} /> Delete
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

      {/* Edit Job Modal */}
      {showEditModal && selectedJob && (
        <EditJobModal
          job={selectedJob}
          onClose={closeModals}
          onSave={handleSaveEditedJob}
          isLoading={isModalLoading}
        />
      )}

      {/* Delete Job Modal */}
      {showDeleteModal && selectedJob && (
        <DeleteJobModal
          job={selectedJob}
          onClose={closeModals}
          onConfirm={handleConfirmDeleteJob}
          isLoading={isModalLoading}
        />
      )}
    </div>
  );
};

export default MyJobs;
