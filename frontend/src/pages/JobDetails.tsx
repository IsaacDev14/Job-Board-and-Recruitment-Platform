// src/pages/JobDetails.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/api';
import type { Job, Application } from '../types/job';

interface JobDetailsProps {
  jobId?: number;
  onNavigate?: (page: string) => void;
}

const JobDetails: React.FC<JobDetailsProps> = ({ jobId, onNavigate }) => {
  const { isAuthenticated, user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch job and check application status
  useEffect(() => {
    const fetchJobData = async () => {
      if (!jobId) {
        setError("No job ID provided.");
        setLoading(false);
        return;
      }

      try {
        const jobResponse = await api.get<Job>(`/jobs/${jobId}`);
        setJob(jobResponse.data);

        if (isAuthenticated && user?.role === 'job_seeker' && user?.id) {
          const appResponse = await api.get<Application[]>(
            `/applications?user_id=${user.id}&job_id=${jobId}`
          );
          setApplied(appResponse.data.length > 0);
        }
      } catch (err) {
        console.error("Error fetching job or applications:", err);
        setError("Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [jobId, isAuthenticated, user]);

  // Apply for job
  const handleApply = async () => {
    if (!user || user.role !== 'job_seeker') {
      setError("You must be logged in as a Job Seeker to apply.");
      return;
    }

    try {
      await api.post<Application>('/applications', {
        user_id: user.id,
        job_id: job?.id,
        status: 'pending',
        applied_at: new Date().toISOString(),
      });
      setApplied(true);
    } catch (err) {
      console.error("Error applying:", err);
      setError("Failed to apply for job.");
    }
  };

  if (loading) return <div className="text-center py-20">Loading job details...</div>;
  if (error) return <div className="text-center text-red-600 py-20">{error}</div>;
  if (!job) return <div className="text-center py-20">Job not found.</div>;

  return (
    <div className="min-h-screen py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8 space-y-6">
        {onNavigate && (
          <button
            onClick={() => onNavigate('jobs')}
            className="text-blue-600 hover:underline flex items-center"
          >
            ← <span className="ml-2">Back to listings</span>
          </button>
        )}

        <img
          src="https://placehold.co/800x400?text=Job+Details"
          className="w-full h-64 object-cover rounded-lg"
          alt="Job banner"
        />

        <h1 className="text-4xl font-bold">{job.title}</h1>
        <p className="text-lg text-gray-700">{job.company?.name || 'Company not available'}</p>
        <p className="text-gray-600">{job.location} • {job.type}</p>
        <p className="text-purple-600 font-semibold mt-2">{job.salary_range}</p>
        <div className="whitespace-pre-wrap text-gray-800">{job.description}</div>

        {isAuthenticated && user?.role === 'job_seeker' ? (
          <button
            onClick={handleApply}
            disabled={applied}
            className={`w-full py-4 mt-6 rounded-lg text-lg font-semibold ${
              applied ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {applied ? 'Applied ✓' : 'Apply Now'}
          </button>
        ) : (
          <p className="mt-4 text-gray-600 text-center">
            Log in as a Job Seeker to apply for this job.
          </p>
        )}
      </div>
    </div>
  );
};

export default JobDetails;
