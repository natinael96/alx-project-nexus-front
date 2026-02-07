import { create } from 'zustand';
import { applicationsAPI } from '../lib/api';
import type { Application, ApplicationFilters, PaginatedResponse, ApiError } from '../types';
import { sanitizeError } from '../utils/security';

interface ApplicationsState {
  applications: Application[];
  application: Application | null;
  filters: ApplicationFilters;
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  };
  loading: boolean;
  error: string | ApiError | null;
  fetchApplications: (filters?: Partial<ApplicationFilters>) => Promise<{ success: boolean; data?: PaginatedResponse<Application>; error?: string | ApiError }>;
  fetchApplication: (applicationId: string) => Promise<{ success: boolean; application?: Application; error?: string | ApiError }>;
  createApplication: (jobId: string, coverLetter: string, resumeFile: File) => Promise<{ success: boolean; application?: Application; error?: string | ApiError }>;
  updateApplicationStatus: (applicationId: string, status: Application['status']) => Promise<{ success: boolean; application?: Application; error?: string | ApiError }>;
  withdrawApplication: (applicationId: string, reason?: string) => Promise<{ success: boolean; error?: string | ApiError }>;
}

const useApplicationsStore = create<ApplicationsState>((set, get) => ({
  applications: [],
  application: null,
  filters: {
    job: null,
    status: '',
    page: 1,
    page_size: 20,
  },
  pagination: {
    count: 0,
    next: null,
    previous: null,
  },
  loading: false,
  error: null,

  // Get applications
  fetchApplications: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const currentFilters = { ...get().filters, ...filters };
      set({ filters: currentFilters });
      
      const params = Object.fromEntries(
        Object.entries(currentFilters).filter(([_, v]) => v !== '' && v !== null)
      ) as ApplicationFilters;
      
      const response = await applicationsAPI.getApplications(params);
      set({
        applications: response.data.results,
        pagination: {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
        },
        loading: false,
        error: null,
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      const errorMessage = sanitizeError(error);
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Get single application
  fetchApplication: async (applicationId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await applicationsAPI.getApplication(applicationId);
      set({
        application: response.data,
        loading: false,
        error: null,
      });
      return { success: true, application: response.data };
    } catch (error: any) {
      const errorMessage = sanitizeError(error);
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Create application
  createApplication: async (jobId: string, coverLetter: string, resumeFile: File) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('job', jobId);
      formData.append('cover_letter', coverLetter);
      formData.append('resume', resumeFile);

      const response = await applicationsAPI.createApplication(formData);
      set({ loading: false, error: null });
      return { success: true, application: response.data };
    } catch (error: any) {
      const errorMessage = sanitizeError(error);
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Update application status
  updateApplicationStatus: async (applicationId: string, status: Application['status']) => {
    set({ loading: true, error: null });
    try {
      const response = await applicationsAPI.updateApplicationStatus(applicationId, status);
      set({ loading: false, error: null });
      return { success: true, application: response.data };
    } catch (error: any) {
      const errorMessage = sanitizeError(error);
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Withdraw application
  withdrawApplication: async (applicationId: string, reason = '') => {
    set({ loading: true, error: null });
    try {
      await applicationsAPI.withdrawApplication(applicationId, reason);
      set({ loading: false, error: null });
      return { success: true };
    } catch (error: any) {
      const errorMessage = sanitizeError(error);
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },
}));

export default useApplicationsStore;
