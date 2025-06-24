// App.tsx
import React, { useState } from 'react';
import Topbar from './components/Topbar'; // Import Topbar component
import Home from './pages/Home'; // Import Home page

/**
 * Root component of the application.
 * Controls the current page state and renders content accordingly.
 */
const App: React.FC = () => {
  // Track which page is currently being viewed
  const [currentPage, setCurrentPage] = useState('home');

  /**
   * Render page content based on the value of `currentPage`
   */
  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      default:
        return <Home onNavigate={setCurrentPage} />; // Default fallback to Home
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased text-gray-800">
      {/* Navigation bar at the top */}
      <Topbar onNavigate={setCurrentPage} />

      {/* Main content area */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {renderContent()}
      </main>

      {/* Footer section */}
      <footer className="w-full bg-gray-900 text-gray-300 py-6 text-center text-sm mt-12">
        <p>&copy; {new Date().getFullYear()} Job Board Pro. All rights reserved.</p>
        <p className="mt-1">Built with React & Tailwind CSS</p>
      </footer>
    </div>
  );
};

export default App;
