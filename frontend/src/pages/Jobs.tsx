// src/pages/Jobs.tsx
import React, { useState, useEffect } from 'react';
import api from '../api/api';
import type { Job } from '../types/job';

// Import React Icons
import { FaSearch, FaMapMarkerAlt, FaDollarSign, FaBuilding, FaBriefcase } from 'react-icons/fa';

interface JobsProps {
  onNavigate: (page: string, jobId?: number) => void; // Expects number for jobId
}

const Jobs: React.FC<JobsProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Corrected useState initialization
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllJobs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<Job[]>('/jobs?_expand=company');
        setAllJobs(response.data);
        setFilteredJobs(response.data);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        setError("Failed to load jobs. Please check if the server is running or if the API endpoint is correct.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllJobs();
  }, []);

  useEffect(() => {
    if (!isLoading && (allJobs.length > 0 || searchTerm.trim() !== '')) {
      setIsFiltering(true);
      const handler = setTimeout(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        const filtered: Job[] = allJobs.filter(job => {
          const companyName = job.company?.name ? job.company.name.toLowerCase() : '';
          
          return (
            job.title.toLowerCase().includes(normalizedSearch) ||
            companyName.includes(normalizedSearch) ||
            job.location.toLowerCase().includes(normalizedSearch)
          );
        });

        setFilteredJobs(filtered);
        setIsFiltering(false);
      }, 300);

      return () => clearTimeout(handler);
    }
  }, [searchTerm, allJobs, isLoading]);

  return (
    <section className="min-h-screen py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Discover Your Next Career</h2>
        <div className="mb-12 flex justify-center">
          <div className="relative w-full max-w-2xl">
            <input
              type="text"
              placeholder="Search by title, company, or location..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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

        {(isLoading && allJobs.length === 0) ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow p-5 animate-pulse h-64 border border-gray-100">
                <div className="h-32 bg-gray-200 rounded-md mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (isFiltering && filteredJobs.length === 0 && searchTerm.trim() !== '') ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow p-5 animate-pulse h-64 border border-gray-100">
                  <div className="h-32 bg-gray-200 rounded-md mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
        ) : filteredJobs.length === 0 ? (
          <p className="text-center text-gray-500 text-lg py-10">No jobs found matching your search criteria.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredJobs.map(job => (
              <div
                key={job.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden transition hover:-translate-y-1 hover:shadow-lg cursor-pointer border border-gray-100"
                onClick={() => {
                  const jobIdAsNumber = Number(job.id); // Explicitly convert to number
                  console.log('Jobs.tsx: Navigating to job-details for ID:', jobIdAsNumber, 'Type:', typeof jobIdAsNumber);
                  onNavigate('job-details', jobIdAsNumber);
                }}
              >
                {/* Dynamic image for job cards with fallback */}
                {job.image ? (
                  <img
                    src={job.image}
                    alt={job.title}
                    className="h-48 w-full object-cover"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // Prevents infinite loop
                      target.src = "https://placehold.co/400x200/ADD8E6/000000?text=Job+Listing+Image"; // Fallback placeholder
                    }}
                  />
                ) : (
                  <div className="h-48 w-full bg-gray-200 flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-semibold text-xl text-gray-900 mb-2 leading-tight">{job.title}</h3>
                  <p className="text-gray-700 text-sm mb-1 flex items-center">
                    <FaBuilding className="text-gray-500 mr-2" />
                    {job.company?.name || 'Company Not Found'}
                  </p>
                  <p className="text-gray-600 text-sm mb-3 flex items-center">
                    <FaMapMarkerAlt className="text-gray-500 mr-2" />
                    {job.location}
                  </p>
                  <div className="mt-3 flex flex-wrap justify-between items-center text-sm text-gray-500">
                    <span className="flex items-center mr-3 mb-1">
                      <FaDollarSign className="text-gray-500 mr-1" /> {job.salary_range}
                    </span>
                    <span className="flex items-center mb-1">
                      <FaBriefcase className="text-gray-500 mr-1" /> {job.type || 'Full-time'}
                    </span>
                  </div>
                  <button
                    className="mt-5 w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    onClick={e => {
                      e.stopPropagation();
                      const jobIdAsNumber = Number(job.id);
                      console.log('Jobs.tsx (Button): Navigating to job-details for ID:', jobIdAsNumber, 'Type:', typeof jobIdAsNumber);
                      onNavigate('job-details', jobIdAsNumber);
                    }}
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
