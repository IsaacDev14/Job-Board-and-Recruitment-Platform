// src/App.tsx
import React, { useState } from 'react';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './context/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Topbar from './components/Topbar';

// Page components
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard'; // This is your generic job seeker dashboard
import PostJob from './pages/PostJob';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Applications from './pages/Applications'; // For job seekers
import MyJobs from './pages/MyJobs'; // This is your recruiter's "dashboard"
import Profile from './pages/Profile';
// import SavedJobs from './pages/SavedJobs'; // Uncomment if you have this page
// import AdminDashboard from './pages/AdminDashboard'; // Uncomment if you have this page

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedJobId, setSelectedJobId] = useState<number | undefined>(undefined);

  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const handleNavigate = (page: string, param?: number | string) => {
    console.log('App.tsx: handleNavigate called - Requesting Page:', page, 'Param:', param, 'Type:', typeof param); // Debug log
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
    console.log(`App.tsx: renderContent - Current Page: ${currentPage}, Is Authenticated: ${isAuthenticated}, User Role: ${user?.role}, Auth Loading: ${authLoading}`); // Debug log

    if (authLoading) {
      console.log("App.tsx: renderContent - Auth is still loading, showing spinner."); // Debug log
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
      case 'home':
        console.log("App.tsx: renderContent - Rendering Home page."); // Debug log
        return <Home onNavigate={handleNavigate} />;
      case 'jobs':
        console.log("App.tsx: renderContent - Rendering Jobs page."); // Debug log
        return <Jobs onNavigate={handleNavigate} />;
      case 'job-details': {
        console.log("App.tsx: renderContent - Rendering JobDetails page."); // Debug log
        return selectedJobId !== undefined ? (
          <JobDetails jobId={selectedJobId} onNavigate={handleNavigate} />
        ) : (
          <p className="text-center py-10 text-red-600">Job ID not provided.</p>
        );
      }
      case 'login':
        console.log("App.tsx: renderContent - Rendering Login page."); // Debug log
        return <Login onNavigate={handleNavigate} />;
      case 'register':
        console.log("App.tsx: renderContent - Rendering Register page."); // Debug log
        return <Register onNavigate={handleNavigate} />;
      case 'forgot-password':
        console.log("App.tsx: renderContent - Rendering ForgotPassword page."); // Debug log
        return <ForgotPassword onNavigate={handleNavigate} />;
      case 'reset-password':
        console.log("App.tsx: renderContent - Rendering ResetPassword page."); // Debug log
        return <ResetPassword onNavigate={handleNavigate} />;

      case 'dashboard': // This case now acts as a router for dashboards
        console.log(`App.tsx: renderContent - Navigating to Dashboard logic. Is Authenticated: ${isAuthenticated}, User Role: ${user?.role}`); // Debug log
        if (!isAuthenticated) {
          console.log("App.tsx: renderContent - Dashboard: Not authenticated, redirecting to Login."); // Debug log
          return <Login onNavigate={handleNavigate} />;
        }
        if (user?.role === 'recruiter') {
          console.log("App.tsx: renderContent - Dashboard: User is Recruiter, rendering MyJobs."); // Debug log
          return (
            <ProtectedRoute fallback={<Login onNavigate={handleNavigate} />} allowedRoles={['recruiter']}>
              <MyJobs onNavigate={handleNavigate} />
            </ProtectedRoute>
          );
        } else if (user?.role === 'job_seeker') {
          console.log("App.tsx: renderContent - Dashboard: User is Job Seeker, rendering Dashboard."); // Debug log
          return (
            <ProtectedRoute fallback={<Login onNavigate={handleNavigate} />} allowedRoles={['job_seeker']}>
              <Dashboard onNavigate={handleNavigate} />
            </ProtectedRoute>
          );
        } else {
          console.log("App.tsx: renderContent - Dashboard: Unknown user role or role not set, showing access denied."); // Debug log
          return <p className="text-center py-10 text-red-600">Access Denied: Unknown role.</p>;
        }

      case 'post-job':
        console.log("App.tsx: renderContent - Rendering PostJob page."); // Debug log
        return (
          <ProtectedRoute fallback={<Login onNavigate={handleNavigate} />} allowedRoles={['recruiter']}>
            <PostJob onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      case 'applications': // Job seeker's applications
        console.log("App.tsx: renderContent - Rendering Applications page."); // Debug log
        return (
          <ProtectedRoute fallback={<Login onNavigate={handleNavigate} />} allowedRoles={['job_seeker']}>
            <Applications onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      case 'my-jobs': // Recruiter's specific dashboard
        console.log("App.tsx: renderContent - Rendering MyJobs page."); // Debug log
        return (
          <ProtectedRoute fallback={<Login onNavigate={handleNavigate} />} allowedRoles={['recruiter']}>
            <MyJobs onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      case 'profile':
        console.log("App.tsx: renderContent - Rendering Profile page."); // Debug log
        return (
          <ProtectedRoute fallback={<Login onNavigate={handleNavigate} />} allowedRoles={['recruiter', 'job_seeker', 'admin']}>
            <Profile onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      // case 'saved-jobs': // Uncomment and add if you have this page
      //   return (
      //     <ProtectedRoute fallback={<Login onNavigate={handleNavigate} />} allowedRoles={['job_seeker']}>
      //       <SavedJobs onNavigate={handleNavigate} />
      //     </ProtectedRoute>
      //   );
      // case 'admin-dashboard': // Uncomment and add if you have this page
      //   return (
      //     <ProtectedRoute fallback={<Login onNavigate={handleNavigate} />} allowedRoles={['admin']}>
      //       <AdminDashboard onNavigate={handleNavigate} />
      //     </ProtectedRoute>
      //   );
      default:
        console.log("App.tsx: renderContent - Rendering default Home page."); // Debug log
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Topbar onNavigate={handleNavigate} />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 mt-16">
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
