import { create } from 'zustand';
import { jobsAPI, categoriesAPI } from '../lib/api';
import type { Job, Category, JobFilters, PaginatedResponse, ApiError } from '../types';
import { sanitizeError } from '../utils/security';

interface JobsState {
  jobs: Job[];
  job: Job | null;
  categories: Category[];
  filters: JobFilters;
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  };
  loading: boolean;
  error: string | ApiError | null;
  fetchJobs: (filters?: Partial<JobFilters>) => Promise<{ success: boolean; data?: PaginatedResponse<Job>; error?: string | ApiError }>;
  fetchJob: (jobId: string) => Promise<{ success: boolean; job?: Job; error?: string | ApiError }>;
  createJob: (jobData: Partial<Job>) => Promise<{ success: boolean; job?: Job; error?: string | ApiError }>;
  updateJob: (jobId: string, jobData: Partial<Job>) => Promise<{ success: boolean; job?: Job; error?: string | ApiError }>;
  deleteJob: (jobId: string) => Promise<{ success: boolean; error?: string | ApiError }>;
  searchJobs: (query: string, filters?: Partial<JobFilters>) => Promise<{ success: boolean; data?: PaginatedResponse<Job>; error?: string | ApiError }>;
  fetchCategories: () => Promise<{ success: boolean; categories?: Category[]; error?: string | ApiError }>;
  updateFilters: (newFilters: Partial<JobFilters>) => void;
  resetFilters: () => void;
}

const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [],
  job: null,
  categories: [],
  filters: {
    category: null,
    location: '',
    job_type: '',
    search: '',
    min_salary: '',
    max_salary: '',
    is_featured: false,
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

  // Get jobs
  fetchJobs: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const currentFilters = { ...get().filters, ...filters };
      set({ filters: currentFilters });
      
      const params = Object.fromEntries(
        Object.entries(currentFilters).filter(([_, v]) => v !== '' && v !== null && v !== false)
      ) as JobFilters;
      
      const response = await jobsAPI.getJobs(params);
      set({
        jobs: response.data.results,
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

  // Get single job
  fetchJob: async (jobId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await jobsAPI.getJob(jobId);
      set({
        job: response.data,
        loading: false,
        error: null,
      });
      return { success: true, job: response.data };
    } catch (error: any) {
      const errorMessage = sanitizeError(error);
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Create job
  createJob: async (jobData: Partial<Job>) => {
    set({ loading: true, error: null });
    try {
      const response = await jobsAPI.createJob(jobData);
      set({ loading: false, error: null });
      return { success: true, job: response.data };
    } catch (error: any) {
      const errorMessage = sanitizeError(error);
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Update job
  updateJob: async (jobId: string, jobData: Partial<Job>) => {
    set({ loading: true, error: null });
    try {
      const response = await jobsAPI.updateJob(jobId, jobData);
      set({ loading: false, error: null });
      return { success: true, job: response.data };
    } catch (error: any) {
      const errorMessage = sanitizeError(error);
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Delete job
  deleteJob: async (jobId: string) => {
    set({ loading: true, error: null });
    try {
      await jobsAPI.deleteJob(jobId);
      set({ loading: false, error: null });
      return { success: true };
    } catch (error: any) {
      const errorMessage = sanitizeError(error);
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Search jobs
  searchJobs: async (query: string, filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = { q: query, ...filters } as JobFilters;
      const response = await jobsAPI.searchJobs(params);
      set({
        jobs: response.data.results,
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

  // Get categories
  fetchCategories: async () => {
    try {
      const response = await categoriesAPI.getCategories();
      set({ categories: response.data });
      return { success: true, categories: response.data };
    } catch (error: any) {
      const errorMessage = sanitizeError(error);
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Update filters
  updateFilters: (newFilters: Partial<JobFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  // Reset filters
  resetFilters: () => {
    set({
      filters: {
        category: null,
        location: '',
        job_type: '',
        search: '',
        min_salary: '',
        max_salary: '',
        is_featured: false,
        page: 1,
        page_size: 20,
      },
    });
  },
}));

export default useJobsStore;
