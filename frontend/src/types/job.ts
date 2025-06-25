// src/types/job.ts

export interface User {
  id: number; // CHANGED to number
  username: string;
  email: string;
  password?: string;
  role: 'job_seeker' | 'recruiter';
}

export interface Company {
  id: number; // CHANGED to number
  name: string;
  industry?: string;
  location?: string;
}

export interface Job {
  id: number; // CHANGED to number
  title: string;
  company?: Company; // Keep as optional for expanded data
  company_id: number; // CHANGED to number
  location: string;
  salary_range: string;
  type: string;
  image: string;
  description: string;
}

export interface Application {
  id: number; // CHANGED to number
  user_id: number; // CHANGED to number
  job_id: number; // CHANGED to number
  status: 'pending' | 'accepted' | 'rejected';
  applied_at: string;
  job?: Job; // Keep optional
}