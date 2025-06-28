import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/api';

interface Job {
  id: number;
  title: string;
  company?: { name: string };
  location: string;
  type: string;
  salary_range: string;
}

interface SavedJobItem {
  id: number;
  user_id: number;
  job_id: number;
  saved_at?: string;
}

interface SavedJobsProps {
  onNavigate: (page: string, param?: number | string) => void;
}

const SavedJobs: React.FC<SavedJobsProps> = ({ onNavigate }) => {
  const { user, isAuthenticated } = useAuth();
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!isAuthenticated || !user) return;

      try {
        const res = await api.get<SavedJobItem[]>('/saved_jobs/', {
          params: { user_id: user.id },
        });

        const jobs: Job[] = await Promise.all(
          res.data.map(async (saved) => {
            const jobRes = await api.get<Job>(`/jobs/${saved.job_id}`);
            return jobRes.data;
          })
        );

        setSavedJobs(jobs);
      } catch (err) {
        console.error('Failed to load saved jobs:', err);
        setError('Error loading saved jobs.');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, [isAuthenticated, user]);

  const handleUnsave = async (jobId: number) => {
    try {
      await api.delete(`/saved_jobs/${jobId}/`, {
        params: { user_id: user?.id },
      });
      setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (err) {
      console.error('Failed to unsave job', err);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="text-center p-8 text-red-600">
        You must be logged in to view saved jobs.
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Saved Jobs</h1>

      {loading ? (
        <p>Loading your saved jobs...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : savedJobs.length === 0 ? (
        <div className="text-center border-2 border-dashed p-10 rounded-lg text-gray-600">
          <p>You have no saved jobs yet.</p>
          <button
            onClick={() => onNavigate('jobs')}
            className="mt-4 bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
          >
            Browse Jobs
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((job) => (
            <div key={job.id} className="bg-white shadow-md rounded-lg p-5 border border-gray-100">
              <h3 className="text-xl font-semibold">{job.title}</h3>
              <p className="text-gray-600">{job.company?.name || 'Unknown Company'}</p>
              <p className="text-gray-500">{job.location}</p>
              <p className="text-purple-600">{job.salary_range}</p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => onNavigate('job-details', job.id)}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  View Job
                </button>
                <button
                  onClick={() => handleUnsave(job.id)}
                  className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
                >
                  Unsave
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
