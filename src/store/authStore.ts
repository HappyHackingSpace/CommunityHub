import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  initialized: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  clearError: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  validateToken: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      initialized: false,

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user, 
        error: null 
      }),

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setInitialized: (initialized) => set({ initialized }),
      clearError: () => set({ error: null }),

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem('token', result.data.token);
        set({ 
          user: result.data.user, 
          isAuthenticated: true,
          isLoading: false 
        });
      } else {
        set({ error: result.error, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Login failed', isLoading: false });
    }
  },

  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const result = await response.json();

      if (result.success) {
        set({ isLoading: false });
        // Don't auto-login, user needs to verify email
      } else {
        set({ error: result.error, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Registration failed', isLoading: false });
    }
  },

  validateToken: async () => {
    const state = get();
    if (state.isLoading || state.initialized) return; // Prevent multiple calls
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      set({ initialized: true, isLoading: false });
      return;
    }

    set({ isLoading: true });

    try {
      const response = await fetch('/api/auth/validate', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const result = await response.json();

      if (result.success) {
        set({ 
          user: result.data.user, 
          isAuthenticated: true,
          isLoading: false,
          initialized: true
        });
      } else {
        localStorage.removeItem('token');
        set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false,
          initialized: true
        });
      }
    } catch (error) {
      localStorage.removeItem('token');
      set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false,
        initialized: true
      });
    }
  },

  // src/store/authStore.ts - logout fonksiyonunu değiştir
logout: () => {
  const user = get().user;
  
  if (user?.email) {
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email }),
    }).catch(() => {
      // Ignore errors for logout
    });
  }

  localStorage.removeItem('token');
  
  // ✅ Store'ları temizle
  set({ 
    user: null, 
    isAuthenticated: false, 
    error: null, 
    isLoading: false,
    initialized: false  // ✅ Bu önemli - tekrar init olsun
  });
  
  // ✅ Diğer store'ları da temizle
  if (typeof window !== 'undefined') {
    // Club store temizle
    const clubStore = require('./clubStore').useClubStore;
    clubStore.getState().clearCache();
    
    // Notification store temizle
    const notificationStore = require('./notificationStore').useNotificationStore;
    notificationStore.getState().setNotifications([]);
    
    window.location.href = '/login';
  }
},
}),
{
  name: 'auth-storage',
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({ 
    user: state.user, 
    isAuthenticated: state.isAuthenticated,
    initialized: state.initialized 
  }),
}
));