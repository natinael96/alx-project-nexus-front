// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  role: 'user' | 'employer' | 'admin';
  phone_number?: string;
  profile_picture?: string;
  bio?: string;
  date_joined: string;
  last_login?: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string;
  job_count?: number;
}

// Job Types
export interface Job {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  category?: Category;
  employer: {
    id: string;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  location: string;
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  salary_min?: string;
  salary_max?: string;
  status: 'draft' | 'active' | 'closed';
  approval_status: 'pending' | 'approved' | 'rejected';
  is_featured: boolean;
  view_count: number;
  application_deadline?: string;
  created_at: string;
  updated_at: string;
}

// Application Types
export interface Application {
  id: string;
  job: {
    id: string;
    title: string;
  };
  applicant: {
    id: string;
    username: string;
    email: string;
  };
  cover_letter: string;
  resume: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  applied_at: string;
  reviewed_at?: string;
}

// Profile Types
export interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_of_experience: number;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
}

export interface WorkHistory {
  id: string;
  company: string;
  position: string;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  description?: string;
  location?: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  is_public: boolean;
}

export interface Portfolio {
  id: string;
  title: string;
  url: string;
  description?: string;
}

export interface UserPreferences {
  id: string;
  email_notifications: boolean;
  job_alerts: boolean;
  newsletter: boolean;
}

export interface UserProfile {
  user: User;
  skills: Skill[];
  education: Education[];
  work_history: WorkHistory[];
  social_links: SocialLink[];
  preferences: UserPreferences;
}

export interface SavedJob {
  id: string;
  job: Job;
  notes?: string;
  created_at: string;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  priority: 'low' | 'medium' | 'high';
  action_url?: string;
  created_at: string;
}

// Pagination Types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface NotificationResponse extends PaginatedResponse<Notification> {
  unread_count: number;
}

// API Response Types
export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterResponse {
  user: User;
  message: string;
}

// Filter Types
export interface JobFilters {
  category?: string | null;
  location?: string;
  job_type?: string;
  status?: string;
  approval_status?: string;
  search?: string;
  min_salary?: string;
  max_salary?: string;
  is_featured?: boolean;
  ordering?: string; // e.g. 'created_at', '-created_at', 'salary_min', '-salary_min', 'title', '-title'
  page?: number;
  page_size?: number;
}

export interface ApplicationFilters {
  job?: string | null;
  status?: string;
  ordering?: string; // e.g. 'applied_at', '-applied_at', 'status'
  page?: number;
  page_size?: number;
}

export interface NotificationFilters {
  is_read?: boolean | null;
  notification_type?: string;
  page?: number;
  page_size?: number;
}

export interface UserFilters {
  role?: 'admin' | 'employer' | 'user';
  is_active?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}

// Error Types
export interface ApiError {
  detail?: string;
  code?: string;
  [key: string]: any;
}
