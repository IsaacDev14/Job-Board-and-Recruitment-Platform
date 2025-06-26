// src/components/Topbar.tsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { FaBriefcase, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaTachometerAlt, FaPlusSquare, FaListAlt, FaRegUserCircle, FaUser } from 'react-icons/fa';

interface TopbarProps {
  onNavigate: (page: string) => void;
}

const Topbar: React.FC<TopbarProps> = ({ onNavigate }) => {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onNavigate('login');
  };

  return (
    <header className="bg-gray-900 text-white shadow-xl sticky top-0 z-50"> {/* Stronger shadow for depth */}
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center py-4 px-4 sm:px-6 lg:px-8">
        {/* Logo/Brand */}
        <button onClick={() => onNavigate('home')} className="flex items-center space-x-2 text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors duration-200 mb-4 sm:mb-0"> {/* Adjusted size and smoother transition */}
          <FaBriefcase className="text-blue-300" />
          <span>JobBoardPro</span>
        </button>

        {/* Navigation Links */}
        <nav className="flex flex-wrap justify-center sm:justify-end items-center gap-x-5 gap-y-2 text-base"> {/* Refined gap, slightly smaller text for balance */}
          <button onClick={() => onNavigate('jobs')} className="flex items-center font-medium px-3 py-1 rounded-md hover:bg-gray-800 hover:text-blue-400 transition-colors duration-200">
            Jobs
          </button>

          {isAuthenticated ? (
            <>
              {/* Display User Name */}
              {user?.username && (
                <div className="flex items-center px-3 py-1 rounded-md bg-gray-800 text-blue-200 font-semibold"> {/* Cleaned up background and text color */}
                  <FaUser className="mr-2 text-blue-300" />
                  <span>{user.username}</span>
                </div>
              )}

              {/* Common protected links */}
              <button onClick={() => onNavigate('dashboard')} className="flex items-center font-medium px-3 py-1 rounded-md hover:bg-gray-800 hover:text-blue-400 transition-colors duration-200">
                <FaTachometerAlt className="mr-1" /> Dashboard
              </button>
              <button onClick={() => onNavigate('profile')} className="flex items-center font-medium px-3 py-1 rounded-md hover:bg-gray-800 hover:text-blue-400 transition-colors duration-200">
                <FaRegUserCircle className="mr-1" /> Profile
              </button>

              {user?.role === 'recruiter' && (
                <>
                  <button onClick={() => onNavigate('post-job')} className="flex items-center font-medium px-3 py-1 rounded-md hover:bg-gray-800 hover:text-blue-400 transition-colors duration-200">
                    <FaPlusSquare className="mr-1" /> Post Job
                  </button>
                  <button onClick={() => onNavigate('my-jobs')} className="flex items-center font-medium px-3 py-1 rounded-md hover:bg-gray-800 hover:text-blue-400 transition-colors duration-200">
                    <FaListAlt className="mr-1" /> My Jobs
                  </button>
                </>
              )}

              {user?.role === 'job_seeker' && (
                <button onClick={() => onNavigate('applications')} className="flex items-center font-medium px-3 py-1 rounded-md hover:bg-gray-800 hover:text-blue-400 transition-colors duration-200">
                  <FaListAlt className="mr-1" /> My Applications
                </button>
              )}

              {/* Logout button */}
              <button onClick={handleLogout} className="flex items-center font-medium px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 transition-colors duration-200 sm:ml-2"> {/* Added sm:ml-2 for spacing consistency */}
                <FaSignOutAlt className="mr-1" /> Logout
              </button>
            </>
          ) : (
            <>
              {/* Unauthenticated links */}
              <button onClick={() => onNavigate('login')} className="flex items-center font-medium px-3 py-1 rounded-md hover:bg-gray-800 hover:text-blue-400 transition-colors duration-200">
                <FaSignInAlt className="mr-1" /> Login
              </button>
              <button onClick={() => onNavigate('register')} className="flex items-center font-medium px-3 py-1 rounded-md hover:bg-gray-800 hover:text-blue-400 transition-colors duration-200">
                <FaUserPlus className="mr-1" /> Register
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Topbar;
