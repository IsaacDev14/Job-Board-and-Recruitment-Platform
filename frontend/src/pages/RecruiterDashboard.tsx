import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/api';
import {
  Briefcase,
  CheckCircle,
  FileText,
  PlusCircle,
  Users,
  ArrowRight,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import EditJobModal from '../components/EditJobModal';
import DeleteJobModal from '../components/DeleteJobModal';
import type { Job } from '../types/job';

interface RecruiterDashboardProps {
  onNavigate: (page: string, param?: number | string) => void;
}

const StatCard: React.FC<{
  name: string;
  value: string;
  icon: React.ElementType;
  color: string;
}> = ({ name, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center space-x-4">
    <div className={`p-3 rounded-full bg-opacity-10 ${color} bg-${color.split('-')[1]}-100`}>
      <Icon className={`${color}`} size={28} />
    </div>
    <div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600">{name}</p>
    </div>
  </div>
);

const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState([
    { name: 'Active Listings', value: '0', icon: Briefcase, color: 'text-blue-600' },
    { name: 'Total Applications', value: '0', icon: Users, color: 'text-green-600' },
    { name: 'Pending Review', value: '0', icon: FileText, color: 'text-yellow-600' },
    { name: 'Hired', value: '0', icon: CheckCircle, color: 'text-purple-600' },
  ]);
  const [loading, setLoading] = useState(true);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;

      try {
        const jobRes = await api.get<Job[]>('/jobs/', {
          params: { recruiter_id: user.id },
        });

        const allJobs = jobRes.data;

        const activeJobs = allJobs.filter(job => job.status === 'Active');
        const closedJobs = allJobs.filter(job => job.status === 'Closed');
        const totalApplications = allJobs.reduce((acc, job) => acc + (job.applications || 0), 0);
        const pending = allJobs.filter(job => job.applications > 0).length;

        setJobs(allJobs.slice(0, 4)); // Show recent 4
        setStats([
          { name: 'Active Listings', value: String(activeJobs.length), icon: Briefcase, color: 'text-blue-600' },
          { name: 'Total Applications', value: String(totalApplications), icon: Users, color: 'text-green-600' },
          { name: 'Pending Review', value: String(pending), icon: FileText, color: 'text-yellow-600' },
          { name: 'Hired', value: String(closedJobs.length), icon: CheckCircle, color: 'text-purple-600' },
        ]);
      } catch (err) {
        console.error('Failed to fetch recruiter dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleDeleteJob = async (jobId: number) => {
    setModalLoading(true);
    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs(prev => prev.filter(job => job.id !== jobId));
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleSaveJob = async (jobId: number, updatedData: Partial<Job>) => {
    setModalLoading(true);
    try {
      const res = await api.put(`/jobs/${jobId}`, updatedData);
      setJobs(prev =>
        prev.map(job => (job.id === jobId ? { ...job, ...res.data } : job))
      );
      setShowEditModal(false);
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-md">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Recruiter Dashboard</h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your job postings today.</p>
        </div>
        <button
          onClick={() => onNavigate('post-job')}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-transform hover:scale-105"
        >
          <PlusCircle size={20} />
          <span>Post a New Job</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.name} {...stat} />
        ))}
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 flex justify-between items-center border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Recent Job Postings</h2>
          <button
            onClick={() => onNavigate('my-jobs')}
            className="flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <span>View All Jobs</span>
            <ArrowRight size={16} className="ml-1" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-700">Job Title</th>
                <th className="p-4 text-sm font-semibold text-gray-700">Location</th>
                <th className="p-4 text-sm font-semibold text-gray-700">Applications</th>
                <th className="p-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-700 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    Loading jobs...
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No jobs found.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-indigo-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{job.title}</td>
                    <td className="p-4 text-gray-700">{job.location}</td>
                    <td className="p-4 text-center text-gray-600">{job.applications}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full ${
                          job.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="p-4 flex justify-center items-center space-x-3">
                      <button
                        className="text-blue-500 hover:text-blue-700 transition"
                        title="View Job"
                        onClick={() => onNavigate('job-details', job.id)}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="text-green-500 hover:text-green-700 transition"
                        title="Edit Job"
                        onClick={() => {
                          setSelectedJob(job);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700 transition"
                        title="Delete Job"
                        onClick={() => {
                          setSelectedJob(job);
                          setShowDeleteModal(true);
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {selectedJob && showEditModal && (
        <EditJobModal
          job={selectedJob}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveJob}
          isLoading={modalLoading}
        />
      )}
      {selectedJob && showDeleteModal && (
        <DeleteJobModal
          job={selectedJob}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteJob}
          isLoading={modalLoading}
        />
      )}
    </div>
  );
};

export default RecruiterDashboard;
