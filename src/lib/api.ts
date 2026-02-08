import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type {
  User,
  Job,
  Application,
  PaginatedResponse,
  NotificationResponse,
  LoginResponse,
  RegisterResponse,
  JobFilters,
  ApplicationFilters,
  NotificationFilters,
  UserFilters,
  UserProfile,
  UserPreferences,
  Skill,
  Education,
  WorkHistory,
  SocialLink,
  Portfolio,
  SavedJob,
} from '../types';
import { tokenStorage, rateLimitHandler } from '../utils/security';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';
const BASE_URL = `${API_BASE_URL}/api/${API_VERSION}`;

// Validate API URL in production (must be HTTPS)
if (import.meta.env.PROD && !API_BASE_URL.startsWith('https://')) {
  console.warn('Warning: API URL should use HTTPS in production for security');
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 120s — generous for cold-starting backends (Render, Railway, etc.)
  // Note: withCredentials is NOT set because we use Bearer tokens, not cookies.
  // Setting it to true would cause CORS errors if the server uses Access-Control-Allow-Origin: *
});

// Request interceptor to add token and security headers
api.interceptors.request.use(
  (config) => {
    // Client-side rate-limit awareness: only block if the server told us to back off (429)
    if (!rateLimitHandler.canMakeRequest()) {
      return Promise.reject(
        new axios.Cancel('Rate limited by server. Please wait a moment before retrying.')
      );
    }

    // Add authentication token
    const token = tokenStorage.get('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token if available (for servers that use cookie-based CSRF)
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken && config.headers) {
      config.headers['X-CSRFToken'] = csrfToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and 429 rate limiting
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Track server-side rate limiting (429)
    if (error.response?.status === 429) {
      const retryAfter = parseInt(error.response.headers['retry-after'] || '60', 10);
      rateLimitHandler.onRateLimited(retryAfter);
      return Promise.reject(error);
    }

    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenStorage.get('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post<{ access: string }>(`${BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        tokenStorage.set('access_token', access);
        if (api.defaults.headers.common) {
          api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens securely
        tokenStorage.clear();
        // Use secure redirect
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ---------- Data types for request bodies ----------

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
  role?: 'user' | 'employer';
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  bio?: string;
  profile_picture?: File;
}

// ---------- Auth API ----------

export const authAPI = {
  register: (userData: RegisterData) =>
    api.post<RegisterResponse>('/auth/register/', userData),
  login: (username: string, password: string) =>
    api.post<LoginResponse>('/auth/login/', { username, password }),
  refreshToken: (refresh: string) =>
    api.post<{ access: string }>('/auth/refresh/', { refresh }),
  getCurrentUser: () => api.get<User>('/auth/me/'),
  updateCurrentUser: (data: UpdateProfileData) => {
    // Use FormData if a file is included, plain JSON otherwise
    if (data.profile_picture) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, value as string | Blob);
      });
      return api.patch<User>('/auth/me/update/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.patch<User>('/auth/me/update/', data);
  },
  changePassword: (oldPassword: string, newPassword: string, confirmPassword: string) =>
    api.post('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
      new_password2: confirmPassword,
    }),
  requestPasswordReset: (email: string) =>
    api.post('/auth/password-reset/', { email }),
  confirmPasswordReset: (token: string, newPassword: string, newPassword2: string) =>
    api.post('/auth/password-reset/confirm/', {
      token,
      new_password: newPassword,
      new_password2: newPassword2,
    }),
};

// ---------- Jobs API ----------

export const jobsAPI = {
  getJobs: (params: JobFilters = {}) =>
    api.get<PaginatedResponse<Job>>('/jobs/', { params }),
  getJob: (jobId: string) => api.get<Job>(`/jobs/${jobId}/`),
  createJob: (jobData: Partial<Job>) => api.post<Job>('/jobs/', jobData),
  updateJob: (jobId: string, jobData: Partial<Job>) =>
    api.patch<Job>(`/jobs/${jobId}/`, jobData),
  deleteJob: (jobId: string) => api.delete(`/jobs/${jobId}/`),
  searchJobs: (params: JobFilters = {}) =>
    api.get<PaginatedResponse<Job>>('/jobs/search/', { params }),
  saveSearch: (data: { query: string; filters: Record<string, string>; name?: string }) =>
    api.post('/jobs/search/save/', data),
  getRecommendations: async (limit: number = 4) => {
    // Try non-versioned endpoint first: /api/jobs/recommendations/
    // Fallback to versioned: /api/v1/jobs/recommendations/
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    // Get access token from storage (same as interceptor does)
    const token = tokenStorage.get('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const url = `${API_BASE_URL}/api/jobs/recommendations/`;
      return await axios.get<PaginatedResponse<Job>>(url, { 
        params: { limit },
        headers,
      });
    } catch (error: any) {
      // Fallback to versioned endpoint if non-versioned fails
      if (error.response?.status === 404) {
        return api.get<PaginatedResponse<Job>>('/jobs/recommendations/', { params: { limit } });
      }
      throw error;
    }
  },
  // Admin: Approve/Reject job
  updateJobApproval: (jobId: string, approvalStatus: 'pending' | 'approved' | 'rejected') =>
    api.patch<Job>(`/jobs/${jobId}/`, { approval_status: approvalStatus }),
};

// ---------- Applications API ----------

export const applicationsAPI = {
  getApplications: (params: ApplicationFilters = {}) =>
    api.get<PaginatedResponse<Application>>('/jobs/applications/', { params }),
  getApplication: (applicationId: string) =>
    api.get<Application>(`/jobs/applications/${applicationId}/`),
  createApplication: (formData: FormData) =>
    api.post<Application>('/jobs/applications/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateApplicationStatus: (applicationId: string, status: Application['status']) =>
    api.patch<Application>(`/jobs/applications/${applicationId}/`, { status }),
  withdrawApplication: (applicationId: string, reason?: string) =>
    api.post(`/jobs/applications/${applicationId}/withdraw/`, { reason }),
};

// ---------- Profile API ----------

export const profileAPI = {
  // Full profile - returns user directly with all enhancements nested
  getProfile: () => api.get<UserProfile>('/auth/profile/profile/'),
  
  // Dashboard data (all stats in one call)
  getDashboard: () => api.get<{
    statistics: {
      total_applications: number;
      pending_applications: number;
      accepted_applications: number;
      rejected_applications: number;
      saved_jobs_count: number;
      applications_last_30_days: number;
    };
    recent_applications: Application[];
    recent_saved_jobs: SavedJob[];
    profile_completion: number;
  }>('/auth/profile/dashboard/'),

  // Skills
  addSkill: (data: Omit<Skill, 'id'>) => api.post<Skill>('/auth/profile/skills/', data),
  updateSkill: (skillId: string, data: Partial<Omit<Skill, 'id'>>) =>
    api.put<Skill>(`/auth/profile/skills/${skillId}/`, data),
  deleteSkill: (skillId: string) => api.delete(`/auth/profile/skills/${skillId}/`),

  // Education
  addEducation: (data: Omit<Education, 'id'>) =>
    api.post<Education>('/auth/profile/education/', data),
  updateEducation: (eduId: string, data: Partial<Omit<Education, 'id'>>) =>
    api.put<Education>(`/auth/profile/education/${eduId}/`, data),
  deleteEducation: (eduId: string) => api.delete(`/auth/profile/education/${eduId}/`),

  // Work History
  addWorkHistory: (data: Omit<WorkHistory, 'id'>) =>
    api.post<WorkHistory>('/auth/profile/work-history/', data),
  updateWorkHistory: (workId: string, data: Partial<Omit<WorkHistory, 'id'>>) =>
    api.put<WorkHistory>(`/auth/profile/work-history/${workId}/`, data),
  deleteWorkHistory: (workId: string) => api.delete(`/auth/profile/work-history/${workId}/`),

  // Social Links
  addSocialLink: (data: Omit<SocialLink, 'id'>) =>
    api.post<SocialLink>('/auth/profile/social-links/', data),
  updateSocialLink: (linkId: string, data: Partial<Omit<SocialLink, 'id'>>) =>
    api.put<SocialLink>(`/auth/profile/social-links/${linkId}/`, data),
  deleteSocialLink: (linkId: string) => api.delete(`/auth/profile/social-links/${linkId}/`),

  // Portfolio
  addPortfolio: (data: Omit<Portfolio, 'id'>) =>
    api.post<Portfolio>('/auth/profile/portfolio/', data),
  updatePortfolio: (portfolioId: string, data: Partial<Omit<Portfolio, 'id'>>) =>
    api.put<Portfolio>(`/auth/profile/portfolio/${portfolioId}/`, data),
  deletePortfolio: (portfolioId: string) => api.delete(`/auth/profile/portfolio/${portfolioId}/`),

  // Saved Jobs
  getSavedJobs: (params?: { page?: number; page_size?: number }) =>
    api.get<PaginatedResponse<SavedJob>>('/auth/profile/saved-jobs/', { params }),
  saveJob: (jobId: string, notes?: string) =>
    api.post<SavedJob>('/auth/profile/saved-jobs/save_job/', { job_id: jobId, notes }),
  unsaveJob: (savedJobId: string) => api.delete(`/auth/profile/saved-jobs/${savedJobId}/unsave/`),

  // Preferences
  getPreferences: () => api.get<UserPreferences>('/auth/profile/preferences/'),
  updatePreferences: (preferencesId: string, data: Partial<UserPreferences>) =>
    api.put<UserPreferences>(`/auth/profile/preferences/${preferencesId}/`, data),
};

// ---------- Notifications API ----------

export const notificationsAPI = {
  getNotifications: (params: NotificationFilters = {}) =>
    api.get<NotificationResponse>('/notifications/', { params }),
  getSummary: () => api.get<NotificationResponse>('/notifications/summary/'),
  getUnreadCount: () => api.get<{ unread_count: number }>('/notifications/unread_count/'),
  markAsRead: (notificationId: string) =>
    api.post(`/notifications/${notificationId}/mark_read/`),
  markAllAsRead: () => api.post('/notifications/mark_all_read/'),
};

// ---------- Employer API ----------

export const employerAPI = {
  // Dashboard
  getDashboard: () => api.get<{
    statistics: {
      jobs: {
        total: number;
        active: number;
        draft: number;
        closed: number;
        pending_approval: number;
      };
      applications: {
        total: number;
        pending: number;
        accepted: number;
        rejected: number;
      };
      views: {
        total: number;
        unique: number;
      };
    };
    recent_jobs: Job[];
    recent_applications: Application[];
    top_jobs: Job[];
  }>('/jobs/employer/dashboard/'),

  // Job Analytics
  getJobAnalytics: (jobId: string) => api.get<{
    total_views: number;
    unique_views: number;
    applications: number;
    shares: number;
    views_over_time: Array<{ date: string; views: number }>;
    application_sources: Array<{ source: string; count: number }>;
    conversion_rate: number;
  }>(`/jobs/${jobId}/analytics/`),

  // Screening Questions
  getScreeningQuestions: (jobId: string) => api.get<Array<{
    id: string;
    job: string;
    question_text: string;
    question_type: 'text' | 'multiple_choice' | 'yes_no';
    is_required: boolean;
    order: number;
  }>>('/jobs/applications/screening-questions/', { params: { job_id: jobId } }),
  createScreeningQuestion: (data: {
    job: string;
    question_text: string;
    question_type: 'text' | 'multiple_choice' | 'yes_no';
    is_required: boolean;
    order: number;
  }) => api.post('/jobs/applications/screening-questions/', data),
  updateScreeningQuestion: (questionId: string, data: Partial<{
    question_text: string;
    question_type: 'text' | 'multiple_choice' | 'yes_no';
    is_required: boolean;
    order: number;
  }>) => api.patch(`/jobs/applications/screening-questions/${questionId}/`, data),
  deleteScreeningQuestion: (questionId: string) => api.delete(`/jobs/applications/screening-questions/${questionId}/`),

  // Application Notes
  addApplicationNote: (data: {
    application: string;
    content: string;
    is_private: boolean;
  }) => api.post('/jobs/applications/notes/', data),

  // Application Scores
  scoreApplication: (data: {
    application: string;
    technical_score: number;
    communication_score: number;
    experience_score: number;
    overall_score: number;
    comments?: string;
  }) => api.post('/jobs/applications/scores/', data),

  // Schedule Interview
  scheduleInterview: (data: {
    application: string;
    interview_type: string;
    scheduled_at: string;
    duration_minutes: number;
    location?: string;
    notes?: string;
  }) => api.post('/jobs/applications/interviews/', data),

  // Export
  exportJobs: (format: 'csv' | 'json') => api.get(`/export/jobs/`, { params: { format }, responseType: 'blob' }),
  exportApplications: (format: 'csv' | 'json', jobId?: string) => {
    const params: any = { format };
    if (jobId) params.job = jobId;
    return api.get(`/export/applications/`, { params, responseType: 'blob' });
  },
};

// ---------- Categories API ----------

export const categoriesAPI = {
  getCategories: () => api.get<Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    parent?: string;
    job_count?: number;
  }>>('/jobs/categories/'),
};

// ---------- Files API ----------

export const filesAPI = {
  downloadResume: (applicationId: string, signed: boolean = false) =>
    api.get(`/core/files/resumes/${applicationId}/`, {
      params: signed ? { signed: true } : undefined,
      responseType: signed ? 'json' : 'blob',
    }),
  downloadProfilePicture: (userId: string, signed: boolean = false) =>
    api.get(`/core/files/profiles/${userId}/`, {
      params: signed ? { signed: true } : undefined,
      responseType: signed ? 'json' : 'blob',
    }),
};

// ---------- Health API (Public) ----------

export const healthAPI = {
  // Public health check endpoints (no auth required)
  getHealth: () => {
    const url = `${API_BASE_URL}/health/`;
    return axios.get<any>(url);
  },
  getLiveness: () => {
    const url = `${API_BASE_URL}/health/liveness/`;
    return axios.get<any>(url);
  },
  getReadiness: () => {
    const url = `${API_BASE_URL}/health/readiness/`;
    return axios.get<any>(url);
  },
};

// ---------- Admin API ----------

export const adminAPI = {
  // User Management
  getUsers: (params: UserFilters = {}) =>
    api.get<PaginatedResponse<User>>('/auth/users/', { params }),
  getUser: (userId: string) => api.get<User>(`/auth/users/${userId}/`),
  updateUser: (userId: string, data: Partial<User>) =>
    api.put<User>(`/auth/users/${userId}/`, data),
  deleteUser: (userId: string) => api.delete(`/auth/users/${userId}/`),

  // Statistics
  // Health endpoints use /health/ directly (not /api/v1/health/)
  getStatistics: () => {
    const url = `${API_BASE_URL}/health/statistics/`;
    const token = tokenStorage.get('access_token');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return axios.get<any>(url, { headers });
  },
  getUserStatistics: () => {
    const url = `${API_BASE_URL}/health/statistics/users/`;
    const token = tokenStorage.get('access_token');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return axios.get<any>(url, { headers });
  },
  getJobStatistics: () => {
    const url = `${API_BASE_URL}/health/statistics/jobs/`;
    const token = tokenStorage.get('access_token');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return axios.get<any>(url, { headers });
  },
  getApplicationStatistics: () => {
    const url = `${API_BASE_URL}/health/statistics/applications/`;
    const token = tokenStorage.get('access_token');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return axios.get<any>(url, { headers });
  },
  getUserActivity: (userId: string, days: number = 30) => {
    const url = `${API_BASE_URL}/health/statistics/user-activity/`;
    const token = tokenStorage.get('access_token');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return axios.get<any>(url, { headers, params: { user_id: userId, days } });
  },

  // Audit Logs
  getAuditLogs: (params?: {
    user_id?: string; // API expects user_id, not user
    action?: string;
    content_type?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    page_size?: number;
  }) => api.get<PaginatedResponse<any>>('/audit/logs/', { params }),
  getAuditHistory: (params?: {
    content_type?: string;
    object_id?: string;
  }) => api.get<any>('/audit/history/', { params }),
  getObjectHistory: (contentType: string, objectId: string) =>
    api.get<any>(`/audit/object-history/`, { params: { content_type: contentType, object_id: objectId } }),

  // Search Analytics
  getSearchStatistics: (days: number = 30) =>
    api.get<any>('/search/statistics/', { params: { days } }),
  getPopularSearchTerms: (limit: number = 20, days: number = 30) =>
    api.get<any>('/search/popular-terms/', { params: { limit, days } }),
};

// ---------- Search API ----------

export const searchAPI = {
  autocomplete: (query: string, limit: number = 5) =>
    api.get<{ query: string; suggestions: string[]; count: number }>('/search/autocomplete/', {
      params: { q: query, limit },
    }),
  getSuggestions: (query: string) =>
    api.get<any>('/search/suggestions/', { params: { q: query } }),
  getSearchHistory: () => api.get<any>('/search/history/'),
  getPopularTerms: (limit: number = 20) =>
    api.get<any>('/search/popular-terms/', { params: { limit } }),
};

export default api;
