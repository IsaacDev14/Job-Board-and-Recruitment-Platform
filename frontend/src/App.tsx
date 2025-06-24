// App.tsx
import React, { useState } from 'react';
import Topbar from './Topbar';
import Home from './Home';

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
 * Placeholder component: Login Page
 */
const LoginPage = () => (
  <div className="py-20 text-center text-gray-700 min-h-[50vh] flex flex-col justify-center items-center">
    <h2 className="text-3xl font-bold mb-4">Login to Your Account</h2>
    <p className="text-lg mb-6">A login form would go here.</p>
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <input type="email" placeholder="Email" className="w-full p-3 mb-4 border border-gray-300 rounded-md" />
      <input type="password" placeholder="Password" className="w-full p-3 mb-4 border border-gray-300 rounded-md" />
      <button className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700">Login</button>
      <button onClick={() => alert('Forgot password')} className="text-blue-600 hover:underline mt-4">Forgot Password?</button>
    </div>
  </div>
);

/**
 * Placeholder component: Register Page
 */
const RegisterPage = () => (
  <div className="py-20 text-center text-gray-700 min-h-[50vh] flex flex-col justify-center items-center">
    <h2 className="text-3xl font-bold mb-4">Create a New Account</h2>
    <p className="text-lg mb-6">Registration form would go here.</p>
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <input type="text" placeholder="Username" className="w-full p-3 mb-4 border border-gray-300 rounded-md" />
      <input type="email" placeholder="Email" className="w-full p-3 mb-4 border border-gray-300 rounded-md" />
      <input type="password" placeholder="Password" className="w-full p-3 mb-4 border border-gray-300 rounded-md" />
      <select className="w-full p-3 mb-4 border border-gray-300 rounded-md">
        <option value="">Select Role</option>
        <option value="job_seeker">Job Seeker</option>
        <option value="recruiter">Recruiter</option>
      </select>
      <button className="w-full bg-green-600 text-white p-3 rounded-md hover:bg-green-700">Register</button>
      <p className="text-sm text-gray-600 mt-4">Already have an account? <button onClick={() => alert('Go to login')} className="text-blue-600 hover:underline">Login here</button></p>
    </div>
  </div>
);

/**
 * Placeholder component: Post Job Page
 */
const PostJobPage = () => (
  <div className="py-20 text-center text-gray-700 min-h-[50vh] flex flex-col justify-center items-center">
    <h2 className="text-3xl font-bold mb-4">Post a New Job Listing</h2>
    <p className="text-lg mb-6">A form for recruiters to post job details.</p>
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <input type="text" placeholder="Job Title" className="w-full p-3 mb-4 border border-gray-300 rounded-md" />
      <textarea placeholder="Job Description" rows={5} className="w-full p-3 mb-4 border border-gray-300 rounded-md"></textarea>
      <input type="text" placeholder="Location" className="w-full p-3 mb-4 border border-gray-300 rounded-md" />
      <input type="text" placeholder="Salary Range" className="w-full p-3 mb-4 border border-gray-300 rounded-md" />
      <button className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700">Submit Job</button>
    </div>
  </div>
);

/**
 * Main App Component
 * Handles navigation between pages and renders Topbar and footer
 */
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');

  /**
   * Conditionally render content based on `currentPage` state
   */
  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      case 'jobs':
        return <JobsPage />;
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage />;
      case 'post-job':
        return <PostJobPage />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased text-gray-800">
      {/* Topbar receives navigation handler */}
      <Topbar onNavigate={setCurrentPage} />

      {/* Main page section */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {renderContent()}
      </main>

      {/* Simple Footer */}
      <footer className="w-full bg-gray-900 text-gray-300 py-6 text-center text-sm mt-12">
        <p>&copy; {new Date().getFullYear()} Job Board Pro. All rights reserved.</p>
        <p className="mt-1">Built with React & Tailwind CSS</p>
      </footer>
    </div>
  );
};

export default App;
