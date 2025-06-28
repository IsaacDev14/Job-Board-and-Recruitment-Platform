// src/types/job.ts

export interface User {
  id: string | number;
  username: string;
  email: string;
  role: 'job_seeker' | 'recruiter' | 'admin' | 'guest';
  company_id?: number | null;
  is_recruiter?: boolean; // Important for reconciliation with backend
}

export interface BackendUser {
  id: string | number;
  username: string;
  email: string;
  is_recruiter: boolean;
  company_id?: number | null;
  // date_joined?: string; // Optional if your backend sends it
}

export interface Company {
  id: number;
  name: string;
  industry?: string;
  location?: string;
  description?: string;
  image?: string;
}

export interface Job {
  id: number;
  title: string;
  company_id: number;
  company?: Company;
  location: string;
  salary_range: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship';
  image?: string;
  description: string;
}

export interface Application {
  id: number;
  user_id: string | number;
  job_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  applied_at: string;
  job?: Job;
  user?: User;
}

export interface DashboardStats {
  totalJobs: number;
  totalApplications: number;
  openJobs: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
}

export interface LoginResponse {
  access_token: string;
  user: BackendUser;
}