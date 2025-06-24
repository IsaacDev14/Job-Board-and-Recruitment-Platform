// src/pages/Register.tsx

import React from 'react';

interface RegisterProps {
  onNavigate: (page: string) => void;
}

const Register: React.FC<RegisterProps> = ({ onNavigate }) => {
  return (
    <div className="py-16 text-center text-gray-700 min-h-[50vh] flex flex-col justify-center items-center">
      <h2 className="text-2xl font-bold mb-3">Create a New Account</h2>
      <p className="text-base mb-5">Fill in your details to get started.</p>

      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 mb-3 border border-gray-300 rounded-md text-sm"
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-3 border border-gray-300 rounded-md text-sm"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-3 border border-gray-300 rounded-md text-sm"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full p-2 mb-3 border border-gray-300 rounded-md text-sm"
        />
        <select className="w-full p-2 mb-4 border border-gray-300 rounded-md text-sm">
          <option value="">Select Role</option>
          <option value="job_seeker">Job Seeker</option>
          <option value="recruiter">Recruiter</option>
        </select>
        <button className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 text-sm">
          Register
        </button>
        <p className="text-xs text-gray-600 mt-4">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-blue-600 hover:underline"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
