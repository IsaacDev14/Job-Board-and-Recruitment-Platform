// src/pages/MyJobs.tsx
import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../hooks/useAuth';
import type { Job } from '../types/job';
import { FaBuilding, FaMapMarkerAlt, FaDollarSign, FaBriefcase, FaEdit, FaTrash } from 'react-icons/fa';

interface MyJobsProps {
  onNavigate: (page: string, jobId?: number) => void;
}

const MyJobs: React.FC<MyJobsProps> = ({ onNavigate }) => {
  const { user, isAuthenticated } = useAuth();
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyJobs = async () => {
      if (!isAuthenticated || !user || user.role !== 'recruiter' || !user.id) {
        setError('You must be logged in as a Recruiter to view and manage your posted jobs.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        console.log('MyJobs.tsx: Fetching jobs for user:', user); // Debug log: Check user object
        console.log('MyJobs.tsx: User company_id:', user.company_id); // Debug log: Check recruiter's company_id

        const allJobsResponse = await api.get<Job[]>('/jobs?_expand=company');
        console.log('MyJobs.tsx: Raw API response (all jobs):', allJobsResponse.data); // Debug log: See all jobs

        const recruiterJobs = allJobsResponse.data.filter(job => {
          const match = job.company_id === user.company_id;
          console.log(`MyJobs.tsx: Checking job ID ${job.id} (company_id: ${job.company_id}) against user company_id (${user.company_id}): ${match}`); // Debug log per job
          return match;
        });

        console.log('MyJobs.tsx: Filtered jobs for this recruiter:', recruiterJobs); // Debug log: See filtered jobs
        setMyJobs(recruiterJobs);
      } catch (err) {
        console.error("MyJobs.tsx: Failed to fetch my jobs:", err);
        setError("Failed to load your posted jobs. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyJobs();
  }, [isAuthenticated, user]);

  const handleDeleteJob = async (jobId: number) => {
    if (!window.confirm("Are you sure you want to delete this job listing?")) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/jobs/${jobId}`);
      setMyJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      setIsLoading(false);
    } catch (err) {
      console.error("MyJobs.tsx: Failed to delete job:", err);
      setError("Failed to delete job. Please try again.");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-20 text-gray-700">Loading your posted jobs...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-600">{error}</div>;
  }

  if (myJobs.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 text-lg mb-4">You haven't posted any jobs yet.</p>
        <button
          onClick={() => onNavigate('post-job')}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Post a New Job
        </button>
      </div>
    );
  }

  return (
    <section className="min-h-screen py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Your Posted Jobs</h2>
        <div className="space-y-6">
          {myJobs.map(job => (
            <div key={job.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center">
              {/* Removed the image display section */}
              <div className="flex-grow">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{job.title}</h3>
                <p className="text-gray-700 text-sm mb-2 flex items-center">
                  <FaBuilding className="text-gray-500 mr-2" />
                  {job.company?.name || 'Company Not Found'}
                </p>
                <p className="text-gray-600 text-sm mb-2 flex items-center">
                  <FaMapMarkerAlt className="text-gray-500 mr-2" />
                  {job.location}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center mr-3">
                    <FaDollarSign className="text-gray-500 mr-1" /> {job.salary_range}
                  </span>
                  <span className="flex items-center">
                    <FaBriefcase className="text-gray-500 mr-1" /> {job.type || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-6 flex-shrink-0 flex space-x-2">
                <button
                  onClick={() => onNavigate('post-job', job.id)} // Reuse PostJob for editing
                  className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 transition-colors flex items-center"
                >
                  <FaEdit className="mr-2" /> Edit
                </button>
                <button
                  onClick={() => handleDeleteJob(job.id)}
                  className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center"
                >
                  <FaTrash className="mr-2" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MyJobs;
