import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../hooks/useAuth';
import {
  FaSearch,
  FaMapMarkerAlt,
  FaDollarSign,
  FaBuilding,
  FaBriefcase,
  FaHeart,
  FaRegHeart,
} from 'react-icons/fa';

interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary: string;
  salary_range: string;
  job_type: string;
  type: string;
  date_posted: string;
  expires_date?: string;
  recruiter_id: number;
  company_id: number;
  company_name?: string;
  recruiter_username?: string;
  is_active: boolean;
  image?: string;
}

interface JobsProps {
  onNavigate: (page: string, jobId?: number) => void;
}

const Jobs: React.FC<JobsProps> = ({ onNavigate }) => {
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchAllJobs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<Job[]>('/jobs/', {
          params: { is_active: true },
        });
        setAllJobs(response.data);
        setFilteredJobs(response.data);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
        setError('Failed to load jobs. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchSavedJobs = async () => {
      if (!user?.id) return;
      try {
        const res = await api.get<{ job_id: number }[]>('/saved_jobs/', {
          params: { user_id: user.id },
        });
        const savedIds = new Set(res.data.map((item) => item.job_id));
        setSavedJobIds(savedIds);
      } catch (err) {
        console.error('Failed to fetch saved jobs:', err);
      }
    };

    fetchAllJobs();
    if (isAuthenticated) fetchSavedJobs();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isLoading) {
      setIsFiltering(true);
      const handler = setTimeout(() => {
        const search = searchTerm.trim().toLowerCase();
        const filtered = allJobs.filter((job) => {
          const company = job.company_name?.toLowerCase() || '';
          return (
            job.title.toLowerCase().includes(search) ||
            company.includes(search) ||
            job.location.toLowerCase().includes(search)
          );
        });
        setFilteredJobs(filtered);
        setIsFiltering(false);
      }, 300);
      return () => clearTimeout(handler);
    }
  }, [searchTerm, allJobs, isLoading]);

  const toggleSaveJob = async (jobId: number) => {
    if (!user?.id) return;
    try {
      if (savedJobIds.has(jobId)) {
        await api.delete(`/saved_jobs/${jobId}/`, {
          params: { user_id: user.id },
        });
        setSavedJobIds((prev) => {
          const updated = new Set(prev);
          updated.delete(jobId);
          return updated;
        });
      } else {
        await api.post('/saved_jobs/', {
          job_id: jobId,
          user_id: user.id,
        });
        setSavedJobIds((prev) => new Set(prev).add(jobId));
      }
    } catch (err) {
      console.error('Failed to toggle save job:', err);
    }
  };

  return (
    <section className="min-h-screen py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Discover Your Next Career
        </h2>

        <div className="mb-12 flex justify-center">
          <div className="relative w-full max-w-2xl">
            <input
              type="text"
              placeholder="Search by title, company, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading && allJobs.length === 0}
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FaSearch size={20} />
            </div>
          </div>
        </div>

        {error && (
          <div className="text-center text-red-600 mb-6 p-4 bg-red-100 border border-red-400 rounded-lg shadow-sm">
            {error}
          </div>
        )}

        {isLoading && allJobs.length === 0 ? (
          <div className="text-center text-gray-500">Loading jobs...</div>
        ) : isFiltering && searchTerm.trim() !== '' ? (
          <div className="text-center text-gray-500">Filtering results...</div>
        ) : filteredJobs.length === 0 ? (
          <p className="text-center text-gray-500 text-lg py-10">
            No jobs found matching your search criteria.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl shadow-md overflow-hidden transition hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                onClick={() => onNavigate('job-details', job.id)}
              >
                {job.image ? (
                  <img
                    src={job.image}
                    alt={job.title}
                    className="h-48 w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://placehold.co/400x200?text=Job+Image';
                    }}
                  />
                ) : (
                  <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-xl text-gray-900">{job.title}</h3>
                    {isAuthenticated && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveJob(job.id);
                        }}
                        className="focus:outline-none"
                        aria-label={savedJobIds.has(job.id) ? 'Unsave job' : 'Save job'}
                      >
                        {savedJobIds.has(job.id) ? (
                          <FaHeart size={18} className="text-red-600" />
                        ) : (
                          <FaRegHeart size={18} className="text-gray-400 hover:text-red-600 transition-colors" />
                        )}
                      </button>
                    )}
                  </div>

                  <p className="text-gray-700 text-sm mb-1 flex items-center">
                    <FaBuilding className="mr-2" /> {job.company_name || 'Company Not Found'}
                  </p>
                  <p className="text-gray-600 text-sm mb-3 flex items-center">
                    <FaMapMarkerAlt className="mr-2" /> {job.location}
                  </p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span className="flex items-center">
                      <FaDollarSign className="mr-1" /> {job.salary_range}
                    </span>
                    <span className="flex items-center">
                      <FaBriefcase className="mr-1" /> {job.type || job.job_type}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('job-details', job.id);
                    }}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Jobs;
