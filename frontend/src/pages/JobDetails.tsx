import React, { useState } from 'react';
import type { Job } from './Jobs';


interface JobDetailsProps {
  job: Job;
  onNavigate?: (page: string) => void;
}

const JobDetails: React.FC<JobDetailsProps> = ({ job, onNavigate }) => {
  const [applied, setApplied] = useState(false);

  return (
    <div className="min-h-screen py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8 space-y-6">
        {onNavigate && (
          <button
            onClick={() => onNavigate('jobs')}
            className="text-blue-600 hover:underline flex items-center space-x-2"
          >
            ← <span>Back to listings</span>
          </button>
        )}

        <img src={job.image} alt={job.title} className="w-full h-64 object-cover rounded-lg" />
        <h1 className="text-4xl font-bold">{job.title}</h1>
        <p className="text-lg text-gray-700">{job.company}</p>
        <p className="text-gray-600">{job.location} • {job.type}</p>
        <p className="text-purple-600 font-semibold mt-4">{job.salary}</p>
        <div className="text-gray-800 leading-relaxed">{job.description}</div>

        <button
          onClick={() => setApplied(true)}
          disabled={applied}
          className={`w-full py-4 rounded-lg text-lg font-semibold transition ${
            applied
              ? 'bg-green-600 text-white cursor-default'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {applied ? 'Applied ✓' : 'Apply Now'}
        </button>
      </div>
    </div>
  );
};

export default JobDetails;
