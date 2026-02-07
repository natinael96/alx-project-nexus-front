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
  timeout: 30000, // 30s timeout
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
      confirm_password: confirmPassword,
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
  // Full profile
  getProfile: () => api.get<UserProfile>('/auth/profile/'),

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
  getSavedJobs: () => api.get<SavedJob[]>('/auth/profile/saved-jobs/'),
  saveJob: (jobId: string, notes?: string) =>
    api.post<SavedJob>('/auth/profile/saved-jobs/', { job: jobId, notes }),
  unsaveJob: (savedJobId: string) => api.delete(`/auth/profile/saved-jobs/${savedJobId}/`),
};

// ---------- Notifications API ----------

export const notificationsAPI = {
  getNotifications: (params: NotificationFilters = {}) =>
    api.get<NotificationResponse>('/core/notifications/', { params }),
  markAsRead: (notificationId: string) =>
    api.post(`/core/notifications/${notificationId}/mark-read/`),
  markAllAsRead: () => api.post('/core/notifications/mark-all-read/'),
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

// ---------- Admin API ----------

export const adminAPI = {
  getUsers: (params: UserFilters = {}) =>
    api.get<PaginatedResponse<User>>('/admin/users/', { params }),
  getUser: (userId: string) => api.get<User>(`/admin/users/${userId}/`),
  updateUser: (userId: string, data: Partial<User>) =>
    api.patch<User>(`/admin/users/${userId}/`, data),
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}/`),
};

export default api;
