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

  fetchClubs: async () => {
    const state = get();
    
    console.log('ClubStore.fetchClubs called - will get ALL clubs');
    
    // Check cache - if data is less than 5 minutes old, don't fetch
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    if (state.lastFetched && (Date.now() - state.lastFetched) < CACHE_DURATION && state.clubs.length > 0) {
      console.log('ClubStore.fetchClubs: Using cached data');
      return;
    }
    
    if (state.isLoading) {
      console.log('ClubStore.fetchClubs: Already loading');
      return; // Prevent multiple simultaneous calls
    }
    
    set({ isLoading: true, error: null });
    try {
      console.log('ClubStore.fetchClubs: Making API call to /api/clubs');
      const response = await fetch('/api/clubs');
      const result = await response.json();
      
      console.log('ClubStore.fetchClubs: API response:', result);
      
      if (result.success) {
        set({ clubs: result.data, isLoading: false, lastFetched: Date.now() });
        console.log('ClubStore.fetchClubs: Successfully updated clubs:', result.data);
      } else {
        set({ error: result.error, isLoading: false });
        console.error('ClubStore.fetchClubs: API error:', result.error);
      }
    } catch (error) {
      console.error('ClubStore.fetchClubs: Network error:', error);
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

  clearCache: () => set({ clubs: [], lastFetched: null }),
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