// src/pages/Register.tsx

import React from 'react';

/**
 * Register Page Component
 * Allows users to create a new account (Job Seeker or Recruiter)
 */
const Register: React.FC = () => {
  return (
    <div className="py-20 text-center text-gray-700 min-h-[50vh] flex flex-col justify-center items-center">
      <h2 className="text-3xl font-bold mb-4">Create a New Account</h2>
      <p className="text-lg mb-6">Registration form goes here.</p>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <input
          type="text"
          placeholder="Username"
          className="w-full p-3 mb-4 border border-gray-300 rounded-md"
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border border-gray-300 rounded-md"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 border border-gray-300 rounded-md"
        />
        <select className="w-full p-3 mb-4 border border-gray-300 rounded-md">
          <option value="">Select Role</option>
          <option value="job_seeker">Job Seeker</option>
          <option value="recruiter">Recruiter</option>
        </select>
        <button className="w-full bg-green-600 text-white p-3 rounded-md hover:bg-green-700">
          Register
        </button>
        <p className="text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <button
            onClick={() => alert('Navigate to Login')}
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
