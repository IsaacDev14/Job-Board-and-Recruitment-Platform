import React from 'react';
import { Briefcase, CheckCircle, FileText, PlusCircle, Users, ArrowRight, Eye, Edit, Trash2 } from 'lucide-react';

// Mock data for demonstration purposes
const stats = [
  { name: 'Active Listings', value: '12', icon: Briefcase, color: 'text-blue-500' },
  { name: 'Total Applications', value: '256', icon: Users, color: 'text-green-500' },
  { name: 'Pending Review', value: '32', icon: FileText, color: 'text-yellow-500' },
  { name: 'Hired', value: '8', icon: CheckCircle, color: 'text-teal-500' },
];

const recentJobs = [
  { id: 1, title: 'Senior Frontend Developer', location: 'San Francisco, CA', applications: 45, status: 'Active' },
  { id: 2, title: 'Lead Product Designer', location: 'New York, NY', applications: 28, status: 'Active' },
  { id: 3, title: 'DevOps Engineer', location: 'Austin, TX (Remote)', applications: 62, status: 'Active' },
  { id: 4, title: 'Junior QA Tester', location: 'Chicago, IL', applications: 15, status: 'Closed' },
];

interface RecruiterDashboardProps {
  onNavigate: (page: string, param?: number | string) => void;
}

const StatCard: React.FC<{ name: string; value: string; icon: React.ElementType; color: string }> = ({ name, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center space-x-4">
    <div className={`p-3 rounded-full bg-gray-100 ${color}`}>
      <Icon size={28} />
    </div>
    <div>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500 font-medium">{name}</p>
    </div>
  </div>
);

const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8">
      {/* Header Section */}
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.name} {...stat} />
        ))}
      </div>

      {/* Recent Job Postings Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 flex justify-between items-center border-b border-gray-200">
           <h2 className="text-2xl font-bold text-gray-800">Recent Job Postings</h2>
           <button onClick={() => onNavigate('my-jobs')} className="flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800">
             <span>View All Jobs</span>
             <ArrowRight size={16} className="ml-1"/>
           </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600">Job Title</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Location</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Applications</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{job.title}</td>
                  <td className="p-4 text-gray-600">{job.location}</td>
                  <td className="p-4 text-gray-600 text-center">{job.applications}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${job.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="p-4 flex justify-center items-center space-x-3">
                     <button className="text-gray-500 hover:text-blue-600" title="View Job"><Eye size={18} /></button>
                     <button className="text-gray-500 hover:text-green-600" title="Edit Job"><Edit size={18} /></button>
                     <button className="text-gray-500 hover:text-red-600" title="Delete Job"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;