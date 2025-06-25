// src/App.tsx
import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Topbar from './components/Topbar';

// Page components
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PostJob from './pages/PostJob';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedJobId, setSelectedJobId] = useState<number | undefined>(undefined);

  // FIX: Change 'param?: number' to 'param?: number | string'
  // This makes the handleNavigate function compatible with Home.tsx and PostJob.tsx
  const handleNavigate = (page: string, param?: number | string) => { // MODIFIED PARAM TYPE HERE
    setCurrentPage(page);
    
    // Logic for setting selectedJobId (which must be a number)
    if (page === 'job-details' && typeof param === 'number') {
      setSelectedJobId(param);
    } else {
      // For all other pages, or if param is not a number for job-details, reset selectedJobId
      setSelectedJobId(undefined);
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'jobs':
        return <Jobs onNavigate={handleNavigate} />;
      case 'job-details': {
        return selectedJobId !== undefined ? (
          <JobDetails jobId={selectedJobId} onNavigate={handleNavigate} />
        ) : (
          <p className="text-center py-10 text-red-600">Job ID not provided.</p>
        );
      }
      case 'login':
        return <Login onNavigate={handleNavigate} />;
      case 'register':
        return <Register onNavigate={handleNavigate} />;
      case 'post-job':
        return (
          <ProtectedRoute fallback={<Login onNavigate={handleNavigate} />} allowedRoles={['recruiter']}>
            <PostJob onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      case 'dashboard':
        return (
          <ProtectedRoute fallback={<Login onNavigate={handleNavigate} />} allowedRoles={['recruiter', 'job_seeker']}>
            <Dashboard onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Topbar onNavigate={handleNavigate} />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          {renderContent()}
        </main>
        <footer className="bg-gray-900 text-gray-300 py-6 text-center mt-auto">
          <p>&copy; {new Date().getFullYear()} Job Board Pro. All rights reserved.</p>
        </footer>
      </div>
    </AuthProvider>
  );
};

export default App;