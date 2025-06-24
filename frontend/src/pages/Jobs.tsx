import React, { useState, useEffect } from 'react';
import sampleJobs from '../data/SampleData.json';

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  image: string;
  description: string;
}

interface JobsProps {
  onNavigate: (page: string, jobId?: number) => void;
  filterCategory?: string;  // Optional filter string
}

const Jobs: React.FC<JobsProps> = ({ onNavigate, filterCategory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await new Promise(res => setTimeout(res, 500));

      // Filter jobs based on search term AND category filter if provided
      const filtered: Job[] = (sampleJobs as Job[]).filter(job => {
        // Check if job matches category filter if it exists
        const matchesCategory = filterCategory
          ? job.title.toLowerCase().includes(filterCategory.toLowerCase()) ||
            job.type.toLowerCase().includes(filterCategory.toLowerCase()) ||
            job.company.toLowerCase().includes(filterCategory.toLowerCase())
          : true;

        // Check if job matches search term
        const matchesSearch = [job.title, job.company, job.location].some(field =>
          field.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return matchesCategory && matchesSearch;
      });

      setFilteredJobs(filtered);
      setIsLoading(false);
    })();
  }, [searchTerm, filterCategory]);

  return (
    <section className="min-h-screen py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">
          {filterCategory ? `Jobs in "${filterCategory}"` : 'Discover Your Next Career'}
        </h2>

        {/* Search input */}
        <div className="mb-12 flex justify-center">
          <div className="relative w-full max-w-2xl">
            <input
              type="text"
              placeholder="Search by title, company, or location..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </div>
        </div>

        {/* Job listings or loading */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="animate-pulse bg-white rounded-xl h-80"></div>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">No jobs found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredJobs.map(job => (
              <div
                key={job.id}
                className="bg-white rounded-xl shadow transition hover:-translate-y-1 cursor-pointer"
                onClick={() => onNavigate('job-details', job.id)}
              >
                <img
                  src={job.image}
                  alt={job.title}
                  className="h-48 w-full object-cover rounded-t-xl"
                />
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
                  <p className="text-gray-600 text-sm">{job.company}</p>
                  <p className="text-gray-500 text-sm">{job.location}</p>
                  <div className="mt-3 flex justify-between text-sm text-gray-500">
                    <span>💰 {job.salary}</span>
                    <span>📁 {job.type}</span>
                  </div>
                  <button
                    className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    onClick={e => {
                      e.stopPropagation();
                      onNavigate('job-details', job.id);
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
