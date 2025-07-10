import { create } from 'zustand';
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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  initialized: false,

  setUser: (user) => {
  console.log('AuthStore: Setting user', user);
  set({ user, isAuthenticated: !!user, error: null });
},
 setLoading: (loading) => {
  console.log('AuthStore: Setting loading', loading);
  set({ isLoading: loading });
},
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
        set({ 
          user: result.data.user, 
          isAuthenticated: true,
          isLoading: false 
        });
        localStorage.setItem('token', result.data.token);
      } else {
        set({ error: result.error, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Giriş yapılırken hata oluştu', isLoading: false });
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false, error: null, isLoading: false });
    localStorage.removeItem('token');
    // Router kullanarak güvenli yönlendirme
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    }
  },
}));