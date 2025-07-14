import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Club } from '@/types';

interface ClubStore {
  clubs: Club[];
  currentClub: Club | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null; // Add timestamp for cache
  
  // Actions
  setClubs: (clubs: Club[]) => void;
  setCurrentClub: (club: Club | null) => void;
  addClub: (club: Club) => void;
  updateClub: (id: string, updates: Partial<Club>) => void;
  deleteClub: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchClubs: () => Promise<void>;
  fetchClubById: (id: string) => Promise<void>;
  clearCache: () => void;
}

export const useClubStore = create<ClubStore>()(
  persist(
    (set, get) => ({
      clubs: [],
      currentClub: null,
      isLoading: false,
      error: null,
      lastFetched: null,

      setClubs: (clubs) => set({ clubs, lastFetched: Date.now() }),
      setCurrentClub: (club) => set({ currentClub: club }),
  
  addClub: (club) => set((state) => ({ 
    clubs: [...state.clubs, club] 
  })),
  
  updateClub: (id, updates) => set((state) => ({
    clubs: state.clubs.map(club => 
      club.id === id ? { ...club, ...updates } : club
    ),
    currentClub: state.currentClub?.id === id 
      ? { ...state.currentClub, ...updates }
      : state.currentClub
  })),
  
  deleteClub: (id) => set((state) => ({
    clubs: state.clubs.filter(club => club.id !== id),
    currentClub: state.currentClub?.id === id ? null : state.currentClub
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

// src/store/clubStore.ts - fetchClubs fonksiyonuna auth header ekle
fetchClubs: async () => {
  const state = get();
  
  console.log('🏢 ClubStore.fetchClubs called');
  
  // ... cache logic aynı ...
  
  set({ isLoading: true, error: null });
  try {
    console.log('🏢 Making API call to /api/clubs');
    
    // ✅ Auth token'ı ekle
    const token = localStorage.getItem('token');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch('/api/clubs', { headers });
    const result = await response.json();
    
    console.log('🏢 API response:', { 
      success: result.success, 
      dataLength: result.data?.length,
      error: result.error 
    });
    
    if (result.success) {
      set({ clubs: result.data, isLoading: false, lastFetched: Date.now() });
      console.log('✅ Clubs updated successfully:', result.data?.length, 'clubs');
    } else {
      set({ error: result.error, isLoading: false });
      console.error('❌ Clubs API error:', result.error);
    }
  } catch (error) {
    console.error('💥 Clubs network error:', error);
    set({ error: 'Kulüpler yüklenemedi', isLoading: false });
  }
},

  fetchClubById: async (id: string) => {
    const state = get();
    if (state.isLoading) return; // Prevent multiple simultaneous calls
    
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/clubs/${id}`);
      const result = await response.json();
      
      if (result.success) {
        set({ currentClub: result.data, isLoading: false });
      } else {
        set({ error: result.error, isLoading: false });
      }
    } catch (error) {
      set({ error: 'Kulüp bilgileri yüklenemedi', isLoading: false });
    }
  },

  clearCache: () => set({ 
  clubs: [], 
  currentClub: null,
  lastFetched: null,
  error: null 
}),
}),
{
  name: 'club-storage',
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({ 
    clubs: state.clubs,
    lastFetched: state.lastFetched
  }),
}
));