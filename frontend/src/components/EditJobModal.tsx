// src/components/EditJobModal.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import type { Job } from '../types/job';

interface EditJobModalProps {
  job: Job;
  onClose: () => void;
  onSave: (jobId: number, updatedData: Partial<Job>) => Promise<void>;
  isLoading: boolean;
}

const EditJobModal: React.FC<EditJobModalProps> = ({ job, onClose, onSave, isLoading }) => {
  const [title, setTitle] = useState(job.title);
  const [description, setDescription] = useState(job.description);
  const [location, setLocation] = useState(job.location);
  const [salaryRange, setSalaryRange] = useState(job.salary_range);

  useEffect(() => {
    // Update form fields if the job prop changes (e.g., if a different job is selected)
    setTitle(job.title);
    setDescription(job.description);
    setLocation(job.location);
    setSalaryRange(job.salary_range);
  }, [job]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData: Partial<Job> = {
      title,
      description,
      location,
      salary_range: salaryRange,
    };
    await onSave(job.id, updatedData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={isLoading}
        >
          <FaTimes size={20} />
        </button>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Job: {job.title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">Job Title</label>
            <input
              type="text"
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-y"
              required
              disabled={isLoading}
            ></textarea>
          </div>
          <div>
            <label htmlFor="edit-location" className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              id="edit-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="edit-salary_range" className="block text-sm font-medium text-gray-700">Salary Range</label>
            <input
              type="text"
              id="edit-salary_range"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJobModal;