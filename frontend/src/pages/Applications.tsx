// src/pages/Applications.tsx
import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../hooks/useAuth';
import type { Application, Company } from '../types/job';
import { FaBuilding, FaMapMarkerAlt, FaDollarSign, FaBriefcase, FaCalendarAlt } from 'react-icons/fa';

interface ApplicationsProps {
  onNavigate: (page: string, jobId?: number) => void;
}

const Applications: React.FC<ApplicationsProps> = ({ onNavigate }) => {
  const { user, isAuthenticated } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!isAuthenticated || !user || user.role !== 'job_seeker' || !user.id) {
        setError('You must be logged in as a Job Seeker to view your applications.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<Application[]>(`/applications?user_id=${user.id}&_expand=job`);
        console.log('Applications.tsx: Fetched applications response:', response.data); // Debug log

        const applicationsWithCompany = await Promise.all(response.data.map(async (app) => {
          if (app.job && app.job.company_id) {
            try {
              const companyResponse = await api.get<Company>(`/companies/${app.job.company_id}`);
              return { ...app, job: { ...app.job, company: companyResponse.data } };
            } catch (companyErr) {
              console.warn(`Applications.tsx: Could not fetch company for job ID ${app.job.id}:`, companyErr);
              return { ...app, job: { ...app.job, company: undefined } };
            }
          }
          return app;
        }));

        setApplications(applicationsWithCompany);
      } catch (err) {
        console.error("Applications.tsx: Failed to fetch applications:", err);
        setError("Failed to load your applications. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [isAuthenticated, user]);

  if (isLoading) {
    return <div className="text-center py-20 text-gray-700">Loading your applications...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-600">{error}</div>;
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 text-lg mb-4">You haven't applied for any jobs yet.</p>
        <button
          onClick={() => onNavigate('jobs')}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Browse Jobs
        </button>
      </div>
    );
  }

  return (
    <section className="min-h-screen py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Your Job Applications</h2>
        <div className="space-y-6">
          {applications.map(app => (
            <div key={app.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center">
              <div className="sm:mr-6 mb-4 sm:mb-0 w-24 h-24 flex-shrink-0">
                {app.job?.image ? (
                  <img src={app.job.image} alt={app.job.title} className="w-full h-full object-cover rounded-md" />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-sm">No Image</div>
                )}
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{app.job?.title || 'Unknown Job'}</h3>
                <p className="text-gray-700 text-sm mb-2 flex items-center">
                  <FaBuilding className="text-gray-500 mr-2" />
                  {app.job?.company?.name || 'Company Not Found'}
                </p>
                <p className="text-gray-600 text-sm mb-2 flex items-center">
                  <FaMapMarkerAlt className="text-gray-500 mr-2" />
                  {app.job?.location || 'Unknown Location'}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center mr-3">
                    <FaDollarSign className="text-gray-500 mr-1" /> {app.job?.salary_range || 'N/A'}
                  </span>
                  <span className="flex items-center">
                    <FaBriefcase className="text-gray-500 mr-1" /> {app.job?.type || 'N/A'}
                  </span>
                </div>
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between text-sm">
                  <span className={`px-3 py-1 rounded-full font-medium ${
                    app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    app.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    Status: {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                  <span className="text-gray-500 mt-2 sm:mt-0 flex items-center">
                    <FaCalendarAlt className="text-gray-400 mr-1" />
                    Applied on: {new Date(app.applied_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  console.log('Applications.tsx: View Job button clicked for application ID:', app.id); // Debug log
                  console.log('Applications.tsx: app.job:', app.job); // Debug log
                  if (app.job && typeof app.job.id === 'number') {
                    console.log('Applications.tsx: Navigating to job-details with job ID:', app.job.id); // Debug log
                    onNavigate('job-details', app.job.id);
                  } else {
                    console.error('Applications.tsx: Cannot navigate to job-details. app.job is missing or app.job.id is not a number:', app.job); // Debug log
                  }
                }}
                className="mt-4 sm:mt-0 sm:ml-6 flex-shrink-0 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                View Job
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Applications;
