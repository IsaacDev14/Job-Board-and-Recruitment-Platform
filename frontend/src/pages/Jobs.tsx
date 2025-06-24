import React from 'react';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
}

const sampleJobs: Job[] = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: 'Google',
    location: 'Nairobi, Kenya',
    salary: '$2,500/month',
    type: 'Full-time',
  },
  {
    id: 2,
    title: 'Backend Engineer',
    company: 'Amazon',
    location: 'Remote',
    salary: '$3,200/month',
    type: 'Contract',
  },
  {
    id: 3,
    title: 'UI/UX Designer',
    company: 'Safaricom',
    location: 'Nairobi, Kenya',
    salary: '$2,000/month',
    type: 'Full-time',
  },
];

const Jobs: React.FC = () => {
  return (
    <div className="py-16">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Explore Job Opportunities</h2>

      <div className="max-w-4xl mx-auto px-4">
        <input
          type="text"
          placeholder="Search for job titles or companies..."
          className="w-full mb-8 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-100"
        />

        <div className="space-y-6">
          {sampleJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white shadow-md rounded-lg p-6 border border-gray-100 hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold text-gray-800">{job.title}</h3>
              <p className="text-gray-600">{job.company} — {job.location}</p>
              <div className="mt-2 text-sm text-gray-500">
                <span>{job.salary}</span> · <span>{job.type}</span>
              </div>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
