import React, { useState } from 'react';
import { Home, LayoutDashboard, Compass, Briefcase, PlusCircle, Heart, Settings, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/useAuth';

interface NavLinkProps {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
  mobile?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ icon, text, onClick, mobile = false }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 ${mobile
      ? 'w-full px-4 py-2 text-left text-white hover:bg-gray-800'
      : 'text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400'}`}
  >
    {icon}
    <span className="text-sm font-medium">{text}</span>
  </button>
);

const Topbar: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavLinkClick = (page: string) => {
    onNavigate(page);
    setMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 shadow z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
        <button onClick={() => handleNavLinkClick('home')} className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
          JobBoardPro
        </button>

        {/* Desktop Nav Links */}
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
              <NavLink icon={<LayoutDashboard size={18} />} text="Dashboard" onClick={() => handleNavLinkClick('recruiter-dashboard')} />
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

          {isAuthenticated ? (
            <button
              onClick={() => {
                logout();
                handleNavLinkClick('home');
              }}
              className="flex items-center space-x-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          ) : (
            <>
              <NavLink icon={<User size={18} />} text="Login" onClick={() => handleNavLinkClick('login')} />
              <NavLink icon={<User size={18} />} text="Register" onClick={() => handleNavLinkClick('register')} />
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden ml-auto text-gray-700 dark:text-gray-300" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-900 shadow-lg border-t border-gray-700">
          <nav className="flex flex-col space-y-1 py-4">
            <NavLink icon={<Home size={20} />} text="Home" onClick={() => handleNavLinkClick('home')} mobile />

            {isAuthenticated && user?.role === 'job_seeker' && (
              <>
                <NavLink icon={<Compass size={20} />} text="Dashboard" onClick={() => handleNavLinkClick('dashboard')} mobile />
                <NavLink icon={<Briefcase size={20} />} text="My Applications" onClick={() => handleNavLinkClick('applications')} mobile />
                <NavLink icon={<Heart size={20} />} text="Saved Jobs" onClick={() => handleNavLinkClick('saved-jobs')} mobile />
              </>
            )}

            {isAuthenticated && user?.role === 'recruiter' && (
              <>
                <NavLink icon={<LayoutDashboard size={20} />} text="Dashboard" onClick={() => handleNavLinkClick('recruiter-dashboard')} mobile />
                <NavLink icon={<Briefcase size={20} />} text="My Jobs" onClick={() => handleNavLinkClick('my-jobs')} mobile />
                <NavLink icon={<PlusCircle size={20} />} text="Post Job" onClick={() => handleNavLinkClick('post-job')} mobile />
              </>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <NavLink icon={<Settings size={20} />} text="Admin" onClick={() => handleNavLinkClick('admin-dashboard')} mobile />
            )}

            {isAuthenticated && (
              <NavLink icon={<User size={20} />} text="Profile" onClick={() => handleNavLinkClick('profile')} mobile />
            )}

            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  handleNavLinkClick('home');
                }}
                className="flex items-center space-x-2 text-red-400 hover:text-red-200 px-4 py-2 text-left"
              >
                <LogOut size={20} />
                <span className="text-sm font-medium">Logout</span>
              </button>
            ) : (
              <>
                <NavLink icon={<User size={20} />} text="Login" onClick={() => handleNavLinkClick('login')} mobile />
                <NavLink icon={<User size={20} />} text="Register" onClick={() => handleNavLinkClick('register')} mobile />
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Topbar;
