import { create } from 'zustand';
import { authAPI, RegisterData, UpdateProfileData } from '../lib/api';
import type { User, ApiError } from '../types';
import { tokenStorage, sanitizeError } from '../utils/security';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | ApiError | null;
  login: (username: string, password: string) => Promise<{ success: boolean; user?: User; error?: string | ApiError }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; data?: any; error?: string | ApiError }>;
  logout: () => void;
  getCurrentUser: () => Promise<{ success: boolean; user?: User; error?: string }>;
  updateProfile: (data: UpdateProfileData) => Promise<{ success: boolean; user?: User; error?: string | ApiError }>;
  changePassword: (oldPassword: string, newPassword: string, confirmPassword: string) => Promise<{ success: boolean; error?: string | ApiError }>;
  isAuthenticated: () => boolean;
}

const useAuthStore = create<AuthState>((set, get) => {
  // Load tokens securely on initialization
  const loadTokens = () => {
    const accessToken = tokenStorage.get('access_token');
    const refreshToken = tokenStorage.get('refresh_token');
    return { accessToken, refreshToken };
  };

  const { accessToken, refreshToken } = loadTokens();

  return {
    user: null,
    accessToken: accessToken,
    refreshToken: refreshToken,
    loading: false,
    error: null,

    // Login
    login: async (username: string, password: string) => {
      set({ loading: true, error: null });
      try {
        const response = await authAPI.login(username, password);
        const { access, refresh, user } = response.data;
        
        // Store tokens securely
        tokenStorage.set('access_token', access);
        tokenStorage.set('refresh_token', refresh);
        
        set({
          user,
          accessToken: access,
          refreshToken: refresh,
          loading: false,
          error: null,
        });
        
        return { success: true, user };
      } catch (error: any) {
        const errorMessage = sanitizeError(error);
        set({ loading: false, error: errorMessage });
        return { success: false, error: errorMessage };
      }
    },

    // Register
    register: async (userData: RegisterData) => {
      set({ loading: true, error: null });
      try {
        const response = await authAPI.register(userData);
        set({ loading: false, error: null });
        return { success: true, data: response.data };
      } catch (error: any) {
        const errorMessage = sanitizeError(error);
        set({ loading: false, error: errorMessage });
        return { success: false, error: errorMessage };
      }
    },

    // Logout
    logout: () => {
      // Clear tokens securely
      tokenStorage.clear();
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        error: null,
      });
    },

    // Get current user
    getCurrentUser: async () => {
      set({ loading: true, error: null });
      try {
        const response = await authAPI.getCurrentUser();
        set({
          user: response.data,
          loading: false,
          error: null,
        });
        return { success: true, user: response.data };
      } catch (error: any) {
        const errorMessage = sanitizeError(error);
        set({ loading: false, error: errorMessage });
        return { success: false, error: errorMessage };
      }
    },

    // Update profile
    updateProfile: async (data: UpdateProfileData) => {
      set({ loading: true, error: null });
      try {
        const response = await authAPI.updateCurrentUser(data);
        set({
          user: response.data,
          loading: false,
          error: null,
        });
        return { success: true, user: response.data };
      } catch (error: any) {
        const errorMessage = sanitizeError(error);
        set({ loading: false, error: errorMessage });
        return { success: false, error: errorMessage };
      }
    },

    // Change password
    changePassword: async (oldPassword: string, newPassword: string, confirmPassword: string) => {
      set({ loading: true, error: null });
      try {
        await authAPI.changePassword(oldPassword, newPassword, confirmPassword);
        set({ loading: false, error: null });
        return { success: true };
      } catch (error: any) {
        const errorMessage = sanitizeError(error);
        set({ loading: false, error: errorMessage });
        return { success: false, error: errorMessage };
      }
    },

    // Check if user is authenticated
    isAuthenticated: () => {
      const { accessToken } = get();
      return !!accessToken || !!tokenStorage.get('access_token');
    },
  };
});

export default useAuthStore;
