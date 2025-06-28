import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/useAuth'; // ✅ Access authentication state
import ProtectedRoute from './components/ProtectedRoute';
import Topbar from './components/Topbar';

// Page components
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import PostJob from './pages/PostJob';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Applications from './pages/Applications';
import MyJobs from './pages/MyJobs';
import Profile from './pages/Profile';

const App: React.FC = () => {
  // Debug log
  console.log('App.tsx: Component rendering start.');

  // Page navigation state
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedJobId, setSelectedJobId] = useState<number | undefined>(undefined);

  // Track if we've navigated after authentication
  const [hasNavigatedAfterAuth, setHasNavigatedAfterAuth] = useState(false);

  // Pull user/auth state from context
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  console.log(`App.tsx: useAuth values - isAuthenticated: ${isAuthenticated}, user:`, user, `authLoading: ${authLoading}`);

  // Handle page navigation
  const handleNavigate = useCallback((page: string, param?: number | string) => {
    console.log('App.tsx: Navigating to:', page, 'Param:', param);
    setCurrentPage(page);

    if (page === 'login' || page === 'register' || page === 'home') {
      setHasNavigatedAfterAuth(false); // Reset post-login redirect
    }

    // Set job ID if going to job-details
    if (page === 'job-details' && typeof param === 'number') {
      setSelectedJobId(param);
    } else {
      setSelectedJobId(undefined);
    }
  }, []);

  // Automatically redirect after authentication
  useEffect(() => {
    console.log(`App.tsx useEffect: isAuthenticated: ${isAuthenticated}, user: ${user?.username ?? 'null'}, authLoading: ${authLoading}, hasNavigatedAfterAuth: ${hasNavigatedAfterAuth}`);

    if (authLoading) return; // Wait until auth status is resolved

    if (!hasNavigatedAfterAuth) {
      if (isAuthenticated && user) {
        // ✅ Authenticated — decide where to redirect user based on role
        let targetPage: string;

        if (user.role === 'recruiter') {
          targetPage = 'my-jobs';
        } else if (user.role === 'job_seeker') {
          targetPage = 'dashboard';
        } else {
          targetPage = 'home';
        }

        if (currentPage !== targetPage) {
          console.log(`App.tsx: Redirecting to ${targetPage}`);
          handleNavigate(targetPage);
        }

        setHasNavigatedAfterAuth(true);
      } else {
        // ❌ Not authenticated — redirect from protected pages to login
        const protectedRoutes = ['dashboard', 'my-jobs', 'job-details', 'profile', 'applications', 'post-job'];
        if (protectedRoutes.includes(currentPage)) {
          console.log(`App.tsx: Redirecting to login from protected route: ${currentPage}`);
          handleNavigate('login');
        }

        setHasNavigatedAfterAuth(false);
      }
    }
  }, [isAuthenticated, user, authLoading, currentPage, handleNavigate, hasNavigatedAfterAuth]);

  // Renders pages based on currentPage state
  const renderContent = () => {
    if (authLoading) {
      // Show spinner while auth state is loading
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-700 font-medium">Authenticating...</p>
          </div>
        </div>
      );
    }

    // Render content based on current page
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'jobs':
        return <Jobs onNavigate={handleNavigate} />;
      case 'job-details':
        return selectedJobId !== undefined ? (
          <JobDetails jobId={selectedJobId} onNavigate={handleNavigate} />
        ) : (
          <p className="text-center py-10 text-red-600">Job ID not provided.</p>
        );
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

  // Final JSX return (AuthProvider removed — now handled in main.tsx)
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Topbar onNavigate={handleNavigate} />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        {renderContent()}
      </main>
      <footer className="bg-gray-900 text-gray-300 py-6 text-center mt-auto">
        <p>&copy; {new Date().getFullYear()} Job Board Pro. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
