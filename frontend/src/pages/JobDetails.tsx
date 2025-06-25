// src/pages/JobDetails.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/api';
import type { Job, Application } from '../types/job';

interface JobDetailsProps {
  jobId?: number; // CHANGED jobId to number
  onNavigate?: (page: string) => void;
}

const JobDetails: React.FC<JobDetailsProps> = ({ jobId, onNavigate }) => {
  const { isAuthenticated, user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobData = async () => {
      if (jobId === undefined || jobId === null) { // Check for undefined/null number
        setError("No job ID provided.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // API call should use jobId as a number
        const jobResponse = await api.get<Job>(`/jobs/${jobId}`);
        setJob(jobResponse.data);

        if (isAuthenticated && user?.role === 'job_seeker' && user?.id) {
          // user.id is number, jobId is number
          const applicationsResponse = await api.get<Application[]>(
            `/applications?user_id=${user.id}&job_id=${jobId}`
          );
          setApplied(applicationsResponse.data.length > 0);
        } else {
          setApplied(false);
        }
      } catch (err) {
        console.error("Failed to fetch job details or application status:", err);
        setError("Failed to load job details. The job might not exist or there was a network error.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [jobId, isAuthenticated, user]); // Dependencies are correct

  const handleApply = async () => {
    if (!isAuthenticated || !user || user.role !== 'job_seeker' || !user.id) {
      setError('You must be logged in as a Job Seeker to apply.');
      return;
    }
    if (!job) {
      setError('Cannot apply: Job details not loaded.');
      return;
    }
    if (applied) {
      setError('You have already applied for this job.');
      return;
    }

    setLoading(true);
    try {
      await api.post<Application>('/applications', {
        user_id: user.id,   // user.id is number
        job_id: job.id,     // job.id is number
        status: 'pending',
        applied_at: new Date().toISOString(),
      });
      setApplied(true);
      setError(null);
    } catch (err) {
      console.error("Error applying for job:", err);
      setError('Failed to apply for the job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen py-16 px-4 bg-gray-50 text-center text-gray-700">Loading job details...</div>;
  }

  if (error) {
    return <div className="min-h-screen py-16 px-4 bg-gray-50 text-red-600 text-center">{error}</div>;
  }

  if (!job) {
    return <div className="min-h-screen py-16 px-4 bg-gray-50 text-center text-gray-700">Job not found.</div>;
  }

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

        {job.image && <img src={job.image} alt={job.title} className="w-full h-64 object-cover rounded-lg mb-4" />}
        <h1 className="text-4xl font-bold">{job.title}</h1>
        <p className="text-lg text-gray-700">{job.company?.name}</p>
        <p className="text-gray-600">{job.location} • {job.type}</p>
        <p className="text-purple-600 font-semibold mt-4">{job.salary_range}</p>
        <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">{job.description}</div>

        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

        {isAuthenticated && user?.role === 'job_seeker' ? (
          <button
            onClick={handleApply}
            disabled={applied || loading}
            className={`w-full py-4 rounded-lg text-lg font-semibold transition ${
              applied
                ? 'bg-green-600 text-white cursor-default'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Applying...' : (applied ? 'Applied ✓' : 'Apply Now')}
          </button>
        ) : isAuthenticated && user?.role === 'recruiter' ? (
              <p className="mt-4 text-gray-600 text-center">Recruiters cannot apply for jobs.</p>
        ) : (
            <p className="mt-4 text-gray-600 text-center">Log in as a Job Seeker to apply for jobs.</p>
        )}
      </div>
    </div>
  );
};

export default JobDetails;