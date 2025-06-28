import React from 'react';

interface SavedJobsProps {
  onNavigate: (page: string, param?: number | string) => void;
}

const SavedJobs: React.FC<SavedJobsProps> = ({ onNavigate }) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Saved Jobs</h1>
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <p className="text-lg text-gray-600">You have no saved jobs yet.</p>
        <p className="text-gray-500 mt-2">
          Click the heart icon on a job listing to save it for later.
        </p>
        <button
          onClick={() => onNavigate('jobs')}
          className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Browse Jobs
        </button>
      </div>
    </div>
  );
};

export default SavedJobs;