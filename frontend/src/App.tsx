// src/App.tsx
import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext'; // Ensure this import is correct
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
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Applications from './pages/Applications';
import MyJobs from './pages/MyJobs';
import Profile from './pages/Profile';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedJobId, setSelectedJobId] = useState<number | undefined>(undefined);

  const handleNavigate = (page: string, param?: number | string) => { 
    console.log('App.tsx: handleNavigate called - Page:', page, 'Param:', param, 'Type:', typeof param);

    setCurrentPage(page);
    
    if (page === 'job-details' && typeof param === 'number') {
      setSelectedJobId(param);
      console.log('App.tsx: Setting selectedJobId to', param);
    } else {
      setSelectedJobId(undefined);
      console.log('App.tsx: Resetting selectedJobId (or param not a number for job-details)');
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
      case 'forgot-password':
        return <ForgotPassword onNavigate={handleNavigate} />;
      case 'reset-password':
        return <ResetPassword onNavigate={handleNavigate} />;
      case 'dashboard':
        return (
          <ProtectedRoute fallback={<Login onNavigate={handleNavigate} />} allowedRoles={['recruiter', 'job_seeker']}>
            <Dashboard onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      case 'post-job':
        return (
          <ProtectedRoute fallback={<Login onNavigate={handleNavigate} />} allowedRoles={['recruiter']}>
            <PostJob onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      case 'applications':
        return (
          <ProtectedRoute fallback={<Login onNavigate={handleNavigate} />} allowedRoles={['job_seeker']}>
            <Applications onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      case 'my-jobs':
        return (
          <ProtectedRoute fallback={<Login onNavigate={handleNavigate} />} allowedRoles={['recruiter']}>
            <MyJobs onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      case 'profile':
        return (
          <ProtectedRoute fallback={<Login onNavigate={handleNavigate} />} allowedRoles={['recruiter', 'job_seeker']}>
            <Profile onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    // THE <AuthProvider> MUST WRAP EVERYTHING THAT USES THE AUTH CONTEXT
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Topbar is now correctly placed INSIDE AuthProvider */}
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
