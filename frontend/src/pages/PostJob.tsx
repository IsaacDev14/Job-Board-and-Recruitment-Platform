import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/api';
import type { Company, Job } from '../types/job';
import { FaSpinner } from 'react-icons/fa';

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
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyId = async () => {
      if (user && user.role === 'recruiter') {
        try {
          const response = await api.get<Company[]>(`/companies?name=${user.username} Co.`);
          if (response.data.length > 0) {
            const company = response.data[0];
            setCompanyId(company.id);
            setCompanyName(company.name);
          } else {
            setError("Company profile not found. Please ensure it's registered.");
          }
        } catch (err) {
          console.error("Failed to fetch company:", err);
          setError("Failed to load company information.");
        }
      }
    };
    fetchCompanyId();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!user || user.role !== 'recruiter') {
      setError("Only recruiters can post jobs.");
      setLoading(false);
      return;
    }

    // if (companyId === null) {
    //   setError("Company ID is missing. Cannot post job.");
    //   setLoading(false);
    //   return;
    // }

    try {
      const jobsRes = await api.get<Job[]>('/jobs/?_sort=id&_order=desc&_limit=1');
      const lastJobId = jobsRes.data.length > 0 ? jobsRes.data[0].id : 0;
      const newJobId = lastJobId + 1;
      const recruiter = localStorage.getItem('loggedInUser')
      const newJobPayload = {
        recruiter_id:recruiter ? JSON.parse(recruiter).id : user.id,
        id: newJobId,
        title: jobTitle,
        company_id: 1,
        location,
        salary: Number(salaryRange),
        type: jobType,
        image: image || 'https://via.placeholder.com/400x200?text=Job+Image',
        description,
      };

      console.log("Posting job payload:", newJobPayload);

      await api.post('/jobs/', newJobPayload);

      setSuccess("Job posted successfully!");
      setJobTitle('');
      setLocation('');
      setSalaryRange('');
      setJobType('Full-time');
      setImage('');
      setDescription('');

      setTimeout(() => {
        onNavigate('dashboard');
      }, 2000);
    } catch (err: any) {
      console.error("Post job error:", err.response?.data || err.message || err);
      setError("Failed to post job. Please try again.");
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
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
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
              value={companyName || `${user?.username} Co.`}
              readOnly
              disabled
              className="mt-1 block w-full px-3 py-2 border bg-gray-100 rounded-md cursor-not-allowed"
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
