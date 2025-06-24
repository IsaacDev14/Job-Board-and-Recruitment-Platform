import React, { useState } from 'react';

interface JobFormData {
  company: string;
  title: string;
  description: string;
  location: string;
  salary: string;
  jobType: string;
}

interface PostJobProps {
  onNavigate: (page: string) => void;
}

const PostJob: React.FC<PostJobProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState<JobFormData>({
    company: '',
    title: '',
    description: '',
    location: '',
    salary: '',
    jobType: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    const { company, title, description, location, salary, jobType } = formData;
    if (!company || !title || !description || !location || !salary || !jobType) {
      setError('All fields are required.');
      setSuccess(null);
      return;
    }

    // Simulate submission (e.g. POST to backend API)
    console.log('Job Submitted:', formData);
    setError(null);
    setSuccess('Job posted successfully!');

    // Optionally reset form
    setFormData({
      company: '',
      title: '',
      description: '',
      location: '',
      salary: '',
      jobType: '',
    });
  };

  return (
    <div className="py-16 text-gray-800 min-h-[60vh] flex flex-col justify-center items-center">
      <h2 className="text-2xl font-bold mb-3 text-center">Post a New Job Listing</h2>
      <p className="text-sm mb-6 text-center">Fill out the form to reach thousands of job seekers.</p>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md"
      >
        {error && <p className="text-red-600 mb-3 text-sm">{error}</p>}
        {success && <p className="text-green-600 mb-3 text-sm">{success}</p>}

        <input
          name="company"
          value={formData.company}
          onChange={handleChange}
          placeholder="Company Name"
          className="w-full p-2 mb-3 border border-gray-300 rounded-md text-sm"
        />

        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Job Title"
          className="w-full p-2 mb-3 border border-gray-300 rounded-md text-sm"
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Job Description"
          rows={4}
          className="w-full p-2 mb-3 border border-gray-300 rounded-md text-sm"
        ></textarea>

        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Location"
          className="w-full p-2 mb-3 border border-gray-300 rounded-md text-sm"
        />

        <input
          name="salary"
          value={formData.salary}
          onChange={handleChange}
          placeholder="Salary Range (e.g. $50k - $70k)"
          className="w-full p-2 mb-3 border border-gray-300 rounded-md text-sm"
        />

        <select
          name="jobType"
          value={formData.jobType}
          onChange={handleChange}
          className="w-full p-2 mb-4 border border-gray-300 rounded-md text-sm"
        >
          <option value="">Select Job Type</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Remote">Remote</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 text-sm"
        >
          Post Job
        </button>

        <p className="text-xs text-gray-600 mt-4 text-center">
          Not registered yet?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="text-blue-600 hover:underline"
            type="button"
          >
            Create an account
          </button>
        </p>
      </form>
    </div>
  );
};

export default PostJob;
