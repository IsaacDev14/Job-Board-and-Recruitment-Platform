import React, { useState, useEffect } from 'react';

// Job type
interface Job {
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
}

// Sample data
const sampleJobs: Job[] = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    company: 'Tech Solutions Inc.',
    location: 'Nairobi, Kenya',
    salary: '$3,500 - $4,500/month',
    type: 'Full-time',
    image: 'https://cdn.pixabay.com/photo/2020/01/26/20/14/computer-4795762_1280.jpg',
    description: 'We are seeking an experienced Frontend Developer...',
  },
  {
    id: 2,
    title: 'Cloud Solutions Architect',
    company: 'Global Innovations Co.',
    location: 'Remote (Kenya)',
    salary: '$4,000 - $5,500/month',
    type: 'Contract',
    image: 'https://images.unsplash.com/photo-1510519138101-570d1dca3d66?q=80&w=2047&auto=format&fit=crop',
    description: 'Looking for a skilled Cloud Solutions Architect...',
  },
  {
    id: 3,
    title: 'Product Manager',
    company: 'Innovate Kenya Ltd.',
    location: 'Nairobi, Kenya',
    salary: '$3,000 - $4,000/month',
    type: 'Full-time',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1974&auto=format&fit=crop',
    description: 'Lead the development of our next-generation products...',
  },
  {
    id: 4,
    title: 'Data Scientist',
    company: 'Analytics Hub',
    location: 'Mombasa, Kenya',
    salary: '$3,200 - $4,200/month',
    type: 'Full-time',
    image: 'https://images.unsplash.com/photo-1551288259-cd197c36d2bc?q=80&w=2070&auto=format&fit=crop',
    description: 'Extract insights from large datasets and build predictive models...',
  },
  {
    id: 5,
    title: 'Mobile App Developer',
    company: 'MobDev Solutions',
    location: 'Remote',
    salary: '$2,800 - $3,800/month',
    type: 'Full-time',
    image: 'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?q=80&w=2072&auto=format&fit=crop',
    description: 'Develop high-performance mobile applications...',
  },
];

// Skeleton card
const JobCardSkeleton: React.FC = () => (
  <div className="bg-white shadow-md rounded-xl overflow-hidden animate-pulse">
    <div className="w-full h-48 bg-gray-300"></div>
    <div className="p-5">
      <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
      <div className="mt-4 h-9 w-24 bg-blue-300 rounded-md"></div>
    </div>
  </div>
);

// Job card with SVGs
const JobCard: React.FC<{ job: Job; onNavigate: (page: string, jobId?: number) => void }> = ({ job, onNavigate }) => (
  <div
    className="bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
    onClick={() => onNavigate('job-details', job.id)}
  >
    <img
      src={job.image}
      alt={job.title}
      className="w-full h-48 object-cover object-center"
      onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x250?text=No+Image'; }}
    />
    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
      <p className="text-md text-gray-700 mb-3 flex items-center">
        {/* Company SVG */}
        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M18 2h-6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
          <path d="M12 6h6M12 10h6M12 14h6M12 18h6" />
        </svg>
        {job.company}
      </p>
      <p className="text-md text-gray-600 mb-3 flex items-center">
        {/* Location SVG */}
        <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="1" />
          <path d="M12 21C12 21 4 14 4 9a8 8 0 1 1 16 0c0 5-8 12-8 12Z" />
        </svg>
        {job.location}
      </p>
      <div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
        <p className="flex items-center">
          {/* Salary SVG */}
          <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          {job.salary}
        </p>
        <p className="flex items-center">
          {/* Type SVG */}
          <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          {job.type}
        </p>
      </div>
      <button
        className="mt-6 w-full inline-block bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition duration-200"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate('job-details', job.id);
        }}
      >
        View Details
      </button>
    </div>
  </div>
);

// Jobs Page
const Jobs: React.FC<JobsProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const filtered = sampleJobs.filter((job) =>
        [job.title, job.company, job.location].some((field) =>
          field.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredJobs(filtered);
      setIsLoading(false);
    };
    fetchJobs();
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 font-inter py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-12 leading-tight">
          Discover Your Next Career
        </h2>

        {/* Search */}
        <div className="mb-12 flex justify-center">
          <div className="relative w-full max-w-2xl">
            <input
              type="text"
              placeholder="Search by title, company, or location..."
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              {/* Search Icon */}
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-8">
            {[...Array(6)].map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center text-gray-600 text-lg py-10">
            No jobs found matching your criteria.
          </div>
        ) : (
          <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-8">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
