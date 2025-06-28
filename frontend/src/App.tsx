import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Topbar from './components/Topbar';

// Page components
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import PostJob from './pages/PostJob';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Applications from './pages/Applications';
import MyJobs from './pages/MyJobs';
import Profile from './pages/Profile';
import SavedJobs from './pages/SavedJobs';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedJobId, setSelectedJobId] = useState<number | undefined>(undefined);
  const [hasNavigatedAfterAuth, setHasNavigatedAfterAuth] = useState(false);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const handleNavigate = useCallback((page: string, param?: number | string) => {
    setCurrentPage(page);
    if (page === 'job-details' && typeof param === 'number') {
      setSelectedJobId(param);
    } else {
      setSelectedJobId(undefined);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!hasNavigatedAfterAuth) {
      if (isAuthenticated && user) {
        let targetPage: string;

        if (user.role === 'recruiter') targetPage = 'recruiter-dashboard';
        else if (user.role === 'job_seeker') targetPage = 'dashboard';
        else targetPage = 'home';

        const isAtEntryPage = ['login', 'register', 'home'].includes(currentPage);

        if (currentPage !== targetPage && isAtEntryPage) {
          handleNavigate(targetPage);
          setHasNavigatedAfterAuth(true);
          return;
        }

        // Even if already on correct page, we can set it as "navigated"
        setHasNavigatedAfterAuth(true);
      } else {
        const protectedRoutes = [
          'dashboard',
          'recruiter-dashboard',
          'my-jobs',
          'job-details',
          'profile',
          'applications',
          'post-job',
          'saved-jobs'
        ];

        if (protectedRoutes.includes(currentPage)) {
          handleNavigate('login');
        }

        setHasNavigatedAfterAuth(false);
      }
    } else if (!isAuthenticated) {
      setHasNavigatedAfterAuth(false);
    }
  }, [isAuthenticated, user, authLoading, currentPage, handleNavigate, hasNavigatedAfterAuth]);

  const renderContent = () => {
    if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-700 font-medium">Authenticating...</p>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'home': return <Home onNavigate={handleNavigate} />;
      case 'jobs': return <Jobs onNavigate={handleNavigate} />;
      case 'job-details':
        return selectedJobId !== undefined
          ? <JobDetails jobId={selectedJobId} onNavigate={handleNavigate} />
          : <p>Job ID not provided.</p>;
      case 'login': return <Login onNavigate={handleNavigate} />;
      case 'register': return <Register onNavigate={handleNavigate} />;
      case 'forgot-password': return <ForgotPassword onNavigate={handleNavigate} />;
      case 'reset-password': return <ResetPassword onNavigate={handleNavigate} />;
      case 'dashboard':
        return (
          <ProtectedRoute fallback={<Login onNavigate={handleNavigate} />} allowedRoles={['job_seeker']}>
            <JobSeekerDashboard onNavigate={handleNavigate} />
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
      case 'saved-jobs':
        return (
          <ProtectedRoute fallback={<Login onNavigate={handleNavigate} />} allowedRoles={['job_seeker']}>
            <SavedJobs onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      case 'recruiter-dashboard':
        return (
          <ProtectedRoute fallback={<Login onNavigate={handleNavigate} />} allowedRoles={['recruiter']}>
            <RecruiterDashboard onNavigate={handleNavigate} />
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
          <ProtectedRoute fallback={<Login onNavigate={handleNavigate} />} allowedRoles={['recruiter', 'job_seeker', 'admin']}>
            <Profile onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Topbar onNavigate={handleNavigate} />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        {renderContent()}
      </main>
      <footer className="bg-gray-900 text-gray-300 py-6 text-center mt-auto">
        <p>&copy; {new Date().getFullYear()} Job Board Pro. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
