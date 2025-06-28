import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/api';
import type { Company } from '../types/job';
import { FaSpinner } from 'react-icons/fa';
import axios, { AxiosError } from 'axios';

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
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Check if user is authenticated and a recruiter
    if (!user || user.role !== 'recruiter') {
      setError('Access Denied: Only recruiters can post jobs.');
      setLoading(false);
      return;
    }

    // Validate company name
    if (!companyName.trim()) {
      setError('Company name cannot be empty.');
      setLoading(false);
      return;
    }

    try {
      let currentCompanyId: number | null = null;

      // Search for existing company
      const companySearchResponse = await api.get<Company[]>(`/companies?name=${encodeURIComponent(companyName.trim())}`);
      const existingCompany = companySearchResponse.data.find(
        (comp) => comp.name.toLowerCase() === companyName.trim().toLowerCase()
      );

      if (existingCompany) {
        currentCompanyId = existingCompany.id;
        console.log(`Found existing company: ${existingCompany.name} (ID: ${currentCompanyId})`);
      } else {
        console.log(`Company "${companyName.trim()}" not found, attempting to create...`);

        // Ensure user.id exists
        if (!user.id) {
          setError('User ID is missing. Cannot create company without an owner.');
          setLoading(false);
          return;
        }

        // Create new company
        const newCompanyPayload = {
          name: companyName.trim(),
          description: `Company profile for ${companyName.trim()}. This is a newly created company.`,
          industry: 'Unspecified',
          website: `http://www.${companyName.trim().toLowerCase().replace(/\s/g, '')}.com`,
          contact_email: `contact@${companyName.trim().toLowerCase().replace(/\s/g, '')}.com`,
          owner_id: user.id,
        };
        const newCompanyResponse = await api.post<Company>('/companies', newCompanyPayload);
        currentCompanyId = newCompanyResponse.data.id;
        console.log(`Created new company: ${newCompanyResponse.data.name} (ID: ${currentCompanyId})`);
      }

      if (currentCompanyId === null) {
        setError('Could not determine or create company ID. Please try again.');
        setLoading(false);
        return;
      }

      // Create job payload
      const newJobPayload = {
        recruiter_id: user.id,
        title: jobTitle,
        company_id: currentCompanyId,
        location,
        salary: salaryRange,
        job_type: jobType,
        image: image || 'https://via.placeholder.com/400x200?text=Job+Image',
        description,
        is_active: true,
      };

      console.log('Posting job payload:', newJobPayload);

      // Post the job
      await api.post('/jobs', newJobPayload);

      setSuccess('Job posted successfully!');
      setJobTitle('');
      setLocation('');
      setSalaryRange('');
      setJobType('Full-time');
      setImage('');
      setDescription('');
      setCompanyName('');

      // Navigate back to recruiter dashboard after 2 seconds
      setTimeout(() => {
        onNavigate('recruiter-dashboard');
      }, 2000);
    } catch (err: unknown) {
      let errorMessage = 'Failed to post job. Please try again.';
      console.error('Full error object:', err);

      if (isAxiosError(err)) {
        if (err.response && err.response.data && typeof err.response.data === 'object') {
          const responseData = err.response.data as { message?: string; errors?: Record<string, string> };
          if (responseData.message && typeof responseData.message === 'string') {
            errorMessage = `Failed to post job: ${responseData.message}`;
            if (responseData.errors) {
              for (const key in responseData.errors) {
                errorMessage += `\n${key}: ${responseData.errors[key]}`;
              }
            }
          } else {
            errorMessage = `Failed to post job: ${err.message || 'Server responded with unexpected data.'}`;
          }
        } else {
          errorMessage = `Failed to post job: ${err.message || 'Network error or server unreachable.'}`;
        }
      } else if (err instanceof Error) {
        errorMessage = `Failed to post job: ${err.message}`;
      } else {
        errorMessage = 'Failed to post job. An unexpected error occurred.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'recruiter') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-red-600 text-lg font-medium">
          Access Denied: Only recruiters can post jobs.
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-8 md:p-10">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Post a New Job</h2>

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Title */}
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <input
                type="text"
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="e.g., Software Engineer"
              />
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="e.g., Acme Corp"
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="e.g., Nairobi, Kenya"
              />
            </div>

            {/* Salary Range */}
            <div>
              <label htmlFor="salaryRange" className="block text-sm font-medium text-gray-700 mb-1">
                Salary Range
              </label>
              <input
                type="text"
                id="salaryRange"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="e.g., $50,000 - $70,000"
              />
            </div>

            {/* Job Type */}
            <div>
              <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">
                Job Type
              </label>
              <select
                id="jobType"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                Image URL (Optional)
              </label>
              <input
                type="url"
                id="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="e.g., https://example.com/job-image.jpg"
              />
              {/* Image Preview */}
              {image && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-1">Image Preview:</p>
                  <img
                    src={image}
                    alt="Job Image Preview"
                    className="w-full h-40 object-cover rounded-lg border border-gray-200"
                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Job+Image')}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Job Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Describe the job responsibilities and requirements..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-transform hover:scale-105"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" />
                Posting...
              </div>
            ) : (
              'Post Job'
            )}
          </button>
        </form>
      </div>
    </section>
  );
};

export default PostJob;