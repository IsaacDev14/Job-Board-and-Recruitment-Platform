// src/App.tsx
import { useState } from 'react';
import Topbar from './components/Topbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PostJob from './pages/PostJob';

/**
 * Placeholder component: Jobs Page
 */
const JobsPage = () => (
  <div className="py-20 text-center text-gray-700 min-h-[50vh] flex flex-col justify-center items-center">
    <h2 className="text-3xl font-bold mb-4">Job Listings</h2>
    <p className="text-lg">This is where all the job listings would appear. Filters and search will be added here.</p>
    <ul className="list-disc list-inside text-left mt-8 max-w-sm">
      <li>Software Engineer - Google</li>
      <li>Data Scientist - Microsoft</li>
      <li>UX Designer - Apple</li>
    </ul>
  </div>
);

/**
 * Main App Component
 * Handles navigation between pages and renders Topbar and footer
 */
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      case 'jobs':
        return <JobsPage />;
      case 'login':
        return <Login onNavigate={setCurrentPage} />;
      case 'register':
        return <Register onNavigate={setCurrentPage} />;
      case 'post-job':
        return <PostJob onNavigate={setCurrentPage} />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased text-gray-800">
      {/* Topbar receives navigation handler */}
      <Topbar onNavigate={setCurrentPage} />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-gray-300 py-6 text-center text-sm mt-12">
        <p>&copy; {new Date().getFullYear()} Job Board Pro. All rights reserved.</p>
        <p className="mt-1">Built by Isaac & Dorothy</p>
      </footer>
    </div>
  );
};

export default App;
