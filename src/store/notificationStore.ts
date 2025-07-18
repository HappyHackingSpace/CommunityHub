import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Notification } from '@/types';

interface NotificationCache {
  data: Notification[];
  timestamp: number;
  ttl: number;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  cacheStatus: 'fresh' | 'stale' | 'empty';
  
  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearCache: () => void;
  fetchNotifications: (userId: string, force?: boolean) => Promise<void>;
}

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes (shorter for real-time notifications)
const STALE_THRESHOLD = 2 * 60 * 1000; // 2 minutes
const memoryCache = new Map<string, NotificationCache>();

// Cache utilities
const getCacheKey = (userId: string) => `notifications_${userId}`;

const getCachedNotifications = (cacheKey: string): { notifications: Notification[] | null; isStale: boolean; isVeryStale: boolean } => {
  const cached = memoryCache.get(cacheKey);
  if (!cached) return { notifications: null, isStale: false, isVeryStale: false };
  
  const age = Date.now() - cached.timestamp;
  const isStale = age > STALE_THRESHOLD;
  const isVeryStale = age > CACHE_TTL;
  
  return { notifications: cached.data, isStale, isVeryStale };
};

const setCachedNotifications = (cacheKey: string, notifications: Notification[]) => {
  memoryCache.set(cacheKey, {
    data: notifications,
    timestamp: Date.now(),
    ttl: CACHE_TTL
  });
};

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      lastFetched: null,
      cacheStatus: 'empty',

      setNotifications: (notifications) => {
        const cacheKey = getCacheKey('current_user'); // Will be updated with actual userId
        setCachedNotifications(cacheKey, notifications);
        const unreadCount = notifications.filter(n => !n.isRead).length;
        set({ 
          notifications, 
          unreadCount,
          lastFetched: Date.now(),
          cacheStatus: 'fresh',
          error: null 
        });
      },
      
      addNotification: (notification) => set((state) => {
        const newNotifications = [notification, ...state.notifications];
        const cacheKey = getCacheKey('current_user');
        setCachedNotifications(cacheKey, newNotifications);
        return {
          notifications: newNotifications,
          unreadCount: !notification.isRead ? state.unreadCount + 1 : state.unreadCount
        };
      }),
      
      markAsRead: (id) => set((state) => {
        const newNotifications = state.notifications.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        );
        const cacheKey = getCacheKey('current_user');
        setCachedNotifications(cacheKey, newNotifications);
        return {
          notifications: newNotifications,
          unreadCount: state.unreadCount > 0 ? state.unreadCount - 1 : 0
        };
      }),
      
      markAllAsRead: () => set((state) => {
        const newNotifications = state.notifications.map(n => ({ ...n, isRead: true }));
        const cacheKey = getCacheKey('current_user');
        setCachedNotifications(cacheKey, newNotifications);
        return {
          notifications: newNotifications,
          unreadCount: 0
        };
      }),
      
      deleteNotification: (id) => set((state) => {
        const deletedNotification = state.notifications.find(n => n.id === id);
        const newNotifications = state.notifications.filter(n => n.id !== id);
        const cacheKey = getCacheKey('current_user');
        setCachedNotifications(cacheKey, newNotifications);
        return {
          notifications: newNotifications,
          unreadCount: deletedNotification && !deletedNotification.isRead 
            ? state.unreadCount - 1 
            : state.unreadCount
        };
      }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      fetchNotifications: async (userId: string, force = false) => {
        const state = get();
        const cacheKey = getCacheKey(userId);

        console.log('🔔 NotificationStore.fetchNotifications called', { force, userId, currentCount: state.notifications.length });

        // Check cache first
        if (!force) {
          const { notifications: cachedNotifications, isStale, isVeryStale } = getCachedNotifications(cacheKey);
          
          if (cachedNotifications && !isStale) {
            console.log('✅ NotificationStore: Using fresh cache');
            const unreadCount = cachedNotifications.filter(n => !n.isRead).length;
            set({ 
              notifications: cachedNotifications, 
              unreadCount,
              cacheStatus: 'fresh',
              error: null 
            });
            return;
          }
          
          if (cachedNotifications && isStale && !isVeryStale) {
            console.log('⚠️ NotificationStore: Using stale cache');
            const unreadCount = cachedNotifications.filter(n => !n.isRead).length;
            set({ 
              notifications: cachedNotifications, 
              unreadCount,
              cacheStatus: 'stale',
              error: null 
            });
            // Continue to fetch fresh data
          }
        }

        if (state.isLoading && !force) return;

        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`/api/notifications?userId=${userId}`);
          const result = await response.json();
          
          if (result.success) {
            setCachedNotifications(cacheKey, result.data);
            const unreadCount = result.data.filter((n: Notification) => !n.isRead).length;
            set({ 
              notifications: result.data, 
              unreadCount,
              isLoading: false,
              lastFetched: Date.now(),
              cacheStatus: 'fresh',
              error: null
            });
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          console.error('💥 NotificationStore: Network error:', error);
          
          const existingNotifications = state.notifications;
          if (existingNotifications.length > 0) {
            set({ 
              isLoading: false,
              cacheStatus: 'stale',
              error: 'Bağlantı sorunu - eski veriler gösteriliyor'
            });
          } else {
            set({ 
              error: 'Bildirimler yüklenemedi - internet bağlantınızı kontrol edin', 
              isLoading: false,
              cacheStatus: 'empty'
            });
          }
        }
      },

      clearCache: () => {
        memoryCache.clear();
        set({ 
          notifications: [], 
          unreadCount: 0,
          lastFetched: null,
          error: null,
          cacheStatus: 'empty'
        });
      },
    }),
    {
      name: 'notification-storage-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        lastFetched: state.lastFetched,
        cacheStatus: state.cacheStatus
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const age = state.lastFetched ? Date.now() - state.lastFetched : Infinity;
          const isStale = age > STALE_THRESHOLD;
          const isVeryStale = age > CACHE_TTL;
          
          if (isVeryStale) {
            state.cacheStatus = 'empty';
            state.notifications = [];
            state.unreadCount = 0;
          } else if (isStale) {
            state.cacheStatus = 'stale';
          } else {
            state.cacheStatus = 'fresh';
          }
          
          console.log('🔔 NotificationStore: Rehydrated from localStorage', {
            notificationsCount: state.notifications.length,
            unreadCount: state.unreadCount,
            cacheStatus: state.cacheStatus,
            age: Math.round(age / 1000) + 's'
          });
        }
      }
    }
  )
);