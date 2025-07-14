import { create } from 'zustand';
import { Notification } from '@/types';

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchNotifications: (userId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  setNotifications: (notifications) => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    set({ notifications, unreadCount });
  },
  
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unreadCount: !notification.isRead ? state.unreadCount + 1 : state.unreadCount
  })),
  
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ),
    unreadCount: state.unreadCount > 0 ? state.unreadCount - 1 : 0
  })),
  
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, isRead: true })),
    unreadCount: 0
  })),
  
  deleteNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id),
    unreadCount: state.notifications.find(n => n.id === id && !n.isRead) 
      ? state.unreadCount - 1 
      : state.unreadCount
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  fetchNotifications: async (userId: string) => {
    const state = get();
    if (state.isLoading) return; // Prevent multiple simultaneous calls
    
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/notifications?userId=${userId}`);
      const result = await response.json();
      
      if (result.success) {
        const unreadCount = result.data.filter((n: Notification) => !n.isRead).length;
        set({ 
          notifications: result.data, 
          unreadCount,
          isLoading: false 
        });
      } else {
        set({ error: result.error, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Bildirimler yüklenemedi', isLoading: false });
    }
  },
}));