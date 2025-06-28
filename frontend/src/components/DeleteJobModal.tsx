// src/components/DeleteJobModal.tsx
import React from 'react';
import { FaTimes, FaTrash } from 'react-icons/fa';
import type { Job } from '../types/job';

interface DeleteJobModalProps {
  job: Job;
  onClose: () => void;
  onConfirm: (jobId: number) => Promise<void>;
  isLoading: boolean;
}

const DeleteJobModal: React.FC<DeleteJobModalProps> = ({ job, onClose, onConfirm, isLoading }) => {
  const handleDelete = async () => {
    await onConfirm(job.id);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm relative text-center">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={isLoading}
        >
          <FaTimes size={20} />
        </button>
        <FaTrash className="mx-auto text-red-500 mb-4" size={48} />
        <h3 className="text-xl font-bold text-gray-900 mb-3">Confirm Deletion</h3>
        <p className="text-gray-700 mb-6">Are you sure you want to delete the job "<span className="font-semibold">{job.title}</span>"? This action cannot be undone.</p>
        <div className="flex justify-center space-x-4">
          <button
            type="button" // Important to prevent accidental form submission
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button" // Important to prevent accidental form submission
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Job'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteJobModal;