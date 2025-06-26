// src/types/job.ts

// Define the User type
export interface User {
  id: string | number; // IDs can be numbers (json-server auto-generates them as numbers if not specified, but strings are common too)
  username: string;
  email: string;
  password?: string; // Optional for safety, not sent to frontend usually
  role: 'job_seeker' | 'recruiter' | 'admin';
  company_id?: number; // <--- ADDED THIS LINE: Optional, for recruiters
}

// Define the Company type
export interface Company {
  id: number; // Ensure this is consistently a number
  name: string;
  industry?: string; // Optional fields
  location?: string;
  description?: string;
  image?: string;
}

// Define the Job type
export interface Job {
  id: number;
  title: string;
  company_id: number; // Link to Company ID
  company?: Company; // Expanded company object (optional, depends on _expand in API)
  location: string;
  salary_range: string | number; // Allow flexible salary range
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship';
  image?: string;
  description: string;
}

// Define the Application type
export interface Application {
  id: number;
  user_id: string | number; // Link to User ID
  job_id: number; // Link to Job ID
  status: 'pending' | 'accepted' | 'rejected';
  applied_at: string; // ISO 8601 string for date/time
  job?: Job; // Expanded job object (optional, depends on _expand in API)
  user?: User; // Expanded user object (optional, depends on _expand in API)
}

// Define data for the dashboard statistics
export interface DashboardStats {
  totalJobs: number;
  totalApplications: number;
  openJobs: number; // for recruiters
  pendingApplications: number; // for recruiters/job seekers
  acceptedApplications: number; // for job seekers
  rejectedApplications: number; // for job seekers
}
