// Auth Store - Zustand ile state management

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserResponse } from '@/types';
import { authService } from '../services/auth.service';

interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setToken: (token: string) => void;
  setUser: (user: UserResponse) => void;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setToken: (token: string) => {
        set({ token });
      },

      setUser: (user: UserResponse) => {
        set({ user, isAuthenticated: true });
      },

      login: async (token: string) => {
        set({ isLoading: true, error: null });

        try {
          // Token'ı kaydet
          set({ token });

          // Kullanıcı bilgilerini çek
          const user = await authService.getCurrentUser(token);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Giriş başarısız',
            isLoading: false,
            token: null,
            user: null,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });

        // localStorage'ı temizle
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
        }
      },

      refreshUser: async () => {
        const { token } = get();

        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });

        try {
          const user = await authService.getCurrentUser(token);
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          // Token geçersiz, logout yap
          get().logout();
          set({
            error: 'Oturum süresi doldu',
            isLoading: false,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      // Sadece token ve user'ı persist et
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
