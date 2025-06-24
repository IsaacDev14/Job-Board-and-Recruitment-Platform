// Home.tsx
import React from 'react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

/**
 * Home page component
 * Displays a hero section with call-to-action buttons
 */
const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <section className="text-center py-16">
      {/* Hero Text */}
      <h1 className="text-4xl font-bold mb-6 text-gray-900">
        Welcome to Job Board Pro
      </h1>
      <p className="text-lg mb-6 text-gray-600">
        Find your dream job or post one for others!
      </p>

      {/* Action Buttons */}
      <div className="space-x-4">
        <button
          onClick={() => onNavigate('jobs')}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
        >
          Browse Jobs
        </button>
        <button
          onClick={() => onNavigate('post-job')}
          className="bg-white border border-blue-600 text-blue-600 px-6 py-3 rounded hover:bg-blue-50 transition"
        >
          Post a Job
        </button>
      </div>
    </section>
  );
};

export default Home;
