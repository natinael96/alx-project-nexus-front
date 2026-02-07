import { create } from 'zustand';
import { notificationsAPI } from '../lib/api';
import type { Notification, NotificationFilters, NotificationResponse, ApiError } from '../types';
import { sanitizeError } from '../utils/security';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  filters: NotificationFilters;
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  };
  loading: boolean;
  error: string | ApiError | null;
  fetchNotifications: (filters?: Partial<NotificationFilters>) => Promise<{ success: boolean; data?: NotificationResponse; error?: string | ApiError }>;
  markAsRead: (notificationId: string) => Promise<{ success: boolean; error?: string | ApiError }>;
  markAllAsRead: () => Promise<{ success: boolean; error?: string | ApiError }>;
}

const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  filters: {
    is_read: null,
    notification_type: '',
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

  // Get notifications
  fetchNotifications: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const currentFilters = { ...get().filters, ...filters };
      set({ filters: currentFilters });
      
      const params = Object.fromEntries(
        Object.entries(currentFilters).filter(([_, v]) => v !== '' && v !== null)
      ) as NotificationFilters;
      
      const response = await notificationsAPI.getNotifications(params);
      set({
        notifications: response.data.results,
        unreadCount: response.data.unread_count || 0,
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

  // Mark notification as read
  markAsRead: async (notificationId: string) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
      return { success: true };
    } catch (error: any) {
      const errorMessage = sanitizeError(error);
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      await notificationsAPI.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
      return { success: true };
    } catch (error: any) {
      const errorMessage = sanitizeError(error);
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },
}));

export default useNotificationsStore;
