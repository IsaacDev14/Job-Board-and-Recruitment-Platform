import React from 'react';

interface HomeProps {
  onNavigate: (page: string, param?: number | string) => void;
}

const CategoryCard = ({
  title,
  jobs,
  icon,
  onNavigate,
}: {
  title: string;
  jobs: string;
  icon: string;
  onNavigate: (page: string, param?: number | string) => void;
}) => (
  <div
    onClick={() => onNavigate('jobs')}
    className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer border border-gray-200 flex flex-col items-center text-center"
  >
    <div className="text-5xl mb-4" role="img" aria-label={title}>
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{jobs} jobs available</p>
  </div>
);

const WorkStep = ({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) => (
  <div className="flex flex-col items-center text-center p-4">
    <div className="bg-blue-100 text-blue-600 rounded-full h-12 w-12 flex items-center justify-center text-xl font-bold mb-4 shadow-sm">
      {number}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-8 sm:p-12 lg:p-16 text-center text-white flex flex-col items-center justify-center min-h-[400px]">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
          Unlock Your Career Potential
        </h1>
        <p className="text-lg sm:text-xl lg:text-2xl mb-8 max-w-3xl">
          Discover thousands of job opportunities from leading companies or find the perfect talent for your team.
        </p>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => onNavigate('jobs')}
            className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-blue-50 hover:scale-105 transition duration-300 ease-in-out"
          >
            Find Your Dream Job
          </button>
          <button
            onClick={() => onNavigate('post-job')}
            className="bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-800 hover:scale-105 transition duration-300 ease-in-out"
          >
            Post a Job
          </button>
        </div>
      </section>

      {/* Job Categories */}
      <section className="bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Popular Job Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CategoryCard title="Software Development" jobs="12,000+" icon="💻" onNavigate={onNavigate} />
          <CategoryCard title="Data Science" jobs="8,500+" icon="📊" onNavigate={onNavigate} />
          <CategoryCard title="Digital Marketing" jobs="7,200+" icon="📈" onNavigate={onNavigate} />
          <CategoryCard title="Project Management" jobs="6,100+" icon="📌" onNavigate={onNavigate} />
          <CategoryCard title="UI/UX Design" jobs="5,800+" icon="🎨" onNavigate={onNavigate} />
          <CategoryCard title="Customer Service" jobs="9,000+" icon="📞" onNavigate={onNavigate} />
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <WorkStep number="1" title="Create Profile" description="Build your professional profile and showcase your skills and experience." />
          <WorkStep number="2" title="Find Jobs" description="Browse through thousands of job listings tailored to your preferences." />
          <WorkStep number="3" title="Apply & Get Hired" description="Apply with a single click and track your applications seamlessly." />
        </div>
      </section>

      {/* Recruiter CTA */}
      <section className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl shadow-lg p-8 sm:p-12 lg:p-16 text-center text-white">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">Ready to Find Top Talent?</h2>
        <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
          Post your job listings and connect with qualified candidates today.
        </p>
        <button
          onClick={() => onNavigate('post-job')}
          className="bg-white text-green-600 px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-green-50 hover:scale-105 transition duration-300 ease-in-out"
        >
          Post a Job Now
        </button>
      </section>
    </div>
  );
};

export default Home;
