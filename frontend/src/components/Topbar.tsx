// src/components/Topbar.tsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';

interface TopbarProps {
  onNavigate: (page: string) => void;
}

const Topbar: React.FC<TopbarProps> = ({ onNavigate }) => {
  const { isAuthenticated, user, logout } = useAuth(); // User type comes from useAuth context

  const handleLogout = () => {
    logout();
    onNavigate('home'); // Redirect to home after logout
  };

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo/Home Button */}
        <button
          onClick={() => onNavigate('home')}
          className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition"
        >
          JobBoard Pro
        </button>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          <button onClick={() => onNavigate('jobs')} className="hover:text-blue-300 transition">
            Jobs
          </button>
          {isAuthenticated && user?.role === 'recruiter' && (
            <button onClick={() => onNavigate('post-job')} className="hover:text-blue-300 transition">
              Post Job
            </button>
          )}
          {isAuthenticated ? (
            <>
              <button onClick={() => onNavigate('dashboard')} className="hover:text-blue-300 transition">
                Dashboard
              </button>
              <span className="text-gray-400">Welcome, {user?.username} ({user?.role})</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => onNavigate('login')} className="hover:text-blue-300 transition">
                Login
              </button>
              <button onClick={() => onNavigate('register')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition">
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Topbar;