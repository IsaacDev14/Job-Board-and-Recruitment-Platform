// Topbar.tsx
import React, { useState } from 'react';

interface TopbarProps {
  onNavigate: (page: string) => void;
}

/**
 * Topbar component - Displays app logo and navigation menu.
 * Handles both desktop and mobile views with responsive design.
 */
const Topbar: React.FC<TopbarProps> = ({ onNavigate }) => {
  // State to toggle mobile menu visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Toggle mobile menu
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Handle link click and trigger navigation
  const handleNavLinkClick = (page: string) => {
    onNavigate(page);
    setIsMenuOpen(false); // Close mobile menu after navigation
  };

  return (
    <nav className="bg-white shadow-md py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo / Brand */}
        <button
          onClick={() => handleNavLinkClick('home')}
          className="text-2xl font-extrabold text-blue-600 flex items-center"
        >
          <svg className="h-8 w-8 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 10v4c0 1.1.9 2 2 2h4v-2H5v-4h4V8H5c-1.1 0-2 .9-2 2zM19 10v4c0 1.1-.9 2-2 2h-4v-2h4v-4h-4V8h4c1.1 0 2 .9 2 2zM12 4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2s2-.9 2-2V6c0-1.1-.9-2-2-2z"/>
          </svg>
          Job Board Pro
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex space-x-6">
          {['home', 'jobs', 'post-job', 'login', 'register'].map(page => (
            <button
              key={page}
              onClick={() => handleNavLinkClick(page)}
              className="text-gray-700 hover:text-blue-600 font-medium capitalize"
            >
              {page === 'post-job' ? 'Post a Job' : page.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="p-2 text-gray-600">
            {isMenuOpen ? '✖' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden px-4 py-2 space-y-2">
          {['home', 'jobs', 'post-job', 'login', 'register'].map(page => (
            <button
              key={page}
              onClick={() => handleNavLinkClick(page)}
              className="block w-full text-left text-gray-700 hover:text-blue-600 capitalize"
            >
              {page === 'post-job' ? 'Post a Job' : page.replace('-', ' ')}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Topbar;
