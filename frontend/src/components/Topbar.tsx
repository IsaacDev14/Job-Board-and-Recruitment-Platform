// Topbar.tsx
import React, { useState } from 'react';

interface TopbarProps {
  onNavigate: (page: string) => void;
}

interface NavLinkProps {
  text: string;
  onClick: () => void;
  mobile?: boolean;
}

// Navigation link component used in both desktop and mobile views
const NavLink: React.FC<NavLinkProps> = ({ text, onClick, mobile = false }) => (
  <button
    onClick={onClick}
    className={`
      ${mobile
        ? 'block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700'
        : 'text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium text-lg'}
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
    `}
  >
    {text}
  </button>
);

// Topbar navigation component with mobile toggle
const Topbar: React.FC<TopbarProps> = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleNavLinkClick = (page: string) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo / Brand */}
        <div className="flex-shrink-0">
          <button
            onClick={() => handleNavLinkClick('home')}
            className="flex items-center text-2xl font-extrabold text-blue-600 tracking-tight"
          >
            <svg className="h-8 w-8 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 10v4c0 1.1.9 2 2 2h4v-2H5v-4h4V8H5c-1.1 0-2 .9-2 2zm16 0v4c0 1.1-.9 2-2 2h-4v-2h4v-4h-4V8h4c1.1 0 2 .9 2 2zM12 4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2s2-.9 2-2V6c0-1.1-.9-2-2-2z" />
            </svg>
            Job Board Pro
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          <NavLink text="Home" onClick={() => handleNavLinkClick('home')} />
          <NavLink text="Find Jobs" onClick={() => handleNavLinkClick('jobs')} />
          <NavLink text="Post a Job" onClick={() => { alert("Recruiter feature! Please login."); handleNavLinkClick('login'); }} />
          <NavLink text="Login" onClick={() => handleNavLinkClick('login')} />
          <NavLink text="Register" onClick={() => handleNavLinkClick('register')} />
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-2"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div id="mobile-menu" className="md:hidden px-2 pt-2 pb-3 space-y-2 bg-white border-t border-gray-200">
          <NavLink text="Home" mobile onClick={() => handleNavLinkClick('home')} />
          <NavLink text="Find Jobs" mobile onClick={() => handleNavLinkClick('jobs')} />
          <NavLink text="Post a Job" mobile onClick={() => { alert("Recruiter feature! Please login."); handleNavLinkClick('login'); }} />
          <NavLink text="Login" mobile onClick={() => handleNavLinkClick('login')} />
          <NavLink text="Register" mobile onClick={() => handleNavLinkClick('register')} />
        </div>
      )}
    </nav>
  );
};

export default Topbar;
