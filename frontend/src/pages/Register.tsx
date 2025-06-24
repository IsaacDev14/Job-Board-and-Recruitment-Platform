// src/pages/Register.tsx

import React from 'react';
// Import some icons from react-icons (you can install via `npm install react-icons`)
import { FaUser, FaEnvelope, FaLock, FaUserTag } from 'react-icons/fa';

interface RegisterProps {
  onNavigate: (page: string) => void;
}

const Register: React.FC<RegisterProps> = ({ onNavigate }) => {
  return (
    <div className="py-16 text-gray-700 min-h-[50vh] flex flex-col justify-center items-center">
      {/* Page title and instructions */}
      <h2 className="text-2xl font-bold mb-3 text-center">Create a New Account</h2>
      <p className="text-base mb-5 text-center">Fill in your details to get started.</p>

      {/* Form container */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        {/* Username input with icon */}
        <div className="relative mb-3">
          <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Username"
            className="w-full pl-10 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Email input with icon */}
        <div className="relative mb-3">
          <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            placeholder="Email"
            className="w-full pl-10 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Password input with icon */}
        <div className="relative mb-3">
          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="password"
            placeholder="Password"
            className="w-full pl-10 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Confirm password input with icon */}
        <div className="relative mb-3">
          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full pl-10 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Role select with icon */}
        <div className="relative mb-4">
          <FaUserTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            className="w-full pl-10 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            defaultValue=""
          >
            <option value="" disabled>
              Select Role
            </option>
            <option value="job_seeker">Job Seeker</option>
            <option value="recruiter">Recruiter</option>
          </select>
        </div>

        {/* Submit button */}
        <button className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 text-sm transition">
          Register
        </button>

        {/* Link to login page */}
        <p className="text-xs text-gray-600 mt-4 text-center">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-blue-600 hover:underline"
            type="button"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
