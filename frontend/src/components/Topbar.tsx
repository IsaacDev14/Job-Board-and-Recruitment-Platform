// src/components/Topbar.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/useAuth'; // Correct import path for useAuth
import { LogOut, Home, Briefcase, User, Heart, Settings, PlusCircle, LayoutDashboard, Compass } from 'lucide-react';
import { FaBars, FaTimes } from 'react-icons/fa';

interface TopbarProps {
  onNavigate: (page: string) => void;
}

const Topbar: React.FC<TopbarProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavLinkClick = (page: string) => {
    onNavigate(page);
    setIsMobileMenuOpen(false); // Close menu on navigation
  };

  // Helper component for Desktop Navigation Links
  const NavLink: React.FC<{ icon: React.ReactNode; text: string; onClick: () => void }> = ({ icon, text, onClick }) => (
    <button
      onClick={onClick}
      className="text-gray-300 hover:text-blue-300 px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 transition-colors duration-200"
    >
      {icon} {text}
    </button>
  );

  // Helper component for Mobile Navigation Links
  const MobileNavLink: React.FC<{ icon: React.ReactNode; text: string; onClick: () => void }> = ({ icon, text, onClick }) => (
    <button
      onClick={onClick}
      className="w-full text-left text-gray-200 hover:bg-gray-700 hover:text-blue-300 px-3 py-2 rounded-md text-lg font-medium flex items-center gap-3 transition-colors duration-200"
    >
      {icon} {text}
    </button>
  );

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-900 shadow-xl z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo / Site Title */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavLinkClick('home')}
              className="flex items-center text-2xl font-extrabold text-blue-400 hover:text-blue-300 transition-colors duration-200"
            >
              <Briefcase size={24} className="text-blue-300 mr-2" />
              JobBoard
            </button>
          </div>

          {/* Desktop Navigation Links (Pushed slightly right using ml-auto) */}
          <div className="hidden md:flex items-center space-x-6 ml-auto mr-4">
            <NavLink icon={<Home size={18} />} text="Home" onClick={() => handleNavLinkClick('home')} />

            {isAuthenticated && user?.role === 'job_seeker' && (
              <>
                <NavLink icon={<Compass size={18} />} text="Dashboard" onClick={() => handleNavLinkClick('dashboard')} />
                <NavLink icon={<Briefcase size={18} />} text="My Applications" onClick={() => handleNavLinkClick('applications')} />
                <NavLink icon={<Heart size={18} />} text="Saved Jobs" onClick={() => handleNavLinkClick('saved-jobs')} />
              </>
            )}

            {isAuthenticated && user?.role === 'recruiter' && (
              <>
                {/* Both Dashboard and My Jobs will now navigate to 'my-jobs' */}
                <NavLink icon={<LayoutDashboard size={18} />} text="Dashboard" onClick={() => handleNavLinkClick('my-jobs')} />
                <NavLink icon={<Briefcase size={18} />} text="My Jobs" onClick={() => handleNavLinkClick('my-jobs')} />
                <NavLink icon={<PlusCircle size={18} />} text="Post Job" onClick={() => handleNavLinkClick('post-job')} />
              </>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <NavLink icon={<Settings size={18} />} text="Admin" onClick={() => handleNavLinkClick('admin-dashboard')} />
            )}

            {isAuthenticated && (
              <NavLink icon={<User size={18} />} text="Profile" onClick={() => handleNavLinkClick('profile')} />
            )}
          </div>

          {/* Auth Buttons / User Info */}
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-200 text-base font-medium">Hello, {user?.username}</span>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 flex items-center gap-2 transition-colors duration-200 shadow-md"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            ) : (
              <div className="space-x-3">
                <button
                  onClick={() => handleNavLinkClick('login')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-blue-300 border-2 border-blue-300 hover:bg-gray-800 transition-colors duration-200"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavLinkClick('register')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 shadow-md"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button (Hamburger) */}
          <div className="-mr-2 flex md:hidden items-center">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <FaTimes className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <FaBars className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-700 py-2 bg-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <MobileNavLink icon={<Home size={20} />} text="Home" onClick={() => handleNavLinkClick('home')} />

            {isAuthenticated && user?.role === 'job_seeker' && (
              <>
                <MobileNavLink icon={<Compass size={20} />} text="Dashboard" onClick={() => handleNavLinkClick('dashboard')} />
                <MobileNavLink icon={<Briefcase size={20} />} text="My Applications" onClick={() => handleNavLinkClick('applications')} />
                <MobileNavLink icon={<Heart size={20} />} text="Saved Jobs" onClick={() => handleNavLinkClick('saved-jobs')} />
              </>
            )}

            {isAuthenticated && user?.role === 'recruiter' && (
              <>
                {/* Both Dashboard and My Jobs will now navigate to 'my-jobs' */}
                <MobileNavLink icon={<LayoutDashboard size={20} />} text="Dashboard" onClick={() => handleNavLinkClick('my-jobs')} />
                <MobileNavLink icon={<Briefcase size={20} />} text="My Jobs" onClick={() => handleNavLinkClick('my-jobs')} />
                <MobileNavLink icon={<PlusCircle size={20} />} text="Post Job" onClick={() => handleNavLinkClick('post-job')} />
              </>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <MobileNavLink icon={<Settings size={20} />} text="Admin" onClick={() => handleNavLinkClick('admin-dashboard')} />
            )}

            {isAuthenticated && (
              <MobileNavLink icon={<User size={20} />} text="Profile" onClick={() => handleNavLinkClick('profile')} />
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            {isAuthenticated ? (
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <User className="h-9 w-9 rounded-full text-gray-300 bg-gray-700 p-1" />
                </div>
                <div className="ml-3">
                  <div className="text-lg font-semibold text-gray-100">{user?.username}</div>
                  <div className="text-sm font-medium text-gray-400">{user?.email}</div>
                </div>
                <button
                  onClick={logout}
                  className="ml-auto flex-shrink-0 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors duration-200 shadow-md"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            ) : (
              <div className="px-5 space-y-3">
                <button
                  onClick={() => handleNavLinkClick('login')}
                  className="w-full text-center px-4 py-2 rounded-lg text-base font-semibold text-blue-300 border-2 border-blue-300 hover:bg-gray-800"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavLinkClick('register')}
                  className="w-full text-center px-4 py-2 rounded-lg text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Topbar;
