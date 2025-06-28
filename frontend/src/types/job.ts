// src/types/job.ts

// Define the structure for a User
export interface User {
  id: number;
  username: string;
  email: string;
  is_recruiter: boolean;
  role: 'job_seeker' | 'recruiter' | 'admin'; // Derived role for frontend
  company_id?: number | null; // Optional, for recruiters
}

// Define the structure for a BackendUser (as received from login/current_user endpoints)
export interface BackendUser {
  id: number;
  username: string;
  email: string;
  is_recruiter: boolean;
  company_id?: number | null;
}

// Define the structure for a Company
export interface Company {
  id: number;
  name: string;
  industry?: string;
  description?: string;
  contact_email?: string;
  website?: string;
  location?: string;
  date_registered: string; // ISO 8601 string
  owner_id: number;
}

// Define the structure for a Job
export interface Job {
  id: number;
  title: string;
  description: string;
  requirements?: string;
  location: string;
  salary: string; // Backend uses 'salary'
  salary_range: string; // Frontend uses 'salary_range' for display
  job_type: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship' | string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship' | string;
  date_posted: string; // ISO 8601 string
  expires_date?: string | null; // ISO 8601 string, optional
  is_active: boolean;
  recruiter_id: number;
  company_id?: number | null;
  company?: Company; // Expanded company details (if _expand=company is used)
  recruiter?: User; // Expanded recruiter details (if _expand=recruiter is used)
  image: string;

  // ✅ Added for dashboard support
  applications: number; // Number of applications received
  status?: 'Active' | 'Closed' | string; // Posting status
}

// Define the structure for an Application
export interface Application {
  id: number;
  user_id: number;
  job_id: number;
  application_date: string; // ISO 8601 string for application date
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected' | string;
  resume_url?: string | null;
  cover_letter_text?: string | null;
  job?: Job; // Expanded job details
  applicant?: User; // Expanded applicant details
}

// Define the structure for a Login Response (from backend)
export interface LoginResponse {
  access_token: string;
  user: BackendUser;
}
