// frontend/src/components/PostJob.tsx

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/api';
import type { Company } from '../types/job';
import { FaSpinner } from 'react-icons/fa';
import axios, { AxiosError } from 'axios'; // Ensure AxiosError is imported

// Type guard to check if an error is an AxiosError
function isAxiosError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}

interface PostJobProps {
  onNavigate: (page: string, param?: number | string) => void;
}

const PostJob: React.FC<PostJobProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  const [companyName, setCompanyName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!user || user.role !== 'recruiter') {
      setError("Access Denied: Only recruiters can post jobs.");
      setLoading(false);
      return;
    }

    if (!companyName.trim()) {
      setError("Company name cannot be empty.");
      setLoading(false);
      return;
    }

    try {
      let currentCompanyId: number | null = null;

      const companySearchResponse = await api.get<Company[]>(`/companies?name=${encodeURIComponent(companyName.trim())}`);
      const existingCompany = companySearchResponse.data.find(comp =>
        comp.name.toLowerCase() === companyName.trim().toLowerCase()
      );

      if (existingCompany) {
        currentCompanyId = existingCompany.id;
        console.log(`Found existing company: ${existingCompany.name} (ID: ${currentCompanyId})`);
      } else {
        console.log(`Company "${companyName.trim()}" not found, attempting to create...`);

        // Ensure user.id exists before attempting to use it
        if (!user.id) {
          setError("User ID is missing. Cannot create company without an owner.");
          setLoading(false);
          return;
        }

        const newCompanyPayload = {
          name: companyName.trim(),
          description: `Company profile for ${companyName.trim()}. This is a newly created company.`,
          industry: 'Unspecified',
          website: `http://www.${companyName.trim().toLowerCase().replace(/\s/g, '')}.com`,
          contact_email: `contact@${companyName.trim().toLowerCase().replace(/\s/g, '')}.com`,
          owner_id: user.id // <-- THIS IS THE CRITICAL ADDITION/MODIFICATION
        };
        const newCompanyResponse = await api.post<Company>('/companies', newCompanyPayload);
        currentCompanyId = newCompanyResponse.data.id;
        console.log(`Created new company: ${newCompanyResponse.data.name} (ID: ${currentCompanyId})`);
      }

      if (currentCompanyId === null) {
        setError("Could not determine or create company ID. Please try again.");
        setLoading(false);
        return;
      }

      const newJobPayload = {
        recruiter_id: user.id, // Assuming job also needs recruiter_id
        title: jobTitle,
        company_id: currentCompanyId,
        location,
        salary: salaryRange,
        job_type: jobType,
        image: image || 'https://via.placeholder.com/400x200?text=Job+Image',
        description,
        is_active: true,
      };

      console.log("Posting job payload:", newJobPayload);

      await api.post('/jobs', newJobPayload);

      setSuccess("Job posted successfully!");
      setJobTitle('');
      setLocation('');
      setSalaryRange('');
      setJobType('Full-time');
      setImage('');
      setDescription('');
      setCompanyName('');

      setTimeout(() => {
        onNavigate('dashboard');
      }, 2000);

    } catch (err: unknown) { // Use 'unknown' for initial catch
      let errorMessage = "Failed to post job. Please try again.";
      console.error("Full error object:", err); // Log the full error for debugging

      if (isAxiosError(err)) {
        // Axios error - try to get a specific message from the response data
        if (err.response && err.response.data && typeof err.response.data === 'object') {
          // Safely check if 'message' property exists and is a string
          const responseData = err.response.data as { message?: string; errors?: Record<string, string> }; // Cast to an object that *might* have 'message' and 'errors'
          if (responseData.message && typeof responseData.message === 'string') {
            errorMessage = `Failed to post job: ${responseData.message}`;
            if (responseData.errors) {
                // Append specific validation errors if present
                for (const key in responseData.errors) {
                    errorMessage += `\n${key}: ${responseData.errors[key]}`;
                }
            }
          } else {
            // Fallback to Axios's own message if response data is not as expected
            errorMessage = `Failed to post job: ${err.message || 'Server responded with unexpected data.'}`;
          }
        } else {
          // No response data (e.g., network error, CORS, timeout)
          errorMessage = `Failed to post job: ${err.message || 'Network error or server unreachable.'}`;
        }
      } else if (err instanceof Error) {
        // Generic JavaScript error (e.g., TypeError, ReferenceError)
        errorMessage = `Failed to post job: ${err.message}`;
      } else {
        // Truly unknown error type
        errorMessage = "Failed to post job. An unexpected error occurred.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'recruiter') {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-lg">
        Access Denied: Only recruiters can post jobs.
      </div>
    );
  }

  return (
    <section className="min-h-screen py-16 px-4 bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-center mb-6">Post a New Job</h2>
        {error && <p className="text-red-500 text-center mb-4 whitespace-pre-line">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
              Job Title
            </label>
            <input
              type="text"
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="salaryRange" className="block text-sm font-medium text-gray-700">
              Salary Range
            </label>
            <input
              type="text"
              id="salaryRange"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="jobType" className="block text-sm font-medium text-gray-700">
              Job Type
            </label>
            <select
              id="jobType"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
              Image URL (Optional)
            </label>
            <input
              type="url"
              id="image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/job-image.jpg"
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Job Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? <FaSpinner className="animate-spin inline-block mr-2" /> : null}
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default PostJob;