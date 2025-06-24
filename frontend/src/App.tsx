import React, { useState } from 'react';
import Topbar from './components/Topbar';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import PostJob from './pages/PostJob';
import sampleJobs from './data/SampleData.json';
import type { Job } from './pages/Jobs';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedJobId, setSelectedJobId] = useState<number>();
  const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined);

  // Handle navigation and optional parameters: jobId or category filter
  const handleNavigate = (page: string, param?: number | string) => {
    setCurrentPage(page);

    if (page === 'job-details' && typeof param === 'number') {
      setSelectedJobId(param);
    } else if (page === 'jobs' && typeof param === 'string') {
      setFilterCategory(param);
    } else {
      // Clear filter if navigating elsewhere or no param
      setFilterCategory(undefined);
      setSelectedJobId(undefined);
    }
  };

  // Render component based on current page and pass props
  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'jobs':
        return <Jobs onNavigate={handleNavigate} filterCategory={filterCategory} />;
      case 'job-details': {
        const job = (sampleJobs as Job[]).find(j => j.id === selectedJobId);
        return job ? <JobDetails job={job} onNavigate={handleNavigate} /> : <p>Job not found.</p>;
      }
      case 'login':
        return <Login onNavigate={handleNavigate} />;
      case 'register':
        return <Register onNavigate={handleNavigate} />;
      case 'post-job':
        return <PostJob onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar onNavigate={handleNavigate} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {renderContent()}
      </main>
      <footer className="bg-gray-900 text-gray-300 py-6 text-center">
        <p>&copy; {new Date().getFullYear()} Job Board Pro. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
